import React, { useState } from 'react';
import { RosterMember, ViewType } from '../types';
import { INITIAL_ROSTER } from '../data/mockData';

interface RosterViewProps {
  onNavigate: (view: ViewType) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({ onNavigate }) => {
  const [members, setMembers] = useState<RosterMember[]>(INITIAL_ROSTER);
  const [sessionScope, setSessionScope] = useState<'current' | 'archived'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RosterMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formPRN, setFormPRN] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formRole, setFormRole] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const isReadOnly = sessionScope === 'archived';

  const filteredMembers = members.filter((m) => {
    const textMatch =
      !searchTerm ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    const deptMatch = deptFilter === 'all' || m.department === deptFilter;
    const roleMatch = roleFilter === 'all' || m.role === roleFilter;
    const statusMatch = statusFilter === 'all' || m.status === statusFilter;

    return textMatch && deptMatch && roleMatch && statusMatch;
  });

  const handleOpenAddModal = () => {
    if (isReadOnly) return;
    setEditingMember(null);
    setFormName('');
    setFormPRN('2023BTECS00' + Math.floor(100 + Math.random() * 900));
    setFormEmail('');
    setFormDept('Computer Engineering');
    setFormRole('Junior Executive');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: RosterMember) => {
    if (isReadOnly) return;
    setEditingMember(m);
    setFormName(m.name);
    setFormPRN(m.prn);
    setFormEmail(m.email);
    setFormDept(m.department);
    setFormRole(m.role);
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setMembers((prev) =>
        prev.map((item) =>
          item.id === editingMember.id
            ? {
                ...item,
                name: formName,
                prn: formPRN,
                email: formEmail,
                department: formDept,
                role: formRole,
              }
            : item
        )
      );
      showToast(`Updated appointment credentials for ${formName}.`);
    } else {
      const initials = formName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const newM: RosterMember = {
        id: `ros-${Date.now()}`,
        name: formName,
        email: formEmail,
        prn: formPRN,
        department: formDept,
        role: formRole,
        tenure: 'Jul 2024 – Jun 2025',
        status: 'Active',
        initials: initials || 'ST',
      };
      setMembers((prev) => [...prev, newM]);
      showToast(`Registered ${formName} to committee tenure.`);
    }
    setIsModalOpen(false);
  };

  const handleRemoveMember = (m: RosterMember) => {
    if (isReadOnly) return;
    if (window.confirm(`Are you sure you wish to relieve ${m.name} from this committee tenure?`)) {
      setMembers((prev) => prev.filter((item) => item.id !== m.id));
      showToast(`Relieved ${m.name} from committee tenure.`);
    }
  };

  const handleResendInvite = (m: RosterMember) => {
    showToast(`Verification invitation re-dispatched to ${m.name} (${m.email})`);
  };

  const handleExportCSV = () => {
    const csv =
      'Name,PRN,Email,Department,Role,Tenure,Status\n' +
      members
        .map((m) => `"${m.name}","${m.prn}","${m.email}","${m.department}","${m.role}","${m.tenure}","${m.status}"`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Committee_Roster_${sessionScope}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported committee roster CSV.');
  };

  const handleRollover = () => {
    if (isReadOnly) return;
    if (
      window.confirm(
        'Initiate Annual Rollover process to AY 2025–26? This prepares tenure transitions and marks graduating office bearers.'
      )
    ) {
      showToast('Tenure rollover initiated. Draft snapshot created for AY 2025–26.');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDeptFilter('all');
    setRoleFilter('all');
    setStatusFilter('all');
    showToast('Filters cleared.');
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

      {/* Interactive Navigation & Context Bar */}
      <div className="px-4 lg:px-gutter-desktop py-space-sm bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm">
          <button onClick={() => onNavigate('committees')} className="hover:text-primary transition-colors">
            Committees
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <button onClick={() => onNavigate('committee-detail')} className="hover:text-primary transition-colors">
            ACM Student Chapter
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-primary font-semibold">Roster Management</span>
        </div>

        {/* Quick Academic Tenure Switcher */}
        <div className="flex items-center gap-space-sm">
          <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">Session Scope:</span>
          <div className="relative inline-block">
            <select
              value={sessionScope}
              onChange={(e) => {
                const val = e.target.value as any;
                setSessionScope(val);
                if (val === 'archived') {
                  showToast('Switched to AY 2023–24 Archived Snapshot (Read-Only Mode)');
                } else {
                  showToast('Switched to AY 2024–25 Active Roster (Editable)');
                }
              }}
              className="h-8 pl-space-sm pr-7 text-label-sm bg-surface-container-low text-on-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
            >
              <option value="current">AY 2024–25 (Current Roster - Editable)</option>
              <option value="archived">AY 2023–24 (Archived Snapshot - Read Only)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-gutter-desktop space-y-space-md max-w-[1400px] mx-auto w-full">
        {/* Header Section with Direct Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md pb-space-xs border-b border-outline-variant/30">
          <div className="space-y-0.5">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-semibold text-headline-lg text-on-surface tracking-tight">
                Committee Roster &amp; Office Bearers
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isReadOnly
                    ? 'bg-outline-variant/30 text-outline'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {isReadOnly ? 'Archived Snapshot' : 'Active Governance'}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Tenure management, student PRN registry, and role designations for statutory compliance
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              onClick={handleExportCSV}
              className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface text-label-md font-medium border border-outline-variant/60 hover:bg-surface-container-low hover:border-outline transition-colors flex items-center gap-1.5 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              disabled={isReadOnly}
              className={`h-9 px-4 rounded-lg text-on-primary text-label-md font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
                isReadOnly
                  ? 'bg-primary/40 cursor-not-allowed opacity-50'
                  : 'bg-primary hover:bg-primary-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Prominent Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-space-sm transition-all duration-200 shadow-sm ${
            isReadOnly
              ? 'bg-[#FEF3C7]/40 border-[#FDE68A]'
              : 'bg-surface-container-low border-outline-variant/40'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[20px] mt-0.5 ${
              isReadOnly ? 'text-[#92400E]' : 'text-primary'
            }`}
          >
            {isReadOnly ? 'lock_clock' : 'verified_user'}
          </span>
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span
                className={`text-label-md font-semibold ${
                  isReadOnly ? 'text-[#92400E]' : 'text-on-surface'
                }`}
              >
                {isReadOnly
                  ? 'AY 2023–24 Archived Snapshot (Read-Only Mode)'
                  : 'Viewing AY 2024–25 Active Roster.'}
              </span>
              <p className="text-body-sm text-on-surface-variant">
                {isReadOnly
                  ? 'Records from previous academic tenures are sealed for institutional audit. Modifications and rollover are locked.'
                  : 'Role permissions, administrative privilege delegation, and official event submission rights are active.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-outline">
                Registry Sync ID: <span className="font-mono text-on-surface font-semibold">ACM-2024-REG-v4</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Control Bar */}
        <div className="bg-surface-container-lowest p-space-sm rounded-xl border border-outline-variant/40 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-space-sm">
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member by name, roll number (PRN), or email..."
              className="w-full h-9 pl-9 pr-3 text-body-sm bg-surface rounded-lg border border-outline-variant/50 placeholder:text-outline text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary cursor-pointer min-w-[170px]"
            >
              <option value="all">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="IT &amp; Software">IT &amp; Software</option>
              <option value="Electronics &amp; Telecom">Electronics &amp; Telecom</option>
              <option value="Mechanical Engg">Mechanical Engg</option>
              <option value="Applied Sciences">Applied Sciences</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary cursor-pointer min-w-[190px]"
            >
              <option value="all">All Roles (Executive, Core, Leads)</option>
              <option value="Chairperson">Chairperson</option>
              <option value="Vice-Chairperson">Vice-Chairperson</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Events Coordinator">Events Coordinator</option>
              <option value="Documentation Deputy">Documentation Deputy</option>
              <option value="Logistics Lead">Logistics Lead</option>
              <option value="Junior Executive">Junior Executive</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary cursor-pointer min-w-[130px]"
            >
              <option value="all">Status (All)</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-outline-variant/50 hover:bg-surface-container-low text-on-surface-variant transition-colors"
              title="Reset Filters"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Members Table Section */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase h-10 select-none">
                  <th className="py-2.5 px-4 text-label-sm">Office Bearer</th>
                  <th className="py-2.5 px-4 text-label-sm">Roll Number (PRN)</th>
                  <th className="py-2.5 px-4 text-label-sm">Department</th>
                  <th className="py-2.5 px-4 text-label-sm">Designation / Role</th>
                  <th className="py-2.5 px-4 text-label-sm">Tenure Period</th>
                  <th className="py-2.5 px-4 text-label-sm">Status</th>
                  <th className="py-2.5 px-4 text-label-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-label-md font-semibold ring-1 ring-primary/20">
                          {m.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-label-md text-on-surface">{m.name}</span>
                          <span className="text-[11px] text-on-surface-variant font-mono">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[13px] text-on-surface font-medium">{m.prn}</td>
                    <td className="py-3 px-4 text-on-surface">{m.department}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm bg-surface-container text-on-surface font-semibold border border-outline-variant/30">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-[13px]">{m.tenure}</td>
                    <td className="py-3 px-4">
                      {m.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#03543F]"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#92400E]"></span>
                          Invited
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isReadOnly ? (
                        <span className="text-[11px] text-outline italic">Archived</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {m.status === 'Invited' && (
                            <>
                              <button
                                onClick={() => handleResendInvite(m)}
                                className="px-2 py-0.5 text-label-sm rounded text-secondary hover:bg-secondary/10 transition-colors font-medium"
                              >
                                Resend Invite
                              </button>
                              <span className="text-outline-variant">|</span>
                            </>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="px-2 py-0.5 text-label-sm rounded text-primary hover:bg-primary/5 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <span className="text-outline-variant">|</span>
                          <button
                            onClick={() => handleRemoveMember(m)}
                            className="px-2 py-0.5 text-label-sm rounded text-error hover:bg-error-container/20 transition-colors font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary & Governance Actions */}
          <div className="p-space-sm px-4 bg-surface-container-low border-t border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[16px]">info</span>
              <span className="text-body-sm text-on-surface-variant">
                Showing {filteredMembers.length} of 18 appointed members • 16 Active, 2 Invited
              </span>
            </div>

            <div className="flex items-center gap-space-sm">
              <button
                disabled={isReadOnly}
                onClick={handleRollover}
                className={`h-8 px-3 rounded text-label-sm bg-surface-container-lowest text-primary border border-outline-variant/60 hover:bg-surface-container transition-colors flex items-center gap-1.5 font-semibold ${
                  isReadOnly ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                <span>Annual Rollover to AY 2025–26</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                <h3 className="font-semibold text-headline-sm text-on-surface">
                  {editingMember ? `Edit: ${editingMember.name}` : 'Add Committee Member'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              <div>
                <label className="block text-label-sm font-medium text-on-surface mb-1">
                  Full Student Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Siddharth Verma"
                  className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm font-medium text-on-surface mb-1">
                    Roll Number / PRN <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPRN}
                    onChange={(e) => setFormPRN(e.target.value)}
                    placeholder="2023BTECS00122"
                    className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface uppercase font-mono text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-medium text-on-surface mb-1">
                    Institutional Email <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="student@institution.ac.in"
                    className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm font-medium text-on-surface mb-1">
                    Department <span className="text-error">*</span>
                  </label>
                  <select
                    required
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="IT &amp; Software">IT &amp; Software</option>
                    <option value="Electronics &amp; Telecom">Electronics &amp; Telecom</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                    <option value="Applied Sciences">Applied Sciences</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm font-medium text-on-surface mb-1">
                    Designation / Role <span className="text-error">*</span>
                  </label>
                  <select
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface cursor-pointer"
                  >
                    <option value="">Select Role</option>
                    <option value="Chairperson">Chairperson</option>
                    <option value="Vice-Chairperson">Vice-Chairperson</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Technical Lead">Technical Lead</option>
                    <option value="Events Coordinator">Events Coordinator</option>
                    <option value="Documentation Deputy">Documentation Deputy</option>
                    <option value="Logistics Lead">Logistics Lead</option>
                    <option value="Junior Executive">Junior Executive</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30 text-[11px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                <span>An institutional invite verification will be dispatched immediately to confirm role appointment.</span>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-label-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-colors text-label-md font-semibold shadow-sm"
                >
                  Confirm &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
