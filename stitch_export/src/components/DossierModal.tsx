import React from 'react';
import { EventItem } from '../types';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
}

export const DossierModal: React.FC<DossierModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
            <span className="font-semibold text-label-md text-on-surface">
              Official Institutional Event Dossier • {event.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="h-8 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-sm font-semibold flex items-center gap-1 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Official Printable Academic Dossier Canvas */}
        <div className="p-8 md:p-10 text-on-surface bg-white space-y-6 print:p-0">
          {/* Institutional Header with Crest */}
          <div className="border-b-2 border-slate-900 pb-5 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-3xl">account_balance</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-950 font-serif">
              Central Institute of Engineering &amp; Technology
            </h2>
            <p className="text-xs text-slate-600 font-medium tracking-wide uppercase mt-0.5">
              Accredited A++ by NAAC • ISO 9001:2015 Certified • Autonomous Directorate
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Internal Quality Assurance Cell (IQAC) &amp; Office of Dean Academics
            </p>
          </div>

          {/* Reference Stamp Strip */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-600 border-b border-slate-200 pb-3">
            <span>Dossier Reference: <strong className="text-slate-900">{event.refNo}</strong></span>
            <span>Ledger Registry ID: <strong className="text-slate-900">{event.code}</strong></span>
            <span>Date of Generation: <strong className="text-slate-900">{new Date().toLocaleDateString('en-GB')}</strong></span>
          </div>

          {/* Document Title */}
          <div className="text-center py-2">
            <span className="inline-block px-3 py-1 rounded bg-blue-50 text-blue-900 text-xs font-bold tracking-wider uppercase border border-blue-200">
              Statutory Event Completion &amp; Action Taken Report (ATR)
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
              {event.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Organized by: <strong className="text-slate-800">{event.committee}</strong> ({event.department})
            </p>
          </div>

          {/* Core Event Metrics Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-medium">Event Date</span>
              <span className="font-semibold text-slate-900 text-sm">{event.dateStr}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Venue</span>
              <span className="font-semibold text-slate-900 text-sm">{event.venue}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Turnout</span>
              <span className="font-semibold text-slate-900 text-sm">
                {event.attendanceValidated} / {event.attendanceTarget} ({event.attendanceTurnoutPercent}%)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Sanctioned Budget</span>
              <span className="font-semibold text-slate-900 text-sm font-mono">₹ {event.budgetSanctioned.toLocaleString()}</span>
            </div>
          </div>

          {/* Primary Rationale & Scope */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1">
              1. Rationale &amp; Primary Objectives
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed mt-2">
              {event.objective}
            </p>
          </div>

          {/* Financial Reconciliation Ledger */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1">
              2. Financial Ledger Audit &amp; Utilization Certificate
            </h4>
            <div className="mt-2 border border-slate-200 rounded text-xs overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2">Line Item</th>
                    <th className="p-2">Sanctioned (INR)</th>
                    <th className="p-2">Actual Incurred (INR)</th>
                    <th className="p-2 text-right">Variance / Surplus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                  <tr>
                    <td className="p-2">Academic &amp; Honorarium Grants</td>
                    <td className="p-2">₹ {event.budgetSanctioned.toLocaleString()}</td>
                    <td className="p-2">₹ {event.budgetUtilized.toLocaleString()}</td>
                    <td className="p-2 text-right text-emerald-700 font-semibold">
                      +₹ {event.surplusReturned.toLocaleString()} (Surplus Returned)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Taken Report (ATR) & Outcomes */}
          {event.outcomesAtr.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1">
                3. Summary of Outcomes &amp; Quality Impact (NAAC Metric 3.3.2)
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {event.outcomesAtr.map((outcome, idx) => (
                  <li key={idx}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Digital Signature & Certification Blocks */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="h-12 flex items-center justify-center font-serif italic text-blue-900 font-bold">
                {event.convener}
              </div>
              <div className="w-full border-t border-slate-400 pt-1">
                <span className="font-semibold block text-slate-900">{event.convener}</span>
                <span className="text-slate-500">Event Convener</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-12 flex items-center justify-center font-serif italic text-blue-900 font-bold">
                Dr. Ramesh K. Sharma
              </div>
              <div className="w-full border-t border-slate-400 pt-1">
                <span className="font-semibold block text-slate-900">Dr. Ramesh K. Sharma</span>
                <span className="text-slate-500">Director, IQAC</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-12 flex items-center justify-center font-serif italic text-blue-900 font-bold">
                Dr. Arvind Joshi
              </div>
              <div className="w-full border-t border-slate-400 pt-1">
                <span className="font-semibold block text-slate-900">Dr. Arvind Joshi</span>
                <span className="text-slate-500">Principal &amp; Executive Head</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Ledger Verification Stamp */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span>SHA-256 Ledger Hash: 4f98d1a8e032b49c71650e28a9b23f81e01</span>
            </div>
            <span>Immutable Academic Ledger Node: IN-MAA-01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
