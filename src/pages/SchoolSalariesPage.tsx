import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  X,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Zap
} from 'lucide-react';
import { Teacher } from '../types/teacher';
import { PaymentMethod } from '../types/fee';
import { SalaryRecord, SalaryRecordInput } from '../types/salary';
import { subscribeToTeachers } from '../services/teacherService';
import {
  createSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord,
  subscribeToSalaryRecords,
  calculateTeacherSalaryLedger,
  TeacherSalaryLedger
} from '../services/teacherSalaryService';
import { formatMonthKey } from '../services/feeService';
import { getTeacherSalaryWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppBotModal } from '../components/WhatsAppBotModal';
import { getWhatsAppBotStatus, sendAutomatedWhatsAppMessage } from '../services/whatsappBotService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const SchoolSalariesPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthKey = todayStr.substring(0, 7);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());

  const [showBotManagerModal, setShowBotManagerModal] = useState(false);
  const [botConnected, setBotConnected] = useState(false);

  useEffect(() => {
    getWhatsAppBotStatus().then((res) => setBotConnected(res.status === 'CONNECTED'));
  }, [showBotManagerModal]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formState, setFormState] = useState<SalaryRecordInput>({
    teacherId: '',
    amount: 15000,
    paymentDate: todayStr,
    targetMonth: currentMonthKey,
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubTeachers = subscribeToTeachers((data) => setTeachers(data));
    const unsubSalaries = subscribeToSalaryRecords(
      (data) => {
        setSalaryRecords(data);
        setLoading(false);
      },
      () => {
        setError('Failed to load teacher salary records.');
        setLoading(false);
      }
    );
    return () => {
      unsubTeachers();
      unsubSalaries();
    };
  }, []);

  const ledgers: TeacherSalaryLedger[] = useMemo(() => {
    return teachers.map((t) => calculateTeacherSalaryLedger(t, salaryRecords));
  }, [teachers, salaryRecords]);

  const filteredLedgers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ledgers
      .filter((l) => {
        const matchesSearch =
          !q ||
          l.teacher.teacherName.toLowerCase().includes(q) ||
          (l.teacher.phone || '').includes(q);
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'PENDING' && l.totalPendingAllTime > 0) ||
          (statusFilter === 'PAID' && l.totalPendingAllTime === 0);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.totalPendingAllTime - a.totalPendingAllTime);
  }, [ledgers, searchQuery, statusFilter]);

  const totals = useMemo(() => {
    return ledgers.reduce(
      (acc, l) => {
        acc.paid += l.totalPaidAllTime;
        acc.pending += l.totalPendingAllTime;
        if (l.totalPendingAllTime > 0) acc.pendingTeachers += 1;
        return acc;
      },
      { paid: 0, pending: 0, pendingTeachers: 0 }
    );
  }, [ledgers]);

  const toggleExpand = (id: string) => {
    setExpandedTeachers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddModal = (teacher?: Teacher, targetMonth?: string, suggestedAmount?: number) => {
    setEditingRecordId(null);
    setFormError(null);
    setFormState({
      teacherId: teacher?.id || teachers[0]?.id || '',
      amount: suggestedAmount ?? teacher?.monthlySalary ?? 15000,
      paymentDate: todayStr,
      targetMonth: targetMonth || currentMonthKey,
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rec: SalaryRecord) => {
    setEditingRecordId(rec.id || null);
    setFormError(null);
    setFormState({
      teacherId: rec.teacherId,
      amount: rec.amount,
      paymentDate: rec.paymentDate,
      targetMonth: rec.targetMonth || currentMonthKey,
      status: rec.status,
      paymentMethod: rec.paymentMethod,
      notes: rec.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.teacherId || formState.amount <= 0) {
      setFormError('Please select a teacher and enter a valid salary amount.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingRecordId) {
        await updateSalaryRecord(editingRecordId, formState);
        setSuccessMessage('Salary record updated!');
      } else {
        await createSalaryRecord(formState);
        setSuccessMessage('Salary payment recorded!');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save salary payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteSalaryRecord(deletingId);
      setDeletingId(null);
      setSuccessMessage('Salary record deleted.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickBotSlip = async (teacher: Teacher, rec: SalaryRecord) => {
    if (!teacher.phone) return;
    const monthName = formatMonthKey(rec.targetMonth || currentMonthKey);
    try {
      await sendAutomatedWhatsAppMessage(
        teacher.phone,
        `Dear ${teacher.teacherName}, Your salary of ₹${rec.amount.toLocaleString('en-IN')} for ${monthName} has been processed on ${rec.paymentDate} via ${rec.paymentMethod}. Thank you for your dedication! - Honey Bees Play School`
      );
      setSuccessMessage(`Salary confirmation sent to ${teacher.teacherName} via WhatsApp Bot.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send salary notification.');
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
            Teacher Salaries
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track monthly teacher payroll, record salary payouts, and send WhatsApp salary notifications.
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
            disabled={teachers.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Salary Payment</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Total Salaries Paid
          </span>
          <span className="font-display font-extrabold text-2xl text-emerald-900 mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" />
            {totals.paid.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
            Pending Payroll Dues
          </span>
          <span className="font-display font-extrabold text-2xl text-rose-900 mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" />
            {totals.pending.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
            Teachers with Pending Pay
          </span>
          <span className="font-display font-extrabold text-2xl text-slate-900 mt-1 block">
            {totals.pendingTeachers}
          </span>
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

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teacher by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'PAID')}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-amber-500"
          >
            <option value="ALL">All Payroll Status</option>
            <option value="PENDING">Has Pending Salary</option>
            <option value="PAID">All Paid</option>
          </select>
        </div>
      </div>

      {/* Teacher Ledgers */}
      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Loading teacher salary ledgers...
        </div>
      ) : filteredLedgers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No teachers found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLedgers.map((ledger) => {
            const { teacher } = ledger;
            const isExpanded = expandedTeachers.has(teacher.id!);

            return (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(teacher.id!)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base text-slate-900">
                        {teacher.teacherName}
                      </span>
                      {(teacher.assignedGroups || []).map((grp) => (
                        <span
                          key={grp}
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                            SCHOOL_GROUP_META[grp]?.badgeClass || 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {grp}
                        </span>
                      ))}
                      {ledger.totalPendingAllTime > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                          Pending: ₹{ledger.totalPendingAllTime.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          Up to Date
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Monthly Salary: {ledger.monthlySalary > 0 ? `₹${ledger.monthlySalary.toLocaleString('en-IN')}` : 'Not set'} •
                      Total Paid: ₹{ledger.totalPaidAllTime.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openAddModal(teacher)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pay Salary</span>
                    </button>
                    <button
                      onClick={() => toggleExpand(teacher.id!)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Monthly Salary Breakdown
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
                                  Paid ₹{m.paidAmount.toLocaleString('en-IN')}
                                  {m.monthlySalary > 0 ? ` / ₹${m.monthlySalary.toLocaleString('en-IN')}` : ''}
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
                                    onClick={() => openAddModal(teacher, m.monthKey, m.dueAmount)}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer"
                                  >
                                    Pay ₹{m.dueAmount.toLocaleString('en-IN')}
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
                                      ₹{rec.amount.toLocaleString('en-IN')} on {rec.paymentDate} ({rec.paymentMethod})
                                      {rec.notes ? ` — ${rec.notes}` : ''}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {teacher.phone && (
                                        <>
                                          <a
                                            href={getTeacherSalaryWhatsAppUrl(
                                              teacher.phone,
                                              teacher.teacherName,
                                              rec.amount,
                                              m.monthName,
                                              rec.paymentDate,
                                              rec.paymentMethod
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-100"
                                          >
                                            <MessageCircle className="w-3 h-3" />
                                            <span>Notify</span>
                                          </a>
                                          {botConnected && (
                                            <button
                                              onClick={() => handleQuickBotSlip(teacher, rec)}
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
                {editingRecordId ? 'Edit Salary Payment' : 'Record Salary Payment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teacher</label>
                <select
                  value={formState.teacherId}
                  onChange={(e) => setFormState({ ...formState, teacherId: e.target.value })}
                  disabled={!!editingRecordId}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teacherName}
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
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
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
                  {submitting ? 'Saving...' : 'Save Salary'}
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
            <h3 className="font-display font-bold text-lg text-slate-900">Delete Salary Record?</h3>
            <p className="text-xs text-slate-600">This salary entry will be permanently removed.</p>
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

