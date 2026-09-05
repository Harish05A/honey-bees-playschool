import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowUp, Heart, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenTourModal: () => void;
}

export const ContactFooter: React.FC<FooterProps> = ({ onOpenTourModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#1C1814] text-amber-100/90 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-amber-900/40">
          
          {/* Brand & Mission Statement (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-2xl border border-amber-500/30 shrink-0">
                <img
                  src="/images/logo.png"
                  alt="Honey Bees Play School Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <span className="font-display font-bold text-2xl text-white tracking-tight block">
                  Honey Bees
                </span>
                <span className="font-sans font-semibold text-xs tracking-widest uppercase text-amber-400">
                  Play School
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              A gentle, play-centered early childhood sanctuary where young children explore, build friendships, and bloom with confidence.
            </p>

            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-extrabold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ISO Certified Institution</span>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenTourModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <span>Schedule a Visit</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Links (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display font-bold text-white text-xs uppercase tracking-widest text-amber-400">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a href="#about" className="hover:text-amber-300 transition-colors">Our Philosophy</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-300 transition-colors">Learning Journeys</a>
              </li>
              <li>
                <a href="#rhythm" className="hover:text-amber-300 transition-colors">Daily Rhythm</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-300 transition-colors">Inside Our Hive</a>
              </li>
              <li>
                <a href="#admissions" className="hover:text-amber-300 transition-colors">Admissions</a>
              </li>
              <li className="pt-2 border-t border-amber-900/40">
                <Link to="/staff/login" className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition-colors font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tuition Center Staff Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details & Hours (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display font-bold text-white text-xs uppercase tracking-widest text-amber-400">
              Campus & Contact Information
            </h3>

            <div className="space-y-3 text-sm font-sans">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Honey Bees Play School</p>
                  <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                    591/4, Pillayar Koil Street, Srinivasa Nagar Main Road,<br />
                    Cholambedu, Thirumullaivoyal, Chennai - 62
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-slate-200">Contact Person: <strong className="text-white">Latha A</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <a 
                  href="tel:8667330368" 
                  className="text-white font-bold hover:text-amber-300 transition-colors"
                >
                  8667330368
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                <a 
                  href="mailto:playschoolhoneybees@gmail.com" 
                  className="text-amber-200 hover:text-amber-300 transition-colors"
                >
                  playschoolhoneybees@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-0.5">
                  <p><strong className="text-white">School Hours:</strong> 9:00 a.m. – 2:00 p.m.</p>
                  <p className="text-amber-400/80 italic pt-1">Campus walkthroughs conducted by appointment.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Honey Bees Play School. Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>for young curious minds.</span>
          </p>

          <button
            onClick={scrollToTop}
            className="p-2 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded-xl border border-amber-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
