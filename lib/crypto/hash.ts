/**
 * Cryptographic SHA-256 utility for document verification and audit trail integrity.
 * Uses the native Web Crypto API (supported in all modern browsers and Node 18+).
 */

export async function computeBufferSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeFileSha256(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return computeBufferSha256(arrayBuffer);
}

export async function computeStringSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return computeBufferSha256(data.buffer);
}

export async function verifyDocumentHash(file: File | Blob, expectedHash: string): Promise<boolean> {
  const actualHash = await computeFileSha256(file);
  return actualHash.toLowerCase().trim() === expectedHash.toLowerCase().trim();
}
