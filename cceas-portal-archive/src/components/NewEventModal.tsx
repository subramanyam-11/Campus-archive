import React, { useState } from 'react';
import { EventItem, Committee } from '../types';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  committees: Committee[];
  onSubmit: (newEvent: Partial<EventItem>) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  committees,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [committeeId, setCommitteeId] = useState(committees[0]?.id || '');
  const [category, setCategory] = useState('National Symposium');
  const [date, setDate] = useState('2024-11-20');
  const [venue, setVenue] = useState('Auditorium A');
  const [budget, setBudget] = useState('85000');
  const [objective, setObjective] = useState('');
  const [targetDelegates, setTargetDelegates] = useState('200');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedComm = committees.find((c) => c.id === committeeId) || committees[0];
    const newEvt: Partial<EventItem> = {
      title,
      committee: selectedComm.name,
      committeeCode: selectedComm.code,
      department: selectedComm.department,
      category,
      categoryType: 'symposium',
      rawDate: date,
      dateStr: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      venue,
      budgetSanctioned: Number(budget) || 50000,
      budgetUtilized: 0,
      status: 'Pending',
      naacCategory: 'NAAC Category 3.3.2',
      objective: objective || 'Technical knowledge dissemination and student project incubation.',
      targetDelegates: `${targetDelegates} Delegates Cap`,
      attendanceTarget: Number(targetDelegates) || 200,
      attendanceValidated: 0,
      attendanceTurnoutPercent: 0,
      surplusReturned: 0,
      convener: selectedComm.facultyInCharge.name,
    };
    onSubmit(newEvt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
            <h3 className="font-semibold text-headline-sm text-on-surface">Initiate New Event Proposal</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-label-sm font-medium text-on-surface mb-1">
              Event Title / Activity Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. National Conference on Quantum & Cloud Computing 2024"
              className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Organizing Body / Committee <span className="text-error">*</span>
              </label>
              <select
                value={committeeId}
                onChange={(e) => setCommitteeId(e.target.value)}
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface cursor-pointer"
              >
                {committees.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Category Type <span className="text-error">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface cursor-pointer"
              >
                <option value="National Symposium">National Symposium</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Value-Added Course">Value-Added Course</option>
                <option value="Community Outreach">Community Outreach</option>
                <option value="Conclave">Conclave &amp; Keynote</option>
                <option value="Social Service">Social Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Event Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Designated Venue <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Auditorium A, Ramanujan Block"
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-on-surface mb-1">
                Sanctioned Budget (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="85000"
                className="w-full h-10 px-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-sm font-medium text-on-surface mb-1">
              Primary Objective &amp; Scope <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe event rationale, expected outcomes, industry partner engagement, and student takeaways..."
              className="w-full p-3 text-body-sm font-body-sm bg-surface rounded-lg border border-outline-variant/60 focus:outline-none focus:border-primary text-on-surface resize-none"
            />
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-start gap-2.5 text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">verified_user</span>
            <span>
              By submitting this proposal, an automated digital ledger stamp is provisioned. The proposal will route sequentially to Faculty Advisor, HOD, and IQAC Directorate.
            </span>
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
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Submit for Executive Clearance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
