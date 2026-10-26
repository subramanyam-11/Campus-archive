'use client';

import React, { useState } from 'react';
import { ViewType, EventItem } from '../types';
import { ARCHIVE_RECORDS } from '../data/mockData';

interface ArchiveSearchViewProps {
  initialQuery?: string;
  onNavigate: (view: ViewType) => void;
  onSelectEvent: (event: EventItem) => void;
  events: EventItem[];
}

export const ArchiveSearchView: React.FC<ArchiveSearchViewProps> = ({
  initialQuery = 'hackathon',
  onNavigate,
  onSelectEvent,
  events,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeScope, setActiveScope] = useState<'All' | 'Events' | 'Committees' | 'Documents'>('All');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [selectedAy, setSelectedAy] = useState('AY 2024–25');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [showSyntaxModal, setShowSyntaxModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClear = () => {
    setQuery('');
  };

  const filteredRecords = ARCHIVE_RECORDS.filter((rec) => {
    const q = query.toLowerCase().trim();
    const textMatch =
      !q ||
      rec.title.toLowerCase().includes(q) ||
      rec.snippet.toLowerCase().includes(q) ||
      rec.committee.toLowerCase().includes(q) ||
      rec.type.toLowerCase().includes(q);

    const scopeMatch =
      activeScope === 'All' ||
      (activeScope === 'Events' && rec.type === 'EVENT ARCHIVE') ||
      (activeScope === 'Committees' && rec.type === 'COMMITTEE ROSTER') ||
      (activeScope === 'Documents' && (rec.type === 'COMMITTEE DOCUMENT' || rec.type === 'ACTION TAKEN REPORT' || rec.type === 'MINUTES OF MEETING'));

    const commMatch =
      selectedCommittee === 'all' ||
      rec.committee.toLowerCase().includes(selectedCommittee.toLowerCase());

    return textMatch && scopeMatch && commMatch;
  });

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-secondary-fixed text-on-secondary-fixed px-0.5 rounded font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
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

      {/* Top Breadcrumb & Status */}
      <div className="px-4 lg:px-gutter-desktop py-space-md bg-surface-container-lowest border-b border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm max-w-7xl mx-auto w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-on-surface-variant text-[11px] mb-1 font-semibold uppercase tracking-wider">
              <span>System</span>
              <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
              <span className="text-primary font-bold">Archive &amp; Search Repository</span>
            </div>
            <h1 className="font-semibold text-headline-lg text-on-surface tracking-tight">
              Institutional Archive &amp; Full-Text Search
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Search across statutory events, committee rosters, minutes of meetings, and accreditation dossiers
            </p>
          </div>

          <div className="flex items-center gap-space-xs shrink-0 self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-on-surface text-[12px] font-medium border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span>Index Synced (AY 2024–25)</span>
            </div>
            <button
              onClick={() => setShowSyntaxModal(true)}
              className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-label-md font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Query Syntax</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Controls & Filter Area */}
      <div className="px-4 lg:px-gutter-desktop py-space-lg max-w-7xl mx-auto w-full space-y-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/40 space-y-space-md">
          {/* Main Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search keywords e.g. "Robotics Hackathon", "NAAC Criterion 3", "ACM Bylaws", or faculty name...'
              className="w-full h-12 pl-11 pr-24 text-[15px] bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              {query && (
                <button
                  onClick={handleClear}
                  className="p-1.5 text-outline hover:text-on-surface rounded hover:bg-surface-container transition-colors"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
              <button
                onClick={() => showToast(`Executing deep index query for "${query}"`)}
                className="h-9 px-3.5 bg-primary text-on-primary rounded font-semibold text-label-md hover:bg-primary-container transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>Query</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Scopes & Filters */}
          <div className="space-y-space-sm pt-1">
            {/* Scope Row */}
            <div className="flex flex-wrap items-center gap-space-xs text-label-sm">
              <span className="text-outline uppercase tracking-wider text-[11px] font-semibold w-16">Scope:</span>
              <button
                onClick={() => setActiveScope('All')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeScope === 'All'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setActiveScope('Events')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeScope === 'Events'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>Events</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">142</span>
              </button>
              <button
                onClick={() => setActiveScope('Committees')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeScope === 'Committees'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>Committees</span>
                <span className="px-1.5 py-0.2 rounded-full bg-outline-variant/30 text-[10px]">28</span>
              </button>
              <button
                onClick={() => setActiveScope('Documents')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeScope === 'Documents'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>Documents &amp; MoUs</span>
                <span className="px-1.5 py-0.2 rounded-full bg-outline-variant/30 text-[10px]">64</span>
              </button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-space-xs text-label-sm">
              <span className="text-outline uppercase tracking-wider text-[11px] font-semibold w-16">Filters:</span>
              <div className="relative">
                <select
                  value={selectedCommittee}
                  onChange={(e) => setSelectedCommittee(e.target.value)}
                  className="appearance-none h-8 pl-2.5 pr-7 bg-surface rounded border border-outline-variant/60 text-on-surface text-label-sm focus:outline-none focus:border-primary cursor-pointer hover:border-outline"
                >
                  <option value="all">All Committees ▾</option>
                  <option value="Mechatronics">Mechatronics &amp; Robotics Guild</option>
                  <option value="ACM">ACM Student Chapter</option>
                  <option value="Tech Fest">Annual Tech Fest Steering Committee</option>
                  <option value="Computer Science">Dept of Computer Science</option>
                </select>
                <span className="material-symbols-outlined text-[16px] absolute right-2 top-2 pointer-events-none text-outline">
                  expand_more
                </span>
              </div>

              <div className="h-4 w-px bg-outline-variant/50 mx-1"></div>

              <button
                onClick={() => setSelectedAy('AY 2024–25')}
                className={`h-8 px-2.5 rounded font-medium flex items-center gap-1 border ${
                  selectedAy === 'AY 2024–25'
                    ? 'bg-primary-fixed text-on-primary-fixed border-primary/20 font-semibold'
                    : 'bg-surface border-outline-variant/50 text-on-surface-variant'
                }`}
              >
                <span>AY 2024–25</span>
                {selectedAy === 'AY 2024–25' && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>

              <button
                onClick={() => setSelectedAy('AY 2023–24')}
                className={`h-8 px-2.5 rounded border border-outline-variant/50 text-on-surface-variant transition-colors ${
                  selectedAy === 'AY 2023–24' ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'bg-surface hover:bg-surface-container-low'
                }`}
              >
                AY 2023–24
              </button>

              <button
                onClick={() => setSelectedAy('Past 5 Years')}
                className={`h-8 px-2.5 rounded border border-outline-variant/50 text-on-surface-variant transition-colors ${
                  selectedAy === 'Past 5 Years' ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'bg-surface hover:bg-surface-container-low'
                }`}
              >
                Past 5 Years
              </button>

              <div className="h-4 w-px bg-outline-variant/50 mx-1"></div>

              <span className="text-outline uppercase tracking-wider text-[11px] font-semibold ml-1">Category:</span>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'Symposium' ? null : 'Symposium')}
                className={`px-2 py-0.5 rounded text-label-sm font-medium transition-colors ${
                  selectedCategory === 'Symposium' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Symposium
              </button>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'Workshop' ? null : 'Workshop')}
                className={`px-2 py-0.5 rounded text-label-sm font-medium transition-colors ${
                  selectedCategory === 'Workshop' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Workshop
              </button>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'Minutes' ? null : 'Minutes')}
                className={`px-2 py-0.5 rounded text-label-sm font-medium transition-colors ${
                  selectedCategory === 'Minutes' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Meeting Minutes
              </button>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'Audit' ? null : 'Audit')}
                className={`px-2 py-0.5 rounded text-label-sm font-medium transition-colors ${
                  selectedCategory === 'Audit' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Audit Report
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-headline-sm text-on-surface">
              Showing {filteredRecords.length} search results matching{' '}
              <mark className="bg-primary-fixed text-primary px-1.5 py-0.5 rounded font-semibold">
                &ldquo;{query || 'all records'}&rdquo;
              </mark>
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-semibold uppercase tracking-wider">
              Fast Search (0.04s)
            </span>
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant/60 rounded px-2 py-1 text-on-surface text-label-sm focus:outline-none"
            >
              <option value="relevance">Relevance (Highest)</option>
              <option value="newest">Date (Newest first)</option>
              <option value="oldest">Date (Oldest first)</option>
              <option value="naac">NAAC Criterion Ref</option>
            </select>
          </div>
        </div>

        {/* Results Card List */}
        <div className="flex flex-col gap-3">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-md hover:border-outline-variant transition-all shadow-sm"
            >
              <div className="flex items-start gap-space-md">
                {/* Type Icon Container */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    rec.type === 'EVENT ARCHIVE'
                      ? 'bg-surface-container text-primary'
                      : rec.type === 'COMMITTEE DOCUMENT'
                      ? 'bg-surface-container-high text-secondary'
                      : rec.type === 'COMMITTEE ROSTER'
                      ? 'bg-tertiary-fixed/40 text-tertiary'
                      : rec.type === 'ACTION TAKEN REPORT'
                      ? 'bg-surface-container text-secondary'
                      : 'bg-surface-container-high text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {rec.type === 'EVENT ARCHIVE'
                      ? 'calendar_today'
                      : rec.type === 'COMMITTEE DOCUMENT'
                      ? 'description'
                      : rec.type === 'COMMITTEE ROSTER'
                      ? 'group'
                      : rec.type === 'ACTION TAKEN REPORT'
                      ? 'assignment_turned_in'
                      : 'source'}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold tracking-wider">
                        {rec.type}
                      </span>
                      <span className="text-outline">•</span>
                      <span className="text-on-surface-variant">{rec.academicYear}</span>
                      <span className="text-outline">•</span>
                      <span className="text-on-surface font-semibold">{rec.committee}</span>
                    </div>

                    {rec.statusTag && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          rec.tagType === 'red'
                            ? 'bg-error-container/40 border-error-container text-on-error-container'
                            : rec.tagType === 'green'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-surface-container text-primary border-outline-variant/30'
                        }`}
                      >
                        {rec.tagType === 'red' && <span className="w-1.5 h-1.5 rounded-full bg-error"></span>}
                        {rec.tagType === 'green' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                        {rec.statusTag}
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => {
                      if (rec.type === 'EVENT ARCHIVE') {
                        const matchedEvt = events.find((e) => e.title.includes('Robotics')) || events[0];
                        onSelectEvent(matchedEvt);
                        onNavigate('event-detail');
                      } else if (rec.type === 'COMMITTEE ROSTER') {
                        onNavigate('roster');
                      } else {
                        showToast(`Opened: ${rec.title}`);
                      }
                    }}
                    className="font-semibold text-headline-sm text-on-surface hover:text-primary cursor-pointer transition-colors"
                  >
                    {rec.title}
                  </h3>

                  <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
                    {highlightText(rec.snippet, query)}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-outline-variant/20 text-on-surface-variant text-[11px]">
                    <div className="flex items-center gap-3">
                      <span>Date: {rec.dateOrUploadDate}</span>
                      {rec.authorOrChair && (
                        <>
                          <span className="text-outline">•</span>
                          <span>By: <strong className="font-semibold text-on-surface">{rec.authorOrChair}</strong></span>
                        </>
                      )}
                      {rec.filesCount && (
                        <>
                          <span className="text-outline">•</span>
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <span className="material-symbols-outlined text-[16px]">attachment</span>
                            <span>{rec.filesCount} Files attached</span>
                          </span>
                        </>
                      )}
                      {rec.size && (
                        <>
                          <span className="text-outline">•</span>
                          <span>Size: {rec.size}</span>
                        </>
                      )}
                      {rec.hash && (
                        <>
                          <span className="text-outline">•</span>
                          <span className="text-tertiary font-mono font-medium">{rec.hash}</span>
                        </>
                      )}
                      <span className="text-outline">•</span>
                      <span>Ref: {rec.refOrId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.type === 'EVENT ARCHIVE' && (
                        <button
                          onClick={() => {
                            const matchedEvt = events.find((e) => e.title.includes('Robotics')) || events[0];
                            onSelectEvent(matchedEvt);
                            onNavigate('event-detail');
                          }}
                          className="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-semibold text-label-sm transition-colors"
                        >
                          View Record Details
                        </button>
                      )}
                      {rec.type === 'COMMITTEE DOCUMENT' && (
                        <button
                          onClick={() => showToast(`Downloaded: ${rec.title}`)}
                          className="h-7 px-3 bg-surface-container hover:bg-surface-container-high text-primary rounded font-semibold text-label-sm flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          <span>Download PDF</span>
                        </button>
                      )}
                      {rec.type === 'COMMITTEE ROSTER' && (
                        <button
                          onClick={() => onNavigate('roster')}
                          className="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-semibold text-label-sm transition-colors"
                        >
                          Inspect Full Roster
                        </button>
                      )}
                      {rec.type === 'ACTION TAKEN REPORT' && (
                        <button
                          onClick={() => showToast(`Opened full ATR Dossier for ${rec.refOrId}`)}
                          className="h-7 px-3 bg-surface-container hover:bg-surface-container-high text-primary rounded font-semibold text-label-sm flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>View Dossier</span>
                        </button>
                      )}
                      {rec.type === 'MINUTES OF MEETING' && (
                        <button
                          onClick={() => showToast(`Displaying ratified MoM: ${rec.refOrId}`)}
                          className="px-2.5 py-1 text-primary hover:bg-surface-container rounded font-semibold text-label-sm transition-colors"
                        >
                          Read Minutes
                        </button>
                      )}
                      <button
                        onClick={() => showToast(`Bookmarked record: ${rec.title}`)}
                        className="p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface"
                        title="Bookmark"
                      >
                        <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Results Pagination Strip */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 px-space-md py-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm shadow-sm">
          <div className="text-on-surface-variant text-body-sm">
            Page <span className="font-semibold text-on-surface">1</span> of <span className="font-semibold text-on-surface">1</span> ({filteredRecords.length} results)
          </div>
          <div className="flex items-center gap-1">
            <button className="h-8 px-2.5 rounded border border-outline-variant/40 bg-surface-container-low text-outline cursor-not-allowed text-label-sm flex items-center gap-1" disabled>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Previous</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-on-primary text-label-sm font-semibold shadow-sm">
              1
            </button>
            <button className="h-8 px-2.5 rounded border border-outline-variant/40 bg-surface-container-low text-outline cursor-not-allowed text-label-sm flex items-center gap-1" disabled>
              <span>Next</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
            <span>Records per page:</span>
            <select className="bg-surface border border-outline-variant/50 rounded px-1.5 py-0.5 text-on-surface text-[11px] focus:outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Query Syntax Modal */}
      {showSyntaxModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-semibold text-headline-sm text-on-surface">Query Syntax Guide</h3>
              <button onClick={() => setShowSyntaxModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="text-body-sm text-on-surface-variant space-y-3">
              <p>The institutional archive search engine supports exact phrase and boolean operators:</p>
              <div className="bg-surface-container-low p-3 rounded-lg font-mono text-[12px] space-y-1.5">
                <div><strong className="text-primary">&quot;hackathon&quot;</strong> : Matches exact string</div>
                <div><strong className="text-primary">NAAC AND Criterion</strong> : Intersects terms</div>
                <div><strong className="text-primary">title:RoboForge</strong> : Restricts query to designated title</div>
                <div><strong className="text-primary">ay:2023-24</strong> : Filters directly by academic session</div>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSyntaxModal(false)}
                className="h-9 px-4 bg-primary text-on-primary rounded-lg font-semibold text-label-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
