import { isBefore, addMinutes, parse } from 'date-fns';
import type { Booking, Salon } from '../../types';
import { BookingService } from './bookingService';
import { UserService } from '../auth/userService';

/**
 * NO-SHOW SERVICE
 * Logic to identify and process bookings where customers didn't arrive.
 */
export const NoShowService = {
  /**
   * Checks for expired bookings and marks them as no-show.
   * Typically called by owners when managing their queue.
   */
  processNoShows: async (bookings: Booking[], salon: Salon) => {
    const gracePeriod = salon.gracePeriod || 15; // Default 15 mins
    const now = new Date();

    const expiredBookings = bookings.filter(booking => {
      if (booking.bookingStatus !== 'confirmed' && booking.bookingStatus !== 'pending_payment') return false;
      
      try {
        // Parse "DD/MM/YYYY" and "hh:mm a"
        const bookingDateTime = parse(
          `${booking.bookingDate} ${booking.bookingTime}`, 
          'dd/MM/yyyy hh:mm a', 
          new Date()
        );
        const expiryTime = addMinutes(bookingDateTime, gracePeriod);
        return isBefore(expiryTime, now);
      } catch (error) {
        return false;
      }
    });

    for (const booking of expiredBookings) {
      console.log(`Auto-marking booking ${booking.bookingId} as no-show after grace period`);
      await BookingService.updateBookingStatus(booking.bookingId, 'no_show');
      
      // Reduce reliability score of customer significantly for no-show
      await UserService.updateReliabilityScore(booking.customerId, -15);
    }

    return expiredBookings.length;
  }
};
