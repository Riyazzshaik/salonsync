/**
 * Centralized Firestore Collections Registry
 * Using this prevents typos and makes future migrations extremely easy.
 */
export const COLLECTIONS = {
  USERS: 'users',
  SALONS: 'salons',
  BOOKINGS: 'bookings',
  QUEUES: 'queues',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  FAVORITES: 'favorites',
  OWNER_REQUESTS: 'ownerRequests',
  ADMIN_LOGS: 'adminLogs',
} as const;
