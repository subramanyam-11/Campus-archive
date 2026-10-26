'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/src/components/AppContext';

export default function FacultyCalendarPage() {
  const { events } = useAppContext();
  const [selectedVenue, setSelectedVenue] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'timeline' | 'month'>('timeline');

  const venues = Array.from(new Set(events.map((e) => e.venue).filter(Boolean)));

  const filteredEvents = events.filter((evt) => {
    return selectedVenue === 'All' || evt.venue === selectedVenue;
  });

  // Sort events chronologically by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return (a.rawDate || '').localeCompare(b.rawDate || '');
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/20 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            Institutional Schedule &amp; Space Logistics
          </div>
          <h1 className="text-2xl font-extrabold text-white">Academic Calendar &amp; Venue Timeline</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Visual map of scheduled collegiate activities, pending venue clearances, and ATR compliance deadlines across campus spaces.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/faculty"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">inbox</span>
            <span>Back to Inbox</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              viewMode === 'timeline'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Chronological Timeline
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              viewMode === 'month'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Venue Space Allocation
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter Venue:</label>
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Campus Venues</option>
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          {sortedEvents.map((evt, idx) => (
            <div
              key={evt.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center shrink-0">
                  <span className="text-[10px] text-teal-400 uppercase font-bold">
                    {evt.rawDate ? new Date(evt.rawDate).toLocaleString('default', { month: 'short' }) : 'NOV'}
                  </span>
                  <span className="text-base font-extrabold text-white leading-tight">
                    {evt.rawDate ? new Date(evt.rawDate).getDate() : idx + 10}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{evt.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : evt.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : evt.status === 'Overdue (ATR Pending)'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    {evt.committee} | Ref: {evt.refNo}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {evt.venue}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      ₹{evt.budgetSanctioned.toLocaleString('en-IN')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">groups</span>
                      {evt.attendanceTarget} Capacity
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href={`/faculty/inbox/${evt.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  <span>Inspect</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Space Allocation View */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues.map((venueName) => {
            const venueEvents = events.filter((e) => e.venue === venueName);
            return (
              <div key={venueName} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-400">meeting_room</span>
                    <span className="font-bold text-sm text-white">{venueName}</span>
                  </div>
                  <span className="text-xs text-slate-400">{venueEvents.length} Bookings</span>
                </div>

                <div className="space-y-2">
                  {venueEvents.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-2">No bookings recorded.</div>
                  ) : (
                    venueEvents.map((e) => (
                      <Link
                        key={e.id}
                        href={`/faculty/inbox/${e.id}`}
                        className="block p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/30 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{e.title}</span>
                          <span className="text-[11px] text-teal-400 font-mono">{e.dateStr}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {e.committee} — Status: {e.status}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
