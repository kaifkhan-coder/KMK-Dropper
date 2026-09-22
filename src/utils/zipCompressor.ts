import JSZip from 'jszip';
import { QueuedFile } from '../types';
import { 
  WATERMARK_BANNER, 
  injectWatermark, 
  stripWatermark, 
  generateSecurityManifest,
  is3DAnimationAsset,
  generate3DAnimationManifest 
} from './watermark';

export interface ZipResult {
  blob: Blob;
  fileName: string;
  originalBytes: number;
  compressedBytes: number;
  compressionRatio: number;
  fileCount: number;
  isBypassActive: boolean;
  generatedAt: Date;
  has3DAssets?: boolean;
}

/**
 * Programmatically packages queued files into a ZIP archive with the watermark pipeline.
 * Mimics Java's java.util.zip.ZipOutputStream streaming compression.
 */
export async function packageZipArchive(
  files: QueuedFile[],
  isBypassActive: boolean,
  onProgress?: (percent: number, currentFileName: string) => void
): Promise<ZipResult> {
  if (files.length === 0) {
    throw new Error('No files staged for compression.');
  }

  const zip = new JSZip();
  let totalOriginalBytes = 0;
  const detected3DAssets: Array<{ name: string; size: number; extension: string }> = [];

  // Process files one by one with progress callbacks
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const is3D = is3DAnimationAsset(file.name);
    const ext = file.extension || file.name.split('.').pop() || '';

    if (is3D) {
      detected3DAssets.push({ name: file.name, size: file.size, extension: ext });
    }

    const progress = Math.round(((i + 1) / files.length) * 80);
    if (onProgress) {
      onProgress(progress, file.name);
    }

    // 3D animation formats (.obj, .fbx, .stl, .blend) MUST NEVER have their raw binary modified
    if (is3D) {
      if (file.binaryBlob) {
        totalOriginalBytes += file.size;
        const arrayBuffer = await file.binaryBlob.arrayBuffer();
        zip.file(file.name, arrayBuffer, {
          comment: isBypassActive
            ? '3D Asset - Clean Bypass Mode'
            : '3D Animation Asset - Signed via animation_manifest.kaif',
          date: new Date()
        });
      } else if (file.content !== undefined) {
        // e.g. text-based .obj geometry: keep pure raw geometry without comments
        totalOriginalBytes += new TextEncoder().encode(file.content).length;
        zip.file(file.name, file.content, {
          comment: isBypassActive 
            ? '3D Mesh - Clean Bypass Mode' 
            : '3D Animation Asset - Raw Geometry Protected',
          date: new Date()
        });
      }
    } else if (file.isText && file.content !== undefined) {
      let finalContent: string;
      if (isBypassActive) {
        // Strip watermark banner if present
        finalContent = stripWatermark(file.content);
      } else {
        // Mandatory inject watermark banner on line 1 for text and .kaif files
        finalContent = injectWatermark(file.content);
      }

      totalOriginalBytes += new TextEncoder().encode(finalContent).length;
      zip.file(file.name, finalContent, {
        comment: isBypassActive 
          ? 'Exported in Clean Bypass Mode (Admin Authorized)' 
          : WATERMARK_BANNER,
        date: new Date()
      });
    } else if (file.binaryBlob) {
      totalOriginalBytes += file.size;
      const arrayBuffer = await file.binaryBlob.arrayBuffer();
      zip.file(file.name, arrayBuffer, {
        comment: isBypassActive
          ? 'Binary Entry - Clean Bypass Mode'
          : `Binary Entry Secured by: ${WATERMARK_BANNER}`,
        date: new Date()
      });
    }
  }

  // 3D Animation Asset Manifest Layer:
  // If 3D formats (.obj, .fbx, .stl, .blend) exist and bypass is NOT active,
  // automatically inject companion metadata ledger named "animation_manifest.kaif" in root
  if (detected3DAssets.length > 0 && !isBypassActive) {
    const animationManifest = generate3DAnimationManifest(detected3DAssets);
    zip.file('animation_manifest.kaif', animationManifest, {
      comment: 'Authenticated Build Signature - Khan Mohammed Kaif 3D Animation Suite',
      date: new Date()
    });
  }

  // Include security manifest and metadata manifest in root
  const manifestContent = generateSecurityManifest(
    files.map(f => ({ name: f.name, size: f.size, isText: f.isText })),
    isBypassActive
  );
  zip.file('META-INF/MANIFEST.MF', manifestContent);
  zip.file('SECURITY_PROTOCOL.txt', manifestContent);

  if (onProgress) {
    onProgress(90, 'Finalizing DEFLATE compression...');
  }

  // Generate ZIP blob with standard DEFLATE compression (Java standard level 6)
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      },
      comment: isBypassActive
        ? 'Java Local Transfer ZIP - Clean Bypass Mode (Admin Authorized)'
        : `Java Local Transfer ZIP - ${WATERMARK_BANNER}`
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(85 + (metadata.percent * 0.15)), 'Streaming output...');
      }
    }
  );

  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const modeTag = isBypassActive ? 'CLEAN_BYPASS' : 'SECURE_WM';
  const fileName = `Package_${modeTag}_${timestamp}.zip`;

  const compressedBytes = zipBlob.size;
  const compressionRatio = totalOriginalBytes > 0 
    ? Math.max(0, Math.round((1 - (compressedBytes / totalOriginalBytes)) * 100))
    : 0;

  if (onProgress) {
    onProgress(100, 'Packaging Complete!');
  }

  return {
    blob: zipBlob,
    fileName,
    originalBytes: totalOriginalBytes,
    compressedBytes,
    compressionRatio,
    fileCount: files.length,
    isBypassActive,
    generatedAt: new Date(),
    has3DAssets: detected3DAssets.length > 0
  };
}
