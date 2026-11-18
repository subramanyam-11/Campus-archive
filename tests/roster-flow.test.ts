import * as fs from 'fs';
import * as path from 'path';
import {
  INITIAL_COMMITTEES,
  getCommitteeRoster,
} from '../src/data/mockData';
import { RosterMemberSchema } from '../src/types';

async function runRosterFlowTestSuite() {
  console.log('🧪 Starting Committee Roster Flow Verification Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorDetail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${errorDetail ? `\n     ${errorDetail}` : ''}`);
      failed++;
    }
  }

  // 1. Data isolation: Rohan Sharma in ACM, NOT in IQAC
  const acmRoster = getCommitteeRoster('com-cse-09');
  const iqacRoster = getCommitteeRoster('com-stat-01');
  const nssRoster = getCommitteeRoster('com-stu-04');
  const ieeeRoster = getCommitteeRoster('com-tech-02');

  const rohanInAcm = acmRoster.some((m) => m.name.toLowerCase().includes('rohan sharma'));
  const rohanInIqac = iqacRoster.some((m) => m.name.toLowerCase().includes('rohan sharma'));
  const rohanInNss = nssRoster.some((m) => m.name.toLowerCase().includes('rohan sharma'));
  const rohanInIeee = ieeeRoster.some((m) => m.name.toLowerCase().includes('rohan sharma'));

  assert(rohanInAcm, 'Rohan Sharma is present in ACM Student Chapter roster');
  assert(!rohanInIqac, 'Rohan Sharma is NOT present in IQAC roster');
  assert(!rohanInNss, 'Rohan Sharma is NOT present in NSS roster');
  assert(!rohanInIeee, 'Rohan Sharma is NOT present in IEEE PES roster');

  // 2. All committees have distinct non-empty rosters for AY 2024–25
  const committeeIds = INITIAL_COMMITTEES.map((c) => c.id);
  assert(committeeIds.length >= 7, 'At least 7 collegiate committees registered');

  for (const c of INITIAL_COMMITTEES) {
    const year = c.status === 'active' ? 'AY 2024–25' : 'AY 2023–24';
    const roster = getCommitteeRoster(c.id, year);
    assert(
      roster.length > 0,
      `Committee ${c.id} (${c.status}) has ${year} roster members`,
      `Found ${roster.length} members`
    );
  }

  // 3. Historical Academic Year data is preserved (AY 2023–24)
  const acmHistorical = getCommitteeRoster('com-cse-09', 'AY 2023–24');
  assert(acmHistorical.length > 0, 'ACM has historical archive for AY 2023–24');

  // 4. Schema validation for RosterMember
  const validMember = {
    id: 'ros-test-1',
    committeeId: 'com-cse-09',
    name: 'Siddharth Verma',
    email: 'siddharth.v@institution.ac.in',
    prn: '2023BTECS00142',
    department: 'Computer Engineering',
    designation: 'Technical Lead',
    role: 'Technical Lead',
    tenureStart: '2024-07-01',
    tenureEnd: '2025-06-30',
    academicYear: 'AY 2024–25',
    status: 'active' as const,
  };

  const validParse = RosterMemberSchema.safeParse(validMember);
  assert(validParse.success, 'RosterMemberSchema validates a valid member object');

  const invalidMemberNoEmail = { ...validMember, email: 'not-an-email' };
  const invalidParse = RosterMemberSchema.safeParse(invalidMemberNoEmail);
  assert(!invalidParse.success, 'RosterMemberSchema rejects invalid institutional email');

  // 5. Sidebar code check: No standalone Roster navigation item
  const sidebarPath = path.resolve(__dirname, '../src/components/Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  assert(
    !sidebarContent.includes("{ view: 'roster'"),
    'Sidebar does NOT contain standalone Roster navigation item'
  );

  // 6. /roster redirect check
  const rosterPagePath = path.resolve(__dirname, '../app/(main)/roster/page.tsx');
  const rosterPageContent = fs.readFileSync(rosterPagePath, 'utf8');
  assert(
    rosterPageContent.includes("redirect('/committees')"),
    'app/(main)/roster/page.tsx redirects to /committees'
  );

  // 7. Header breadcrumbs check: No hardcoded ACM Student Chapter
  const headerPath = path.resolve(__dirname, '../src/components/Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  assert(
    !headerContent.includes("onClick={() => onNavigate('committee-detail')}>ACM Student Chapter</span>"),
    'Header does not contain hardcoded ACM Student Chapter span'
  );

  // 8. CommitteeDetailView check: Roster tab navigates to /committees/[id]/roster
  const detailPath = path.resolve(__dirname, '../src/views/CommitteeDetailView.tsx');
  const detailContent = fs.readFileSync(detailPath, 'utf8');
  assert(
    detailContent.includes('router.push(`/committees/${committee.id}/roster`)'),
    'CommitteeDetailView Roster tab routes to /committees/${committee.id}/roster'
  );

  // 9. Pagination Math check
  const calcTotalPages = (total: number, rowsPerPage: number) => Math.max(1, Math.ceil(total / rowsPerPage));
  assert(calcTotalPages(7, 9) === 1, 'Pagination: 7 items with 9/page gives 1 page');
  assert(calcTotalPages(10, 9) === 2, 'Pagination: 10 items with 9/page gives 2 pages');
  assert(calcTotalPages(28, 9) === 4, 'Pagination: 28 items with 9/page gives 4 pages');

  console.log(`\n========================================`);
  console.log(`Roster Flow Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRosterFlowTestSuite().catch((err) => {
  console.error('Test suite runtime error:', err);
  process.exit(1);
});
