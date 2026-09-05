import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  School, 
  Phone, 
  Calendar, 
  BookOpen, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X,
  MessageSquare
} from 'lucide-react';
import { TuitionStudent, TuitionStudentInput } from '../types/student';
import { getStudent, updateStudent, deleteStudent } from '../services/studentService';

export const StaffStudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<TuitionStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load student document from Firestore
  const fetchStudent = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStudent(id);
      if (!data) {
        setError('Student document not found in Cloud Firestore.');
      } else {
        setStudent(data);
        setFormState({
          studentName: data.studentName || '',
          class: data.class || '',
          dateOfBirth: data.dateOfBirth || '',
          schoolName: data.schoolName || '',
          guardianName: data.guardianName || '',
          whatsapp: data.whatsapp || '',
          joiningDate: data.joiningDate || '',
          monthlyFee: data.monthlyFee,
          remarks: data.remarks || '',
        });
      }
    } catch (err: any) {
      console.error('Fetch student detail error:', err);
      setError(err.message || 'Failed to fetch student record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  // Handle Edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await updateStudent(id, formState);
      setIsEditing(false);
      await fetchStudent();
      setSuccessMessage('Student document updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Update student error:', err);
      setActionError(err.message || 'Failed to update student document in Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteStudent(id);
      navigate('/staff/students', { replace: true });
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete student document.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-display font-bold text-slate-700 text-sm">Loading Student Profile from Firestore...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/staff/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </Link>

        <div className="p-8 bg-white rounded-3xl border border-amber-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-display font-bold text-xl text-slate-900">Student Document Not Found</h2>
          <p className="text-xs text-slate-600 font-sans">{error || 'The requested student record does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/staff/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-xl text-xs border border-amber-300 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Student</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl text-xs border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Student</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Editing</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PROFILE DISPLAY MODE */}
      {!isEditing ? (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-8">
          
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-6">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-amber-100 text-amber-950 rounded-full text-xs font-extrabold border border-amber-300/60 inline-block">
                Class: {student.class || 'N/A'}
              </span>
              <h1 className="font-display font-extrabold text-3xl text-slate-900">
                {student.studentName}
              </h1>
              {student.schoolName && (
                <p className="text-xs text-slate-600 font-sans flex items-center gap-1.5 mt-1">
                  <School className="w-4 h-4 text-amber-600" />
                  <span>Enrolled School: <strong>{student.schoolName}</strong></span>
                </p>
              )}
            </div>

            {student.whatsapp && (
              <a
                href={`https://wa.me/${student.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-2xl border border-emerald-200 text-xs transition-colors shrink-0"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: {student.whatsapp}</span>
              </a>
            )}
          </div>

          {/* Profile Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans">
            
            {/* Personal Details Box */}
            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                <span>Personal & School Information</span>
              </h3>

              <div className="space-y-2 pt-1 text-slate-700">
                <div className="flex justify-between py-1 border-b border-amber-200/60">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900">{student.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-amber-200/60">
                  <span className="text-slate-500">Class / Grade:</span>
                  <span className="font-semibold text-slate-900">{student.class || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-amber-200/60">
                  <span className="text-slate-500">Date of Birth:</span>
                  <span className="font-medium">{student.dateOfBirth || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">School Name:</span>
                  <span className="font-medium text-slate-900">{student.schoolName || '—'}</span>
                </div>
              </div>
            </div>

            {/* Parent & Tuition Details Box */}
            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600" />
                <span>Parent & Tuition Details</span>
              </h3>

              <div className="space-y-2 pt-1 text-slate-700">
                <div className="flex justify-between py-1 border-b border-amber-200/60">
                  <span className="text-slate-500">Parent / Guardian:</span>
                  <span className="font-bold text-slate-900">{student.guardianName || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-amber-200/60">
                  <span className="text-slate-500">WhatsApp Contact:</span>
                  <span className="font-semibold text-emerald-800">{student.whatsapp || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-amber-200/60">
                  <span className="text-slate-500">Date of Joining:</span>
                  <span className="font-medium text-slate-900">{student.joiningDate || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Monthly Tuition Fee:</span>
                  <span className="font-bold text-amber-900">
                    {student.monthlyFee ? `₹${student.monthlyFee.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Remarks & Weaker Subject Focus */}
          <div className="p-6 bg-[#FAF7F0] rounded-2xl border border-amber-200/80 space-y-2">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Remarks & Weaker Subject Focus</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed pt-1">
              {student.remarks || 'No specific remarks added yet.'}
            </p>
          </div>

        </div>
      ) : (
        /* EDIT FORM MODE */
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-6">
          <div className="border-b border-amber-100 pb-3">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Edit Student Record
            </h2>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Update student fields saved in Cloud Firestore
            </p>
          </div>

          {actionError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-6">
            
            {/* PERSONAL INFORMATION */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block border-b border-amber-100 pb-1">
                Personal Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.studentName}
                    onChange={(e) => setFormState({ ...formState, studentName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Class / Grade *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.class}
                    onChange={(e) => setFormState({ ...formState, class: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SCHOOL INFORMATION */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block border-b border-amber-100 pb-1">
                School Information
              </span>
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={formState.schoolName}
                  onChange={(e) => setFormState({ ...formState, schoolName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
                />
              </div>
            </div>

            {/* PARENT / GUARDIAN */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block border-b border-amber-100 pb-1">
                Parent / Guardian Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.guardianName}
                    onChange={(e) => setFormState({ ...formState, guardianName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    WhatsApp Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formState.whatsapp}
                    onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* TUITION INFORMATION */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block border-b border-amber-100 pb-1">
                Tuition Details & Remarks
              </span>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                      Date of Joining
                    </label>
                    <input
                      type="date"
                      value={formState.joiningDate}
                      onChange={(e) => setFormState({ ...formState, joiningDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Remarks / Weaker Subject Focus
                  </label>
                  <textarea
                    rows={3}
                    value={formState.remarks}
                    onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 text-sm outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-amber-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-sm transition-all border border-amber-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          onClick={() => setIsDeleteModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-rose-300 space-y-4"
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">Delete Student Document?</h3>
              <p className="text-xs text-slate-600 font-sans mt-1">
                Are you sure you want to permanently delete the document for <strong>"{student.studentName}"</strong> from Cloud Firestore?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
