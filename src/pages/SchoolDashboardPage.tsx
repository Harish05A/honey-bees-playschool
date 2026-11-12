import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  UserPlus,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Wallet,
  MessageCircle,
  ArrowRight,
  Users
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup, SchoolStudent } from '../types/schoolStudent';
import { Teacher } from '../types/teacher';
import { subscribeToSchoolStudents } from '../services/schoolStudentService';
import { subscribeToTeachers } from '../services/teacherService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const SchoolDashboardPage: React.FC = () => {
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubStudents = subscribeToSchoolStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    const unsubTeachers = subscribeToTeachers((data) => {
      setTeachers(data);
    });
    return () => {
      unsubStudents();
      unsubTeachers();
    };
  }, []);

  const groupCounts = useMemo(() => {
    const counts: Record<SchoolGroup, number> = {
      Playgroup: 0,
      'Pre-KG': 0,
      LKG: 0,
      UKG: 0,
    };
    students.forEach((s) => {
      if (s.group in counts) counts[s.group] += 1;
    });
    return counts;
  }, [students]);

  const activeTeachersCount = useMemo(
    () => teachers.filter((t) => t.status === 'Active').length,
    [teachers]
  );

  const recentStudents = students.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-950 font-bold text-xs rounded-full border border-amber-300/70">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Honey Bees Play School Portal</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Play School Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-sans text-slate-600">
            Manage Playgroup, Pre-KG, LKG, and UKG students, attendance, fees, teachers, salaries, and WhatsApp messaging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/school/students/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all border border-amber-600/30"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>Add Student</span>
          </Link>

          <Link
            to="/school/teachers/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-amber-50 text-slate-800 font-display font-bold text-xs uppercase tracking-wider rounded-2xl border border-amber-200 transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-amber-800" />
            <span>Add Teacher</span>
          </Link>
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Students
          </span>
          <span className="font-display font-extrabold text-3xl text-slate-900 mt-1 block">
            {loading ? '—' : students.length}
          </span>
        </div>

        {SCHOOL_GROUPS.map((grp) => {
          const meta = SCHOOL_GROUP_META[grp];
          return (
            <Link
              key={grp}
              to="/school/students"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-sm transition-all"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {meta.label}
              </span>
              <span className="font-display font-extrabold text-3xl text-slate-900 mt-1 block">
                {loading ? '—' : groupCounts[grp]}
              </span>
              <span className="text-[10px] text-slate-400">{meta.ageHint}</span>
            </Link>
          );
        })}

        <Link
          to="/school/teachers"
          className="bg-white p-5 rounded-2xl border border-emerald-200 hover:border-emerald-300 shadow-sm transition-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Active Teachers
          </span>
          <span className="font-display font-extrabold text-3xl text-emerald-900 mt-1 block">
            {activeTeachersCount}
          </span>
          <span className="text-[10px] text-slate-400">{teachers.length} total staff</span>
        </Link>
      </div>

      {/* Quick Module Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/school/attendance"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-sm transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
            <span>Attendance</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500">Mark daily attendance & send absentee WhatsApp alerts.</p>
        </Link>

        <Link
          to="/school/fees"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-sm transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
            <span>Fees Management</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500">Track monthly school fees, receipts, and dues.</p>
        </Link>

        <Link
          to="/school/salaries"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-sm transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
            <span>Teacher Salaries</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500">Record monthly salary payouts & notify teachers.</p>
        </Link>

        <Link
          to="/school/messaging"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-sm transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
            <span>Messaging</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500">Send WhatsApp updates to parents by group or teachers.</p>
        </Link>
      </div>

      {/* Recent School Students */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            <span>Recently Enrolled School Students</span>
          </h2>
          <Link
            to="/school/students"
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentStudents.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-slate-300" />
            <span>No play school students enrolled yet.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentStudents.map((s) => (
              <Link
                key={s.id}
                to={`/school/students/${s.id}`}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <div>
                  <span className="font-bold text-sm text-slate-900 block">{s.studentName}</span>
                  <span className="text-xs text-slate-500">
                    Parent: {s.guardianName} {s.assignedTeacherName ? `• Teacher: ${s.assignedTeacherName}` : ''}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md border text-xs font-bold ${
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
    </div>
  );
};

