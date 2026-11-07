import { useState, useEffect, useCallback, useMemo } from 'react';
import { VaultDocument, VaultDocumentCategory, VerificationStatus } from '../types';
import { initialVaultDocuments } from '../data/vaultData';
import {
  storeFileInIndexedDB,
  deleteFileFromIndexedDB,
  downloadVaultFile,
  createObjectUrlForVaultFile,
  seedInitialDemoFiles,
} from '../utils/indexedDBStorage';

const VAULT_STORAGE_KEY = 'beacon_vault_documents_v2';
const MAX_STORAGE_BYTES = 104857600; // 100 MB client-side quota limit

export const useDocumentVault = () => {
  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse BEACON document vault from localStorage:', e);
    }
    return initialVaultDocuments;
  });

  // Seed initial demo file blobs into IndexedDB on mount
  useEffect(() => {
    seedInitialDemoFiles(initialVaultDocuments);
  }, []);

  // Persist metadata to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.error('Failed to store BEACON vault documents metadata:', e);
    }
  }, [documents]);

  /**
   * Add a new document to the vault with real IndexedDB binary persistence
   */
  const addDocument = useCallback(
    async (
      file: File,
      meta: {
        title: string;
        category: VaultDocumentCategory;
        verificationStatus?: VerificationStatus;
        verificationIssuer?: string;
        tags?: string[];
        description?: string;
        initialApplicationId?: string;
      }
    ): Promise<VaultDocument> => {
      const docId = `vault-doc-${Date.now()}`;
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      // Format human-readable file size
      const bytes = file.size;
      const formattedSize =
        bytes > 1048576
          ? `${(bytes / 1048576).toFixed(1)} MB`
          : `${Math.round(bytes / 1024)} KB`;

      // Determine fileType
      let fileType: 'pdf' | 'docx' | 'doc' | 'png' | 'jpg' | 'other' = 'other';
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') fileType = 'pdf';
      else if (ext === 'docx') fileType = 'docx';
      else if (ext === 'doc') fileType = 'doc';
      else if (ext === 'png') fileType = 'png';
      else if (ext === 'jpg' || ext === 'jpeg') fileType = 'jpg';

      // Store binary file in IndexedDB
      await storeFileInIndexedDB(docId, file, file.name, file.type);

      const docRecord: VaultDocument = {
        id: docId,
        title: meta.title || file.name,
        fileName: file.name,
        fileSize: formattedSize,
        fileSizeBytes: bytes,
        category: meta.category,
        uploadDate: dateFormatted,
        lastModified: dateFormatted,
        verificationStatus: meta.verificationStatus || 'Uploaded',
        verificationIssuer: meta.verificationIssuer || 'Uploaded Locally by Student',
        linkedApplicationIds: meta.initialApplicationId ? [meta.initialApplicationId] : [],
        tags: meta.tags && meta.tags.length > 0 ? meta.tags : [meta.category, 'Local Vault'],
        description: meta.description || 'Verified local client-side document copy.',
        fileType,
        mimeType: file.type || 'application/octet-stream',
      };

      setDocuments((prev) => [docRecord, ...prev]);
      return docRecord;
    },
    []
  );

  /**
   * Rename a document
   */
  const renameDocument = useCallback(
    (id: string, newTitle: string, newFileName?: string) => {
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id !== id) return doc;
          const now = new Date();
          const dateFormatted = now.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          });
          return {
            ...doc,
            title: newTitle.trim() || doc.title,
            fileName: newFileName ? newFileName.trim() : doc.fileName,
            lastModified: dateFormatted,
          };
        })
      );
    },
    []
  );

  /**
   * Update document metadata
   */
  const updateDocument = useCallback((id: string, updates: Partial<VaultDocument>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== id) return doc;
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
        return {
          ...doc,
          ...updates,
          lastModified: dateFormatted,
        };
      })
    );
  }, []);

  /**
   * Delete document and purge from IndexedDB
   */
  const deleteDocument = useCallback(async (id: string) => {
    await deleteFileFromIndexedDB(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  /**
   * Link document to an application (reuse without duplicate file storage)
   */
  const linkDocumentToApplication = useCallback((docId: string, appId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        if (doc.linkedApplicationIds.includes(appId)) return doc;
        return {
          ...doc,
          linkedApplicationIds: [...doc.linkedApplicationIds, appId],
        };
      })
    );
  }, []);

  /**
   * Unlink document from an application
   */
  const unlinkDocumentFromApplication = useCallback((docId: string, appId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          linkedApplicationIds: doc.linkedApplicationIds.filter((id) => id !== appId),
        };
      })
    );
  }, []);

  /**
   * Download document file from IndexedDB
   */
  const downloadDocument = useCallback(async (doc: VaultDocument) => {
    return await downloadVaultFile(doc.id, doc.fileName);
  }, []);

  /**
   * Reset to initial demo records
   */
  const resetVault = useCallback(async () => {
    setDocuments(initialVaultDocuments);
    await seedInitialDemoFiles(initialVaultDocuments);
  }, []);

  /**
   * Live storage and categorization metrics
   */
  const vaultStats = useMemo(() => {
    const totalCount = documents.length;
    const verifiedCount = documents.filter((d) => d.verificationStatus === 'Verified').length;
    const pendingCount = documents.filter((d) => d.verificationStatus === 'Pending Verification').length;
    const uploadedCount = documents.filter((d) => d.verificationStatus === 'Uploaded').length;
    const expiredCount = documents.filter((d) => d.verificationStatus === 'Expired').length;
    const totalBytes = documents.reduce((sum, d) => sum + (d.fileSizeBytes || 500000), 0);
    const usedMB = (totalBytes / (1024 * 1024)).toFixed(1);
    const usedPercentage = Math.min(100, Math.round((totalBytes / MAX_STORAGE_BYTES) * 100));

    // Category distribution
    const categoryCounts: Record<VaultDocumentCategory, number> = {
      'Academic Transcripts': 0,
      'Identification': 0,
      'Recommendation Letters': 0,
      'Personal Statements': 0,
      'Resume/CV': 0,
      'Financial Documents': 0,
      'Certificates': 0,
      'Other': 0,
    };

    documents.forEach((d) => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    });

    return {
      totalCount,
      verifiedCount,
      pendingCount,
      uploadedCount,
      expiredCount,
      totalBytes,
      usedMB,
      capacityMB: '100.0',
      usedPercentage: Math.max(usedPercentage, 8),
      categoryCounts,
    };
  }, [documents]);

  return {
    documents,
    addDocument,
    renameDocument,
    updateDocument,
    deleteDocument,
    linkDocumentToApplication,
    unlinkDocumentFromApplication,
    downloadDocument,
    resetVault,
    vaultStats,
  };
};
