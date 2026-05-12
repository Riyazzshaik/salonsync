import { AppConfig } from '../../config/appConfig';
import { handleError } from '../../utils/errorHandler';

/**
 * WEBHOOK SERVICE (N8N READY)
 * Modular architecture for triggering external automation workflows.
 */

export type WebhookEvent = 
  | 'booking_created' 
  | 'booking_booked'
  | 'booking_confirmed'
  | 'booking_cancelled' 
  | 'booking_checked_in' 
  | 'booking_completed' 
  | 'booking_no_show'
  | 'booking_reminder'
  | 'whatsapp_reminder'
  | 'queue_alert_next'
  | 'payment_success'
  | 'user_notification';

interface WebhookPayload {
  event: WebhookEvent;
  bookingId?: string;
  salonId?: string;
  customerId?: string;
  timestamp: string;
  data?: any;
}

export const WebhookService = {
  /**
   * Universal trigger for all N8N workflows.
   * Maps events to specific webhook URLs defined in environment.
   */
  trigger: async (event: WebhookEvent, data: any): Promise<boolean> => {
    if (!AppConfig.ENABLE_N8N_WEBHOOKS) return true; // Default to true if disabled
    
    // Choose appropriate webhook URL based on event category
    let url = import.meta.env.VITE_N8N_WEBHOOK_URL; // Generic fallback
    
    if (event.startsWith('booking_')) {
      url = import.meta.env.VITE_N8N_WEBHOOK_BOOKING || url;
    } else if (event.startsWith('queue_')) {
      url = import.meta.env.VITE_N8N_WEBHOOK_QUEUE || url;
    }

    if (!url || url === 'YOUR_N8N_WEBHOOK_URL') {
      console.warn(`WebhookService: No URL configured for event [${event}]. Skipping.`);
      return false;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    try {
      console.log(`Triggering Webhook [${event}]...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      return response.ok;
    } catch (error) {
      handleError("WebhookService.trigger", error);
      return false;
    }
  },

  /**
   * Shorthand for booking-related triggers.
   */
  triggerBookingWebhook: async (payload: { event: WebhookEvent; bookingId: string; data?: any }): Promise<boolean> => {
    return await WebhookService.trigger(payload.event, { 
      bookingId: payload.bookingId, 
      ...payload.data 
    });
  }
};
