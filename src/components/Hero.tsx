import React from 'react';
import { Compass, Calendar, Sparkles, Heart, Sun, Feather } from 'lucide-react';
import { BeeLogoIcon, StorybookFlightPath } from './HoneyBeeIllustration';

interface HeroProps {
  onOpenTourModal: () => void;
  onExploreVideo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTourModal, onExploreVideo }) => {
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreVideo();
    }
  };

  return (
    <section className="relative pt-6 pb-16 lg:pt-10 lg:pb-24 bg-tactile-paper overflow-hidden">
      
      {/* Background Storybook Decorative Accents */}
      <div className="absolute top-8 right-12 opacity-30 pointer-events-none hidden lg:block">
        <BeeLogoIcon className="w-16 h-16 animate-buzz" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Storybook Chapter Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 bg-amber-100/90 rounded-xl border border-amber-300/60 shrink-0">
            <BeeLogoIcon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-handwriting text-2xl sm:text-3xl text-amber-900 font-bold">
              Welcome to Honey Bees
            </span>
            <span className="text-amber-300">•</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              A Play & Discovery Sanctuary
            </span>
          </div>
        </div>

        {/* Asymmetric Storybook Grid Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: Headline & Story Narrative (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Storybook Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.12]">
              A warm little corner of the world where children{' '}
              <span className="relative inline-block text-amber-900">
                <span className="italic">play, grow, and discover</span>.
              </span>
            </h1>

            {/* Natural Warm School Copy */}
            <p className="text-base sm:text-lg text-slate-700 font-sans leading-relaxed max-w-2xl">
              At Honey Bees, every morning begins with wonder. We create gentle, sunlit spaces where young children build early friendships, paint with big imagination, and explore the joy of learning at their own natural pace.
            </p>

            {/* Playful Visual Path Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/70 shadow-sm flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Play-Based Learning</span>
              </div>

              <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/70 shadow-sm flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                  <Feather className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Outdoor Garden Discovery</span>
              </div>

              <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/70 shadow-sm flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-900 rounded-xl">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">1:6 Educator Ratio</span>
              </div>
            </div>

            {/* Action Buttons (Refined as requested) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              {/* Primary Action: Explore Our School */}
              <button
                onClick={scrollToAbout}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-amber-600/30 group"
              >
                <Compass className="w-4 h-4 text-slate-950 group-hover:rotate-45 transition-transform" />
                <span>Explore Our School</span>
              </button>

              {/* Secondary Action: Admission Enquiry */}
              <button
                onClick={onOpenTourModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-amber-50 text-slate-900 font-display font-bold text-sm rounded-xl border border-amber-300 transition-colors cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4 text-amber-800" />
                <span>Admission Enquiry</span>
              </button>
            </div>

          </div>

          {/* RIGHT: Layered Storybook Art Composition (5 Columns) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Storybook Flight Path SVG Line above Image */}
              <div className="absolute -top-10 left-0 right-0 z-20 pointer-events-none hidden sm:block">
                <StorybookFlightPath className="w-full h-12" />
              </div>

              {/* Main Layer 1: Storybook Arched Frame */}
              <div className="relative z-10 rounded-t-[120px] rounded-b-3xl overflow-hidden border-4 border-white shadow-md bg-amber-100">
                <img
                  src="/images/hero.png"
                  alt="Young children engaging in play-based learning at Honey Bees Play School"
                  className="w-full h-[400px] sm:h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                  <p className="font-display font-semibold text-xs text-amber-300 uppercase tracking-widest">
                    The Honey Bees Classroom
                  </p>
                  <p className="text-xs text-slate-100 font-sans mt-0.5">
                    Sunlit wooden spaces designed for young hands, curiosity, and independent play.
                  </p>
                </div>
              </div>

              {/* Layer 2: Overlapping Secondary Garden Frame (Bottom Left) */}
              <div className="absolute -bottom-6 -left-6 z-20 w-44 sm:w-52 rounded-2xl overflow-hidden border-4 border-white shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 hidden sm:block bg-amber-50">
                <img
                  src="/images/garden.png"
                  alt="Outdoor play garden"
                  className="w-full h-28 sm:h-32 object-cover"
                />
                <div className="p-2 bg-white text-center">
                  <span className="text-[11px] font-bold text-slate-800 block">
                    🌿 Outdoor Garden Play
                  </span>
                </div>
              </div>

              {/* Layer 3: Handcrafted Reassurance Stamp (Top Right) */}
              <div className="absolute -top-4 -right-4 z-20 p-3 bg-white rounded-2xl shadow-md border border-amber-200 text-center flex items-center gap-2 transform rotate-2 animate-float">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-base">
                  🐝
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                    Nurturing Early Years
                  </span>
                  <span className="text-[10px] text-amber-800 font-medium block">
                    Ages 1.5 to 6 Years
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
