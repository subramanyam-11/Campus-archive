'use client';

import React, { useState } from 'react';
import { Committee } from '../types';

interface RegisterCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCommittee: Committee) => void;
}

export const RegisterCommitteeModal: React.FC<RegisterCommitteeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('COM-CSE-11');
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
  const [categoryTag, setCategoryTag] = useState('Technical / CSE Department');
  const [categoryType, setCategoryType] = useState<'iqac' | 'tech' | 'cultural' | 'outreach' | 'admin'>('tech');
  const [facultyName, setFacultyName] = useState('Dr. Amit K. Saxena');
  const [facultyDesignation, setFacultyDesignation] = useState('Associate Professor');
  const [charter, setCharter] = useState('Foster collaborative student development, industry certifications, and technical symposiums.');
  const [membersCount, setMembersCount] = useState('16');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCommittee: Committee = {
      id: code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      code,
      name,
      categoryTag,
      categoryType,
      department,
      status: 'active',
      facultyInCharge: {
        name: facultyName,
        designation: facultyDesignation,
        signatureVerified: true,
        signatureUid: `DSC-${Math.floor(1000 + Math.random() * 9000)}-2024`,
      },
      activeMembersCount: Number(membersCount) || 12,
      lastRevised: 'Rev. Oct 2024',
      charter,
      naacCriterion: 'NAAC Criterion 3.3.2 Linked',
      focusAreas: [
        { title: 'Technical Skill Camps', description: 'Curated bootcamps and certification drives' },
        { title: 'Project Exhibition', description: 'Annual intra-college exhibition and paper presentations' }
      ],
      leadership: [
        { name: 'Student Convener', role: 'Chairperson', prn: '2022BTECS00199', program: 'B.Tech Final Year', initials: 'SC', clearanceVerified: true }
      ],
      metrics: {
        approvedEvents: 0,
        footfall: 0,
        sanctionedBudget: '₹ 1,00,000',
        budgetNumeric: 100000,
        utilizedBudget: '₹ 0',
        utilizedNumeric: 0,
        utilizedPercent: 0,
        grantId: `COM-24-${Math.floor(10 + Math.random() * 90)}`
      },
      documents: []
    };
    onSubmit(newCommittee);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">corporate_fare</span>
            <h3 className="font-semibold text-headline-sm text-on-surface">Register Collegiate Committee</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-label-sm font-medium text-on-surface mb-1">
              Committee / Society Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Artificial Intelligence & Data Science Society"
              className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Registry Code <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="COM-CSE-11"
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Category Scope <span className="text-error">*</span>
              </label>
              <select
                value={categoryType}
                onChange={(e) => {
                  const val = e.target.value as Committee['categoryType'];
                  setCategoryType(val);
                  if (val === 'tech') setCategoryTag('Technical / CSE Department');
                  if (val === 'iqac') setCategoryTag('Statutory Body');
                  if (val === 'outreach') setCategoryTag('Student Affairs / Outreach');
                  if (val === 'cultural') setCategoryTag('Cultural & Arts');
                  if (val === 'admin') setCategoryTag('Administrative');
                }}
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface cursor-pointer"
              >
                <option value="tech">Technical Chapter</option>
                <option value="iqac">Statutory Body</option>
                <option value="outreach">Social Outreach</option>
                <option value="cultural">Cultural &amp; Sports</option>
                <option value="admin">Administrative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-label-sm font-medium text-on-surface mb-1">
              Affiliated Department / Faculty <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Department of Computer Science & Engineering"
              className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Faculty In-Charge Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="Dr. Amit K. Saxena"
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Faculty Designation <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={facultyDesignation}
                onChange={(e) => setFacultyDesignation(e.target.value)}
                placeholder="Associate Professor"
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Member Seats <span className="text-error">*</span>
              </label>
              <input
                type="number"
                required
                value={membersCount}
                onChange={(e) => setMembersCount(e.target.value)}
                placeholder="16"
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-sm font-medium text-on-surface mb-1">
              Charter &amp; Operational Mandate <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={charter}
              onChange={(e) => setCharter(e.target.value)}
              placeholder="Outline statutory mission, alignment with NAAC criteria, and frequency of activities..."
              className="w-full p-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface resize-none"
            />
          </div>

          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-label-md font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-colors text-label-md font-semibold shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Register &amp; Provision Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
