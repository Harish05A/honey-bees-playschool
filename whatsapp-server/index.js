import express from 'express';
import cors from 'cors';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Service State
let clientStatus = 'DISCONNECTED'; // 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED'
let qrCodeDataUrl = null;
let clientInfo = null;

// Initialize WhatsApp Client with LocalAuth session persistence
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// Event: QR Code Received
client.on('qr', async (qr) => {
  console.log('\n[WhatsApp Server] New QR code generated. Scan with WhatsApp linked devices:');
  qrcodeTerminal.generate(qr, { small: true });
  
  try {
    qrCodeDataUrl = await qrcode.toDataURL(qr);
    clientStatus = 'QR_READY';
  } catch (err) {
    console.error('[WhatsApp Server] Failed to convert QR code to Data URL:', err);
  }
});

// Event: Authenticated
client.on('authenticated', () => {
  console.log('[WhatsApp Server] Client authenticated successfully!');
  clientStatus = 'INITIALIZING';
  qrCodeDataUrl = null;
});

// Event: Ready
client.on('ready', () => {
  clientStatus = 'CONNECTED';
  qrCodeDataUrl = null;
  clientInfo = client.info;
  console.log(`[WhatsApp Server] Client is READY! Connected as: ${client.info?.pushname || client.info?.wid?.user}`);
});

// Event: Authentication Failure
client.on('auth_failure', (msg) => {
  console.error('[WhatsApp Server] Authentication failure:', msg);
  clientStatus = 'DISCONNECTED';
  qrCodeDataUrl = null;
});

// Event: Disconnected
client.on('disconnected', (reason) => {
  console.log('[WhatsApp Server] Client disconnected. Reason:', reason);
  clientStatus = 'DISCONNECTED';
  qrCodeDataUrl = null;
  clientInfo = null;
  client.initialize();
});

// Initialize client on startup
clientStatus = 'INITIALIZING';
client.initialize().catch((err) => {
  console.error('[WhatsApp Server] Client initialization error:', err);
  clientStatus = 'DISCONNECTED';
});

// API Routes

// 1. Get Status and Live QR Code
app.get('/api/status', (req, res) => {
  res.json({
    status: clientStatus,
    qrDataUrl: qrCodeDataUrl,
    connectedAs: clientInfo ? (clientInfo.pushname || clientInfo.wid?.user) : null,
    timestamp: new Date().toISOString()
  });
});

// Helper to sanitize & format phone number to international WhatsApp format (e.g. 919876543210@c.us)
const formatPhoneJid = (phoneStr) => {
  if (!phoneStr) return null;
  const digits = phoneStr.replace(/[^0-9]/g, '');
  if (!digits) return null;
  
  // Standard India 10-digit number -> prepend 91
  const cleanPhone = digits.length === 10 ? `91${digits}` : digits;
  return `${cleanPhone}@c.us`;
};

// 2. Send Single Message
app.post('/api/send-message', async (req, res) => {
  if (clientStatus !== 'CONNECTED') {
    return res.status(400).json({ 
      success: false, 
      error: 'WhatsApp Bot is not connected. Please scan the QR code first.' 
    });
  }

  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'Phone and message parameters are required.' });
  }

  const jid = formatPhoneJid(phone);
  if (!jid) {
    return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
  }

  try {
    const isRegistered = await client.isRegisteredUser(jid);
    if (!isRegistered) {
      return res.status(404).json({ success: false, error: `Phone number ${phone} is not registered on WhatsApp.` });
    }

    const response = await client.sendMessage(jid, message);
    res.json({
      success: true,
      messageId: response.id?.id,
      recipient: phone,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`[WhatsApp Server] Failed to send message to ${phone}:`, err);
    res.status(500).json({ success: false, error: err.message || 'Failed to send WhatsApp message.' });
  }
});

// 3. Send Bulk Messages (Automated Loop with Rate Limiting Delay)
app.post('/api/send-bulk', async (req, res) => {
  if (clientStatus !== 'CONNECTED') {
    return res.status(400).json({ 
      success: false, 
      error: 'WhatsApp Bot is not connected. Please scan the QR code in Staff Portal first.' 
    });
  }

  const { items } = req.body; // Array of { phone, message, studentName }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Items array is required and must not be empty.' });
  }

  console.log(`[WhatsApp Server] Received bulk send task for ${items.length} recipients...`);

  const results = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const jid = formatPhoneJid(item.phone);

    if (!jid) {
      results.push({ phone: item.phone, studentName: item.studentName, success: false, error: 'Invalid phone format' });
      continue;
    }

    try {
      const isRegistered = await client.isRegisteredUser(jid);
      if (!isRegistered) {
        results.push({ phone: item.phone, studentName: item.studentName, success: false, error: 'Not on WhatsApp' });
        continue;
      }

      await client.sendMessage(jid, item.message);
      results.push({ phone: item.phone, studentName: item.studentName, success: true });
      console.log(`[WhatsApp Server] [${i+1}/${items.length}] Sent to ${item.studentName || item.phone}`);

      // Safe 2-second rate-limiting delay between messages to prevent spam detection
      if (i < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error(`[WhatsApp Server] Error sending to ${item.phone}:`, err);
      results.push({ phone: item.phone, studentName: item.studentName, success: false, error: err.message });
    }
  }

  const successCount = results.filter(r => r.success).length;
  res.json({
    success: true,
    total: items.length,
    sentCount: successCount,
    failedCount: items.length - successCount,
    results
  });
});

// 4. Logout / Disconnect Session
app.post('/api/logout', async (req, res) => {
  try {
    await client.logout();
    clientStatus = 'DISCONNECTED';
    qrCodeDataUrl = null;
    clientInfo = null;
    res.json({ success: true, message: 'Logged out successfully. Re-initializing QR code...' });
    client.initialize();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🐝 Honey Bees Automated WhatsApp Service Running`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`Status API:  http://localhost:${PORT}/api/status`);
  console.log(`======================================================\n`);
});
