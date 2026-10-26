import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';
import { computeFileSha256 } from '@/lib/crypto/hash';

export interface UploadResult {
  url: string;
  path: string;
  sha256Hash: string;
  sizeBytes: number;
  fileName: string;
}

export async function uploadDocumentFile(
  file: File,
  folder: string,
  onProgress?: (progressPercent: number) => void
): Promise<UploadResult> {
  const sha256Hash = await computeFileSha256(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    customMetadata: {
      sha256Hash,
      originalName: file.name,
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url,
            path,
            sha256Hash,
            sizeBytes: file.size,
            fileName: file.name,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function deleteStorageFile(path: string): Promise<void> {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}
