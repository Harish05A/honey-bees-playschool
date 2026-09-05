import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  BookOpen, 
  ArrowRight, 
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  School,
  Calendar,
  Layers,
  UserPlus
} from 'lucide-react';
import { TuitionStudent } from '../types/student';
import { subscribeToStudents } from '../services/studentService';

export const StaffDashboardPage: React.FC = () => {
  const [students, setStudents] = useState<TuitionStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Firestore real-time listener with manual retry support
  const setupListener = useCallback(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToStudents(
      (data) => {
        setStudents(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore dashboard listener error:", err);
        setError("Unable to load tuition student data. Please check your connection or Firestore status.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = setupListener();
    return () => unsubscribe();
  }, [setupListener]);

  // Dynamic calculations strictly from Firestore documents
  const totalStudents = students.length;

  // Group students by Class
  const classCounts = students.reduce((acc, student) => {
    const className = student.class && student.class.trim() ? student.class.trim() : 'Unspecified';
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedClasses = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);
  const distinctClassesCount = Object.keys(classCounts).length;

  // Recently added students (ordered by createdAt from query)
  const recentStudents = students.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* 1. HEADER / WELCOME CONTEXT AREA */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-950 font-bold text-xs rounded-full border border-amber-300/70">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Honey Bees Tuition Center Staff Portal</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Administrative Dashboard
          </h1>

          <p className="text-xs sm:text-sm font-sans text-slate-600">
            Real-time enrollment counts, class distribution, and quick student record management
          </p>
        </div>

        {/* 5. QUICK ACTIONS CLUSTER */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/staff/students/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-amber-600/30"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>Add Student</span>
          </Link>

          <Link
            to="/staff/students"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-amber-50 text-slate-800 font-display font-bold text-xs uppercase tracking-wider rounded-2xl border border-amber-200 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4 text-amber-800" />
            <span>View Directory</span>
          </Link>
        </div>
      </div>

      {/* 11. ERROR STATE WITH RETRY ACTION */}
      {error && (
        <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-3xl text-rose-900 text-sm font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>

          <button
            onClick={setupListener}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 2. STUDENT OVERVIEW METRICS (REAL FIRESTORE DATA) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1: Total Tuition Students */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Tuition Students
            </span>
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {loading ? (
            <div className="h-10 w-24 bg-amber-100/60 rounded-xl animate-pulse" />
          ) : (
            <div className="font-display font-extrabold text-4xl text-slate-900">
              {totalStudents}
            </div>
          )}

          <p className="text-xs text-slate-500 font-sans">
            {loading ? 'Fetching from Firestore...' : totalStudents === 1 ? '1 active student document' : `${totalStudents} active student documents in Firestore`}
          </p>
        </div>

        {/* Metric 2: Active Class Batches */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Class Batches Represented
            </span>
            <div className="p-2.5 bg-orange-100 text-orange-950 rounded-2xl border border-orange-300">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {loading ? (
            <div className="h-10 w-24 bg-amber-100/60 rounded-xl animate-pulse" />
          ) : (
            <div className="font-display font-extrabold text-4xl text-slate-900">
              {distinctClassesCount}
            </div>
          )}

          <p className="text-xs text-slate-500 font-sans truncate">
            {loading ? 'Calculating classes...' : distinctClassesCount === 0 ? 'No active classes' : `Classes: ${Object.keys(classCounts).join(', ')}`}
          </p>
        </div>

        {/* Metric 3: Recent Enrollments Count */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Activity Focus
            </span>
            <div className="p-2.5 bg-emerald-100 text-emerald-950 rounded-2xl border border-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          {loading ? (
            <div className="h-10 w-24 bg-amber-100/60 rounded-xl animate-pulse" />
          ) : (
            <div className="font-display font-extrabold text-4xl text-slate-900">
              {recentStudents.length}
            </div>
          )}

          <div className="pt-1">
            <Link
              to="/staff/students"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 hover:underline"
            >
              <span>Manage Full Student Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 3 & 4. CLASS DISTRIBUTION & RECENT ENROLLMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 3. CLASS DISTRIBUTION (5 Columns) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Class Distribution
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Student count per grade level
              </p>
            </div>
            <span className="text-[11px] font-extrabold text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300/60">
              Live Counts
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-4 bg-amber-100/60 rounded-lg animate-pulse" />
              <div className="h-4 bg-amber-100/60 rounded-lg animate-pulse w-3/4" />
              <div className="h-4 bg-amber-100/60 rounded-lg animate-pulse w-1/2" />
            </div>
          ) : sortedClasses.length === 0 ? (
            /* 10. EMPTY STATE */
            <div className="py-8 text-center text-xs text-slate-500 font-sans space-y-2">
              <BookOpen className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="font-bold text-slate-800">No tuition students enrolled yet.</p>
              <p className="text-slate-500 max-w-xs mx-auto">
                Add your first student to start building tuition center class metrics.
              </p>
              <div className="pt-2">
                <Link
                  to="/staff/students/new"
                  className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-600 transition-colors"
                >
                  Add Student
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {sortedClasses.map(([className, count]) => {
                const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                return (
                  <div key={className} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span className="font-display">{className}</span>
                      <span>{count} {count === 1 ? 'student' : 'students'} ({percentage}%)</span>
                    </div>

                    <div className="w-full h-3 bg-amber-50 rounded-full overflow-hidden border border-amber-200/80">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. RECENTLY ENROLLED STUDENTS (7 Columns) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Recently Enrolled Students
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Latest records added to Cloud Firestore
              </p>
            </div>

            <Link
              to="/staff/students"
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>View All Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-12 bg-amber-100/60 rounded-2xl animate-pulse" />
              <div className="h-12 bg-amber-100/60 rounded-2xl animate-pulse" />
              <div className="h-12 bg-amber-100/60 rounded-2xl animate-pulse" />
            </div>
          ) : recentStudents.length === 0 ? (
            /* 10. EMPTY STATE */
            <div className="py-10 text-center text-xs text-slate-500 font-sans space-y-3">
              <Users className="w-10 h-10 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm">No tuition students yet</p>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Add your first student to start building the tuition records.
                </p>
              </div>
              <div className="pt-1">
                <Link
                  to="/staff/students/new"
                  className="inline-block px-5 py-2.5 bg-amber-500 text-slate-950 font-display font-bold rounded-xl text-xs hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Add Student
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-sans">
              {recentStudents.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-100/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-slate-900">
                        {s.studentName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-bold text-[10px] border border-amber-300/60">
                        {s.class || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span>Guardian: <strong className="text-slate-800">{s.guardianName || 'N/A'}</strong></span>
                      {s.schoolName && (
                        <>
                          <span className="text-amber-300">•</span>
                          <span className="flex items-center gap-1">
                            <School className="w-3.5 h-3.5 text-amber-600" />
                            <span>{s.schoolName}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/staff/students/${s.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-950 font-bold rounded-xl border border-amber-200 text-xs transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
