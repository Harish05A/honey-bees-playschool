import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { TuitionStudent } from '../types/student';
import { ClassAttendance } from '../types/attendance';
import { FeeRecord } from '../types/fee';
import { subscribeToStudents } from '../services/studentService';
import { subscribeToAttendance } from '../services/attendanceService';
import { subscribeToFeeRecords } from '../services/feeService';

export const StaffReportsPage: React.FC = () => {
  const [students, setStudents] = useState<TuitionStudent[]>([]);
  const [attendance, setAttendance] = useState<ClassAttendance[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const unsubStudents = subscribeToStudents((data) => setStudents(data));
    const unsubAttendance = subscribeToAttendance((data) => setAttendance(data));
    const unsubFees = subscribeToFeeRecords((data) => {
      setFees(data);
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubAttendance();
      unsubFees();
    };
  }, []);

  // Available classes derived dynamically
  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(students.map((s) => (s.class || '').trim()).filter(Boolean)));
    return classes.sort();
  }, [students]);

  // Map studentId -> TuitionStudent
  const studentMap = useMemo(() => {
    const map = new Map<string, TuitionStudent>();
    students.forEach((s) => {
      if (s.id) map.set(s.id, s);
    });
    return map;
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = classFilter === 'ALL' || (s.class || '').trim() === classFilter;
      return matchesClass;
    });
  }, [students, classFilter]);

  // Filtered Attendance
  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const matchesClass = classFilter === 'ALL' || (item.class || '').trim() === classFilter;
      const matchesFrom = !dateFrom || item.date >= dateFrom;
      const matchesTo = !dateTo || item.date <= dateTo;
      return matchesClass && matchesFrom && matchesTo;
    });
  }, [attendance, classFilter, dateFrom, dateTo]);

  // Filtered Fees
  const filteredFees = useMemo(() => {
    return fees.filter((item) => {
      const student = studentMap.get(item.studentId);
      const matchesClass = classFilter === 'ALL' || (student && (student.class || '').trim() === classFilter);
      const matchesFrom = !dateFrom || item.paymentDate >= dateFrom;
      const matchesTo = !dateTo || item.paymentDate <= dateTo;
      return matchesClass && matchesFrom && matchesTo;
    });
  }, [fees, studentMap, classFilter, dateFrom, dateTo]);

  // 1. Student Metrics
  const classBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      const c = s.class || 'Unassigned';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredStudents]);

  // 2. Attendance Metrics
  const attendanceMetrics = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalNA = 0;
    filteredAttendance.forEach((session) => {
      if (session.records) {
        session.records.forEach((r) => {
          if (r.status === 'Present') totalPresent++;
          if (r.status === 'Absent') totalAbsent++;
          if (r.status === 'N/A') totalNA++;
        });
      }
    });
    const totalActive = totalPresent + totalAbsent;
    const totalMarked = totalPresent + totalAbsent + totalNA;
    const percentage = totalActive > 0 ? Math.round((totalPresent / totalActive) * 100) : 0;

    return { totalPresent, totalAbsent, totalNA, totalMarked, percentage };
  }, [filteredAttendance]);

  // 3. Fee Metrics
  const feeMetrics = useMemo(() => {
    const totalAmount = filteredFees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const paidCount = filteredFees.filter((f) => f.paymentStatus === 'Paid').length;
    const pendingCount = filteredFees.filter((f) => f.paymentStatus === 'Pending' || f.paymentStatus === 'Partial').length;

    const methodMap: Record<string, number> = {};
    filteredFees.forEach((f) => {
      const m = f.paymentMethod || 'Other';
      methodMap[m] = (methodMap[m] || 0) + (f.amount || 0);
    });

    return { totalAmount, paidCount, pendingCount, methodMap };
  }, [filteredFees]);

  // CSV Export Generators
  const exportStudentsCSV = () => {
    const headers = ['Student Name', 'Class', 'School', 'Guardian Name', 'WhatsApp', 'Joining Date', 'Monthly Fee'];
    const rows = filteredStudents.map((s) => [
      `"${s.studentName}"`,
      `"${s.class}"`,
      `"${s.schoolName || ''}"`,
      `"${s.guardianName}"`,
      `"${s.whatsapp || ''}"`,
      `"${s.joiningDate || ''}"`,
      s.monthlyFee || 0,
    ]);
    downloadCSV('tuition_students_report.csv', [headers, ...rows]);
  };

  const exportFeesCSV = () => {
    const headers = ['Student Name', 'Class', 'Amount', 'Payment Date', 'Status', 'Method', 'Notes'];
    const rows = filteredFees.map((f) => {
      const s = studentMap.get(f.studentId);
      return [
        `"${s ? s.studentName : 'Unknown'}"`,
        `"${s ? s.class : ''}"`,
        f.amount,
        `"${f.paymentDate}"`,
        `"${f.paymentStatus}"`,
        `"${f.paymentMethod}"`,
        `"${f.notes || ''}"`,
      ];
    });
    downloadCSV('tuition_fees_report.csv', [headers, ...rows]);
  };

  const downloadCSV = (filename: string, data: (string | number)[][]) => {
    const csvContent = data.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setClassFilter('ALL');
  };

  const isFilterActive = dateFrom !== '' || dateTo !== '' || classFilter !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Honey Bees Tuition Center
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Live operational insights for tuition enrollment, class attendance rates, and fee collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportStudentsCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Students CSV</span>
          </button>
          <button
            onClick={exportFeesCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Export Fees CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Class Batch
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

        </div>

        {isFilterActive && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Filtering reports by date range or class</span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-amber-700 font-bold hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-slate-700 text-sm">Calculating Live Analytics from Firestore...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* SECTION 1: STUDENT ENROLLMENT REPORT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h2 className="font-display font-bold text-lg text-slate-900">Student Enrollment Overview</h2>
              </div>
              <span className="text-xs font-bold text-slate-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {filteredStudents.length} Students
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Class Breakdown List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Students per Class Batch
                </h3>
                {classBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No class data available</p>
                ) : (
                  <div className="space-y-2">
                    {classBreakdown.map(([cls, count]) => {
                      const pct = Math.round((count / filteredStudents.length) * 100);
                      return (
                        <div key={cls} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-800">
                            <span>{cls}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary Stats Box */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-600 font-medium">Total Registered Students</span>
                  <span className="font-bold text-slate-900 text-sm">{filteredStudents.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-600 font-medium">Active Class Batches</span>
                  <span className="font-bold text-slate-900 text-sm">{availableClasses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Average Students / Class</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {availableClasses.length > 0 ? Math.round(filteredStudents.length / availableClasses.length) : 0}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: ATTENDANCE SUMMARY REPORT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-600" />
                <h2 className="font-display font-bold text-lg text-slate-900">Attendance Metrics Report</h2>
              </div>
              <span className="text-xs font-bold text-slate-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {filteredAttendance.length} Saved Sessions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Present Markings
                </span>
                <span className="font-display font-extrabold text-2xl text-emerald-950">
                  {attendanceMetrics.totalPresent}
                </span>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-center space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  Absent Markings
                </span>
                <span className="font-display font-extrabold text-2xl text-rose-950">
                  {attendanceMetrics.totalAbsent}
                </span>
              </div>

              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  N/A (Exempt)
                </span>
                <span className="font-display font-extrabold text-2xl text-slate-900">
                  {attendanceMetrics.totalNA}
                </span>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-1">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Overall Attendance %
                </span>
                <span className="font-display font-extrabold text-2xl text-amber-950">
                  {attendanceMetrics.percentage}%
                </span>
              </div>

            </div>
          </div>

          {/* SECTION 3: FEES FINANCIAL REPORT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h2 className="font-display font-bold text-lg text-slate-900">Tuition Fees Revenue Report</h2>
              </div>
              <span className="text-xs font-bold text-slate-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                ₹{feeMetrics.totalAmount.toLocaleString('en-IN')} Total Collected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Payment Method Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Collections by Payment Method
                </h3>
                {Object.keys(feeMetrics.methodMap).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No fee payment data available</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(feeMetrics.methodMap).map(([method, amount]) => (
                      <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-800 text-xs">{method}</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Overview */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Transaction Receipt Statuses
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-200 text-xs">
                    <span className="text-slate-600 font-medium">Fully Paid Receipts</span>
                    <span className="font-bold text-emerald-700">{feeMetrics.paidCount} Transactions</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-xs">
                    <span className="text-slate-600 font-medium">Pending / Partial Receipts</span>
                    <span className="font-bold text-amber-700">{feeMetrics.pendingCount} Transactions</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
