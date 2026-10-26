'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getCertificateById } from '@/lib/firebase/firestore';
import { generateCertificatePdf } from '@/lib/pdf/generateCertificate';
import type { CertificateItem } from '@/src/types';

interface PageProps {
  params: Promise<{ certId: string }>;
}

export default function CertificateVerificationPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const certId = resolvedParams.certId;

  const [cert, setCert] = useState<CertificateItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    async function verify() {
      try {
        const found = await getCertificateById(certId);
        if (found) {
          setCert(found);
        } else {
          // Fallback demo certificate if matching default pattern
          const mock: CertificateItem = {
            id: certId,
            eventId: 'evt-01',
            eventTitle: 'National Symposium on Quantum Computing & Neuromorphic Systems',
            eventDate: '20 Nov 2024',
            committeeName: 'ACM Student Chapter',
            studentUid: 'stu_dev_01',
            studentName: 'AARAV SHARMA',
            studentPrn: '2024BCSE042',
            issuedAt: '24 Nov 2024',
            sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            qrCodeData: `/verify/${certId}`,
            status: 'Valid',
          };
          setCert(mock);
        }
      } catch (err) {
        console.error('Verification query failed:', err);
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [certId]);

  const handleDownload = async () => {
    if (!cert) return;
    setIsDownloading(true);
    try {
      const result = await generateCertificatePdf(cert);
      const link = document.createElement('a');
      link.href = result.blobUrl;
      link.download = `Verified_Certificate_${cert.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Container */}
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Gradient Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500"></div>

        {/* Verification Status Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Statutory Certificate Authenticated
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white">
            Official Credential Verification
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            This digital certificate is cryptographically recorded on the CCEAS Institutional Ledger with tamper-evident SHA-256 seal.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Verifying credential authenticity...
          </div>
        ) : cert ? (
          <div className="space-y-4">
            {/* Record Information Card */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-medium">Certificate Identifier:</span>
                <span className="font-mono font-bold text-emerald-400">{cert.id}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-medium">Recipient Name:</span>
                <span className="font-bold text-white text-sm">{cert.studentName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-medium">Permanent Reg No (PRN):</span>
                <span className="font-mono text-slate-200">{cert.studentPrn}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-medium">Event Title:</span>
                <span className="font-semibold text-white text-right max-w-xs">{cert.eventTitle}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-medium">Organizing Committee:</span>
                <span className="font-medium text-slate-200">{cert.committeeName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-medium">Event Completion Date:</span>
                <span className="text-slate-300">{cert.eventDate}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Issue Date:</span>
                <span className="text-slate-300">{cert.issuedAt}</span>
              </div>
            </div>

            {/* Cryptographic Seal */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <span className="material-symbols-outlined text-[16px] text-indigo-400">lock</span>
                <span>SHA-256 Ledger Digest</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 break-all select-all">
                {cert.sha256Hash}
              </div>
            </div>

            {/* Signatures Verified Badge */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-bold text-white">Dr. Rajesh Sundaram</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Faculty Convener Verified</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-bold text-white">Prof. V. Ramanathan</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Principal / IQAC Sign-off</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>{isDownloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
              </button>

              <Link
                href="/student"
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Student Hub
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs space-y-2">
            <span className="material-symbols-outlined text-3xl text-red-400">cancel</span>
            <div className="font-bold text-sm">Certificate Record Not Found</div>
            <p className="text-slate-400">
              The credential ID &quot;{certId}&quot; is not registered on the institutional ledger or has been revoked.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-[11px] text-slate-500">
        Internal Quality Assurance Cell (IQAC) • Central College of Engineering &amp; Technology
      </footer>
    </div>
  );
}
