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
  GraduationCap,
  MessageCircle,
  Send,
  ExternalLink,
  Zap
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup, SchoolStudent } from '../types/schoolStudent';
import { ClassAttendance, AttendanceStatus } from '../types/attendance';
import { subscribeToSchoolStudents } from '../services/schoolStudentService';
import {
  saveSchoolAttendance,
  getSchoolAttendanceByDate,
  subscribeToSchoolAttendance
} from '../services/schoolAttendanceService';
import { getSchoolAbsenteeWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppBotModal } from '../components/WhatsAppBotModal';
import { getWhatsAppBotStatus, sendBulkAutomatedWhatsApp } from '../services/whatsappBotService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

export const SchoolAttendancePage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [groupFilter, setGroupFilter] = useState<'ALL' | SchoolGroup>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const [attendanceHistory, setAttendanceHistory] = useState<ClassAttendance[]>([]);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showBotManagerModal, setShowBotManagerModal] = useState(false);
  const [sentAlertIds, setSentAlertIds] = useState<Record<string, boolean>>({});
  const [botConnected, setBotConnected] = useState(false);
  const [sendingAutomated, setSendingAutomated] = useState(false);
  const [botMessageProgress, setBotMessageProgress] = useState<string | null>(null);

  useEffect(() => {
    setLoadingStudents(true);
    const unsubscribe = subscribeToSchoolStudents(
      (data) => {
        setStudents(data);
        setLoadingStudents(false);
      },
      () => {
        setError('Failed to load school students directory.');
        setLoadingStudents(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSchoolAttendance((records) => {
      setAttendanceHistory(records);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getWhatsAppBotStatus().then((res) => {
      setBotConnected(res.status === 'CONNECTED');
    });
  }, [showBatchModal, showBotManagerModal]);

  useEffect(() => {
    if (!selectedDate) return;
    let isMounted = true;
    const fetchExisting = async () => {
      try {
        const record = await getSchoolAttendanceByDate(selectedDate, 'ALL');
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
        console.error('Failed to load school attendance:', err);
      }
    };
    fetchExisting();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const displayedStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students
      .filter((s) => {
        const matchesGroup = groupFilter === 'ALL' || s.group === groupFilter;
        const matchesQuery =
          !q ||
          (s.studentName || '').toLowerCase().includes(q) ||
          (s.guardianName || '').toLowerCase().includes(q);
        return matchesGroup && matchesQuery;
      })
      .sort((a, b) => (a.studentName || '').localeCompare(b.studentName || ''));
  }, [students, groupFilter, searchQuery]);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    displayedStudents.forEach((s) => {
      const st = attendanceMap[s.id!];
      if (st === 'Present') present++;
      else if (st === 'Absent') absent++;
      else unmarked++;
    });

    return { total: displayedStudents.length, present, absent, unmarked };
  }, [displayedStudents, attendanceMap]);

  const absentStudents = useMemo(
    () => displayedStudents.filter((s) => attendanceMap[s.id!] === 'Absent'),
    [displayedStudents, attendanceMap]
  );

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? 'N/A' : status,
    }));
    setHasUnsavedChanges(true);
    setSaveSuccess(null);
  };

  const markAllDisplayed = (status: AttendanceStatus) => {
    const next = { ...attendanceMap };
    displayedStudents.forEach((s) => {
      if (s.id) next[s.id] = status;
    });
    setAttendanceMap(next);
    setHasUnsavedChanges(true);
    setSaveSuccess(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(null);

    try {
      const records = students
        .filter((s) => s.id && attendanceMap[s.id] && attendanceMap[s.id] !== 'N/A')
        .map((s) => ({
          studentId: s.id!,
          studentName: s.studentName,
          class: s.group,
          status: attendanceMap[s.id!],
        }));

      await saveSchoolAttendance({
        date: selectedDate,
        class: 'ALL',
        records,
      });

      setHasUnsavedChanges(false);
      setSaveSuccess(`Saved Play School attendance for ${selectedDate} (${records.length} marked).`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error('Save attendance error:', err);
      setError(err.message || 'Failed to save attendance to Cloud Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutomatedBulkSend = async () => {
    const targets = absentStudents
      .filter((s) => s.whatsapp && s.whatsapp.trim().length > 0)
      .map((s) => ({
        phone: s.whatsapp,
        message: `Dear Parent, ${s.studentName} (${s.group}) was marked ABSENT for Honey Bees Play School on ${selectedDate}. Please let us know if everything is okay. - Honey Bees Play School`,
        studentName: s.studentName,
      }));

    if (targets.length === 0) return;

    setSendingAutomated(true);
    setBotMessageProgress(`Sending ${targets.length} absentee alerts...`);
    try {
      const res = await sendBulkAutomatedWhatsApp(targets);
      setBotMessageProgress(`Sent ${res.sentCount} of ${res.total} absentee alerts.`);
      const nextSent = { ...sentAlertIds };
      absentStudents.forEach((s) => {
        if (s.id) nextSent[s.id] = true;
      });
      setSentAlertIds(nextSent);
    } catch (err: any) {
      setBotMessageProgress(`Error: ${err.message}`);
    } finally {
      setSendingAutomated(false);
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
            Play School Attendance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track daily attendance across Playgroup, Pre-KG, LKG, and UKG with instant parent WhatsApp alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBotManagerModal(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              botConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{botConnected ? 'WhatsApp Bot Connected' : 'WhatsApp Bot'}</span>
          </button>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('mark')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mark' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Mark Daily</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({attendanceHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'mark' ? (
        <>
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Group
                </label>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value as 'ALL' | SchoolGroup)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Groups</option>
                  {SCHOOL_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Search Student
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student or parent name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Stats & Bulk Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                  Total: {stats.total}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Present: {stats.present}
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  Absent: {stats.absent}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Unmarked: {stats.unmarked}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => markAllDisplayed('Present')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Mark All Present
                </button>
                {absentStudents.length > 0 && (
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Notify Absent ({absentStudents.length})</span>
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : hasUnsavedChanges ? 'Save Attendance *' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student List */}
          {loadingStudents ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
              Loading school students...
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No school students found for this filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {displayedStudents.map((student) => {
                const status = attendanceMap[student.id!] || 'N/A';
                const badgeClass =
                  SCHOOL_GROUP_META[student.group]?.badgeClass ||
                  'bg-amber-50 text-amber-900 border-amber-200';
                return (
                  <div
                    key={student.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{student.studentName}</span>
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${badgeClass}`}>
                            {student.group}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          Guardian: {student.guardianName} {student.whatsapp ? `• ${student.whatsapp}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStudentStatus(student.id!, 'Present')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          status === 'Present'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        onClick={() => setStudentStatus(student.id!, 'Absent')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          status === 'Absent'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      <button
                        onClick={() => setStudentStatus(student.id!, 'N/A')}
                        className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          status === 'N/A'
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Clear mark"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {attendanceHistory.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No attendance history recorded yet.
            </div>
          ) : (
            attendanceHistory.map((rec) => {
              const presentCount = rec.records.filter((r) => r.status === 'Present').length;
              const absentCount = rec.records.filter((r) => r.status === 'Absent').length;
              return (
                <div
                  key={rec.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-display font-bold text-base text-slate-900 block">
                      {rec.date}
                    </span>
                    <span className="text-xs text-slate-500">
                      {rec.records.length} students recorded
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <UserCheck className="w-3.5 h-3.5" /> Present: {presentCount}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      <UserX className="w-3.5 h-3.5" /> Absent: {absentCount}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDate(rec.date);
                        setActiveTab('mark');
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 cursor-pointer"
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Absentee WhatsApp Modal */}
      {showBatchModal && (
        <div
          onClick={() => setShowBatchModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Absentee Parent Alerts ({absentStudents.length})
                </h3>
                <p className="text-xs text-slate-500">Date: {selectedDate}</p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {botMessageProgress && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                {botMessageProgress}
              </div>
            )}

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {absentStudents.map((s) => {
                const url = getSchoolAbsenteeWhatsAppUrl(s.whatsapp, s.studentName, selectedDate, s.group);
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        {s.studentName} ({s.group})
                      </span>
                      <span className="text-xs text-slate-500">
                        {s.guardianName} • {s.whatsapp || 'No WhatsApp'}
                      </span>
                    </div>
                    {s.whatsapp ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSentAlertIds((p) => ({ ...p, [s.id!]: true }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          sentAlertIds[s.id!]
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{sentAlertIds[s.id!] ? 'Opened' : 'Send'}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No number</span>
                    )}
                  </div>
                );
              })}
            </div>

            {botConnected && (
              <button
                onClick={handleAutomatedBulkSend}
                disabled={sendingAutomated}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingAutomated ? 'Sending via Bot...' : 'Send All via Automated WhatsApp Bot'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <WhatsAppBotModal isOpen={showBotManagerModal} onClose={() => setShowBotManagerModal(false)} />
    </div>
  );
};

