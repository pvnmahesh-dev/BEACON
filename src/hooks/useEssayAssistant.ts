import { useState, useEffect, useCallback, useMemo } from 'react';
import { EssayDraft, EssayPrompt, EssayTone, EssayCritiqueResult } from '../types';
import { scholarshipEssayPrompts, initialSampleDrafts } from '../data/essayPromptsData';
import { analyzeEssayText } from '../utils/essayCritiqueEngine';

const DRAFTS_STORAGE_KEY = 'beacon_essay_drafts_v2';

export const useEssayAssistant = () => {
  const [drafts, setDrafts] = useState<EssayDraft[]>(() => {
    try {
      const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored BEACON essay drafts:', e);
    }
    return initialSampleDrafts;
  });

  const [activeDraftId, setActiveDraftId] = useState<string>(() => {
    return initialSampleDrafts[0]?.id || '';
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error('Failed to persist BEACON essay drafts:', e);
    }
  }, [drafts]);

  // Current active draft
  const activeDraft = useMemo(() => {
    return drafts.find((d) => d.id === activeDraftId) || drafts[0] || null;
  }, [drafts, activeDraftId]);

  // Current prompt associated with active draft
  const activePrompt = useMemo(() => {
    if (!activeDraft) return scholarshipEssayPrompts[0];
    return (
      scholarshipEssayPrompts.find((p) => p.id === activeDraft.promptId) ||
      scholarshipEssayPrompts[0]
    );
  }, [activeDraft]);

  // Real-time critique calculation
  const critiqueResult: EssayCritiqueResult = useMemo(() => {
    if (!activeDraft) {
      return analyzeEssayText('', 600, 'Academic');
    }
    return analyzeEssayText(
      activeDraft.content,
      activeDraft.targetWordCount || activePrompt.targetWordCount,
      activeDraft.tone
    );
  }, [activeDraft, activePrompt]);

  // Create new draft from a prompt
  const createDraft = useCallback((prompt: EssayPrompt, title?: string, tone: EssayTone = 'Academic') => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const newDraft: EssayDraft = {
      id: `draft-${Date.now()}`,
      title: title || `${prompt.scholarshipTitle} Statement`,
      promptId: prompt.id,
      promptText: prompt.promptText,
      targetScholarshipTitle: prompt.scholarshipTitle,
      scholarshipId: prompt.scholarshipId,
      content: '',
      tone,
      targetWordCount: prompt.targetWordCount,
      lastUpdated: dateFormatted,
      savedToVault: false,
    };

    setDrafts((prev) => [newDraft, ...prev]);
    setActiveDraftId(newDraft.id);
    return newDraft;
  }, []);

  // Update content of active draft
  const updateContent = useCallback((content: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== activeDraftId) return d;
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
        return {
          ...d,
          content,
          lastUpdated: dateFormatted,
        };
      })
    );
  }, [activeDraftId]);

  // Update draft metadata (title, tone, prompt, word count)
  const updateDraftMeta = useCallback((updates: Partial<EssayDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== activeDraftId) return d;
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
        return {
          ...d,
          ...updates,
          lastUpdated: dateFormatted,
        };
      })
    );
  }, [activeDraftId]);

  // Switch prompt for current draft
  const switchPrompt = useCallback((prompt: EssayPrompt) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== activeDraftId) return d;
        return {
          ...d,
          promptId: prompt.id,
          promptText: prompt.promptText,
          targetScholarshipTitle: prompt.scholarshipTitle,
          scholarshipId: prompt.scholarshipId,
          targetWordCount: prompt.targetWordCount,
        };
      })
    );
  }, [activeDraftId]);

  // Delete a draft
  const deleteDraft = useCallback((id: string) => {
    setDrafts((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (remaining.length > 0 && activeDraftId === id) {
        setActiveDraftId(remaining[0].id);
      }
      return remaining;
    });
  }, [activeDraftId]);

  // Reset to initial sample drafts
  const resetDrafts = useCallback(() => {
    setDrafts(initialSampleDrafts);
    setActiveDraftId(initialSampleDrafts[0].id);
  }, []);

  return {
    drafts,
    activeDraft,
    activePrompt,
    activeDraftId,
    setActiveDraftId,
    critiqueResult,
    createDraft,
    updateContent,
    updateDraftMeta,
    switchPrompt,
    deleteDraft,
    resetDrafts,
    availablePrompts: scholarshipEssayPrompts,
  };
};

