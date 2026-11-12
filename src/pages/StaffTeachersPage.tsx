import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Phone,
  Eye,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Mail,
  Briefcase
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup } from '../types/schoolStudent';
import { Teacher, TeacherStatus } from '../types/teacher';
import { subscribeToTeachers, deleteTeacher } from '../services/teacherService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const StaffTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'ALL' | SchoolGroup>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TeacherStatus>('ALL');

  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [deletingTeacherName, setDeletingTeacherName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    return subscribeToTeachers(
      (data) => {
        setTeachers(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError('Unable to load teachers directory. Please check your internet connection or try again.');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    const unsubscribe = loadData();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const stats = useMemo(() => {
    const active = teachers.filter((t) => t.status === 'Active').length;
    const inactive = teachers.length - active;
    return { total: teachers.length, active, inactive };
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const matchesQuery =
        !query ||
        (teacher.teacherName || '').toLowerCase().includes(query) ||
        (teacher.phone || '').includes(query) ||
        (teacher.email || '').toLowerCase().includes(query) ||
        (teacher.qualification || '').toLowerCase().includes(query);

      const matchesGroup =
        groupFilter === 'ALL' ||
        (teacher.assignedGroups || []).includes(groupFilter);

      const matchesStatus = statusFilter === 'ALL' || teacher.status === statusFilter;

      return matchesQuery && matchesGroup && matchesStatus;
    });
  }, [teachers, searchQuery, groupFilter, statusFilter]);

  const isFilterActive = searchQuery !== '' || groupFilter !== 'ALL' || statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setGroupFilter('ALL');
    setStatusFilter('ALL');
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacherId) return;
    setDeleting(true);
    try {
      await deleteTeacher(deletingTeacherId);
      setDeletingTeacherId(null);
      setSuccessMessage(`Teacher record for "${deletingTeacherName}" has been permanently deleted.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Delete teacher failed:', err);
      alert(err.message || 'Failed to delete teacher record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Honey Bees Staff & Faculty
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Teachers Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage teachers, group assignments (Playgroup, Pre-KG, LKG, UKG), and contact details.
          </p>
        </div>

        <Link
          to="/school/teachers/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>Add Teacher</span>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Total Teachers
          </span>
          <span className="font-display font-extrabold text-2xl text-slate-900 mt-1 block">
            {stats.total}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Active Teachers
          </span>
          <span className="font-display font-extrabold text-2xl text-emerald-900 mt-1 block">
            {stats.active}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Inactive / On Leave
          </span>
          <span className="font-display font-extrabold text-2xl text-slate-700 mt-1 block">
            {stats.inactive}
          </span>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teacher by name, phone, email, or qualification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value as 'ALL' | SchoolGroup)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Groups</option>
              {SCHOOL_GROUPS.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TeacherStatus)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-900">
              {filteredTeachers.length} {filteredTeachers.length === 1 ? 'Teacher' : 'Teachers'}
            </span>
            {isFilterActive && <span className="text-slate-500">(filtered from {teachers.length} total)</span>}
          </div>

          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="space-y-2 w-1/3">
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-24 animate-pulse" />
              <div className="h-8 bg-slate-100 rounded-lg w-20 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              {isFilterActive ? 'No teachers match your search' : 'No teachers added yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {isFilterActive
                ? 'Try adjusting your search or filter criteria.'
                : 'Add your first teacher to assign them to Playgroup, Pre-KG, LKG, or UKG.'}
            </p>
          </div>
          <div className="pt-2">
            {isFilterActive ? (
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/school/teachers/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add First Teacher</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Teacher</th>
                  <th className="py-3.5 px-4">Assigned Groups</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredTeachers.map((teacher) => {
                  const cleanPhone = (teacher.phone || '').replace(/[^0-9]/g, '');
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/school/teachers/${teacher.id}`}
                          className="font-bold text-slate-900 hover:text-amber-700 transition-colors block"
                        >
                          {teacher.teacherName}
                        </Link>
                        {teacher.qualification && (
                          <span className="text-xs text-slate-500 block mt-0.5">
                            {teacher.qualification}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(teacher.assignedGroups || []).length > 0 ? (
                            teacher.assignedGroups.map((grp) => (
                              <span
                                key={grp}
                                className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                                  SCHOOL_GROUP_META[grp]?.badgeClass || 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}
                              >
                                {grp}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">None assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{teacher.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                        {teacher.email && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Mail className="w-3 h-3" /> {teacher.email}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            teacher.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-600">
                        {teacher.joiningDate || '—'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/school/teachers/${teacher.id}`}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Teacher Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/school/teachers/${teacher.id}`}
                            className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Teacher Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setDeletingTeacherId(teacher.id || null);
                              setDeletingTeacherName(teacher.teacherName);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Teacher Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Cards */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeachers.map((teacher) => {
              const cleanPhone = (teacher.phone || '').replace(/[^0-9]/g, '');
              return (
                <div
                  key={teacher.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900">
                          <Link to={`/school/teachers/${teacher.id}`} className="hover:underline">
                            {teacher.teacherName}
                          </Link>
                        </h3>
                        {teacher.qualification && (
                          <p className="text-xs text-slate-500 mt-0.5">{teacher.qualification}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          teacher.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(teacher.assignedGroups || []).map((grp) => (
                        <span
                          key={grp}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                            SCHOOL_GROUP_META[grp]?.badgeClass || 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {grp}
                        </span>
                      ))}
                    </div>

                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 w-full justify-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{teacher.phone}</span>
                      </a>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/school/teachers/${teacher.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View / Edit</span>
                    </Link>
                    <button
                      onClick={() => {
                        setDeletingTeacherId(teacher.id || null);
                        setDeletingTeacherName(teacher.teacherName);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deletingTeacherId && (
        <div
          onClick={() => setDeletingTeacherId(null)}
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
                Are you sure you want to delete <strong className="text-slate-900">"{deletingTeacherName}"</strong>? This record will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setDeletingTeacherId(null)}
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

