import React, { useState } from 'react';
import { ViewType } from '../types';

interface SettingsViewProps {
  onNavigate: (view: ViewType) => void;
  academicYear: string;
  onUpdateAcademicYear: (year: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigate,
  academicYear,
  onUpdateAcademicYear,
}) => {
  const [activeSession, setActiveSession] = useState(academicYear);
  const [nodeId, setNodeId] = useState('IN-MAA-01');
  const [autoOcr, setAutoOcr] = useState(true);
  const [tamperProofLedger, setTamperProofLedger] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAcademicYear(activeSession);
    showToast('Institutional governance configuration updated and sealed into ledger.');
  };

  return (
    <div className="px-4 lg:px-gutter-desktop py-space-lg flex flex-col gap-space-lg max-w-5xl mx-auto w-full pb-16">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-space-xs pb-space-xs border-b border-outline-variant/30">
        <div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm">
          <span>Administrative Console</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-primary font-semibold">System Configuration</span>
        </div>
        <h1 className="font-semibold text-headline-xl text-on-surface tracking-tight">
          Institutional Governance &amp; Registry Settings
        </h1>
        <p className="text-body-md text-on-surface-variant mt-0.5">
          Configure statutory accreditation guidelines, digital signatures, ledger node parameters, and automated ingestion rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Academic Session Scope */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
            <h3 className="font-semibold text-headline-sm text-on-surface">Academic Session &amp; Archival Cycle</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Active Operational Session <span className="text-error">*</span>
              </label>
              <select
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
                className="w-full h-10 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface cursor-pointer"
              >
                <option value="2024 – 2025">2024 – 2025 (Current Active)</option>
                <option value="2025 – 2026">2025 – 2026 (Upcoming Tenure)</option>
                <option value="2023 – 2024">2023 – 2024 (Archival Review)</option>
              </select>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Controls the active scope for committee proposals, office bearer rosters, and budgetary allocations.
              </p>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Institutional Node Identifier
              </label>
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                className="w-full h-10 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface font-mono"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                Node stamp appended to SHA-256 digital seals on signed event dossiers.
              </p>
            </div>
          </div>
        </div>

        {/* Cryptographic Ledger & Security Settings */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-tertiary text-[20px]">security</span>
            <h3 className="font-semibold text-headline-sm text-on-surface">Cryptographic Integrity &amp; Verification</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors">
              <input
                type="checkbox"
                checked={tamperProofLedger}
                onChange={(e) => setTamperProofLedger(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-label-sm text-on-surface">Enforce Immutable SHA-256 Ledger Signing</span>
                <span className="text-[12px] text-on-surface-variant">
                  Automatically compute and verify hash digests on all event sanction orders, uploaded photo proofs, and participant CSV spreadsheets.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors">
              <input
                type="checkbox"
                checked={autoOcr}
                onChange={(e) => setAutoOcr(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-label-sm text-on-surface">Enable Neural OCR &amp; Letterhead Auto-Mapping</span>
                <span className="text-[12px] text-on-surface-variant">
                  Run client-side layout parsers on uploaded archives to automatically detect academic year, sanctioning authority, and NAAC criteria tags.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="h-9 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-label-md font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-9 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-colors text-label-md font-semibold shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
