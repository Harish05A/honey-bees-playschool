import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ExternalLink,
  ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const StaffPortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/staff/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/staff/students', icon: Users },
    { label: 'Attendance', path: '/staff/attendance', icon: CalendarCheck },
    { label: 'Fees Management', path: '/staff/fees', icon: CreditCard },
    { label: 'Reports', path: '/staff/reports', icon: FileText },
    { label: 'Settings', path: '/staff/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden bg-white border-b border-amber-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-white rounded-xl border border-amber-200 shrink-0">
            <img src="/images/logo.png" alt="Honey Bees Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <span className="font-display font-extrabold text-sm text-slate-900 leading-tight block">
              Honey Bees
            </span>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Tuition Center Staff
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-amber-50 text-slate-800 hover:bg-amber-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-amber-200/80 flex flex-col justify-between transition-transform duration-300 transform ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          
          {/* Official Brand Emblem */}
          <div className="flex items-center gap-3 border-b border-amber-100 pb-5">
            <div className="p-1.5 bg-white rounded-2xl border border-amber-200 shadow-sm shrink-0">
              <img src="/images/logo.png" alt="Honey Bees Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-slate-900 leading-tight block">
                Honey Bees
              </span>
              <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-amber-800 block">
                Tuition Center Staff
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-2xl font-display text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm border border-amber-600/30'
                        : 'text-slate-700 hover:bg-amber-50 hover:text-amber-950'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Account & Actions */}
        <div className="p-6 border-t border-amber-100 bg-[#FAF7F0] space-y-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-900 truncate block">
              {user?.email || 'Authorized Staff'}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Authenticated Staff
            </span>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              to="/school/dashboard"
              className="w-full py-2 px-3 bg-amber-100/80 hover:bg-amber-200 text-amber-950 font-bold rounded-xl text-xs border border-amber-300/80 transition-colors flex items-center justify-between"
            >
              <span>Play School Portal</span>
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-800" />
            </Link>

            <Link
              to="/"
              className="w-full py-2 px-3 bg-white hover:bg-amber-100 text-slate-700 font-bold rounded-xl text-xs border border-amber-200 transition-colors flex items-center justify-between"
            >
              <span>Play School Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl text-xs border border-rose-200 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Outlet Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

    </div>
  );
};
