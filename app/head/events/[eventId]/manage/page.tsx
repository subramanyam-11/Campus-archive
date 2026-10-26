'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import {
  getEnrolments,
  updateEnrolmentFields,
  updateEventFields,
  logAuditEntry,
  createNotification,
} from '@/lib/firebase/firestore';
import type { EnrolmentItem } from '@/src/types';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function ManageRegistrationsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const { events, setEvents } = useAppContext();
  const { user, profile } = useAuth();

  const event = events.find((e) => e.id === eventId) || null;
  const [enrolments, setEnrolments] = useState<EnrolmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'All' | 'Enrolled' | 'Attended' | 'Waitlisted'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // QR / PRN Quick Check-In state
  const [quickPrn, setQuickPrn] = useState<string>('');
  const [checkInMsg, setCheckInMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Broadcast modal state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [broadcastSubject, setBroadcastSubject] = useState<string>('');
  const [broadcastBody, setBroadcastBody] = useState<string>('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const records = await getEnrolments(eventId);
        if (records.length > 0) {
          setEnrolments(records);
        } else {
          // Fallback initial mock registrations for development/demo
          const mockEnrolments: EnrolmentItem[] = [
            {
              id: `enr-${eventId}-1`,
              eventId: eventId,
              eventTitle: event?.title || 'Academic Event',
              userId: 'stu_dev_01',
              userEmail: 'aarav.sharma@campus.edu',
              userName: 'Aarav Sharma',
              userPrn: '2024BCSE042',
              enrolledAt: '2024-11-12 10:30 AM',
              status: 'Attended',
              checkInTime: '2024-11-20 09:45 AM',
            },
            {
              id: `enr-${eventId}-2`,
              eventId: eventId,
              eventTitle: event?.title || 'Academic Event',
              userId: 'stu_dev_02',
              userEmail: 'diya.patel@campus.edu',
              userName: 'Diya Patel',
              userPrn: '2024BCSE089',
              enrolledAt: '2024-11-12 11:15 AM',
              status: 'Enrolled',
            },
            {
              id: `enr-${eventId}-3`,
              eventId: eventId,
              eventTitle: event?.title || 'Academic Event',
              userId: 'stu_dev_03',
              userEmail: 'rohan.deshmukh@campus.edu',
              userName: 'Rohan Deshmukh',
              userPrn: '2024BECE015',
              enrolledAt: '2024-11-13 02:40 PM',
              status: 'Enrolled',
            },
            {
              id: `enr-${eventId}-4`,
              eventId: eventId,
              eventTitle: event?.title || 'Academic Event',
              userId: 'stu_dev_04',
              userEmail: 'ananya.iyer@campus.edu',
              userName: 'Ananya Iyer',
              userPrn: '2024BAIDS007',
              enrolledAt: '2024-11-14 09:20 AM',
              status: 'Waitlisted',
            },
          ];
          setEnrolments(mockEnrolments);
        }
      } catch (err) {
        console.error('Error fetching enrolments:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, event?.title]);

  const handleToggleAttendance = async (enrolmentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Attended' ? 'Enrolled' : 'Attended';
    const checkInTime = newStatus === 'Attended' ? new Date().toLocaleTimeString() : undefined;

    setEnrolments((prev) =>
      prev.map((item) =>
        item.id === enrolmentId
          ? { ...item, status: newStatus as EnrolmentItem['status'], checkInTime }
          : item
      )
    );

    try {
      await updateEnrolmentFields(enrolmentId, {
        status: newStatus as EnrolmentItem['status'],
        checkInTime: checkInTime || '',
      });

      // Update attendance count on the event
      const updatedAttendedCount = enrolments.filter(
        (e) => (e.id === enrolmentId ? newStatus === 'Attended' : e.status === 'Attended')
      ).length;

      if (event) {
        const turnout = event.attendanceTarget > 0 ? Math.round((updatedAttendedCount / event.attendanceTarget) * 100) : 0;
        await updateEventFields(event.id, {
          attendanceValidated: updatedAttendedCount,
          attendanceTurnoutPercent: turnout,
        });

        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id
              ? { ...e, attendanceValidated: updatedAttendedCount, attendanceTurnoutPercent: turnout }
              : e
          )
        );
      }

      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || 'Committee Head',
          actorRole: profile?.role || 'head',
          action: newStatus === 'Attended' ? 'CHECK_IN_STUDENT' : 'REVERT_CHECK_IN',
          targetType: 'enrolment',
          targetId: enrolmentId,
          details: { status: newStatus },
        });
      }
    } catch (err) {
      console.error('Failed to update attendance:', err);
    }
  };

  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrn.trim()) return;

    const queryClean = quickPrn.trim().toUpperCase();
    const target = enrolments.find(
      (enr) => enr.userPrn.toUpperCase() === queryClean || enr.userEmail.toUpperCase() === queryClean
    );

    if (!target) {
      setCheckInMsg({ text: `No registration found matching PRN "${quickPrn}"`, success: false });
      return;
    }

    if (target.status === 'Attended') {
      setCheckInMsg({ text: `${target.userName} (${target.userPrn}) is ALREADY checked in.`, success: true });
      setQuickPrn('');
      return;
    }

    await handleToggleAttendance(target.id, target.status);
    setCheckInMsg({ text: `Checked in ${target.userName} (${target.userPrn})!`, success: true });
    setQuickPrn('');
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) return;
    setIsSendingBroadcast(true);

    try {
      for (const enr of enrolments) {
        await createNotification({
          userId: enr.userId,
          title: `[${event?.code || 'Notice'}] ${broadcastSubject}`,
          message: broadcastBody,
          type: 'event',
          read: false,
          link: `/student/events/${eventId}`,
        });
      }

      setIsBroadcastOpen(false);
      setBroadcastSubject('');
      setBroadcastBody('');
      setCheckInMsg({ text: `Broadcast dispatched to ${enrolments.length} registered delegates!`, success: true });
    } catch (err) {
      console.error('Failed to dispatch broadcast:', err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['PRN', 'Student Name', 'Email', 'Registration Date', 'Status', 'Check-In Timestamp'];
    const rows = enrolments.map((enr) => [
      enr.userPrn,
      `"${enr.userName}"`,
      enr.userEmail,
      enr.enrolledAt,
      enr.status,
      enr.checkInTime || 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Roster_${event?.code || eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEnrolments = enrolments.filter((enr) => {
    const matchesFilter = filter === 'All' || enr.status === filter;
    const matchesQuery =
      enr.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enr.userPrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enr.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const attendedCount = enrolments.filter((e) => e.status === 'Attended').length;
  const enrolledCount = enrolments.filter((e) => e.status === 'Enrolled' || e.status === 'Attended').length;
  const capacity = event?.attendanceTarget || 100;
  const attendanceRate = enrolledCount > 0 ? Math.round((attendedCount / enrolledCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/head" className="hover:text-indigo-400 transition-colors">
              Head Portal
            </Link>
            <span>/</span>
            <span className="text-slate-200">Event Registrations &amp; Check-In</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {event?.title || 'Event Roster Management'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ref: {event?.refNo} | Venue: {event?.venue} | Scheduled: {event?.dateStr}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>Broadcast Notice</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
          <Link
            href={`/head/events/${eventId}/post-event`}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/30"
          >
            <span className="material-symbols-outlined text-[16px]">task_alt</span>
            <span>Post-Event ATR &amp; Dossier</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Enrolled Total</div>
          <div className="text-2xl font-extrabold text-white mt-1">{enrolledCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cap: {capacity} seats</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Validated Present</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{attendedCount}</div>
          <div className="text-[11px] text-emerald-500/80 mt-0.5">{attendanceRate}% turnout</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Pending Arrival</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {Math.max(0, enrolledCount - attendedCount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting check-in</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Waitlisted</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">
            {enrolments.filter((e) => e.status === 'Waitlisted').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automatic standby</div>
        </div>
      </div>

      {/* Quick Check-In Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rapid QR &amp; PRN Check-In Desk</h3>
              <p className="text-xs text-slate-400">
                Scan attendee QR pass or enter student PRN to instantaneously validate presence.
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickCheckIn} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={quickPrn}
              onChange={(e) => setQuickPrn(e.target.value)}
              placeholder="Enter Student PRN (e.g. 2024BCSE042)..."
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-lg shadow-indigo-600/30"
            >
              Check In
            </button>
          </form>
        </div>

        {checkInMsg && (
          <div
            className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              checkInMsg.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border border-red-500/30 text-red-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {checkInMsg.success ? 'check_circle' : 'error'}
            </span>
            <span>{checkInMsg.text}</span>
          </div>
        )}
      </div>

      {/* Roster Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Filter & Search Header */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Enrolled', 'Attended', 'Waitlisted'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  filter === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, PRN, email..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Permanent Reg No (PRN)</th>
                <th className="py-3 px-4">Enrolment Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Check-In Log</th>
                <th className="py-3 px-4 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading registrations...
                  </td>
                </tr>
              ) : filteredEnrolments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No delegates found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredEnrolments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{enr.userName}</div>
                      <div className="text-[11px] text-slate-400">{enr.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">{enr.userPrn}</td>
                    <td className="py-3 px-4 text-slate-400">{enr.enrolledAt}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          enr.status === 'Attended'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : enr.status === 'Enrolled'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : enr.status === 'Waitlisted'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {enr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {enr.checkInTime ? (
                        <span className="text-emerald-400 font-medium">{enr.checkInTime}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleAttendance(enr.id, enr.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                          enr.status === 'Attended'
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {enr.status === 'Attended' ? 'close' : 'check'}
                        </span>
                        <span>{enr.status === 'Attended' ? 'Mark Absent' : 'Mark Present'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Notice Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">campaign</span>
                <h3 className="text-base font-bold text-white">Broadcast Announcement</h3>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This message will be sent in-app to all {enrolments.length} registered delegates of this event.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Venue update / Bring your laptop for Lab session..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Announcement Details
                </label>
                <textarea
                  rows={4}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Type the message body clearly..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={isSendingBroadcast || !broadcastSubject.trim() || !broadcastBody.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>{isSendingBroadcast ? 'Sending...' : 'Dispatch Announcement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
