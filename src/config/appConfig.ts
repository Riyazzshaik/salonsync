/**
 * Global Application Configuration
 * Centralizes magic numbers, limits, and behavior flags.
 */
/**
 * GLOBAL APPLICATION CONFIGURATION
 * Centralizes all constants, API limits, and feature flags to avoid magic numbers.
 * Essential for maintainability and quick adjustments during production.
 */
export const AppConfig = {
  // Pagination & Queries
  MAX_SALONS_FETCH_LIMIT: 20,
  MAX_BOOKINGS_FETCH_LIMIT: 50,
  MAX_REVIEWS_FETCH_LIMIT: 15,
  
  // Maps & Location Defaults
  MAP_DEFAULT_ZOOM: 14,
  MAP_ROUTE_PADDING: [50, 50] as [number, number],
  
  // Automations & Integrations
  ENABLE_N8N_WEBHOOKS: true, // Feature flag to disable webhooks during local dev if needed
  
  // Timing Configurations
  DEBOUNCE_DELAY_MS: 300,
  GEOLOCATION_TIMEOUT_MS: 5000,
};
