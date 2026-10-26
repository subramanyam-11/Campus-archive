import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { db } from './admin';

/**
 * Triggered whenever an event document in /events/{eventId} is updated.
 * Handles notification dispatching on status transitions and auto-creates
 * placeholder attendance roster upon faculty approval.
 */
export const onEventStatusChange = onDocumentUpdated(
  'events/{eventId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      return;
    }

    const previousStatus = beforeData.status;
    const newStatus = afterData.status;

    // Only proceed if status actually changed
    if (previousStatus === newStatus) {
      return;
    }

    const eventId = event.params.eventId;
    const eventTitle = afterData.title || 'Untitled Event';
    const headUid = afterData.committeeHeadId || afterData.createdById;
    const batch = db.batch();

    // Audit Log Entry
    const auditRef = db.collection('audit_logs').doc();
    batch.set(auditRef, {
      id: auditRef.id,
      entityType: 'EVENT',
      entityId: eventId,
      action: 'EVENT_STATUS_TRANSITION',
      previousStatus,
      newStatus,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        title: eventTitle,
        committee: afterData.committee || 'N/A',
      },
    });

    // Notify Committee Head on key lifecycle transitions
    if (
      headUid &&
      ['faculty_approved', 'changes_requested', 'rejected', 'atr_submitted'].includes(newStatus)
    ) {
      const notifRef = db
        .collection('users')
        .doc(headUid)
        .collection('notifications')
        .doc();

      let title = 'Event Proposal Update';
      let message = `Status for "${eventTitle}" changed to ${newStatus}.`;

      if (newStatus === 'faculty_approved') {
        title = 'Proposal Approved!';
        message = `Your event proposal "${eventTitle}" has been sanctioned by Faculty Convener. Attendance roster is now open.`;
      } else if (newStatus === 'changes_requested') {
        title = 'Changes Requested on Proposal';
        message = `Faculty Convener requested revisions on "${eventTitle}": ${afterData.reviewRemarks || 'Please review feedback.'}`;
      } else if (newStatus === 'rejected') {
        title = 'Proposal Rejected';
        message = `Event proposal "${eventTitle}" was rejected: ${afterData.reviewRemarks || 'No remark specified.'}`;
      } else if (newStatus === 'atr_submitted') {
        title = 'Action Taken Report Received';
        message = `ATR dossier for "${eventTitle}" has been received and verified.`;
      }

      batch.set(notifRef, {
        id: notifRef.id,
        title,
        message,
        eventId,
        status: newStatus,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Auto-create initial attendance roster manifest when event is sanctioned
    if (newStatus === 'faculty_approved') {
      const rosterRef = db
        .collection('events')
        .doc(eventId)
        .collection('roster')
        .doc('manifest');

      batch.set(
        rosterRef,
        {
          eventId,
          eventTitle,
          status: 'OPEN',
          registeredCount: 0,
          attendedCount: 0,
          initializedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    await batch.commit();
  }
);
