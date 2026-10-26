'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import {
  getEnrolments,
  saveCertificate,
  updateEventFields,
  updateEnrolmentFields,
  logAuditEntry,
  createNotification,
} from '@/lib/firebase/firestore';
import { generateEventDossierPdf } from '@/lib/pdf/generateEventReport';
import { computeBufferSha256 } from '@/lib/crypto/hash';
import type { EventItem, EnrolmentItem, CertificateItem } from '@/src/types';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function PostEventAtrPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const router = useRouter();

  const { events, setEvents } = useAppContext();
  const { user, profile } = useAuth();

  const event = events.find((e) => e.id === eventId) || null;
  const [enrolments, setEnrolments] = useState<EnrolmentItem[]>([]);

  // ATR Form inputs
  const [executiveSummary, setExecutiveSummary] = useState<string>(() => {
    const found = events.find((e) => e.id === eventId);
    return found?.objective || 'The program was conducted successfully with high active participation across departments.';
  });
  const [outcomesKey1, setOutcomesKey1] = useState<string>('94% of delegates reported measurable skill improvement in hands-on tasks.');
  const [outcomesKey2, setOutcomesKey2] = useState<string>('12 working prototypes deployed to GitHub repositories during the event.');
  const [finalBudgetUtilized, setFinalBudgetUtilized] = useState<number>(() => {
    const found = events.find((e) => e.id === eventId);
    return found?.budgetUtilized || (found ? Math.round(found.budgetSanctioned * 0.92) : 0);
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
  ]);

  // Dossier state
  const [dossierUrl, setDossierUrl] = useState<string | null>(null);
  const [dossierSha256, setDossierSha256] = useState<string | null>(null);
  const [isGeneratingDossier, setIsGeneratingDossier] = useState<boolean>(false);

  // Certification state
  const [isIssuingCerts, setIsIssuingCerts] = useState<boolean>(false);
  const [certsIssuedCount, setCertsIssuedCount] = useState<number | null>(null);
  const [isSavingAtr, setIsSavingAtr] = useState<boolean>(false);

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const records = await getEnrolments(eventId);
        if (records.length > 0) {
          setEnrolments(records);
        } else {
          // Fallback mock data
          setEnrolments([
            {
              id: `enr-${eventId}-1`,
              eventId,
              eventTitle: event?.title || 'Academic Event',
              userId: 'stu_dev_01',
              userEmail: 'aarav.sharma@campus.edu',
              userName: 'Aarav Sharma',
              userPrn: '2024BCSE042',
              enrolledAt: '2024-11-12',
              status: 'Attended',
              checkInTime: '09:45 AM',
            },
            {
              id: `enr-${eventId}-2`,
              eventId,
              eventTitle: event?.title || 'Academic Event',
              userId: 'stu_dev_02',
              userEmail: 'diya.patel@campus.edu',
              userName: 'Diya Patel',
              userPrn: '2024BCSE089',
              enrolledAt: '2024-11-12',
              status: 'Attended',
              checkInTime: '10:05 AM',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch enrolments:', err);
      }
    }

    fetchRegistrations();
  }, [eventId, event?.title]);

  const attendedList = enrolments.filter((e) => e.status === 'Attended');

  // Generate Dossier PDF
  const handleGenerateDossier = async () => {
    if (!event) return;
    setIsGeneratingDossier(true);
    try {
      const updatedEvent: EventItem = {
        ...event,
        budgetUtilized: Number(finalBudgetUtilized) || event.budgetSanctioned,
        attendanceValidated: attendedList.length || event.attendanceValidated,
        outcomesAtr: [
          outcomesKey1,
          outcomesKey2,
          executiveSummary,
        ].filter(Boolean),
      };

      const result = await generateEventDossierPdf(updatedEvent);
      setDossierUrl(result.blobUrl);
      setDossierSha256(result.sha256Hash);

      // Save SHA-256 to Firestore
      await updateEventFields(event.id, {
        dossierSha256: result.sha256Hash,
        budgetUtilized: Number(finalBudgetUtilized),
        attendanceValidated: attendedList.length,
      });

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, dossierSha256: result.sha256Hash, budgetUtilized: Number(finalBudgetUtilized) }
            : e
        )
      );

      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || 'Committee Head',
          actorRole: profile?.role || 'head',
          action: 'GENERATE_EVENT_DOSSIER',
          targetType: 'event',
          targetId: event.id,
          details: { sha256: result.sha256Hash },
        });
      }
    } catch (err) {
      console.error('Failed to generate dossier:', err);
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  // Bulk Issue Certificates
  const handleIssueCertificates = async () => {
    if (!event) return;
    setIsIssuingCerts(true);

    try {
      let count = 0;
      for (let idx = 0; idx < attendedList.length; idx++) {
        const student = attendedList[idx];
        const certId = `CERT-${event.code || 'EV'}-${student.userPrn.slice(-4)}-${1000 + idx + 1}`;
        const certData = `${certId}|${student.userPrn}|${event.title}|${event.dateStr}`;
        const encoder = new TextEncoder();
        const encodedBytes = encoder.encode(certData);
        const hash = await computeBufferSha256(encodedBytes.buffer as ArrayBuffer);

        const newCert: CertificateItem = {
          id: certId,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.dateStr,
          committeeName: event.committee,
          studentUid: student.userId,
          studentName: student.userName,
          studentPrn: student.userPrn,
          issuedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          sha256Hash: hash,
          qrCodeData: `/verify/${certId}`,
          status: 'Valid',
        };

        // 1. Save certificate document
        await saveCertificate(newCert);

        // 2. Link certificate to student enrolment
        await updateEnrolmentFields(student.id, {
          certificateId: certId,
        });

        // 3. Dispatch Notification to student
        await createNotification({
          userId: student.userId,
          title: `Certificate Issued: ${event.title}`,
          message: `Your verified certificate for ${event.title} is now ready for download with QR verification ID ${certId}.`,
          type: 'certificate',
          read: false,
          link: '/student/certificates',
        });

        count++;
      }

      // Mark event as certificatesIssued
      await updateEventFields(event.id, {
        certificatesIssued: true,
      });

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, certificatesIssued: true } : e))
      );

      setCertsIssuedCount(count);

      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || 'Committee Head',
          actorRole: profile?.role || 'head',
          action: 'BULK_ISSUE_CERTIFICATES',
          targetType: 'event',
          targetId: event.id,
          details: { certificatesCount: count },
        });
      }
    } catch (err) {
      console.error('Failed to issue certificates:', err);
    } finally {
      setIsIssuingCerts(false);
    }
  };

  // Submit Final ATR to Archive
  const handleFinalAtrSubmit = async () => {
    if (!event) return;
    setIsSavingAtr(true);

    try {
      const surplus = Math.max(0, event.budgetSanctioned - finalBudgetUtilized);
      const turnout = event.attendanceTarget > 0 ? Math.round((attendedList.length / event.attendanceTarget) * 100) : 0;

      await updateEventFields(event.id, {
        budgetUtilized: Number(finalBudgetUtilized),
        surplusReturned: surplus,
        attendanceValidated: attendedList.length,
        attendanceTurnoutPercent: turnout,
        status: 'Approved', // Completed with ATR cleared
        utilizationNote: `Final ATR filed on ${new Date().toLocaleDateString('en-GB')}. Surplus returned: ₹${surplus.toLocaleString('en-IN')}`,
        outcomesAtr: [outcomesKey1, outcomesKey2, executiveSummary],
        photos: photoUrls.map((url, idx) => ({
          url,
          caption: `Official Event Photo ${idx + 1}`,
          alt: `Evidence Photo ${idx + 1}`,
        })),
      });

      // Log in audit ledger
      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || 'Committee Head',
          actorRole: profile?.role || 'head',
          action: 'SUBMIT_ACTION_TAKEN_REPORT',
          targetType: 'event',
          targetId: event.id,
          details: {
            turnout,
            budgetUtilized: finalBudgetUtilized,
            surplus,
          },
        });
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                budgetUtilized: Number(finalBudgetUtilized),
                surplusReturned: surplus,
                attendanceValidated: attendedList.length,
                attendanceTurnoutPercent: turnout,
              }
            : e
        )
      );

      router.push('/head');
    } catch (err) {
      console.error('Failed to save ATR:', err);
    } finally {
      setIsSavingAtr(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/head" className="hover:text-indigo-400 transition-colors">
              Head Portal
            </Link>
            <span>/</span>
            <span className="text-slate-200">Post-Event ATR &amp; Dossier</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Action Taken Report (ATR) Filing Desk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Event: <span className="text-slate-200 font-semibold">{event?.title}</span> ({event?.code})
          </p>
        </div>

        <Link
          href={`/head/events/${eventId}/manage`}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Registrations</span>
        </Link>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Validated Present</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{attendedList.length} Students</div>
          <span className="text-[10px] text-slate-500">Eligible for certificates</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Sanctioned Budget</span>
          <div className="text-xl font-bold text-white mt-0.5">
            ₹{event?.budgetSanctioned.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[10px] text-slate-500">Finance sanctioned</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">NAAC Tag</span>
          <div className="text-xs font-bold text-purple-300 mt-1 truncate">{event?.naacCategory}</div>
          <span className="text-[10px] text-slate-500">Statutory Mapping</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Certification Status</span>
          <div className="text-xs font-bold text-indigo-300 mt-1">
            {event?.certificatesIssued ? 'Certs Dispatched' : 'Pending Issuance'}
          </div>
          <span className="text-[10px] text-slate-500">Verifiable credentials</span>
        </div>
      </div>

      {/* ATR Form Section */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-lg">receipt_long</span>
            Financial Utilization &amp; Outcomes Assessment
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter audited expenditures and tangible learning outcomes for statutory archival.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Final Actual Expenditure (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={finalBudgetUtilized}
                  onChange={(e) => setFinalBudgetUtilized(parseInt(e.target.value, 10) || 0)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Surplus returned: ₹
                {Math.max(0, (event?.budgetSanctioned || 0) - finalBudgetUtilized).toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Executive ATR Summary
              </label>
              <textarea
                rows={2}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="State the overall success metrics, delegate engagement, and key highlights..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Key Deliverable / Outcome 1
              </label>
              <input
                type="text"
                value={outcomesKey1}
                onChange={(e) => setOutcomesKey1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Key Deliverable / Outcome 2
              </label>
              <input
                type="text"
                value={outcomesKey2}
                onChange={(e) => setOutcomesKey2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Previews */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">photo_library</span>
              Geo-Tagged Photo Evidence Gallery
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-resolution evidentiary photographs required for Criterion 3 &amp; 5 audit dossiers.
            </p>
          </div>
          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 flex items-center gap-1.5 transition-colors">
            <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setPhotoUrls((prev) => [...prev, url]);
                }
              }}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photoUrls.map((url, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrls((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Dossier & Certificate Issuance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dossier Card */}
        <div className="p-5 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              <span className="text-xs font-bold uppercase tracking-wider">Statutory IQAC Dossier</span>
            </div>
            <h3 className="text-sm font-bold text-white">Synthesize Event Dossier PDF</h3>
            <p className="text-xs text-slate-400 mt-1">
              Compiles cover page, budget utilization, validated attendance, and SHA-256 cryptographic proof into an official A4 document.
            </p>
            {dossierSha256 && (
              <div className="mt-3 p-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 break-all">
                SHA-256: {dossierSha256}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleGenerateDossier}
              disabled={isGeneratingDossier}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">build_circle</span>
              <span>{isGeneratingDossier ? 'Generating...' : 'Generate Official Dossier'}</span>
            </button>
            {dossierUrl && (
              <a
                href={dossierUrl}
                download={`Dossier_${event?.code || 'CCEAS'}.pdf`}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/30"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* Certificates Card */}
        <div className="p-5 bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/20 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <span className="material-symbols-outlined">verified</span>
              <span className="text-xs font-bold uppercase tracking-wider">Verifiable Credentials</span>
            </div>
            <h3 className="text-sm font-bold text-white">Bulk Issue Digital Certificates</h3>
            <p className="text-xs text-slate-400 mt-1">
              Issues cryptographic certificates with embedded QR codes pointing to public verification for all{' '}
              <span className="text-emerald-400 font-bold">{attendedList.length} validated attendees</span>.
            </p>
            {certsIssuedCount !== null && (
              <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">task_alt</span>
                <span>Successfully generated and dispatched {certsIssuedCount} certificates!</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleIssueCertificates}
              disabled={isIssuingCerts || attendedList.length === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>
                {isIssuingCerts
                  ? 'Generating Credentials...'
                  : `Dispatch ${attendedList.length} Certificates`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Final Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Link
          href="/head"
          className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
        >
          Cancel
        </Link>

        <button
          onClick={handleFinalAtrSubmit}
          disabled={isSavingAtr}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{isSavingAtr ? 'Filing ATR...' : 'Finalize & Archive ATR'}</span>
        </button>
      </div>
    </div>
  );
}
