import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  X, 
  IndianRupee, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Lock,
  Unlock,
  Check,
  MessageCircle,
  Zap,
  Send
} from 'lucide-react';
import { TuitionStudent } from '../types/student';
import { FeeRecord, FeeRecordInput, PaymentStatus, PaymentMethod } from '../types/fee';
import { GeneralSettings } from '../types/settings';
import { subscribeToStudents } from '../services/studentService';
import { 
  createFeeRecord, 
  updateFeeRecord, 
  deleteFeeRecord, 
  subscribeToFeeRecords,
  calculateStudentLedger,
  formatMonthKey,
  StudentFeeLedger
} from '../services/feeService';
import { getGeneralSettings, saveGeneralSettings } from '../services/settingsService';
import { getFeeReminderWhatsAppUrl, getPaymentReceiptWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppBotModal } from '../components/WhatsAppBotModal';
import { getWhatsAppBotStatus, sendBulkAutomatedWhatsApp, sendAutomatedWhatsAppMessage } from '../services/whatsappBotService';

export const StaffFeesPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthKey = todayStr.substring(0, 7); // "YYYY-MM"

  const [students, setStudents] = useState<TuitionStudent[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'PAID'>('ALL');

  // Expanded student ledger cards (student ID set)
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  // WhatsApp Bot state
  const [showBotManagerModal, setShowBotManagerModal] = useState(false);
  const [botConnected, setBotConnected] = useState(false);
  const [sendingBulkReminders, setSendingBulkReminders] = useState(false);

  useEffect(() => {
    getWhatsAppBotStatus().then((res) => {
      setBotConnected(res.status === 'CONNECTED');
    });
  }, [showBotManagerModal]);

  // Record / Edit Payment Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FeeRecordInput>({
    studentId: '',
    amount: 1500,
    paymentDate: todayStr,
    targetMonth: currentMonthKey,
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Academic Year toggle loading state
  const [togglingAcademicYear, setTogglingAcademicYear] = useState(false);

  // Subscribe to students, feeRecords, and settings
  useEffect(() => {
    setLoading(true);
    const unsubStudents = subscribeToStudents((data) => setStudents(data));
    const unsubFees = subscribeToFeeRecords(
      (data) => {
        setFeeRecords(data);
        setLoading(false);
      },
      (err) => {
        console.error('Fee records fetch error:', err);
        setError('Failed to load fee transaction records.');
        setLoading(false);
      }
    );

    getGeneralSettings().then((s) => {
      if (s) setSettings(s);
    });

    return () => {
      unsubStudents();
      unsubFees();
    };
  }, []);

  // Map studentId -> TuitionStudent
  const studentMap = useMemo(() => {
    const map = new Map<string, TuitionStudent>();
    students.forEach((s) => {
      if (s.id) map.set(s.id, s);
    });
    return map;
  }, [students]);

  // Derived available classes
  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(students.map((s) => (s.class || '').trim()).filter(Boolean)));
    return classes.sort();
  }, [students]);

  // Calculate full fee ledger for every student
  const studentLedgers = useMemo(() => {
    return students.map((student) => 
      calculateStudentLedger(student, feeRecords, settings?.academicYearClosed)
    );
  }, [students, feeRecords, settings]);

  // Filtered Ledgers
  const filteredLedgers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return studentLedgers.filter((ledger) => {
      const s = ledger.student;
      const matchesQuery = 
        !query ||
        s.studentName.toLowerCase().includes(query) ||
        (s.guardianName || '').toLowerCase().includes(query) ||
        (s.class || '').toLowerCase().includes(query);

      const matchesClass = 
        classFilter === 'ALL' || 
        (s.class || '').trim().toLowerCase() === classFilter.trim().toLowerCase();

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'OVERDUE' && ledger.totalDueAllTime > 0) ||
        (statusFilter === 'PAID' && ledger.totalDueAllTime === 0);

      return matchesQuery && matchesClass && matchesStatus;
    });
  }, [studentLedgers, searchQuery, classFilter, statusFilter]);

  // Overall Financial Stats across filtered view
  const totalCollectedAllTime = useMemo(() => {
    return feeRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [feeRecords]);

  const totalOutstandingDue = useMemo(() => {
    return studentLedgers.reduce((sum, l) => sum + l.totalDueAllTime, 0);
  }, [studentLedgers]);

  const totalOverdueStudents = useMemo(() => {
    return studentLedgers.filter((l) => l.totalDueAllTime > 0).length;
  }, [studentLedgers]);

  // Expand / Collapse student ledger card
  const toggleExpandStudent = (studentId: string) => {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  // Open Payment Modal for a specific student and month
  const openPaymentModalForMonth = (student: TuitionStudent, monthKey: string, dueAmount: number) => {
    setEditingRecordId(null);
    setFormError(null);
    setFormState({
      studentId: student.id || '',
      amount: dueAmount > 0 ? dueAmount : student.monthlyFee || 1500,
      paymentDate: todayStr,
      targetMonth: monthKey,
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      notes: `Fee for ${formatMonthKey(monthKey)}`,
    });
    setIsModalOpen(true);
  };

  // Open Edit Payment Modal
  const openEditModal = (record: FeeRecord) => {
    if (!record.id) return;
    setEditingRecordId(record.id);
    setFormError(null);
    setFormState({
      studentId: record.studentId,
      amount: record.amount,
      paymentDate: record.paymentDate || todayStr,
      targetMonth: record.targetMonth || currentMonthKey,
      paymentStatus: record.paymentStatus || 'Paid',
      paymentMethod: record.paymentMethod || 'Cash',
      notes: record.notes || '',
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.studentId) {
      setFormError('Please select a student.');
      return;
    }
    if (!formState.amount || formState.amount <= 0) {
      setFormError('Please enter a valid payment amount.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingRecordId) {
        await updateFeeRecord(editingRecordId, formState);
        setSuccessMessage('Fee payment transaction updated successfully.');
      } else {
        await createFeeRecord(formState);
        setSuccessMessage(`Payment of ₹${formState.amount} recorded successfully.`);
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Save fee record error:', err);
      setFormError(err.message || 'Failed to save fee record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Payment Record
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteFeeRecord(deletingId);
      setDeletingId(null);
      setSuccessMessage('Payment record deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Delete fee error:', err);
      alert(err.message || 'Failed to delete fee record.');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Academic Year Fee Closure
  const handleToggleAcademicYearClosure = async () => {
    const isCurrentlyClosed = !!settings?.academicYearClosed;
    const confirmMsg = isCurrentlyClosed
      ? 'Reopen fee payment collection for the current Academic Year?'
      : 'Are you sure you want to CLOSE fee payment collection for the current Academic Year? This halts recurring monthly fee due accumulation for staff.';

    if (!window.confirm(confirmMsg)) return;

    setTogglingAcademicYear(true);
    try {
      const updated = {
        centerName: settings?.centerName || 'Honey Bees Tuition Center',
        contactNumber: settings?.contactNumber || '8667330368',
        address: settings?.address || '',
        academicYearClosed: !isCurrentlyClosed,
        academicYearName: settings?.academicYearName || '2026-2027',
      };
      await saveGeneralSettings(updated);
      setSettings(updated);
      setSuccessMessage(
        !isCurrentlyClosed
          ? 'Academic Year Fee Payment Collection has been CLOSED.'
          : 'Academic Year Fee Payment Collection has been REOPENED.'
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Academic year closure error:', err);
      alert(err.message || 'Failed to update Academic Year setting.');
    } finally {
      setTogglingAcademicYear(false);
    }
  };

  // 1-Click Automated Background Bulk Fee Overdue Reminders
  const handleBulkOverdueWhatsAppSend = async (ledgersWithOverdue: StudentFeeLedger[]) => {
    if (ledgersWithOverdue.length === 0) return;
    setSendingBulkReminders(true);

    const items = ledgersWithOverdue
      .filter((l) => l.student.whatsapp)
      .map((l) => {
        const studentName = l.student.studentName;
        const dueAmount = l.totalDueAllTime;
        const unpaidMonthsText = l.monthStatuses
          .filter((m) => m.status !== 'Paid')
          .map((m) => m.monthName)
          .join(', ');
        const monthContext = unpaidMonthsText ? `for ${unpaidMonthsText}` : 'for recent tuition classes';
        const msg = `Dear Parent, This is a gentle reminder from Honey Bees Tuition Center that tuition fees for ${studentName} ${monthContext} (Total Due: ₹${dueAmount.toLocaleString('en-IN')}) are pending after the 15th of the month. Kindly arrange for payment at your earliest convenience. Thank you!`;
        return {
          phone: l.student.whatsapp!,
          message: msg,
          studentName
        };
      });

    if (items.length === 0) {
      alert('No students with overdue fees have WhatsApp phone numbers recorded.');
      setSendingBulkReminders(false);
      return;
    }

    try {
      const res = await sendBulkAutomatedWhatsApp(items);
      setSuccessMessage(`🚀 1-Click Bulk Dispatch Complete! Sent ${res.sentCount} of ${res.total} WhatsApp fee overdue reminders.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Bulk fee reminder error:', err);
      setError(err.message || 'Failed to send bulk automated fee reminders.');
    } finally {
      setSendingBulkReminders(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header & Academic Year Action */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Honey Bees Tuition Center
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Tuition Fee Management & Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track monthly fee cycles starting from joining date, partial payments, and overdue balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          {/* WhatsApp Bot Manager Button */}
          <button
            onClick={() => setShowBotManagerModal(true)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              botConnected
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title="Manage 0-Click Automated WhatsApp Microservice (Scan QR Code)"
          >
            <Zap className={`w-4 h-4 ${botConnected ? 'text-emerald-600 fill-emerald-500' : 'text-amber-600'}`} />
            <span>{botConnected ? 'WhatsApp Bot Active' : 'Setup WhatsApp Bot'}</span>
          </button>

          {/* Academic Year Closure Button */}
          <button
            onClick={handleToggleAcademicYearClosure}
            disabled={togglingAcademicYear}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
              settings?.academicYearClosed
                ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {settings?.academicYearClosed ? (
              <>
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Academic Year Closed (Click to Reopen)</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-slate-600" />
                <span>Close Academic Year Fees</span>
              </>
            )}
          </button>

          {/* Record General Payment Button */}
          <button
            onClick={() => {
              if (students.length > 0) {
                openPaymentModalForMonth(students[0], currentMonthKey, students[0].monthlyFee || 1500);
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Academic Year Closed Alert Banner */}
      {settings?.academicYearClosed && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Academic Year Fee Collection Closed:</strong> Recurring monthly fee due accumulation is paused for the current academic session. Staff can still view ledgers and record existing payments.
            </span>
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Collected Fees
          </span>
          <div className="flex items-center gap-1 text-slate-900">
            <IndianRupee className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
            <span className="font-display font-extrabold text-2xl">
              {totalCollectedAllTime.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">Total fees received from students</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Outstanding Balance
          </span>
          <div className="flex items-center gap-1 text-rose-700">
            <IndianRupee className="w-5 h-5 text-rose-600 stroke-[2.5]" />
            <span className="font-display font-extrabold text-2xl">
              {totalOutstandingDue.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">Across all unpaid & partial months</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Students with Overdue Fees
          </span>
          <div className="flex items-center justify-between">
            <div className="font-display font-extrabold text-2xl text-amber-800">
              {totalOverdueStudents} <span className="text-xs font-normal text-slate-500">of {students.length} Enrolled</span>
            </div>

            {totalOverdueStudents > 0 && (
              <button
                onClick={() => {
                  const overdueLedgers = studentLedgers.filter((l) => l.totalDueAllTime > 0);
                  if (botConnected) {
                    handleBulkOverdueWhatsAppSend(overdueLedgers);
                  } else {
                    setShowBotManagerModal(true);
                  }
                }}
                disabled={sendingBulkReminders}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Send automated WhatsApp fee reminders to all parents of students with pending balances"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{sendingBulkReminders ? 'Sending...' : `Auto Remind (${totalOverdueStudents})`}</span>
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 block">Requires payment follow-up</span>
        </div>

      </div>

      {/* Toolbar & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, class, or parent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="md:col-span-3 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-4 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none cursor-pointer"
            >
              <option value="ALL">All Students ({students.length})</option>
              <option value="OVERDUE">Has Overdue / Unpaid Fees ({totalOverdueStudents})</option>
              <option value="PAID">Fully Paid Up to Date</option>
            </select>
          </div>

        </div>

        {/* Counter */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>
            Showing <strong className="text-slate-900">{filteredLedgers.length}</strong> student ledgers
          </span>
          {(searchQuery || classFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setClassFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-amber-700 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* STUDENT FEE LEDGER CARDS LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-slate-700 text-sm">Calculating Monthly Student Ledgers...</p>
        </div>
      ) : filteredLedgers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
          <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-slate-900">No Student Fee Ledgers Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {students.length === 0
              ? 'No tuition students exist in Cloud Firestore yet.'
              : 'No students match your active filter settings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLedgers.map((ledger) => {
            const student = ledger.student;
            const isExpanded = expandedStudents.has(student.id || '');
            const hasDue = ledger.totalDueAllTime > 0;

            return (
              <div
                key={student.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  hasDue ? 'border-amber-300/80 ring-1 ring-amber-400/20' : 'border-slate-200'
                }`}
              >
                {/* Student Card Summary Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Student info */}
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold shrink-0 mt-0.5">
                      {student.class || 'N/A'}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-slate-900">
                          {student.studentName}
                        </h3>
                        {student.joiningDate && (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Joined: {student.joiningDate}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-0.5">
                        Parent: <strong>{student.guardianName || '—'}</strong>
                        {student.whatsapp ? ` • WhatsApp: ${student.whatsapp}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Right: Balance Overview & Controls */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    
                    <div className="text-left md:text-right space-y-0.5">
                      <div className="text-xs text-slate-500 font-medium">
                        Monthly Fee: <strong className="text-slate-900">₹{ledger.totalMonthlyFee}</strong>
                      </div>
                      <div>
                        {hasDue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Due Balance: ₹{ledger.totalDueAllTime.toLocaleString('en-IN')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span>Fully Paid Up to Date</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toggle Expand Details & WhatsApp Reminder */}
                    <div className="flex items-center gap-2">
                      {hasDue && student.whatsapp && (
                        <a
                          href={getFeeReminderWhatsAppUrl(student.whatsapp, student.studentName, ledger.totalDueAllTime)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                          title={`Send WhatsApp Overdue Fee Reminder to parent (${student.guardianName || student.studentName})`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Reminder</span>
                        </a>
                      )}

                      <button
                        onClick={() => student.id && toggleExpandStudent(student.id)}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Schedule' : 'Month Breakdown'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Expanded Month-by-Month Breakdown */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-5 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Monthly Fee Ledger (From {formatMonthKey(ledger.monthStatuses[0]?.monthKey || currentMonthKey)} to Current)
                      </h4>
                      <span className="text-xs text-slate-500">
                        Total Paid All-Time: <strong>₹{ledger.totalPaidAllTime.toLocaleString('en-IN')}</strong>
                      </span>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {ledger.monthStatuses.map((m) => (
                        <div
                          key={m.monthKey}
                          className={`p-3.5 rounded-xl border space-y-2.5 bg-white ${
                            m.status === 'Paid'
                              ? 'border-emerald-200'
                              : m.status === 'Partial'
                              ? 'border-amber-300 ring-1 ring-amber-300/30'
                              : 'border-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {m.monthName}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                m.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-950'
                                  : m.status === 'Partial'
                                  ? 'bg-amber-100 text-amber-950'
                                  : 'bg-rose-100 text-rose-950'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex justify-between">
                              <span>Fee:</span>
                              <span className="font-bold text-slate-800">₹{m.monthlyFee}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Paid:</span>
                              <span className="font-bold text-emerald-700">₹{m.paidAmount}</span>
                            </div>
                            {m.dueAmount > 0 && (
                              <div className="flex justify-between font-bold text-rose-700 pt-0.5 border-t border-slate-100">
                                <span>Due:</span>
                                <span>₹{m.dueAmount}</span>
                              </div>
                            )}
                          </div>

                          {/* Record / Clear Month Payment Action */}
                          <div className="pt-1">
                            <button
                              onClick={() => openPaymentModalForMonth(student, m.monthKey, m.dueAmount)}
                              className={`w-full py-1.5 font-bold rounded-lg text-xs transition-colors cursor-pointer ${
                                m.status === 'Paid'
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                              }`}
                            >
                              {m.status === 'Paid' ? 'Add Extra Payment' : `Pay ${m.monthName}`}
                            </button>
                          </div>

                          {/* Transaction History for this specific month */}
                          {m.records.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                              <span className="text-slate-400 font-bold block text-[10px]">Saved Transactions:</span>
                              {m.records.map((r) => (
                                <div key={r.id} className="flex items-center justify-between text-slate-700">
                                  <span>{r.paymentDate} ({r.paymentMethod})</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-900">₹{r.amount}</span>
                                    {student.whatsapp && (
                                      <a
                                        href={getPaymentReceiptWhatsAppUrl(student.whatsapp, student.studentName, r.amount, r.paymentDate, r.paymentMethod, r.notes)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:text-emerald-800 p-0.5"
                                        title="Send Payment Receipt on WhatsApp"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    <button onClick={() => openEditModal(r)} className="text-slate-400 hover:text-amber-800 p-0.5">
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => setDeletingId(r.id || null)} className="text-slate-400 hover:text-rose-600 p-0.5">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-xl text-slate-900">
                {editingRecordId ? 'Edit Fee Payment Transaction' : 'Record Student Fee Payment'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Select Student */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Tuition Student *
                </label>
                <select
                  required
                  value={formState.studentId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    const st = studentMap.get(sid);
                    setFormState({
                      ...formState,
                      studentId: sid,
                      amount: st && st.monthlyFee ? st.monthlyFee : formState.amount,
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Select Tuition Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} ({s.class}) - Monthly Fee: ₹{s.monthlyFee || 1500}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Target Month */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Target Fee Month (YYYY-MM) *
                  </label>
                  <input
                    type="month"
                    required
                    value={formState.targetMonth || currentMonthKey}
                    onChange={(e) => setFormState({ ...formState, targetMonth: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none"
                  />
                </div>

                {/* Amount Paid */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Amount Paid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={formState.amount}
                    onChange={(e) => setFormState({ ...formState, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Payment Date */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Payment Received Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.paymentDate}
                    onChange={(e) => setFormState({ ...formState, paymentDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formState.paymentMethod}
                    onChange={(e) => setFormState({ ...formState, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Notes / Receipt Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Receipt #104, partial payment balance..."
                  value={formState.notes || ''}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Payment Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div
          onClick={() => setDeletingId(null)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200 space-y-4"
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">Delete Fee Record?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to permanently delete this transaction record from Cloud Firestore?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP AUTOMATION BOT MANAGER MODAL */}
      <WhatsAppBotModal 
        isOpen={showBotManagerModal} 
        onClose={() => setShowBotManagerModal(false)} 
      />

    </div>
  );
};
