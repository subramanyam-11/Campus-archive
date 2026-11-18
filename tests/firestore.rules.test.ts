import * as fs from 'fs';
import * as path from 'path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

async function runRulesTestSuite() {
  console.log('🧪 Starting Firestore Security Rules Unit Tests...\n');

  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'demo-rules-test',
    firestore: {
      rules,
      host: 'localhost',
      port: 8080,
    },
  });

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ FAIL: ${name}\n     ${msg}`);
      failed++;
    }
  }

  // Pre-seed test users into Firestore in the test environment
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await adminDb.doc('users/alice-student').set({ role: 'student', email: 'alice@college.edu' });
    await adminDb.doc('users/bob-head').set({ role: 'head', email: 'bob@college.edu', committeeIds: ['com-cse-09'] });
    await adminDb.doc('users/charlie-faculty').set({ role: 'faculty', email: 'charlie@college.edu' });
    await adminDb.doc('users/diana-principal').set({ role: 'principal', email: 'diana@college.edu' });
    await adminDb.doc('users/eva-iqac').set({ role: 'iqac', email: 'eva@college.edu' });
    
    // Seed committees
    await adminDb.doc('committees/com-cse-09').set({ code: 'COM-CSE-09', name: 'ACM Student Chapter' });
    await adminDb.doc('committees/com-stat-01').set({ code: 'COM-STAT-01', name: 'IQAC Cell' });

    // Seed test event in Approved state
    await adminDb.doc('events/evt-approved').set({
      title: 'Approved Hackathon',
      committeeCode: 'com-cse-09',
      status: 'Approved',
    });

    // Seed test event in Draft state
    await adminDb.doc('events/evt-draft').set({
      title: 'Draft Workshop',
      committeeCode: 'com-cse-09',
      status: 'Draft',
    });
  });

  // 1. Unauthenticated checks
  const unauthContext = testEnv.unauthenticatedContext();
  const unauthDb = unauthContext.firestore();

  await test('Unauthenticated user cannot read draft event', async () => {
    await assertFails(unauthDb.doc('events/evt-draft').get());
  });

  await test('Unauthenticated user cannot create event', async () => {
    await assertFails(unauthDb.doc('events/evt-new').set({ title: 'Hack', committeeCode: 'com-cse-09', status: 'Draft' }));
  });

  // 2. Student context checks
  const studentContext = testEnv.authenticatedContext('alice-student');
  const studentDb = studentContext.firestore();

  await test('Student can read approved events', async () => {
    await assertSucceeds(studentDb.doc('events/evt-approved').get());
  });

  await test('Student cannot read draft events', async () => {
    await assertFails(studentDb.doc('events/evt-draft').get());
  });

  await test('Student can enrol themselves into an event', async () => {
    await assertSucceeds(
      studentDb.doc('enrolments/enr-alice').set({
        eventId: 'evt-approved',
        userId: 'alice-student',
        status: 'Enrolled',
      })
    );
  });

  await test('Student cannot enrol on behalf of another user', async () => {
    await assertFails(
      studentDb.doc('enrolments/enr-fake').set({
        eventId: 'evt-approved',
        userId: 'bob-head',
        status: 'Enrolled',
      })
    );
  });

  await test('Student cannot self-elevate role to principal', async () => {
    await assertFails(studentDb.doc('users/alice-student').update({ role: 'principal' }));
  });

  // 3. Committee Head context checks
  const headContext = testEnv.authenticatedContext('bob-head');
  const headDb = headContext.firestore();

  await test('Committee Head can create new event in Pending state', async () => {
    await assertSucceeds(
      headDb.doc('events/evt-new-head').set({
        title: 'New Robotics Challenge',
        committeeCode: 'com-cse-09',
        status: 'Pending',
      })
    );
  });

  await test('Committee Head cannot self-approve event', async () => {
    await assertFails(
      headDb.doc('events/evt-draft').update({
        status: 'Approved',
      })
    );
  });

  // 4. Faculty context checks
  const facultyContext = testEnv.authenticatedContext('charlie-faculty');
  const facultyDb = facultyContext.firestore();

  await test('Faculty convener can approve event and set comments', async () => {
    await assertSucceeds(
      facultyDb.doc('events/evt-draft').update({
        status: 'Approved',
        facultyComments: 'Approved after curriculum compliance review.',
      })
    );
  });

  // 5. Admin / Principal context checks
  const adminContext = testEnv.authenticatedContext('diana-principal');
  const adminDb = adminContext.firestore();

  await test('Principal can create and modify statutory committees', async () => {
    await assertSucceeds(
      adminDb.doc('committees/com-new').set({
        name: 'AI Ethics Committee',
        categoryTag: 'Statutory Body',
      })
    );
  });

  await test('Principal can read audit logs', async () => {
    await assertSucceeds(adminDb.collection('audit_logs').get());
  });

  // 6. Committee Roster / Members Subcollection Checks
  await test('Signed-in student can read committee members', async () => {
    await assertSucceeds(studentDb.collection('committees/com-cse-09/members').get());
  });

  await test('Committee Head of A can add members to Committee A', async () => {
    await assertSucceeds(
      headDb.doc('committees/com-cse-09/members/member-1').set({
        name: 'Rohan Sharma',
        role: 'Chairperson',
        department: 'Computer Engineering',
        status: 'active',
      })
    );
  });

  await test('Committee Head of A CANNOT write members to Committee B (Cross-committee isolation)', async () => {
    await assertFails(
      headDb.doc('committees/com-stat-01/members/member-fake').set({
        name: 'Intruder',
        role: 'Member',
        department: 'Governance',
        status: 'active',
      })
    );
  });

  const iqacContext = testEnv.authenticatedContext('eva-iqac');
  const iqacDb = iqacContext.firestore();

  await test('IQAC coordinator can write members to any committee', async () => {
    await assertSucceeds(
      iqacDb.doc('committees/com-stat-01/members/member-iqac-1').set({
        name: 'Dr. Ramesh K. Sharma',
        role: 'Coordinator',
        department: 'Academic Directorate',
        status: 'active',
      })
    );
  });

  await test('Principal can delete committee members', async () => {
    await assertSucceeds(
      adminDb.doc('committees/com-cse-09/members/member-1').delete()
    );
  });

  // 7. Notifications Collection Checks
  await test('Unauthenticated user cannot read or list notifications', async () => {
    await assertFails(unauthDb.collection('notifications').get());
  });

  await test('Signed-in student can list their own notifications', async () => {
    await assertSucceeds(
      studentDb.collection('notifications').where('userId', '==', 'alice-student').get()
    );
  });

  await test('Signed-in student cannot list another user notifications', async () => {
    await assertFails(
      studentDb.collection('notifications').where('userId', '==', 'bob-head').get()
    );
  });

  await test('Admin can list notifications', async () => {
    await assertSucceeds(adminDb.collection('notifications').get());
  });

  await testEnv.cleanup();

  console.log(`\n========================================`);
  console.log(`Unit Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRulesTestSuite().catch((e) => {
  console.error('Error running rules unit test suite:', e);
  process.exit(1);
});
