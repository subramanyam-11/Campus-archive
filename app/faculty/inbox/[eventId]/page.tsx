'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { updateEventFields, logAuditEntry, createNotification } from '@/lib/firebase/firestore';
import type { EventStatus } from '@/src/types';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function FacultyEventDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const router = useRouter();

  const { events, setEvents } = useAppContext();
  const { user, profile } = useAuth();

  const event = events.find((e) => e.id === eventId) || null;
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string>('');

  // Venue conflict check against other events
  const conflictEvents = events.filter(
    (e) =>
      e.id !== eventId &&
      e.status !== 'Rejected' &&
      (e.rawDate === event?.rawDate || e.dateStr === event?.dateStr) &&
      e.venue.toLowerCase().trim() === event?.venue.toLowerCase().trim()
  );

  const handleReviewAction = async (action: 'Approve' | 'Reject' | 'RequestChanges') => {
    if (!event) return;

    if ((action === 'Reject' || action === 'RequestChanges') && !reviewComment.trim()) {
      setCommentError('Review remarks are mandatory for rejection or revisions.');
      return;
    }

    setIsSubmitting(true);
    let newStatus: EventStatus = 'Approved';
    if (action === 'Reject') newStatus = 'Rejected';
    if (action === 'RequestChanges') newStatus = 'Changes Requested';

    const timelineEntry = {
      step: `Faculty Review: ${action}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      actor: profile?.displayName || 'Faculty Convener',
      remarks: reviewComment || (action === 'Approve' ? 'Proposal approved for official scheduling.' : ''),
      cleared: action === 'Approve',
    };

    try {
      await updateEventFields(event.id, {
        status: newStatus,
        facultyComments: reviewComment,
        timeline: [...(event.timeline || []), timelineEntry],
      });

      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || 'Faculty Convener',
          actorRole: profile?.role || 'faculty',
          action: `FACULTY_${action.toUpperCase()}`,
          targetType: 'event',
          targetId: event.id,
          details: { comments: reviewComment, newStatus },
        });
      }

      await createNotification({
        userId: event.committeeCode || 'head_lead',
        title: `Proposal Decision: ${event.title}`,
        message: `Your event proposal was marked as ${newStatus} by Faculty Convener.`,
        type: 'approval',
        read: false,
        link: `/head/events/create?edit=${event.id}`,
      });

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                status: newStatus,
                facultyComments: reviewComment,
                timeline: [...(e.timeline || []), timelineEntry],
              }
            : e
        )
      );

      router.push('/faculty');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading proposal details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/faculty" className="hover:text-emerald-400 transition-colors">
              Approval Inbox
            </Link>
            <span>/</span>
            <span className="text-slate-200">Proposal Scrutiny</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{event.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ref: {event.refNo} | Committee: {event.committee} ({event.committeeCode})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              event.status === 'Approved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : event.status === 'Pending'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : event.status === 'Changes Requested'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {event.status}
          </span>
        </div>
      </div>

      {/* Conflict Alert Banner */}
      {conflictEvents.length > 0 && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-3">
          <span className="material-symbols-outlined text-lg shrink-0 mt-0.5 text-rose-400">
            warning
          </span>
          <div className="space-y-1">
            <span className="font-bold text-sm block text-rose-200">
              Venue &amp; Schedule Conflict Detected!
            </span>
            <p>
              The requested venue <strong className="text-white">{event.venue}</strong> is already booked on{' '}
              <strong className="text-white">{event.dateStr}</strong> by:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 mt-1 text-rose-200/90 font-medium">
              {conflictEvents.map((c) => (
                <li key={c.id}>
                  {c.title} ({c.committee}) — Status: {c.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grid of Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logistics & Scope */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-2">
            Schedule &amp; Logistical Setup
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Target Date:</span>
            <span className="text-white font-medium">{event.dateStr}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Allocated Venue:</span>
            <span className="text-white font-medium">{event.venue}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Delegate Capacity:</span>
            <span className="text-white font-medium">{event.attendanceTarget} Delegates</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Category:</span>
            <span className="text-white font-medium">{event.category}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Department:</span>
            <span className="text-white font-medium">{event.department}</span>
          </div>
        </div>

        {/* Finance & Accreditation */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-2">
            Financial &amp; Accreditation Metrics
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Sanctioned Budget:</span>
            <span className="text-emerald-400 font-bold">
              ₹{event.budgetSanctioned.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">NAAC Criterion:</span>
            <span className="text-purple-300 font-medium">{event.naacCategory}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Convener Lead:</span>
            <span className="text-white font-medium">{event.convener}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Digital Credentials:</span>
            <span className="text-indigo-400 font-medium">
              {event.certificatesIssued ? 'Enabled' : 'Draft / Configured'}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Finance Note:</span>
            <span className="text-slate-300 font-medium">{event.utilizationNote}</span>
          </div>
        </div>
      </div>

      {/* Academic Objective */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-400">Program Learning Objectives</div>
        <p className="text-slate-300 leading-relaxed">{event.objective}</p>
      </div>

      {/* Audit History Timeline */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-400">Proposal Scrutiny &amp; Audit Trail</div>
        <div className="space-y-3">
          {event.timeline?.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 border-l-2 border-slate-800 pl-4 relative">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -left-[5.5px] top-1"></span>
              <div>
                <div className="font-semibold text-white">{step.step}</div>
                <div className="text-[11px] text-slate-400">
                  {step.date} by {step.actor}
                </div>
                {step.remarks && <div className="text-slate-300 mt-0.5">{step.remarks}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Action Controls */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="text-sm font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">rate_review</span>
          <span>Faculty Review Determination</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Review Remarks &amp; Feedback
          </label>
          <textarea
            rows={3}
            value={reviewComment}
            onChange={(e) => {
              setReviewComment(e.target.value);
              setCommentError('');
            }}
            placeholder="Enter sanction notes, conditions of approval, or required revisions..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {commentError && <p className="text-[11px] text-red-400 mt-1">{commentError}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800 flex-wrap">
          <button
            onClick={() => handleReviewAction('RequestChanges')}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Request Changes</span>
          </button>

          <button
            onClick={() => handleReviewAction('Reject')}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            <span>Reject Proposal</span>
          </button>

          <button
            onClick={() => handleReviewAction('Approve')}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/30"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{isSubmitting ? 'Recording Decision...' : 'Sanction & Approve Proposal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
