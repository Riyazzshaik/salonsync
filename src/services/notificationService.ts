import { WebhookService } from './automations/webhookService';
import type { Booking, NotificationLog } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * NOTIFICATION SERVICE
 * Abstract layer for multi-channel notifications (WhatsApp, SMS, Email).
 * Includes audit logging and production-ready hooks.
 */
export const NotificationService = {
  /**
   * Logs notification attempt for audit and debugging.
   */
  logNotification: async (log: Omit<NotificationLog, 'id'>) => {
    try {
      await addDoc(collection(db, 'notificationLogs'), {
        ...log,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to log notification:", error);
    }
  },

  /**
   * Triggers a confirmation alert across all configured channels.
   */
  sendBookingConfirmation: async (booking: Booking) => {
    const success = await WebhookService.triggerBookingWebhook({
      event: 'booking_confirmed',
      bookingId: booking.bookingId,
      data: {
        ...booking,
        notification_type: 'confirmation'
      }
    });

    await NotificationService.logNotification({
      recipient: booking.customerId,
      type: 'booking_confirmed',
      channel: 'whatsapp',
      status: success ? 'sent' : 'failed',
      retryCount: 0,
      timestamp: new Date().toISOString(),
      bookingId: booking.bookingId
    });

    return success;
  },

  /**
   * Triggers payment success notification and receipt delivery.
   */
  sendPaymentSuccess: async (booking: Booking) => {
    const success = await WebhookService.triggerBookingWebhook({
      event: 'payment_success',
      bookingId: booking.bookingId,
      data: {
        amount: booking.advanceAmount,
        paymentId: booking.razorpayPaymentId
      }
    });

    await NotificationService.logNotification({
      recipient: booking.customerId,
      type: 'payment_success',
      channel: 'email',
      status: success ? 'sent' : 'failed',
      retryCount: 0,
      timestamp: new Date().toISOString(),
      bookingId: booking.bookingId
    });

    return success;
  },

  /**
   * Triggers a reminder for upcoming appointments.
   */
  sendAppointmentReminder: async (booking: Booking) => {
    const success = await WebhookService.triggerBookingWebhook({
      event: 'booking_reminder',
      bookingId: booking.bookingId
    });

    await NotificationService.logNotification({
      recipient: booking.customerId,
      type: 'appointment_reminder',
      channel: 'whatsapp',
      status: success ? 'sent' : 'failed',
      retryCount: 0,
      timestamp: new Date().toISOString(),
      bookingId: booking.bookingId
    });

    return success;
  },

  /**
   * Alerts the customer when they are marked as No-Show.
   */
  sendNoShowAlert: async (booking: Booking) => {
    const success = await WebhookService.triggerBookingWebhook({
      event: 'booking_no_show',
      bookingId: booking.bookingId
    });

    await NotificationService.logNotification({
      recipient: booking.customerId,
      type: 'no_show_alert',
      channel: 'whatsapp',
      status: success ? 'sent' : 'failed',
      retryCount: 0,
      timestamp: new Date().toISOString(),
      bookingId: booking.bookingId
    });

    return success;
  }
};
