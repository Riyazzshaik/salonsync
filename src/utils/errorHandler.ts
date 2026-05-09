/**
 * Centralized Error Handler
 * Ensures consistent error formatting, logging, and fallback UI triggers.
 * Future integration point for tools like Sentry.
 */
/**
 * CENTRALIZED ERROR HANDLER
 * All Firebase and API errors pass through this layer.
 * Ensures consistent logging in development and silent safety in production.
 * This is a critical architectural pattern for professional production apps.
 */
export const handleError = (context: string, error: unknown): string => {
  let errorMessage = 'An unexpected error occurred.';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Log to console for debugging (removed in production build outputs if configured)
  // Only log to console in development environment
  if (import.meta.env.DEV) {
    console.error(`[ERROR] ${context}:`, errorMessage);
  }

  // Here we could add Sentry tracking: Sentry.captureException(error);
  
  return errorMessage;
};
