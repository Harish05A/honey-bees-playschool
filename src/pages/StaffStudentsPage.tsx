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
  BookOpen,
  Calendar,
  School,
  User,
  CheckCircle2,
  ArrowUpDown,
  RefreshCw,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { TuitionStudent } from '../types/student';
import { subscribeToStudents, deleteStudent } from '../services/studentService';

type SortOption = 'recent' | 'name-asc' | 'name-desc';

export const StaffStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<TuitionStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Delete modal state
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [deletingStudentName, setDeletingStudentName] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load Firestore data with real-time subscription
  const loadData = () => {
    setLoading(true);
    setError(null);
    return subscribeToStudents(
      (data) => {
        setStudents(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore subscription error:", err);
        setError("Unable to load student directory. Please check your internet connection or try again.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    const unsubscribe = loadData();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingStudentId) return;

    setDeleting(true);
    try {
      await deleteStudent(deletingStudentId);
      setDeletingStudentId(null);
      setSuccessMessage(`Student record for "${deletingStudentName}" has been permanently deleted.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || 'Failed to delete student record.');
    } finally {
      setDeleting(false);
    }
  };

  // Derive available classes dynamically from student data
  const availableClasses = useMemo(() => {
    const classes = Array.from(
      new Set(
        students
          .map((s) => (s.class || '').trim())
          .filter((c) => c.length > 0)
      )
    );
    // Sort classes logically (Class 1..12 or LKG/UKG)
    return classes.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [students]);

  // Filter & Sort student records
  const filteredAndSortedStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    const filtered = students.filter((student) => {
      const matchesQuery = 
        !query ||
        (student.studentName || '').toLowerCase().includes(query) ||
        (student.guardianName || '').toLowerCase().includes(query) ||
        (student.schoolName || '').toLowerCase().includes(query) ||
        (student.whatsapp || '').includes(query);

      const matchesClass = 
        classFilter === 'ALL' || 
        (student.class || '').trim().toLowerCase() === classFilter.trim().toLowerCase();

      return matchesQuery && matchesClass;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return (a.studentName || '').localeCompare(b.studentName || '');
      }
      if (sortBy === 'name-desc') {
        return (b.studentName || '').localeCompare(a.studentName || '');
      }
      // 'recent' - sort by createdAt timestamp or joiningDate string
      const getTime = (s: TuitionStudent) => {
        if (s.createdAt && typeof (s.createdAt as any).toDate === 'function') {
          return (s.createdAt as any).toDate().getTime();
        }
        if (s.createdAt instanceof Date) {
          return s.createdAt.getTime();
        }
        if (s.joiningDate) {
          const parsed = Date.parse(s.joiningDate);
          if (!isNaN(parsed)) return parsed;
        }
        return 0;
      };
      return getTime(b) - getTime(a);
    });
  }, [students, searchQuery, classFilter, sortBy]);

  const isFilterActive = searchQuery !== '' || classFilter !== 'ALL' || sortBy !== 'recent';

  const resetFilters = () => {
    setSearchQuery('');
    setClassFilter('ALL');
    setSortBy('recent');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Honey Bees Tuition Center
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Student Directory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View and manage students enrolled at Honey Bees Tuition Center.
          </p>
        </div>

        <Link
          to="/staff/students/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>Add Student</span>
        </Link>
      </div>

      {/* 2. Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)} 
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Firestore Error Alert */}
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

      {/* 4. Search, Filter & Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Bar */}
          <div className="md:col-span-6 relative">
            <label htmlFor="student-search" className="sr-only">Search students</label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="student-search"
              type="text"
              placeholder="Search student, parent, school, or WhatsApp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="md:col-span-3 relative">
            <label htmlFor="class-filter" className="sr-only">Filter by class</label>
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="class-filter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Classes ({students.length})</option>
              {availableClasses.map((cls) => {
                const count = students.filter((s) => (s.class || '').trim() === cls).length;
                return (
                  <option key={cls} value={cls}>
                    {cls} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="md:col-span-3 relative">
            <label htmlFor="sort-by" className="sr-only">Sort student directory</label>
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="name-asc">Student Name (A – Z)</option>
              <option value="name-desc">Student Name (Z – A)</option>
            </select>
          </div>

        </div>

        {/* Dynamic Count & Active Filter Indicator */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-900">
              {filteredAndSortedStudents.length} {filteredAndSortedStudents.length === 1 ? 'Student' : 'Students'}
            </span>
            {isFilterActive && (
              <span className="text-slate-500">
                (filtered from {students.length} total)
              </span>
            )}
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

      {/* 5. Main Content Area */}
      {loading ? (
        /* Loading Skeleton State */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-1/6 animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="space-y-2 w-1/3">
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-16 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-slate-100 rounded-lg w-20 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedStudents.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              {isFilterActive ? 'No students match your search' : 'No students enrolled yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {isFilterActive 
                ? 'Try adjusting your search criteria or clear active filters to view all student records.'
                : 'Get started by creating your first student profile in the tuition center directory.'}
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
                to="/staff/students/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add First Student</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW: Data Table (Visible on lg screens and up) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">School</th>
                  <th className="py-3.5 px-4">Parent / Guardian</th>
                  <th className="py-3.5 px-4">WhatsApp</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredAndSortedStudents.map((student) => {
                  const cleanWhatsApp = (student.whatsapp || '').replace(/[^0-9]/g, '');
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Student Name */}
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <Link 
                          to={`/staff/students/${student.id}`} 
                          className="hover:text-amber-700 transition-colors font-bold"
                        >
                          {student.studentName}
                        </Link>
                        {student.dateOfBirth && (
                          <span className="block text-xs font-normal text-slate-500 mt-0.5">
                            DOB: {student.dateOfBirth}
                          </span>
                        )}
                      </td>

                      {/* Class Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold">
                          {student.class || 'N/A'}
                        </span>
                      </td>

                      {/* School Name */}
                      <td className="py-4 px-4 text-slate-700">
                        {student.schoolName || '—'}
                      </td>

                      {/* Parent / Guardian */}
                      <td className="py-4 px-4 text-slate-700">
                        {student.guardianName || '—'}
                      </td>

                      {/* WhatsApp Link */}
                      <td className="py-4 px-4">
                        {cleanWhatsApp ? (
                          <a
                            href={`https://wa.me/${cleanWhatsApp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-md transition-colors"
                            title={`Chat with ${student.guardianName || student.studentName} on WhatsApp`}
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{student.whatsapp}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Joining Date */}
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {student.joiningDate || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/staff/students/${student.id}`}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/staff/students/${student.id}`}
                            className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Student Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => {
                              setDeletingStudentId(student.id || null);
                              setDeletingStudentName(student.studentName);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Student Record"
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

          {/* MOBILE & TABLET VIEW: Compact Cards (Visible below lg screens) */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedStudents.map((student) => {
              const cleanWhatsApp = (student.whatsapp || '').replace(/[^0-9]/g, '');
              return (
                <div
                  key={student.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  {/* Top Header Row */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900">
                          <Link to={`/staff/students/${student.id}`} className="hover:underline">
                            {student.studentName}
                          </Link>
                        </h3>
                        {student.schoolName && (
                          <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                            <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{student.schoolName}</span>
                          </p>
                        )}
                      </div>
                      
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold shrink-0">
                        {student.class || 'N/A'}
                      </span>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Guardian</span>
                        <span className="font-medium text-slate-800">{student.guardianName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Joined</span>
                        <span className="font-medium text-slate-800">{student.joiningDate || '—'}</span>
                      </div>
                    </div>

                    {/* WhatsApp Action Button */}
                    {cleanWhatsApp && (
                      <div className="pt-2">
                        <a
                          href={`https://wa.me/${cleanWhatsApp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 w-full justify-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp: {student.whatsapp}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/staff/students/${student.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </Link>

                    <Link
                      to={`/staff/students/${student.id}`}
                      className="p-2 text-slate-600 hover:text-amber-800 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl transition-colors"
                      title="Edit Student Record"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => {
                        setDeletingStudentId(student.id || null);
                        setDeletingStudentName(student.studentName);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Delete Student Record"
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

      {/* 6. Professional Delete Confirmation Modal */}
      {deletingStudentId && (
        <div
          onClick={() => setDeletingStudentId(null)}
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
              <h3 className="font-display font-bold text-xl text-slate-900">Delete Student?</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to delete the student record for <strong className="text-slate-900">"{deletingStudentName}"</strong>? This record will be permanently removed from Cloud Firestore.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setDeletingStudentId(null)}
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

