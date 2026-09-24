/**
 * Helper utility to resolve URLs for QR codes and mobile receivers.
 * 
 * In Google AI Studio:
 * - Development URL has prefix 'ais-dev-...', which is the active running dev server.
 * - Shared App URL has prefix 'ais-pre-...', which is provisioned once the user clicks 'Share' in the AI Studio header.
 *   Before the user clicks 'Share', the ais-pre domain returns HTTP 404 Not Found.
 * - Direct download endpoints (/api/download/:id) trigger immediate file saving.
 */

export function getDevAppUrl(path: string = ''): string {
  if (typeof window === 'undefined') return '';
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${window.location.origin}${cleanPath}`;
}

export function getSharedAppUrl(path: string = ''): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${origin}${cleanPath}`;
}

export function getDirectDownloadUrl(packageId: string, preferShared: boolean = false): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;
  if (preferShared && origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  return `${origin}/api/download/${encodeURIComponent(packageId)}`;
}

export function getPublicUniversalUrl(path: string = ''): string {
  if (typeof window === 'undefined') return '';
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${window.location.origin}${cleanPath}`;
}

export function isDevSandboxEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.origin.includes('ais-dev-');
}
