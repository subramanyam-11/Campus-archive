'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { getCertificates } from '@/lib/firebase/firestore';
import { generateCertificatePdf } from '@/lib/pdf/generateCertificate';
import type { CertificateItem } from '@/src/types';

const DEFAULT_CERTS: CertificateItem[] = [
  {
    id: 'CERT-EV-8901-0042',
    eventId: 'evt-01',
    eventTitle: 'National Symposium on Quantum Computing & Neuromorphic Systems',
    eventDate: '20 Nov 2024',
    committeeName: 'ACM Student Chapter',
    studentUid: 'stu_dev_01',
    studentName: 'Aarav Sharma',
    studentPrn: '2024BCSE042',
    issuedAt: '24 Nov 2024',
    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    qrCodeData: '/verify/CERT-EV-8901-0042',
    status: 'Valid',
  },
  {
    id: 'CERT-EV-8902-0042',
    eventId: 'evt-02',
    eventTitle: 'Deep Learning Bootcamp & AI Accelerators Lab',
    eventDate: '15 Oct 2024',
    committeeName: 'IEEE Student Branch',
    studentUid: 'stu_dev_01',
    studentName: 'Aarav Sharma',
    studentPrn: '2024BCSE042',
    issuedAt: '18 Oct 2024',
    sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    qrCodeData: '/verify/CERT-EV-8902-0042',
    status: 'Valid',
  },
];

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateItem[]>(DEFAULT_CERTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const studentUid = user?.uid || 'stu_dev_01';

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadCerts() {
      try {
        setLoading(true);
        const records = await getCertificates(studentUid);
        if (isMounted && records.length > 0) {
          setCertificates(records);
        }
      } catch {
        // Keep initial mock certificates
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCerts();
    return () => {
      isMounted = false;
    };
  }, [user, studentUid]);

  const handleDownloadPdf = async (cert: CertificateItem) => {
    setDownloadingId(cert.id);
    try {
      const result = await generateCertificatePdf(cert);
      const link = document.createElement('a');
      link.href = result.blobUrl;
      link.download = `Certificate_${cert.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate certificate PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/20 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            Verifiable Credentials Locker
          </div>
          <h1 className="text-2xl font-extrabold text-white">My Academic Credentials &amp; Certificates</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Download tamper-proof, cryptographic PDF certificates issued by faculty conveners and the Internal Quality Assurance Cell (IQAC).
          </p>
        </div>

        <Link
          href="/student"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">explore</span>
          <span>Explore More Events</span>
        </Link>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-xs">
            Loading your verified credentials...
          </div>
        ) : certificates.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No certificates issued yet. Certificates are dispatched after event completion and feedback submission.
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Gold Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-500 to-blue-500"></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {cert.status} Credential
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{cert.id}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                    {cert.committeeName}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                    {cert.eventTitle}
                  </h3>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient:</span>
                    <span className="font-semibold text-white">{cert.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Permanent Reg No:</span>
                    <span className="font-mono text-purple-300">{cert.studentPrn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Event Date:</span>
                    <span>{cert.eventDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issue Date:</span>
                    <span>{cert.issuedAt}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate">
                  SHA-256: {cert.sha256Hash}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleDownloadPdf(cert)}
                  disabled={downloadingId === cert.id}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>{downloadingId === cert.id ? 'Generating PDF...' : 'Download Certificate PDF'}</span>
                </button>

                <Link
                  href={`/verify/${cert.id}`}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Verify</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
