import { Committee, EventItem, RosterMember, StagingItem, ArchiveRecord, UserPersona } from '../types';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'admin',
    name: 'Dr. R. K. Sharma',
    role: 'Faculty In-charge / Admin',
    department: 'Deanery of Student Affairs & Governance',
    badgeId: 'FAC-DIR-101',
    email: 'rk.sharma@institution.ac.in',
    avatarIcon: 'person'
  },
  {
    id: 'student-chair',
    name: 'Rohan Sharma',
    role: 'Student Chair (ACM & Tech Fest)',
    department: 'Dept of Computer Engineering',
    badgeId: 'STU-CHAIR-201',
    email: 'r.sharma.ce@institution.ac.in',
    avatarIcon: 'school'
  },
  {
    id: 'iqac-lead',
    name: 'Dr. Sunita Deshmukh',
    role: 'IQAC Member / Associate Professor',
    department: 'Dept of Computer Science',
    badgeId: 'FAC-IQAC-303',
    email: 's.deshmukh@institution.ac.in',
    avatarIcon: 'verified'
  },
  {
    id: 'principal',
    name: 'Dr. Arvind Joshi',
    role: 'Principal & Executive Sanction Authority',
    department: 'Office of the Principal',
    badgeId: 'EXE-PRIN-001',
    email: 'principal@institution.ac.in',
    avatarIcon: 'account_balance'
  }
];

export const INITIAL_COMMITTEES: Committee[] = [
  {
    id: 'com-cse-09',
    code: 'COM-CSE-09',
    name: 'ACM Student Chapter & Coding Club',
    categoryTag: 'Technical / CSE Department',
    categoryType: 'tech',
    department: 'Department of Computer Science & Engineering',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Sunita Deshmukh',
      designation: 'Associate Professor',
      signatureVerified: true,
      signatureUid: 'DSC-8921-2024'
    },
    activeMembersCount: 18,
    lastRevised: 'Rev. Aug 2024',
    charter: 'Foster algorithmic competence, promote collaborative software development, conduct annual hackathons, and maintain NAAC Criterion 3.3.2 compliance.',
    naacCriterion: 'NAAC Criterion 3.3.2 Linked',
    focusAreas: [
      { title: 'Competitive Coding', description: 'Weekly contests & peer mentoring on Codeforces & LeetCode' },
      { title: 'Open Source Labs', description: 'FOSS contribution cohorts and GitHub campus mentorship' },
      { title: 'Annual Hackathon', description: 'National flagship 48-hour hackathon for collegiate developers' }
    ],
    leadership: [
      { name: 'Rohan Sharma', role: 'Chairperson', prn: '2021BTECS00142', program: 'B.Tech Final Year CSE', initials: 'RS', clearanceVerified: true },
      { name: 'Ananya P. Patil', role: 'Vice-Chairperson', prn: '2022BTECS00088', program: 'B.Tech Third Year CSE', initials: 'AP', clearanceVerified: true },
      { name: 'Kartik Kulhari', role: 'Secretary / Treasurer', prn: '2021BTECS00045', program: 'B.Tech Final Year CSE', initials: 'KK', clearanceVerified: true }
    ],
    metrics: {
      approvedEvents: 8,
      footfall: 1420,
      sanctionedBudget: '₹ 1,85,000',
      budgetNumeric: 185000,
      utilizedBudget: '₹ 1,42,500',
      utilizedNumeric: 142500,
      utilizedPercent: 77,
      grantId: 'COM-24-90B'
    },
    documents: [
      { id: 'doc-1', title: 'ACM_Chapter_Bylaws_2024_Signed.pdf', size: '1.4 MB', date: 'Oct 2024', signedBy: 'Signed by Principal', type: 'PDF' },
      { id: 'doc-2', title: 'MoU_ACM_India_Council_Affiliation.pdf', size: '2.8 MB', date: 'Valid till 2026', signedBy: 'Council Legal Seal', type: 'PDF' },
      { id: 'doc-3', title: 'Annual_Executive_Tenure_Notification.pdf', size: '480 KB', date: 'Jul 2024', signedBy: 'Office of Registrar', type: 'PDF' },
      { id: 'doc-4', title: 'Lab_Allocation_Sanction_Order.pdf', size: '320 KB', date: 'Aug 2024', signedBy: 'Lab 402 Dedicated', type: 'PDF' }
    ]
  },
  {
    id: 'com-stat-01',
    code: 'COM-STAT-01',
    name: 'Internal Quality Assurance Cell (IQAC)',
    categoryTag: 'Statutory Body',
    categoryType: 'iqac',
    department: 'Academic Directorate & Governance',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Ramesh K. Sharma',
      designation: 'Director, IQAC & Dean Academic',
      signatureVerified: true,
      signatureUid: 'DSC-1002-2024'
    },
    activeMembersCount: 12,
    lastRevised: 'Rev. Jul 2024',
    charter: 'Sustain academic excellence, audit outcome-based education (OBE), and compile mandatory annual quality assurance reports (AQAR).',
    naacCriterion: 'NAAC Core Pillar 6',
    focusAreas: [
      { title: 'Curricular Alignment', description: 'Auditing course outcomes (CO) and program outcomes (PO)' },
      { title: 'Institutional Audits', description: 'Green, energy, and educational audit compliance' },
      { title: 'SSR Data Collation', description: 'Comprehensive metric validation for statutory accreditation' }
    ],
    leadership: [
      { name: 'Dr. Ramesh K. Sharma', role: 'Director / Chairperson', prn: 'FAC-DIR-101', program: 'Faculty Lead', initials: 'RS', clearanceVerified: true },
      { name: 'Prof. Anirudh Sen', role: 'Member Secretary', prn: 'FAC-SEC-012', program: 'Faculty Advisor', initials: 'AS', clearanceVerified: true }
    ],
    metrics: {
      approvedEvents: 14,
      footfall: 3200,
      sanctionedBudget: '₹ 3,20,000',
      budgetNumeric: 320000,
      utilizedBudget: '₹ 2,98,000',
      utilizedNumeric: 298000,
      utilizedPercent: 93,
      grantId: 'COM-STAT-IQAC'
    },
    documents: [
      { id: 'doc-iqac-1', title: 'IQAC_Charter_and_Bylaws_Approved.pdf', size: '2.1 MB', date: 'Jul 2024', signedBy: 'Director IQAC', type: 'PDF' },
      { id: 'doc-iqac-2', title: 'Annual_Quality_Assurance_Report_2023-24.pdf', size: '4.8 MB', date: 'Aug 2024', signedBy: 'Dean Academic', type: 'PDF' }
    ]
  },
  {
    id: 'com-stu-04',
    code: 'COM-STU-04',
    name: 'Central NSS Unit & Social Outreach',
    categoryTag: 'Student Affairs',
    categoryType: 'outreach',
    department: 'Student Affairs Council',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Vikrant Patil',
      designation: 'Programme Coordinator',
      signatureVerified: true,
      signatureUid: 'DSC-NSS-4412'
    },
    activeMembersCount: 45,
    lastRevised: 'Rev. Jun 2024',
    charter: 'Empower student volunteers through rural community empowerment, environmental stewardship, and village sanitation camps.',
    naacCriterion: 'NAAC Criterion 3.4 Extension Activities',
    focusAreas: [
      { title: 'Rural Camp', description: '7-day annual village adoption and development camp' },
      { title: 'Health & Blood Drives', description: 'Quarterly campus-wide voluntary donor registration' },
      { title: 'Swachhata Pakhwada', description: 'Bi-annual clean water and sanitation awareness drives' }
    ],
    leadership: [
      { name: 'Siddheshwar Roy', role: 'Student Volunteer Lead', prn: '2022BTEME00041', program: 'B.Tech Third Year Mechanical', initials: 'SR', clearanceVerified: true },
      { name: 'Megha Nair', role: 'Documentation Lead', prn: '2023BTEEE00019', program: 'B.Tech Second Year EEE', initials: 'MN', clearanceVerified: true }
    ],
    metrics: {
      approvedEvents: 24,
      footfall: 4100,
      sanctionedBudget: '₹ 1,20,000',
      budgetNumeric: 120000,
      utilizedBudget: '₹ 1,15,200',
      utilizedNumeric: 115200,
      utilizedPercent: 96,
      grantId: 'CSR-NSS-2024'
    },
    documents: [
      { id: 'doc-nss-1', title: 'NSS_State_Government_Sanction_2024.pdf', size: '1.9 MB', date: 'Jun 2024', signedBy: 'State Liaison Officer', type: 'PDF' }
    ]
  },
  {
    id: 'com-eee-03',
    code: 'COM-EEE-03',
    name: 'IEEE PES & Industrial Electronics',
    categoryTag: 'Technical / EEE',
    categoryType: 'tech',
    department: 'Department of Electrical & Electronics Engineering',
    status: 'active',
    facultyInCharge: {
      name: 'Prof. V. Ramanathan',
      designation: 'Professor & Chapter Advisor',
      signatureVerified: true,
      signatureUid: 'DSC-EEE-9081'
    },
    activeMembersCount: 24,
    lastRevised: 'Rev. Sep 2024',
    charter: 'Advance sustainable energy research, power system simulations, and industrial automation standards among undergraduates.',
    naacCriterion: 'NAAC Criterion 3.3.2 Industry Engagement',
    focusAreas: [
      { title: 'Renewable Microgrids', description: 'Hands-on solar PV testbeds and battery storage research' },
      { title: 'Industrial Visits', description: 'Substation and smart grid operations field exposure' },
      { title: 'IEEE Conferences', description: 'Sponsoring peer-reviewed student paper presentations' }
    ],
    leadership: [
      { name: 'Ananya Iyer', role: 'Student Chair', prn: '2021BTEEE00012', program: 'B.Tech Final Year EEE', initials: 'AI', clearanceVerified: true }
    ],
    metrics: {
      approvedEvents: 14,
      footfall: 1980,
      sanctionedBudget: '₹ 1,90,000',
      budgetNumeric: 190000,
      utilizedBudget: '₹ 1,90,000',
      utilizedNumeric: 190000,
      utilizedPercent: 100,
      grantId: 'IEEE-PES-2024'
    },
    documents: [
      { id: 'doc-pes-1', title: 'IEEE_PES_Global_Chapter_Roster_Charter.pdf', size: '2.4 MB', date: 'Sep 2024', signedBy: 'IEEE India Council', type: 'PDF' }
    ]
  },
  {
    id: 'com-mech-07',
    code: 'COM-MECH-07',
    name: 'Robotics & Automation Guild (RoboForge)',
    categoryTag: 'Departmental / Mech',
    categoryType: 'tech',
    department: 'Department of Mechatronics & Mechanical',
    status: 'active',
    facultyInCharge: {
      name: 'Prof. N. Joshi',
      designation: 'Associate Professor',
      signatureVerified: true,
      signatureUid: 'DSC-MEC-3110'
    },
    activeMembersCount: 20,
    lastRevised: 'Rev. Oct 2024',
    charter: 'Design competitive combat robots, autonomous wheeled rovers, and industrial pneumatic fixtures for national tournaments.',
    naacCriterion: 'NAAC Metric 5.3 Student Competitions',
    focusAreas: [
      { title: 'Combat Robotics', description: '30kg and 15kg robot battle arena fabrication' },
      { title: 'Line Following & ROS', description: 'SLAM mapping using LiDAR and Raspberry Pi' },
      { title: 'RoboForge Hackathon', description: '48-hour hardware sprint with 3D printer farms' }
    ],
    leadership: [
      { name: 'Tanmay Saxena', role: 'Captain', prn: '2021BTEME00099', program: 'B.Tech Final Year Mech', initials: 'TS', clearanceVerified: true }
    ],
    metrics: {
      approvedEvents: 12,
      footfall: 2800,
      sanctionedBudget: '₹ 2,80,000',
      budgetNumeric: 280000,
      utilizedBudget: '₹ 2,57,600',
      utilizedNumeric: 257600,
      utilizedPercent: 92,
      grantId: 'MECH-ROBO-2024'
    },
    documents: [
      { id: 'doc-rf-1', title: 'RoboForge_Sanction_and_Photos.zip', size: '24.8 MB', date: 'Oct 2024', signedBy: 'Dean Academic', type: 'ZIP' }
    ]
  },
  {
    id: 'com-gov-02',
    code: 'COM-GOV-02',
    name: 'Collegiate Grievance Redressal Committee',
    categoryTag: 'Administrative',
    categoryType: 'admin',
    department: 'Institute Statutory Compliance',
    status: 'active',
    facultyInCharge: {
      name: 'Dr. Anita Iyer',
      designation: 'Professor & Ombudsperson',
      signatureVerified: true,
      signatureUid: 'DSC-GOV-0092'
    },
    activeMembersCount: 8,
    lastRevised: 'Rev. Jan 2024',
    charter: 'Provide a transparent, confidential, and time-bound mechanism for redressing student and staff grievances in compliance with UGC/AICTE norms.',
    naacCriterion: 'NAAC Criterion 5.1.5',
    focusAreas: [
      { title: 'Portal Dispatches', description: 'Maintaining 72-hour acknowledgment SLA on submissions' },
      { title: 'Mediation Councils', description: 'Quarterly review meetings with student representatives' }
    ],
    leadership: [
      { name: 'Dr. Anita Iyer', role: 'Chairperson', prn: 'FAC-OMB-002', program: 'Faculty Ombudsman', initials: 'AI', clearanceVerified: true }
    ],
    metrics: {
      approvedEvents: 4,
      footfall: 350,
      sanctionedBudget: '₹ 50,000',
      budgetNumeric: 50000,
      utilizedBudget: '₹ 42,000',
      utilizedNumeric: 42000,
      utilizedPercent: 84,
      grantId: 'UGC-GOV-2024'
    },
    documents: [
      { id: 'doc-gov-1', title: 'UGC_Statutory_Grievance_Gazette_Notification.pdf', size: '1.1 MB', date: 'Jan 2024', signedBy: 'Registrar', type: 'PDF' }
    ]
  },
  {
    id: 'com-arch-01',
    code: 'COM-ARCH-01',
    name: 'Annual Tech Fest Steering Committee 2023–24',
    categoryTag: 'Ad-hoc Annual',
    categoryType: 'cultural',
    department: 'General Administration',
    status: 'archived',
    facultyInCharge: {
      name: 'Prof. S. Adhikari',
      designation: 'Associate Professor',
      signatureVerified: true,
      signatureUid: 'DSC-TF23-7761'
    },
    activeMembersCount: 32,
    lastRevised: 'Term Concluded',
    charter: 'Organize central technical festival of the institute with over 4,000 inter-collegiate participants.',
    naacCriterion: 'NAAC Metric 5.3.2',
    focusAreas: [
      { title: 'Operations', description: 'Stage setup, judge hospitality, registration coordination' }
    ],
    leadership: [
      { name: 'Siddharth Verma', role: 'Secretary', prn: '2021BTECS00210', program: 'Graduated', initials: 'SV', clearanceVerified: true }
    ],
    metrics: {
      approvedEvents: 18,
      footfall: 4200,
      sanctionedBudget: '₹ 4,50,000',
      budgetNumeric: 450000,
      utilizedBudget: '₹ 4,49,200',
      utilizedNumeric: 449200,
      utilizedPercent: 99.8,
      grantId: 'TF-2023-ARCH'
    },
    documents: [
      { id: 'doc-tf-1', title: 'Tech_Fest_2023_Final_Audited_Accounts.pdf', size: '3.6 MB', date: 'Apr 2024', signedBy: 'Finance Officer', type: 'PDF' }
    ]
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-2024-089',
    code: 'EV-8902',
    refNo: 'CCEAS/ENGG/2024/089-R',
    title: 'National Symposium on Renewable Energy',
    committee: 'IEEE PES Student Chapter',
    committeeCode: 'COM-EEE-03',
    department: 'Department of Electrical & Electronics Engineering',
    convener: 'Dr. V. Nair',
    category: 'National Symposium',
    categoryType: 'symposium',
    dateStr: '18 Oct 2024',
    rawDate: '2024-10-18',
    venue: 'Auditorium A (Capacity: 450)',
    budgetSanctioned: 85000,
    budgetUtilized: 81420,
    utilizationNote: 'Utilized: 92%',
    status: 'Approved',
    naacCategory: 'NAAC Category 3.3.2',
    objective: 'Foster industry-academia knowledge exchange on solar PV grid integration and microgrid storage topologies.',
    targetDelegates: '250 Delegates Cap (UG / PG Researchers & Faculty Members)',
    attendanceValidated: 238,
    attendanceTarget: 250,
    attendanceTurnoutPercent: 95.2,
    surplusReturned: 3580,
    timeline: [
      { step: '1. Proposal Submission', date: '12 Oct 2024', actor: 'Ananya Iyer (Student Chair)', remarks: 'Initial draft uploaded with faculty endorsement.', cleared: true },
      { step: '2. Faculty Advisor Academic Review', date: '13 Oct 2024', actor: 'Prof. V. Ramanathan', remarks: '“Budget thoroughly vetted and within departmental cap.”', cleared: true },
      { step: '3. HOD Endorsement', date: '14 Oct 2024', actor: 'Dr. Meenakshi Sundaram (Head, Dept of EEE)', remarks: 'Forwarded with recommendation for R&D funding.', cleared: true },
      { step: '4. IQAC Accreditation Clearance', date: '15 Oct 2024', actor: 'Dr. Ramesh K. Sharma (Director, IQAC)', remarks: '“Maps to NAAC Metric 3.3.2.”', cleared: true },
      { step: '5. Principal Executive Sanction', date: '16 Oct 2024', actor: 'Dr. Arvind Joshi (Principal)', remarks: 'Full expenditure release authorized.', cleared: true }
    ],
    outcomesAtr: [
      'Keynote addressed by Director, Ministry of New and Renewable Energy (MNRE).',
      '14 student research papers presented across 3 parallel peer-reviewed tracks.',
      '2 industry internship slots secured with Suzlon Energy Grid Division.'
    ],
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfXaGF186tMAgaPazTqaH0XSpMR1FYf1uDd1p1jAwXXuSyy1LV-KfPbcbNzwJ28q2fL4McbUDLa9NJqKsILLwEbZwA1dshkx_zIMNvdnSrjI1hGi6QMGbby4j1i7JfAFPZHrFGTlurC26MLhlcuefJo6_WO_tWVGwzUR1yGVGZrK6bwiZr2_JGNU4pUmp3TJ6-a0NhVT7ya0EmD4W3B9gIv__93tSjFHxASALGZLki3b7XUQ53156AxA',
        caption: 'Keynote address',
        alt: 'Keynote speaker delivering a technical presentation on solar photovoltaic integration at an academic podium in a large lecture auditorium with delegates seated in tiered rows.'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwBlyvQ-NWM6AWWnRpAO5RHw_iKk5RsMA0DUArkbxRxgexICAQhgtIwaXxOS3ILcwviKeI85QEg7u6YAeEB9OahXBG53hEfHGWsjaUB69DUN5qvLpaPi2Igqpw1GFkDczPONYHjH_9t2wHEj1kZSIsSkNmd4tKWZqUfKKQWNwtC2Z8x_4FJVllrzE18I309BBkCJZn7Wj26qHDkrvJugV32W9lGwUBImPYLW9zYGUDq5xmfsw5Ma96CQ',
        caption: 'Hands-on hardware demo',
        alt: 'Engineering researchers and students gathered around a laboratory test bench conducting hands-on hardware demonstration of solar inverters.'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqK8UvWxukuX34URPOYeWydB1VvUZi_3ff8Wl-wWtFX8JLEiKfKJmvGn3tR1I04BFmP24PoVaQvE8socUr_jI3xcYiOAz6mmabN1bJKlVna4QOkP0X4FwoTPQeeaPvKfsmdMZ6TODl7ou5BN2I9c7hjLB2kQW5p5DP1lU3_EBfxs9Fa7ox1dS_NsN-vvt0FkVfW9ragFCOhOSckpkoRCs6qTyv6XESGiUEXnqs3mIwAAyA1oR_p4f_RA',
        caption: 'Panel Q&A',
        alt: 'A panel of five academic professors and clean energy industry delegates seated on stage discussing questions during an interactive question and answer session.'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9PZ1xqbjp1BWBOOlUQyloPVlQZqZIFCW9RRlRnrcDrxDQG1NrjX5B69EplzwwhoUVRbJQCAfN87XYlk4KfeBMODX2oPDPfCt7gno2Okn3q01wJrbLP6ZeUflCI3fWjd3dXrHABtF_PeaWjXr04ijneVDdD3WEznaCsVCyFV6ZnO9zRTrMhTAWThRxqH3k0ORTIb1EOAzZwiZ4QFEB4-eYptCrNvR2nbYGx2VokSw0P4ntKxoaKAyJag',
        caption: 'Valedictory session',
        alt: 'Formal valedictory ceremony on auditorium stage with faculty presenting commemorative certificates and awards to student winners.'
      }
    ],
    dossierPdfUrl: 'dossier-evt-2024-089.pdf'
  },
  {
    id: 'evt-2024-091',
    code: 'EV-8914',
    refNo: 'CCEAS/MECH/2024/091-R',
    title: 'Autonomous Robotics Hackathon (RoboForge)',
    committee: 'Mechatronics Club',
    committeeCode: 'COM-MECH-07',
    department: 'Dept of Mechatronics',
    convener: 'Prof. A. Deshmukh',
    category: 'Hackathon',
    categoryType: 'hackathon',
    dateStr: '24 Oct 2024',
    rawDate: '2024-10-24',
    venue: 'Robotics Lab & MakerSpace',
    budgetSanctioned: 210000,
    budgetUtilized: 182000,
    utilizationNote: 'Under Finance Review',
    status: 'Pending',
    naacCategory: 'NAAC Criterion 5.3',
    objective: '48-hour inter-collegiate coding and hardware hackathon for autonomous robots and IoT devices.',
    targetDelegates: '180 participants across 45 teams',
    attendanceValidated: 176,
    attendanceTarget: 180,
    attendanceTurnoutPercent: 97.8,
    surplusReturned: 28000,
    timeline: [
      { step: '1. Proposal Submission', date: '18 Oct 2024', actor: 'Tanmay Saxena (Club Lead)', remarks: 'Includes quotation for sensor modules and 3D filaments.', cleared: true },
      { step: '2. Faculty Advisor Academic Review', date: '20 Oct 2024', actor: 'Prof. A. Deshmukh', remarks: '“Lab safety and battery guidelines validated.”', cleared: true },
      { step: '3. Finance Review & Directorate Approval', date: '21 Oct 2024', actor: 'Finance Directorate', remarks: 'Vetting invoice reconciliations.', cleared: false }
    ],
    outcomesAtr: [
      '38 working hardware prototypes submitted.',
      'Top 3 teams incubated with hardware grants.'
    ],
    photos: []
  },
  {
    id: 'evt-2024-077',
    code: 'EV-8877',
    refNo: 'CCEAS/STU/2024/077-R',
    title: 'Gram Swachhata Rural Outreach Camp',
    committee: 'Central NSS Unit',
    committeeCode: 'COM-STU-04',
    department: 'Student Affairs Council',
    convener: 'Dr. P. Joshi',
    category: 'Community Outreach',
    categoryType: 'outreach',
    dateStr: '02–04 Oct 2024',
    rawDate: '2024-10-02',
    venue: 'Village Khardi (Taluka Zone 3)',
    budgetSanctioned: 35000,
    budgetUtilized: 31200,
    utilizationNote: 'Allocated (CSR Grants)',
    status: 'Draft',
    naacCategory: 'NAAC Metric 3.4.1',
    objective: 'Village sanitation survey, water testing, and secondary school computer literacy drive.',
    targetDelegates: '80 Volunteers',
    attendanceValidated: 82,
    attendanceTarget: 80,
    attendanceTurnoutPercent: 100,
    surplusReturned: 3800,
    timeline: [
      { step: '1. Proposal Draft Prepared', date: '28 Sep 2024', actor: 'Dr. P. Joshi', remarks: 'Awaiting local Sarpanch permission letter.', cleared: true }
    ],
    outcomesAtr: [
      'Sanitation reports presented to Taluka Block Development Officer.'
    ],
    photos: []
  },
  {
    id: 'evt-2024-040',
    code: 'EV-8840',
    refNo: 'CCEAS/EE/2024/040-R',
    title: 'Industry 4.0 PLC & SCADA Hands-on',
    committee: 'Dept of Electrical Engg',
    committeeCode: 'COM-EEE-03',
    department: 'Department of Electrical Engineering',
    convener: 'Er. S. Kulkarni',
    category: 'Value-Added Course',
    categoryType: 'course',
    dateStr: '15–28 Sep 2024',
    rawDate: '2024-09-15',
    venue: 'Automation Lab 2 (EE Wing)',
    budgetSanctioned: 45000,
    budgetUtilized: 45000,
    utilizationNote: 'Utilized: 100%',
    status: 'Approved',
    naacCategory: 'NAAC Metric 1.3.2',
    objective: 'Two-week certificate course for final year students on Siemens S7-1200 PLC and Wonderware SCADA.',
    targetDelegates: '60 Students',
    attendanceValidated: 58,
    attendanceTarget: 60,
    attendanceTurnoutPercent: 96.6,
    surplusReturned: 0,
    timeline: [
      { step: '1. Proposal Submitted', date: '01 Sep 2024', actor: 'Er. S. Kulkarni', cleared: true },
      { step: '2. BOS Curriculum Approval', date: '04 Sep 2024', actor: 'Academic Council', cleared: true },
      { step: '3. Principal Sanction', date: '08 Sep 2024', actor: 'Dr. Arvind Joshi', cleared: true }
    ],
    outcomesAtr: [
      '58 students certified with industrial PLC competencies.'
    ],
    photos: []
  },
  {
    id: 'evt-2024-022',
    code: 'EV-8822',
    refNo: 'CCEAS/ALU/2024/022-R',
    title: 'Annual Alumni Networking Conclave',
    committee: 'Alumni Relations Cell',
    committeeCode: 'COM-ALU-01',
    department: 'Alumni Relations Cell',
    convener: 'Prof. M. Bannerjee',
    category: 'Conclave',
    categoryType: 'conclave',
    dateStr: '12 Oct 2024',
    rawDate: '2024-10-12',
    venue: 'Main Hall & Banquet Lawns',
    budgetSanctioned: 150000,
    budgetUtilized: 147500,
    utilizationNote: 'Bills Pending Audit',
    status: 'Overdue (ATR Pending)',
    naacCategory: 'NAAC Metric 5.4.1',
    objective: 'Reconnect with 300+ alumni, felicitate distinguished graduates, and raise endowment pledges.',
    targetDelegates: '350 Attendees',
    attendanceValidated: 312,
    attendanceTarget: 350,
    attendanceTurnoutPercent: 89.1,
    surplusReturned: 2500,
    timeline: [
      { step: '1. Event Completed', date: '12 Oct 2024', actor: 'Prof. M. Bannerjee', cleared: true },
      { step: '2. ATR & Utilization Notice', date: '19 Oct 2024', actor: 'Registrar Directorate', remarks: 'Overdue > 14 days. Formal compliance reminder dispatched.', cleared: false }
    ],
    outcomesAtr: [
      '₹ 12 Lakhs pledged towards campus innovation seed fund.'
    ],
    photos: []
  },
  {
    id: 'evt-2024-031',
    code: 'EV-8931',
    refNo: 'CCEAS/IEEE/2024/031-R',
    title: 'Women in Tech Leadership Summit',
    committee: 'IEEE WIE Affinity Group',
    committeeCode: 'COM-IEEE-04',
    department: 'IEEE Student Branch',
    convener: 'Dr. Kavita Rao',
    category: 'Panel & Keynote',
    categoryType: 'conclave',
    dateStr: '29 Oct 2024',
    rawDate: '2024-10-29',
    venue: 'Conclave Hall (Seminar Block)',
    budgetSanctioned: 60000,
    budgetUtilized: 52800,
    utilizationNote: 'Utilized: 88%',
    status: 'Approved',
    naacCategory: 'NAAC Criterion 5.3',
    objective: 'Keynote panels from female engineering executives from Google, Intel, and ISRO.',
    targetDelegates: '200 Attendees',
    attendanceValidated: 194,
    attendanceTarget: 200,
    attendanceTurnoutPercent: 97.0,
    surplusReturned: 7200,
    timeline: [
      { step: 'Sanction Cleared', date: '15 Oct 2024', actor: 'Principal', cleared: true }
    ],
    outcomesAtr: [
      '20 female students connected with industry mentors.'
    ],
    photos: []
  },
  {
    id: 'evt-2024-098',
    code: 'EV-8798',
    refNo: 'CCEAS/YRC/2024/098-R',
    title: 'Mega Blood Donation Drive',
    committee: 'Red Cross Youth Wing',
    committeeCode: 'COM-YRC-01',
    department: 'Student Affairs',
    convener: 'Dr. H. Sen',
    category: 'Social Service',
    categoryType: 'social',
    dateStr: '11 Sep 2024',
    rawDate: '2024-09-11',
    venue: 'Sports Complex Gymnasium',
    budgetSanctioned: 25000,
    budgetUtilized: 25000,
    utilizationNote: 'Utilized: 100% (Audited)',
    status: 'Approved',
    naacCategory: 'NAAC Metric 3.4.2',
    objective: 'Voluntary blood donation camp in collaboration with District Civil Hospital Blood Bank.',
    targetDelegates: '400 Donors',
    attendanceValidated: 428,
    attendanceTarget: 400,
    attendanceTurnoutPercent: 100,
    surplusReturned: 0,
    timeline: [
      { step: 'Audited & Completed', date: '15 Sep 2024', actor: 'Civil Hospital Liaison', cleared: true }
    ],
    outcomesAtr: [
      '428 units of blood collected and certified.'
    ],
    photos: []
  },
  {
    id: 'evt-2024-055',
    code: 'EV-8955',
    refNo: 'CCEAS/ACM/2024/055-R',
    title: 'Inter-Collegiate Hackathon 2024',
    committee: 'ACM Student Chapter',
    committeeCode: 'COM-CSE-09',
    department: 'Dept of Computer Science',
    convener: 'Dr. M. Gokhale',
    category: 'Hackathon',
    categoryType: 'hackathon',
    dateStr: '15 Nov 2024',
    rawDate: '2024-11-15',
    venue: 'Main CS Computing Cluster',
    budgetSanctioned: 180000,
    budgetUtilized: 0,
    utilizationNote: 'Under Statutory Review',
    status: 'Pending',
    naacCategory: 'NAAC Metric 3.3.2',
    objective: '36-hour code sprint focusing on AI agent systems and decentralized web infrastructure.',
    targetDelegates: '240 Developers',
    attendanceValidated: 0,
    attendanceTarget: 240,
    attendanceTurnoutPercent: 0,
    surplusReturned: 0,
    timeline: [
      { step: '1. Proposal Submitted', date: '20 Oct 2024', actor: 'Rohan Sharma', cleared: true },
      { step: '2. Faculty Vetting', date: '23 Oct 2024', actor: 'Dr. Sunita Deshmukh', cleared: true },
      { step: '3. Finance Sanction Pending', date: '25 Oct 2024', actor: 'Finance Office', cleared: false }
    ],
    outcomesAtr: [],
    photos: []
  }
];

export const INITIAL_ROSTER: RosterMember[] = [
  {
    id: 'ros-1',
    name: 'Rohan Sharma',
    email: 'r.sharma.ce@institution.ac.in',
    prn: '2021BTECS00142',
    department: 'Computer Engineering',
    role: 'Chairperson',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Active',
    initials: 'RS'
  },
  {
    id: 'ros-2',
    name: 'Ananya P. Patil',
    email: 'a.patil.ce@institution.ac.in',
    prn: '2022BTECS00088',
    department: 'Computer Engineering',
    role: 'Vice-Chairperson',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Active',
    initials: 'AP'
  },
  {
    id: 'ros-3',
    name: 'Kartik Kulhari',
    email: 'k.kulhari.ce@institution.ac.in',
    prn: '2021BTECS00045',
    department: 'Computer Engineering',
    role: 'Treasurer',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Active',
    initials: 'KK'
  },
  {
    id: 'ros-4',
    name: 'Siddharth Verma',
    email: 's.verma.it@institution.ac.in',
    prn: '2022BTECS00210',
    department: 'IT & Software',
    role: 'Technical Lead',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Active',
    initials: 'SV'
  },
  {
    id: 'ros-5',
    name: 'Priya Nair',
    email: 'p.nair.etc@institution.ac.in',
    prn: '2023BTECS00015',
    department: 'Electronics & Telecom',
    role: 'Events Coordinator',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Invited',
    initials: 'PN'
  },
  {
    id: 'ros-6',
    name: 'Tanvi Kulkarni',
    email: 't.kulkarni.mech@institution.ac.in',
    prn: '2023BTECS00094',
    department: 'Mechanical Engg',
    role: 'Documentation Deputy',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Active',
    initials: 'TK'
  },
  {
    id: 'ros-7',
    name: 'Aman Qureshi',
    email: 'a.qureshi.ce@institution.ac.in',
    prn: '2022BTECS00178',
    department: 'Computer Engineering',
    role: 'Logistics Lead',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Active',
    initials: 'AQ'
  },
  {
    id: 'ros-8',
    name: 'Devika Sen',
    email: 'd.sen.as@institution.ac.in',
    prn: '2024BTECS00003',
    department: 'Applied Sciences',
    role: 'Junior Executive',
    tenure: 'Jul 2024 – Jun 2025',
    status: 'Invited',
    initials: 'DS'
  }
];

export const INITIAL_STAGING_ITEMS: StagingItem[] = [
  {
    id: 'stg-1',
    fileName: 'RoboForge_Sanction_and_Photos.zip',
    innerDocsCount: '14 inner docs (4 PDFs, 10 JPEGs)',
    detectedCommittee: 'Robotics & Automation Guild',
    academicYear: 'AY 2023–24',
    recordTitle: 'RoboForge National Hackathon 2023',
    size: '24.8 MB / ZIP',
    type: 'ZIP',
    status: 'Auto-Mapped',
    confidence: 'High (94%)',
    selected: true,
    notes: 'Auto-mapped via Dean approval letterhead'
  },
  {
    id: 'stg-2',
    fileName: 'NSS_Camp_Village_Activity_Report.pdf',
    innerDocsCount: 'Signed Document (38 Pages + Geotags)',
    detectedCommittee: 'Central NSS Unit',
    academicYear: 'AY 2023–24',
    recordTitle: 'Rural Swachhata Outreach 2023',
    size: '12.4 MB / PDF',
    type: 'PDF',
    status: 'Auto-Mapped',
    confidence: 'High (98%)',
    selected: true,
    notes: 'Verified against State NSS office circular'
  },
  {
    id: 'stg-3',
    fileName: 'PES_Colloquium_Scan_Flyer_Draft.pdf',
    innerDocsCount: 'Partial OCR: Low confidence on academic year',
    detectedCommittee: 'IEEE PES Student Chapter',
    academicYear: 'AY 2023–24',
    recordTitle: 'Renewable Energy Colloquium & Panel',
    size: '8.2 MB / PDF',
    type: 'PDF',
    status: 'Needs Review',
    confidence: 'Medium (76%)',
    selected: true,
    notes: 'Low OCR confidence on footer academic date'
  }
];

export const ARCHIVE_RECORDS: ArchiveRecord[] = [
  {
    id: 'arc-1',
    type: 'EVENT ARCHIVE',
    academicYear: 'AY 2024–25',
    committee: 'Mechatronics & Robotics Guild',
    title: 'Autonomous Robotics Hackathon (RoboForge 2024)',
    snippet: '...48-hour inter-collegiate coding and hardware hackathon. Sanctioned budget ₹ 2,10,000 under NAAC Criterion 5.3 with key participation from premier institutes...',
    dateOrUploadDate: '24 Oct 2024',
    refOrId: 'MRG-2024-EV-09',
    statusTag: 'Pending Review',
    tagType: 'red',
    filesCount: 3
  },
  {
    id: 'arc-2',
    type: 'COMMITTEE DOCUMENT',
    academicYear: 'AY 2023–24',
    committee: 'ACM Student Chapter',
    title: 'Hackathon Standard Operating Procedure (SOP) & Rulebook v2.pdf',
    snippet: '...guidelines for team registrations, code plagiarism checks via MOSS, and faculty jury evaluation rubrics used for university-sanctioned hackathon events and symposiums...',
    dateOrUploadDate: 'Uploaded 14 Aug 2023',
    authorOrChair: 'Dr. S. Deshmukh',
    refOrId: 'SOP-ACM-02',
    size: '1.8 MB',
    hash: 'SHA: 8e41a...c72',
    statusTag: 'Verified Audit Log',
    tagType: 'green'
  },
  {
    id: 'arc-3',
    type: 'COMMITTEE ROSTER',
    academicYear: 'AY 2024–25',
    committee: 'Annual Tech Fest Steering Committee',
    title: 'Tech Fest Hackathon Track Sub-Committee Roster',
    snippet: '...appointed student coordinators: Rohan Sharma (Lead), Siddharth Verma (Platform Admin), with faculty oversight under the institutional tech festival hackathon division...',
    dateOrUploadDate: 'Term: Jul 2024 – Jun 2025',
    refOrId: 'Office Order #CC-24/098',
    statusTag: 'Active',
    tagType: 'green'
  },
  {
    id: 'arc-4',
    type: 'ACTION TAKEN REPORT',
    academicYear: 'AY 2023–24',
    committee: 'Dept of Computer Science',
    title: 'Post-Event Outcome Report: Winter Code Sprint & Hackathon',
    snippet: '...184 participants across 46 teams. 12 open source repositories submitted. Total budget utilized ₹ 1,42,000 against sanctions during the university-level code sprint and hackathon...',
    dateOrUploadDate: 'Archived on 11 Jan 2024',
    authorOrChair: 'Dean Academic',
    refOrId: 'ATR-CS-2024-02',
    hash: 'SHA-256 Validated',
    statusTag: 'NAAC Metric 3.2.2 Validated',
    tagType: 'green'
  },
  {
    id: 'arc-5',
    type: 'MINUTES OF MEETING',
    academicYear: 'AY 2024–25',
    committee: 'Internal Quality Assurance Cell (IQAC)',
    title: 'IQAC Agenda 4.1: Endorsement of Hackathon Innovation Outcomes & Seed Grants',
    snippet: '...resolved that the top 3 projects from the inter-collegiate hackathon be forwarded to the Technology Incubation Hub with provisional grants of ₹ 50,000 each...',
    dateOrUploadDate: 'Meeting Date: 02 Nov 2024',
    authorOrChair: 'Chaired by Director',
    refOrId: 'MoM-IQAC-24-11',
    statusTag: 'Confirmed',
    tagType: 'blue'
  }
];
