import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ApplicationRecord,
  ApplicationStatus,
  DocumentChecklistStatus,
  Scholarship,
} from '../types';
import {
  initialApplicationRecords,
  createStandardDocuments,
  createStandardTimeline,
  calculateApplicationProgress,
} from '../data/initialApplications';

const APPLICATIONS_STORAGE_KEY = 'beacon_applications_v2';

export interface FundingAnalytics {
  totalPursued: number;
  fundingAwarded: number;
  underReviewCount: number;
  awardedCount: number;
  activeCount: number;
  totalCount: number;
  statusCounts: Record<ApplicationStatus, number>;
  statusFunding: Record<ApplicationStatus, number>;
}

export const useApplications = () => {
  const [applications, setApplications] = useState<ApplicationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored BEACON applications:', e);
    }
    return initialApplicationRecords;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to persist BEACON applications to localStorage:', e);
    }
  }, [applications]);

  // Check if a scholarship is already tracked
  const hasApplication = useCallback(
    (scholarshipId: string): boolean => {
      return applications.some((app) => app.scholarshipId === scholarshipId);
    },
    [applications]
  );

  // Get application by scholarshipId
  const getApplication = useCallback(
    (scholarshipId: string): ApplicationRecord | undefined => {
      return applications.find((app) => app.scholarshipId === scholarshipId);
    },
    [applications]
  );

  // Add a new scholarship to Applications
  const addApplication = useCallback(
    (
      scholarship: Scholarship,
      initialStatus: ApplicationStatus = 'Applying',
      personalNotes = ''
    ): { success: boolean; application: ApplicationRecord; alreadyExisted: boolean } => {
      const existing = applications.find((a) => a.scholarshipId === scholarship.id);
      if (existing) {
        return { success: true, application: existing, alreadyExisted: true };
      }

      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      const docs = createStandardDocuments();
      const timeline = createStandardTimeline(initialStatus, dateFormatted);
      const progress = calculateApplicationProgress(docs, timeline, initialStatus);

      const newApp: ApplicationRecord = {
        id: `app-${Date.now()}-${scholarship.id}`,
        scholarshipId: scholarship.id,
        scholarshipName: scholarship.title,
        provider: scholarship.provider,
        fundingAmount: scholarship.awardAmount || 0,
        fundingFormatted: scholarship.awardFormatted || `$${(scholarship.awardAmount || 0).toLocaleString()}`,
        deadline: scholarship.deadline,
        status: initialStatus,
        submissionDate: initialStatus === 'Submitted' ? dateFormatted : undefined,
        personalNotes: personalNotes || `Initiated application tracking for ${scholarship.title}.`,
        progressPercentage: progress,
        documents: docs,
        timeline: timeline,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        category: scholarship.category,
        educationLevel: scholarship.educationLevel,
        portalUrl: scholarship.applicationUrl || `https://beacon.internal/portal/${scholarship.id}`,
      };

      setApplications((prev) => [newApp, ...prev]);
      return { success: true, application: newApp, alreadyExisted: false };
    },
    [applications]
  );

  // Update application details (notes, submission date, etc.)
  const updateApplication = useCallback(
    (id: string, updates: Partial<ApplicationRecord>) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== id) return app;
          const updated = {
            ...app,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          updated.progressPercentage = calculateApplicationProgress(
            updated.documents,
            updated.timeline,
            updated.status
          );
          return updated;
        })
      );
    },
    []
  );

  // Change application status and update timeline accordingly
  const changeStatus = useCallback(
    (id: string, newStatus: ApplicationStatus) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== id) return app;

          const now = new Date();
          const dateFormatted = now.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          });

          // Update timeline milestone completion based on new status
          const updatedTimeline = app.timeline.map((step) => {
            if (newStatus === 'Submitted' && step.stage === 'submitted') {
              return { ...step, completed: true, date: dateFormatted };
            }
            if (newStatus === 'Under Review' && (step.stage === 'submitted' || step.stage === 'under_review')) {
              return { ...step, completed: true, date: dateFormatted };
            }
            if (newStatus === 'Awarded') {
              return { ...step, completed: true, date: step.date || dateFormatted };
            }
            if (newStatus === 'Rejected') {
              return { ...step, completed: true, date: step.date || dateFormatted };
            }
            return step;
          });

          const submissionDate =
            newStatus === 'Submitted' || newStatus === 'Under Review' || newStatus === 'Awarded'
              ? app.submissionDate || dateFormatted
              : app.submissionDate;

          const updated: ApplicationRecord = {
            ...app,
            status: newStatus,
            submissionDate,
            timeline: updatedTimeline,
            updatedAt: now.toISOString(),
          };

          updated.progressPercentage = calculateApplicationProgress(
            updated.documents,
            updated.timeline,
            newStatus
          );

          return updated;
        })
      );
    },
    []
  );

  // Advance to next logical stage
  const advanceToNextStatus = useCallback(
    (id: string): ApplicationStatus | null => {
      const order: ApplicationStatus[] = ['Saved', 'Applying', 'Submitted', 'Under Review', 'Awarded'];
      const target = applications.find((a) => a.id === id);
      if (!target) return null;

      const currentIndex = order.indexOf(target.status);
      if (currentIndex >= 0 && currentIndex < order.length - 1) {
        const nextStatus = order[currentIndex + 1];
        changeStatus(id, nextStatus);
        return nextStatus;
      }
      return null;
    },
    [applications, changeStatus]
  );

  // Update a single document's status in the checklist
  const updateDocumentStatus = useCallback(
    (appId: string, docId: string, status: DocumentChecklistStatus, fileName?: string) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== appId) return app;

          const now = new Date();
          const dateFormatted = now.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          });

          const updatedDocs = app.documents.map((doc) => {
            if (doc.id !== docId) return doc;
            return {
              ...doc,
              status,
              fileName: fileName !== undefined ? fileName : (status === 'ready' && !doc.fileName ? `${doc.name.replace(/\s+/g, '_')}_Verified.pdf` : doc.fileName),
              lastUpdated: status === 'ready' ? dateFormatted : doc.lastUpdated,
            };
          });

          const updated: ApplicationRecord = {
            ...app,
            documents: updatedDocs,
            updatedAt: now.toISOString(),
          };

          updated.progressPercentage = calculateApplicationProgress(
            updated.documents,
            updated.timeline,
            updated.status
          );

          return updated;
        })
      );
    },
    []
  );

  // Add custom document to an application's checklist
  const addCustomDocument = useCallback((appId: string, name: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const newDoc = {
          id: `custom-doc-${Date.now()}`,
          name: name.trim(),
          category: 'other' as const,
          status: 'pending' as const,
          required: false,
        };
        const updatedDocs = [...app.documents, newDoc];
        const updated = {
          ...app,
          documents: updatedDocs,
          updatedAt: new Date().toISOString(),
        };
        updated.progressPercentage = calculateApplicationProgress(
          updatedDocs,
          app.timeline,
          app.status
        );
        return updated;
      })
    );
  }, []);

  // Delete custom document from checklist
  const deleteCustomDocument = useCallback((appId: string, docId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const updatedDocs = app.documents.filter((d) => d.id !== docId);
        const updated = {
          ...app,
          documents: updatedDocs,
          updatedAt: new Date().toISOString(),
        };
        updated.progressPercentage = calculateApplicationProgress(
          updatedDocs,
          app.timeline,
          app.status
        );
        return updated;
      })
    );
  }, []);

  // Toggle milestone event in timeline
  const updateMilestone = useCallback(
    (appId: string, milestoneId: string, completed: boolean) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== appId) return app;

          const updatedTimeline = app.timeline.map((step) => {
            if (step.id !== milestoneId) return step;
            return { ...step, completed };
          });

          const updated: ApplicationRecord = {
            ...app,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };

          updated.progressPercentage = calculateApplicationProgress(
            updated.documents,
            updatedTimeline,
            updated.status
          );

          return updated;
        })
      );
    },
    []
  );

  // Delete an application
  const deleteApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Reset to initial seed applications
  const resetApplications = useCallback(() => {
    setApplications(initialApplicationRecords);
  }, []);

  // Compute live funding analytics
  const fundingAnalytics: FundingAnalytics = useMemo(() => {
    const statusCounts: Record<ApplicationStatus, number> = {
      'Saved': 0,
      'Applying': 0,
      'Submitted': 0,
      'Under Review': 0,
      'Awarded': 0,
      'Rejected': 0,
    };

    const statusFunding: Record<ApplicationStatus, number> = {
      'Saved': 0,
      'Applying': 0,
      'Submitted': 0,
      'Under Review': 0,
      'Awarded': 0,
      'Rejected': 0,
    };

    let totalPursued = 0;
    let fundingAwarded = 0;

    applications.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      statusFunding[app.status] = (statusFunding[app.status] || 0) + (app.fundingAmount || 0);

      // Total funding being pursued includes active non-closed applications
      if (['Saved', 'Applying', 'Submitted', 'Under Review'].includes(app.status)) {
        totalPursued += app.fundingAmount || 0;
      }

      // Funding awarded: strictly awarded only! Never treat pending funding as awarded.
      if (app.status === 'Awarded') {
        fundingAwarded += app.fundingAmount || 0;
      }
    });

    const activeCount =
      statusCounts['Saved'] +
      statusCounts['Applying'] +
      statusCounts['Submitted'] +
      statusCounts['Under Review'];

    return {
      totalPursued,
      fundingAwarded,
      underReviewCount: statusCounts['Under Review'] || 0,
      awardedCount: statusCounts['Awarded'] || 0,
      activeCount,
      totalCount: applications.length,
      statusCounts,
      statusFunding,
    };
  }, [applications]);

  return {
    applications,
    hasApplication,
    getApplication,
    addApplication,
    updateApplication,
    changeStatus,
    advanceToNextStatus,
    updateDocumentStatus,
    addCustomDocument,
    deleteCustomDocument,
    updateMilestone,
    deleteApplication,
    resetApplications,
    fundingAnalytics,
  };
};

