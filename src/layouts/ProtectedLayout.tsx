import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BeeLogoIcon } from '../components/HoneyBeeIllustration';

export const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center p-4">
        <div className="p-4 bg-amber-100/80 rounded-2xl border border-amber-300 animate-bounce mb-4">
          <BeeLogoIcon className="w-10 h-10" />
        </div>
        <p className="font-display font-bold text-slate-800 text-base">Verifying Staff Authorization...</p>
        <p className="text-xs text-slate-500 font-sans mt-1">Honey Bees Tuition Center Staff Portal</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/staff/login" replace />;
  }

  return <Outlet />;
};
