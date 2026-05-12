import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { handleError } from '../../utils/errorHandler';

/**
 * USER SERVICE
 * Handles profile updates and reliability scoring.
 */
export const UserService = {
  /**
   * Adjusts the customer's reliability score.
   */
  updateReliabilityScore: async (userId: string, adjustment: number) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      
      // Ensure score stays between 0 and 100
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentScore = userSnap.data().bookingReliabilityScore || 100;
        let newScore = currentScore + adjustment;
        newScore = Math.max(0, Math.min(100, newScore));
        
        await updateDoc(userRef, { bookingReliabilityScore: newScore });
      }
    } catch (error) {
      handleError("UserService.updateReliabilityScore", error);
    }
  }
};
