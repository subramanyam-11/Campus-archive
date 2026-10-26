'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/src/components/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { saveEvent, logAuditEntry, createNotification } from '@/lib/firebase/firestore';
import type { EventItem, EventCategoryType, NaacCategory } from '@/src/types';
import Link from 'next/link';

interface EventFormData {
  title: string;
  category: string;
  categoryType: EventCategoryType;
  committee: string;
  committeeCode: string;
  department: string;
  naacCategory: NaacCategory;
  objective: string;
  dateStr: string;
  rawDate: string;
  timeStr: string;
  venue: string;
  capacity: number;
  budgetSanctioned: number;
  resourcePersons: string;
  registrationDeadline: string;
  certificatesEnabled: boolean;
}

const INITIAL_FORM: EventFormData = {
  title: '',
  category: 'National Symposium',
  categoryType: 'symposium',
  committee: 'ACM Student Chapter',
  committeeCode: 'COM-CSE-09',
  department: 'Department of Computer Science & Engineering',
  naacCategory: 'NAAC Category 3.3.2',
  objective: '',
  dateStr: '',
  rawDate: '',
  timeStr: '09:30 AM – 04:30 PM',
  venue: 'Main Seminar Hall 1',
  capacity: 120,
  budgetSanctioned: 45000,
  resourcePersons: '',
  registrationDeadline: '',
  certificatesEnabled: true,
};

const VENUE_OPTIONS = [
  'Main Seminar Hall 1',
  'Auditorium A (Ground Floor)',
  'ECE Digital Classroom B2',
  'Mechanical CAD/CAM Lab',
  'Central Computing Center',
  'Campus Amphitheatre',
];

const NAAC_OPTIONS: NaacCategory[] = [
  'NAAC Category 3.3.2',
  'NAAC Category 5.1.3',
  'NAAC Category 1.1.3',
  'NAAC Category 7.1.1',
  'NAAC Category 2.3.1',
];

export default function CreateEventWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { events, committees, setEvents } = useAppContext();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<EventFormData>(() => {
    if (editId) {
      const existing = events.find((e) => e.id === editId);
      if (existing) {
        return {
          title: existing.title,
          category: existing.category,
          categoryType: existing.categoryType,
          committee: existing.committee,
          committeeCode: existing.committeeCode,
          department: existing.department,
          naacCategory: existing.naacCategory,
          objective: existing.objective,
          dateStr: existing.dateStr,
          rawDate: existing.rawDate,
          timeStr: '10:00 AM – 04:00 PM',
          venue: existing.venue,
          capacity: existing.attendanceTarget || 120,
          budgetSanctioned: existing.budgetSanctioned,
          resourcePersons: '',
          registrationDeadline: existing.rawDate,
          certificatesEnabled: existing.certificatesIssued ?? true,
        };
      }
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cceas_event_draft');
        if (saved) {
          return { ...INITIAL_FORM, ...JSON.parse(saved) };
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_FORM;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autosaveTime, setAutosaveTime] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autosave to localStorage on change
  useEffect(() => {
    if (!editId && formData.title.trim()) {
      const handler = setTimeout(() => {
        try {
          localStorage.setItem('cceas_event_draft', JSON.stringify(formData));
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setAutosaveTime(`Draft autosaved at ${time}`);
        } catch {
          // ignore
        }
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [formData, editId]);

  const handleChange = (field: keyof EventFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.title.trim()) errs.title = 'Event title is required';
      if (!formData.objective.trim()) errs.objective = 'Program objective / summary is required';
    } else if (currentStep === 2) {
      if (!formData.rawDate) errs.rawDate = 'Event date is required';
      if (!formData.venue) errs.venue = 'Venue selection is required';
      if (formData.capacity <= 0) errs.capacity = 'Capacity must be greater than 0';
    } else if (currentStep === 3) {
      if (formData.budgetSanctioned < 0) errs.budgetSanctioned = 'Budget cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    const codeNum = Math.floor(8900 + Math.random() * 99);
    const eventId = editId || `evt-${Date.now()}`;
    const formattedDate = formData.rawDate
      ? new Date(formData.rawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : formData.dateStr || 'TBD';

    const newEvent: EventItem = {
      id: eventId,
      code: `EV-${codeNum}`,
      refNo: `CCEAS/ENGG/2024/${codeNum}-R`,
      title: formData.title,
      committee: formData.committee,
      committeeCode: formData.committeeCode,
      department: formData.department,
      convener: profile?.displayName || 'Committee Lead',
      category: formData.category,
      categoryType: formData.categoryType,
      dateStr: formattedDate,
      rawDate: formData.rawDate || new Date().toISOString().split('T')[0],
      venue: formData.venue,
      budgetSanctioned: Number(formData.budgetSanctioned) || 0,
      budgetUtilized: 0,
      utilizationNote: isDraft ? 'Draft Proposal' : 'Awaiting Faculty Convener Clearance',
      status: isDraft ? 'Draft' : 'Pending',
      naacCategory: formData.naacCategory,
      objective: formData.objective,
      targetDelegates: `${formData.capacity} Seats`,
      attendanceValidated: 0,
      attendanceTarget: Number(formData.capacity) || 100,
      attendanceTurnoutPercent: 0,
      surplusReturned: 0,
      certificatesIssued: formData.certificatesEnabled,
      timeline: [
        {
          step: isDraft ? 'Draft Saved' : '1. Proposal Submission',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          actor: profile?.displayName || 'Committee Head',
          remarks: isDraft ? 'Event saved in draft workspace.' : 'Proposal submitted for academic sanction and venue clearance.',
          cleared: true,
        },
      ],
      outcomesAtr: [],
      photos: [],
    };

    try {
      // 1. Save to Firestore
      await saveEvent(newEvent);

      // 2. Log in Audit Trail
      if (user) {
        await logAuditEntry({
          actorUid: user.uid,
          actorName: profile?.displayName || user.email || 'Committee Head',
          actorRole: profile?.role || 'head',
          action: editId ? 'UPDATE_EVENT' : isDraft ? 'SAVE_DRAFT_EVENT' : 'SUBMIT_EVENT_PROPOSAL',
          targetType: 'event',
          targetId: eventId,
          details: {
            title: newEvent.title,
            status: newEvent.status,
            budget: newEvent.budgetSanctioned,
          },
        });
      }

      // 3. Dispatch Notification to Faculty Conveners
      if (!isDraft) {
        await createNotification({
          userId: 'faculty_convener',
          title: 'New Event Approval Request',
          message: `${newEvent.committee} submitted "${newEvent.title}" for venue clearance and budget sanction.`,
          type: 'approval',
          read: false,
          link: `/faculty/inbox/${newEvent.id}`,
        });
      }

      // 4. Update App Context
      setEvents((prev) => {
        const filtered = prev.filter((e) => e.id !== eventId);
        return [newEvent, ...filtered];
      });

      // Clear draft localStorage
      try {
        localStorage.removeItem('cceas_event_draft');
      } catch {
        // ignore
      }

      router.push('/head');
    } catch (err) {
      console.error('Failed to submit event:', err);
      // Fallback update in state anyway
      setEvents((prev) => [newEvent, ...prev.filter((e) => e.id !== eventId)]);
      router.push('/head');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Breadcrumb & Autosave indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/head" className="hover:text-indigo-400 transition-colors">
              Head Portal
            </Link>
            <span>/</span>
            <span className="text-slate-200">Event Creation Wizard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {editId ? 'Edit Event Proposal' : 'Statutory Event Initiation Wizard'}
          </h1>
        </div>

        {autosaveTime && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/60 text-[11px] text-slate-400 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{autosaveTime}</span>
          </div>
        )}
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        {[
          { num: 1, title: 'Details', desc: 'Title & Objective' },
          { num: 2, title: 'Schedule', desc: 'Date & Venue' },
          { num: 3, title: 'Budget', desc: 'Finance & Resources' },
          { num: 4, title: 'Review', desc: 'Verify & Submit' },
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (isDone || validateStep(step)) setStep(s.num);
              }}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 p-2 sm:p-2.5 rounded-xl transition-all text-left ${
                isActive
                  ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                  : isDone
                  ? 'text-slate-300 hover:bg-slate-800/50'
                  : 'text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <span className="material-symbols-outlined text-[14px]">check</span> : s.num}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold leading-tight">{s.title}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{s.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Wizard Step 1: Basic Details */}
      {step === 1 && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">info</span>
              Step 1: Event Identity &amp; NAAC Classification
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify the overarching academic objective and organizational classification for accreditation.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. National Symposium on Quantum Computing &amp; Neuromorphic Systems"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                }`}
              />
              {errors.title && <p className="text-[11px] text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Organizing Committee
                </label>
                <select
                  value={formData.committee}
                  onChange={(e) => {
                    const sel = committees.find((c) => c.name === e.target.value);
                    handleChange('committee', e.target.value);
                    if (sel) {
                      handleChange('committeeCode', sel.code);
                      handleChange('department', sel.department);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {committees.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Type
                </label>
                <select
                  value={formData.categoryType}
                  onChange={(e) => {
                    const val = e.target.value as EventCategoryType;
                    handleChange('categoryType', val);
                    const labelMap: Partial<Record<EventCategoryType, string>> = {
                      symposium: 'National Symposium',
                      workshop: 'Technical Workshop',
                      conference: 'Annual Conference',
                      competition: 'Hackathon & Challenge',
                      cultural: 'Cultural Fest',
                      hackathon: 'Hackathon',
                      outreach: 'Outreach Initiative',
                      course: 'Certification Course',
                      conclave: 'Leadership Conclave',
                      social: 'Social Activity',
                    };
                    handleChange('category', labelMap[val] || val);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="symposium">Symposium / Colloquium</option>
                  <option value="workshop">Skill Workshop / Hands-on</option>
                  <option value="conference">National Conference</option>
                  <option value="competition">Hackathon / Technical Competition</option>
                  <option value="cultural">Cultural Festival</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NAAC Criterion Accreditation Tag
              </label>
              <select
                value={formData.naacCategory}
                onChange={(e) => handleChange('naacCategory', e.target.value as NaacCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {NAAC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Mapped to IQAC institutional criteria for NBA/NAAC audit dossiers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Objective &amp; Learning Outcomes <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.objective}
                onChange={(e) => handleChange('objective', e.target.value)}
                placeholder="State the expected technical competencies, targeted student groups, and program deliverables..."
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.objective ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                }`}
              />
              {errors.objective && <p className="text-[11px] text-red-400 mt-1">{errors.objective}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Wizard Step 2: Schedule & Venue */}
      {step === 2 && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">calendar_month</span>
              Step 2: Logistics, Venue &amp; Delegate Capacity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Confirm venue allocation and seat quotas to enable automatic conflict checking and QR passes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Proposed Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.rawDate}
                  onChange={(e) => handleChange('rawDate', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.rawDate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                  }`}
                />
                {errors.rawDate && <p className="text-[11px] text-red-400 mt-1">{errors.rawDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Time Slot Duration
                </label>
                <input
                  type="text"
                  value={formData.timeStr}
                  onChange={(e) => handleChange('timeStr', e.target.value)}
                  placeholder="e.g. 09:30 AM – 04:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Campus Venue Allocation <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.venue ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                }`}
              >
                {VENUE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {errors.venue && <p className="text-[11px] text-red-400 mt-1">{errors.venue}</p>}
              <div className="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Automatic venue clash detection will be validated during faculty convener review.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Delegate Capacity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value, 10) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.capacity ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                  }`}
                />
                {errors.capacity && <p className="text-[11px] text-red-400 mt-1">{errors.capacity}</p>}
                <p className="text-[10px] text-slate-500 mt-1">
                  Determines student waitlisting when seating reaches quota.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registration Cutoff Date
                </label>
                <input
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Step 3: Budget & Resource Persons */}
      {step === 3 && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">payments</span>
              Step 3: Budget Breakdown &amp; Resource Persons
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter proposed expenditure and guest speaker credentials for financial approval.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Budget Requested (₹ INR) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budgetSanctioned}
                  onChange={(e) => handleChange('budgetSanctioned', parseInt(e.target.value, 10) || 0)}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.budgetSanctioned ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800'
                  }`}
                />
              </div>
              {errors.budgetSanctioned && (
                <p className="text-[11px] text-red-400 mt-1">{errors.budgetSanctioned}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guest Speakers &amp; External Resource Persons
              </label>
              <textarea
                rows={2}
                value={formData.resourcePersons}
                onChange={(e) => handleChange('resourcePersons', e.target.value)}
                placeholder="e.g. Dr. A. Sharma (Senior Research Scientist, IISc Bangalore), Er. Priya Nair (Principal Architect, Intel)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Issue Verifiable Digital Certificates</div>
                  <div className="text-[11px] text-slate-400">
                    Auto-generate cryptographic QR certificates for verified attendees after ATR submission.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.certificatesEnabled}
                    onChange={(e) => handleChange('certificatesEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Step 4: Summary & Submission */}
      {step === 4 && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">fact_check</span>
              Step 4: Statutory Compliance Review &amp; Dispatch
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify proposal details before official submission to the Faculty Convener approval desk.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Event Title</span>
                <span className="text-white font-bold">{formData.title || 'Untitled'}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organizing Body</span>
                <span className="text-white font-bold">{formData.committee}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date &amp; Venue</span>
                <span className="text-white font-bold">
                  {formData.rawDate || 'TBD'} @ {formData.venue}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Requested Budget</span>
                <span className="text-emerald-400 font-bold">₹{formData.budgetSanctioned.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Capacity</span>
                <span className="text-indigo-300 font-bold">{formData.capacity} Attendees</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Accreditation Criterion</span>
                <span className="text-purple-300 font-bold">{formData.naacCategory}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Objective</span>
              <p className="text-slate-300 leading-relaxed">{formData.objective}</p>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">policy</span>
              <div>
                <span className="font-semibold block">Audit Logging &amp; Transparency Notice</span>
                Submitting this proposal logs an immutable entry into the CCEAS Audit Ledger under your identity.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/head"
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            Save Draft
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{isSubmitting ? 'Submitting Proposal...' : 'Submit for Faculty Approval'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
