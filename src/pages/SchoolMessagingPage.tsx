import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageCircle,
  Send,
  Users,
  UserCheck,
  Zap,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SCHOOL_GROUPS, SchoolGroup, SchoolStudent } from '../types/schoolStudent';
import { Teacher } from '../types/teacher';
import { subscribeToSchoolStudents } from '../services/schoolStudentService';
import { subscribeToTeachers } from '../services/teacherService';
import { getCustomWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppBotModal } from '../components/WhatsAppBotModal';
import { getWhatsAppBotStatus, sendBulkAutomatedWhatsApp } from '../services/whatsappBotService';
import { SCHOOL_GROUP_META } from '../utils/schoolGroups';

type AudienceType = 'PARENTS' | 'TEACHERS';

const MESSAGE_TEMPLATES: { label: string; audience: AudienceType; body: string }[] = [
  {
    label: 'Holiday Notice',
    audience: 'PARENTS',
    body: 'Dear Parent, Please note that Honey Bees Play School will remain closed tomorrow on account of a holiday. Regular classes will resume the following day. - Honey Bees Play School',
  },
  {
    label: 'Parent-Teacher Meeting',
    audience: 'PARENTS',
    body: 'Dear Parent, We invite you to the Parent-Teacher Meeting for {name} this Saturday between 10:00 AM and 1:00 PM at Honey Bees Play School. Looking forward to seeing you!',
  },
  {
    label: 'Event / Activity Day',
    audience: 'PARENTS',
    body: 'Dear Parent, Tomorrow is Color & Craft Activity Day at Honey Bees Play School! Please send {name} in comfortable colorful attire. - Honey Bees Play School',
  },
  {
    label: 'Staff Meeting Notice',
    audience: 'TEACHERS',
    body: 'Dear {name}, Reminder that we have a Play School Teachers meeting today at 4:00 PM. Please be available on time. - Honey Bees Play School',
  },
];

export const SchoolMessagingPage: React.FC = () => {
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [audience, setAudience] = useState<AudienceType>('PARENTS');
  const [groupFilter, setGroupFilter] = useState<'ALL' | SchoolGroup>('ALL');
  const [messageText, setMessageText] = useState(MESSAGE_TEMPLATES[0].body);

  const [showBotModal, setShowBotModal] = useState(false);
  const [botConnected, setBotConnected] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubS = subscribeToSchoolStudents(setStudents);
    const unsubT = subscribeToTeachers(setTeachers);
    return () => {
      unsubS();
      unsubT();
    };
  }, []);

  useEffect(() => {
    getWhatsAppBotStatus().then((res) => setBotConnected(res.status === 'CONNECTED'));
  }, [showBotModal]);

  const recipients = useMemo(() => {
    if (audience === 'PARENTS') {
      return students
        .filter((s) => groupFilter === 'ALL' || s.group === groupFilter)
        .map((s) => ({
          id: s.id || s.studentName,
          name: s.studentName,
          sublabel: `${s.group} • Parent: ${s.guardianName}`,
          badge: s.group as SchoolGroup | undefined,
          phone: s.whatsapp || '',
        }));
    }
    return teachers
      .filter((t) => t.status === 'Active')
      .filter((t) => groupFilter === 'ALL' || (t.assignedGroups || []).includes(groupFilter))
      .map((t) => ({
        id: t.id || t.teacherName,
        name: t.teacherName,
        sublabel: t.assignedGroups?.length ? `Groups: ${t.assignedGroups.join(', ')}` : 'Teacher',
        badge: undefined as SchoolGroup | undefined,
        phone: t.phone || '',
      }));
  }, [audience, groupFilter, students, teachers]);

  const validRecipients = useMemo(
    () => recipients.filter((r) => r.phone.trim().length > 0),
    [recipients]
  );

  const formatMessageFor = (name: string) => messageText.replace(/\{name\}/g, name);

  const handleBulkSend = async () => {
    if (!messageText.trim() || validRecipients.length === 0) return;
    setSendingBulk(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const targets = validRecipients.map((r) => ({
        phone: r.phone,
        message: formatMessageFor(r.name),
        studentName: r.name,
      }));
      const res = await sendBulkAutomatedWhatsApp(targets);
      setStatusMessage(`Sent message to ${res.sentCount} of ${res.total} recipients.`);
      const nextSent = { ...sentIds };
      validRecipients.forEach((r) => {
        nextSent[r.id] = true;
      });
      setSentIds(nextSent);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send bulk WhatsApp messages.');
    } finally {
      setSendingBulk(false);
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
            Messaging Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Send WhatsApp announcements to parents by group (Playgroup, Pre-KG, LKG, UKG) or to teachers.
          </p>
        </div>

        <button
          onClick={() => setShowBotModal(true)}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
            botConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{botConnected ? 'WhatsApp Bot Connected' : 'Connect WhatsApp Bot'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 h-fit">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              1. Select Audience
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setAudience('PARENTS');
                  setSentIds({});
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  audience === 'PARENTS'
                    ? 'bg-amber-500 text-slate-950 border-amber-600/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Parents</span>
              </button>
              <button
                onClick={() => {
                  setAudience('TEACHERS');
                  setSentIds({});
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  audience === 'TEACHERS'
                    ? 'bg-amber-500 text-slate-950 border-amber-600/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Teachers</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              2. Filter by Group
            </label>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value as 'ALL' | SchoolGroup)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-amber-500"
            >
              <option value="ALL">All Groups</option>
              {SCHOOL_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Quick Templates</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => setMessageText(tpl.body)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Message Content
              </label>
              <span className="text-[11px] text-slate-400">Use {'{name}'} for student/teacher name</span>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your WhatsApp message..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {botConnected ? (
            <button
              onClick={handleBulkSend}
              disabled={sendingBulk || validRecipients.length === 0 || !messageText.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {sendingBulk
                  ? 'Sending Broadcast...'
                  : `Send Broadcast to ${validRecipients.length} Recipients via Bot`}
              </span>
            </button>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              Tip: Click <strong>Send</strong> next to any recipient on the right to open WhatsApp directly, or connect the WhatsApp Bot for 1-click bulk broadcast.
            </div>
          )}
        </div>

        {/* Recipients List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-600" />
              <span>
                Recipients ({validRecipients.length} with WhatsApp / {recipients.length} total)
              </span>
            </h2>
          </div>

          {recipients.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No recipients found for the selected audience and group.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto pr-1">
              {recipients.map((r) => {
                const personalized = formatMessageFor(r.name);
                return (
                  <div
                    key={r.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{r.name}</span>
                        {r.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                              SCHOOL_GROUP_META[r.badge]?.badgeClass || ''
                            }`}
                          >
                            {r.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block">
                        {r.sublabel} • {r.phone || 'No WhatsApp number'}
                      </span>
                    </div>

                    {r.phone ? (
                      <a
                        href={getCustomWhatsAppUrl(r.phone, personalized)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSentIds((p) => ({ ...p, [r.id]: true }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border shrink-0 ${
                          sentIds[r.id]
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{sentIds[r.id] ? 'Sent / Opened' : 'Send WhatsApp'}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Missing number</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WhatsAppBotModal isOpen={showBotModal} onClose={() => setShowBotModal(false)} />
    </div>
  );
};

