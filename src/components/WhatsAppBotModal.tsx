import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Wifi, 
  WifiOff, 
  LogOut,
  Zap,
  Server,
  Globe,
  Save,
  Check
} from 'lucide-react';
import { 
  getWhatsAppBotStatus, 
  logoutWhatsAppBot, 
  WhatsAppBotStatusResponse,
  getWhatsAppServerUrl,
  setCustomWhatsAppServerUrl
} from '../services/whatsappBotService';

interface WhatsAppBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppBotModal: React.FC<WhatsAppBotModalProps> = ({ isOpen, onClose }) => {
  const [botState, setBotState] = useState<WhatsAppBotStatusResponse>({
    status: 'DISCONNECTED',
    qrDataUrl: null,
    connectedAs: null,
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server URL Edit mode state
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getWhatsAppServerUrl());
  const [saveUrlSuccess, setSaveUrlSuccess] = useState(false);

  // Poll status every 3 seconds while modal is open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await getWhatsAppBotStatus();
        if (isMounted) {
          setBotState(res);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to reach WhatsApp Bot service at: ${getWhatsAppServerUrl()}`);
          setLoading(false);
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, serverUrlInput]);

  const handleSaveServerUrl = () => {
    setCustomWhatsAppServerUrl(serverUrlInput);
    setSaveUrlSuccess(true);
    setIsEditingUrl(false);
    setTimeout(() => setSaveUrlSuccess(false), 3000);
    // Trigger immediate re-check
    getWhatsAppBotStatus().then(setBotState);
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to disconnect this WhatsApp session? You will need to scan QR code again.')) return;
    setActionLoading(true);
    try {
      await logoutWhatsAppBot();
      const updated = await getWhatsAppBotStatus();
      setBotState(updated);
    } catch (err: any) {
      setError(err.message || 'Logout failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                Automated WhatsApp Bot Manager
              </h3>
              <p className="text-xs text-slate-300">
                Self-Hosted Web Automation (0-Click Silent Background Dispatch)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Connection Status Badge */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {botState.status === 'CONNECTED' ? (
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                ) : botState.status === 'QR_READY' ? (
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                )}

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Service Connection Status
                  </span>
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    {botState.status === 'CONNECTED' && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Connected ({botState.connectedAs || 'School WhatsApp Phone'})
                      </span>
                    )}
                    {botState.status === 'QR_READY' && (
                      <span className="text-amber-700 font-bold">Action Required: Scan QR Code</span>
                    )}
                    {botState.status === 'INITIALIZING' && (
                      <span className="text-blue-700 font-bold">Initializing WhatsApp Service...</span>
                    )}
                    {botState.status === 'DISCONNECTED' && (
                      <span className="text-rose-700 font-bold">Server Offline or Disconnected</span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isEditingUrl ? 'Cancel Edit' : 'Bot URL Config'}</span>
              </button>
            </div>

            {/* Active Server URL display */}
            <div className="text-[11px] text-slate-500 font-mono truncate pt-1 border-t border-slate-200/60 flex items-center justify-between">
              <span>Active Endpoint: <strong className="text-slate-800">{getWhatsAppServerUrl()}</strong></span>
              {saveUrlSuccess && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>
          </div>

          {/* Editable Server URL Form */}
          {isEditingUrl && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Bot Microservice Endpoint URL
                </label>
                <p className="text-xs text-amber-800">
                  Enter your Render deployment URL (e.g. <code>https://honey-bees-whatsapp-bot.onrender.com</code>) or local URL (<code>http://localhost:3001</code>).
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://your-whatsapp-bot.onrender.com"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleSaveServerUrl}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Connect</span>
                </button>
              </div>
            </div>
          )}

          {/* QR Code Display (When QR is Ready) */}
          {botState.status === 'QR_READY' && botState.qrDataUrl && (
            <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold">
                <QrCode className="w-4 h-4 text-amber-700" />
                <span>Scan Once with WhatsApp Mobile App</span>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-amber-200 inline-block shadow-sm">
                <img 
                  src={botState.qrDataUrl} 
                  alt="WhatsApp Web QR Code" 
                  className="w-56 h-56 mx-auto object-contain"
                />
              </div>

              <p className="text-xs text-amber-900 max-w-xs mx-auto">
                Open WhatsApp on your phone → Settings / Menu → <strong>Linked Devices</strong> → <strong>Link a Device</strong> and point camera at screen.
              </p>
            </div>
          )}

          {/* Connected Success View */}
          {botState.status === 'CONNECTED' && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Automated Background Messaging is Active!</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your staff portal is linked to <strong>{botState.connectedAs || 'School WhatsApp'}</strong>. Clicking <strong>"Auto-Send WhatsApp Alerts"</strong> will now send all messages automatically in 1 click without opening tabs or requiring manual confirmation.
              </p>
            </div>
          )}

          {/* Offline Warning & Troubleshooting Guide */}
          {botState.status === 'DISCONNECTED' && !isEditingUrl && (
            <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Server className="w-4 h-4" />
                  <span>How to Connect Your Bot Server</span>
                </div>
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Configure URL →
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>
                  <strong>If running on your local computer:</strong> Make sure you started the backend server in a separate terminal:
                </p>
                <div className="p-2 bg-slate-950 rounded-lg font-mono text-emerald-400 text-[11px] border border-slate-800">
                  cd whatsapp-server && npm start
                </div>

                <p className="pt-1">
                  <strong>If deployed to Render / Cloud:</strong> Click <strong>Bot URL Config</strong> above and paste your Render URL (e.g. <code>https://your-bot-service.onrender.com</code>).
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {botState.status === 'CONNECTED' ? (
            <button
              onClick={handleLogout}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Unlink WhatsApp Session</span>
            </button>
          ) : (
            <span className="text-xs text-slate-600">Auto-polling status...</span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
