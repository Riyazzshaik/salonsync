import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { AppConfig } from '../../config/appConfig';
import { handleError } from '../../utils/errorHandler';

/**
 * REVIEW SERVICE
 * Handles salon feedback and rating data.
 */
export const ReviewService = {
  /**
   * Fetches reviews for a specific salon
   */
  getSalonReviews: async (salonId: string) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('salonId', '==', salonId),
        orderBy('createdAt', 'desc'),
        limit(AppConfig.MAX_REVIEWS_FETCH_LIMIT)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), reviewId: doc.id }));
    } catch (error) {
      throw new Error(handleError("ReviewService.getSalonReviews", error), { cause: error });
    }
  }
};
