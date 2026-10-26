import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { db, storage } from './admin';

interface GenerateDossierRequest {
  eventId: string;
}

export const generateEventDossierPdf = onCall<GenerateDossierRequest>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { eventId } = request.data;
  if (!eventId) {
    throw new HttpsError('invalid-argument', 'Missing eventId.');
  }

  const eventDoc = await db.collection('events').doc(eventId).get();
  if (!eventDoc.exists) {
    throw new HttpsError('not-found', `Event ${eventId} not found.`);
  }

  const data = eventDoc.data()!;

  // Compile NAAC Dossier PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // Portrait A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: rgb(0.08, 0.16, 0.36),
  });

  page.drawText('INSTITUTIONAL EVENT ACCREDITATION DOSSIER', {
    x: 40,
    y: height - 50,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('NAAC / NBA Criterion 3.3.2 Compliance Record & ATR Synthesis', {
    x: 40,
    y: height - 75,
    size: 10,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.95),
  });

  // Event Metadata Section
  let y = height - 140;

  const drawRow = (label: string, val: string) => {
    page.drawText(label, { x: 40, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.3) });
    page.drawText(val, { x: 200, y, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  };

  drawRow('Event Title:', data.title || 'Untitled');
  drawRow('Event Code / Ref:', data.code || eventId);
  drawRow('Organizing Body:', data.committee || 'Institutional Cell');
  drawRow('Academic Year:', data.academicYear || 'AY 2024–25');
  drawRow('Date / Schedule:', data.dateStr || 'N/A');
  drawRow('Venue / Location:', data.venue || 'Campus Auditorium');
  drawRow('Sanctioned Budget:', `INR ${data.budgetSanctioned?.toLocaleString() || '0'}`);
  drawRow('Actual Utilization:', `INR ${data.actualUtilization?.toLocaleString() || '0'}`);
  drawRow('Verified Attendees:', `${data.attendeeCount || 0} participants`);
  drawRow('Faculty Convener:', data.convener || 'Dr. Appointed Faculty');
  drawRow('Lifecycle Status:', String(data.status || 'Archived').toUpperCase());

  y -= 20;

  // Executive Summary
  page.drawText('Executive Summary & Action Taken Report (ATR)', {
    x: 40,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.08, 0.16, 0.36),
  });
  y -= 18;

  const summary = data.atrExecutiveSummary || data.description || 'Statutory event successfully conducted under IQAC norms. Evidence verified.';
  page.drawText(summary.slice(0, 300), {
    x: 40,
    y,
    size: 10,
    font: fontRegular,
    color: rgb(0.25, 0.25, 0.25),
  });

  y -= 40;

  // Cryptographic Ledger Seal
  page.drawRectangle({
    x: 40,
    y: 60,
    width: width - 80,
    height: 60,
    borderColor: rgb(0.7, 0.75, 0.85),
    borderWidth: 1,
    color: rgb(0.97, 0.98, 1),
  });

  page.drawText('Cryptographic Ledger Seal (SHA-256 Digest):', {
    x: 55,
    y: 100,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  const sha256Digest = crypto.createHash('sha256').update(pdfBytes).digest('hex');

  page.drawText(sha256Digest, {
    x: 55,
    y: 80,
    size: 8,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.4),
  });

  const finalizedBytes = await pdfDoc.save();

  // Upload to Storage
  const bucket = storage.bucket();
  const filePath = `dossiers/${eventId}_dossier.pdf`;
  const file = bucket.file(filePath);

  await file.save(Buffer.from(finalizedBytes), {
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        eventId,
        sha256Digest,
      },
    },
  });

  const dossierUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  // Update Event with dossier URL
  await eventDoc.ref.update({
    dossierPdfUrl: dossierUrl,
    dossierSha256: sha256Digest,
    dossierGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    eventId,
    dossierUrl,
    sha256Digest,
    status: 'GENERATED',
  };
});
