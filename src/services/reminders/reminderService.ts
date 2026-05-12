import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { NotificationService } from '../notificationService';
import { COLLECTIONS } from '../../constants/collections';
import type { Booking } from '../../types';
import { parse, isAfter, isBefore, addHours } from 'date-fns';

/**
 * REMINDER SERVICE
 * Logic for scheduling and triggering appointment reminders.
 * Designed to be called by a CRON job (e.g. Firebase Functions or n8n).
 */
export const ReminderService = {
  /**
   * Scans for upcoming bookings within the next N hours and triggers reminders.
   * This is a batch process architecture.
   */
  processUpcomingReminders: async (hoursAhead: number = 24) => {
    console.log(`Checking for upcoming reminders within ${hoursAhead} hours...`);
    
    try {
      const now = new Date();
      const futureLimit = addHours(now, hoursAhead);

      // In a real production app, we'd query by timestamp. 
      // Since we store date/time as strings for simplicity in this MVP, 
      // we'll fetch today's bookings and filter in-memory.
      const todayStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
      
      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('bookingDate', '==', todayStr),
        where('bookingStatus', '==', 'confirmed')
      );

      const snapshot = await getDocs(q);
      let triggeredCount = 0;

      for (const doc of snapshot.docs) {
        const booking = { ...doc.data(), bookingId: doc.id } as Booking;
        
        try {
          const bookingDateTime = parse(
            `${booking.bookingDate} ${booking.bookingTime}`, 
            'dd/MM/yyyy hh:mm a', 
            new Date()
          );

          // Trigger if booking is between now and futureLimit
          if (isAfter(bookingDateTime, now) && isBefore(bookingDateTime, futureLimit)) {
            // Check if reminder was already sent (using notificationLogs)
            // For MVP, we'll just trigger it. In production, add a 'reminderSent' flag to booking.
            await NotificationService.sendAppointmentReminder(booking);
            triggeredCount++;
          }
        } catch (e) {
          console.error(`Failed to process reminder for booking ${booking.bookingId}`, e);
        }
      }

      return triggeredCount;
    } catch (error) {
      console.error("ReminderService.processUpcomingReminders failed:", error);
      return 0;
    }
  },

  /**
   * Specifically triggers a 1-hour "heading out now?" reminder.
   */
  triggerImmediateReminder: async (booking: Booking) => {
    return await NotificationService.sendAppointmentReminder(booking);
  }
};
