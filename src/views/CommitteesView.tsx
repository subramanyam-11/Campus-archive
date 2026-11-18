'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Committee, ViewType } from '../types';
import { useAppContext } from '../components/AppContext';

interface CommitteesViewProps {
  committees: Committee[];
  onSelectCommittee: (c: Committee) => void;
  onNavigate: (view: ViewType) => void;
  onOpenRegisterModal: () => void;
}

export const CommitteesView: React.FC<CommitteesViewProps> = ({
  committees,
  onSelectCommittee,
  onOpenRegisterModal,
}) => {
  const router = useRouter();
  const { getCommitteeRoster } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  // Filter logic
  const filtered = committees.filter((comm) => {
    const textMatch =
      !searchTerm ||
      comm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.facultyInCharge.name.toLowerCase().includes(searchTerm.toLowerCase());

    const deptMatch =
      deptFilter === 'all' ||
      comm.department.toLowerCase().includes(deptFilter.toLowerCase());

    const catMatch =
      categoryFilter === 'all' ||
      comm.categoryType === categoryFilter;

    const statusMatch =
      statusFilter === 'all' ||
      comm.status === statusFilter;

    return textMatch && deptMatch && catMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCommittees = filtered.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  const getActiveCount = (comm: Committee): number => {
    const roster = getCommitteeRoster(comm.id, 'AY 2024–25');
    if (roster && roster.length > 0) {
      return roster.filter((m) => m.status === 'active' || m.status === 'Active').length;
    }
    return comm.activeMembersCount;
  };

  const handleExportIndex = () => {
    const csvContent =
      'Code,Committee Name,Department,Category,Status,Faculty In-Charge,Active Members\n' +
      committees
        .map(
          (c) =>
            `"${c.code}","${c.name}","${c.department}","${c.categoryTag}","${c.status}","${c.facultyInCharge.name}","${getActiveCount(c)}"`
        )
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CCEAS_Committees_Directory_AY24-25.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-4 lg:px-margin-desktop py-space-lg max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-xs border-b border-outline-variant/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-primary font-semibold tracking-wider uppercase bg-primary-fixed px-2 py-0.5 rounded">
              Official Records
            </span>
            <span className="text-[12px] text-on-surface-variant font-medium">AY 2024-2025</span>
          </div>
          <h1 className="font-semibold text-headline-xl text-on-surface tracking-tight">
            Collegiate Committees &amp; Bodies Directory
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Official catalog of standing statutory bodies, student societies, and departmental forums
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <button
            onClick={handleExportIndex}
            className="h-9 px-4 rounded-xl bg-surface-container-lowest text-on-surface font-medium text-label-md flex items-center gap-1.5 shadow-sm border border-outline-variant/50 hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
            <span>Export Index</span>
          </button>
          <button
            onClick={onOpenRegisterModal}
            className="h-9 px-4 rounded-xl bg-primary text-on-primary font-semibold text-label-md flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Register Committee</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Registered
            </span>
            <span className="text-headline-lg text-on-surface font-bold tabular-nums">28</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Active Rosters
            </span>
            <span className="text-headline-lg text-on-surface font-bold tabular-nums">24</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Statutory Bodies
            </span>
            <span className="text-headline-lg text-on-surface font-bold tabular-nums">6</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">gavel</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Faculty Appointees
            </span>
            <span className="text-headline-lg text-on-surface font-bold tabular-nums">42</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
        </div>
      </div>

      {/* Filter & Control Module */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-space-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search committee name, code, or faculty lead..."
              className="w-full h-10 pl-9 pr-4 text-body-sm font-body-sm bg-surface-container-low rounded-lg text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-colors"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-space-sm">
            {/* Department Dropdown */}
            <div className="relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="appearance-none h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-body-sm font-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest cursor-pointer transition-colors"
              >
                <option value="all">Dept: All Faculties</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical">Electronics / Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Governance">Governance / Academic</option>
                <option value="Student Affairs">Student Affairs</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                arrow_drop_down
              </span>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-body-sm font-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest cursor-pointer transition-colors"
              >
                <option value="all">Category: All</option>
                <option value="iqac">Statutory IQAC</option>
                <option value="tech">Technical Chapter</option>
                <option value="cultural">Cultural &amp; Sports</option>
                <option value="outreach">Social Outreach</option>
                <option value="admin">Administrative</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                arrow_drop_down
              </span>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-body-sm font-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest cursor-pointer transition-colors"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                arrow_drop_down
              </span>
            </div>

            {/* Reset Filter Button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setDeptFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors border border-outline-variant/40"
              title="Clear Filters"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Count and Active Chips Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-label-sm text-on-surface">
              Showing {filtered.length} of {committees.length} Committees
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="text-[11px] text-on-surface-variant">Sorted by Registry Code (Ascending)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-outline font-medium">View mode:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                viewMode === 'grid' ? 'bg-surface-container text-primary font-semibold' : 'bg-surface-container-low text-outline'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                viewMode === 'table' ? 'bg-surface-container text-primary font-semibold' : 'bg-surface-container-low text-outline'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {paginatedCommittees.map((comm) => (
            <div
              key={comm.id}
              className={`bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-md flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/40 transition-all ${
                comm.status === 'archived' ? 'opacity-90' : ''
              }`}
            >
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-container text-primary truncate max-w-[200px]">
                    {comm.categoryTag}
                  </span>
                  <div
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      comm.status === 'active'
                        ? 'bg-surface-container-low text-tertiary border border-tertiary/20'
                        : 'bg-surface-container-low text-outline border border-outline-variant/40'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        comm.status === 'active' ? 'bg-tertiary' : 'bg-outline'
                      }`}
                    ></span>
                    <span>{comm.status === 'active' ? 'Active' : 'Archived'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <h2 className="font-semibold text-headline-sm text-on-surface leading-snug">
                    {comm.name}
                  </h2>
                  <span className="text-[11px] text-outline font-mono font-medium">{comm.code}</span>
                </div>

                <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30 flex flex-col gap-2 mt-1">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-outline text-[16px] mt-0.5">person</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] text-on-surface-variant">Faculty In-charge</span>
                      <span className="text-[13px] text-on-surface font-medium truncate">
                        {comm.facultyInCharge.name} ({comm.facultyInCharge.designation})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-outline text-[16px]">group</span>
                      <span className="text-[12px] font-medium">{getActiveCount(comm)} Active Members</span>
                    </div>
                    <span className="text-[11px] text-outline">{comm.lastRevised}</span>
                  </div>
                </div>
              </div>

              <div className="pt-space-md mt-space-md border-t border-outline-variant/30 flex items-center justify-between">
                <button
                  onClick={() => {
                    onSelectCommittee(comm);
                    router.push(`/committees/${comm.id}`);
                  }}
                  className="font-semibold text-label-md text-primary hover:text-primary-container flex items-center gap-1 transition-colors"
                >
                  <span>{comm.status === 'archived' ? 'View Archived Profile' : 'View Profile & Roster'}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => {
                    onSelectCommittee(comm);
                    router.push(`/committees/${comm.id}/roster`);
                  }}
                  className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                  title="Quick View Roster"
                >
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider h-10">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Committee Name</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Faculty In-Charge</th>
                <th className="py-2.5 px-4 text-center">Members</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
              {paginatedCommittees.map((comm) => (
                <tr key={comm.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-[12px] font-semibold text-primary">{comm.code}</td>
                  <td className="py-3 px-4 font-semibold text-on-surface">{comm.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-[13px]">{comm.department}</td>
                  <td className="py-3 px-4 text-on-surface text-[13px]">{comm.facultyInCharge.name}</td>
                  <td className="py-3 px-4 text-center font-medium">{getActiveCount(comm)}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        comm.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${comm.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                      {comm.status === 'active' ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectCommittee(comm);
                        router.push(`/committees/${comm.id}`);
                      }}
                      className="text-primary hover:underline font-semibold text-label-sm inline-flex items-center gap-1"
                    >
                      <span>Profile &amp; Roster</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Institutional Pagination Strip */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-on-surface-variant">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-surface-container-low text-body-sm font-body-sm rounded px-2 py-1 text-on-surface border border-outline-variant/40 focus:outline-none cursor-pointer"
          >
            <option value={9}>9</option>
            <option value={18}>18</option>
            <option value={27}>27</option>
          </select>
          <span className="text-[12px] text-outline font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage <= 1}
            className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low text-outline disabled:opacity-40 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-8 h-8 flex items-center justify-center rounded text-label-md font-semibold transition-colors ${
                safeCurrentPage === pageNum
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low text-on-surface disabled:opacity-40 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
