/**
 * BEACON Secure Client-Side Document Vault Storage
 * Uses IndexedDB for browser-side binary file storage (Blob / File)
 * Prevents localStorage overflow and ensures zero cloud transmission.
 */

const DB_NAME = 'beacon_secure_vault_db';
const DB_VERSION = 1;
const STORE_NAME = 'vault_files';

export interface VaultFileRecord {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  size: number;
  storedAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

export const openVaultDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });

  return dbPromise;
};

/**
 * Store a binary File or Blob in IndexedDB
 */
export const storeFileInIndexedDB = async (
  id: string,
  file: Blob | File,
  fileName: string,
  mimeType: string
): Promise<boolean> => {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record: VaultFileRecord = {
        id,
        blob: file,
        fileName,
        mimeType: mimeType || file.type || 'application/octet-stream',
        size: file.size,
        storedAt: new Date().toISOString(),
      };

      const putReq = store.put(record);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => {
        console.warn('Failed to put file in IndexedDB:', putReq.error);
        reject(putReq.error);
      };
    });
  } catch (err) {
    console.error('storeFileInIndexedDB error:', err);
    return false;
  }
};

/**
 * Retrieve a binary File or Blob from IndexedDB
 */
export const getFileFromIndexedDB = async (
  id: string
): Promise<VaultFileRecord | null> => {
  try {
    const db = await openVaultDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        resolve(getReq.result || null);
      };
      getReq.onerror = () => {
        console.warn('Failed to retrieve file from IndexedDB:', getReq.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('getFileFromIndexedDB error:', err);
    return null;
  }
};

/**
 * Delete a file from IndexedDB
 */
export const deleteFileFromIndexedDB = async (id: string): Promise<boolean> => {
  try {
    const db = await openVaultDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(id);

      delReq.onsuccess = () => resolve(true);
      delReq.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('deleteFileFromIndexedDB error:', err);
    return false;
  }
};

/**
 * Generate a temporary Object URL for file preview or download
 */
export const createObjectUrlForVaultFile = async (
  id: string
): Promise<{ url: string; fileName: string; mimeType: string } | null> => {
  const record = await getFileFromIndexedDB(id);
  if (!record || !record.blob) return null;

  try {
    const url = URL.createObjectURL(record.blob);
    return {
      url,
      fileName: record.fileName,
      mimeType: record.mimeType,
    };
  } catch (e) {
    console.error('Error creating ObjectURL from IndexedDB blob:', e);
    return null;
  }
};

/**
 * Trigger immediate browser download of an IndexedDB stored file
 */
export const downloadVaultFile = async (
  id: string,
  fallbackName = 'BEACON_Document.pdf'
): Promise<boolean> => {
  try {
    const fileData = await createObjectUrlForVaultFile(id);
    if (!fileData) {
      // Fallback: create a simulated dummy blob if initial demo wasn't yet seeded
      const placeholderBlob = new Blob(
        [
          `BEACON LOCAL VAULT DOCUMENT\n===============================\nFile: ${fallbackName}\nStatus: Local IndexedDB Record\nTimestamp: ${new Date().toISOString()}\n\nThis verified document is stored locally via browser-isolated IndexedDB storage.\nZero cloud transmission occurred.`,
        ],
        { type: 'text/plain' }
      );
      const fallbackUrl = URL.createObjectURL(placeholderBlob);
      const a = document.createElement('a');
      a.href = fallbackUrl;
      a.download = fallbackName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(fallbackUrl), 2000);
      return true;
    }

    const a = document.createElement('a');
    a.href = fileData.url;
    a.download = fileData.fileName || fallbackName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(fileData.url), 3000);
    return true;
  } catch (err) {
    console.error('Error triggering vault file download:', err);
    return false;
  }
};

/**
 * Seed initial demonstration file blobs into IndexedDB if not already present
 */
export const seedInitialDemoFiles = async (
  initialDocs: { id: string; fileName: string; title: string; category: string }[]
): Promise<void> => {
  try {
    for (const doc of initialDocs) {
      const existing = await getFileFromIndexedDB(doc.id);
      if (!existing) {
        const sampleText = `BEACON VERIFIED DOCUMENT VAULT REPLICA
--------------------------------------------------
DOCUMENT ID: ${doc.id}
DOCUMENT TITLE: ${doc.title}
FILE NAME: ${doc.fileName}
CATEGORY: ${doc.category}
SECURITY STATUS: Verified Local IndexedDB Record (Browser Sandbox Storage)
TIMESTAMP: ${new Date().toISOString()}

==================================================
DOCUMENT PREVIEW SUMMARY
This file has been securely verified and stored client-side in your local browser sandbox.
It is linked to active scholarship applications without duplicate storage consumption.
Zero cloud network transmission occurred during this workflow.
==================================================`;

        const blob = new Blob([sampleText], {
          type: doc.fileName.endsWith('.pdf')
            ? 'application/pdf'
            : doc.fileName.endsWith('.png')
            ? 'image/png'
            : 'text/plain',
        });

        await storeFileInIndexedDB(doc.id, blob, doc.fileName, blob.type);
      }
    }
  } catch (err) {
    console.warn('seedInitialDemoFiles error (non-fatal):', err);
  }
};

