export const WATERMARK_BANNER = "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol";
export const SECRET_AUTH_CODE = "BuildWithKMKaif";
export const LEGACY_AUTH_CODE = "KaifGive20@";

// 3D design and animation extensions
export const ANIMATION_3D_EXTENSIONS = new Set(['obj', 'fbx', 'stl', 'blend']);

// Known text extensions (including custom .kaif scripts)
const TEXT_EXTENSIONS = new Set([
  'txt', 'java', 'py', 'js', 'ts', 'jsx', 'tsx', 'csv', 'json', 
  'xml', 'html', 'css', 'scss', 'md', 'c', 'cpp', 'h', 'hpp', 
  'cs', 'kt', 'kts', 'rs', 'go', 'rb', 'php', 'sh', 'sql', 'yaml', 'yml', 'properties', 'env',
  'kaif'
]);

/**
 * Checks whether a file is considered text-based based on its extension or MIME type.
 * Explicitly treats custom .kaif scripts as text files.
 */
export function isTextFile(fileName: string, mimeType?: string): boolean {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()!.toLowerCase();
    if (ext === 'kaif') {
      return true;
    }
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
 * Checks whether a file is a 3D design or animation format (.obj, .fbx, .stl, .blend).
 */
export function is3DAnimationFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? ANIMATION_3D_EXTENSIONS.has(ext) : false;
}

/**
 * Validates the secret clearance code for the bypass authorization.
 * Accepts "BuildWithKMKaif" as primary clearance code.
 */
export function isValidAuthCode(input: string): boolean {
  if (!input) return false;
  const clean = input.trim();
  return (
    clean === SECRET_AUTH_CODE ||
    clean.toLowerCase() === SECRET_AUTH_CODE.toLowerCase() ||
    clean === LEGACY_AUTH_CODE
  );
}

/**
 * Applies watermark injection to text content and .kaif scripts.
 * Guarantees the watermark banner is on the very first line:
 * "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol"
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
    "// [Created by Khan Mohammed Kaif] - 3D Animation & Local Secure Transfer Protocol",
    "// BuildWithKMKaif",
    "BuildWithKMKaif",
    "// [Build by Khan Kaif] - Local Secure Transfer Protocol",
    "// BuildWithKMKaif\n"
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
 * Companion metadata ledger for 3D animation packages (.obj, .fbx, .stl, .blend).
 * Programmatically stores required identity text:
 * "Project Architect: Khan Mohammed Kaif (3D Animation Suite)"
 * "Verification Status: Authenticated Build Signature"
 */
export const ANIMATION_MANIFEST_FILENAME = "animation_manifest.kaif";

export function generateAnimationManifest(files: Array<{ name: string; size: number }>): string {
  const detected3DFiles = files.filter(f => is3DAnimationFile(f.name));
  const timestamp = new Date().toISOString();

  return `Project Architect: Khan Mohammed Kaif (3D Animation Suite)
Verification Status: Authenticated Build Signature
Timestamp: ${timestamp}
Asset Protocol: 3D Animation Asset Manifest & Local Secure Transfer Protocol v2.4
Detected 3D Assets (${detected3DFiles.length}):
${detected3DFiles.map(f => `  • ${f.name} [${f.size} bytes]`).join('\n')}

Manifest Architecture:
Raw 3D asset binary bytes preserved intact. This companion ledger validates package authenticity under Khan Mohammed Kaif 3D Animation Specifications.
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
Authorization-Code: [VERIFIED_KMK_OVERRIDE]
Timestamp: ${dateStr}
Total-Files: ${files.length}
Watermark-Status: STRIPPED_CLEAN_EXPORT
Manifest-Notice: Original file blocks served directly without watermark banners.

Files:
${files.map(f => `  - ${f.name} (${f.size} bytes, type: ${f.isText ? 'TEXT' : 'BINARY'})`).join('\n')}
`;
  }

  return `Manifest-Version: 1.0
Created-By: Multi-File ZIP Package Generator via QR (Senior Java Edition)
Security-Mode: MANDATORY_WATERMARK_ENFORCED
Protocol-Signer: Khan Kaif Local Secure Transfer Protocol
Signature-Banner: ${WATERMARK_BANNER}
Timestamp: ${dateStr}
Total-Files: ${files.length}
Watermark-Status: INJECTED_HEADER_AND_METADATA
Notice: Every text-based entry contains the mandatory protocol header. Non-text entries inherit security validation via this root manifest and ZIP comment headers.

Files:
${files.map(f => `  - ${f.name} (${f.size} bytes, text: ${f.isText})`).join('\n')}
`;
}
