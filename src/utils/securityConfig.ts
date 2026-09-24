import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const DEFAULT_OWNER_CODE = 'BuildWithKMKaif';
const LEGACY_OWNER_CODE = 'KaifOmniMind447';
const COUPON_CODE = 'KaifGive20@';

const STORAGE_KEY_CODE = 'kmk_owner_secret_code';
const STORAGE_KEY_PROTECTION = 'kmk_download_protection_enabled';
const SESSION_KEY_UNLOCKED = 'kmk_download_session_unlocked';

export interface SecurityConfig {
  isProtectionEnabled: boolean;
  isUnlocked: boolean;
  hasCustomCode: boolean;
}

/**
 * Retrieves the currently active secret passcode from local storage.
 * Defaults to the owner master code if none set.
 */
export function getActivePasscode(): string {
  if (typeof window === 'undefined') return DEFAULT_OWNER_CODE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CODE);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // fallback
  }
  return DEFAULT_OWNER_CODE;
}

/**
 * Checks if download protection is enabled (default: true).
 */
export function isDownloadProtectionEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROTECTION);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {
    // fallback
  }
  return true; // Protected by default
}

/**
 * Checks if current browser session is authorized/unlocked.
 */
export function isSessionUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SESSION_KEY_UNLOCKED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Verifies if user-entered code matches the active passcode.
 * NEVER prints or leaks the code in any log or exception.
 */
export function verifySecretCode(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const cleanInput = input.trim();
  const currentCode = getActivePasscode();

  const isValid =
    cleanInput === currentCode ||
    cleanInput.toLowerCase() === currentCode.toLowerCase() ||
    cleanInput === DEFAULT_OWNER_CODE ||
    cleanInput === LEGACY_OWNER_CODE ||
    cleanInput === COUPON_CODE;

  if (isValid) {
    try {
      sessionStorage.setItem(SESSION_KEY_UNLOCKED, 'true');
    } catch {
      // ignore
    }
  }

  return isValid;
}

/**
 * Immediately locks session, requiring passcode entry for subsequent downloads.
 */
export function lockSecuritySession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_KEY_UNLOCKED);
  } catch {
    // ignore
  }
}

/**
 * Changes the owner secret passcode.
 * Persists locally and synchronizes to Cloud Firestore for cross-device enforcement.
 */
export async function updateSecretPasscode(newCode: string): Promise<void> {
  const cleanCode = newCode.trim();
  if (!cleanCode || cleanCode.length < 3) {
    throw new Error('Secret code must be at least 3 characters.');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CODE, cleanCode);
    sessionStorage.setItem(SESSION_KEY_UNLOCKED, 'true');
  }

  // Sync to Cloud Firestore
  try {
    await setDoc(
      doc(db, 'security_config', 'global_settings'),
      {
        secretCode: cleanCode,
        isProtectionEnabled: isDownloadProtectionEnabled(),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not sync security passcode to Firestore:', err);
  }
}

/**
 * Toggles whether entering the secret code is required to download files.
 */
export async function setDownloadProtectionEnabled(enabled: boolean): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PROTECTION, String(enabled));
  }

  // Sync to Cloud Firestore
  try {
    await setDoc(
      doc(db, 'security_config', 'global_settings'),
      {
        isProtectionEnabled: enabled,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not sync protection state to Firestore:', err);
  }
}

/**
 * Synchronizes remote security configuration from Firestore on initialization.
 */
export async function syncRemoteSecurityConfig(): Promise<{ isProtectionEnabled: boolean }> {
  try {
    const snap = await getDoc(doc(db, 'security_config', 'global_settings'));
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data.secretCode === 'string' && data.secretCode.trim().length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_CODE, data.secretCode.trim());
        }
      }
      if (typeof data.isProtectionEnabled === 'boolean') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_PROTECTION, String(data.isProtectionEnabled));
        }
        return { isProtectionEnabled: data.isProtectionEnabled };
      }
    }
  } catch (err) {
    console.warn('Notice loading remote security config:', err);
  }

  return { isProtectionEnabled: isDownloadProtectionEnabled() };
}
