import { describe, it } from 'node:test';
import assert from 'node:assert';
import { setUserRole } from '../src/setUserRole';
import { generateCertificatePdf } from '../src/generateCertificatePdf';
import { generateEventDossierPdf } from '../src/generateEventDossierPdf';

// Helper to construct test invocation requests
function createMockRequest<T>(data: T, auth: unknown = undefined) {
  return {
    data,
    auth,
    rawRequest: {} as any,
  } as any;
}

describe('Cloud Functions Unit Tests', () => {
  describe('setUserRole security rules & validation', () => {
    it('throws unauthenticated when request.auth is missing', async () => {
      await assert.rejects(
        async () => {
          await setUserRole.run(
            createMockRequest({ targetUid: 'user-123', role: 'student' }, undefined)
          );
        },
        {
          code: 'unauthenticated',
        }
      );
    });

    it('throws permission-denied when caller is a student', async () => {
      await assert.rejects(
        async () => {
          await setUserRole.run(
            createMockRequest(
              { targetUid: 'user-123', role: 'committee_head' },
              { uid: 'student-uid', token: { role: 'student' } }
            )
          );
        },
        {
          code: 'permission-denied',
        }
      );
    });

    it('throws invalid-argument when role is not a valid institutional role', async () => {
      await assert.rejects(
        async () => {
          await setUserRole.run(
            createMockRequest(
              { targetUid: 'user-123', role: 'hacker_role' },
              { uid: 'principal-uid', token: { role: 'principal' } }
            )
          );
        },
        {
          code: 'invalid-argument',
        }
      );
    });
  });

  describe('generateCertificatePdf validation', () => {
    it('rejects unauthenticated requests', async () => {
      await assert.rejects(
        async () => {
          await generateCertificatePdf.run(
            createMockRequest(
              { eventId: 'evt-1', studentPrn: '2021BTECS001', studentName: 'Test' },
              undefined
            )
          );
        },
        {
          code: 'unauthenticated',
        }
      );
    });

    it('rejects requests with missing required arguments', async () => {
      await assert.rejects(
        async () => {
          await generateCertificatePdf.run(
            createMockRequest(
              { eventId: '', studentPrn: '', studentName: '' },
              { uid: 'student-1', token: { role: 'student' } }
            )
          );
        },
        {
          code: 'invalid-argument',
        }
      );
    });
  });

  describe('generateEventDossierPdf validation', () => {
    it('rejects unauthenticated requests', async () => {
      await assert.rejects(
        async () => {
          await generateEventDossierPdf.run(
            createMockRequest({ eventId: 'evt-1' }, undefined)
          );
        },
        {
          code: 'unauthenticated',
        }
      );
    });

    it('rejects missing eventId', async () => {
      await assert.rejects(
        async () => {
          await generateEventDossierPdf.run(
            createMockRequest({ eventId: '' }, { uid: 'head-1', token: { role: 'committee_head' } })
          );
        },
        {
          code: 'invalid-argument',
        }
      );
    });
  });
});
