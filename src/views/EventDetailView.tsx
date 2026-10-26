'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { EventItem, ViewType } from '../types';
import { DossierModal } from '../components/DossierModal';

interface EventDetailViewProps {
  event?: EventItem;
  onNavigate: (view: ViewType) => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({ event, onNavigate }) => {
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string; alt: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!event) {
    return (
      <div className="p-8 text-on-surface">
        <h2 className="text-xl font-bold">Event not found</h2>
        <p className="text-on-surface-variant text-sm mt-1">The requested event dossier could not be loaded.</p>
        <button 
          onClick={() => onNavigate('events')} 
          className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-container transition-colors"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadSanction = () => {
    showToast(`Downloading Executive Sanction Letter for ${event.refNo}...`);
    setTimeout(() => {
      setIsDossierOpen(true);
    }, 400);
  };

  const handleDownloadAttendance = () => {
    const csvContent =
      'Delegate ID,Delegate Name,Roll/PRN,Institution/Dept,Sign-In Time,Method\n' +
      'DEL-001,Priya Sharma,2021BTEEE0012,EEE Dept,09:15:22,QR Verified\n' +
      'DEL-002,Aditya Verma,2022BTEEE0034,EEE Dept,09:18:10,QR Verified\n' +
      'DEL-003,Nikhil Kulkarni,2021BTECS0091,CSE Dept,09:22:45,QR Verified\n' +
      'DEL-004,Dr. Meenakshi Sundaram,FAC-EEE-001,Head EEE,09:25:00,Faculty Badge\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Sheet_${event.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded verified attendance CSV ledger.');
  };

  return (
    <div className="p-4 lg:p-gutter-desktop space-y-space-lg max-w-[1520px] mx-auto w-full pb-20">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hierarchy & Breadcrumb Strip */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs border-b border-outline-variant/30">
        <nav className="flex items-center gap-space-xs text-label-sm text-on-surface-variant flex-wrap">
          <button
            onClick={() => onNavigate('events')}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">event</span>
            <span>Events</span>
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-medium tracking-wide text-[11px] font-mono">
            {event.code}
          </span>
          <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-xs md:max-w-md">
            {event.title}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant text-label-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            {event.naacCategory}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-on-surface text-label-sm font-semibold border border-outline-variant/30">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
            Tier-1 Institutional Record
          </span>
        </div>
      </div>

      {/* Event Title Bar & Primary Sanction Banner */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-space-md">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-md">
          <div className="space-y-space-xs max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="px-2 py-0.5 rounded bg-primary text-on-primary text-[11px] font-semibold tracking-wider uppercase">
                Institutional Proposal
              </span>
              <span className="text-[11px] text-outline font-semibold tracking-wide font-mono">
                REF: {event.refNo}
              </span>
            </div>
            <h1 className="font-bold text-headline-xl text-on-surface tracking-tight">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-on-surface-variant text-body-sm flex-wrap">
              <span className="material-symbols-outlined text-[18px] text-primary">lan</span>
              <span className="font-semibold text-on-surface">{event.committee}</span>
              <span className="text-outline-variant">•</span>
              <span>{event.department}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm self-start lg:self-center">
            <button
              onClick={handleDownloadSanction}
              className="inline-flex items-center gap-2 h-9 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-label-md font-medium border border-outline-variant/40 transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
              <span>Download Sanction Letter (PDF)</span>
            </button>
            <button
              onClick={() => setIsDossierOpen(true)}
              className="inline-flex items-center gap-2 h-9 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>Generate Dossier</span>
            </button>
          </div>
        </div>

        {/* State & Verification Badge Ribbon */}
        <div className="p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#DEF7EC] text-[#03543F] text-label-sm font-bold tracking-wide border border-[#BCF0DA]">
              <span className="w-2 h-2 rounded-full bg-[#057A55] animate-pulse"></span>
              Approved
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface font-bold">Principal Sanction Granted</span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Digital Signature SHA-256 Verified • 16-OCT-2024 16:42:10 IST
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-outline text-[12px] font-medium">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
              <span>Record Tamper-Proof</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">cloud_done</span>
              <span>Archived in CCEAS Registry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Dual-Column Administrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (Span 7) : Proposal Details & Execution Evidence */}
        <div className="lg:col-span-7 space-y-space-lg">
          {/* SECTION 1: Proposal Details Card */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                <h2 className="font-semibold text-headline-md text-on-surface">Proposal Details</h2>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-outline font-semibold font-mono">
                Registry Code: {event.code}
              </span>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-outline">
                Primary Objective
              </span>
              <p className="text-body-md text-on-surface leading-relaxed">{event.objective}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
              <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-space-sm">
                <div className="p-2 rounded bg-surface-container-lowest text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-outline">
                    Event Schedule
                  </span>
                  <span className="text-label-md text-on-surface font-semibold">{event.dateStr}</span>
                  <span className="text-body-sm text-on-surface-variant">09:30 AM – 05:00 PM IST (Full Day)</span>
                </div>
              </div>

              <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-space-sm">
                <div className="p-2 rounded bg-surface-container-lowest text-secondary shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">meeting_room</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-outline">
                    Designated Venue
                  </span>
                  <span className="text-label-md text-on-surface font-semibold">{event.venue}</span>
                  <span className="text-body-sm text-on-surface-variant">Ramanujan Academic Block, 2nd Floor</span>
                </div>
              </div>

              <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-space-sm">
                <div className="p-2 rounded bg-surface-container-lowest text-tertiary shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-outline">
                    Target Delegates
                  </span>
                  <span className="text-label-md text-on-surface font-semibold">{event.targetDelegates}</span>
                  <span className="text-body-sm text-on-surface-variant">UG / PG Researchers &amp; Faculty Members</span>
                </div>
              </div>

              <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-space-sm">
                <div className="p-2 rounded bg-surface-container-lowest text-primary-container shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-outline">
                    Budget Allocation
                  </span>
                  <span className="text-label-md text-on-surface font-semibold">
                    ₹ {event.budgetSanctioned.toLocaleString()} Sanctioned
                  </span>
                  <span className="text-body-sm text-on-surface-variant">Academic Grants (Dean R&amp;D Pool)</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Execution Data & Evidence Card */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-tertiary rounded-full"></span>
                <h2 className="font-semibold text-headline-md text-on-surface">Execution Data &amp; Evidence</h2>
              </div>
              <span className="inline-flex items-center gap-1 text-tertiary text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Audited &amp; Reconciled
              </span>
            </div>

            {/* Attendance & Reconciliation Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Attendance Metric Tile */}
              <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-space-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-outline font-semibold">
                      Validated Attendance
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-headline-xl text-on-surface font-bold tracking-tight">
                        {event.attendanceValidated}
                      </span>
                      <span className="text-label-md text-outline font-medium">/ {event.attendanceTarget} Target</span>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#DEF7EC] text-[#03543F] text-[11px] font-bold border border-[#BCF0DA]">
                    {event.attendanceTurnoutPercent}% Turnout
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-outline-variant/20">
                  <span className="text-[12px] text-on-surface-variant">QR Scanned ledger uploaded</span>
                  <button
                    onClick={handleDownloadAttendance}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-container text-label-sm font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Attendance Sheet.csv</span>
                  </button>
                </div>
              </div>

              {/* Budget Ledger Tile */}
              <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-space-sm">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-outline font-semibold">
                    Financial Ledger Reconciliation
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-headline-xl text-on-surface font-bold tracking-tight">
                      ₹ {event.budgetUtilized.toLocaleString()}
                    </span>
                    <span className="text-label-md text-outline font-medium">Actual Incurred</span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden border border-outline-variant/30">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95.78%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant font-medium">
                      Sanctioned: ₹ {event.budgetSanctioned.toLocaleString()}
                    </span>
                    <span className="text-tertiary font-bold">
                      Surplus Returned: ₹ {event.surplusReturned.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documented Photo Gallery Grid (4 Hotlinked Slots) */}
            <div className="space-y-space-xs pt-space-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-outline font-semibold">
                  Documented Photo Gallery
                </span>
                <span className="text-[11px] text-outline font-medium">
                  {event.photos.length} High-Resolution Institutional Captures
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                {event.photos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative rounded-lg overflow-hidden bg-surface-container-low aspect-video flex flex-col cursor-pointer border border-outline-variant/40 shadow-sm hover:border-primary transition-all"
                  >
                    <Image
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={photo.url}
                      alt={photo.alt}
                      width={400}
                      height={250}
                      unoptimized
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent p-2 pt-6">
                      <span className="block text-[11px] text-white font-medium truncate">
                        {photo.caption}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Span 5) : Approval Timeline & Generated ATR */}
        <div className="lg:col-span-5 space-y-space-lg">
          {/* SECTION 3: Approval Status & Timeline Card */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                <h2 className="font-semibold text-headline-md text-on-surface">Approval Timeline</h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-surface-container text-label-sm text-on-surface-variant font-semibold">
                5 of 5 Cleared
              </span>
            </div>

            {/* Structured Vertical Stepper */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-3 before:w-0.5 before:bg-surface-container">
              {event.timeline.map((step, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full bg-[#DEF7EC] border border-[#BCF0DA] flex items-center justify-center text-[#03543F]">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-label-md text-on-surface">{step.step}</span>
                      <span className="text-[11px] text-outline font-mono">{step.date}</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      Initiated / Endorsed by <strong className="text-on-surface font-medium">{step.actor}</strong>.
                    </p>
                    {step.remarks && (
                      <div className="p-2 rounded bg-surface-container-low text-on-surface text-body-sm italic border border-outline-variant/20">
                        {step.remarks}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: Generated Report & ATR Card */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-secondary rounded-full"></span>
                <h2 className="font-semibold text-headline-md text-on-surface">Generated Report &amp; ATR</h2>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-outline font-semibold">
                Post-Event Audit
              </span>
            </div>

            {/* Outcomes Summary Box */}
            <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-space-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-outline">
                Summary of Outcomes (ATR)
              </span>
              <div className="space-y-2">
                {event.outcomesAtr.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-body-sm text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5">verified</span>
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Generation & Dispatch Box */}
            <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-space-md">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center border border-primary/20">
                    <span className="material-symbols-outlined text-[24px]">description</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-label-md text-on-surface">Official Comprehensive Event Dossier</span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      Generated on 20 Oct 2024, signed by Convener
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold border border-outline-variant/30">
                  PDF • 4.2 MB
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setIsDossierOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold transition-colors shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                <span>Generate PDF Report</span>
              </button>

              <div className="text-center text-[11px] text-outline font-medium">
                Complies with NBA Criterion 5 &amp; NAAC Metric 3.3 Institutional Reporting Standard
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Quick Archival Meta Footer */}
      <footer className="pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm text-[11px] text-outline border-t border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          <span>Centralized Committee &amp; Event Archival System (CCEAS) • Node ID: IN-MAA-01</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last Synced: Today at 10:14:02 IST</span>
          <span>Revision: 1.04</span>
        </div>
      </footer>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-2xl max-w-3xl w-full overflow-hidden"
          >
            <div className="p-3 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between">
              <span className="font-semibold text-label-md text-on-surface">{selectedPhoto.caption}</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-2 bg-slate-950 flex items-center justify-center">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.alt}
                width={800}
                height={600}
                unoptimized
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
            <div className="p-4 bg-surface text-body-sm text-on-surface-variant">
              {selectedPhoto.alt}
            </div>
          </div>
        </div>
      )}

      {/* Official Dossier Modal */}
      <DossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        event={event}
      />
    </div>
  );
};
