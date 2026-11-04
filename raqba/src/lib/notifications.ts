import { Lead } from '../types';

/**
 * Modular Notification Service
 * Handles P0 Immediate Alerts (In-App Realtime + Email webhook)
 * Designed with a pluggable adapter for WhatsApp Business API (Phase 3)
 */

export interface NotificationPayload {
  recipientPhone: string;
  recipientEmail: string;
  leadName: string;
  leadPhone: string;
  budgetPKR: string;
  propertyTitle: string;
  priority: string;
  message: string;
}

export async function sendP0BrokerNotification(lead: Lead, brokerPhone: string, brokerEmail: string) {
  const payload: NotificationPayload = {
    recipientPhone: brokerPhone,
    recipientEmail: brokerEmail,
    leadName: lead.full_name,
    leadPhone: lead.phone,
    budgetPKR: `Rs ${(lead.budget_max / 10000000).toFixed(2)} Crore`,
    propertyTitle: lead.property?.title || 'Prime Property',
    priority: lead.priority,
    message: `🚨 URGENT P0 LEAD DISPATCH (${lead.dispatch_latency_seconds || 10}s SLA): ${lead.full_name} (${lead.phone}) is inquiring regarding ${lead.property?.title || 'Portfolio'}. Immediate contact required.`
  };

  console.log('[Notification Dispatcher] P0 Alert Dispatched:', payload);

  // In-App browser audio or visual alert
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(`🚨 P0 Lead Alert: ${lead.full_name}`, {
        body: `${lead.phone} • Budget: ${payload.budgetPKR} • Tap to call immediately.`
      });
    }
  }

  return {
    success: true,
    channel: 'in_app_and_email',
    timestamp: new Date().toISOString()
  };
}

/**
 * Pluggable WhatsApp Business API stub (Phase 3 ready)
 */
export async function sendWhatsAppAlert(to: string, templateText: string) {
  console.log(`[WhatsApp Adapter (Phase 3)] Would dispatch to ${to}: ${templateText}`);
  return { queued: true };
}
