import React, { useState, useEffect } from 'react';
import { Phone, Clock, MapPin, Menu, X, Calendar, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenTourModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTourModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Philosophy', href: '#about' },
    { name: 'Learning Journeys', href: '#programs' },
    { name: 'Daily Rhythm', href: '#rhythm' },
    { name: 'Inside Our Hive', href: '#gallery' },
    { name: 'Admissions', href: '#admissions' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Utility Announcement & Certification Bar */}
      <div className="bg-[#FAF3E6] text-amber-950 text-xs py-2 px-4 border-b border-amber-200/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-900">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>School Hours: 9:00 a.m. – 2:00 p.m.</span>
            </span>
            <span className="hidden md:inline-block text-amber-300">•</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Cholambedu, Thirumullaivoyal, Chennai</span>
            </span>
            <span className="hidden lg:inline-block text-amber-300">•</span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-emerald-800 font-extrabold bg-emerald-100/80 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-300/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ISO Certified Institution</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="tel:8667330368" 
              className="inline-flex items-center gap-1.5 font-bold text-amber-900 hover:text-amber-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>Contact: 8667330368</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <nav 
        className={`w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#FFFDF5]/95 backdrop-blur-md border-b border-amber-200/50 py-2.5 shadow-sm' 
            : 'bg-[#FFFDF5] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Official Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative p-1 bg-white rounded-2xl border border-amber-200/80 shadow-sm group-hover:border-amber-400 transition-all duration-300">
              <img
                src="/images/logo.png"
                alt="Honey Bees Play School Logo"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain transform group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-none group-hover:text-amber-900 transition-colors">
                  Honey Bees
                </span>
              </div>
              <span className="font-sans font-bold text-[11px] tracking-widest uppercase text-amber-800 mt-1">
                Play School
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-slate-800 hover:text-amber-900 relative py-1 transition-colors group"
              >
                <span>{link.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenTourModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-amber-600/30"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Schedule a Visit</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-amber-100/80 text-slate-800 hover:bg-amber-200 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FFFDF5] border-b border-amber-200 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-amber-100/80 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTourModal();
                }}
                className="w-full py-3 bg-amber-500 text-slate-950 font-display font-bold text-center rounded-xl text-sm"
              >
                Schedule a Visit
              </button>

              <Link
                to="/staff/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-amber-100 text-amber-950 font-bold text-center rounded-xl text-xs border border-amber-300"
              >
                Tuition Center Staff Portal
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
