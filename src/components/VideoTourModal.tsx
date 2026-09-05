import React from 'react';
import { X, Play, Sun, Sparkles } from 'lucide-react';

interface TourVideoProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSchedule: () => void;
}

export const VideoTourModal: React.FC<TourVideoProps> = ({ isOpen, onClose, onOpenSchedule }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Preview Canvas */}
        <div className="relative h-[360px] sm:h-[420px] bg-slate-900 flex items-center justify-center">
          <img
            src="/images/hero.png"
            alt="Honey Bees Play School Campus Preview"
            className="w-full h-full object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Interactive Play Button Showcase */}
          <div className="relative z-10 text-center space-y-3 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-warm-lg transform hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-1" />
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Inside Honey Bees Play School
            </h3>
            <p className="text-xs sm:text-sm text-amber-200 font-sans max-w-md mx-auto">
              A visual peek into our sunlit classrooms, outdoor play garden, and creative art hours.
            </p>
          </div>
        </div>

        {/* Modal Footer Callout */}
        <div className="p-6 bg-[#FFFDF7] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">Prefer an in-person walkthrough?</p>
              <p>Campus walkthroughs are conducted during school hours by appointment.</p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSchedule();
            }}
            className="shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book Campus Tour</span>
          </button>
        </div>

      </div>
    </div>
  );
};
