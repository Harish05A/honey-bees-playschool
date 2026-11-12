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
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Zap,
  Send
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup, SchoolStudent } from '../types/schoolStudent';
import { FeeRecord, FeeRecordInput, PaymentMethod } from '../types/fee';
import { subscribeToSchoolStudents } from '../services/schoolStudentService';
import {
  createSchoolFeeRecord,
  updateSchoolFeeRecord,
  deleteSchoolFeeRecord,
  subscribeToSchoolFeeRecords,
  calculateSchoolStudentLedger,
  SchoolStudentFeeLedger
} from '../services/schoolFeeService';
import { formatMonthKey } from '../services/feeService';
import {
  getSchoolFeeReminderWhatsAppUrl,
  getSchoolPaymentReceiptWhatsAppUrl
} from '../utils/whatsapp';
import { WhatsAppBotModal } from '../components/WhatsAppBotModal';
import {
  getWhatsAppBotStatus,
  sendBulkAutomatedWhatsApp,
  sendAutomatedWhatsAppMessage
} from '../services/whatsappBotService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const SchoolFeesPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthKey = todayStr.substring(0, 7);

  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'ALL' | SchoolGroup>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'PAID'>('ALL');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const [showBotManagerModal, setShowBotManagerModal] = useState(false);
  const [botConnected, setBotConnected] = useState(false);
  const [sendingBulkReminders, setSendingBulkReminders] = useState(false);

  useEffect(() => {
    getWhatsAppBotStatus().then((res) => setBotConnected(res.status === 'CONNECTED'));
  }, [showBotManagerModal]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FeeRecordInput>({
    studentId: '',
    amount: 2500,
    paymentDate: todayStr,
    targetMonth: currentMonthKey,
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubStudents = subscribeToSchoolStudents((data) => setStudents(data));
    const unsubFees = subscribeToSchoolFeeRecords(
      (data) => {
        setFeeRecords(data);
        setLoading(false);
      },
      () => {
        setError('Failed to load school fee records.');
        setLoading(false);
      }
    );
    return () => {
      unsubStudents();
      unsubFees();
    };
  }, []);

  const ledgers: SchoolStudentFeeLedger[] = useMemo(() => {
    return students.map((s) => calculateSchoolStudentLedger(s, feeRecords));
  }, [students, feeRecords]);

  const filteredLedgers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ledgers
      .filter((l) => {
        const matchesSearch =
          !q ||
          l.student.studentName.toLowerCase().includes(q) ||
          l.student.guardianName.toLowerCase().includes(q) ||
          (l.student.whatsapp || '').includes(q);
        const matchesGroup = groupFilter === 'ALL' || l.student.group === groupFilter;
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'OVERDUE' && l.totalDueAllTime > 0) ||
          (statusFilter === 'PAID' && l.totalDueAllTime === 0);
        return matchesSearch && matchesGroup && matchesStatus;
      })
      .sort((a, b) => b.totalDueAllTime - a.totalDueAllTime);
  }, [ledgers, searchQuery, groupFilter, statusFilter]);

  const totals = useMemo(() => {
    return ledgers.reduce(
      (acc, l) => {
        acc.collected += l.totalPaidAllTime;
        acc.due += l.totalDueAllTime;
        if (l.totalDueAllTime > 0) acc.overdueCount += 1;
        return acc;
      },
      { collected: 0, due: 0, overdueCount: 0 }
    );
  }, [ledgers]);

  const toggleExpand = (id: string) => {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddModal = (student?: SchoolStudent, targetMonth?: string, suggestedAmount?: number) => {
    setEditingRecordId(null);
    setFormError(null);
    setFormState({
      studentId: student?.id || students[0]?.id || '',
      amount: suggestedAmount ?? student?.monthlyFee ?? 2500,
      paymentDate: todayStr,
      targetMonth: targetMonth || currentMonthKey,
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rec: FeeRecord) => {
    setEditingRecordId(rec.id || null);
    setFormError(null);
    setFormState({
      studentId: rec.studentId,
      amount: rec.amount,
      paymentDate: rec.paymentDate,
      targetMonth: rec.targetMonth || currentMonthKey,
      paymentStatus: rec.paymentStatus,
      paymentMethod: rec.paymentMethod,
      notes: rec.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.studentId || formState.amount <= 0) {
      setFormError('Please select a student and enter a valid amount.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingRecordId) {
        await updateSchoolFeeRecord(editingRecordId, formState);
        setSuccessMessage('Fee payment record updated!');
      } else {
        await createSchoolFeeRecord(formState);
        setSuccessMessage('Fee payment recorded!');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save fee payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteSchoolFeeRecord(deletingId);
      setDeletingId(null);
      setSuccessMessage('Fee record deleted.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkOverdueReminders = async () => {
    const overdue = filteredLedgers.filter((l) => l.totalDueAllTime > 0 && l.student.whatsapp);
    if (overdue.length === 0) return;

    setSendingBulkReminders(true);
    try {
      const targets = overdue.map((l) => {
        const unpaidMonths = l.monthStatuses
          .filter((m) => m.status !== 'Paid')
          .map((m) => m.monthName)
          .join(', ');
        return {
          phone: l.student.whatsapp,
          message: `Dear Parent, This is a gentle reminder from Honey Bees Play School that school fees for ${l.student.studentName} (${l.student.group}) for ${unpaidMonths} (Total Due: ₹${l.totalDueAllTime.toLocaleString('en-IN')}) are pending. Kindly arrange payment at your earliest convenience. Thank you!`,
          studentName: l.student.studentName,
        };
      });
      const res = await sendBulkAutomatedWhatsApp(targets);
      setSuccessMessage(`Sent ${res.sentCount} of ${res.total} fee reminders via WhatsApp Bot.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send bulk reminders.');
    } finally {
      setSendingBulkReminders(false);
    }
  };

  const handleQuickBotReceipt = async (student: SchoolStudent, rec: FeeRecord) => {
    if (!student.whatsapp) return;
    try {
      await sendAutomatedWhatsAppMessage(
        student.whatsapp,
        `Dear Parent, Thank you! We have received a play school fee payment of ₹${rec.amount.toLocaleString('en-IN')} for ${student.studentName} on ${rec.paymentDate} via ${rec.paymentMethod}. - Honey Bees Play School`
      );
      setSuccessMessage(`Receipt sent to ${student.studentName}'s parent via WhatsApp Bot.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send receipt.');
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
              Honey Bees Play School
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Play School Fees Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track monthly fees, record payments, and send WhatsApp fee reminders or receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBotManagerModal(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              botConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{botConnected ? 'Bot Connected' : 'WhatsApp Bot'}</span>
          </button>

          <button
            onClick={() => openAddModal()}
            disabled={students.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Total Collected
          </span>
          <span className="font-display font-extrabold text-2xl text-emerald-900 mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" />
            {totals.collected.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
            Total Pending Dues
          </span>
          <span className="font-display font-extrabold text-2xl text-rose-900 mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" />
            {totals.due.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
              Students with Dues
            </span>
            <span className="font-display font-extrabold text-2xl text-slate-900 mt-1 block">
              {totals.overdueCount}
            </span>
          </div>
          {botConnected && totals.overdueCount > 0 && (
            <button
              onClick={handleBulkOverdueReminders}
              disabled={sendingBulkReminders}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingBulkReminders ? 'Sending...' : 'Remind All'}</span>
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-3 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as 'ALL' | SchoolGroup)}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-amber-500"
          >
            <option value="ALL">All Groups</option>
            {SCHOOL_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'OVERDUE' | 'PAID')}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-amber-500"
          >
            <option value="ALL">All Fee Status</option>
            <option value="OVERDUE">Has Pending Dues</option>
            <option value="PAID">All Paid</option>
          </select>
        </div>
      </div>

      {/* Ledger List */}
      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Loading fee ledgers...
        </div>
      ) : filteredLedgers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No school student fee records match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLedgers.map((ledger) => {
            const { student } = ledger;
            const isExpanded = expandedStudents.has(student.id!);
            const unpaidMonthsText = ledger.monthStatuses
              .filter((m) => m.status !== 'Paid')
              .map((m) => m.monthName)
              .join(', ');

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(student.id!)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base text-slate-900">
                        {student.studentName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                          SCHOOL_GROUP_META[student.group]?.badgeClass || 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {student.group}
                      </span>
                      {ledger.totalDueAllTime > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                          Due: ₹{ledger.totalDueAllTime.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          All Paid
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Guardian: {student.guardianName} • Monthly Fee: ₹{ledger.totalMonthlyFee} • Paid: ₹
                      {ledger.totalPaidAllTime.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {ledger.totalDueAllTime > 0 && student.whatsapp && (
                      <a
                        href={getSchoolFeeReminderWhatsAppUrl(
                          student.whatsapp,
                          student.studentName,
                          ledger.totalDueAllTime,
                          unpaidMonthsText
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Remind</span>
                      </a>
                    )}
                    <button
                      onClick={() => openAddModal(student)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pay</span>
                    </button>
                    <button
                      onClick={() => toggleExpand(student.id!)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Monthly Breakdown
                    </h4>
                    <div className="space-y-2">
                      {ledger.monthStatuses
                        .slice()
                        .reverse()
                        .map((m) => (
                          <div
                            key={m.monthKey}
                            className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="font-bold text-sm text-slate-900">{m.monthName}</span>
                                <span className="text-xs text-slate-500 ml-2">
                                  Paid ₹{m.paidAmount} / ₹{m.monthlyFee}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    m.status === 'Paid'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : m.status === 'Partial'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  {m.status}
                                </span>
                                {m.dueAmount > 0 && (
                                  <button
                                    onClick={() => openAddModal(student, m.monthKey, m.dueAmount)}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer"
                                  >
                                    Collect ₹{m.dueAmount}
                                  </button>
                                )}
                              </div>
                            </div>

                            {m.records.length > 0 && (
                              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                {m.records.map((rec) => (
                                  <div
                                    key={rec.id}
                                    className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"
                                  >
                                    <span>
                                      ₹{rec.amount} on {rec.paymentDate} ({rec.paymentMethod})
                                      {rec.notes ? ` — ${rec.notes}` : ''}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {student.whatsapp && (
                                        <>
                                          <a
                                            href={getSchoolPaymentReceiptWhatsAppUrl(
                                              student.whatsapp,
                                              student.studentName,
                                              rec.amount,
                                              rec.paymentDate,
                                              rec.paymentMethod,
                                              rec.notes
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-100"
                                          >
                                            WhatsApp Receipt
                                          </a>
                                          {botConnected && (
                                            <button
                                              onClick={() => handleQuickBotReceipt(student, rec)}
                                              className="px-2 py-1 bg-amber-50 text-amber-900 rounded-lg font-semibold hover:bg-amber-100 cursor-pointer"
                                            >
                                              Bot Send
                                            </button>
                                          )}
                                        </>
                                      )}
                                      <button
                                        onClick={() => openEditModal(rec)}
                                        className="p-1 text-slate-500 hover:text-amber-800 cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeletingId(rec.id || null)}
                                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
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

      {/* Record / Edit Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900">
                {editingRecordId ? 'Edit School Fee Payment' : 'Record School Fee Payment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student</label>
                <select
                  value={formState.studentId}
                  onChange={(e) => setFormState({ ...formState, studentId: e.target.value })}
                  disabled={!!editingRecordId}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} ({s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formState.amount}
                    onChange={(e) => setFormState({ ...formState, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">For Month</label>
                  <input
                    type="month"
                    required
                    value={formState.targetMonth}
                    onChange={(e) => setFormState({ ...formState, targetMonth: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={formState.paymentDate}
                    onChange={(e) => setFormState({ ...formState, paymentDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Method</label>
                  <select
                    value={formState.paymentMethod}
                    onChange={(e) =>
                      setFormState({ ...formState, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional reference or notes"
                  value={formState.notes || ''}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div
          onClick={() => setDeletingId(null)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-200 space-y-4"
          >
            <h3 className="font-display font-bold text-lg text-slate-900">Delete Fee Record?</h3>
            <p className="text-xs text-slate-600">This payment entry will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <WhatsAppBotModal isOpen={showBotManagerModal} onClose={() => setShowBotManagerModal(false)} />
    </div>
  );
};

