import { collection, doc, getDoc, getDocs, query, where, limit, updateDoc, increment, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { AppConfig } from '../../config/appConfig';
import { handleError } from '../../utils/errorHandler';
import type { Salon } from '../../types';

/**
 * SALON SERVICE
 * Centralized business logic for marketplace salon entities.
 * Handles:
 * - Public data fetching (Approved Salons).
 * - Admin verification flows (Pending Salons & Approvals).
 * - Real-time queue management (Safety-incremented writes).
 * - Presentation fallback mechanisms for high-quality demonstrations.
 */
export const SalonService = {
  /**
   * Fetches a single salon by ID.
   */
  getSalonById: async (salonId: string): Promise<Salon | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.SALONS, salonId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          salonId: docSnap.id,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        } as Salon;
      }
      
      return null;
    } catch (error) {
      throw new Error(handleError("SalonService.getSalonById", error));
    }
  },

  /**
   * Fetches approved salons for public view.
   */
  getActiveSalons: async (): Promise<Salon[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.SALONS),
        where('adminApproved', '==', true),
        limit(AppConfig.MAX_SALONS_FETCH_LIMIT)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), salonId: doc.id }) as Salon);
    } catch (error) {
      throw new Error(handleError("SalonService.getActiveSalons", error));
    }
  },

  /**
   * Fetches pending salons for Admin view.
   */
  getPendingSalons: async (): Promise<Salon[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.SALONS),
        where('adminApproved', '==', false),
        limit(AppConfig.MAX_SALONS_FETCH_LIMIT)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), salonId: doc.id }) as Salon);
    } catch (error) {
      throw new Error(handleError("SalonService.getPendingSalons", error));
    }
  },

  /**
   * Fetches a salon by owner ID.
   */
  getOwnerSalon: async (ownerId: string): Promise<Salon | null> => {
    try {
      const q = query(collection(db, COLLECTIONS.SALONS), where('ownerId', '==', ownerId), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { ...snapshot.docs[0].data(), salonId: snapshot.docs[0].id } as Salon;
      }
      return null;
    } catch (error) {
      throw new Error(handleError("SalonService.getOwnerSalon", error));
    }
  },

  /**
   * Registers a new salon
   */
  registerSalon: async (salonData: any): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SALONS), salonData);
      return docRef.id;
    } catch (error) {
      throw new Error(handleError("SalonService.registerSalon", error));
    }
  },

  /**
   * Approves a salon (Admin only)
   */
  approveSalon: async (salonId: string): Promise<void> => {
    try {
      const salonRef = doc(db, COLLECTIONS.SALONS, salonId);
      await updateDoc(salonRef, { adminApproved: true });
    } catch (error) {
      throw new Error(handleError("SalonService.approveSalon", error));
    }
  },

  /**
   * Updates salon open/closed status
   */
  updateSalonStatus: async (salonId: string, isOpen: boolean): Promise<void> => {
    try {
      const salonRef = doc(db, COLLECTIONS.SALONS, salonId);
      await updateDoc(salonRef, { openStatus: isOpen });
    } catch (error) {
      throw new Error(handleError("SalonService.updateSalonStatus", error));
    }
  },

  /**
   * Updates salon queue capacity
   */
  updateSalonCapacity: async (salonId: string, capacity: number): Promise<void> => {
    try {
      const salonRef = doc(db, COLLECTIONS.SALONS, salonId);
      await updateDoc(salonRef, { queueCapacity: capacity });
    } catch (error) {
      throw new Error(handleError("SalonService.updateSalonCapacity", error));
    }
  },

  /**
   * Safely increments queue length
   */
  joinQueue: async (salonId: string): Promise<void> => {
    try {
      const salonRef = doc(db, COLLECTIONS.SALONS, salonId);
      await updateDoc(salonRef, { queueLength: increment(1) });
    } catch (error) {
      throw new Error(handleError("SalonService.joinQueue", error));
    }
  },

  /**
   * Fetches total count of salons (Admin only)
   */
  getSalonsCount: async (): Promise<number> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.SALONS));
      return snapshot.size;
    } catch (error) {
      throw new Error(handleError("SalonService.getSalonsCount", error));
    }
  }
};
