'use client';

import React, { useState } from 'react';
import { ViewType, Committee } from '../types';
import { INITIAL_COMMITTEES } from '../data/mockData';

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
  const [academicYears, setAcademicYears] = useState<string[]>([
    '2024 – 2025',
    '2025 – 2026',
    '2023 – 2024',
    '2022 – 2023',
  ]);
  const [newYearInput, setNewYearInput] = useState('');
  const [committees, setCommittees] = useState<Committee[]>(INITIAL_COMMITTEES);
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommCode, setNewCommCode] = useState('');
  const [newCommDept, setNewCommDept] = useState('Department of Computer Science & Engineering');
  const [newCommConvener, setNewCommConvener] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;
    if (academicYears.includes(newYearInput.trim())) {
      showToast('Academic year cycle already exists.');
      return;
    }
    setAcademicYears((prev) => [newYearInput.trim(), ...prev]);
    showToast(`Added ${newYearInput.trim()} to institutional archival cycles.`);
    setNewYearInput('');
  };

  const handleAddCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim() || !newCommCode.trim()) {
      showToast('Please provide a committee name and unique code.');
      return;
    }

    const newCommittee: Committee = {
      id: `com-${committees.length + 1}`,
      code: newCommCode.toUpperCase().trim(),
      name: newCommName.trim(),
      categoryTag: 'Technical / Student Body',
      categoryType: 'tech',
      department: newCommDept,
      status: 'active',
      facultyInCharge: {
        name: newCommConvener.trim() || 'Dr. Appointed Faculty',
        designation: 'Faculty In-Charge',
        signatureVerified: true,
        signatureUid: `DSC-${1000 + committees.length + 1}-2025`,
      },
      activeMembersCount: 12,
      lastRevised: 'Rev. Oct 2025',
      charter: `Statutory committee chartered for student academic growth and accreditation evidence.`,
      naacCriterion: 'NAAC Criterion 3.3 Linked',
      focusAreas: [
        { title: 'Core Objectives', description: 'Execution of institutional mandate and curricular enrichment.' },
      ],
      leadership: [],
      metrics: {
        approvedEvents: 0,
        footfall: 0,
        sanctionedBudget: '₹ 1,00,000',
        budgetNumeric: 100000,
        utilizedBudget: '₹ 0',
        utilizedNumeric: 0,
        utilizedPercent: 0,
        grantId: `COM-${newCommCode.toUpperCase().trim()}-2025`,
      },
      documents: [],
    };

    setCommittees((prev) => [newCommittee, ...prev]);
    setShowAddCommitteeModal(false);
    setNewCommName('');
    setNewCommCode('');
    setNewCommConvener('');
    showToast(`Committee ${newCommittee.name} created and registered.`);
  };

  const handleToggleCommitteeStatus = (id: string) => {
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'archived' : 'active' } : c
      )
    );
    showToast('Committee status updated.');
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
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
              <h3 className="font-semibold text-headline-sm text-on-surface">Academic Session &amp; Archival Cycle</h3>
            </div>
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
                {academicYears.map((ay) => (
                  <option key={ay} value={ay}>
                    {ay} {ay === '2024 – 2025' ? '(Current Active)' : ''}
                  </option>
                ))}
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

          {/* Add New Academic Year */}
          <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Register New Academic Tenure Cycle
              </label>
              <input
                type="text"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                placeholder="e.g. 2026 – 2027"
                className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAcademicYear}
              className="h-9 px-4 rounded-lg bg-surface-container text-primary font-semibold text-label-sm hover:bg-surface-container-high transition-colors shrink-0"
            >
              + Add Cycle
            </button>
          </div>
        </div>

        {/* Committees Directory & Administration */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
              <h3 className="font-semibold text-headline-sm text-on-surface">Institutional Committees &amp; Cells</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCommitteeModal(true)}
              className="h-8 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Register Committee</span>
            </button>
          </div>

          <div className="divide-y divide-outline-variant/20 max-h-72 overflow-y-auto">
            {committees.map((comm) => (
              <div key={comm.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-body-sm text-on-surface truncate">{comm.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {comm.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant truncate">
                    Convener: {comm.facultyInCharge.name} • {comm.department}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleCommitteeStatus(comm.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      comm.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {comm.status === 'active' ? 'Active' : 'Archived'}
                  </button>
                </div>
              </div>
            ))}
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

      {/* Add Committee Modal */}
      {showAddCommitteeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-xl border border-outline-variant/40 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-bold text-headline-sm text-on-surface">Register New Committee</h3>
              <button
                type="button"
                onClick={() => setShowAddCommitteeModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCommittee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Committee Name *</label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence Research Group"
                  className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={newCommCode}
                    onChange={(e) => setNewCommCode(e.target.value)}
                    placeholder="e.g. COM-AIR-12"
                    className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 text-on-surface font-mono uppercase focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Faculty Convener</label>
                  <input
                    type="text"
                    value={newCommConvener}
                    onChange={(e) => setNewCommConvener(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Department</label>
                <input
                  type="text"
                  value={newCommDept}
                  onChange={(e) => setNewCommDept(e.target.value)}
                  className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCommitteeModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container"
                >
                  Save &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
