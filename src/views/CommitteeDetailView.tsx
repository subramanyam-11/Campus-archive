'use client';

import React, { useState } from 'react';
import { Committee, ViewType, EventItem } from '../types';

interface CommitteeDetailViewProps {
  committee?: Committee;
  onNavigate: (view: ViewType) => void;
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  initialTab?: 'overview' | 'roster' | 'events' | 'documents';
}

export const CommitteeDetailView: React.FC<CommitteeDetailViewProps> = ({
  committee,
  onNavigate,
  events,
  onSelectEvent,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'events' | 'documents'>(initialTab);
  const [selectedAy, setSelectedAy] = useState('AY 2024–25 (Current Active)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!committee) {
    return (
      <div className="p-8 text-on-surface">
        <h2 className="text-xl font-bold">Committee not found</h2>
        <p className="text-on-surface-variant text-sm mt-1">The requested committee profile could not be loaded.</p>
        <button 
          onClick={() => onNavigate('committees')} 
          className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-container transition-colors"
        >
          Back to Committees
        </button>
      </div>
    );
  }

  const committeeEvents = events.filter(
    (e) => e.committee.includes(committee.name) || e.committeeCode === committee.code
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadDoc = (docTitle: string) => {
    showToast(`Downloading institutional record: ${docTitle}`);
  };

  const handleUploadDoc = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        showToast(`Document "${file.name}" uploaded and indexed into SHA-256 ledger.`);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Hero Section */}
      <section className="bg-surface-container-lowest px-4 lg:px-gutter-desktop py-space-lg shadow-sm border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
          {/* Top Badges & Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-container text-primary font-semibold text-label-sm tracking-wide">
                {committee.code}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-surface-container-low text-tertiary text-label-sm border border-tertiary/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Statutory Standing Committee
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-surface-container-low text-secondary text-label-sm border border-secondary/20 font-medium">
                <span className="material-symbols-outlined text-[14px]">shield_with_heart</span>
                {committee.naacCriterion}
              </span>
            </div>

            {/* Academic Year Dropdown & Utility Actions */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="relative">
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-outline text-[18px] pointer-events-none">
                    calendar_month
                  </span>
                  <select
                    value={selectedAy}
                    onChange={(e) => {
                      setSelectedAy(e.target.value);
                      if (e.target.value.includes('Archived')) {
                        showToast(`Switched to historical archive: ${e.target.value} (Read-Only Mode)`);
                      }
                    }}
                    className="h-9 pl-8 pr-8 appearance-none bg-surface-container-low rounded-lg text-label-sm text-on-surface font-semibold cursor-pointer border border-outline-variant/40 focus:outline-none focus:bg-surface-container transition-colors"
                  >
                    <option>AY 2024–25 (Current Active)</option>
                    <option>AY 2023–24 (Archived)</option>
                    <option>AY 2022–23 (Archived)</option>
                    <option>AY 2021–22 (Archived)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 text-outline text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <button
                onClick={() => showToast('Editing charter and mandate provisions...')}
                className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-label-md font-medium flex items-center gap-1.5 border border-outline-variant/40 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">edit_note</span>
                <span>Edit Mandate</span>
              </button>

              <button
                onClick={() => showToast('Downloading Official Annual Committee Dossier (PDF)...')}
                className="h-9 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                <span>Download Annual Dossier</span>
              </button>
            </div>
          </div>

          {/* Main Title & Key Entity Attributes */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
            <div className="flex flex-col gap-1 max-w-3xl">
              <h1 className="font-bold text-headline-xl text-on-surface tracking-tight">
                {committee.name}
              </h1>
              <p className="text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-outline text-[18px]">domain</span>
                <span>{committee.department}</span>
                <span className="text-outline-variant">•</span>
                <span>Affiliation ID: ACM-IN-88391</span>
              </p>
            </div>

            {/* Faculty In-charge Digital Stamp Verification Badge */}
            <div className="bg-surface-container-low border border-outline-variant/30 px-space-md py-space-sm rounded-xl flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">
                  Faculty In-charge
                </span>
                <span className="font-semibold text-label-md text-on-surface">
                  {committee.facultyInCharge.name}
                </span>
                <span className="text-[11px] text-tertiary flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  Digital Signature Verified ({committee.facultyInCharge.signatureUid})
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Profile Navigation Tabs */}
          <div className="pt-space-sm mt-space-xs">
            <nav aria-label="Profile Tabs" className="flex items-center gap-space-sm overflow-x-auto pb-1">
              {/* Overview Tab */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`relative px-space-md py-space-sm rounded-lg flex items-center gap-2.5 transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-surface text-primary font-semibold shadow-sm border border-outline-variant/40'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">dashboard</span>
                <div className="flex flex-col text-left">
                  <span className="text-label-md font-semibold leading-tight">Overview</span>
                  <span className="text-[11px] text-outline leading-tight">Summary &amp; Mandate</span>
                </div>
                {activeTab === 'overview' && (
                  <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"></div>
                )}
              </button>

              {/* Roster Tab */}
              <button
                onClick={() => onNavigate('roster')}
                className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-2.5 transition-colors text-left"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] text-outline">badge</span>
                <div className="flex flex-col text-left">
                  <span className="text-label-md leading-tight font-medium text-on-surface">Roster</span>
                  <span className="text-[11px] text-outline leading-tight">
                    {committee.activeMembersCount} Members • View full roster on Screen 5 →
                  </span>
                </div>
              </button>

              {/* Events Tab */}
              <button
                onClick={() => onNavigate('events')}
                className="px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-2.5 transition-colors text-left"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] text-outline">event_available</span>
                <div className="flex flex-col text-left">
                  <span className="text-label-md leading-tight font-medium text-on-surface">Events</span>
                  <span className="text-[11px] text-outline leading-tight">
                    {committee.metrics.approvedEvents} Events logged • View filtered events on Screen 6 →
                  </span>
                </div>
              </button>

              {/* Documents Tab */}
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-space-md py-space-sm rounded-lg flex items-center gap-2.5 transition-colors text-left ${
                  activeTab === 'documents'
                    ? 'bg-surface text-primary font-semibold shadow-sm border border-outline-variant/40'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] text-outline">folder_open</span>
                <div className="flex flex-col text-left">
                  <span className="text-label-md leading-tight font-medium text-on-surface">Documents</span>
                  <span className="text-[11px] text-outline leading-tight">
                    {committee.documents.length} Institutional Files
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="px-4 lg:px-gutter-desktop py-space-lg max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {/* ================= LEFT COLUMN (Span 7) ================= */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              {/* Card: Charter & Mandate */}
              <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm">
                <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20 mb-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">gavel</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-headline-sm text-on-surface">Charter &amp; Official Mandate</h2>
                      <p className="text-[11px] text-on-surface-variant">
                        Statutory operational guidelines under Dean Academics
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-surface-container text-primary text-[11px] font-semibold">
                    Ratified June 2024
                  </span>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
                      format_quote
                    </span>
                    <p className="text-body-md text-on-surface leading-relaxed">{committee.charter}</p>
                  </div>
                  <div className="pt-space-xs grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-sm rounded-lg flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">done_all</span>
                      <span className="text-[12px] text-on-surface-variant font-medium">Criterion 3.3.2: Seminars &amp; Hackathons</span>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant/30 p-space-sm rounded-lg flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                      <span className="text-[12px] text-on-surface-variant font-medium">ISO 9001:2015 Educational Audit Ready</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Pillars of the Mandate */}
                <div className="mt-space-md grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  {committee.focusAreas.map((focus, idx) => (
                    <div key={idx} className="p-space-sm bg-surface border border-outline-variant/30 rounded-lg">
                      <span className="text-[10px] text-outline uppercase tracking-wider font-semibold block mb-1">
                        Focus Area {idx + 1}
                      </span>
                      <span className="font-semibold text-label-md text-on-surface block">{focus.title}</span>
                      <span className="text-[11px] text-on-surface-variant mt-0.5 block">{focus.description}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* Card: Executive Leadership Summary */}
              <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20 mb-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">military_tech</span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-headline-sm text-on-surface">Executive Leadership Summary</h2>
                        <p className="text-[11px] text-on-surface-variant">Designated student signatories for Academic Year 2024–25</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-surface-container-low text-tertiary text-[11px] font-semibold flex items-center gap-1 border border-tertiary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      Quorum Active
                    </span>
                  </div>

                  {/* Leadership List Grid */}
                  <div className="flex flex-col gap-space-sm">
                    {committee.leadership.map((leader, i) => (
                      <div
                        key={i}
                        className="p-space-sm bg-surface border border-outline-variant/30 rounded-lg flex items-center justify-between hover:bg-surface-container-low transition-colors"
                      >
                        <div className="flex items-center gap-space-md min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-label-md shrink-0">
                            {leader.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-label-md text-on-surface truncate">
                                {leader.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-surface-container text-primary text-[10px] font-semibold">
                                {leader.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                              <span>PRN: {leader.prn}</span>
                              <span>•</span>
                              <span>{leader.program}</span>
                              <span>•</span>
                              <span className="text-tertiary font-medium">Clearance Verified</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => showToast(`Drafting official dispatch to ${leader.name}...`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors"
                            title="Send Official Dispatch"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                          </button>
                          <button
                            onClick={() => onNavigate('roster')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors"
                            title="View Dossier Record"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">contacts</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Screen 5 Deep Dive Redirection Callout */}
                <div className="mt-space-md pt-space-sm flex items-center justify-between bg-surface-container-low border border-outline-variant/30 p-space-sm rounded-lg flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-on-surface-variant text-[12px]">
                    <span className="material-symbols-outlined text-outline text-[18px]">groups_3</span>
                    <span>Total {committee.activeMembersCount} verified committee student members active for AY 2024–25</span>
                  </div>
                  <button
                    onClick={() => onNavigate('roster')}
                    className="h-8 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface hover:text-primary text-on-surface text-[12px] font-semibold flex items-center gap-1 transition-colors shadow-sm border border-outline-variant/40"
                    type="button"
                  >
                    <span>Open Complete Roster Table (Screen 5)</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </article>

              {/* Committee Activity Footprint */}
              <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm">
                <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
                  <div className="flex flex-col">
                    <h2 className="font-semibold text-headline-sm text-on-surface">Term Execution Milestones</h2>
                    <span className="text-[11px] text-on-surface-variant">Scheduled academic delivery roadmap AY 2024–25</span>
                  </div>
                  <span className="text-[11px] text-outline font-semibold uppercase tracking-wider">Q3 Mid-Term Phase</span>
                </div>
                <div className="relative pt-3">
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary" style={{ width: '62.5%' }}></div>
                    <div className="h-full bg-secondary-container" style={{ width: '25%' }}></div>
                    <div className="h-full bg-surface-container-low" style={{ width: '12.5%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                    <div className="flex flex-col">
                      <span className="text-label-sm text-primary font-bold">Phase 1 • Jul</span>
                      <span className="text-[11px] text-on-surface-variant">Orientation &amp; Selection</span>
                      <span className="text-[10px] text-tertiary flex items-center gap-0.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[12px]">check</span>Completed
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-primary font-bold">Phase 2 • Sep</span>
                      <span className="text-[11px] text-on-surface-variant">AlgoMania Hack Sprint</span>
                      <span className="text-[10px] text-tertiary flex items-center gap-0.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[12px]">check</span>Completed
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-secondary font-bold">Phase 3 • Nov–Jan</span>
                      <span className="text-[11px] text-on-surface-variant">Winter Code Bootcamps</span>
                      <span className="text-[10px] text-secondary flex items-center gap-0.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[12px]">sync</span>In Progress
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-outline font-bold">Phase 4 • Mar</span>
                      <span className="text-[11px] text-on-surface-variant">National Flagship Summit</span>
                      <span className="text-[10px] text-outline flex items-center gap-0.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>Scheduled
                      </span>
                    </div>
                  </div>
                </div>
              </article>

              {/* Committee Events Card */}
              <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm">
                <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 mb-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">event</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-headline-sm text-on-surface">Committee Events &amp; Sessions</h2>
                      <span className="text-[11px] text-on-surface-variant">Active and past events convened by this body</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    {committeeEvents.length} Events Total
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  {committeeEvents.length === 0 ? (
                    <div className="p-4 text-center text-on-surface-variant text-body-sm bg-surface rounded-lg">
                      No events registered yet under this committee charter.
                    </div>
                  ) : (
                    committeeEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          onSelectEvent(evt);
                          onNavigate('events');
                        }}
                        className="p-3 bg-surface hover:bg-surface-container-low border border-outline-variant/30 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col min-w-0 pr-3">
                          <span className="font-semibold text-label-md text-on-surface truncate">{evt.title}</span>
                          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                            <span>{evt.dateStr}</span>
                            <span>•</span>
                            <span>{evt.venue}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          evt.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </div>

            {/* ================= RIGHT COLUMN (Span 5) ================= */}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              {/* Card: Key Metrics (AY 2024–25) */}
              <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm">
                <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20 mb-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">analytics</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-headline-sm text-on-surface">Key Metrics (AY 2024–25)</h2>
                      <p className="text-[11px] text-on-surface-variant">Real-time performance audit data</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[18px]">tune</span>
                </div>

                {/* 2x2 Metric Tile Grid */}
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-space-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-on-surface-variant font-medium">Approved Events</span>
                      <div className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">celebration</span>
                      </div>
                    </div>
                    <div className="pt-space-sm">
                      <span className="font-bold text-headline-xl text-on-surface tracking-tight">
                        {committee.metrics.approvedEvents}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-tertiary mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                        <span>100% on target</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-space-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-on-surface-variant font-medium">Student Footfall</span>
                      <div className="w-7 h-7 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">group</span>
                      </div>
                    </div>
                    <div className="pt-space-sm">
                      <span className="font-bold text-headline-xl text-on-surface tracking-tight">
                        {committee.metrics.footfall.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-secondary mt-0.5 font-medium">
                        <span>Across 6 Departments</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-space-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-on-surface-variant font-medium">Sanctioned Budget</span>
                      <div className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      </div>
                    </div>
                    <div className="pt-space-sm">
                      <span className="font-bold text-headline-lg text-on-surface tracking-tight leading-tight">
                        {committee.metrics.sanctionedBudget}
                      </span>
                      <div className="text-[10px] text-outline mt-0.5 font-mono">
                        Grant ID: {committee.metrics.grantId}
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-space-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-on-surface-variant font-medium">Budget Utilized</span>
                      <div className="w-7 h-7 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                      </div>
                    </div>
                    <div className="pt-space-sm">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-headline-lg text-on-surface tracking-tight leading-tight">
                          {committee.metrics.utilizedBudget}
                        </span>
                        <span className="text-[12px] text-tertiary font-bold">
                          {committee.metrics.utilizedPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className="bg-tertiary h-full rounded-full"
                          style={{ width: `${committee.metrics.utilizedPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-space-md p-space-sm rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                    <span className="text-[11px] text-on-surface-variant">Budget auditing current as of Nov 2024 Finance Council meet</span>
                  </div>
                  <button onClick={() => onNavigate('reports')} className="text-[11px] text-primary hover:underline font-semibold">
                    Ledger →
                  </button>
                </div>
              </article>

              {/* Card: Institutional Documents */}
              <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20 mb-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">folder_managed</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-headline-sm text-on-surface">Institutional Documents</h2>
                      <p className="text-[11px] text-on-surface-variant">Foundational charters, constitution &amp; office orders</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 bg-surface-container-low text-on-surface rounded-lg font-semibold border border-outline-variant/30">
                    {committee.documents.length} Active Files
                  </span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  {committee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-space-sm bg-surface border border-outline-variant/30 rounded-lg flex items-center justify-between hover:bg-surface-container-low transition-colors group"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                            {doc.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-outline">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                            <span>•</span>
                            <span className="text-tertiary font-medium">{doc.signedBy}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadDoc(doc.title)}
                        className="h-8 px-2.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface-variant text-[12px] font-medium flex items-center gap-1 transition-colors shrink-0 shadow-sm border border-outline-variant/40"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-space-md mt-auto">
                  <button
                    onClick={handleUploadDoc}
                    className="w-full h-10 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-label-md flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/40"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>+ Upload Institutional Document</span>
                  </button>
                </div>
              </article>

              {/* Compliance & Accreditation Stamp Panel */}
              <article className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-space-md flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[20px]">approval_delegation</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-label-sm text-on-surface">Institutional Repository Guarantee</span>
                    <span className="text-[11px] text-on-surface-variant">Hash-verified SHA256 records permanently indexed.</span>
                  </div>
                </div>
                <span className="text-[11px] text-tertiary bg-surface-container-lowest px-2.5 py-1 rounded-lg font-mono font-bold shadow-sm border border-outline-variant/30">
                  SYNCED
                </span>
              </article>
            </div>
          </div>
        )}

        {/* Documents Tab View */}
        {activeTab === 'documents' && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-headline-sm text-on-surface">All Institutional Documents</h3>
              <button
                onClick={handleUploadDoc}
                className="h-9 px-3.5 bg-primary text-on-primary rounded-lg text-label-sm font-semibold flex items-center gap-1 shadow-sm hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Upload New Document</span>
              </button>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {committee.documents.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-[24px]">picture_as_pdf</span>
                    <div>
                      <h4 className="font-semibold text-label-md text-on-surface">{doc.title}</h4>
                      <p className="text-[11px] text-on-surface-variant font-mono">
                        {doc.size} • {doc.date} • {doc.signedBy}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDoc(doc.title)}
                    className="h-8 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-[12px] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
