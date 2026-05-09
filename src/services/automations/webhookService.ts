import { AppConfig } from '../../config/appConfig';
import { handleError } from '../../utils/errorHandler';

/**
 * Webhook Service for N8N Automation Integrations
 * Triggers external workflows for WhatsApp, Email, and SMS notifications.
 */

interface WebhookPayload {
  [key: string]: any;
}

export const WebhookService = {
  /**
   * Pings N8N when a booking is created or status changes.
   */
  triggerBookingWebhook: async (payload: WebhookPayload): Promise<void> => {
    if (!AppConfig.ENABLE_N8N_WEBHOOKS) return;
    
    const url = import.meta.env.VITE_N8N_WEBHOOK_BOOKING;
    if (!url) {
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      handleError("WebhookService.triggerBookingWebhook", error);
    }
  },

  /**
   * Pings N8N when a queue alert needs to be sent (e.g. "Your turn is next!").
   */
  triggerQueueWebhook: async (payload: WebhookPayload): Promise<void> => {
    if (!AppConfig.ENABLE_N8N_WEBHOOKS) return;

    const url = import.meta.env.VITE_N8N_WEBHOOK_QUEUE;
    if (!url) {
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      handleError("WebhookService.triggerQueueWebhook", error);
    }
  }
};
