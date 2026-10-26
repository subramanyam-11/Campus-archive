import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { db, storage } from './admin';

interface GenerateCertRequest {
  eventId: string;
  studentPrn: string;
  studentName: string;
}

export const generateCertificatePdf = onCall<GenerateCertRequest>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to request certificates.');
  }

  const { eventId, studentPrn, studentName } = request.data;

  if (!eventId || !studentPrn || !studentName) {
    throw new HttpsError('invalid-argument', 'Missing required fields: eventId, studentPrn, studentName.');
  }

  // Fetch Event Doc
  const eventDoc = await db.collection('events').doc(eventId).get();
  if (!eventDoc.exists) {
    throw new HttpsError('not-found', `Event with ID ${eventId} does not exist.`);
  }

  const eventData = eventDoc.data()!;

  // Check Attendance Roster
  const rosterDoc = await db
    .collection('events')
    .doc(eventId)
    .collection('roster')
    .doc(studentPrn)
    .get();

  // If roster document exists, verify attendance
  if (rosterDoc.exists && rosterDoc.data()?.attended === false) {
    throw new HttpsError('failed-precondition', 'Certificate cannot be issued: Student attendance was not confirmed.');
  }

  const certId = `CERT-${studentPrn.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  // Generate QR code buffer containing verification URL
  const verifyUrl = `https://campusarchive.edu/verify/${certId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 256,
    color: { dark: '#020617', light: '#ffffff' },
  });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  // Build Landscape PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // Landscape A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  // Background and border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.12, 0.23, 0.54),
    borderWidth: 3,
    color: rgb(0.99, 0.99, 1),
  });

  // Institution Header
  page.drawText('GOVERNMENT COLLEGE OF ENGINEERING & TECHNOLOGY', {
    x: 140,
    y: height - 80,
    size: 18,
    font: fontBold,
    color: rgb(0.08, 0.16, 0.36),
  });

  page.drawText('Autonomous Institution Approved by AICTE, NAAC A+ Accredited', {
    x: 230,
    y: height - 105,
    size: 11,
    font: fontRegular,
    color: rgb(0.35, 0.4, 0.5),
  });

  page.drawText('CERTIFICATE OF PARTICIPATION', {
    x: 240,
    y: height - 165,
    size: 22,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.54),
  });

  // Certificate Body
  page.drawText('This is to certify that', {
    x: 350,
    y: height - 215,
    size: 13,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(studentName.toUpperCase(), {
    x: 250,
    y: height - 250,
    size: 20,
    font: fontBold,
    color: rgb(0.05, 0.1, 0.25),
  });

  page.drawText(`bearing Student PRN: ${studentPrn.toUpperCase()}`, {
    x: 320,
    y: height - 280,
    size: 12,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(
    `has actively attended and successfully completed the institutional activity:`,
    {
      x: 190,
      y: height - 320,
      size: 13,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    }
  );

  page.drawText(`"${eventData.title || 'Institutional Event'}"`, {
    x: 200,
    y: height - 355,
    size: 16,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.54),
  });

  page.drawText(
    `Organized by ${eventData.committee || 'Institutional Cell'} under NAAC/IQAC statutory guidelines.`,
    {
      x: 200,
      y: height - 385,
      size: 11,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    }
  );

  // Signatures
  page.drawText('Dr. Faculty Convener', {
    x: 100,
    y: 110,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('Convener / Committee Head', {
    x: 95,
    y: 95,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText('Prof. Academic Dean / Principal', {
    x: 550,
    y: 110,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('Head of the Institution', {
    x: 580,
    y: 95,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // QR Code
  page.drawImage(qrImage, {
    x: width / 2 - 40,
    y: 70,
    width: 80,
    height: 80,
  });

  page.drawText(`Scan to verify • ID: ${certId}`, {
    x: width / 2 - 80,
    y: 50,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();

  // Compute Cryptographic SHA-256 Digest
  const sha256Digest = crypto.createHash('sha256').update(pdfBytes).digest('hex');

  // Upload to Cloud Storage
  const bucket = storage.bucket();
  const filePath = `certificates/${certId}.pdf`;
  const file = bucket.file(filePath);

  await file.save(Buffer.from(pdfBytes), {
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        certId,
        studentPrn,
        eventId,
        sha256Digest,
      },
    },
  });

  const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  // Store Certificate Ledger Record
  await db.collection('certificates').doc(certId).set({
    certId,
    eventId,
    eventTitle: eventData.title,
    studentPrn: studentPrn.toUpperCase(),
    studentName,
    sha256Digest,
    issuedAt: admin.firestore.FieldValue.serverTimestamp(),
    downloadUrl,
    verified: true,
  });

  return {
    certId,
    downloadUrl,
    sha256Digest,
  };
});
