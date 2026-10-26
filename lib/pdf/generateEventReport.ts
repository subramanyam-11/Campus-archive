import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { EventItem } from '@/src/types';
import { computeBufferSha256 } from '@/lib/crypto/hash';

export interface GeneratedPdfResult {
  pdfBytes: Uint8Array;
  blobUrl: string;
  sha256Hash: string;
}

export async function generateEventDossierPdf(event: EventItem): Promise<GeneratedPdfResult> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const { width, height } = page.getSize();
  let currentY = height - 50;

  // Header Box
  page.drawText('INTERNAL QUALITY ASSURANCE CELL (IQAC)', {
    x: 50,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.4, 0.8),
  });
  currentY -= 20;

  page.drawText('CENTRAL COLLEGE OF ENGINEERING & TECHNOLOGY', {
    x: 50,
    y: currentY,
    size: 16,
    font: fontTimesRoman,
    color: rgb(0.1, 0.1, 0.2),
  });
  currentY -= 14;

  page.drawText('Statutory Event Dossier & Compliance Record', {
    x: 50,
    y: currentY,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.4, 0.4, 0.4),
  });
  currentY -= 20;

  // Horizontal divider
  page.drawLine({
    start: { x: 50, y: currentY },
    end: { x: width - 50, y: currentY },
    thickness: 1.5,
    color: rgb(0.1, 0.1, 0.2),
  });
  currentY -= 30;

  // Ref No & Title
  page.drawText(`REF NO: ${event.refNo}`, {
    x: 50,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  currentY -= 22;

  page.drawText(`TITLE: ${event.title}`, {
    x: 50,
    y: currentY,
    size: 14,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.3, 0.7),
  });
  currentY -= 25;

  // Event Details Grid
  const details = [
    `Convening Committee: ${event.committee} (${event.committeeCode})`,
    `Department: ${event.department}`,
    `Date & Venue: ${event.dateStr} | ${event.venue}`,
    `Faculty Convener: ${event.convener}`,
    `Status: ${event.status}`,
    `Sanctioned Budget: INR ${event.budgetSanctioned.toLocaleString()}`,
    `Budget Utilized: INR ${event.budgetUtilized.toLocaleString()}`,
    `Validated Attendance: ${event.attendanceValidated} / ${event.attendanceTarget} (${event.attendanceTurnoutPercent}%)`,
  ];

  for (const line of details) {
    page.drawText(line, {
      x: 50,
      y: currentY,
      size: 10,
      font: fontHelvetica,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 16;
  }

  currentY -= 15;
  page.drawText('OBJECTIVES & SCOPE:', {
    x: 50,
    y: currentY,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  currentY -= 18;

  page.drawText(event.objective, {
    x: 50,
    y: currentY,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  currentY -= 35;

  // Outcomes
  page.drawText('ACTION TAKEN REPORT (ATR) KEY OUTCOMES:', {
    x: 50,
    y: currentY,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  currentY -= 18;

  for (const outcome of event.outcomesAtr) {
    page.drawText(`• ${outcome}`, {
      x: 60,
      y: currentY,
      size: 9,
      font: fontHelvetica,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 15;
  }

  // Footer & Signatures
  page.drawLine({
    start: { x: 50, y: 100 },
    end: { x: width - 50, y: 100 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText('Faculty Convener', { x: 50, y: 80, size: 9, font: fontHelveticaBold });
  page.drawText('IQAC Coordinator', { x: 250, y: 80, size: 9, font: fontHelveticaBold });
  page.drawText('Principal / Executive Head', { x: 420, y: 80, size: 9, font: fontHelveticaBold });

  const pdfBytes = await pdfDoc.save();
  const sha256Hash = await computeBufferSha256(pdfBytes.buffer as ArrayBuffer);
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  return {
    pdfBytes,
    blobUrl,
    sha256Hash,
  };
}
