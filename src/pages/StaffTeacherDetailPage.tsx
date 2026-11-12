import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup, SchoolStudent } from '../types/schoolStudent';
import { Teacher, TeacherInput, TeacherStatus } from '../types/teacher';
import { getTeacher, updateTeacher, deleteTeacher } from '../services/teacherService';
import { getSchoolStudents } from '../services/schoolStudentService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const StaffTeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<SchoolStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTeacher = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [data, allSchoolStudents] = await Promise.all([
        getTeacher(id),
        getSchoolStudents().catch(() => [] as SchoolStudent[]),
      ]);
      if (!data) {
        setError('Teacher record not found in Cloud Firestore.');
      } else {
        setTeacher(data);
        setAssignedStudents(
          allSchoolStudents.filter((s) => s.assignedTeacherId === data.id)
        );
        setFormState({
          teacherName: data.teacherName || '',
          phone: data.phone || '',
          email: data.email || '',
          assignedGroups: data.assignedGroups || [],
          qualification: data.qualification || '',
          joiningDate: data.joiningDate || '',
          monthlySalary: data.monthlySalary,
          status: data.status || 'Active',
          remarks: data.remarks || '',
        });
      }
    } catch (err: any) {
      console.error('Fetch teacher detail error:', err);
      setError(err.message || 'Failed to fetch teacher record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const toggleGroup = (grp: SchoolGroup) => {
    const exists = formState.assignedGroups.includes(grp);
    setFormState({
      ...formState,
      assignedGroups: exists
        ? formState.assignedGroups.filter((g) => g !== grp)
        : [...formState.assignedGroups, grp],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await updateTeacher(id, formState);
      setIsEditing(false);
      await fetchTeacher();
      setSuccessMessage('Teacher profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Update teacher error:', err);
      setActionError(err.message || 'Failed to update teacher record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteTeacher(id);
      navigate('/school/teachers', { replace: true });
    } catch (err: any) {
      console.error('Delete teacher error:', err);
      alert(err.message || 'Failed to delete teacher record.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-display font-bold text-slate-700 text-sm">Loading Teacher Profile...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/school/teachers"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teachers</span>
        </Link>

        <div className="p-8 bg-white rounded-3xl border border-amber-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-display font-bold text-xl text-slate-900">Teacher Not Found</h2>
          <p className="text-xs text-slate-600 font-sans">{error || 'The requested teacher record does not exist.'}</p>
        </div>
      </div>
    );
  }

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

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-xl text-xs border border-amber-300 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Teacher</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl text-xs border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Teacher</span>
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

      {!isEditing ? (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    teacher.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {teacher.status}
                </span>
                {(teacher.assignedGroups || []).map((grp) => (
                  <span
                    key={grp}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      SCHOOL_GROUP_META[grp]?.badgeClass || 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}
                  >
                    {grp}
                  </span>
                ))}
              </div>
              <h1 className="font-display font-extrabold text-3xl text-slate-900">
                {teacher.teacherName}
              </h1>
              {teacher.qualification && (
                <p className="text-xs text-slate-600 font-sans">
                  Qualification: <strong>{teacher.qualification}</strong>
                </p>
              )}
            </div>

            {teacher.phone && (
              <a
                href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-2xl border border-emerald-200 text-xs transition-colors shrink-0"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: {teacher.phone}</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans">
            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Contact Information</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone / WhatsApp</span>
                  <span className="font-bold text-slate-900">{teacher.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-600" /> Email
                  </span>
                  <span className="font-semibold text-slate-900">{teacher.email || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>Employment Details</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Joining Date
                  </span>
                  <span className="font-semibold text-slate-900">{teacher.joiningDate || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Salary</span>
                  <span className="font-bold text-slate-900">
                    {teacher.monthlySalary !== undefined ? `₹${teacher.monthlySalary}` : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Students */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Assigned Play School Students ({assignedStudents.length})</span>
            </h3>
            {assignedStudents.length === 0 ? (
              <p className="text-xs text-slate-500">No students are currently assigned to this teacher.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {assignedStudents.map((s) => (
                  <Link
                    key={s.id}
                    to={`/school/students/${s.id}`}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-300 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{s.studentName}</span>
                      <span className="text-[11px] text-slate-500">{s.guardianName}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                        SCHOOL_GROUP_META[s.group]?.badgeClass || 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {s.group}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Remarks & Notes</span>
            </h3>
            <p className="text-sm text-slate-700 font-sans whitespace-pre-wrap">
              {teacher.remarks || 'No additional remarks recorded.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-6">
          <div className="border-b border-amber-100 pb-4">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Edit Teacher Profile
            </h2>
          </div>

          {actionError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Teacher Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.teacherName}
                  onChange={(e) => setFormState({ ...formState, teacherName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Phone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formState.email || ''}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={formState.qualification || ''}
                  onChange={(e) => setFormState({ ...formState, qualification: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

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
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                Assigned Play School Groups
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SCHOOL_GROUPS.map((grp) => {
                  const selected = formState.assignedGroups.includes(grp);
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => toggleGroup(grp)}
                      className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        selected
                          ? 'border-amber-500 bg-amber-50 text-slate-900'
                          : 'border-amber-200/70 bg-white text-slate-600'
                      }`}
                    >
                      <span>{grp}</span>
                      <span>{selected ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Remarks
              </label>
              <textarea
                rows={3}
                value={formState.remarks}
                onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          onClick={() => setIsDeleteModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200 space-y-4"
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">Delete Teacher?</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">"{teacher.teacherName}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

