export const WATERMARK_BANNER = "// BuildWithKMKaif";
export const SECRET_AUTH_CODE = "KaifGive20@";

// Known text extensions
const TEXT_EXTENSIONS = new Set([
  'txt', 'java', 'py', 'js', 'ts', 'jsx', 'tsx', 'csv', 'json', 
  'xml', 'html', 'css', 'scss', 'md', 'c', 'cpp', 'h', 'hpp', 
  'cs', 'kt', 'kts', 'rs', 'go', 'rb', 'php', 'sh', 'sql', 'yaml', 'yml', 'properties', 'env'
]);

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
 * Applies watermark injection to text content.
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
