import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginStaff } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export const StaffLoginPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && user) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginStaff(email.trim(), password);
      navigate('/staff/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('Invalid staff credentials. Please check your email and password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a few minutes before trying again.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address format.');
      } else {
        setError(err.message || 'Failed to authenticate. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Header Back Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Website</span>
        </Link>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300/60">
          Staff Portal Only
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto pt-8 pb-12">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200/90 shadow-warm-lg space-y-6">
          
          {/* Official Brand Emblem & Portal Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-1.5 bg-white rounded-2xl border border-amber-200 shadow-sm">
              <img
                src="/images/logo.png"
                alt="Honey Bees Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-900 block">
                Honey Bees Tuition Center
              </span>
              <h1 className="font-display font-extrabold text-2xl text-slate-900 mt-0.5">
                Staff Account Login
              </h1>
              <p className="text-xs text-slate-600 font-sans mt-1">
                Enter your authorized credentials to access student records
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Staff Email Address</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="staff@honeybeestuition.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-200/90 focus:border-amber-500 focus:bg-white text-slate-900 text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-200/90 focus:border-amber-500 focus:bg-white text-slate-900 text-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-sm rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 border border-amber-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span>Authenticating Staff Account...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-slate-950" />
                  <span>Sign In to Staff Portal</span>
                </>
              )}
            </button>

          </form>

          {/* Privacy & Access Note */}
          <div className="pt-4 border-t border-amber-100 text-center space-y-1 text-[11px] text-slate-500 font-sans">
            <div className="flex items-center justify-center gap-1 text-amber-900 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Restricted Access Portal</span>
            </div>
            <p>Staff accounts are created manually by the Tuition Center administrator.</p>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 pb-2 font-sans">
        © {new Date().getFullYear()} Honey Bees Tuition Center. Authorized Staff Access Only.
      </div>

    </div>
  );
};
