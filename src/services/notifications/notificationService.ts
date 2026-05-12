import { addDoc, collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../constants/collections';
import { WebhookService } from '../automations/webhookService';
import type { AppNotification } from '../../types';
import { handleError } from '../../utils/errorHandler';

/**
 * NOTIFICATION SERVICE
 * Manages in-app notifications and triggers external automation webhooks.
 */
export const NotificationService = {
  /**
   * Sends a notification to a specific user.
   */
  sendNotification: async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    try {
      const notificationData = {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString()
      };

      // 1. Store in Firestore for in-app UI
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notificationData);

      // 2. Trigger external webhooks for SMS/Email/WhatsApp via N8N
      await WebhookService.trigger('user_notification', notificationData);
    } catch (error) {
      handleError("NotificationService.sendNotification", error);
    }
  },

  /**
   * Listens for real-time notifications for a user.
   */
  subscribeToNotifications: (userId: string, onUpdate: (notifications: AppNotification[]) => void) => {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      onUpdate(notifications);
    }, (error) => {
      handleError("NotificationService.subscribe", error);
    });
  },

  /**
   * Marks a notification as read.
   */
  markAsRead: async (notificationId: string) => {
    try {
      const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      handleError("NotificationService.markAsRead", error);
    }
  }
};
