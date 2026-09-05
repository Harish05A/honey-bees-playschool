import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

export const WelcomeSection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#FFFDF5] relative border-t border-amber-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Lead Tag */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 border-b-2 border-amber-400 pb-1">
            Our Educational Philosophy
          </span>
        </div>

        {/* Editorial Composition: Large Photo + Offset Overlapping Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Focal Image Frame (6 Cols) */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[40px] overflow-hidden border-4 border-white shadow-md bg-amber-100">
              <img
                src="/images/reading.png"
                alt="Children in the cozy reading nook at Honey Bees Play School"
                className="w-full h-[420px] sm:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                <p className="font-display font-semibold text-xs text-amber-300 uppercase tracking-wider">
                  The Story & Reading Nook
                </p>
                <p className="text-xs text-slate-100 font-sans mt-0.5">
                  Plush floor cushions, warm natural light, and picture books curated for young minds.
                </p>
              </div>
            </div>

            {/* Small Supporting Detail Badge */}
            <div className="absolute -top-4 -left-4 bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Child-Centered Curiosity</span>
                <span className="text-[10px] text-amber-800 font-medium">Unrushed early exploration</span>
              </div>
            </div>
          </div>

          {/* Offset Overlapping Narrative Text Block (6 Cols) */}
          <div className="lg:col-span-6 lg:-ml-8 relative z-10 mt-6 lg:mt-0">
            <div className="bg-[#FAF3E6] p-8 sm:p-12 rounded-[32px] border-2 border-amber-300 shadow-sm space-y-6">
              
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 leading-tight">
                A gentle sanctuary built around how young children <span className="italic text-amber-900">naturally learn</span>.
              </h2>

              <p className="text-base text-slate-700 font-sans leading-relaxed">
                At Honey Bees Play School, early childhood is celebrated as a unique window of wonder. We don’t rush children through rigid academic metrics; instead, we nurture their innate desire to question, paint, build, and explore together.
              </p>

              <div className="pt-4 border-t border-amber-200/80 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <p className="text-sm text-slate-800 font-medium">
                    <strong>Intentional Play-Based Curriculum:</strong> Concepts are absorbed naturally through sensory building, music, and storytelling.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <p className="text-sm text-slate-800 font-medium">
                    <strong>Warm & Secure Environment:</strong> Small class sizes ensure every child receives patient, loving guidance.
                  </p>
                </div>
              </div>

              {/* Handwritten Marginalia Quote */}
              <div className="pt-2">
                <span className="font-handwriting text-2xl sm:text-3xl text-amber-900 font-bold block transform -rotate-1">
                  "Childhood is not a race, but a garden of wonder."
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
