import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { auth, db } from './admin';

interface SetRoleRequest {
  targetUid: string;
  role: 'principal' | 'iqac_coordinator' | 'faculty_convener' | 'committee_head' | 'student';
}

const VALID_ROLES = ['principal', 'iqac_coordinator', 'faculty_convener', 'committee_head', 'student'];

export const setUserRole = onCall<SetRoleRequest>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const callerRole = request.auth.token.role;
  const isSuperAdmin =
    callerRole === 'principal' || callerRole === 'iqac_coordinator' || callerRole === 'admin';

  if (!isSuperAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Only Principal or IQAC Coordinator can update user institutional roles.'
    );
  }

  const { targetUid, role } = request.data;

  if (!targetUid || !role) {
    throw new HttpsError('invalid-argument', 'Missing targetUid or role.');
  }

  if (!VALID_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`);
  }

  // Set Firebase Custom Claims
  await auth.setCustomUserClaims(targetUid, { role });

  // Update Firestore user document
  const userRef = db.collection('users').doc(targetUid);
  await userRef.set(
    {
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid,
    },
    { merge: true }
  );

  // Write audit log
  await db.collection('audit_logs').add({
    action: 'SET_USER_ROLE',
    targetUid,
    assignedRole: role,
    performedBy: request.auth.uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    targetUid,
    role,
  };
});
