'use client';

import React, { useState } from 'react';
import { EventItem, ViewType } from '../types';

interface EventsViewProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onNavigate: (view: ViewType) => void;
  onOpenNewEventModal: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onSelectEvent,
  onNavigate,
  onOpenNewEventModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [ayFilter, setAyFilter] = useState('AY 2024–25 (Odd & Even)');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'analytics'>('table');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredEvents = events.filter((e) => {
    const textMatch =
      !searchTerm ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.convener.toLowerCase().includes(searchTerm.toLowerCase());

    const commMatch =
      committeeFilter === 'all' ||
      e.committee.toLowerCase().includes(committeeFilter.toLowerCase());

    const catMatch =
      categoryFilter === 'all' ||
      e.categoryType === categoryFilter;

    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'Approved' && e.status === 'Approved') ||
      (statusFilter === 'Pending' && e.status === 'Pending') ||
      (statusFilter === 'Draft' && e.status === 'Draft') ||
      (statusFilter === 'Overdue ATR' && e.status.includes('Overdue'));

    return textMatch && commMatch && catMatch && statusMatch;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredEvents.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const csvContent =
      'ID,Ref,Title,Committee,Category,Date,Venue,Sanctioned Budget,Utilized,Status\n' +
      events
        .map(
          (e) =>
            `"${e.code}","${e.refNo}","${e.title}","${e.committee}","${e.category}","${e.dateStr}","${e.venue}",${e.budgetSanctioned},${e.budgetUtilized},"${e.status}"`
        )
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CCEAS_Events_Registry_AY24-25.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported full events ledger to CSV.');
  };

  return (
    <div className="px-4 lg:px-gutter-desktop py-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/30">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
            <span>System</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-semibold">Events Registry</span>
          </div>
          <h1 className="font-semibold text-headline-xl text-on-surface tracking-tight">
            Institutional Events &amp; Activities Registry
          </h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            Centralized statutory event archive, compliance monitoring, and ATR tracking
          </p>
        </div>

        <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-surface-container rounded-xl border border-outline-variant/30">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              <span>Analytics</span>
            </button>
          </div>

          <button
            onClick={() => showToast('Opening immutable ledger audit log...')}
            className="h-9 px-space-md bg-surface-container-lowest text-on-surface border border-outline-variant/50 rounded-xl flex items-center gap-space-xs font-medium text-label-md hover:bg-surface-container-low transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
            <span>View Audit Log</span>
          </button>
          <button
            onClick={onOpenNewEventModal}
            className="h-9 px-space-md bg-primary text-on-primary rounded-xl flex items-center gap-space-xs font-semibold text-label-md hover:bg-primary-container transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Event</span>
          </button>
        </div>
      </div>

      {/* Quick Compliance Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Recorded
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-headline-lg font-bold text-on-surface">142</span>
              <span className="text-[11px] text-primary font-semibold">AY 24-25</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Approved &amp; Executed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-headline-lg font-bold text-tertiary">98</span>
              <span className="text-[11px] text-tertiary font-semibold">69.0%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Pending Directorate Approval
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-headline-lg font-bold text-on-surface">31</span>
              <span className="text-[11px] text-on-surface-variant font-semibold">In Queue</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              ATR / Audits Overdue
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-headline-lg font-bold text-error">13</span>
              <span className="text-[11px] text-error font-semibold">Immediate Action</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error-container/60 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
        </div>
      </div>

      {/* View Mode Switching: Table | Calendar | Analytics */}
      {viewMode === 'table' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 flex flex-col shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-space-md bg-surface-container-low border-b border-outline-variant/30 flex flex-col gap-space-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-sm">
              <div className="relative lg:col-span-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by event title, proposal ID, or convener..."
                  className="w-full h-10 pl-9 pr-3 text-body-sm bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="relative">
                <select
                  value={committeeFilter}
                  onChange={(e) => setCommitteeFilter(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 text-body-sm bg-surface-container-lowest rounded-xl text-on-surface appearance-none border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">All Committees (ACM, IEEE, NSS...)</option>
                  <option value="ieee">IEEE PES Chapter</option>
                  <option value="acm">ACM Student Chapter</option>
                  <option value="nss">Central NSS Unit</option>
                  <option value="mecha">Mechatronics Club</option>
                  <option value="alumni">Alumni Relations Cell</option>
                  <option value="red cross">Red Cross Youth Wing</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                  unfold_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={ayFilter}
                  onChange={(e) => setAyFilter(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 text-body-sm bg-surface-container-lowest rounded-xl text-on-surface appearance-none border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option>AY 2024–25 (Odd &amp; Even)</option>
                  <option>AY 2023–24 (Historical)</option>
                  <option>AY 2022–23 (Archival)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                  unfold_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 text-body-sm bg-surface-container-lowest rounded-xl text-on-surface appearance-none border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">All Categories (Symposium...)</option>
                  <option value="symposium">National Symposium</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="outreach">Community Outreach</option>
                  <option value="course">Value-Added Course</option>
                  <option value="conclave">Conclave &amp; Keynotes</option>
                  <option value="social">Social Service</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
                <span className="text-[11px] text-outline uppercase tracking-wider font-semibold mr-1">Status:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-label-sm font-semibold transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-surface-container text-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All ({events.length})
                </button>
                <button
                  onClick={() => setStatusFilter('Approved')}
                  className={`px-2.5 py-1 rounded-full text-label-sm font-medium transition-colors ${
                    statusFilter === 'Approved'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Approved (98)
                </button>
                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-2.5 py-1 rounded-full text-label-sm font-medium transition-colors ${
                    statusFilter === 'Pending'
                      ? 'bg-secondary-fixed text-on-secondary-container font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Pending (24)
                </button>
                <button
                  onClick={() => setStatusFilter('Draft')}
                  className={`px-2.5 py-1 rounded-full text-label-sm font-medium transition-colors ${
                    statusFilter === 'Draft'
                      ? 'bg-surface-container-high text-on-surface font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Draft (7)
                </button>
                <button
                  onClick={() => setStatusFilter('Overdue ATR')}
                  className={`px-2.5 py-1 rounded-full text-label-sm font-medium transition-colors ${
                    statusFilter === 'Overdue ATR'
                      ? 'bg-error-container text-error font-semibold'
                      : 'bg-surface-container-lowest text-error hover:bg-error-container/20'
                  }`}
                >
                  Overdue ATR (13)
                </button>
              </div>

              <div className="flex items-center gap-space-sm shrink-0">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCommitteeFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dense Institutional Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] font-semibold uppercase tracking-wider h-11 select-none border-b border-outline-variant/30">
                  <th className="pl-space-md pr-space-sm w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredEvents.length && filteredEvents.length > 0}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-0 bg-surface cursor-pointer"
                    />
                  </th>
                  <th className="px-space-md min-w-[280px]">Event Title &amp; Organizing Body</th>
                  <th className="px-space-md min-w-[170px]">Category</th>
                  <th className="px-space-md min-w-[200px]">Date &amp; Venue</th>
                  <th className="px-space-md min-w-[140px] text-right">Budget (Sanctioned)</th>
                  <th className="px-space-md min-w-[140px] text-center">Status</th>
                  <th className="pr-space-md pl-space-sm min-w-[150px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 text-body-sm text-on-surface">
                {filteredEvents.map((evt) => {
                  const isSelected = selectedIds.includes(evt.id);
                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-surface-container-low/70 transition-colors group ${
                        evt.status.includes('Overdue') ? 'bg-error-container/5' : ''
                      } ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="pl-space-md pr-space-sm text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(evt.id)}
                          className="w-4 h-4 rounded text-primary focus:ring-0 bg-surface cursor-pointer"
                        />
                      </td>
                      <td className="px-space-md py-3.5">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onSelectEvent(evt);
                                onNavigate('event-detail');
                              }}
                              className="font-semibold text-headline-sm text-on-surface group-hover:text-primary transition-colors text-left truncate"
                            >
                              {evt.title}
                            </button>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                              {evt.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-space-xs mt-0.5 text-on-surface-variant text-[12px]">
                            <span className="material-symbols-outlined text-[15px] text-outline">groups</span>
                            <span className="font-medium text-on-surface">{evt.committee}</span>
                            <span className="text-outline">•</span>
                            <span>Convener: {evt.convener}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-md py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant text-[12px] font-medium">
                          <span className="material-symbols-outlined text-[15px] text-primary">
                            {evt.categoryType === 'hackathon' ? 'terminal' : evt.categoryType === 'social' ? 'favorite' : 'record_voice_over'}
                          </span>
                          <span>{evt.category}</span>
                        </div>
                      </td>
                      <td className="px-space-md py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 font-semibold text-label-md text-on-surface">
                            <span className="material-symbols-outlined text-[15px] text-outline">event</span>
                            <span>{evt.dateStr}</span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant pl-5 truncate max-w-[200px]">
                            {evt.venue}
                          </span>
                        </div>
                      </td>
                      <td className="px-space-md py-3.5 text-right whitespace-nowrap">
                        <span className="font-mono font-semibold text-on-surface text-[14px]">
                          ₹ {evt.budgetSanctioned.toLocaleString()}
                        </span>
                        <span
                          className={`block text-[11px] ${
                            evt.status.includes('Overdue') ? 'text-error font-medium' : 'text-tertiary'
                          }`}
                        >
                          {evt.utilizationNote || 'Utilized: 100%'}
                        </span>
                      </td>
                      <td className="px-space-md py-3.5 text-center whitespace-nowrap">
                        {evt.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-label-sm font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>Approved</span>
                          </span>
                        )}
                        {evt.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed/40 text-on-secondary-container border border-secondary-container/40 text-label-sm font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            <span>Pending</span>
                          </span>
                        )}
                        {evt.status === 'Draft' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                            <span>Draft</span>
                          </span>
                        )}
                        {evt.status.includes('Overdue') && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-error text-label-sm font-semibold border border-error/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                            <span>Overdue (ATR Pending)</span>
                          </span>
                        )}
                      </td>
                      <td className="pr-space-md pl-space-sm py-3.5 text-right whitespace-nowrap">
                        {evt.status === 'Approved' && (
                          <button
                            onClick={() => {
                              onSelectEvent(evt);
                              onNavigate('event-detail');
                            }}
                            className="inline-flex items-center gap-1 text-label-md text-primary hover:text-primary-container font-semibold transition-colors"
                          >
                            <span>View Details</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        )}
                        {evt.status === 'Pending' && (
                          <button
                            onClick={() => {
                              onSelectEvent(evt);
                              onNavigate('event-detail');
                            }}
                            className="inline-flex items-center gap-1 text-label-md text-secondary hover:text-on-secondary-container font-semibold transition-colors"
                          >
                            <span>Review Proposal</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        )}
                        {evt.status === 'Draft' && (
                          <button
                            onClick={() => showToast(`Resuming draft edit for ${evt.title}`)}
                            className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
                          >
                            <span>Edit Draft</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        )}
                        {evt.status.includes('Overdue') && (
                          <button
                            onClick={() => showToast(`ATR submission portal opened for ${evt.code}`)}
                            className="inline-flex items-center gap-1 text-label-md text-error hover:text-on-error-container font-semibold transition-colors"
                          >
                            <span>Submit ATR</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Institutional Footer / Pagination Bar */}
          <div className="px-space-md py-space-sm bg-surface-container-low border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="text-body-sm text-on-surface-variant">
                Showing <strong className="text-on-surface font-semibold">1–{filteredEvents.length}</strong> of{' '}
                <strong className="text-on-surface font-semibold">142</strong> recorded events
              </span>
              <span className="text-outline">•</span>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 text-label-sm text-primary hover:text-primary-container font-semibold transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Ledger (CSV)</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface text-label-sm flex items-center gap-1 border border-outline-variant/40 disabled:opacity-40"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>Previous</span>
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded-xl bg-primary text-on-primary text-label-sm font-semibold flex items-center justify-center shadow-sm"
                type="button"
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className="w-8 h-8 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface text-label-sm flex items-center justify-center transition-colors border border-outline-variant/30"
                type="button"
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className="w-8 h-8 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface text-label-sm flex items-center justify-center transition-colors border border-outline-variant/30"
                type="button"
              >
                3
              </button>
              <span className="px-1 text-outline text-label-sm">...</span>
              <button
                onClick={() => setCurrentPage(18)}
                className="w-8 h-8 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface text-label-sm flex items-center justify-center transition-colors border border-outline-variant/30"
                type="button"
              >
                18
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(18, currentPage + 1))}
                className="h-8 px-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface text-label-sm flex items-center gap-1 border border-outline-variant/40"
                type="button"
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg shadow-sm">
          <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/30">
            <div>
              <h2 className="text-title-lg font-bold text-on-surface">Institutional Event Schedule</h2>
              <p className="text-body-sm text-on-surface-variant">Scheduled &amp; archived activities for AY 2024–25</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                November 2024
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Calendar Days Matrix */}
            <div className="lg:col-span-2 border border-outline-variant/30 rounded-xl overflow-hidden">
              <div className="grid grid-cols-7 bg-surface-container-low text-center text-xs font-semibold py-2.5 text-on-surface-variant border-b border-outline-variant/30">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              <div className="grid grid-cols-7 auto-rows-fr gap-px bg-outline-variant/20">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const dayNum = (idx % 30) + 1;
                  const dayEvents = events.filter((_, i) => i % 7 === idx % 7);
                  return (
                    <div
                      key={idx}
                      className="bg-surface-container-lowest min-h-[90px] p-1.5 flex flex-col justify-between hover:bg-surface-container-low/40 transition-colors cursor-pointer"
                      onClick={() => {
                        if (dayEvents[0]) {
                          onSelectEvent(dayEvents[0]);
                          onNavigate('event-detail');
                        }
                      }}
                    >
                      <span className="text-[11px] font-semibold text-on-surface-variant">{dayNum}</span>
                      <div className="flex flex-col gap-1 mt-1">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                              ev.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ev.status === 'Pending'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[9px] text-primary font-bold pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Agenda Rail */}
            <div className="flex flex-col gap-4">
              <h3 className="text-title-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">event_upcoming</span>
                <span>Upcoming Agenda &amp; Milestones</span>
              </h3>
              <div className="flex flex-col gap-3">
                {filteredEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onSelectEvent(evt);
                      onNavigate('event-detail');
                    }}
                    className="p-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary">{evt.dateStr}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container font-mono text-on-surface-variant">
                        {evt.code}
                      </span>
                    </div>
                    <span className="font-semibold text-body-sm text-on-surface line-clamp-1">{evt.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm">
              <h3 className="text-title-sm font-bold text-on-surface mb-1">Budget Allocation by Committee</h3>
              <p className="text-xs text-on-surface-variant mb-4">Total Sanctioned: ₹ 14,80,000</p>
              <div className="flex flex-col gap-3">
                {[
                  { name: 'ACM Chapter', amount: '₹ 4,50,000', pct: 85, color: 'bg-primary' },
                  { name: 'IEEE PES', amount: '₹ 3,80,000', pct: 72, color: 'bg-blue-600' },
                  { name: 'NSS Outreach', amount: '₹ 2,90,000', pct: 95, color: 'bg-emerald-600' },
                  { name: 'Mechatronics', amount: '₹ 2,10,000', pct: 60, color: 'bg-purple-600' },
                  { name: 'Alumni Cell', amount: '₹ 1,50,000', pct: 45, color: 'bg-amber-600' },
                ].map((item) => (
                  <div key={item.name} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.name}</span>
                      <span className="text-on-surface-variant">{item.amount}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm">
              <h3 className="text-title-sm font-bold text-on-surface mb-1">Activity Category Distribution</h3>
              <p className="text-xs text-on-surface-variant mb-4">Categorical footprint across 142 events</p>
              <div className="flex flex-col gap-3">
                {[
                  { cat: 'National Symposia & Conclaves', count: 42, pct: '30%' },
                  { cat: 'Hackathons & Coding Sprints', count: 35, pct: '25%' },
                  { cat: 'Community & Social Service (NSS)', count: 28, pct: '20%' },
                  { cat: 'Faculty Development (FDP/VAC)', count: 22, pct: '15%' },
                  { cat: 'Industry & Alumni Panels', count: 15, pct: '10%' },
                ].map((c) => (
                  <div key={c.cat} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-xs">
                    <span className="font-medium text-on-surface">{c.cat}</span>
                    <span className="font-bold text-primary">{c.count} ({c.pct})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm">
              <h3 className="text-title-sm font-bold text-on-surface mb-1">NAAC / NBA Criteria Mapping</h3>
              <p className="text-xs text-on-surface-variant mb-4">Statutory evidence alignment</p>
              <div className="flex flex-col gap-3">
                {[
                  { criterion: 'Criterion 1: Curricular Aspects', count: 18, score: '94%' },
                  { criterion: 'Criterion 2: Teaching-Learning & Eval', count: 31, score: '88%' },
                  { criterion: 'Criterion 3: Research, Innovations & Ext', count: 54, score: '98%' },
                  { criterion: 'Criterion 5: Student Support & Progression', count: 27, score: '92%' },
                  { criterion: 'Criterion 6: Governance, Leadership', count: 12, score: '85%' },
                ].map((crit) => (
                  <div key={crit.criterion} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low text-xs">
                    <span className="font-medium text-on-surface truncate pr-2">{crit.criterion}</span>
                    <span className="font-bold text-tertiary shrink-0">{crit.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Compliance Notice Box */}
      <div className="bg-surface-container border border-outline-variant/40 p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">policy</span>
          <div className="flex flex-col">
            <span className="font-semibold text-label-md text-on-surface">
              Institutional Compliance Mandate (NAAC / NBA Criteria 3.3)
            </span>
            <span className="text-body-sm text-on-surface-variant">
              All event conveners must upload geo-tagged photo dossiers, verified participant rosters, and financial utilization certificates within 7 calendar days of event completion.
            </span>
          </div>
        </div>
        <button
          onClick={() => showToast('Displaying NAAC Audit Standard Operating Procedure v2.4')}
          className="shrink-0 px-space-md py-1.5 rounded-xl bg-surface-container-lowest text-primary text-label-sm font-semibold hover:bg-surface-container-low transition-colors shadow-sm border border-outline-variant/30"
        >
          Read Audit SOP
        </button>
      </div>
    </div>
  );
};
