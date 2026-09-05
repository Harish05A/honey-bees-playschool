import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Building2, 
  Phone, 
  MapPin, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GeneralSettings } from '../types/settings';
import { getGeneralSettings, saveGeneralSettings } from '../services/settingsService';

export const StaffSettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [settings, setSettings] = useState<GeneralSettings>({
    centerName: 'Honey Bees Tuition Center',
    contactNumber: '8667330368',
    address: '591/4, Pillayar Koil Street, Srinivasa Nagar Main Road, Cholambedu, Thirumullaivoyal, Chennai - 62',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing settings from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGeneralSettings();
        if (isMounted && data) {
          setSettings({
            centerName: data.centerName || 'Honey Bees Tuition Center',
            contactNumber: data.contactNumber || '8667330368',
            address: data.address || '',
          });
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err);
        if (isMounted) {
          setError('Unable to fetch settings from Cloud Firestore.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save Settings handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveGeneralSettings(settings);
      setSuccessMessage('Tuition Center settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Save settings error:', err);
      setError(err.message || 'Failed to save settings to Cloud Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Honey Bees Tuition Center
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Staff Portal Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage authenticated staff profile details and tuition center general settings.
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: AUTHENTICATED STAFF PROFILE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-600" />
          <h2 className="font-display font-bold text-lg text-slate-900">Staff Account Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Authenticated Email
            </span>
            <span className="font-bold text-slate-900 block truncate">
              {user?.email || 'Authorized Staff'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Access Role & Status
            </span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Firebase Authenticated Staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GENERAL TUITION CENTER SETTINGS FORM */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-600" />
          <h2 className="font-display font-bold text-lg text-slate-900">Tuition Center General Information</h2>
        </div>

        {loading ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading settings from Firestore...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              
              {/* Center Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Tuition Center Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.centerName}
                  onChange={(e) => setSettings({ ...settings, centerName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Primary Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={settings.contactNumber}
                  onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Tuition Center Address
                </label>
                <textarea
                  rows={3}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Academic Year Fee Closure Setting */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!settings.academicYearClosed}
                    onChange={(e) => setSettings({ ...settings, academicYearClosed: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-900 text-xs">
                    Close Fee Payment Collection for Academic Year
                  </span>
                </label>
                <p className="text-xs text-slate-500 pl-7">
                  When enabled, halts automatic recurring monthly fee due accumulation across all student ledgers for the current academic session.
                </p>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
              </button>
            </div>

          </form>
        )}
      </div>

    </div>
  );
};
