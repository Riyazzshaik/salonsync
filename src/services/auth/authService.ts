import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { handleError } from '../../utils/errorHandler';
import type { User } from '../../types';

export const AuthService = {
  /**
   * Fetches user profile data from Firestore
   */
  getUserProfile: async (uid: string): Promise<User | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as User;
      }
      return null;
    } catch (error) {
      throw new Error(handleError("AuthService.getUserProfile", error));
    }
  },

  /**
   * Signs the user out securely
   */
  logout: async (): Promise<void> => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      throw new Error(handleError("AuthService.logout", error));
    }
  },

  /**
   * Fetches total count of users (Admin only)
   */
  getUsersCount: async (): Promise<number> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return snapshot.size;
    } catch (error) {
      throw new Error(handleError("AuthService.getUsersCount", error));
    }
  },

  /**
   * Fetches all registered users (Admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }) as User);
    } catch (error) {
      throw new Error(handleError("AuthService.getAllUsers", error));
    }
  }
};
