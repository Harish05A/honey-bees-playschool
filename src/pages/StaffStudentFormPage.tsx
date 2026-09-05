import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  School, 
  Phone, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import { TuitionStudentInput } from '../types/student';
import { createStudent } from '../services/studentService';

export const StaffStudentFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState<TuitionStudentInput>({
    studentName: '',
    class: '',
    dateOfBirth: '',
    schoolName: '',
    guardianName: '',
    whatsapp: '',
    joiningDate: '',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.studentName.trim() || !formState.class.trim() || !formState.guardianName.trim()) {
      setError('Please fill in required fields: Student Name, Class, and Guardian Name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const id = await createStudent(formState);
      navigate(`/staff/students/${id}`, { replace: true });
    } catch (err: any) {
      console.error('Create student error:', err);
      setError(err.message || 'Failed to save student document to Cloud Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/staff/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </Link>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          New Student Document
        </span>
      </div>

      {/* Main Form Container */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-8">
        
        {/* Title */}
        <div className="border-b border-amber-100 pb-4">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Add Tuition Student Document
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Fill in student details. Documents are securely saved directly to Cloud Firestore.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* GROUP 1: PERSONAL INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <User className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                1. Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Roy"
                  value={formState.studentName}
                  onChange={(e) => setFormState({ ...formState, studentName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Class / Grade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 7"
                  value={formState.class}
                  onChange={(e) => setFormState({ ...formState, class: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formState.dateOfBirth}
                  onChange={(e) => setFormState({ ...formState, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* GROUP 2: SCHOOL INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <School className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                2. School Information
              </h2>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                School Name
              </label>
              <input
                type="text"
                placeholder="e.g. Green Valley Public School"
                value={formState.schoolName}
                onChange={(e) => setFormState({ ...formState, schoolName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
              />
            </div>
          </div>

          {/* GROUP 3: PARENT / GUARDIAN INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <Phone className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                3. Parent / Guardian Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Parent / Guardian Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subhash Roy"
                  value={formState.guardianName}
                  onChange={(e) => setFormState({ ...formState, guardianName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={formState.whatsapp}
                  onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* GROUP 4: TUITION INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                4. Tuition & Fee Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={formState.joiningDate}
                  onChange={(e) => setFormState({ ...formState, joiningDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Monthly Tuition Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1500"
                  value={formState.monthlyFee || ''}
                  onChange={(e) => setFormState({ ...formState, monthlyFee: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Remarks / Weaker Subject Focus
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Needs extra practice in Mathematics algebra and Science physics concepts..."
                value={formState.remarks}
                onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Form Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-amber-100">
            <Link
              to="/staff/students"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-sm transition-all border border-amber-600/30 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{submitting ? 'Saving Document...' : 'Save Student Document'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
