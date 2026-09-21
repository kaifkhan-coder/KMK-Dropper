import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { QueuedFile } from '../types';

export interface CloudPackage {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileCount: number;
  totalSize: number;
  isSingleFile: boolean;
  isBypassActive: boolean;
  files: {
    id: string;
    name: string;
    size: number;
    type?: string;
    isText: boolean;
    content?: string;
  }[];
  createdAt: string;
}

export function getWorkspaceId(): string {
  if (typeof window === 'undefined') return 'workspace-default';
  let id = localStorage.getItem('qr_transfer_workspace_id');
  if (!id) {
    id = 'wk-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('qr_transfer_workspace_id', id);
  }
  return id;
}

export async function savePackageToCloud(
  workspaceId: string,
  title: string,
  files: QueuedFile[],
  isBypassActive: boolean
): Promise<string> {
  const packageId = 'cloud-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const isSingle = files.length === 1;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  const serializedFiles = files.map(f => ({
    id: f.id,
    name: f.name,
    size: f.size,
    type: f.type || 'text/plain',
    isText: f.isText,
    content: f.isText ? (f.content || '') : undefined
  }));

  const newPkg: CloudPackage = {
    id: packageId,
    userId: workspaceId,
    title: title.trim() || (isSingle ? files[0].name : `Package (${files.length} files)`),
    fileName: isSingle ? files[0].name : `${title.replace(/\s+/g, '_') || 'Archive'}.zip`,
    fileCount: files.length,
    totalSize,
    isSingleFile: isSingle,
    isBypassActive,
    files: serializedFiles,
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'packages', packageId);
    await setDoc(docRef, newPkg);
  } catch (err) {
    console.warn('Firestore write warning, saving locally:', err);
  }

  // Also maintain in localStorage cache
  try {
    const existing = JSON.parse(localStorage.getItem('saved_cloud_packages') || '[]');
    localStorage.setItem('saved_cloud_packages', JSON.stringify([newPkg, ...existing.slice(0, 40)]));
  } catch (e) {
    // Ignore local storage error
  }

  return packageId;
}

export async function loadUserPackages(workspaceId: string): Promise<CloudPackage[]> {
  try {
    const q = query(
      collection(db, 'packages'),
      where('userId', '==', workspaceId)
    );
    const querySnapshot = await getDocs(q);
    const packages: CloudPackage[] = [];
    querySnapshot.forEach((doc) => {
      packages.push(doc.data() as CloudPackage);
    });

    if (packages.length > 0) {
      packages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return packages;
    }
  } catch (err) {
    console.warn('Could not query Firestore directly:', err);
  }

  // Fallback to local snapshot storage
  try {
    const local = JSON.parse(localStorage.getItem('saved_cloud_packages') || '[]');
    return local;
  } catch {
    return [];
  }
}

export async function deleteUserPackage(packageId: string) {
  try {
    const docRef = doc(db, 'packages', packageId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Failed to delete doc in Firestore:', err);
  }

  try {
    const local = JSON.parse(localStorage.getItem('saved_cloud_packages') || '[]');
    const filtered = local.filter((p: CloudPackage) => p.id !== packageId);
    localStorage.setItem('saved_cloud_packages', JSON.stringify(filtered));
  } catch {
    // ignore
  }
}
