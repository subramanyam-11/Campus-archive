import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Committee, EventItem, UserProfile, EventStatus } from '../src/types';

// Connect to Firestore emulator for seeding
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';

const app = getApps().length === 0
  ? initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-campus-archive',
    })
  : getApps()[0];

const db = getFirestore(app);
console.log(`📡 Connected to Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);

// 1. Five Core Statutory & Co-Curricular Committees
export const SEED_COMMITTEES: Committee[] = [
  {
    id: 'com-cse-09',
    code: 'COM-CSE-09',
    name: 'ACM Student Chapter',
    categoryTag: 'Technical / CSE Department',
    categoryType: 'tech',
    department: 'Department of Computer Science & Engineering',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Amit K. Saxena',
      designation: 'Associate Professor & ACM Chapter Mentor',
      signatureVerified: true,
      signatureUid: 'DSC-8921-2024',
      email: 'amit.saxena@college.edu',
    },
    activeMembersCount: 28,
    lastRevised: 'Rev. Oct 2024',
    charter: 'Foster computing excellence, programming competitions, algorithmic problem solving, research symposia, and industry networking for undergraduate scholars.',
    naacCriterion: 'Criterion 3.3.2 & 5.1.3 (Seminars, Industry Workshops, Student Chapters)',
    focusAreas: [
      { title: 'National Hackathons & Code-a-thons', description: 'Annual 36-hour hackathons with Fortune 500 corporate sponsors and venture mentors.' },
      { title: 'Peer Algorithm Sprints', description: 'Bi-weekly competitive programming challenges and system design workshops.' },
      { title: 'Women in Computing Chapter (ACM-W)', description: 'Mentorship tracks, scholarship application support, and leadership summits.' },
    ],
    leadership: [
      { name: 'Subramanyam Rao', role: 'Chairperson', prn: '2022BTECS00142', program: 'B.Tech CSE (Final Year)', initials: 'SR', clearanceVerified: true },
      { name: 'Sneha Kulkarni', role: 'Vice-Chair', prn: '2022BTECS00189', program: 'B.Tech CSE (Final Year)', initials: 'SK', clearanceVerified: true },
      { name: 'Aditya Deshmukh', role: 'Secretary', prn: '2023BTECS00055', program: 'B.Tech CSE (Third Year)', initials: 'AD', clearanceVerified: true },
    ],
    metrics: {
      approvedEvents: 8,
      footfall: 1840,
      sanctionedBudget: '₹4,50,000',
      budgetNumeric: 450000,
      utilizedBudget: '₹3,78,250',
      utilizedNumeric: 378250,
      utilizedPercent: 84.1,
      grantId: 'ACM-IN-2024-C9',
    },
    documents: [
      { id: 'doc-acm-1', title: 'ACM_Student_Chapter_Charter_Signed.pdf', size: '1.4 MB', date: 'Jul 2024', signedBy: 'Principal & ACM India Council', type: 'PDF' },
      { id: 'doc-acm-2', title: 'ACM_Annual_Tenure_Notification.pdf', size: '480 KB', date: 'Aug 2024', signedBy: 'Office of Registrar', type: 'PDF' },
    ],
  },
  {
    id: 'com-stat-01',
    code: 'COM-STAT-01',
    name: 'Internal Quality Assurance Cell (IQAC)',
    categoryTag: 'Statutory Body',
    categoryType: 'iqac',
    department: 'Directorate of Academic Excellence',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Rekha Rao',
      designation: 'Director IQAC & Professor of Electronics',
      signatureVerified: true,
      signatureUid: 'DSC-1002-2024',
      email: 'rekha.rao@college.edu',
    },
    activeMembersCount: 22,
    lastRevised: 'Rev. Jul 2024',
    charter: 'Statutory body established per UGC and NAAC mandates to institutionalize quality enhancement policies, audit outcomes, academic appraisals, and accreditation dossiers.',
    naacCriterion: 'Criterion 6.5.1 & 6.5.2 (Internal Quality Assurance System)',
    focusAreas: [
      { title: 'Annual Quality Assurance Reports (AQAR)', description: 'Data aggregation across 7 NAAC criteria and submission to the NAAC statutory portal.' },
      { title: 'Academic & Administrative Audits (AAA)', description: 'Bi-annual independent audits of department curriculum deliveries and lab infrastructures.' },
      { title: 'Faculty Outcome & Pedagogy Assessments', description: 'Workshops on Bloom Taxonomy, rubric-based evaluations, and AI-assisted pedagogy.' },
    ],
    leadership: [
      { name: 'Dr. Rekha Rao', role: 'IQAC Coordinator', prn: 'FAC-DIR-303', program: 'Electronics', initials: 'RR', clearanceVerified: true },
      { name: 'Dr. Suresh Nair', role: 'Senior Member', prn: 'FAC-DIR-201', program: 'Mechanical', initials: 'SN', clearanceVerified: true },
    ],
    metrics: {
      approvedEvents: 6,
      footfall: 1100,
      sanctionedBudget: '₹3,20,000',
      budgetNumeric: 320000,
      utilizedBudget: '₹2,64,000',
      utilizedNumeric: 264000,
      utilizedPercent: 82.5,
      grantId: 'UGC-IQAC-2024',
    },
    documents: [
      { id: 'doc-iqac-1', title: 'IQAC_Charter_and_Bylaws_Approved.pdf', size: '2.1 MB', date: 'Jul 2024', signedBy: 'Director IQAC', type: 'PDF' },
      { id: 'doc-iqac-2', title: 'Annual_Quality_Assurance_Report_2023-24.pdf', size: '4.8 MB', date: 'Aug 2024', signedBy: 'Dean Academic', type: 'PDF' },
    ],
  },
  {
    id: 'com-stu-04',
    code: 'COM-STU-04',
    name: 'National Service Scheme (NSS Unit)',
    categoryTag: 'Social Outreach / Youth Affairs',
    categoryType: 'outreach',
    department: 'Directorate of Student Welfare',
    status: 'active',
    facultyInCharge: {
      name: 'Prof. Rajesh M. Shinde',
      designation: 'NSS Programme Officer & Assistant Professor',
      signatureVerified: true,
      signatureUid: 'DSC-NSS-4412',
      email: 'rajesh.shinde@college.edu',
    },
    activeMembersCount: 120,
    lastRevised: 'Rev. Jun 2024',
    charter: 'Cultivate community orientation, social leadership, rural literacy campaigns, blood donation drives, environmental stewardship, and disaster relief preparedness.',
    naacCriterion: 'Criterion 3.4.1 & 3.4.3 (Extension and Outreach Activities)',
    focusAreas: [
      { title: 'Rural Immersion Camps', description: 'Annual 7-day residential village adoption camps focusing on sanitation and digital literacy.' },
      { title: 'National Blood Donation Drives', description: 'Multi-hospital blood donation drives collecting over 500 units annually.' },
      { title: 'Environmental Sustainability Drives', description: 'Tree plantation and e-waste collection campaigns across Pune district.' },
    ],
    leadership: [
      { name: 'Pooja Patil', role: 'Student Volunteer Head', prn: '2022BTECV00078', program: 'B.Tech Civil', initials: 'PP', clearanceVerified: true },
      { name: 'Kunal Joshi', role: 'Logistics Lead', prn: '2023BTECH00112', program: 'B.Tech Mechanical', initials: 'KJ', clearanceVerified: true },
    ],
    metrics: {
      approvedEvents: 10,
      footfall: 3400,
      sanctionedBudget: '₹2,80,000',
      budgetNumeric: 280000,
      utilizedBudget: '₹2,55,000',
      utilizedNumeric: 255000,
      utilizedPercent: 91.1,
      grantId: 'GOV-NSS-MH-2024',
    },
    documents: [
      { id: 'doc-nss-1', title: 'NSS_State_Government_Sanction_2024.pdf', size: '1.9 MB', date: 'Jun 2024', signedBy: 'State Liaison Officer', type: 'PDF' },
    ],
  },
  {
    id: 'com-eee-03',
    code: 'COM-EEE-03',
    name: 'IEEE Power & Energy Society (PES)',
    categoryTag: 'Technical / EEE Department',
    categoryType: 'tech',
    department: 'Department of Electrical & Electronics Engineering',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Priya V. Nambiar',
      designation: 'Associate Professor & IEEE Senior Member',
      signatureVerified: true,
      signatureUid: 'DSC-EEE-9081',
      email: 'priya.nambiar@college.edu',
    },
    activeMembersCount: 34,
    lastRevised: 'Rev. Sep 2024',
    charter: 'Promote power electronics, clean renewable grid architectures, electric mobility, smart-metering, and IEEE international student research papers.',
    naacCriterion: 'Criterion 3.3.2 & 3.2.2 (Industry Seminars and Conferences)',
    focusAreas: [
      { title: 'Green Energy & EV Symposiums', description: 'Conferences with state power distribution engineers and EV drivetrain designers.' },
      { title: 'Smart Grid Hardware Labs', description: 'Hands-on micro-inverter and solar battery management prototyping.' },
    ],
    leadership: [
      { name: 'Rohan Verma', role: 'Branch Chair', prn: '2022BTEEE00045', program: 'B.Tech EEE', initials: 'RV', clearanceVerified: true },
    ],
    metrics: {
      approvedEvents: 5,
      footfall: 780,
      sanctionedBudget: '₹3,00,000',
      budgetNumeric: 300000,
      utilizedBudget: '₹2,10,000',
      utilizedNumeric: 210000,
      utilizedPercent: 70.0,
      grantId: 'IEEE-PES-GLOBAL-24',
    },
    documents: [
      { id: 'doc-pes-1', title: 'IEEE_PES_Global_Chapter_Roster_Charter.pdf', size: '2.4 MB', date: 'Sep 2024', signedBy: 'IEEE India Council', type: 'PDF' },
    ],
  },
  {
    id: 'com-mech-07',
    code: 'COM-MECH-07',
    name: 'Robotics & Automation Club (RoboForge)',
    categoryTag: 'Technical / Mechatronics',
    categoryType: 'tech',
    department: 'Department of Mechanical Engineering',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Devendra S. Thakur',
      designation: 'Professor & Head of Automation Lab',
      signatureVerified: true,
      signatureUid: 'DSC-MEC-3110',
      email: 'devendra.thakur@college.edu',
    },
    activeMembersCount: 42,
    lastRevised: 'Rev. Oct 2024',
    charter: 'Drive autonomous robotics, drone fabrication, PLC automation, combat robot tournaments, and robotic rovers for national engineering challenges.',
    naacCriterion: 'Criterion 5.3.3 (Sports and Cultural Competitions / Technical Contests)',
    focusAreas: [
      { title: 'RoboForge National Combat Arena', description: 'Inter-collegiate 15kg/30kg combat robotics tournament.' },
      { title: 'Autonomous Drone Navigation Sprints', description: 'Computer vision and ROS2 based quadcopter path planning.' },
    ],
    leadership: [
      { name: 'Sameer Sheikh', role: 'Captain', prn: '2022BTEME00091', program: 'B.Tech Mechanical', initials: 'SS', clearanceVerified: true },
    ],
    metrics: {
      approvedEvents: 7,
      footfall: 1950,
      sanctionedBudget: '₹5,00,000',
      budgetNumeric: 500000,
      utilizedBudget: '₹4,62,000',
      utilizedNumeric: 462000,
      utilizedPercent: 92.4,
      grantId: 'ROBO-MECH-2024',
    },
    documents: [
      { id: 'doc-rf-1', title: 'RoboForge_Charter_and_Safety_Bylaws.pdf', size: '3.2 MB', date: 'Jul 2024', signedBy: 'Dean Infrastructure', type: 'PDF' },
    ],
  },
];

// 2. 40 Realistic Users Across All Five Roles
export const SEED_USERS: UserProfile[] = [
  // 1 Principal
  {
    uid: 'user-principal-01',
    email: 'principal@college.edu',
    displayName: 'Dr. Arvind Joshi',
    role: 'principal',
    department: 'Office of the Principal',
    badgeId: 'EXE-PRIN-001',
    prn: 'DIR-001',
    avatarIcon: 'shield_person',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 2 IQAC
  {
    uid: 'user-iqac-01',
    email: 'iqac@college.edu',
    displayName: 'Dr. Rekha Rao',
    role: 'iqac',
    department: 'Internal Quality Assurance Cell',
    badgeId: 'FAC-IQAC-303',
    prn: 'FAC-IQAC-01',
    avatarIcon: 'fact_check',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-iqac-02',
    email: 'iqac.audit@college.edu',
    displayName: 'Dr. Suresh Nair',
    role: 'iqac',
    department: 'Internal Quality Assurance Cell',
    badgeId: 'FAC-IQAC-304',
    prn: 'FAC-IQAC-02',
    avatarIcon: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 5 Committee Heads
  {
    uid: 'user-head-acm',
    email: 'head@college.edu',
    displayName: 'Subramanyam Rao',
    role: 'head',
    department: 'Computer Engineering',
    badgeId: 'STU-CHAIR-201',
    prn: '2022BTECS00142',
    committeeIds: ['com-cse-09'],
    avatarIcon: 'person',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-head-nss',
    email: 'head.nss@college.edu',
    displayName: 'Pooja Patil',
    role: 'head',
    department: 'Civil Engineering',
    badgeId: 'STU-CHAIR-202',
    prn: '2022BTECV00078',
    committeeIds: ['com-stu-04'],
    avatarIcon: 'volunteer_activism',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-head-pes',
    email: 'head.pes@college.edu',
    displayName: 'Rohan Verma',
    role: 'head',
    department: 'Electrical Engineering',
    badgeId: 'STU-CHAIR-203',
    prn: '2022BTEEE00045',
    committeeIds: ['com-eee-03'],
    avatarIcon: 'bolt',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-head-robo',
    email: 'head.robo@college.edu',
    displayName: 'Sameer Sheikh',
    role: 'head',
    department: 'Mechanical Engineering',
    badgeId: 'STU-CHAIR-204',
    prn: '2022BTEME00091',
    committeeIds: ['com-mech-07'],
    avatarIcon: 'precision_manufacturing',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-head-cult',
    email: 'head.cultural@college.edu',
    displayName: 'Tanvi Shinde',
    role: 'head',
    department: 'Information Technology',
    badgeId: 'STU-CHAIR-205',
    prn: '2022BTEIT00062',
    committeeIds: ['com-stat-01'],
    avatarIcon: 'theater_comedy',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 8 Faculty Conveners
  {
    uid: 'user-faculty-01',
    email: 'faculty@college.edu',
    displayName: 'Dr. Amit K. Saxena',
    role: 'faculty',
    department: 'Computer Engineering',
    badgeId: 'FAC-DIR-101',
    prn: 'FAC-CSE-01',
    committeeIds: ['com-cse-09'],
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-faculty-02',
    email: 'rajesh.shinde@college.edu',
    displayName: 'Prof. Rajesh M. Shinde',
    role: 'faculty',
    department: 'Directorate of Student Welfare',
    badgeId: 'FAC-DIR-102',
    prn: 'FAC-SW-01',
    committeeIds: ['com-stu-04'],
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-faculty-03',
    email: 'priya.nambiar@college.edu',
    displayName: 'Dr. Priya V. Nambiar',
    role: 'faculty',
    department: 'Electrical Engineering',
    badgeId: 'FAC-DIR-103',
    prn: 'FAC-EEE-01',
    committeeIds: ['com-eee-03'],
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-faculty-04',
    email: 'devendra.thakur@college.edu',
    displayName: 'Dr. Devendra S. Thakur',
    role: 'faculty',
    department: 'Mechanical Engineering',
    badgeId: 'FAC-DIR-104',
    prn: 'FAC-MECH-01',
    committeeIds: ['com-mech-07'],
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-faculty-05',
    email: 'sunita.sharma@college.edu',
    displayName: 'Prof. Sunita Sharma',
    role: 'faculty',
    department: 'Applied Sciences & Humanities',
    badgeId: 'FAC-DIR-105',
    prn: 'FAC-ASH-01',
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-faculty-06',
    email: 'anil.deshmukh@college.edu',
    displayName: 'Dr. Anil Deshmukh',
    role: 'faculty',
    department: 'Information Technology',
    badgeId: 'FAC-DIR-106',
    prn: 'FAC-IT-01',
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-faculty-07',
    email: 'meenakshi.iyer@college.edu',
    displayName: 'Dr. Meenakshi Iyer',
    role: 'faculty',
    department: 'Electronics & Telecommunication',
    badgeId: 'FAC-DIR-107',
    prn: 'FAC-ENTC-01',
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    uid: 'user-faculty-08',
    email: 'vikas.more@college.edu',
    displayName: 'Prof. Vikas More',
    role: 'faculty',
    department: 'Civil Engineering',
    badgeId: 'FAC-DIR-108',
    prn: 'FAC-CIVIL-01',
    avatarIcon: 'school',
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 24 Students
  ...Array.from({ length: 24 }).map((_, index) => {
    const studentNum = index + 1;
    const names = [
      'Aarav Sharma', 'Diya Patel', 'Kabir Verma', 'Ananya Gupta', 'Ishaan Joshi',
      'Riya Sen', 'Rohan Kulkarni', 'Aditi Rao', 'Devansh Mehta', 'Pari Shah',
      'Yash Chauhan', 'Kavya Pillai', 'Aryan Saxena', 'Navya Nair', 'Atharva Mane',
      'Tanvi Kadam', 'Shaurya Bhatt', 'Avani Deshpande', 'Siddharth Roy', 'Isha Tiwari',
      'Krish Malhotra', 'Meera Menon', 'Vedant Dixit', 'Zoya Khan'
    ];
    const name = names[index] || `Student Scholar ${studentNum}`;
    const prn = `2023BTECS00${String(100 + index).padStart(3, '0')}`;
    return {
      uid: index === 0 ? 'user-student-demo' : `user-student-${String(studentNum).padStart(2, '0')}`,
      email: index === 0 ? 'student@college.edu' : `student${studentNum}@college.edu`,
      displayName: name,
      role: 'student' as const,
      department: index % 2 === 0 ? 'Computer Engineering' : 'Mechanical Engineering',
      badgeId: `STU-UG-${String(200 + index)}`,
      prn,
      avatarIcon: 'school',
      createdAt: '2024-01-01T00:00:00Z',
    };
  }),
];

// 3. 30 Comprehensive Events Across All Statuses
const eventStatuses: EventStatus[] = [
  'Approved', 'Pending', 'Draft', 'Overdue (ATR Pending)', 'Rejected', 'Changes Requested', 'Cleared'
];

export const SEED_EVENTS: EventItem[] = [
  // 1. ACM Hackathon (Approved & Cleared)
  {
    id: 'evt-2024-089',
    code: 'EV-8901',
    refNo: 'CCEAS/CSE/2024/8901-R',
    title: 'CodeHorizon National 36-Hour Hackathon 2024',
    committee: 'ACM Student Chapter',
    committeeCode: 'COM-CSE-09',
    department: 'Department of Computer Science & Engineering',
    convener: 'Dr. Amit K. Saxena',
    category: 'National Hackathon',
    categoryType: 'hackathon',
    dateStr: '18 – 19 Oct 2024',
    rawDate: '2024-10-18',
    venue: 'Advanced Computing Lab & Central Auditorium',
    budgetSanctioned: 240000,
    budgetUtilized: 228400,
    utilizationNote: 'Direct expenditure verified against invoices. Surplus ₹11,600 refunded.',
    status: 'Approved',
    naacCategory: 'NAAC Category 3.3.2 (Industry Engagement & Innovation)',
    objective: 'Foster national collegiate software innovation, open-source AI tooling, and cloud infrastructure prototypes under industry mentorship.',
    targetDelegates: '400 Participants Cap',
    attendanceValidated: 384,
    attendanceTarget: 400,
    attendanceTurnoutPercent: 96.0,
    surplusReturned: 11600,
    timeline: [
      { step: '1. Proposal Submission', date: '15 Aug 2024', actor: 'Subramanyam Rao (Chair)', remarks: 'Formal application with industry sponsor LOIs.', cleared: true },
      { step: '2. Academic Convener Review', date: '22 Aug 2024', actor: 'Dr. Amit K. Saxena', remarks: 'Reviewed lab quota and compute requirements.', cleared: true },
      { step: '3. IQAC Compliance Clearance', date: '01 Sep 2024', actor: 'Dr. Rekha Rao (IQAC)', remarks: 'Sanctioned under Criterion 3.3.2.', cleared: true },
      { step: '4. Executive Authorization', date: '05 Sep 2024', actor: 'Dr. Arvind Joshi (Principal)', remarks: 'Grant #COM-24-90B sanctioned.', cleared: true },
      { step: '5. Event Execution & Ledgering', date: '19 Oct 2024', actor: 'ACM Executive Committee', remarks: 'Conducted successfully with 96 teams.', cleared: true },
    ],
    outcomesAtr: [
      '384 verified delegates from 42 engineering institutions across 6 states participated.',
      '96 production-grade prototypes submitted to GitHub under Apache-2.0 licenses.',
      '8 top-ranking teams received direct pre-placement interview (PPI) fast-tracks.',
      'Zero safety or network outage incidents reported during 36 hours of continuous load.',
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80', caption: 'Inaugural Keynote by Industry Vice President', alt: 'Auditorium keynote' },
      { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', caption: 'Night Coding Sprint at Advanced Lab', alt: 'Hackers coding at night' },
    ],
    dossierPdfUrl: '/mock/dossiers/EV-8901-CodeHorizon.pdf',
    dossierSha256: '4f98d1a8e032b49c71650e28a9b23f81e01f6874288b1393e827d812239c4a89',
    registrationDeadline: '2024-10-10',
    certificatesIssued: true,
  },
  // 2. Overdue ATR Event
  {
    id: 'evt-2024-091',
    code: 'EV-8924',
    refNo: 'CCEAS/CSE/2024/8924-R',
    title: 'Generative AI & LLM Systems Hands-on Bootcamp',
    committee: 'ACM Student Chapter',
    committeeCode: 'COM-CSE-09',
    department: 'Department of Computer Science & Engineering',
    convener: 'Dr. Amit K. Saxena',
    category: 'Advanced Certification Course',
    categoryType: 'course',
    dateStr: '04 – 05 Oct 2024',
    rawDate: '2024-10-04',
    venue: 'Seminar Hall 204, Ramanujan Block',
    budgetSanctioned: 60000,
    budgetUtilized: 58200,
    utilizationNote: 'Bills audited. Awaiting final student feedback analytics compilation.',
    status: 'Overdue (ATR Pending)',
    naacCategory: 'NAAC Category 1.3.2 (Value-added Technical Courses)',
    objective: 'Equip senior undergraduates with transformer architecture implementations, fine-tuning techniques, and evaluation benchmarks.',
    targetDelegates: '120 Registered Scholars',
    attendanceValidated: 114,
    attendanceTarget: 120,
    attendanceTurnoutPercent: 95.0,
    surplusReturned: 1800,
    timeline: [
      { step: '1. Proposal Submission', date: '10 Sep 2024', actor: 'ACM Committee', cleared: true },
      { step: '2. IQAC Approval', date: '18 Sep 2024', actor: 'Dr. Rekha Rao', cleared: true },
      { step: '3. Execution', date: '05 Oct 2024', actor: 'Faculty & External Speaker', cleared: true },
      { step: '4. Action Taken Report (ATR)', date: 'Overdue (+14 Days)', actor: 'Committee Convener', remarks: 'Submission overdue.', cleared: false },
    ],
    outcomesAtr: [
      '114 students deployed local inference endpoints using quantized weights.',
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', caption: 'Hands-on Model Training Session', alt: 'Classroom model training' },
    ],
    registrationDeadline: '2024-10-01',
    certificatesIssued: false,
    facultyComments: 'Action Taken Report submission deadline exceeded. Please upload student outcome feedback to issue digital certificates.',
  },
  // 3. Pending Event awaiting approval
  {
    id: 'evt-2024-102',
    code: 'EV-8990',
    refNo: 'CCEAS/MECH/2024/8990-P',
    title: 'RoboForge Autonomous Drone Obstacle Navigation Derby',
    committee: 'Robotics & Automation Club (RoboForge)',
    committeeCode: 'COM-MECH-07',
    department: 'Department of Mechanical Engineering',
    convener: 'Dr. Devendra S. Thakur',
    category: 'Technical Championship',
    categoryType: 'hackathon',
    dateStr: '15 Nov 2024',
    rawDate: '2024-11-15',
    venue: 'Indoor Sports Complex Arena',
    budgetSanctioned: 125000,
    budgetUtilized: 0,
    status: 'Pending',
    naacCategory: 'NAAC Category 5.3.3 (Technical Competitions)',
    objective: 'Autonomous indoor waypoint navigation without GPS using optical flow and stereo depth estimation.',
    targetDelegates: '150 Participants',
    attendanceValidated: 0,
    attendanceTarget: 150,
    attendanceTurnoutPercent: 0,
    surplusReturned: 0,
    timeline: [
      { step: '1. Proposal Submission', date: 'Yesterday', actor: 'Sameer Sheikh (Captain)', remarks: 'Safety net perimeter plan submitted.', cleared: true },
      { step: '2. Faculty Convener Review', date: 'Pending', actor: 'Dr. Devendra S. Thakur', cleared: false },
    ],
    outcomesAtr: [],
    photos: [],
    registrationDeadline: '2024-11-10',
    certificatesIssued: false,
  },
  // 4. Draft Event
  {
    id: 'evt-2024-105',
    code: 'EV-9012',
    refNo: 'CCEAS/NSS/2024/9012-D',
    title: 'Mega Health & Blood Donation Camp 2024',
    committee: 'National Service Scheme (NSS Unit)',
    committeeCode: 'COM-STU-04',
    department: 'Directorate of Student Welfare',
    convener: 'Prof. Rajesh M. Shinde',
    category: 'Social Outreach',
    categoryType: 'outreach',
    dateStr: '01 Dec 2024',
    rawDate: '2024-12-01',
    venue: 'Student Activity Center Lawn',
    budgetSanctioned: 45000,
    budgetUtilized: 0,
    status: 'Draft',
    naacCategory: 'NAAC Category 3.4.3 (Extension Activities)',
    objective: 'Voluntary blood donation drive in collaboration with Armed Forces Medical College (AFMC) Blood Bank.',
    targetDelegates: '500 Donors Goal',
    attendanceValidated: 0,
    attendanceTarget: 500,
    attendanceTurnoutPercent: 0,
    surplusReturned: 0,
    timeline: [
      { step: '1. Draft Created', date: 'Today', actor: 'Pooja Patil', cleared: true },
    ],
    outcomesAtr: [],
    photos: [],
    registrationDeadline: '2024-11-28',
    certificatesIssued: false,
  },
  // 5. Changes Requested Event
  {
    id: 'evt-2024-108',
    code: 'EV-9045',
    refNo: 'CCEAS/EEE/2024/9045-CR',
    title: 'Electric Vehicle Battery Swapping Protocol Workshop',
    committee: 'IEEE Power & Energy Society (PES)',
    committeeCode: 'COM-EEE-03',
    department: 'Department of Electrical & Electronics Engineering',
    convener: 'Dr. Priya V. Nambiar',
    category: 'Industry Workshop',
    categoryType: 'symposium',
    dateStr: '22 Nov 2024',
    rawDate: '2024-11-22',
    venue: 'EEE High Voltage Lab 101',
    budgetSanctioned: 70000,
    budgetUtilized: 0,
    status: 'Changes Requested',
    naacCategory: 'NAAC Category 3.2.2 (Workshops on Industry Practices)',
    objective: 'Study 48V/72V modular lithium iron phosphate (LFP) battery safety architectures.',
    targetDelegates: '80 Students',
    attendanceValidated: 0,
    attendanceTarget: 80,
    attendanceTurnoutPercent: 0,
    surplusReturned: 0,
    timeline: [
      { step: '1. Proposal Submission', date: '3 days ago', actor: 'Rohan Verma', cleared: true },
      { step: '2. Faculty Review', date: 'Yesterday', actor: 'Dr. Priya V. Nambiar', remarks: 'Safety protocol for live pack demonstration must be attached.', cleared: false },
    ],
    outcomesAtr: [],
    photos: [],
    registrationDeadline: '2024-11-18',
    certificatesIssued: false,
    facultyComments: 'Please attach specific thermal runaway emergency measures and confirmation letter from the external battery testing partner.',
  },
  // 6. Rejected Event
  {
    id: 'evt-2024-110',
    code: 'EV-9060',
    refNo: 'CCEAS/TECH/2024/9060-X',
    title: 'Cryptocurrency Trading & Web3 Speculation Forum',
    committee: 'ACM Student Chapter',
    committeeCode: 'COM-CSE-09',
    department: 'Department of Computer Science & Engineering',
    convener: 'Dr. Amit K. Saxena',
    category: 'Student Forum',
    categoryType: 'social',
    dateStr: '12 Nov 2024',
    rawDate: '2024-11-12',
    venue: 'Classroom 302',
    budgetSanctioned: 20000,
    budgetUtilized: 0,
    status: 'Rejected',
    naacCategory: 'Non-Statutory Non-Academic',
    objective: 'Discussion on speculative retail crypto assets.',
    targetDelegates: '50 Students',
    attendanceValidated: 0,
    attendanceTarget: 50,
    attendanceTurnoutPercent: 0,
    surplusReturned: 0,
    timeline: [
      { step: '1. Submitted', date: 'Last week', actor: 'Applicant', cleared: true },
      { step: '2. Rejected', date: '3 days ago', actor: 'Dr. Rekha Rao (IQAC)', remarks: 'Fails institutional guidelines on speculative financial activities.', cleared: false },
    ],
    outcomesAtr: [],
    photos: [],
    registrationDeadline: '2024-11-05',
    certificatesIssued: false,
    facultyComments: 'Rejected: Topic does not align with academic computing curriculum and violates institutional guidelines regarding financial speculation on campus.',
  },
  // Fill remaining 24 realistic events spanning all committees and dates
  ...Array.from({ length: 24 }).map((_, i) => {
    const eventIndex = i + 7;
    const comm = SEED_COMMITTEES[i % SEED_COMMITTEES.length];
    const status = eventStatuses[i % eventStatuses.length];
    const codeNum = 9100 + i;
    const titles = [
      'Cloud Native Microservices Architecture Summit',
      'Renewable Energy Integration & Microgrid Conclave',
      'Disaster Management & First-Responder Certification',
      'Clean Campus Green Audit & Zero-Waste Drive',
      'AI-Powered Medical Imaging & Diagnostic Sprint',
      'Robotic Arm Kinematics & ROS Industrial Workshop',
      'National Academic Accreditation Framework Symposium',
      'Cyber Security Defense & Penetration Testing Clinic',
      'Smart City IoT Sensor Deployment Field Exercise',
      'Rural Village Sanitation & Water Testing Survey',
      'High Voltage Switchgear Reliability Colloquium',
      'Computer Vision for Autonomous Ground Vehicles',
      'Peer Academic Mentorship & Tutorial Bootcamp',
      'Open Source Linux Kernel Contribution Sprint',
      'Electric Drivetrain Thermal Management Seminar',
      'Social Welfare & Child Education Outreach',
      'Institutional Pedagogy & Assessment Masterclass',
      'FPGA Accelerated Edge Computing Workshop',
      'Industrial Automation with Siemens PLC Systems',
      'Blood Donation & Bone Marrow Registry Drive',
      'Modern Web Standards & Accessibility Summit',
      'Battery Energy Storage Systems Safety Conclave',
      'Mobile Robotics Simultaneous Localization & Mapping',
      'Higher Education NEP-2020 Quality Metrics Forum'
    ];

    const title = titles[i] || `Institutional Event ${eventIndex}`;
    const budgetSanctioned = 40000 + (i * 8000);
    const budgetUtilized = status === 'Approved' || status === 'Cleared' ? budgetSanctioned - 4000 : 0;
    const attendanceTarget = 60 + (i * 10);
    const attendanceValidated = status === 'Approved' || status === 'Cleared' ? attendanceTarget - 5 : 0;

    return {
      id: `evt-2024-${String(codeNum)}`,
      code: `EV-${codeNum}`,
      refNo: `CCEAS/${comm.code.split('-')[1]}/2024/${codeNum}`,
      title,
      committee: comm.name,
      committeeCode: comm.code,
      department: comm.department,
      convener: comm.facultyInCharge.name,
      category: comm.categoryType === 'tech' ? 'Technical Workshop' : 'Outreach Initiative',
      categoryType: (comm.categoryType === 'tech' ? 'symposium' : 'outreach') as EventItem['categoryType'],
      dateStr: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}`,
      rawDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}`,
      venue: `Campus Auditorium Hall ${((i % 4) + 1)}`,
      budgetSanctioned,
      budgetUtilized,
      status,
      naacCategory: comm.naacCriterion,
      objective: `Advance institutional knowledge dissemination and hands-on laboratory skill building for ${comm.name}.`,
      targetDelegates: `${attendanceTarget} Delegates`,
      attendanceValidated,
      attendanceTarget,
      attendanceTurnoutPercent: status === 'Approved' || status === 'Cleared' ? Math.round((attendanceValidated / attendanceTarget) * 100) : 0,
      surplusReturned: status === 'Approved' || status === 'Cleared' ? 4000 : 0,
      timeline: [
        { step: '1. Proposal Submission', date: '2024-08-10', actor: comm.leadership[0]?.name || 'Convener', cleared: true },
        { step: '2. Faculty Review', date: '2024-08-20', actor: comm.facultyInCharge.name, cleared: status !== 'Draft' },
      ],
      outcomesAtr: status === 'Approved' || status === 'Cleared' ? [
        `${attendanceValidated} students successfully certified and demonstrated proficiency.`,
        'All financial reconciliation orders completed with registrar.',
      ] : [],
      photos: [
        { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80', caption: 'Interactive Session', alt: 'Audience photo' }
      ],
      registrationDeadline: `2024-${String((i % 12) + 1).padStart(2, '0')}-05`,
      certificatesIssued: status === 'Cleared' || status === 'Approved',
    };
  }),
];

// Main Seed Function
async function seedFirestoreDatabase() {
  console.log('🚀 Starting CampusArchive Firestore Seed Process...');

  // 1. Seed Committees
  console.log(`📂 Seeding ${SEED_COMMITTEES.length} Committees...`);
  for (const committee of SEED_COMMITTEES) {
    await db.collection('committees').doc(committee.id).set(committee);
  }

  // 2. Seed Users
  console.log(`👤 Seeding ${SEED_USERS.length} Users across all roles...`);
  for (const user of SEED_USERS) {
    await db.collection('users').doc(user.uid).set(user);
  }

  // 3. Seed Events
  console.log(`📅 Seeding ${SEED_EVENTS.length} Events across all lifecycle statuses...`);
  for (const event of SEED_EVENTS) {
    await db.collection('events').doc(event.id).set(event);
  }

  console.log('✅ Firestore Database successfully populated with realistic institutional seed data!');
}

seedFirestoreDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error during Firestore seed:', err);
    process.exit(1);
  });
