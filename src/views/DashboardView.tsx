import React, { useState } from 'react';
import { ViewType, UserPersona, EventItem } from '../types';

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
  activePersona: UserPersona;
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onOpenNewEventModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  activePersona,
  events,
  onSelectEvent,
  onOpenNewEventModal,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage('Live audit stream refreshed with latest block confirmations.');
      setTimeout(() => setToastMessage(null), 3000);
    }, 600);
  };

  const handleIssueNotice = (eventName: string) => {
    setToastMessage(`Formal compliance notice dispatched to convener of ${eventName}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar / Breadcrumb Profile Anchor */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/30">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-[11px] font-semibold text-outline uppercase tracking-wider mb-1">
            <span>Institutional Console</span>
            <span>/</span>
            <span className="text-primary font-semibold">Executive Dashboard</span>
          </div>
          <h1 className="font-semibold text-headline-xl text-on-surface tracking-tight">
            System Overview &amp; Activity Hub
          </h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            AY 2024–25 • Real-time status of committee actions, proposals, and compliance
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container-lowest border border-outline-variant/40 px-space-md py-space-sm rounded-xl shadow-sm">
          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-label-md text-on-surface">{activePersona.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-semibold tracking-wide">
                {activePersona.role}
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant">{activePersona.department}</span>
          </div>
        </div>
      </div>

      {/* Metric / Summary Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1: Active Committees */}
        <div
          onClick={() => onNavigate('committees')}
          className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:border-primary/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-label-md text-on-surface-variant">Active Committees</span>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">lan</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="font-bold text-headline-xl text-on-surface tracking-tight">28</span>
            <span className="text-[12px] text-on-surface-variant mt-1">4 statutory cells, 24 departmental &amp; clubs</span>
          </div>
        </div>

        {/* Metric 2: Pending Approvals */}
        <div
          onClick={() => onNavigate('events')}
          className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:border-primary/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-label-md text-on-surface-variant">Pending Approvals</span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">assignment_late</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-headline-xl text-on-surface tracking-tight">07</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Urgent
              </span>
            </div>
            <span className="text-[12px] text-on-surface-variant mt-1">Requires faculty / dean sign-off</span>
          </div>
        </div>

        {/* Metric 3: Events This Year */}
        <div
          onClick={() => onNavigate('events')}
          className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:border-primary/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-label-md text-on-surface-variant">Events This Year</span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="font-bold text-headline-xl text-on-surface tracking-tight">142</span>
            <span className="text-[12px] text-on-surface-variant mt-1">AY 2024–25 across all units</span>
          </div>
        </div>

        {/* Metric 4: Reports Overdue */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:border-error/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-label-md text-on-surface-variant">Reports Overdue</span>
            <div className="w-9 h-9 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-headline-xl text-error tracking-tight">03</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span> ATR Alert
              </span>
            </div>
            <span className="text-[12px] text-on-surface-variant mt-1">Post-event ATRs past 14-day limit</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Grid: Recent Activity Feed + Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Recent Activity Feed (8 Columns) */}
        <section className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-space-lg">
          <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
              <h2 className="font-semibold text-headline-md text-on-surface">Recent Activity</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-on-surface-variant font-medium">Live Audit Stream</span>
              <button
                onClick={handleRefresh}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors"
                title="Refresh Feed"
              >
                <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
                  sync
                </span>
              </button>
            </div>
          </div>

          {/* Activity List Items */}
          <div className="flex flex-col gap-space-sm">
            {/* Entry 1: Renewable Symposium */}
            <div className="group p-space-md rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low border border-transparent hover:border-outline-variant/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-start gap-space-md min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center text-primary mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">solar_power</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-headline-sm text-on-surface truncate">
                      National Symposium on Renewable Energy
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Approved
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mt-1">
                    <span className="font-medium text-on-surface">IEEE PES Student Chapter</span>
                    <span>•</span>
                    <span>2 hours ago by Dean Academic</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => {
                    const evt = events.find((e) => e.id === 'evt-2024-089') || events[0];
                    onSelectEvent(evt);
                    onNavigate('event-detail');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary text-label-sm font-semibold transition-colors flex items-center gap-1 shadow-sm border border-outline-variant/40"
                >
                  <span>View Dossier</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Entry 2: Autonomous Robotics */}
            <div className="group p-space-md rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low border border-transparent hover:border-outline-variant/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-start gap-space-md min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center text-secondary mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-headline-sm text-on-surface truncate">
                      Autonomous Robotics Hackathon (RoboForge)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mt-1">
                    <span className="font-medium text-on-surface">Mechatronics Club</span>
                    <span>•</span>
                    <span>Submitted yesterday, 16:40 IST</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => {
                    const evt = events.find((e) => e.id === 'evt-2024-091') || events[1];
                    onSelectEvent(evt);
                    onNavigate('event-detail');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-label-sm font-semibold transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span>Review Proposal</span>
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                </button>
              </div>
            </div>

            {/* Entry 3: NSS Gram Swachhata */}
            <div className="group p-space-md rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low border border-transparent hover:border-outline-variant/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-start gap-space-md min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center text-on-surface-variant mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-headline-sm text-on-surface truncate">
                      Gram Swachhata Rural Outreach Camp
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                      Draft
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mt-1">
                    <span className="font-medium text-on-surface">Central NSS Unit</span>
                    <span>•</span>
                    <span>Edited 2 days ago by Dr. V. Patil</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => onNavigate('events')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface text-label-sm font-medium transition-colors flex items-center gap-1 shadow-sm border border-outline-variant/40"
                >
                  <span>Resume Draft</span>
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>
            </div>

            {/* Entry 4: Alumni Conclave Overdue */}
            <div className="group p-space-md rounded-lg bg-error-container/20 hover:bg-error-container/30 border border-error/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-start gap-space-md min-w-0">
                <div className="w-9 h-9 rounded-lg bg-error-container flex-shrink-0 flex items-center justify-center text-error mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-headline-sm text-on-surface truncate">
                      Annual Alumni Networking Conclave
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error-container text-error text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Overdue
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mt-1">
                    <span className="font-medium text-on-surface">Alumni Relations Cell</span>
                    <span>•</span>
                    <span className="text-error font-medium">ATR pending submission since Oct 12</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => handleIssueNotice('Annual Alumni Networking Conclave')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-error hover:bg-error-container text-label-sm font-semibold transition-colors flex items-center gap-1 shadow-sm border border-error/30"
                >
                  <span>Issue Notice</span>
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                </button>
              </div>
            </div>

            {/* Entry 5: Patent Filing Masterclass */}
            <div className="group p-space-md rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low border border-transparent hover:border-outline-variant/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-start gap-space-md min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center text-tertiary mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-headline-sm text-on-surface truncate">
                      Patent Filing &amp; IP Strategy Masterclass
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Approved
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mt-1">
                    <span className="font-medium text-on-surface">EDC &amp; IPR Cell</span>
                    <span>•</span>
                    <span>Approved 3 days ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => onNavigate('events')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary text-label-sm font-semibold transition-colors flex items-center gap-1 shadow-sm border border-outline-variant/40"
                >
                  <span>View Dossier</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-space-md pt-space-sm border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Displaying 5 of 38 recent actions across verified committees</span>
            <button
              onClick={() => onNavigate('events')}
              className="text-primary hover:underline text-label-sm font-semibold flex items-center gap-0.5"
            >
              <span>Open Activity Log</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Side Column: Quick Action Shortcuts & Institutional Context (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Quick Action Shortcuts Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-space-lg flex flex-col">
            <div className="flex items-center gap-2 pb-space-sm mb-space-sm border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
              <h2 className="font-semibold text-headline-md text-on-surface">Quick Actions</h2>
            </div>
            <div className="flex flex-col gap-space-sm">
              <button
                onClick={onOpenNewEventModal}
                className="group p-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-all flex items-center justify-between shadow-sm text-left w-full"
              >
                <div className="flex items-center gap-space-md">
                  <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-label-md">Submit New Proposal</span>
                    <span className="text-[11px] text-white/80">Initiate event approval or grant</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={() => onNavigate('committees')}
                className="group p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all flex items-center justify-between text-left w-full"
              >
                <div className="flex items-center gap-space-md">
                  <div className="w-8 h-8 rounded-md bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">groups_3</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-label-md text-on-surface">View All Committees</span>
                    <span className="text-[11px] text-on-surface-variant">28 active charters &amp; roles</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-on-surface group-hover:translate-x-1 transition-all text-[18px]">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={() => onNavigate('archive-and-search')}
                className="group p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all flex items-center justify-between text-left w-full"
              >
                <div className="flex items-center gap-space-md">
                  <div className="w-8 h-8 rounded-md bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">travel_explore</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-label-md text-on-surface">Search Archive</span>
                    <span className="text-[11px] text-on-surface-variant">Resolutions, circulars &amp; photos</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-on-surface group-hover:translate-x-1 transition-all text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Compliance & Regulatory Health Widget */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-space-lg flex flex-col">
            <div className="flex items-center justify-between pb-space-xs mb-space-sm border-b border-outline-variant/20">
              <span className="font-semibold text-label-md text-on-surface">Institutional Health</span>
              <span className="text-[11px] text-tertiary font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> 94.2% Compliant
              </span>
            </div>

            {/* Linear Metric Indicator */}
            <div className="flex flex-col gap-2 my-space-xs">
              <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden flex border border-outline-variant/30">
                <div className="bg-tertiary h-full" style={{ width: '78%' }} title="Completed Reports (78%)"></div>
                <div className="bg-secondary h-full" style={{ width: '16%' }} title="In Review (16%)"></div>
                <div className="bg-error h-full" style={{ width: '6%' }} title="Overdue (6%)"></div>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-on-surface-variant text-center">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-on-surface">112</span>
                  <span className="text-[10px] text-outline">Verified ATRs</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-on-surface">23</span>
                  <span className="text-[10px] text-outline">In Review</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-error">03</span>
                  <span className="text-[10px] text-error font-medium">Delinquent</span>
                </div>
              </div>
            </div>

            <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-outline text-[18px] mt-0.5">policy</span>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                NAAC / NBA institutional compliance cycle requires Action Taken Reports (ATR) to be cleared within 14 days of event closure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
