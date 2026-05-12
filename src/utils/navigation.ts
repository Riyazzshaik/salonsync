import type { User, Salon } from '../types';

/**
 * Determines the correct destination route for a user based on their role and salon status.
 */
export const getRedirectPath = (user: User, salon: Salon | null): string => {
  if (user.role === 'admin') {
    return '/admin';
  }
  
  if (user.role === 'owner') {
    return salon ? '/owner/dashboard' : '/owner/register-salon';
  }
  
  // Default for customers
  return '/dashboard';
};
