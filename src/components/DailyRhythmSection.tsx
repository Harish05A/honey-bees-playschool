import React, { useState } from 'react';

export const DailyRhythmSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const activities = [
    {
      time: '8:30 AM',
      title: 'Morning Circle & Sing-Along',
      photo: '/images/hero.png',
      caption: 'Gathering together in a cozy circle with welcoming songs, weather exploration, and cheerful morning check-ins.',
      tag: 'Social Rhythm',
    },
    {
      time: '9:30 AM',
      title: 'Tactile Art & Craft Studio',
      photo: '/images/art.png',
      caption: 'Hands-on watercolors, finger painting, natural clay modeling, and uninhibited creative discovery.',
      tag: 'Creative Discovery',
    },
    {
      time: '10:30 AM',
      title: 'Outdoor Garden & Movement',
      photo: '/images/garden.png',
      caption: 'Fresh air play, wooden balance beams, butterfly watching, and energetic physical games in the play garden.',
      tag: 'Physical Health',
    },
    {
      time: '1:00 PM',
      title: 'Story Nook & Quiet Rest',
      photo: '/images/reading.png',
      caption: 'Dimmed lighting, plush floor cushions, and soothing bedtime picture books to rest and recharge.',
      tag: 'Quiet Rest',
    },
  ];

  const current = activities[activeIdx];

  return (
    <section id="rhythm" className="py-24 bg-[#FFFDF5] relative border-t border-amber-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 border-b-2 border-amber-400 pb-1 inline-block">
            A Day at Honey Bees
          </span>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight">
            An energetic, child-focused <span className="italic text-amber-900">visual story of our day</span>.
          </h2>
        </div>

        {/* Visual Storytelling Photo Journal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Visual Journal Spread (7 Cols) */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-[36px] overflow-hidden border-4 border-white shadow-md bg-amber-100 h-[380px] sm:h-[460px]">
              <img
                src={current.photo}
                alt={current.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-slate-900 font-extrabold text-xs">
                  ⏰ {current.time} • {current.tag}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <h3 className="font-display font-bold text-2xl sm:text-3xl drop-shadow-md">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed max-w-xl">
                  {current.caption}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Reel Selector Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Select an activity moment:
            </span>

            {activities.map((act, idx) => (
              <div
                key={act.time}
                onClick={() => setActiveIdx(idx)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  activeIdx === idx
                    ? 'bg-[#FAF3E6] border-amber-400 shadow-sm scale-[1.02]'
                    : 'bg-white border-amber-100 hover:border-amber-200 hover:bg-amber-50/50'
                }`}
              >
                <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-200">
                  <img src={act.photo} alt={act.title} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold text-amber-900 block uppercase tracking-wider">
                    {act.time}
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    {act.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
