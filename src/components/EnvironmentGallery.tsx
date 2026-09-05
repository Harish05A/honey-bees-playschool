import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

export const EnvironmentGallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; desc: string } | null>(null);

  const gallery = [
    {
      src: '/images/hero.png',
      title: 'Sunlit Learning Classroom',
      category: 'Main Learning Haven',
      desc: 'Child-proportioned wooden tables, open book shelving, and natural morning light.',
      gridClass: 'lg:col-span-5 lg:row-span-2 h-80 lg:h-[480px]',
    },
    {
      src: '/images/garden.png',
      title: 'Outdoor Garden Path',
      category: 'Fresh Air & Nature',
      desc: 'Lush green play lawn, wooden balance paths, and flower garden patches.',
      gridClass: 'lg:col-span-7 h-64 lg:h-[225px]',
    },
    {
      src: '/images/art.png',
      title: 'Creative Art Studio',
      category: 'Tactile Art',
      desc: 'Watercolors, finger painting, and natural clay tables.',
      gridClass: 'lg:col-span-3 h-64 lg:h-[225px]',
    },
    {
      src: '/images/reading.png',
      title: 'Cozy Reading Nook',
      category: 'Quiet Reflection',
      desc: 'Plush cushions and picture book shelves for peaceful rest.',
      gridClass: 'lg:col-span-4 h-64 lg:h-[225px]',
    },
  ];

  return (
    <section id="gallery" className="py-24 bg-tactile-paper relative border-t border-amber-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 border-b-2 border-amber-400 pb-1 inline-block">
            Inside Our Hive
          </span>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight">
            An editorial photo wall of <span className="italic text-amber-900">our learning spaces</span>.
          </h2>
        </div>

        {/* Asymmetrical Photo-Wall Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {gallery.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage({ src: item.src, title: item.title, desc: item.desc })}
              className={`group cursor-pointer space-y-2 ${item.gridClass}`}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-sm bg-amber-50">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">
                    {item.category}
                  </span>
                  <h3 className="font-display font-bold text-sm sm:text-base">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-amber-200"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-[60vh] bg-slate-900">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 bg-white space-y-1">
              <h3 className="font-display font-bold text-xl text-slate-900">
                {selectedImage.title}
              </h3>
              <p className="text-sm text-slate-600 font-sans">
                {selectedImage.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
