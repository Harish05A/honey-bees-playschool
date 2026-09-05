import React from 'react';
import { Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BeeLogoIcon } from '../components/HoneyBeeIllustration';

interface ComingSoonProps {
  title: string;
  description: string;
}

export const StaffComingSoonPage: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-amber-200 shadow-sm text-center space-y-6">
        
        <div className="p-4 bg-amber-100/90 text-amber-900 rounded-3xl border border-amber-300 w-16 h-16 mx-auto flex items-center justify-center">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Tuition Center Module
          </span>
          <h1 className="font-display font-extrabold text-3xl text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-amber-200 text-slate-700 text-xs max-w-lg mx-auto space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Planned Module Integration</span>
          </div>
          <p>
            To prevent non-functional dummy data, this section will be enabled when actual tuition center attendance and fee records are imported into Cloud Firestore.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            to="/staff/students"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Management</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
