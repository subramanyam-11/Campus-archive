'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { updateEventFields, logAuditEntry, createNotification } from '@/lib/firebase/firestore';
import type { EventItem, EventStatus } from '@/src/types';

export default function FacultyInboxPage() {
  const { events, setEvents } = useAppContext();
  const { user, profile } = useAuth();

  const [tab, setTab] = useState<'Pending' | 'Approved' | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCommittee, setSelectedCommittee] = useState<string>('All');

  // Review Modal state
  const [activeReviewEvent, setActiveReviewEvent] = useState<EventItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approve' | 'Reject' | 'RequestChanges'>('Approve');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string>('');

  // Conflict detection: map events by date + venue
  const conflictMap = new Map<string, string[]>();
  events.forEach((evt) => {
    if (evt.status !== 'Rejected') {
      const key = `${evt.rawDate || evt.dateStr}_${evt.venue.toLowerCase().trim()}`;
      const existing = conflictMap.get(key) || [];
      conflictMap.set(key, [...existing, evt.id]);
    }
  });

  const hasConflict = (evt: EventItem): boolean => {
    const key = `${evt.rawDate || evt.dateStr}_${evt.venue.toLowerCase().trim()}`;
    const matchedIds = conflictMap.get(key) || [];
    return matchedIds.length > 1;
  };

  const pendingEvents = events.filter((e) => e.status === 'Pending' || e.status === 'Changes Requested');
  const approvedEvents = events.filter((e) => e.status === 'Approved');

  const displayedEvents = events.filter((evt) => {
    const matchesTab =
      tab === 'Pending'
        ? evt.status === 'Pending' || evt.status === 'Changes Requested'
        : tab === 'Approved'
        ? evt.status === 'Approved'
        : true;

    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.committee.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCommittee = selectedCommittee === 'All' || evt.committee === selectedCommittee;

    return matchesTab && matchesSearch && matchesCommittee;
  });

  const handleOpenReview = (evt: EventItem, action: 'Approve' | 'Reject' | 'RequestChanges') => {
    setActiveReviewEvent(evt);
    setReviewAction(action);
    setReviewComment('');
    setCommentError('');
  };

  const handleExecuteReview = async () => {
    if (!activeReviewEvent) return;

    if ((reviewAction === 'Reject' || reviewAction === 'RequestChanges') && !reviewComment.trim()) {
      setCommentError('Review remarks are mandatory for rejection or change requests.');
      return;
    }

    setIsSubmitting(true);
    let newStatus: EventStatus = 'Approved';
    if (reviewAction === 'Reject') newStatus = 'Rejected';
    if (reviewAction === 'RequestChanges') newStatus = 'Changes Requested';

    const actionText =
      reviewAction === 'Approve'
        ? 'Proposal Sanctioned & Cleared'
        : reviewAction === 'Reject'
        ? 'Proposal Rejected'
        : 'Revisions Requested';

    const timelineEntry = {
      step: `Faculty Review: ${reviewAction}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      actor: profile?.displayName || 'Faculty Convener',
      remarks: reviewComment || (reviewAction === 'Approve' ? 'Cleared for venue and budget execution.' : ''),
      cleared: reviewAction === 'Approve',
    };

    try {
      // 1. Update event in Firestore
      await updateEventFields(activeReviewEvent.id, {
        status: newStatus,
        facultyComments: reviewComment,
        timeline: [...(activeReviewEvent.timeline || []), timelineEntry],
      });

      // 2. Log in Audit Ledger
      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || 'Faculty Convener',
          actorRole: profile?.role || 'faculty',
          action: `FACULTY_${reviewAction.toUpperCase()}`,
          targetType: 'event',
          targetId: activeReviewEvent.id,
          details: {
            title: activeReviewEvent.title,
            newStatus,
            comments: reviewComment,
          },
        });
      }

      // 3. Dispatch Notification to Committee
      await createNotification({
        userId: activeReviewEvent.committeeCode || 'head_lead',
        title: `Proposal Decision: ${activeReviewEvent.title}`,
        message: `${actionText} by Faculty Convener. Remarks: ${reviewComment || 'Academic clearance granted.'}`,
        type: 'approval',
        read: false,
        link: `/head/events/create?edit=${activeReviewEvent.id}`,
      });

      // 4. Update state
      setEvents((prev) =>
        prev.map((e) =>
          e.id === activeReviewEvent.id
            ? {
                ...e,
                status: newStatus,
                facultyComments: reviewComment,
                timeline: [...(e.timeline || []), timelineEntry],
              }
            : e
        )
      );

      setActiveReviewEvent(null);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const committeesList = Array.from(new Set(events.map((e) => e.committee)));

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Faculty Convener Clearance Desk
          </div>
          <h1 className="text-2xl font-extrabold text-white">Event Approval &amp; Scrutiny Inbox</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Review submitted collegiate event proposals, inspect budget allocations, audit venue scheduling conflicts, and grant statutory academic clearance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/faculty/calendar"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>View Timeline Calendar</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Awaiting Clearance</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{pendingEvents.length}</div>
          <div className="text-[11px] text-amber-500/80 mt-0.5">High priority action</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Sanctioned Events</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{approvedEvents.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active on campus calendar</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Venue Clashes Detected</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">
            {events.filter(hasConflict).length}
          </div>
          <div className="text-[11px] text-rose-500/80 mt-0.5">Requires schedule re-allocation</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Proposals Filed</div>
          <div className="text-2xl font-extrabold text-white mt-1">{events.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">This academic year</div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['Pending', 'Approved', 'All'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                tab === t
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t === 'Pending' ? `Pending Review (${pendingEvents.length})` : t}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Committees</option>
            {committeesList.map((comm) => (
              <option key={comm} value={comm}>
                {comm}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposals, ref, committee..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {displayedEvents.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No event proposals matching current criteria.
          </div>
        ) : (
          displayedEvents.map((evt) => {
            const conflict = hasConflict(evt);
            return (
              <div
                key={evt.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {evt.refNo}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">{evt.committee}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{evt.category}</span>
                    {conflict && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Venue Clash Detected
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    <Link
                      href={`/faculty/inbox/${evt.id}`}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {evt.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1">{evt.objective}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-500">event</span>
                      {evt.dateStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-500">location_on</span>
                      {evt.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-500">payments</span>
                      ₹{evt.budgetSanctioned.toLocaleString('en-IN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-500">group</span>
                      {evt.attendanceTarget} Capacity
                    </span>
                  </div>

                  {evt.facultyComments && (
                    <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
                      <span className="font-semibold text-amber-400">Previous Review: </span>
                      {evt.facultyComments}
                    </div>
                  )}
                </div>

                {/* Status & Review Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <Link
                    href={`/faculty/inbox/${evt.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Inspect</span>
                  </Link>

                  {evt.status !== 'Approved' && (
                    <button
                      onClick={() => handleOpenReview(evt, 'Approve')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Approve</span>
                    </button>
                  )}

                  {evt.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleOpenReview(evt, 'RequestChanges')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Request Changes</span>
                      </button>

                      <button
                        onClick={() => handleOpenReview(evt, 'Reject')}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {activeReviewEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined ${
                    reviewAction === 'Approve'
                      ? 'text-emerald-400'
                      : reviewAction === 'Reject'
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  {reviewAction === 'Approve'
                    ? 'verified'
                    : reviewAction === 'Reject'
                    ? 'gavel'
                    : 'edit_note'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {reviewAction === 'Approve'
                    ? 'Sanction Event Proposal'
                    : reviewAction === 'Reject'
                    ? 'Reject Event Proposal'
                    : 'Request Proposal Revisions'}
                </h3>
              </div>
              <button
                onClick={() => setActiveReviewEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-white">{activeReviewEvent.title}</div>
              <div className="text-slate-400">
                Organized by {activeReviewEvent.committee} | Date: {activeReviewEvent.dateStr} | Venue:{' '}
                {activeReviewEvent.venue}
              </div>
              <div className="text-slate-400">
                Budget: ₹{activeReviewEvent.budgetSanctioned.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Faculty Review Comments{' '}
                {reviewAction !== 'Approve' && <span className="text-red-400">* (Mandatory)</span>}
              </label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => {
                  setReviewComment(e.target.value);
                  setCommentError('');
                }}
                placeholder={
                  reviewAction === 'Approve'
                    ? 'Optional sanction remarks or logistical conditions...'
                    : 'Explain specific concerns or required modifications...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {commentError && <p className="text-[11px] text-red-400 mt-1">{commentError}</p>}
            </div>

            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">security</span>
              <span>
                Your decision will be recorded with timestamp in the institutional audit ledger and dispatched to the committee head.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveReviewEvent(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReview}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  reviewAction === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'
                    : reviewAction === 'Reject'
                    ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30'
                } disabled:opacity-50`}
              >
                <span className="material-symbols-outlined text-[16px]">done</span>
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : reviewAction === 'Approve'
                    ? 'Confirm & Sanction'
                    : reviewAction === 'Reject'
                    ? 'Confirm Rejection'
                    : 'Send Revisions'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
