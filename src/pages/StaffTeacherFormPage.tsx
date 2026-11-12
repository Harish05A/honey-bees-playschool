import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Phone,
  GraduationCap,
  Briefcase,
  AlertCircle,
  Save
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup } from '../types/schoolStudent';
import { TeacherInput, TeacherStatus } from '../types/teacher';
import { createTeacher } from '../services/teacherService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const StaffTeacherFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState<TeacherInput>({
    teacherName: '',
    phone: '',
    email: '',
    assignedGroups: [],
    qualification: '',
    joiningDate: '',
    status: 'Active',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGroup = (grp: SchoolGroup) => {
    const exists = formState.assignedGroups.includes(grp);
    setFormState({
      ...formState,
      assignedGroups: exists
        ? formState.assignedGroups.filter((g) => g !== grp)
        : [...formState.assignedGroups, grp],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.teacherName.trim() || !formState.phone.trim()) {
      setError('Please fill in required fields: Teacher Name and Phone Number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const id = await createTeacher(formState);
      navigate(`/school/teachers/${id}`, { replace: true });
    } catch (err: any) {
      console.error('Create teacher error:', err);
      setError(err.message || 'Failed to save teacher record to Cloud Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link
          to="/school/teachers"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teachers</span>
        </Link>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          New Teacher Record
        </span>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-8">
        <div className="border-b border-amber-100 pb-4">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Add Teacher Profile
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Register a teacher and assign them to Play School groups (Playgroup, Pre-KG, LKG, UKG).
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. PERSONAL & CONTACT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                1. Teacher Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Teacher Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Krishnan"
                  value={formState.teacherName}
                  onChange={(e) => setFormState({ ...formState, teacherName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Phone / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. meera@honeybees.edu"
                  value={formState.email || ''}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Qualification / Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Montessori Trained, B.Ed"
                  value={formState.qualification || ''}
                  onChange={(e) => setFormState({ ...formState, qualification: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. ASSIGNED GROUPS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                2. Assigned Play School Groups
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SCHOOL_GROUPS.map((grp) => {
                const selected = formState.assignedGroups.includes(grp);
                const meta = SCHOOL_GROUP_META[grp];
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => toggleGroup(grp)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-amber-200/70 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-extrabold text-sm text-slate-900">
                        {meta.label}
                      </span>
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                          selected
                            ? 'bg-amber-500 border-amber-600 text-slate-950'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selected ? '✓' : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{meta.ageHint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. EMPLOYMENT DETAILS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                3. Employment & Payroll Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Joining Date
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
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15000"
                  value={formState.monthlySalary ?? ''}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      monthlySalary: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Status
                </label>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState({ ...formState, status: e.target.value as TeacherStatus })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Remarks / Notes
              </label>
              <textarea
                rows={3}
                placeholder="Working hours, special skills, or notes..."
                value={formState.remarks}
                onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-amber-100 flex items-center justify-end gap-3">
            <Link
              to="/school/teachers"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Teacher...' : 'Save Teacher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

