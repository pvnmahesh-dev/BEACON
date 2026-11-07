import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

const STORAGE_KEY = 'beacon_saved_scholarships';

export function useBookmarks(initialIds: string[] = ['sch-1', 'sch-3']) {
  const { showToast } = useToast();

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse bookmarks from localStorage', e);
    }
    return new Set(initialIds);
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(bookmarkedIds))
      );
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarkedIds]);

  const toggleBookmark = useCallback(
    (id: string, scholarshipTitle?: string) => {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          showToast(
            scholarshipTitle
              ? `Removed "${scholarshipTitle}" from saved list`
              : 'Scholarship removed from saved list',
            'info'
          );
        } else {
          next.add(id);
          showToast(
            scholarshipTitle
              ? `Saved "${scholarshipTitle}" to portfolio!`
              : 'Saved to your scholarship portfolio!',
            'success'
          );
        }
        return next;
      });
    },
    [showToast]
  );

  const isBookmarked = useCallback(
    (id: string) => bookmarkedIds.has(id),
    [bookmarkedIds]
  );

  return {
    bookmarkedIds,
    toggleBookmark,
    isBookmarked,
    bookmarkedCount: bookmarkedIds.size,
  };
}

