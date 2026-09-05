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
  Server
} from 'lucide-react';
import { 
  getWhatsAppBotStatus, 
  logoutWhatsAppBot, 
  WhatsAppBotStatusResponse 
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
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to reach local WhatsApp server at http://localhost:3001');
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
  }, [isOpen]);

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
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
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

            <span className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
              Port: 3001
            </span>
          </div>

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

          {/* Offline Warning / Start Script Instructions */}
          {botState.status === 'DISCONNECTED' && (
            <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Server className="w-4 h-4" />
                <span>Local WhatsApp Microservice Instructions</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                To start the automated background service on your computer, run this command in your terminal:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-emerald-400 text-xs border border-slate-800 selection:bg-emerald-900">
                cd whatsapp-server && npm start
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
