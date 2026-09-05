import React, { useState } from 'react';
import { X, Calendar, User, Phone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleVisitModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !phone) return;
    setSubmitted(true);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-300"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-slate-900">Visit Scheduled!</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Thank you, <strong>{parentName}</strong>! We will contact you at <strong>{phone}</strong> to confirm your walkthrough time.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-600 transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Request Parent Campus Visit</span>
            </div>

            <h3 className="font-display font-bold text-2xl text-slate-900">
              Come Experience <span className="text-amber-900">Honey Bees</span>
            </h3>

            <p className="text-xs text-slate-600 font-sans">
              Spend a relaxed morning walking through our sunlit classrooms and meeting our early childhood educators.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Parent / Guardian Name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 focus:bg-white text-slate-900 text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contact Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 focus:bg-white text-slate-900 text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Child's Age & Preferred Visit Day
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2.5 years old, Morning Walkthrough"
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 focus:bg-white text-slate-900 text-xs sm:text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-sm rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all cursor-pointer mt-4"
            >
              Submit Walkthrough Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
