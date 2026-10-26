'use client';

import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { computeStringSha256 } from '@/lib/crypto/hash';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
}

export const DossierModal: React.FC<DossierModalProps> = ({ isOpen, onClose, event }) => {
  const [asyncHash, setAsyncHash] = useState<string>('');

  useEffect(() => {
    let isSubscribed = true;
    if (!isOpen || event.dossierSha256) return;

    const payload = `${event.id}:${event.code}:${event.title}:${event.dateStr}:${event.venue}:${event.budgetUtilized}`;
    computeStringSha256(payload).then((hash) => {
      if (isSubscribed) setAsyncHash(hash);
    });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, event]);

  const computedHash = event.dossierSha256 || asyncHash;

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
            <span id="dossier-modal-title" className="font-semibold text-label-md text-on-surface">
              Official Institutional Event Dossier • {event.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors"
              type="button"
              aria-label="Close dialog"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Dossier Document Preview Canvas */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Institutional Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">
              Internal Quality Assurance Cell (IQAC) • Statutory Event Dossier
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-serif">
              CENTRAL COLLEGE OF ENGINEERING &amp; TECHNOLOGY
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Affiliated to State University • Approved by AICTE • Accredited Grade A+ (Cycle-3)
            </p>
            <div className="inline-block mt-3 px-3 py-0.5 rounded border border-slate-900 text-xs font-mono font-bold uppercase tracking-wider">
              {event.refNo}
            </div>
          </div>

          {/* Event Meta Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Event Title:</span>
              <span className="font-bold text-sm text-slate-900">{event.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Convening Committee:</span>
              <span className="font-bold text-sm text-slate-900">{event.committee}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Conduct Date &amp; Venue:</span>
              <span className="font-semibold text-slate-900">{event.dateStr} • {event.venue}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Faculty Convener:</span>
              <span className="font-semibold text-slate-900">{event.convener}</span>
            </div>
          </div>

          {/* Financials & Attendance Table */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2.5">Sanctioned Budget</th>
                  <th className="p-2.5">Utilized Amount</th>
                  <th className="p-2.5">Surplus Returned</th>
                  <th className="p-2.5">Validated Footfall</th>
                  <th className="p-2.5">Turnout %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-2.5 font-semibold">₹{event.budgetSanctioned.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-blue-700 font-semibold">₹{event.budgetUtilized.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">₹{event.surplusReturned.toLocaleString('en-IN')}</td>
                  <td className="p-2.5">{event.attendanceValidated} Delegates</td>
                  <td className="p-2.5 font-semibold text-emerald-700">{event.attendanceTurnoutPercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Objective Statement */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              Event Rationale &amp; Objectives
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              {event.objective}
            </p>
          </div>

          {/* Action Taken Report (ATR) Highlights */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              Action Taken Report (ATR) Key Outcomes
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {event.outcomesAtr.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="h-10 border-b border-slate-400 w-32 mb-1 flex items-end justify-center font-serif italic text-slate-600">
                {event.convener}
              </div>
              <span className="font-semibold block text-slate-900">Faculty Convener</span>
              <span className="text-slate-500">{event.department}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 border-b border-slate-400 w-32 mb-1 flex items-end justify-center font-serif italic text-slate-600">
                Dr. Rekha Rao
              </div>
              <span className="font-semibold block text-slate-900">Coordinator, IQAC</span>
              <span className="text-slate-500">Directorate of Quality</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 border-b border-slate-400 w-32 mb-1 flex items-end justify-center font-serif italic text-slate-600">
                Dr. Arvind Joshi
              </div>
              <span className="font-semibold block text-slate-900">Dr. Arvind Joshi</span>
              <span className="text-slate-500">Principal &amp; Executive Head</span>
            </div>
          </div>

          {/* Cryptographic Ledger Verification Stamp */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span>SHA-256 Digest: {computedHash ? `${computedHash.substring(0, 32)}...` : 'Computing...'}</span>
            </div>
            <span>Immutable Ledger Node: IN-CCEAS-01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
