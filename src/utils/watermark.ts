export const WATERMARK_BANNER = "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol";
export const SECRET_AUTH_CODE = "BuildWithKMKaif";

// Known text and script extensions, including custom .kaif assets
const TEXT_EXTENSIONS = new Set([
  'txt', 'java', 'py', 'js', 'ts', 'jsx', 'tsx', 'csv', 'json', 
  'xml', 'html', 'css', 'scss', 'md', 'c', 'cpp', 'h', 'hpp', 
  'cs', 'kt', 'kts', 'rs', 'go', 'rb', 'php', 'sh', 'sql', 'yaml', 'yml', 'properties', 'env',
  'kaif'
]);

// Explicit 3D design and animation project extensions
export const THREE_D_EXTENSIONS = new Set(['obj', 'fbx', 'stl', 'blend']);

/**
 * Checks whether a file is a 3D animation or design format (.obj, .fbx, .stl, .blend).
 */
export function is3DAnimationAsset(fileName: string): boolean {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()!.toLowerCase();
    return THREE_D_EXTENSIONS.has(ext);
  }
  return false;
}

/**
 * Checks whether a file is considered text-based based on its extension or MIME type.
 */
export function isTextFile(fileName: string, mimeType?: string): boolean {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()!.toLowerCase();
    if (TEXT_EXTENSIONS.has(ext)) {
      return true;
    }
  }
  if (mimeType) {
    if (mimeType.startsWith('text/') || 
        mimeType.includes('json') || 
        mimeType.includes('javascript') || 
        mimeType.includes('xml')) {
      return true;
    }
  }
  return false;
}

/**
 * Applies watermark injection to text content or .kaif scripts.
 * Guarantees the watermark banner is on the very first line.
 */
export function injectWatermark(content: string): string {
  // If already contains the banner at the start, don't duplicate
  if (content.startsWith(WATERMARK_BANNER)) {
    return content;
  }
  // Strip any old banner instances first to avoid stacking
  const cleaned = stripWatermark(content);
  return `${WATERMARK_BANNER}\n${cleaned}`;
}

/**
 * Strips the watermark banner from text content if present (used in Bypass mode).
 */
export function stripWatermark(content: string): string {
  let result = content;
  const bannersToClean = [
    WATERMARK_BANNER,
    "// BuildWithKMKaif",
    "BuildWithKMKaif",
    "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol",
    "// [Build by Khan Kaif] - Local Secure Transfer Protocol"
  ];

  for (const banner of bannersToClean) {
    if (result.startsWith(banner)) {
      result = result.slice(banner.length);
      if (result.startsWith('\r\n')) {
        result = result.slice(2);
      } else if (result.startsWith('\n')) {
        result = result.slice(1);
      }
    }
    while (result.includes(banner + '\n') || result.includes(banner + '\r\n')) {
      result = result.replace(banner + '\r\n', '').replace(banner + '\n', '');
    }
  }
  return result;
}

/**
 * Generates the companion 3D animation ledger named animation_manifest.kaif
 * Injected automatically during ZIP bundling when 3D assets (.obj, .fbx, .stl, .blend) are detected.
 */
export function generate3DAnimationManifest(
  assets3D: Array<{ name: string; size: number; extension: string }>
): string {
  const dateStr = new Date().toISOString();
  return `Project Architect: Khan Mohammed Kaif (3D Animation Suite)
Verification Status: Authenticated Build Signature
Ledger: animation_manifest.kaif
Timestamp: ${dateStr}

Identified 3D Project Assets:
${assets3D.map(a => `  • ${a.name} [Type: .${a.extension.toLowerCase()}, Size: ${(a.size / 1024).toFixed(1)} KB]`).join('\n')}

Pipeline Specifications:
  1. Raw 3D mesh vectors, vertices, textures, and skeletal rigs preserved in pure binary format.
  2. Cryptographic ledger bound to local peer-to-peer ZIP container.
  3. Bypass Key Override: BuildWithKMKaif (suppresses companion manifest).
`;
}

/**
 * Generates the root archive security manifest for non-text files and audit trail.
 */
export function generateSecurityManifest(files: Array<{ name: string; size: number; isText: boolean }>, isBypassActive: boolean): string {
  const dateStr = new Date().toISOString();
  if (isBypassActive) {
    return `Manifest-Version: 1.0
Created-By: Multi-File ZIP Package Generator via QR (Senior Java Edition)
Security-Mode: BYPASS_AUTHORIZED
Authorization-Code: [VERIFIED_KMK_OVERRIDE_BUILDWITHKMKAIF]
Timestamp: ${dateStr}
Total-Files: ${files.length}
Watermark-Status: STRIPPED_CLEAN_EXPORT
Manifest-Notice: Original file blocks served directly without watermark banners or 3D companion ledgers.

Files:
${files.map(f => `  - ${f.name} (${f.size} bytes, type: ${f.isText ? 'TEXT' : 'BINARY'})`).join('\n')}
`;
  }

  return `Manifest-Version: 1.0
Created-By: Multi-File ZIP Package Generator via QR (Senior Java Edition)
Security-Mode: MANDATORY_WATERMARK_ENFORCED
Protocol-Signer: Khan Mohammed Kaif 3D Animation & Local Secure Transfer Protocol
Signature-Banner: ${WATERMARK_BANNER}
Timestamp: ${dateStr}
Total-Files: ${files.length}
Watermark-Status: INJECTED_HEADER_AND_METADATA
Notice: Every text-based or .kaif entry contains the mandatory protocol header. 3D assets (.obj, .fbx, .stl, .blend) inherit companion animation_manifest.kaif ledger.

Files:
${files.map(f => `  - ${f.name} (${f.size} bytes, text: ${f.isText})`).join('\n')}
`;
}
