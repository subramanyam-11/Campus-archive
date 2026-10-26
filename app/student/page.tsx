'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import type { EventCategoryType } from '@/src/types';

export default function StudentDiscoveryPage() {
  const { events } = useAppContext();
  const { profile } = useAuth();

  const [activeCategory, setActiveCategory] = useState<'all' | EventCategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Approved events available for students
  const approvedEvents = events.filter((e) => e.status === 'Approved');

  const filteredEvents = approvedEvents.filter((evt) => {
    const matchesCategory = activeCategory === 'all' || evt.categoryType === activeCategory;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.committee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.objective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Hero Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-950/70 via-indigo-950/40 to-slate-900 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Student Event Discovery Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {profile?.displayName?.split(' ')[0] || 'Delegate'}!
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Explore approved collegiate technical workshops, research symposia, and coding hackathons. Enrol seamlessly, get digital QR entry passes, and earn verified NAAC credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/student/my-events"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/30"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>My Entry Passes</span>
          </Link>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-500 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, speaker, committee, venue..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Opportunities' },
            { id: 'workshop', label: 'Technical Workshops' },
            { id: 'symposium', label: 'Symposia & Seminars' },
            { id: 'competition', label: 'Hackathons & Contests' },
            { id: 'conference', label: 'Conferences' },
            { id: 'cultural', label: 'Cultural & Arts' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as 'all' | EventCategoryType)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No events found matching your search.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const seatsRemaining = Math.max(0, evt.attendanceTarget - (evt.attendanceValidated || 0));
            const isFull = seatsRemaining === 0;

            return (
              <div
                key={evt.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                      {evt.committee}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {evt.naacCategory}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.objective}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-500">
                        calendar_month
                      </span>
                      {evt.dateStr}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-500">
                        location_on
                      </span>
                      {evt.venue}
                    </span>
                  </div>

                  {/* Seat Availability Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Availability:</span>
                      <span className={isFull ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {isFull ? 'Waitlist Open' : `${seatsRemaining} Seats Remaining`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isFull ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((evt.attendanceValidated || 0) / (evt.attendanceTarget || 100)) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    href={`/student/events/${evt.id}`}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                  >
                    <span>View Details &amp; Enrol</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
