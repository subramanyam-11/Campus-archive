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
  | 'settings';

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  department: string;
  badgeId: string;
  email: string;
  avatarIcon: string;
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
  };
  activeMembersCount: number;
  lastRevised: string;
  charter: string;
  naacCriterion: string;
  focusAreas: {
    title: string;
    description: string;
  }[];
  leadership: {
    name: string;
    role: string;
    prn: string;
    program: string;
    initials: string;
    clearanceVerified: boolean;
  }[];
  metrics: {
    approvedEvents: number;
    footfall: number;
    sanctionedBudget: string;
    budgetNumeric: number;
    utilizedBudget: string;
    utilizedNumeric: number;
    utilizedPercent: number;
    grantId: string;
  };
  documents: {
    id: string;
    title: string;
    size: string;
    date: string;
    signedBy: string;
    type: string;
  }[];
}

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
  categoryType: 'symposium' | 'hackathon' | 'outreach' | 'course' | 'conclave' | 'social';
  dateStr: string;
  rawDate: string;
  venue: string;
  budgetSanctioned: number;
  budgetUtilized: number;
  utilizationNote?: string;
  status: 'Approved' | 'Pending' | 'Draft' | 'Overdue (ATR Pending)';
  naacCategory: string;
  objective: string;
  targetDelegates: string;
  attendanceValidated: number;
  attendanceTarget: number;
  attendanceTurnoutPercent: number;
  surplusReturned: number;
  timeline: {
    step: string;
    date: string;
    actor: string;
    remarks?: string;
    cleared: boolean;
  }[];
  outcomesAtr: string[];
  photos: {
    url: string;
    caption: string;
    alt: string;
  }[];
  dossierPdfUrl?: string;
}

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
  confidence: 'High (94%)' | 'High (98%)' | 'Medium (76%)';
  selected: boolean;
  notes?: string;
}

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
}
