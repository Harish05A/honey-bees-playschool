import React from 'react';
import { Calendar, CheckCircle, Info } from 'lucide-react';

interface ProgramsProps {
  onOpenTourModal: () => void;
}

export const ProgramsSection: React.FC<ProgramsProps> = ({ onOpenTourModal }) => {
  return (
    <section id="programs" className="py-24 bg-tactile-paper relative border-t border-amber-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 border-b-2 border-amber-400 pb-1 inline-block">
            Age-Tailored Learning Journeys
          </span>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight">
            Distinct learning environments for <span className="italic text-amber-900">every developmental stage</span>.
          </h2>
        </div>

        {/* BAND 1: Tiny Bees (Left-Aligned Wide Horizontal Layout) */}
        <div className="bg-[#FAF3E6] rounded-[36px] border-2 border-amber-300 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-3">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-200 text-amber-950 font-display font-extrabold text-xs">
                Ages: 1.5 – 2.5 Years
              </span>
              <h3 className="font-display font-extrabold text-3xl text-slate-900">
                Tiny Bees
              </h3>
              <p className="font-handwriting text-2xl text-amber-900 font-bold">
                ~ Sensory exploration & gentle rhythm
              </p>
              <p className="text-sm text-slate-700 font-sans leading-relaxed pt-1">
                A soothing introduction to group play focused on sensory water bins, wooden toys, motor coordination, and comforting nap routines.
              </p>
            </div>

            <div className="lg:col-span-8 bg-white/90 p-6 sm:p-8 rounded-3xl border border-amber-200/80 space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Key Learning Experiences:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sensory water & block building</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Nursery rhymes & musical rhythm</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Guided gross motor movement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cozy rest & story routines</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">1:6 Educator Ratio • Loving Personal Care</span>
                <button
                  onClick={onOpenTourModal}
                  className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Inquire</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BAND 2: Little Buzzers (Right-Offset Terracotta Layout) */}
        <div className="bg-[#FFF7ED] rounded-[36px] border-2 border-orange-300 p-8 sm:p-12 lg:ml-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 order-2 lg:order-1 bg-white/90 p-6 sm:p-8 rounded-3xl border border-orange-200/80 space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Creative Discovery Focus:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Story circles & sound readiness</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Finger painting & art studio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Social sharing & peer cooperation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Outdoor garden exploration</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-950">Active Small Group Learning</span>
                <button
                  onClick={onOpenTourModal}
                  className="text-xs font-bold text-orange-950 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Inquire</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 order-1 lg:order-2 space-y-3">
              <span className="px-3.5 py-1.5 rounded-full bg-orange-200 text-orange-950 font-display font-extrabold text-xs">
                Ages: 2.5 – 4 Years
              </span>
              <h3 className="font-display font-extrabold text-3xl text-slate-900">
                Little Buzzers
              </h3>
              <p className="font-handwriting text-2xl text-orange-950 font-bold">
                ~ Creative expression & language
              </p>
              <p className="text-sm text-slate-700 font-sans leading-relaxed pt-1">
                Fostering early independence, verbal expression, and creative imagination through daily tactile art hours and story circles.
              </p>
            </div>
          </div>
        </div>

        {/* BAND 3: Honey Explorers (Full-Width Sage Green Editorial Spread) */}
        <div className="bg-[#F0FDF4] rounded-[36px] border-2 border-emerald-300 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-200 text-emerald-950 font-display font-extrabold text-xs">
                Ages: 4 – 6 Years
              </span>
              <h3 className="font-display font-extrabold text-3xl text-slate-900">
                Honey Explorers
              </h3>
              <p className="font-handwriting text-2xl text-emerald-900 font-bold">
                ~ Early literacy & science wonder
              </p>
              <p className="text-sm text-slate-700 font-sans leading-relaxed pt-1">
                Preparing confident, curious learners with phonics awareness, early math puzzles, dramatic play, and plant science observation.
              </p>
            </div>

            <div className="lg:col-span-7 bg-white/90 p-6 sm:p-8 rounded-3xl border border-emerald-200/80 space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Foundational Readiness:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-800 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Phonics & sound awareness</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Counting puzzles & patterns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Dramatic role-play corners</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Garden science observation</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Play-Based Kindergarten Readiness</span>
                <button
                  onClick={onOpenTourModal}
                  className="text-xs font-bold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Inquire</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Honest Information Note */}
        <div className="p-4 bg-white rounded-2xl border border-amber-200/80 text-slate-700 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-slate-600">
              Detailed daily timings, age syllabi, and enrollment availability are provided in person during your campus walkthrough.
            </p>
          </div>
          <button
            onClick={onOpenTourModal}
            className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Request Campus Tour
          </button>
        </div>

      </div>
    </section>
  );
};
