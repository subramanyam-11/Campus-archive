import { z } from 'zod';

export type UserRole = 'principal' | 'iqac' | 'head' | 'faculty' | 'student';

export const UserRoleSchema = z.enum(['principal', 'iqac', 'head', 'faculty', 'student']);

export type ViewType = 
  | 'dashboard' 
  | 'committees' 
  | 'committee-detail' 
  | 'events' 
  | 'event-detail' 
  | 'archive-and-search' 
  | 'upload-data' 
  | 'roster' 
  | 'reports' 
  | 'settings'
  | 'head-dashboard'
  | 'faculty-dashboard'
  | 'student-dashboard';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  prn?: string;
  badgeId?: string;
  committeeIds?: string[];
  avatarIcon?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: UserRoleSchema,
  department: z.string(),
  prn: z.string().optional(),
  badgeId: z.string().optional(),
  committeeIds: z.array(z.string()).optional(),
  avatarIcon: z.string().optional(),
  phoneNumber: z.string().optional(),
  createdAt: z.string().optional(),
});

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  department: string;
  badgeId: string;
  email: string;
  avatarIcon: string;
}

export interface CommitteeDocument {
  id: string;
  title: string;
  size: string;
  date: string;
  signedBy: string;
  type: string;
  url?: string;
  sha256Hash?: string;
}

export const CommitteeDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  size: z.string(),
  date: z.string(),
  signedBy: z.string(),
  type: z.string(),
  url: z.string().optional(),
  sha256Hash: z.string().optional(),
});

export interface CommitteeFocusArea {
  title: string;
  description: string;
}

export interface CommitteeLeadershipMember {
  name: string;
  role: string;
  prn: string;
  program: string;
  initials: string;
  clearanceVerified: boolean;
}

export interface CommitteeMetrics {
  approvedEvents: number;
  footfall: number;
  sanctionedBudget: string;
  budgetNumeric: number;
  utilizedBudget: string;
  utilizedNumeric: number;
  utilizedPercent: number;
  grantId: string;
}

export interface Committee {
  id: string;
  code: string;
  name: string;
  categoryTag: string;
  categoryType: 'iqac' | 'tech' | 'cultural' | 'outreach' | 'admin';
  department: string;
  status: 'active' | 'archived';
  facultyInCharge: {
    name: string;
    designation: string;
    signatureVerified: boolean;
    signatureUid: string;
    email?: string;
  };
  activeMembersCount: number;
  lastRevised: string;
  charter: string;
  naacCriterion: string;
  focusAreas: CommitteeFocusArea[];
  leadership: CommitteeLeadershipMember[];
  metrics: CommitteeMetrics;
  documents: CommitteeDocument[];
}

export const CommitteeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  categoryTag: z.string(),
  categoryType: z.enum(['iqac', 'tech', 'cultural', 'outreach', 'admin']),
  department: z.string(),
  status: z.enum(['active', 'archived']),
  facultyInCharge: z.object({
    name: z.string(),
    designation: z.string(),
    signatureVerified: z.boolean(),
    signatureUid: z.string(),
    email: z.string().optional(),
  }),
  activeMembersCount: z.number(),
  lastRevised: z.string(),
  charter: z.string(),
  naacCriterion: z.string(),
  focusAreas: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  leadership: z.array(z.object({
    name: z.string(),
    role: z.string(),
    prn: z.string(),
    program: z.string(),
    initials: z.string(),
    clearanceVerified: z.boolean(),
  })),
  metrics: z.object({
    approvedEvents: z.number(),
    footfall: z.number(),
    sanctionedBudget: z.string(),
    budgetNumeric: z.number(),
    utilizedBudget: z.string(),
    utilizedNumeric: z.number(),
    utilizedPercent: z.number(),
    grantId: z.string(),
  }),
  documents: z.array(CommitteeDocumentSchema),
});

export type EventStatus = 
  | 'Approved' 
  | 'Pending' 
  | 'Draft' 
  | 'Overdue (ATR Pending)' 
  | 'Rejected' 
  | 'Changes Requested'
  | 'Cleared';

export interface EventTimelineStep {
  step: string;
  date: string;
  actor: string;
  remarks?: string;
  cleared: boolean;
}

export interface EventPhoto {
  url: string;
  caption: string;
  alt: string;
  sha256Hash?: string;
}

export type EventCategoryType =
  | 'symposium'
  | 'hackathon'
  | 'outreach'
  | 'course'
  | 'conclave'
  | 'social'
  | 'workshop'
  | 'conference'
  | 'competition'
  | 'cultural';

export type NaacCategory = string;

export interface EventItem {
  id: string;
  code: string;
  refNo: string;
  title: string;
  committee: string;
  committeeCode: string;
  department: string;
  convener: string;
  category: string;
  categoryType: EventCategoryType;
  dateStr: string;
  rawDate: string;
  venue: string;
  budgetSanctioned: number;
  budgetUtilized: number;
  utilizationNote?: string;
  status: EventStatus;
  naacCategory: string;
  objective: string;
  targetDelegates: string;
  capacity?: number;
  attendanceValidated: number;
  attendanceTarget: number;
  attendanceTurnoutPercent: number;
  surplusReturned: number;
  timeline: EventTimelineStep[];
  outcomesAtr: string[];
  photos: EventPhoto[];
  dossierPdfUrl?: string;
  dossierSha256?: string;
  registrationDeadline?: string;
  certificatesIssued?: boolean;
  facultyComments?: string;
}

export const EventItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  refNo: z.string(),
  title: z.string(),
  committee: z.string(),
  committeeCode: z.string(),
  department: z.string(),
  convener: z.string(),
  category: z.string(),
  categoryType: z.enum([
    'symposium',
    'hackathon',
    'outreach',
    'course',
    'conclave',
    'social',
    'workshop',
    'conference',
    'competition',
    'cultural',
  ]),
  dateStr: z.string(),
  rawDate: z.string(),
  venue: z.string(),
  budgetSanctioned: z.number(),
  budgetUtilized: z.number(),
  utilizationNote: z.string().optional(),
  status: z.enum(['Approved', 'Pending', 'Draft', 'Overdue (ATR Pending)', 'Rejected', 'Changes Requested', 'Cleared']),
  naacCategory: z.string(),
  objective: z.string(),
  targetDelegates: z.string(),
  capacity: z.number().optional(),
  attendanceValidated: z.number(),
  attendanceTarget: z.number(),
  attendanceTurnoutPercent: z.number(),
  surplusReturned: z.number(),
  timeline: z.array(z.object({
    step: z.string(),
    date: z.string(),
    actor: z.string(),
    remarks: z.string().optional(),
    cleared: z.boolean(),
  })),
  outcomesAtr: z.array(z.string()),
  photos: z.array(z.object({
    url: z.string(),
    caption: z.string(),
    alt: z.string(),
    sha256Hash: z.string().optional(),
  })),
  dossierPdfUrl: z.string().optional(),
  dossierSha256: z.string().optional(),
  registrationDeadline: z.string().optional(),
  certificatesIssued: z.boolean().optional(),
  facultyComments: z.string().optional(),
});

export interface RosterMember {
  id: string;
  name: string;
  email: string;
  prn: string;
  department: string;
  role: string;
  tenure: string;
  status: 'Active' | 'Invited';
  initials: string;
}

export const RosterMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  prn: z.string(),
  department: z.string(),
  role: z.string(),
  tenure: z.string(),
  status: z.enum(['Active', 'Invited']),
  initials: z.string(),
});

export interface StagingItem {
  id: string;
  fileName: string;
  innerDocsCount: string;
  detectedCommittee: string;
  academicYear: string;
  recordTitle: string;
  size: string;
  type: string;
  status: 'Auto-Mapped' | 'Needs Review';
  confidenceScore: number;
  confidence: string;
  selected: boolean;
  notes?: string;
  sha256Hash?: string;
}

export const StagingItemSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  innerDocsCount: z.string(),
  detectedCommittee: z.string(),
  academicYear: z.string(),
  recordTitle: z.string(),
  size: z.string(),
  type: z.string(),
  status: z.enum(['Auto-Mapped', 'Needs Review']),
  confidenceScore: z.number(),
  confidence: z.string(),
  selected: z.boolean(),
  notes: z.string().optional(),
  sha256Hash: z.string().optional(),
});

export interface ArchiveRecord {
  id: string;
  type: 'EVENT ARCHIVE' | 'COMMITTEE DOCUMENT' | 'COMMITTEE ROSTER' | 'ACTION TAKEN REPORT' | 'MINUTES OF MEETING';
  academicYear: string;
  committee: string;
  title: string;
  snippet: string;
  dateOrUploadDate: string;
  refOrId: string;
  statusTag?: string;
  tagType?: 'green' | 'amber' | 'red' | 'blue';
  hash?: string;
  filesCount?: number;
  size?: string;
  authorOrChair?: string;
  verified?: boolean;
}

export const ArchiveRecordSchema = z.object({
  id: z.string(),
  type: z.enum(['EVENT ARCHIVE', 'COMMITTEE DOCUMENT', 'COMMITTEE ROSTER', 'ACTION TAKEN REPORT', 'MINUTES OF MEETING']),
  academicYear: z.string(),
  committee: z.string(),
  title: z.string(),
  snippet: z.string(),
  dateOrUploadDate: z.string(),
  refOrId: z.string(),
  statusTag: z.string().optional(),
  tagType: z.enum(['green', 'amber', 'red', 'blue']).optional(),
  hash: z.string().optional(),
  filesCount: z.number().optional(),
  size: z.string().optional(),
  authorOrChair: z.string().optional(),
  verified: z.boolean().optional(),
});

export interface EnrolmentItem {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPrn: string;
  enrolledAt: string;
  status: 'Enrolled' | 'Waitlisted' | 'Attended' | 'Withdrawn';
  checkInTime?: string;
  feedbackSubmitted?: boolean;
  certificateId?: string;
  certificateUrl?: string;
}

export const EnrolmentItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventTitle: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
  userName: z.string(),
  userPrn: z.string(),
  enrolledAt: z.string(),
  status: z.enum(['Enrolled', 'Waitlisted', 'Attended', 'Withdrawn']),
  checkInTime: z.string().optional(),
  feedbackSubmitted: z.boolean().optional(),
  certificateId: z.string().optional(),
  certificateUrl: z.string().optional(),
});

export interface CertificateItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  committeeName: string;
  studentUid: string;
  studentName: string;
  studentPrn: string;
  issuedAt: string;
  sha256Hash: string;
  qrCodeData: string;
  status: 'Valid' | 'Revoked';
  downloadUrl?: string;
}

export const CertificateItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventTitle: z.string(),
  eventDate: z.string(),
  committeeName: z.string(),
  studentUid: z.string(),
  studentName: z.string(),
  studentPrn: z.string(),
  issuedAt: z.string(),
  sha256Hash: z.string(),
  qrCodeData: z.string(),
  status: z.enum(['Valid', 'Revoked']),
  downloadUrl: z.string().optional(),
});
