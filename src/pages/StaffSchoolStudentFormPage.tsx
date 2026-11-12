import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Phone,
  BookOpen,
  AlertCircle,
  Save
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup, SchoolStudentInput } from '../types/schoolStudent';
import { Teacher } from '../types/teacher';
import { createSchoolStudent } from '../services/schoolStudentService';
import { getTeachers } from '../services/teacherService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const StaffSchoolStudentFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formState, setFormState] = useState<SchoolStudentInput>({
    studentName: '',
    group: 'Playgroup',
    dateOfBirth: '',
    gender: '',
    guardianName: '',
    whatsapp: '',
    address: '',
    joiningDate: '',
    assignedTeacherId: '',
    assignedTeacherName: '',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeachers()
      .then((list) => setTeachers(list.filter((t) => t.status === 'Active')))
      .catch((err) => console.error('Failed to load teachers list:', err));
  }, []);

  const handleTeacherChange = (teacherId: string) => {
    const selected = teachers.find((t) => t.id === teacherId);
    setFormState({
      ...formState,
      assignedTeacherId: teacherId,
      assignedTeacherName: selected ? selected.teacherName : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.studentName.trim() || !formState.group || !formState.guardianName.trim()) {
      setError('Please fill in required fields: Student Name, Group, and Parent / Guardian Name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const id = await createSchoolStudent(formState);
      navigate(`/school/students/${id}`, { replace: true });
    } catch (err: any) {
      console.error('Create school student error:', err);
      setError(err.message || 'Failed to save school student record to Cloud Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/school/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to School Students</span>
        </Link>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          New Play School Enrollment
        </span>
      </div>

      {/* Main Form Container */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-8">
        <div className="border-b border-amber-100 pb-4">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Add Play School Student
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            Enroll a student into Playgroup, Pre-KG, LKG, or UKG. Records are saved to Cloud Firestore.
          </p>
        </div>

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
                1. Student Information
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
                  placeholder="e.g. Aarav Nair"
                  value={formState.studentName}
                  onChange={(e) => setFormState({ ...formState, studentName: e.target.value })}
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

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Gender
                </label>
                <select
                  value={formState.gender || ''}
                  onChange={(e) =>
                    setFormState({ ...formState, gender: e.target.value as SchoolStudentInput['gender'] })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* GROUP 2: PLAY SCHOOL GROUP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                2. Play School Group <span className="text-rose-500">*</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SCHOOL_GROUPS.map((grp: SchoolGroup) => {
                const meta = SCHOOL_GROUP_META[grp];
                const selected = formState.group === grp;
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setFormState({ ...formState, group: grp })}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-amber-200/70 bg-white hover:border-amber-300'
                    }`}
                  >
                    <span className="font-display font-extrabold text-sm text-slate-900 block">
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {meta.ageHint}
                    </span>
                  </button>
                );
              })}
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
                  placeholder="e.g. Priya Nair"
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

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Home Address
              </label>
              <input
                type="text"
                placeholder="Residential address / pickup area"
                value={formState.address || ''}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
              />
            </div>
          </div>

          {/* GROUP 4: ENROLLMENT & TEACHER ASSIGNMENT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900">
                4. Enrollment, Teacher & Fee Details
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
                  Monthly School Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2500"
                  value={formState.monthlyFee ?? ''}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      monthlyFee: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Assigned Teacher
                </label>
                <select
                  value={formState.assignedTeacherId || ''}
                  onChange={(e) => handleTeacherChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teacherName}
                      {t.assignedGroups?.length ? ` (${t.assignedGroups.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Remarks / Health & Allergy Notes
              </label>
              <textarea
                rows={3}
                placeholder="Allergies, pickup instructions, or special care notes..."
                value={formState.remarks}
                onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-amber-100 flex items-center justify-end gap-3">
            <Link
              to="/school/students"
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
              <span>{submitting ? 'Saving Student...' : 'Save School Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

