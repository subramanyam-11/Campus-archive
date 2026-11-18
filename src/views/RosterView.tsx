'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Committee, RosterMember, ViewType } from '../types';
import { useAppContext } from '../components/AppContext';

interface RosterViewProps {
  committee: Committee;
  onNavigate?: (view: ViewType) => void;
}

const NewMemberFormSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  prn: z
    .string()
    .trim()
    .min(6, 'PRN must be at least 6 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'PRN must contain only letters, numbers, hyphens or underscores'),
  email: z.string().trim().email('Valid institutional email is required'),
  department: z.string().trim().min(1, 'Department selection is required'),
  role: z.string().trim().min(1, 'Role designation is required'),
});

function createRosterMemberId(committeeCode: string): string {
  const cleanCode = committeeCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `ros-${cleanCode}-${Date.now()}`;
}

export const RosterView: React.FC<RosterViewProps> = ({ committee }) => {
  const router = useRouter();
  const {
    getCommitteeRoster,
    addCommitteeMember,
    updateCommitteeMember,
    removeCommitteeMember,
  } = useAppContext();

  const [academicYear, setAcademicYear] = useState<string>('AY 2024–25');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RosterMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<RosterMember | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPRN, setFormPRN] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const isReadOnly = academicYear === 'AY 2023–24' || committee.status === 'archived';

  // Get members for this specific committee and academic year
  const rawMembers = getCommitteeRoster(committee.id, academicYear);

  const filteredMembers = rawMembers.filter((m) => {
    const textMatch =
      !searchTerm ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase());

    const deptMatch = deptFilter === 'all' || m.department === deptFilter;
    const roleMatch = roleFilter === 'all' || m.role === roleFilter;
    const statusMatch =
      statusFilter === 'all' ||
      m.status.toLowerCase() === statusFilter.toLowerCase();

    return textMatch && deptMatch && roleMatch && statusMatch;
  });

  const handleOpenAddModal = () => {
    if (isReadOnly) return;
    setEditingMember(null);
    setFormName('');
    setFormPRN('2023BTECS00' + Math.floor(100 + Math.random() * 900));
    setFormEmail('');
    setFormDept(committee.department || 'Computer Engineering');
    setFormRole('Junior Executive');
    setFormErrors({});
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
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const parseResult = NewMemberFormSchema.safeParse({
      name: formName,
      prn: formPRN,
      email: formEmail,
      department: formDept,
      role: formRole,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setFormErrors(fieldErrors);
      return;
    }

    // Duplicate check within this committee's current academic year roster
    const normalizedPrn = formPRN.trim().toLowerCase();
    const normalizedEmail = formEmail.trim().toLowerCase();

    const duplicatePrn = rawMembers.find(
      (m) =>
        m.prn.trim().toLowerCase() === normalizedPrn &&
        (!editingMember || m.id !== editingMember.id)
    );
    if (duplicatePrn) {
      setFormErrors({
        prn: `PRN '${formPRN}' is already registered to ${duplicatePrn.name} in this committee.`,
      });
      return;
    }

    const duplicateEmail = rawMembers.find(
      (m) =>
        m.email.trim().toLowerCase() === normalizedEmail &&
        (!editingMember || m.id !== editingMember.id)
    );
    if (duplicateEmail) {
      setFormErrors({
        email: `Email '${formEmail}' is already registered in this committee roster.`,
      });
      return;
    }

    if (editingMember) {
      updateCommitteeMember(committee.id, editingMember.id, {
        name: formName.trim(),
        prn: formPRN.trim().toUpperCase(),
        email: formEmail.trim().toLowerCase(),
        department: formDept,
        role: formRole,
        designation: formRole,
      });
      showToast(`Updated appointment credentials for ${formName.trim()}.`);
    } else {
      const initials = formName
        .trim()
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const newM: RosterMember = {
        id: createRosterMemberId(committee.code),
        committeeId: committee.id,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        prn: formPRN.trim().toUpperCase(),
        department: formDept,
        role: formRole,
        designation: formRole,
        tenureStart: '2024-07-01',
        tenureEnd: '2025-06-30',
        academicYear,
        status: 'active',
        tenure: 'Jul 2024 – Jun 2025',
        initials: initials || 'ST',
      };

      addCommitteeMember(committee.id, newM);
      showToast(`Registered ${formName.trim()} to ${committee.name} roster.`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove || isReadOnly) return;
    removeCommitteeMember(committee.id, memberToRemove.id);
    showToast(`Relieved ${memberToRemove.name} from ${committee.name} tenure.`);
    setMemberToRemove(null);
  };

  const handleResendInvite = (m: RosterMember) => {
    showToast(`Verification invitation re-dispatched to ${m.name} (${m.email})`);
  };

  const handleExportCSV = () => {
    const csvHeader = 'Name,PRN,Email,Department,Designation,Role,Tenure,Academic Year,Status\n';
    const csvRows = rawMembers
      .map(
        (m) =>
          `"${m.name}","${m.prn}","${m.email}","${m.department}","${m.designation || m.role}","${m.role}","${m.tenure || 'Jul 2024 – Jun 2025'}","${m.academicYear}","${m.status}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanYear = academicYear.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Committee_Roster_${committee.code}_${cleanYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${committee.code} roster for ${academicYear}.`);
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
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Roster Container */}
      <div className="p-4 lg:p-gutter-desktop space-y-space-md max-w-[1400px] mx-auto w-full">
        {/* Context Bar / Back to Committee Profile Link */}
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
          <button
            onClick={() => router.push(`/committees/${committee.id}`)}
            className="inline-flex items-center gap-1.5 text-label-md font-semibold text-primary hover:text-primary-container transition-colors group"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to {committee.name} Profile</span>
          </button>

          {/* Academic Tenure Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">
              Tenure Year:
            </span>
            <div className="relative inline-block">
              <select
                value={academicYear}
                onChange={(e) => {
                  const val = e.target.value;
                  setAcademicYear(val);
                  if (val === 'AY 2023–24') {
                    showToast('Switched to AY 2023–24 Archived Snapshot (Read-Only Mode)');
                  } else {
                    showToast('Switched to AY 2024–25 Active Roster (Editable)');
                  }
                }}
                className="h-8 pl-space-sm pr-7 text-label-sm bg-surface-container-low text-on-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
              >
                <option value="AY 2024–25">AY 2024–25 (Current Active)</option>
                <option value="AY 2023–24">AY 2023–24 (Archived Snapshot)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Header Section with Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md pb-space-xs border-b border-outline-variant/30">
          <div className="space-y-0.5">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="text-primary font-mono font-bold text-headline-sm">
                [{committee.code}]
              </span>
              <h1 className="font-semibold text-headline-lg text-on-surface tracking-tight">
                {committee.name} — Roster
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isReadOnly
                    ? 'bg-outline-variant/30 text-outline'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {isReadOnly ? 'Archived Snapshot (Read-Only)' : 'Active Governance'}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Department: {committee.department} • Faculty In-charge: {committee.facultyInCharge.name}
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
              title={isReadOnly ? 'Historical rosters and archived committees are locked for compliance.' : 'Add new member to committee roster'}
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

        {/* Status Notice Banner */}
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
                  ? `${academicYear} Archived Snapshot (Read-Only Mode)`
                  : `Viewing ${academicYear} Active Roster for ${committee.name}.`}
              </span>
              <p className="text-body-sm text-on-surface-variant">
                {isReadOnly
                  ? 'Records from previous academic tenures are sealed for institutional audit. Modifications and member additions are locked.'
                  : 'Official signatories, administrative privilege delegation, and student office bearers are actively indexed.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-outline">
                Registry Sync ID:{' '}
                <span className="font-mono text-on-surface font-semibold">
                  {committee.code}-{academicYear.replace(/[^0-9]/g, '')}-v2
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/40 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${committee.name} members by name, PRN, email, or role...`}
              className="w-full h-9 pl-9 pr-4 text-body-sm bg-surface rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/50 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/50 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="Chairperson">Chairperson</option>
              <option value="Vice-Chairperson">Vice-Chairperson</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Events Coordinator">Events Coordinator</option>
              <option value="Member">Member</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-body-sm bg-surface rounded-lg border border-outline-variant/50 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
            </select>

            {(searchTerm || deptFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="h-9 px-3 text-label-sm text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Member Count Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-label-sm font-semibold text-on-surface">
            Showing {filteredMembers.length} of {rawMembers.length} Appointed Members
          </span>
          <span className="text-[11px] text-outline">
            Term: {academicYear}
          </span>
        </div>

        {/* Members Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider h-11">
                  <th className="py-2.5 px-4">Member Name &amp; Contact</th>
                  <th className="py-2.5 px-4">PRN / Roll No</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Role / Designation</th>
                  <th className="py-2.5 px-4">Tenure Period</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-outline">
                          group_off
                        </span>
                        <p className="font-semibold text-body-md">No roster members found</p>
                        <p className="text-[12px] text-outline">
                          {searchTerm || deptFilter !== 'all' || roleFilter !== 'all'
                            ? 'Try clearing the search query or active filters.'
                            : `No members enrolled for ${academicYear}. Click "Add Member" above.`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-container-low/50 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-label-sm flex items-center justify-center shrink-0">
                            {member.initials || member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-on-surface truncate">
                              {member.name}
                            </span>
                            <span className="text-[11px] text-on-surface-variant truncate font-mono">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px] font-semibold text-primary">
                        {member.prn}
                      </td>
                      <td className="py-3 px-4 text-[13px] text-on-surface-variant">
                        {member.department}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-outline font-medium">
                        {member.tenure || 'Jul 2024 – Jun 2025'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            member.status.toLowerCase() === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.status.toLowerCase() === 'active'
                                ? 'bg-emerald-600'
                                : 'bg-amber-500'
                            }`}
                          ></span>
                          <span className="capitalize">{member.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleResendInvite(member)}
                            className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center text-outline hover:text-primary transition-colors"
                            title="Resend Verification Dispatch"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            disabled={isReadOnly}
                            className={`w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center text-outline hover:text-primary transition-colors ${
                              isReadOnly ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Edit Credentials"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => setMemberToRemove(member)}
                            disabled={isReadOnly}
                            className={`w-7 h-7 rounded hover:bg-error-container/30 flex items-center justify-center text-outline hover:text-error transition-colors ${
                              isReadOnly ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Relieve Member"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full border border-outline-variant/40 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-space-lg border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-headline-sm text-on-surface">
                  {editingMember ? 'Edit Appointee Credentials' : `Register New Appointee`}
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  {committee.name} ({committee.code}) • {academicYear}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-space-lg space-y-4">
              <div>
                <label className="block text-label-sm font-medium text-on-surface mb-1">
                  Full Student / Faculty Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Siddharth Verma"
                  className={`w-full h-9 px-3 text-body-sm bg-surface rounded-lg border text-on-surface focus:outline-none focus:border-primary ${
                    formErrors.name ? 'border-error' : 'border-outline-variant/60'
                  }`}
                />
                {formErrors.name && (
                  <span className="text-[11px] text-error mt-0.5 block">{formErrors.name}</span>
                )}
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
                    className={`w-full h-9 px-3 text-body-sm bg-surface rounded-lg border text-on-surface uppercase font-mono text-[13px] focus:outline-none focus:border-primary ${
                      formErrors.prn ? 'border-error' : 'border-outline-variant/60'
                    }`}
                  />
                  {formErrors.prn && (
                    <span className="text-[11px] text-error mt-0.5 block">{formErrors.prn}</span>
                  )}
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
                    className={`w-full h-9 px-3 text-body-sm bg-surface rounded-lg border text-on-surface focus:outline-none focus:border-primary ${
                      formErrors.email ? 'border-error' : 'border-outline-variant/60'
                    }`}
                  />
                  {formErrors.email && (
                    <span className="text-[11px] text-error mt-0.5 block">{formErrors.email}</span>
                  )}
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
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Governance & Administration">Governance & Administration</option>
                  </select>
                  {formErrors.department && (
                    <span className="text-[11px] text-error mt-0.5 block">{formErrors.department}</span>
                  )}
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
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Technical Lead">Technical Lead</option>
                    <option value="Events Coordinator">Events Coordinator</option>
                    <option value="Documentation Deputy">Documentation Deputy</option>
                    <option value="Logistics Lead">Logistics Lead</option>
                    <option value="Junior Executive">Junior Executive</option>
                    <option value="Member">Member</option>
                  </select>
                  {formErrors.role && (
                    <span className="text-[11px] text-error mt-0.5 block">{formErrors.role}</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30 text-[11px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                <span>An institutional notification will be dispatched immediately to confirm role appointment.</span>
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
                  {editingMember ? 'Save Changes' : 'Confirm & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {memberToRemove && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant/40 shadow-xl p-space-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-headline-sm text-on-surface">
                  Relieve Appointee?
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Are you sure you wish to relieve <strong className="text-on-surface">{memberToRemove.name}</strong> ({memberToRemove.prn}) from their tenure as <strong className="text-on-surface">{memberToRemove.role}</strong> in {committee.name}?
                </p>
              </div>
            </div>

            <div className="pt-space-md mt-space-md border-t border-outline-variant/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="h-9 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-label-md font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="h-9 px-4 rounded-lg bg-error text-on-error hover:bg-error/90 transition-colors text-label-md font-semibold shadow-sm"
              >
                Relieve Appointee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
