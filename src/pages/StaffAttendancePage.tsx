import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Save, 
  Search, 
  AlertCircle, 
  Check, 
  X, 
  Minus,
  UserCheck, 
  UserX,
  History,
  BookOpen,
  MessageCircle,
  Send,
  ExternalLink,
  Zap
} from 'lucide-react';
import { TuitionStudent } from '../types/student';
import { ClassAttendance, AttendanceStatus } from '../types/attendance';
import { subscribeToStudents } from '../services/studentService';
import { saveAttendance, getAttendanceByDateAndClass, subscribeToAttendance } from '../services/attendanceService';
import { getAbsenteeWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppBotModal } from '../components/WhatsAppBotModal';
import { getWhatsAppBotStatus, sendBulkAutomatedWhatsApp } from '../services/whatsappBotService';

export const StaffAttendancePage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [students, setStudents] = useState<TuitionStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');

  // Attendance state for selected date: studentId -> 'Present' | 'Absent' | 'N/A'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History tab state
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const [attendanceHistory, setAttendanceHistory] = useState<ClassAttendance[]>([]);

  // Batch WhatsApp Modal & Bot Manager state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showBotManagerModal, setShowBotManagerModal] = useState(false);
  const [sentAlertIds, setSentAlertIds] = useState<Record<string, boolean>>({});
  const [botConnected, setBotConnected] = useState(false);
  const [sendingAutomated, setSendingAutomated] = useState(false);
  const [botMessageProgress, setBotMessageProgress] = useState<string | null>(null);

  // 1. Subscribe to student directory
  useEffect(() => {
    setLoadingStudents(true);
    const unsubscribe = subscribeToStudents(
      (data) => {
        setStudents(data);
        setLoadingStudents(false);
      },
      (err) => {
        console.error('Error fetching students:', err);
        setError('Failed to load students directory.');
        setLoadingStudents(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to attendance history
  useEffect(() => {
    const unsubscribe = subscribeToAttendance((records) => {
      setAttendanceHistory(records);
    });
    return () => unsubscribe();
  }, []);

  // 3. Check bot connection state on mount & when opening modals
  useEffect(() => {
    getWhatsAppBotStatus().then((res) => {
      setBotConnected(res.status === 'CONNECTED');
    });
  }, [showBatchModal, showBotManagerModal]);

  // 4. Load saved attendance whenever Date changes
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    const fetchExisting = async () => {
      try {
        const record = await getAttendanceByDateAndClass(selectedDate, 'ALL');
        if (isMounted) {
          if (record && record.records) {
            const map: Record<string, AttendanceStatus> = {};
            record.records.forEach((r) => {
              map[r.studentId] = r.status;
            });
            setAttendanceMap(map);
          } else {
            setAttendanceMap({});
          }
          setHasUnsavedChanges(false);
        }
      } catch (err) {
        console.error('Failed to load attendance record:', err);
      }
    };

    fetchExisting();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Filter students by search query
  const displayedStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => 
      (s.studentName || '').toLowerCase().includes(q) ||
      (s.class || '').toLowerCase().includes(q) ||
      (s.guardianName || '').toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Toggle status for a student
  const handleToggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setHasUnsavedChanges(true);
  };

  // Bulk mark actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const newMap: Record<string, AttendanceStatus> = { ...attendanceMap };
    displayedStudents.forEach((s) => {
      if (s.id) newMap[s.id] = status;
    });
    setAttendanceMap(newMap);
    setHasUnsavedChanges(true);
  };

  // Save Attendance to Firestore
  const handleSaveAttendance = async () => {
    if (!selectedDate) {
      setError('Please select a valid date.');
      return;
    }

    setSaving(true);
    setError(null);

    const records = students
      .filter((s) => s.id && attendanceMap[s.id])
      .map((s) => ({
        studentId: s.id!,
        status: attendanceMap[s.id!],
      }));

    try {
      await saveAttendance({
        date: selectedDate,
        class: 'ALL',
        records,
      });

      setHasUnsavedChanges(false);
      setSaveSuccess(`Daily attendance saved successfully for ${selectedDate}.`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      setError(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Metric counts for selected date
  const presentCount = useMemo(() => {
    return students.filter((s) => s.id && attendanceMap[s.id] === 'Present').length;
  }, [students, attendanceMap]);

  const absentStudents = useMemo(() => {
    return students.filter((s) => s.id && attendanceMap[s.id] === 'Absent' && s.whatsapp);
  }, [students, attendanceMap]);

  const absentCount = absentStudents.length;

  const naCount = useMemo(() => {
    return students.filter((s) => s.id && attendanceMap[s.id] === 'N/A').length;
  }, [students, attendanceMap]);

  const unmarkedCount = students.length - presentCount - absentCount - naCount;

  // Single-click batch alert dispatcher for web browsers (Manual Fallback)
  const handleOpenSingleAbsentWhatsApp = (student: TuitionStudent) => {
    if (!student.id || !student.whatsapp) return;
    const url = getAbsenteeWhatsAppUrl(student.whatsapp, student.studentName, selectedDate, student.class);
    window.open(url, '_blank');
    setSentAlertIds((prev) => ({ ...prev, [student.id!]: true }));
  };

  const handleLaunchAllAbsentQueue = () => {
    absentStudents.forEach((student, index) => {
      if (!student.id || !student.whatsapp) return;
      const url = getAbsenteeWhatsAppUrl(student.whatsapp, student.studentName, selectedDate, student.class);
      setTimeout(() => {
        window.open(url, '_blank');
        setSentAlertIds((prev) => ({ ...prev, [student.id!]: true }));
      }, index * 400);
    });
  };

  // 1-Click Silent Background Automated Dispatcher via whatsapp-server microservice
  const handleAutomatedBulkSend = async () => {
    if (absentStudents.length === 0) return;
    setSendingAutomated(true);
    setBotMessageProgress(`Dispatching 1-click WhatsApp alerts to ${absentStudents.length} parents...`);

    const items = absentStudents.map((student) => {
      const msg = `Dear Parent, ${student.studentName}${student.class ? ` (${student.class})` : ''} was marked ABSENT for tuition classes on ${selectedDate}. Please let us know if you have any questions or contact us at 8667330368. - Honey Bees Tuition Center`;
      return {
        phone: student.whatsapp!,
        message: msg,
        studentName: student.studentName
      };
    });

    try {
      const result = await sendBulkAutomatedWhatsApp(items);
      
      const newSentMap: Record<string, boolean> = { ...sentAlertIds };
      absentStudents.forEach((s) => {
        if (s.id) newSentMap[s.id] = true;
      });
      setSentAlertIds(newSentMap);

      setSaveSuccess(`🚀 1-Click Silent Dispatch Complete! Sent ${result.sentCount} of ${result.total} WhatsApp absentee alerts.`);
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      console.error('Automated send error:', err);
      setError(err.message || 'Failed to dispatch automated WhatsApp messages.');
    } finally {
      setSendingAutomated(false);
      setBotMessageProgress(null);
    }
  };

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
            Tuition Attendance Log
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Record daily attendance across all tuition students with Present, Absent, and N/A options.
          </p>
        </div>

        {/* Action Header Controls: Bot Manager & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          <button
            onClick={() => setShowBotManagerModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              botConnected
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title="Manage 0-Click Automated WhatsApp Microservice (Scan QR Code)"
          >
            <Zap className={`w-4 h-4 ${botConnected ? 'text-emerald-600 fill-emerald-500' : 'text-amber-600'}`} />
            <span>{botConnected ? 'WhatsApp Bot Active' : 'Setup WhatsApp Bot'}</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('mark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'mark'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-amber-600" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-amber-600" />
              <span>Attendance History</span>
            </button>
          </div>

        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-950 p-1">
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

      {/* TAB 1: MARK ATTENDANCE */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Date Selector & Search Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              
              {/* Date Input */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Quick Search */}
              <div className="sm:col-span-5 relative space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Quick Search Roster
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student, class, or parent..."
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
              </div>

              {/* Save Attendance CTA */}
              <div className="sm:col-span-3 flex items-center justify-end">
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving || students.length === 0}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl shadow-sm transition-all border cursor-pointer disabled:opacity-50 ${
                    hasUnsavedChanges
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600/30 ring-2 ring-amber-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800'
                  }`}
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes *' : 'Save Attendance'}</span>
                </button>
              </div>

            </div>

            {/* Metrics Pills & Bulk Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Present: {presentCount}</span>
                </span>
                
                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 font-bold flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-rose-600" />
                  <span>Absent: {absentCount}</span>
                </span>

                {absentCount > 0 && (
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer animate-pulse"
                    title="Send WhatsApp Absence Alerts to all parents of absent students"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Notify Absent Parents ({absentCount})</span>
                  </button>
                )}

                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-bold flex items-center gap-1.5">
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                  <span>N/A: {naCount}</span>
                </span>

                {unmarkedCount > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 font-medium">
                    Unmarked: {unmarkedCount}
                  </span>
                )}
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAll('Present')}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll('Absent')}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark All Absent
                </button>
                <button
                  onClick={() => handleMarkAll('N/A')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark All N/A
                </button>
              </div>

            </div>
          </div>

          {/* Student Unified Roster Table */}
          {loadingStudents ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-slate-700 text-sm">Loading All Tuition Students...</p>
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-display font-bold text-lg text-slate-900">No Students Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {students.length === 0 
                  ? 'No tuition students exist in Cloud Firestore. Add students first.' 
                  : 'No student matches your current search criteria.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tuition Student Directory Roster ({displayedStudents.length} Students)
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Date: {selectedDate}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {displayedStudents.map((student, idx) => {
                  const status = student.id ? attendanceMap[student.id] : undefined;
                  return (
                    <div
                      key={student.id || idx}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Student Identity & Class Badge */}
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold shrink-0">
                          {student.class || 'N/A'}
                        </span>
                        
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            {student.studentName}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Parent: {student.guardianName || '—'} {student.schoolName ? `• ${student.schoolName}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* 3 Status Toggle Buttons + WhatsApp Absence Alert */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => student.id && handleToggleStatus(student.id, 'Present')}
                          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Present</span>
                        </button>

                        {/* Absent */}
                        <button
                          type="button"
                          onClick={() => student.id && handleToggleStatus(student.id, 'Absent')}
                          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                              : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-800'
                          }`}
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Absent</span>
                        </button>

                        {/* N/A */}
                        <button
                          type="button"
                          onClick={() => student.id && handleToggleStatus(student.id, 'N/A')}
                          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            status === 'N/A'
                              ? 'bg-slate-700 text-white shadow-sm ring-2 ring-slate-700/20'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>N/A</span>
                        </button>

                        {/* 1-Click WhatsApp Absence Alert Button */}
                        {student.whatsapp && (
                          <a
                            href={getAbsenteeWhatsAppUrl(student.whatsapp, student.studentName, selectedDate, student.class)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                              status === 'Absent'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                            title={`Send WhatsApp Absence Alert to parent (${student.guardianName || student.studentName})`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{status === 'Absent' ? 'WhatsApp Alert' : 'WhatsApp'}</span>
                          </a>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Table Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {hasUnsavedChanges ? '⚠️ You have unsaved attendance edits.' : '✓ All changes up to date.'}
                </span>

                <button
                  onClick={handleSaveAttendance}
                  disabled={saving || !hasUnsavedChanges}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: ATTENDANCE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-display font-bold text-lg text-slate-900">Saved Attendance Sessions</h2>
            <p className="text-xs text-slate-500">
              View daily attendance records saved in Cloud Firestore.
            </p>
          </div>

          {attendanceHistory.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <History className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No Attendance History Records</h3>
              <p className="text-xs text-slate-500">Save your first daily attendance session to view historical logs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceHistory.map((record) => {
                const total = record.records ? record.records.length : 0;
                const pCount = record.records ? record.records.filter((r) => r.status === 'Present').length : 0;
                const aCount = record.records ? record.records.filter((r) => r.status === 'Absent').length : 0;
                const naCount = record.records ? record.records.filter((r) => r.status === 'N/A').length : 0;
                const rate = (pCount + aCount) > 0 ? Math.round((pCount / (pCount + aCount)) * 100) : 0;

                return (
                  <div
                    key={record.id}
                    className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="font-display font-bold text-sm text-slate-900">
                        Date: {record.date}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {total} Marked
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center text-xs">
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200/60">
                        <span className="block text-[9px] text-emerald-700 font-bold uppercase">Present</span>
                        <span className="font-extrabold text-emerald-950 text-xs">{pCount}</span>
                      </div>
                      <div className="p-2 bg-rose-50 rounded-lg border border-rose-200/60">
                        <span className="block text-[9px] text-rose-700 font-bold uppercase">Absent</span>
                        <span className="font-extrabold text-rose-950 text-xs">{aCount}</span>
                      </div>
                      <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                        <span className="block text-[9px] text-slate-700 font-bold uppercase">N/A</span>
                        <span className="font-extrabold text-slate-950 text-xs">{naCount}</span>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/60">
                        <span className="block text-[9px] text-amber-800 font-bold uppercase">Rate</span>
                        <span className="font-extrabold text-amber-950 text-xs">{rate}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDate(record.date);
                        setActiveTab('mark');
                      }}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-200 transition-colors"
                    >
                      Load & Edit Daily Roster
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BATCH WHATSAPP ABSENTEE ALERTS MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Send WhatsApp Absence Alerts ({absentStudents.length})
                  </h3>
                  <p className="text-xs text-slate-300">
                    Date: {selectedDate} • Quick batch notification queue for parents
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Automation Notice & Launch All Button */}
            <div className="p-4 bg-amber-50 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-amber-900 space-y-0.5">
                <span className="font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-700" />
                  <span>{botConnected ? 'Automated WhatsApp Service Active' : 'Automated Background Sending Available'}</span>
                </span>
                <span className="text-amber-800 block">
                  {botConnected 
                    ? 'Clicking 🚀 1-Click Auto Send dispatches all messages silently in background with 0 browser tabs!' 
                    : 'Scan QR code in WhatsApp Bot Manager to enable 1-click background sending.'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {botConnected ? (
                  <button
                    onClick={handleAutomatedBulkSend}
                    disabled={sendingAutomated}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer animate-bounce"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{sendingAutomated ? 'Sending Alerts...' : `🚀 1-Click Auto Send All (${absentStudents.length})`}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLaunchAllAbsentQueue}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Launch All Tabs ({absentStudents.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Progress indicator */}
            {botMessageProgress && (
              <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-bold text-center border-b border-emerald-200">
                {botMessageProgress}
              </div>
            )}

            {/* Absent Roster Queue List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100">
              {absentStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No absent students with WhatsApp contact numbers on {selectedDate}.
                </div>
              ) : (
                absentStudents.map((student, idx) => {
                  const isSent = student.id ? sentAlertIds[student.id] : false;
                  return (
                    <div
                      key={student.id || idx}
                      className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{student.studentName}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold">
                            {student.class || 'N/A'}
                          </span>
                          {isSent && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Alert Sent</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Parent: {student.guardianName || '—'} • Phone: <strong className="text-slate-800">{student.whatsapp}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenSingleAbsentWhatsApp(student)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSent
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isSent ? 'Re-open Chat' : 'Open WhatsApp'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Queue Status: {Object.keys(sentAlertIds).length} of {absentStudents.length} launched
              </span>
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Queue
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
