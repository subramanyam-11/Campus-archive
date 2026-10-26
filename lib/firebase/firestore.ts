import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import type { Committee, EventItem, ArchiveRecord, RosterMember, UserProfile } from '@/src/types';

export const COLLECTIONS = {
  USERS: 'users',
  COMMITTEES: 'committees',
  EVENTS: 'events',
  ARCHIVE_RECORDS: 'archive_records',
  ROSTER: 'roster',
  ENROLMENTS: 'enrolments',
  CERTIFICATES: 'certificates',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
} as const;

// User Profile Helpers
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as UserProfile;
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.USERS, profile.uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Committee Helpers
export async function getCommittees(): Promise<Committee[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.COMMITTEES));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Committee);
}

export async function getCommitteeById(id: string): Promise<Committee | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.COMMITTEES, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Committee;
}

export async function saveCommittee(comm: Committee): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.COMMITTEES, comm.id), {
    ...comm,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Event Helpers
export async function getEvents(constraints: QueryConstraint[] = []): Promise<EventItem[]> {
  const q = query(collection(db, COLLECTIONS.EVENTS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EventItem);
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.EVENTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as EventItem;
}

export async function saveEvent(event: EventItem): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.EVENTS, event.id), {
    ...event,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateEventFields(id: string, fields: Partial<EventItem>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, id), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

// Archive Records
export async function getArchiveRecords(): Promise<ArchiveRecord[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.ARCHIVE_RECORDS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ArchiveRecord);
}

export async function saveArchiveRecord(record: ArchiveRecord): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ARCHIVE_RECORDS, record.id), {
    ...record,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

// Roster
export async function getRosterMembers(): Promise<RosterMember[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.ROSTER));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RosterMember);
}

export async function saveRosterMember(member: RosterMember): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ROSTER, member.id), {
    ...member,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteRosterMember(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ROSTER, id));
}

// Audit Trail Logger
export async function logAuditEntry(entry: {
  actorUid: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: 'event' | 'committee' | 'document' | 'enrolment';
  targetId: string;
  details?: Record<string, DocumentData | string | number | boolean>;
}): Promise<void> {
  const auditRef = doc(collection(db, COLLECTIONS.AUDIT_LOGS));
  await setDoc(auditRef, {
    ...entry,
    id: auditRef.id,
    timestamp: serverTimestamp(),
    rawDate: new Date().toISOString(),
  });
}
