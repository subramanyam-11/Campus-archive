'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import {
  getEnrolments,
  saveEnrolment,
  updateEnrolmentFields,
  updateEventFields,
  logAuditEntry,
  createNotification,
} from '@/lib/firebase/firestore';
import type { EnrolmentItem } from '@/src/types';
import QRCode from 'qrcode';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function StudentEventDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const { events, setEvents } = useAppContext();
  const { user, profile } = useAuth();

  const event = events.find((e) => e.id === eventId) || null;
  const [enrolment, setEnrolment] = useState<EnrolmentItem | null>(null);
  const [totalEnrolledCount, setTotalEnrolledCount] = useState<number>(() => {
    return events.find((e) => e.id === eventId)?.attendanceValidated || 12;
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);

  const studentUid = user?.uid || 'stu_dev_01';
  const studentEmail = user?.email || 'student@campus.edu';
  const studentName = profile?.displayName || 'Student Delegate';
  const studentPrn = profile?.prn || '2024BCSE042';

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function checkStudentEnrolment() {
      try {
        const records = await getEnrolments(eventId);
        if (!isMounted) return;
        setTotalEnrolledCount(records.length || event?.attendanceValidated || 0);

        const myRecord = records.find(
          (r) => r.userId === studentUid || r.userPrn === studentPrn
        );

        if (myRecord) {
          setEnrolment(myRecord);
          // Generate pass QR
          const qrPayload = JSON.stringify({
            prn: myRecord.userPrn,
            eventId: myRecord.eventId,
            enrolmentId: myRecord.id,
            name: myRecord.userName,
          });
          const url = await QRCode.toDataURL(qrPayload, { width: 200, margin: 1 });
          if (isMounted) setQrDataUrl(url);
        }
      } catch {
        // Keep initial count
      }
    }

    checkStudentEnrolment();
    return () => {
      isMounted = false;
    };
  }, [user, eventId, studentUid, studentPrn, event?.attendanceValidated]);

  const handleEnrol = async () => {
    if (!event) return;
    setIsProcessing(true);

    const isWaitlist = totalEnrolledCount >= event.attendanceTarget;
    const enrolmentId = `enr-${eventId}-${studentPrn}-${Date.now()}`;

    const newEnrolment: EnrolmentItem = {
      id: enrolmentId,
      eventId: event.id,
      eventTitle: event.title,
      userId: studentUid,
      userEmail: studentEmail,
      userName: studentName,
      userPrn: studentPrn,
      enrolledAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: isWaitlist ? 'Waitlisted' : 'Enrolled',
    };

    try {
      await saveEnrolment(newEnrolment);

      // Increment attendance on event
      const updatedCount = totalEnrolledCount + 1;
      setTotalEnrolledCount(updatedCount);

      await updateEventFields(event.id, {
        attendanceValidated: updatedCount,
      });

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, attendanceValidated: updatedCount } : e))
      );

      // Log in audit ledger
      await logAuditEntry({
        actorUid: studentUid,
        actorName: studentName,
        actorRole: 'student',
        action: isWaitlist ? 'STUDENT_WAITLIST' : 'STUDENT_ENROL',
        targetType: 'enrolment',
        targetId: enrolmentId,
        details: { eventId: event.id, title: event.title },
      });

      // Send in-app notification
      await createNotification({
        userId: studentUid,
        title: isWaitlist ? `Waitlisted: ${event.title}` : `Enrolment Confirmed: ${event.title}`,
        message: isWaitlist
          ? `You have been placed on the priority waitlist for ${event.title}.`
          : `Your seat has been reserved. You can now access your digital QR pass in My Passes.`,
        type: 'event',
        read: false,
        link: '/student/my-events',
      });

      setEnrolment(newEnrolment);

      // Generate QR
      const qrPayload = JSON.stringify({
        prn: newEnrolment.userPrn,
        eventId: newEnrolment.eventId,
        enrolmentId: newEnrolment.id,
        name: newEnrolment.userName,
      });
      const url = await QRCode.toDataURL(qrPayload, { width: 200, margin: 1 });
      setQrDataUrl(url);
      setIsPassModalOpen(true);
    } catch (err) {
      console.error('Failed to enrol:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!enrolment || !event) return;
    setIsProcessing(true);

    try {
      await updateEnrolmentFields(enrolment.id, {
        status: 'Withdrawn',
      });

      const updatedCount = Math.max(0, totalEnrolledCount - 1);
      setTotalEnrolledCount(updatedCount);

      await updateEventFields(event.id, {
        attendanceValidated: updatedCount,
      });

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, attendanceValidated: updatedCount } : e))
      );

      await logAuditEntry({
        actorUid: studentUid,
        actorName: studentName,
        actorRole: 'student',
        action: 'STUDENT_WITHDRAW',
        targetType: 'enrolment',
        targetId: enrolment.id,
      });

      setEnrolment(null);
    } catch (err) {
      console.error('Failed to withdraw:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!event) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading event details...
      </div>
    );
  }

  const seatsRemaining = Math.max(0, event.attendanceTarget - totalEnrolledCount);
  const isFull = seatsRemaining === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/student" className="hover:text-blue-400 transition-colors">
              Discover Events
            </Link>
            <span>/</span>
            <span className="text-slate-200">Event Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{event.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organized by <strong className="text-slate-200">{event.committee}</strong> ({event.committeeCode})
          </p>
        </div>

        <Link
          href="/student"
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Key Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Date &amp; Time</span>
          <div className="text-sm font-bold text-white mt-1">{event.dateStr}</div>
          <span className="text-[10px] text-slate-500">09:30 AM – 04:30 PM</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Venue Space</span>
          <div className="text-sm font-bold text-white mt-1">{event.venue}</div>
          <span className="text-[10px] text-slate-500">Campus Auditorium</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Available Seats</span>
          <div className="text-sm font-bold text-emerald-400 mt-1">
            {isFull ? 'Waitlist Open' : `${seatsRemaining} Seats Left`}
          </div>
          <span className="text-[10px] text-slate-500">Cap: {event.attendanceTarget} delegates</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Credential</span>
          <div className="text-sm font-bold text-indigo-400 mt-1">Verifiable QR</div>
          <span className="text-[10px] text-slate-500">NAAC Approved</span>
        </div>
      </div>

      {/* Main Content & Registration Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description & Details */}
        <div className="md:col-span-2 space-y-5">
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">description</span>
              About this Collegiate Program
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">{event.objective}</p>
          </div>

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">school</span>
              Academic Accreditation &amp; Benefits
            </h2>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5">
              <li>
                Accredited under <strong>{event.naacCategory}</strong> for institutional quality points.
              </li>
              <li>
                Verifiable digital certificate issued upon confirmed attendance and feedback submission.
              </li>
              <li>
                Hands-on practical experience and networking with domain experts and senior faculty.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Registration Box */}
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-bold text-blue-400">Delegate Status</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {enrolment?.status === 'Attended'
                  ? 'Attendance Validated'
                  : enrolment?.status === 'Enrolled'
                  ? 'Enrolment Confirmed'
                  : enrolment?.status === 'Waitlisted'
                  ? 'On Standby Waitlist'
                  : 'Open for Registration'}
              </h3>
            </div>

            {enrolment ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Registered under PRN: {enrolment.userPrn}</span>
                </div>

                <button
                  onClick={() => setIsPassModalOpen(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  <span>View Digital QR Entry Pass</span>
                </button>

                <button
                  onClick={handleWithdraw}
                  disabled={isProcessing}
                  className="w-full py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl text-xs font-semibold transition-colors border border-slate-800"
                >
                  {isProcessing ? 'Processing...' : 'Withdraw Enrolment'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Registration is open to all bona fide engineering and management students.
                </p>

                <button
                  onClick={handleEnrol}
                  disabled={isProcessing}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors ${
                    isFull
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  } disabled:opacity-50`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFull ? 'hourglass_top' : 'how_to_reg'}
                  </span>
                  <span>
                    {isProcessing
                      ? 'Confirming...'
                      : isFull
                      ? 'Join Standby Waitlist'
                      : 'Instant Enrolment'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Pass Modal */}
      {isPassModalOpen && enrolment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Digital Attendance Pass
              </span>
              <button
                onClick={() => setIsPassModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{event.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {event.dateStr} @ {event.venue}
              </p>
            </div>

            {/* QR Image */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qrDataUrl && <img src={qrDataUrl} alt="Attendance QR Code" className="w-48 h-48" />}
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-white">{enrolment.userName}</div>
              <div className="font-mono text-slate-400">PRN: {enrolment.userPrn}</div>
              <div className="text-[11px] text-slate-500">
                Show this barcode at the venue check-in desk for immediate verification.
              </div>
            </div>

            <button
              onClick={() => setIsPassModalOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
