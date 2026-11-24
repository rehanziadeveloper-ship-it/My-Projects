const CHAT_WEBHOOK = import.meta.env.VITE_N8N_CHAT_WEBHOOK || 'https://n8n.srv1767318.hstgr.cloud/webhook/deewan-chat';
const WAITER_WEBHOOK = import.meta.env.VITE_N8N_WAITER_WEBHOOK || 'https://n8n.srv1767318.hstgr.cloud/webhook/deewan-waiter-call';
const KITCHEN_WEBHOOK = import.meta.env.VITE_N8N_KITCHEN_WEBHOOK || 'https://n8n.srv1767318.hstgr.cloud/webhook/deewan-kitchen-status';

export async function sendChatMessage({ message, button_payload, table_no, sessionState }) {
  try {
    const response = await fetch(CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        button_payload,
        table_no,
        sessionState
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to communicate with n8n chatbot webhook:', error);
    throw error;
  }
}

export async function triggerWaiterCall({ table_no, call_type = 'general', notes = '' }) {
  try {
    const response = await fetch(WAITER_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table_no,
        call_type,
        notes
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to trigger waiter call webhook:', error);
    throw error;
  }
}

export async function updateKitchenOrderStatus({ order_id, new_status }) {
  try {
    const response = await fetch(KITCHEN_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id,
        new_status
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update kitchen status:', error);
    throw error;
  }
}
