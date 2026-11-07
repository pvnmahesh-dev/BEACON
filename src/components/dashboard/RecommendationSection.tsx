import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  RefreshCcw,
  Search,
  ArrowRight
} from 'lucide-react';
import { Scholarship } from '../../types';
import { ScholarshipCard } from './ScholarshipCard';
import { useToast } from '../ui/Toast';

interface RecommendationSectionProps {
  scholarships: Scholarship[];
  onViewDetails: (scholarship: Scholarship) => void;
  searchQuery: string;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string, title?: string) => void;
  onOpenDiscovery?: () => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  scholarships,
  onViewDetails,
  searchQuery,
  bookmarkedIds,
  onToggleBookmark,
  onOpenDiscovery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const { showToast } = useToast();

  const categories = ['All', 'STEM', 'Merit', 'Research', 'Diversity', 'Leadership'];

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Bookmarked filter
      if (onlyBookmarked && !bookmarkedIds.has(item.id)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesProvider = item.provider.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesProvider || matchesDesc || matchesTags;
      }
      return true;
    });
  }, [scholarships, selectedCategory, onlyBookmarked, searchQuery, bookmarkedIds]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setOnlyBookmarked(false);
    showToast('Filters reset to default view', 'info');
  };

  return (
    <div className="space-y-4" id="recommendations-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#253044] tracking-tight">
              Recommended For You
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-heading font-black bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              {filteredScholarships.length} Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#253044]/70 font-medium mt-1">
            Prioritized by deterministic criteria match, deadline urgency, and verified academic parameters.
          </p>
        </div>

        {/* Actions: Bookmarked toggle & Discovery link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOnlyBookmarked(!onlyBookmarked);
              showToast(
                !onlyBookmarked
                  ? 'Showing bookmarked opportunities only'
                  : 'Showing all matching opportunities',
                'info'
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border-2 border-[#252b3a] text-xs font-heading font-bold transition-all cursor-pointer ${
              onlyBookmarked
                ? 'bg-[#ffd05b] text-[#253044] shadow-[2.5px_2.5px_0px_#252b3a]'
                : 'bg-white text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#fffdf5]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 stroke-[2.5] ${onlyBookmarked ? 'fill-[#253044]' : ''}`} />
            <span>Saved ({bookmarkedIds.size})</span>
          </button>

          {onOpenDiscovery && (
            <button
              onClick={onOpenDiscovery}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] border-2 border-[#252b3a] bg-[#6434df] hover:bg-[#5527cb] text-white text-xs font-heading font-bold shadow-[2.5px_2.5px_0px_#252b3a] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Discovery Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ffd05b]" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-[12px] text-xs font-heading font-bold whitespace-nowrap transition-all border-2 border-[#252b3a] cursor-pointer ${
                isSelected
                  ? 'bg-[#6434df] text-white shadow-[2.5px_2.5px_0px_#252b3a]'
                  : 'bg-white text-[#253044] shadow-[1.5px_1.5px_0px_#252b3a] hover:bg-[#fffdf5]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Scholarships Grid */}
      {filteredScholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredScholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                onViewDetails={onViewDetails}
                onToggleBookmark={onToggleBookmark}
                isBookmarked={bookmarkedIds.has(scholarship.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-[#f1ebff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-[#6434df]">
            <Search className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-[#253044] text-lg">
              No matching scholarships found
            </h3>
            <p className="text-xs text-[#253044]/70 max-w-sm mt-1 font-medium">
              Try adjusting your search query, category filter pills, or toggle off the "Saved" filter.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] text-xs font-heading font-bold transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
