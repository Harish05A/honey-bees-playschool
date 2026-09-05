/**
 * Frontend Service to interact with the self-hosted WhatsApp Automation Node Service
 * Base URL: http://localhost:3001
 */

const WHATSAPP_SERVER_URL = import.meta.env.VITE_WHATSAPP_SERVER_URL || 'http://localhost:3001';

export interface WhatsAppBotStatusResponse {
  status: 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED';
  qrDataUrl: string | null;
  connectedAs: string | null;
  timestamp: string;
}

export interface BulkSendItem {
  phone: string;
  message: string;
  studentName?: string;
}

export interface BulkSendResponse {
  success: boolean;
  total: number;
  sentCount: number;
  failedCount: number;
  results: Array<{
    phone: string;
    studentName?: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Check health & QR status of local WhatsApp automation bot server
 */
export const getWhatsAppBotStatus = async (): Promise<WhatsAppBotStatusResponse> => {
  try {
    const res = await fetch(`${WHATSAPP_SERVER_URL}/api/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      status: 'DISCONNECTED',
      qrDataUrl: null,
      connectedAs: null,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Send 1-click silent background automated WhatsApp message to a single number
 */
export const sendAutomatedWhatsAppMessage = async (phone: string, message: string) => {
  const res = await fetch(`${WHATSAPP_SERVER_URL}/api/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to send automated message.');
  }

  return data;
};

/**
 * Send 1-click silent background automated WhatsApp messages to multiple parents sequentially
 */
export const sendBulkAutomatedWhatsApp = async (items: BulkSendItem[]): Promise<BulkSendResponse> => {
  const res = await fetch(`${WHATSAPP_SERVER_URL}/api/send-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to send bulk automated messages.');
  }

  return data;
};

/**
 * Logout & disconnect session
 */
export const logoutWhatsAppBot = async () => {
  const res = await fetch(`${WHATSAPP_SERVER_URL}/api/logout`, {
    method: 'POST'
  });
  return await res.json();
};
