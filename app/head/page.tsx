'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import type { EventStatus, EventItem } from '@/src/types';

export default function HeadDashboardPage() {
  const { events, committees } = useAppContext();
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'All' | EventStatus>('All');

  // Filter events belonging to head's committee or general demo events
  const userCommitteeId = profile?.committeeIds?.[0] || 'com-cse-09';
  const myCommittee = committees.find((c) => c.id === userCommitteeId) || committees[0];

  const myEvents = events.filter(
    (e) =>
      e.committeeCode === myCommittee.code ||
      e.committee.toLowerCase().includes(myCommittee.name.toLowerCase()) ||
      e.committeeCode === 'com-cse-09'
  );

  const approvedCount = myEvents.filter((e) => e.status === 'Approved').length;
  const pendingCount = myEvents.filter((e) => e.status === 'Pending').length;
  const overdueCount = myEvents.filter((e) => e.status === 'Overdue (ATR Pending)').length;
  const draftCount = myEvents.filter((e) => e.status === 'Draft' || e.status === 'Changes Requested').length;

  const totalSanctioned = myEvents.reduce((acc, curr) => acc + curr.budgetSanctioned, 0);
  const totalUtilized = myEvents.reduce((acc, curr) => acc + curr.budgetUtilized, 0);
  const budgetPercent = totalSanctioned > 0 ? Math.round((totalUtilized / totalSanctioned) * 100) : 0;

  const filteredEvents = statusFilter === 'All'
    ? myEvents
    : myEvents.filter((e) => e.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Committee Head Command Center
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {myCommittee.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Track event lifecycles, manage participant enrollments, upload Action Taken Reports (ATRs), and issue verified credentials.
          </p>
        </div>
        <Link
          href="/head/events/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 shrink-0 self-start sm:self-center"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Create Event Wizard</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Approved Events</span>
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{approvedCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Ready for check-in &amp; delivery</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Approvals</span>
            <span className="material-symbols-outlined text-amber-400 text-[20px]">hourglass_top</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{pendingCount}</div>
          <div className="text-[11px] text-amber-400 mt-1">Under Faculty review</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending ATR Dossiers</span>
            <span className="material-symbols-outlined text-rose-400 text-[20px]">warning</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{overdueCount}</div>
          <div className="text-[11px] text-rose-400 mt-1">Requires post-event closeout</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Draft / Revisions</span>
            <span className="material-symbols-outlined text-blue-400 text-[20px]">edit_note</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{draftCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Incomplete proposals</div>
        </div>
      </div>

      {/* Budget Allotment Bar */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">Sanctioned Budget Utilization</span>
          <span className="font-bold text-indigo-400 font-mono">
            ₹{totalUtilized.toLocaleString('en-IN')} / ₹{totalSanctioned.toLocaleString('en-IN')} ({budgetPercent}%)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Events Management Table & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Committee Event Roster</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
              {filteredEvents.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Approved', 'Pending', 'Overdue (ATR Pending)', 'Changes Requested', 'Draft'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table List */}
        <div className="divide-y divide-slate-800/80">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No events found matching status filter &ldquo;{statusFilter}&rdquo;.
            </div>
          ) : (
            filteredEvents.map((evt: EventItem) => (
              <div
                key={evt.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] text-indigo-400 font-semibold">{evt.code}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{evt.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      evt.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      evt.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      evt.status === 'Overdue (ATR Pending)' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {evt.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white truncate">{evt.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span>Date: {evt.dateStr}</span>
                    <span>•</span>
                    <span>Venue: {evt.venue}</span>
                    <span>•</span>
                    <span>Budget: ₹{evt.budgetSanctioned.toLocaleString('en-IN')}</span>
                  </div>
                  {evt.facultyComments && (
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">feedback</span>
                      <span>Faculty Review: {evt.facultyComments}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {evt.status === 'Approved' && (
                    <Link
                      href={`/head/events/${evt.id}/manage`}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      <span>Manage Registrations</span>
                    </Link>
                  )}

                  {(evt.status === 'Approved' || evt.status === 'Overdue (ATR Pending)') && (
                    <Link
                      href={`/head/events/${evt.id}/post-event`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                      <span>Post-Event ATR &amp; Dossier</span>
                    </Link>
                  )}

                  {(evt.status === 'Draft' || evt.status === 'Changes Requested') && (
                    <Link
                      href={`/head/events/create?edit=${evt.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Edit &amp; Resubmit</span>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
