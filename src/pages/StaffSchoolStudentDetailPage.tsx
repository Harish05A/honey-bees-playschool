import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  BookOpen,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  MessageSquare,
  UserCheck,
  MapPin
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolStudent, SchoolStudentInput } from '../types/schoolStudent';
import { Teacher } from '../types/teacher';
import {
  getSchoolStudent,
  updateSchoolStudent,
  deleteSchoolStudent
} from '../services/schoolStudentService';
import { getTeachers } from '../services/teacherService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const StaffSchoolStudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<SchoolStudent | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchStudent = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [data, teacherList] = await Promise.all([
        getSchoolStudent(id),
        getTeachers().catch(() => [] as Teacher[]),
      ]);
      setTeachers(teacherList.filter((t) => t.status === 'Active'));
      if (!data) {
        setError('School student record not found in Cloud Firestore.');
      } else {
        setStudent(data);
        setFormState({
          studentName: data.studentName || '',
          group: data.group || 'Playgroup',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          guardianName: data.guardianName || '',
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          joiningDate: data.joiningDate || '',
          monthlyFee: data.monthlyFee,
          assignedTeacherId: data.assignedTeacherId || '',
          assignedTeacherName: data.assignedTeacherName || '',
          remarks: data.remarks || '',
        });
      }
    } catch (err: any) {
      console.error('Fetch school student detail error:', err);
      setError(err.message || 'Failed to fetch school student record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleTeacherChange = (teacherId: string) => {
    const selected = teachers.find((t) => t.id === teacherId);
    setFormState({
      ...formState,
      assignedTeacherId: teacherId,
      assignedTeacherName: selected ? selected.teacherName : '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await updateSchoolStudent(id, formState);
      setIsEditing(false);
      await fetchStudent();
      setSuccessMessage('School student record updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Update school student error:', err);
      setActionError(err.message || 'Failed to update school student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteSchoolStudent(id);
      navigate('/school/students', { replace: true });
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete school student record.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-display font-bold text-slate-700 text-sm">Loading School Student Profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/school/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to School Students</span>
        </Link>

        <div className="p-8 bg-white rounded-3xl border border-amber-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-display font-bold text-xl text-slate-900">Student Record Not Found</h2>
          <p className="text-xs text-slate-600 font-sans">{error || 'The requested student record does not exist.'}</p>
        </div>
      </div>
    );
  }

  const badgeClass =
    SCHOOL_GROUP_META[student.group]?.badgeClass ||
    'bg-amber-100 text-amber-950 border-amber-300/60';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/school/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to School Students</span>
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
            <div className="space-y-1.5">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border inline-block ${badgeClass}`}>
                Group: {student.group}
              </span>
              <h1 className="font-display font-extrabold text-3xl text-slate-900">
                {student.studentName}
              </h1>
              {student.assignedTeacherName && (
                <p className="text-xs text-slate-600 font-sans flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>
                    Class Teacher:{' '}
                    {student.assignedTeacherId ? (
                      <Link
                        to={`/school/teachers/${student.assignedTeacherId}`}
                        className="font-bold text-amber-900 hover:underline"
                      >
                        {student.assignedTeacherName}
                      </Link>
                    ) : (
                      <strong>{student.assignedTeacherName}</strong>
                    )}
                  </span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans">
            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                <span>Personal & Enrollment Info</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Group</span>
                  <span className="font-bold text-slate-900">{student.group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-semibold text-slate-900">{student.dateOfBirth || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-semibold text-slate-900">{student.gender || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Joining Date
                  </span>
                  <span className="font-semibold text-slate-900">{student.joiningDate || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly School Fee</span>
                  <span className="font-bold text-slate-900">
                    {student.monthlyFee !== undefined ? `₹${student.monthlyFee}` : 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600" />
                <span>Parent / Guardian Contact</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Guardian Name</span>
                  <span className="font-bold text-slate-900">{student.guardianName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp Number</span>
                  <span className="font-semibold text-slate-900">{student.whatsapp || 'Not provided'}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" /> Address
                  </span>
                  <p className="font-medium text-slate-800">{student.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Remarks & Care Notes</span>
            </h3>
            <p className="text-sm text-slate-700 font-sans whitespace-pre-wrap">
              {student.remarks || 'No additional remarks recorded.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-amber-200 shadow-sm space-y-6">
          <div className="border-b border-amber-100 pb-4">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Edit School Student Record
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
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.studentName}
                  onChange={(e) => setFormState({ ...formState, studentName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Play School Group <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formState.group}
                  onChange={(e) =>
                    setFormState({ ...formState, group: e.target.value as SchoolStudentInput['group'] })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                >
                  {SCHOOL_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
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

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Parent / Guardian Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.guardianName}
                  onChange={(e) => setFormState({ ...formState, guardianName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  WhatsApp Contact
                </label>
                <input
                  type="tel"
                  value={formState.whatsapp}
                  onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
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
                  Monthly Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
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
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formState.address || ''}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 text-slate-900 text-sm outline-none"
                />
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

      {/* Delete Confirmation Modal */}
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
              <h3 className="font-display font-bold text-xl text-slate-900">Delete School Student?</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">"{student.studentName}"</strong>? This cannot be undone.
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
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

