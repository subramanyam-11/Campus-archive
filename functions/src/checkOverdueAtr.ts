import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { db } from './admin';

/**
 * Scheduled cron job running daily at midnight (00:00).
 * Queries completed events older than 7 calendar days missing an Action Taken Report (ATR).
 * Updates their status to 'overdue_atr' and flags notifications for the Head and Convener.
 */
export const checkOverdueAtr = onSchedule('every day 00:00', async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cutoffTimestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo);

  const snapshot = await db
    .collection('events')
    .where('endDate', '<', cutoffTimestamp)
    .where('status', 'in', ['faculty_approved', 'completed'])
    .get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Skip if ATR already submitted or archived
    if (data.status === 'atr_submitted' || data.status === 'archived' || data.status === 'overdue_atr') {
      continue;
    }

    // Set status to overdue_atr
    batch.update(doc.ref, {
      status: 'overdue_atr',
      atrOverdueSince: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Write audit log
    const auditRef = db.collection('audit_logs').doc();
    batch.set(auditRef, {
      id: auditRef.id,
      entityType: 'EVENT',
      entityId: doc.id,
      action: 'ATR_FLAGGED_OVERDUE',
      previousStatus: data.status,
      newStatus: 'overdue_atr',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      reason: '7-day statutory deadline elapsed without ATR submission',
    });

    // Notify Committee Head and Convener
    const recipients = [data.committeeHeadId, data.convenerId].filter(Boolean);
    for (const uid of recipients) {
      const notifRef = db.collection('users').doc(uid).collection('notifications').doc();
      batch.set(notifRef, {
        id: notifRef.id,
        title: 'Action Required: ATR Overdue',
        message: `Statutory 7-day post-event deadline passed for "${data.title}". Please upload photo evidence and financial utilization statement immediately.`,
        eventId: doc.id,
        status: 'overdue_atr',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  await batch.commit();
});
