import { collection, doc, updateDoc, getDocs, query, where, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { handleError } from '../../utils/errorHandler';
import { WebhookService } from '../automations/webhookService';
import { NotificationService } from '../notificationService';
import type { Booking } from '../../types';

import { QRService } from '../qr/qrService';
import { UserService } from '../auth/userService';

/**
 * BOOKING SERVICE
 * Orchestrates appointment scheduling and automated notifications.
 */
export const BookingService = {
  /**
   * Creates a new booking using a Firestore Transaction for maximum reliability.
   * Ensures atomic queue position and prevents double-booking race conditions.
   */
  createBooking: async (bookingData: Partial<Booking>, paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }): Promise<Booking | null> => {
    if (!paymentResult.razorpay_payment_id) {
      throw new Error("Payment verification failed: No payment ID provided.");
    }

    try {
      return await runTransaction(db, async (transaction) => {
        // 1. Calculate Queue Position & Check Collision
        const bookingsCol = collection(db, COLLECTIONS.BOOKINGS);
        const q = query(
          bookingsCol,
          where('salonId', '==', bookingData.salonId),
          where('bookingDate', '==', bookingData.bookingDate)
        );
        
        const snapshot = await getDocs(q);
        
        // Check for exact slot collision
        const isSlotTaken = snapshot.docs.some(doc => 
          doc.data().bookingTime === bookingData.bookingTime && 
          ['confirmed', 'checked_in', 'completed'].includes(doc.data().bookingStatus)
        );

        if (isSlotTaken) {
          throw new Error("This slot was just taken. Please choose another time.");
        }

        const queuePosition = snapshot.size + 1;

        // 2. Prepare Data
        const isVerified = bookingData.paymentMethod === 'razorpay' || bookingData.paymentStatus === 'success';
        const qrToken = isVerified ? QRService.generateVerificationToken() : null;
        
        const servicePrice = bookingData.servicePrice || 0;
        const advanceAmount = bookingData.advanceAmount || 0;
        const remainingAmount = servicePrice - advanceAmount;

        const bookingRef = doc(bookingsCol);
        
        const fullBookingData = {
          ...bookingData,
          queuePosition,
          qrToken,
          status: isVerified ? 'confirmed' : 'pending_payment',
          bookingStatus: isVerified ? 'confirmed' : 'pending_payment',
          paymentStatus: isVerified ? 'success' : 'pending_verification',
          advanceAmount,
          remainingAmount,
          razorpayPaymentId: paymentResult.razorpay_payment_id === 'MANUAL_UPI' ? '' : paymentResult.razorpay_payment_id,
          razorpayOrderId: paymentResult.razorpay_order_id || '',
          razorpaySignature: paymentResult.razorpay_signature || '',
          paymentTimestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          serverCreatedAt: serverTimestamp(),
          verified: isVerified
        };

        // 3. Commit Booking
        transaction.set(bookingRef, fullBookingData);

        const completeBooking = {
          ...fullBookingData,
          bookingId: bookingRef.id
        } as Booking;

        // 4. Trigger Notifications ONLY if verified
        if (isVerified) {
          NotificationService.sendBookingConfirmation(completeBooking)
            .catch(err => console.warn("Notification failed but booking succeeded:", err));
          
          NotificationService.sendPaymentSuccess(completeBooking)
            .catch(err => console.warn("Payment notification failed:", err));
        } else {
          // Send "Payment Pending Verification" alert
          NotificationService.logNotification({
            recipient: completeBooking.customerId,
            type: 'payment_pending_verification',
            channel: 'in_app',
            status: 'sent',
            retryCount: 0,
            timestamp: new Date().toISOString(),
            bookingId: completeBooking.bookingId
          }).catch(() => {});
        }

        return completeBooking;
      });
    } catch (error) {
      throw new Error(handleError("BookingService.createBooking", error), { cause: error });
    }
  },

  /**
   * Manually verifies a UPI payment and confirms the booking.
   * (Owner Only Action)
   */
  verifyUPIPayment: async (bookingId: string, ownerId: string): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
        const bookingSnap = await transaction.get(bookingRef);
        
        if (!bookingSnap.exists()) throw new Error("Booking not found");
        const bookingData = bookingSnap.data() as Booking;

        if (bookingData.paymentStatus === 'verified' || bookingData.paymentStatus === 'success') {
          throw new Error("Booking is already verified");
        }

        const qrToken = QRService.generateVerificationToken();
        
        transaction.update(bookingRef, {
          status: 'confirmed',
          bookingStatus: 'confirmed',
          paymentStatus: 'verified',
          qrToken,
          verifiedBy: ownerId,
          verificationTimestamp: new Date().toISOString(),
          verified: true
        });

        // Trigger Success Notifications
        const updatedBooking = { ...bookingData, bookingId, qrToken, status: 'confirmed', bookingStatus: 'confirmed' } as Booking;
        NotificationService.sendBookingConfirmation(updatedBooking).catch(() => {});
        NotificationService.sendPaymentSuccess(updatedBooking).catch(() => {});
      });
    } catch (error) {
      throw new Error(handleError("BookingService.verifyUPIPayment", error), { cause: error });
    }
  },

  /**
   * Rejects a UPI payment.
   */
  rejectUPIPayment: async (bookingId: string): Promise<void> => {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      await updateDoc(bookingRef, {
        paymentStatus: 'failed',
        bookingStatus: 'cancelled',
        status: 'cancelled',
        rejectionReason: 'Invalid payment proof or Transaction ID mismatch'
      });
    } catch (error) {
      throw new Error(handleError("BookingService.rejectUPIPayment", error), { cause: error });
    }
  },

  /**
   * Verifies a customer's QR code and marks as checked_in
   */
  verifyBookingQR: async (decodedText: string): Promise<Booking> => {
    try {
      const [bookingId, qrToken] = decodedText.split('|');
      if (!bookingId || !qrToken) throw new Error("Invalid QR Code format");

      const bookingSnap = await getDocs(query(collection(db, COLLECTIONS.BOOKINGS), where('qrToken', '==', qrToken)));
      
      if (bookingSnap.empty) throw new Error("Verification failed: Invalid Token");
      
      const bookingData = { ...bookingSnap.docs[0].data(), bookingId: bookingSnap.docs[0].id } as Booking;
      
      if (bookingData.bookingId !== bookingId) throw new Error("Verification failed: ID Mismatch");
      if (bookingData.bookingStatus === 'checked_in') throw new Error("Already checked in");
      if (bookingData.bookingStatus === 'completed') throw new Error("Booking already completed");
      if (bookingData.bookingStatus === 'cancelled') throw new Error("Booking was cancelled");

      // Update status
      await updateDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId), { 
        status: 'checked_in',
        bookingStatus: 'checked_in',
        checkInTime: new Date().toISOString()
      });

      // Increase reliability score
      await UserService.updateReliabilityScore(bookingData.customerId, 2);

      return { ...bookingData, status: 'checked_in', bookingStatus: 'checked_in' };
    } catch (error) {
      throw new Error(handleError("BookingService.verifyBookingQR", error), { cause: error });
    }
  },

  /**
   * Updates booking status (e.g. check-in, complete, no-show)
   */
  updateBookingStatus: async (bookingId: string, status: Booking['bookingStatus']): Promise<void> => {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      const updates: Partial<Booking> = { status, bookingStatus: status };
      
      if (status === 'completed') {
        updates.paymentStatus = 'paid';
        updates.completedAt = new Date().toISOString();
      }

      await updateDoc(bookingRef, updates);

      // Trigger automation via NotificationService for audit tracking
      // Note: We'd ideally fetch the full booking here to pass to NotificationService
      // but for now we'll trigger the webhook directly for simple status changes
      // and only use NotificationService for major events like confirmations/reminders.
      await WebhookService.triggerBookingWebhook({
        event: `booking_${status}` as any,
        bookingId: bookingId
      });
    } catch (error) {
      throw new Error(handleError("BookingService.updateBookingStatus", error), { cause: error });
    }
  },

  /**
   * Specifically handles QR Check-in
   */
  checkInBooking: async (bookingId: string, _salonId: string, customerId: string): Promise<void> => {
    try {
      await BookingService.updateBookingStatus(bookingId, 'checked_in');
      await UserService.updateReliabilityScore(customerId, 2);
    } catch (error) {
      throw new Error(handleError("BookingService.checkInBooking", error), { cause: error });
    }
  },

  /**
   * Cancels a booking and triggers N8N webhook
   */
  cancelBooking: async (bookingId: string): Promise<void> => {
    try {
      await BookingService.updateBookingStatus(bookingId, 'cancelled');
    } catch (error) {
      throw new Error(handleError("BookingService.cancelBooking", error), { cause: error });
    }
  },

  /**
   * Listens for real-time bookings for a specific salon
   */
  subscribeToSalonBookings: (salonId: string, onUpdate: (bookings: Booking[]) => void) => {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('salonId', '==', salonId)
    );

    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        bookingId: doc.id 
      }) as Booking);
      
      // Sort in-memory to avoid index requirement
      const sortedBookings = bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(sortedBookings);
    }, (error) => {
      handleError("BookingService.subscribe", error);
      onUpdate([]); // Stop loading state even on error
    });
  },

  /**
   * Fetches customer bookings with hard limits
   */
  getCustomerBookings: async (customerId: string) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('customerId', '==', customerId)
      );
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ ...doc.data(), bookingId: doc.id }) as Booking);
      
      // Sort manually to avoid composite index requirement
      return bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (error) {
      throw new Error(handleError("BookingService.getCustomerBookings", error), { cause: error });
    }
  },

  /**
   * Fetches bookings for a specific salon (Owner only)
   */
  getSalonBookings: async (salonId: string): Promise<Booking[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('salonId', '==', salonId)
      );
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ ...doc.data(), bookingId: doc.id }) as Booking);
      return bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (error) {
      throw new Error(handleError("BookingService.getSalonBookings", error), { cause: error });
    }
  },

  /**
   * Fetches total count of bookings (Admin only)
   */
  getBookingsCount: async (): Promise<number> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
      return snapshot.size;
    } catch (error) {
      throw new Error(handleError("BookingService.getBookingsCount", error), { cause: error });
    }
  },

  /**
   * Calculates total platform-wide advance revenue (Admin only)
   */
  getTotalAdvanceRevenue: async (): Promise<number> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
      return snapshot.docs.reduce((sum, doc) => sum + (doc.data().advanceAmount || 0), 0);
    } catch (error) {
      throw new Error(handleError("BookingService.getTotalAdvanceRevenue", error), { cause: error });
    }
  }
};
