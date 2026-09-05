import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export const AdmissionsSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    phone: '',
    email: '',
    childAge: '2.5',
    visitDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentName || !formData.phone) return;
    setSubmitted(true);
  };

  const steps = [
    { num: '01', title: 'Schedule a Visit', desc: 'Select a convenient morning for an unhurried walkthrough of our campus.' },
    { num: '02', title: 'Meet Our Educators', desc: 'Experience our learning spaces in action and ask any routine questions.' },
    { num: '03', title: 'Gentle Transition Day', desc: 'We support a gradual, comforting start to help your child feel right at home.' },
  ];

  return (
    <section id="admissions" className="py-24 bg-[#FFFDF5] relative border-t border-amber-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Continuation Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 border-b-2 border-amber-400 pb-1 inline-block">
            Begin Your Child's Story With Us
          </span>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight">
            Every child’s journey begins with a <span className="italic text-amber-900">gentle first step</span>.
          </h2>

          <p className="text-base sm:text-lg text-slate-700 font-sans leading-relaxed">
            We invite you to step inside our sunlit classrooms, meet our early educators, and experience the warm, unhurried atmosphere of Honey Bees Play School in person.
          </p>
        </div>

        {/* 3 Step Story Walkthrough Line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="border-l-2 border-amber-400 pl-5 space-y-1.5">
              <span className="font-display font-extrabold text-xl text-amber-900 block">
                {step.num}
              </span>
              <h3 className="font-display font-bold text-lg text-slate-900">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto bg-[#FAF3E6] p-8 sm:p-10 rounded-[32px] border-2 border-amber-300 shadow-sm">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-2xl text-slate-900">Walkthrough Request Received</h3>
              <p className="text-slate-700 text-sm font-sans max-w-md mx-auto">
                Thank you, <strong>{formData.parentName}</strong>! Our admissions team will reach out to you at <strong>{formData.phone}</strong> to confirm your visit time.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ parentName: '', phone: '', email: '', childAge: '2.5', visitDate: '', notes: '' });
                }}
                className="mt-2 px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-600 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-amber-200/80 pb-3">
                <h3 className="font-display font-bold text-2xl text-slate-900">Schedule a Campus Walkthrough</h3>
                <p className="text-xs text-slate-600 mt-0.5 font-sans">
                  Please share your preferred details below and we will get in touch to confirm your visit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Parent / Guardian Name"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contact Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Child's Age Group
                  </label>
                  <select
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                  >
                    <option value="1.5">1.5 – 2.5 Years (Tiny Bees)</option>
                    <option value="2.5">2.5 – 4 Years (Little Buzzers)</option>
                    <option value="4.5">4 – 6 Years (Honey Explorers)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Preferred Visit Date
                </label>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Questions or Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific questions regarding routines, dietary preferences, or transition guidance..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm rounded-xl transition-all cursor-pointer border border-amber-600/30 shadow-sm"
              >
                Confirm Visit Request
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
