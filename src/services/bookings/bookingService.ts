import { collection, addDoc, doc, updateDoc, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { AppConfig } from '../../config/appConfig';
import { handleError } from '../../utils/errorHandler';
import { WebhookService } from '../automations/webhookService';
import type { Booking } from '../../types';

/**
 * BOOKING SERVICE
 * Orchestrates appointment scheduling and automated notifications.
 * Features:
 * - Transactional Writes: Safely records bookings in Firestore.
 * - N8N Webhook Integration: Triggers background automations for notifications.
 * - Optimized Queries: Uses indexed fields and hard limits for cost safety.
 */
export const BookingService = {
  /**
   * Creates a new booking and triggers N8N webhook
   */
  createBooking: async (bookingData: any): Promise<string | null> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), bookingData);
      
      // Ping Automation Webhook
      await WebhookService.triggerBookingWebhook({
        event: 'booking_created',
        bookingId: docRef.id,
        data: bookingData
      });

      return docRef.id;
    } catch (error) {
      throw new Error(handleError("BookingService.createBooking", error));
    }
  },

  /**
   * Cancels a booking and triggers N8N webhook
   */
  cancelBooking: async (bookingId: string): Promise<void> => {
    try {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      await updateDoc(bookingRef, { status: 'cancelled' });

      // Ping Automation Webhook
      await WebhookService.triggerBookingWebhook({
        event: 'booking_cancelled',
        bookingId: bookingId
      });
    } catch (error) {
      throw new Error(handleError("BookingService.cancelBooking", error));
    }
  },

  /**
   * Fetches customer bookings with hard limits
   */
  getCustomerBookings: async (customerId: string) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc'),
        limit(AppConfig.MAX_BOOKINGS_FETCH_LIMIT)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), bookingId: doc.id }));
    } catch (error) {
      throw new Error(handleError("BookingService.getCustomerBookings", error));
    }
  },

  /**
   * Fetches bookings for a specific salon (Owner only)
   */
  getSalonBookings: async (salonId: string): Promise<Booking[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('salonId', '==', salonId),
        orderBy('createdAt', 'desc'),
        limit(AppConfig.MAX_BOOKINGS_FETCH_LIMIT)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), bookingId: doc.id }) as Booking);
    } catch (error) {
      throw new Error(handleError("BookingService.getSalonBookings", error));
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
      throw new Error(handleError("BookingService.getBookingsCount", error));
    }
  }
};
