'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { getEnrolments, updateEnrolmentFields, logAuditEntry } from '@/lib/firebase/firestore';
import type { EnrolmentItem, EventItem } from '@/src/types';
import QRCode from 'qrcode';

const DEFAULT_ENROLMENTS: EnrolmentItem[] = [
  {
    id: 'enr-101',
    eventId: 'evt-01',
    eventTitle: 'National Symposium on Quantum Computing',
    userId: 'stu_dev_01',
    userEmail: 'student@campus.edu',
    userName: 'Aarav Sharma',
    userPrn: '2024BCSE042',
    enrolledAt: '2024-11-12 10:30 AM',
    status: 'Attended',
    checkInTime: '09:45 AM',
    certificateId: 'CERT-EV-8901-0042',
    feedbackSubmitted: true,
  },
  {
    id: 'enr-102',
    eventId: 'evt-02',
    eventTitle: 'Deep Learning Bootcamp & AI Lab',
    userId: 'stu_dev_01',
    userEmail: 'student@campus.edu',
    userName: 'Aarav Sharma',
    userPrn: '2024BCSE042',
    enrolledAt: '2024-11-14 03:15 PM',
    status: 'Enrolled',
  },
];

export default function StudentMyEventsPage() {
  const { events } = useAppContext();
  const { user, profile } = useAuth();

  const [enrolments, setEnrolments] = useState<EnrolmentItem[]>(DEFAULT_ENROLMENTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [tab, setTab] = useState<'All' | 'Enrolled' | 'Attended'>('All');

  // QR Pass Modal
  const [activePass, setActivePass] = useState<{ enrolment: EnrolmentItem; event?: EventItem; qrUrl: string } | null>(null);

  // Feedback Modal
  const [feedbackEnrolment, setFeedbackEnrolment] = useState<EnrolmentItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  const studentUid = user?.uid || 'stu_dev_01';

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadMyEvents() {
      try {
        setLoading(true);
        const records = await getEnrolments(undefined, studentUid);
        if (isMounted && records.length > 0) {
          setEnrolments(records);
        }
      } catch {
        // Retain initial enrolments fallback
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMyEvents();
    return () => {
      isMounted = false;
    };
  }, [user, studentUid]);

  const handleOpenPass = async (enr: EnrolmentItem) => {
    const matchedEvent = events.find((e) => e.id === enr.eventId);
    const qrPayload = JSON.stringify({
      prn: enr.userPrn,
      eventId: enr.eventId,
      enrolmentId: enr.id,
      name: enr.userName,
    });
    const url = await QRCode.toDataURL(qrPayload, { width: 220, margin: 1 });
    setActivePass({ enrolment: enr, event: matchedEvent, qrUrl: url });
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackEnrolment) return;
    setIsSubmittingFeedback(true);

    try {
      await updateEnrolmentFields(feedbackEnrolment.id, {
        feedbackSubmitted: true,
      });

      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || 'Student',
          actorRole: 'student',
          action: 'SUBMIT_EVENT_FEEDBACK',
          targetType: 'enrolment',
          targetId: feedbackEnrolment.id,
          details: { rating, comments: feedbackComment },
        });
      }

      setEnrolments((prev) =>
        prev.map((e) => (e.id === feedbackEnrolment.id ? { ...e, feedbackSubmitted: true } : e))
      );

      setFeedbackEnrolment(null);
      setFeedbackComment('');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const filtered = enrolments.filter((e) => {
    if (tab === 'All') return true;
    return e.status === tab;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Delegate Activity Desk
          </div>
          <h1 className="text-2xl font-extrabold text-white">My Registrations &amp; Entry Passes</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Access your QR barcodes for check-in on event day, provide post-event feedback ratings, and track certificate issuance.
          </p>
        </div>

        <Link
          href="/student/certificates"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30 shrink-0 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
          <span>View Issued Certificates</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['All', 'Enrolled', 'Attended'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              tab === t
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t} ({enrolments.filter((e) => (t === 'All' ? true : e.status === t)).length})
          </button>
        ))}
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading registrations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No registrations found in this category.{' '}
            <Link href="/student" className="text-blue-400 hover:underline">
              Browse upcoming events
            </Link>
          </div>
        ) : (
          filtered.map((enr) => {
            const matchedEvent = events.find((e) => e.id === enr.eventId);
            return (
              <div
                key={enr.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        enr.status === 'Attended'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : enr.status === 'Enrolled'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {enr.status}
                    </span>
                    <span className="text-xs text-slate-400">Enrolled: {enr.enrolledAt}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    <Link
                      href={`/student/events/${enr.eventId}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {enr.eventTitle}
                    </Link>
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-slate-500">
                        calendar_month
                      </span>
                      {matchedEvent?.dateStr || 'Scheduled'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-slate-500">
                        location_on
                      </span>
                      {matchedEvent?.venue || 'Campus Auditorium'}
                    </span>
                    {enr.checkInTime && (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <span className="material-symbols-outlined text-[14px]">done_all</span>
                        Checked In at {enr.checkInTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {enr.status === 'Enrolled' && (
                    <button
                      onClick={() => handleOpenPass(enr)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                      <span>Digital QR Pass</span>
                    </button>
                  )}

                  {enr.status === 'Attended' && !enr.feedbackSubmitted && (
                    <button
                      onClick={() => setFeedbackEnrolment(enr)}
                      className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">rate_review</span>
                      <span>Submit Feedback</span>
                    </button>
                  )}

                  {enr.status === 'Attended' && enr.feedbackSubmitted && (
                    <Link
                      href="/student/certificates"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                      <span>Get Certificate</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Pass Modal */}
      {activePass && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Official Event Entry Pass
              </span>
              <button
                onClick={() => setActivePass(null)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{activePass.enrolment.eventTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {activePass.event?.dateStr} @ {activePass.event?.venue}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activePass.qrUrl} alt="Entry Pass Barcode" className="w-48 h-48" />
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-white">{activePass.enrolment.userName}</div>
              <div className="font-mono text-slate-400">PRN: {activePass.enrolment.userPrn}</div>
              <div className="text-[11px] text-slate-500">
                Show this barcode at the venue check-in desk for validation.
              </div>
            </div>

            <button
              onClick={() => setActivePass(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackEnrolment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">rate_review</span>
                <h3 className="text-base font-bold text-white">Post-Event Feedback</h3>
              </div>
              <button
                onClick={() => setFeedbackEnrolment(null)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Please rate your experience for <strong>{feedbackEnrolment.eventTitle}</strong>. Your feedback is required for statutory NAAC compliance and unlocks your digital certificate.
            </p>

            {/* Star Rating */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-amber-400 text-2xl hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined">
                      {star <= rating ? 'star' : 'star_border'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Comments &amp; Suggestions
              </label>
              <textarea
                rows={3}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="What did you learn? Any suggestions for upcoming workshops?..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setFeedbackEnrolment(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <span>{isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
