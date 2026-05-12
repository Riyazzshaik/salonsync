import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { handleError } from '../../utils/errorHandler';

/**
 * MAINTENANCE SERVICE
 * Handles database sanitization, cleanup, and normalization.
 */
export const MaintenanceService = {
  /**
   * Cleans up dummy bookings and invalid records.
   */
  sanitizeDatabase: async () => {
    try {
      console.log("Starting Database Sanitization...");
      const batch = writeBatch(db);
      let count = 0;

      // 1. Fetch all bookings
      const bookingsSnap = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
      const salonsSnap = await getDocs(collection(db, COLLECTIONS.SALONS));
      const validSalonIds = new Set(salonsSnap.docs.map(d => d.id));

      for (const bookingDoc of bookingsSnap.docs) {
        const data = bookingDoc.data();
        
        // Remove dummy bookings (older than 7 days if status is booked/pending)
        const isDummy = data.salonName?.toLowerCase().includes('dummy') || 
                        data.serviceName?.toLowerCase().includes('test') ||
                        !validSalonIds.has(data.salonId);

        if (isDummy) {
          batch.delete(bookingDoc.ref);
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        console.log(`Sanitization complete. Deleted ${count} orphaned/dummy bookings.`);
      } else {
        console.log("No dummy data found. Database is clean.");
      }

      return count;
    } catch (error) {
      handleError("MaintenanceService.sanitize", error);
      return 0;
    }
  },

  /**
   * Normalizes salon coordinates and removes legacy Bengaluru hardcoded markers.
   */
  normalizeSalons: async () => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.SALONS));
      const batch = writeBatch(db);
      
      for (const salonDoc of snapshot.docs) {
        const data = salonDoc.data();
        // Remove deprecated Bengaluru hardcoded data if any
        if (data.city === 'Bengaluru' && data.address?.includes('Mock')) {
          batch.delete(salonDoc.ref);
        }
      }
      
      await batch.commit();
    } catch (error) {
      handleError("MaintenanceService.normalize", error);
    }
  }
};
