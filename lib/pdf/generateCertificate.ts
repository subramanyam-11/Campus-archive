import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import type { CertificateItem } from '@/src/types';
import { computeBufferSha256 } from '@/lib/crypto/hash';

export interface GeneratedCertificateResult {
  pdfBytes: Uint8Array;
  blobUrl: string;
  sha256Hash: string;
}

export async function generateCertificatePdf(cert: CertificateItem): Promise<GeneratedCertificateResult> {
  const pdfDoc = await PDFDocument.create();
  // Landscape A4: 841.89 x 595.28
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontTimesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Outer decorative border
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: rgb(0.15, 0.23, 0.45),
    borderWidth: 3,
  });

  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: rgb(0.85, 0.65, 0.15), // Gold accent
    borderWidth: 1.5,
  });

  // Institution Header
  const institutionName = 'CENTRAL COLLEGE OF ENGINEERING & TECHNOLOGY';
  const instWidth = fontTimesRomanBold.widthOfTextAtSize(institutionName, 22);
  page.drawText(institutionName, {
    x: (width - instWidth) / 2,
    y: height - 85,
    size: 22,
    font: fontTimesRomanBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  const subHeader = 'Approved by AICTE, Affiliated to State Technological University | Accredited by NAAC (A+ Grade)';
  const subWidth = fontHelvetica.widthOfTextAtSize(subHeader, 9);
  page.drawText(subHeader, {
    x: (width - subWidth) / 2,
    y: height - 105,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Certificate Title
  const certTitle = 'CERTIFICATE OF PARTICIPATION';
  const titleWidth = fontHelveticaBold.widthOfTextAtSize(certTitle, 24);
  page.drawText(certTitle, {
    x: (width - titleWidth) / 2,
    y: height - 165,
    size: 24,
    font: fontHelveticaBold,
    color: rgb(0.15, 0.35, 0.75),
  });

  const certSub = 'This is proudly presented to';
  const certSubWidth = fontTimesRomanItalic.widthOfTextAtSize(certSub, 14);
  page.drawText(certSub, {
    x: (width - certSubWidth) / 2,
    y: height - 195,
    size: 14,
    font: fontTimesRomanItalic,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Student Name
  const studentName = cert.studentName.toUpperCase();
  const nameWidth = fontTimesRomanBold.widthOfTextAtSize(studentName, 26);
  page.drawText(studentName, {
    x: (width - nameWidth) / 2,
    y: height - 240,
    size: 26,
    font: fontTimesRomanBold,
    color: rgb(0.08, 0.12, 0.25),
  });

  // PRN Subtitle
  const prnText = `(Permanent Registration Number: ${cert.studentPrn})`;
  const prnWidth = fontHelvetica.widthOfTextAtSize(prnText, 11);
  page.drawText(prnText, {
    x: (width - prnWidth) / 2,
    y: height - 262,
    size: 11,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Description / Citation
  const line1 = `for active participation and successful completion of the collegiate program`;
  const l1Width = fontTimesRoman.widthOfTextAtSize(line1, 13);
  page.drawText(line1, {
    x: (width - l1Width) / 2,
    y: height - 305,
    size: 13,
    font: fontTimesRoman,
    color: rgb(0.2, 0.2, 0.2),
  });

  const eventTitle = `"${cert.eventTitle}"`;
  const evtWidth = fontTimesRomanBold.widthOfTextAtSize(eventTitle, 16);
  page.drawText(eventTitle, {
    x: (width - evtWidth) / 2,
    y: height - 335,
    size: 16,
    font: fontTimesRomanBold,
    color: rgb(0.12, 0.25, 0.55),
  });

  const line2 = `organized by ${cert.committeeName} on ${cert.eventDate}.`;
  const l2Width = fontTimesRoman.widthOfTextAtSize(line2, 12);
  page.drawText(line2, {
    x: (width - l2Width) / 2,
    y: height - 365,
    size: 12,
    font: fontTimesRoman,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Embed QR code for verification
  try {
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/verify/${cert.id}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });

    const base64Data = qrDataUrl.split(',')[1];
    const qrBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrBytes);

    // Place QR code at bottom left
    page.drawImage(qrImage, {
      x: 65,
      y: 65,
      width: 75,
      height: 75,
    });

    page.drawText('Scan to Verify Credential', {
      x: 60,
      y: 52,
      size: 7.5,
      font: fontHelvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
  } catch {
    // Graceful fallback if QR generation fails
  }

  // Signatures at bottom right & center
  // Convener Signature
  page.drawLine({
    start: { x: 340, y: 105 },
    end: { x: 500, y: 105 },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText('Dr. Rajesh Sundaram', {
    x: 360,
    y: 90,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.15, 0.15, 0.15),
  });
  page.drawText('Faculty Convener', {
    x: 375,
    y: 77,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Principal / IQAC Signature
  page.drawLine({
    start: { x: 620, y: 105 },
    end: { x: 770, y: 105 },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText('Prof. V. Ramanathan', {
    x: 642,
    y: 90,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.15, 0.15, 0.15),
  });
  page.drawText('Principal & Head of Institution', {
    x: 628,
    y: 77,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Footer Metadata & Certificate ID
  page.drawText(`Certificate ID: ${cert.id}`, {
    x: 160,
    y: 68,
    size: 8,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.3, 0.5),
  });
  page.drawText(`Issued: ${cert.issuedAt} | SHA-256 Digest: ${cert.sha256Hash ? cert.sha256Hash.substring(0, 24) + '...' : 'PENDING'}`, {
    x: 160,
    y: 54,
    size: 7,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

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
