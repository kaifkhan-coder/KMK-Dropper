import { QueuedFile } from '../types';
import { packageZipArchive } from './zipCompressor';
import { injectWatermark, stripWatermark } from './watermark';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface SyncPackageResult {
  success: boolean;
  packageId: string;
  fileName: string;
  isSingleFile: boolean;
  downloadUrl: string;
  mobileUrl: string;
  size: number;
}

/**
 * Converts a Blob to a base64 encoded string safely.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compiles the active files and synchronizes with the Express backend.
 * Rule: If there is only 1 file, it is preserved as it is without converting to ZIP.
 * If there are multiple files (> 1), they are bundled into a ZIP archive.
 */
export async function syncActivePackageToServer(
  packageId: string,
  files: QueuedFile[],
  isBypassActive: boolean
): Promise<SyncPackageResult> {
  if (files.length === 0) {
    throw new Error('No files to package.');
  }

  let isSingleFile = false;
  let fileName = '';
  let mimeType = '';
  let payloadBlob: Blob;

  if (files.length === 1) {
    // SINGLE FILE MODE: Do not convert to .zip! Keep as it is.
    isSingleFile = true;
    const singleFile = files[0];
    fileName = singleFile.name;
    mimeType = singleFile.type || (singleFile.isText ? 'text/plain;charset=utf-8' : 'application/octet-stream');

    if (singleFile.isText && singleFile.content !== undefined) {
      const content = isBypassActive
        ? stripWatermark(singleFile.content)
        : injectWatermark(singleFile.content);
      payloadBlob = new Blob([content], { type: mimeType });
    } else if (singleFile.binaryBlob) {
      payloadBlob = singleFile.binaryBlob;
    } else {
      payloadBlob = new Blob([singleFile.content || ''], { type: mimeType });
    }
  } else {
    // MULTI FILE MODE: Package into .zip
    isSingleFile = false;
    const zipResult = await packageZipArchive(files, isBypassActive);
    fileName = zipResult.fileName;
    mimeType = 'application/zip';
    payloadBlob = zipResult.blob;
  }

  const fileBase64 = await blobToBase64(payloadBlob);

  const payload = {
    id: packageId,
    fileName,
    mimeType,
    isSingleFile,
    isBypassActive,
    files: files.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      isText: f.isText,
      content: f.isText ? (isBypassActive ? stripWatermark(f.content || '') : injectWatermark(f.content || '')) : undefined
    })),
    fileBase64
  };

  // Mirror to Firestore for cross-network and mobile phone direct access
  try {
    const firestorePackage: Record<string, any> = {
      id: packageId,
      fileName,
      mimeType,
      isSingleFile,
      isBypassActive,
      size: payloadBlob.size,
      fileCount: files.length,
      files: files.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type || (f.isText ? 'text/plain' : 'application/octet-stream'),
        isText: f.isText,
        content: f.isText ? (isBypassActive ? stripWatermark(f.content || '') : injectWatermark(f.content || '')) : undefined
      })),
      updatedAt: new Date().toISOString()
    };

    // Embed base64 in Firestore if under document limit (1MB) so mobile devices can download directly from cloud
    if (fileBase64 && fileBase64.length < 950000) {
      firestorePackage.fileBase64 = fileBase64;
    }

    await setDoc(doc(db, 'packages', packageId), firestorePackage);
    await setDoc(doc(db, 'packages', 'active-latest'), firestorePackage);
  } catch (firestoreErr) {
    console.warn('Firestore cloud mirror notice:', firestoreErr);
  }

  const response = await fetch('/api/package', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return {
    success: true,
    packageId: data.id,
    fileName: data.fileName,
    isSingleFile: Boolean(data.isSingleFile),
    downloadUrl: data.downloadUrl,
    mobileUrl: data.mobileUrl,
    size: data.size
  };
}
