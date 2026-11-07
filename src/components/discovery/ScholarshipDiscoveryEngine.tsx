import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Bookmark,
  DollarSign,
  GraduationCap,
  Globe2,
  Check,
  Info
} from 'lucide-react';
import {
  Scholarship,
  ScholarshipCategory,
  SortOption
} from '../../types';
import { ScholarshipCard } from '../dashboard/ScholarshipCard';
import { useToast } from '../ui/Toast';

interface ScholarshipDiscoveryEngineProps {
  scholarships: Scholarship[];
  onViewDetails: (scholarship: Scholarship) => void;
  onToggleBookmark: (id: string, title?: string) => void;
  bookmarkedIds: Set<string>;
  initialSearchQuery?: string;
  onBackToDashboard?: () => void;
}

export const ScholarshipDiscoveryEngine: React.FC<ScholarshipDiscoveryEngineProps> = ({
  scholarships,
  onViewDetails,
  onToggleBookmark,
  bookmarkedIds,
  initialSearchQuery = '',
  onBackToDashboard,
}) => {
  const { showToast } = useToast();

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<ScholarshipCategory[]>([]);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('All');
  const [selectedFundingRange, setSelectedFundingRange] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible' | 'potentially_eligible' | 'not_eligible'>('all');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('match-desc');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  const availableCategories: ScholarshipCategory[] = [
    'STEM',
    'Merit',
    'Research',
    'Diversity',
    'Leadership',
  ];

  const educationLevels: string[] = ['All', 'Undergraduate', 'Graduate', 'All Levels'];

  const fundingRanges = [
    { label: 'All Funding', value: 'All' },
    { label: 'Under $20,000', value: 'under-20k' },
    { label: '$20,000 – $35,000', value: '20k-35k' },
    { label: '$35,000+', value: '35k-plus' },
  ];

  const countries = [
    'All',
    'United States',
    'Global',
    'Canada',
    'United Kingdom',
    'Germany',
    'Australia',
  ];

  // Category toggle
  const toggleCategory = (cat: ScholarshipCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Active filter count
  const activeFilterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedEducationLevel !== 'All' ? 1 : 0) +
    (selectedFundingRange !== 'All' ? 1 : 0) +
    (selectedCountry !== 'All' ? 1 : 0) +
    (eligibilityFilter !== 'all' ? 1 : 0) +
    (onlySaved ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedEducationLevel('All');
    setSelectedFundingRange('All');
    setSelectedCountry('All');
    setEligibilityFilter('all');
    setOnlySaved(false);
    setSortBy('match-desc');
    showToast('All search filters reset', 'info');
  };

  // Filter & Sort Logic
  const filteredScholarships = useMemo(() => {
    return scholarships
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesProvider = item.provider.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
          const matchesCountry = item.country ? item.country.toLowerCase().includes(q) : false;
          if (
            !matchesTitle &&
            !matchesProvider &&
            !matchesDesc &&
            !matchesTags &&
            !matchesCountry
          ) {
            return false;
          }
        }

        // Category filter (allow multi-select)
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(item.category)
        ) {
          return false;
        }

        // Education level filter
        if (
          selectedEducationLevel !== 'All' &&
          item.educationLevel !== selectedEducationLevel &&
          item.educationLevel !== 'All Levels'
        ) {
          return false;
        }

        // Country filter
        if (selectedCountry !== 'All' && item.country !== selectedCountry) {
          return false;
        }

        // Funding Range filter
        if (selectedFundingRange === 'under-20k' && item.awardAmount >= 20000) {
          return false;
        }
        if (
          selectedFundingRange === '20k-35k' &&
          (item.awardAmount < 20000 || item.awardAmount > 35000)
        ) {
          return false;
        }
        if (selectedFundingRange === '35k-plus' && item.awardAmount < 35000) {
          return false;
        }

        // Eligibility Status filter
        if (eligibilityFilter !== 'all' && item.eligibilityStatus !== eligibilityFilter) {
          return false;
        }

        // Saved / Bookmarks only
        if (onlySaved && !bookmarkedIds.has(item.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'funding-desc':
            return b.awardAmount - a.awardAmount;
          case 'funding-asc':
            return a.awardAmount - b.awardAmount;
          case 'deadline-asc':
            return a.daysLeft - b.daysLeft;
          case 'date-desc': {
            const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
            const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
            return dateB - dateA;
          }
          case 'match-desc':
          default:
            return b.matchScore - a.matchScore;
        }
      });
  }, [
    scholarships,
    searchQuery,
    selectedCategories,
    selectedEducationLevel,
    selectedCountry,
    selectedFundingRange,
    eligibilityFilter,
    onlySaved,
    sortBy,
    bookmarkedIds,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Engine Header */}
      <div className="rounded-[17px] p-6 sm:p-8 bg-white border-[2.5px] border-[#252b3a] shadow-[6px_6px_0px_#6434df] relative overflow-hidden">
        {/* Geometric Decorative Accent */}
        <div className="absolute top-4 right-10 w-9 h-9 rounded-full bg-[#ffd05b] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] hidden sm:block pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-heading font-black bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              <Sparkles className="w-3.5 h-3.5 text-[#6434df]" />
              <span>BEACON Discovery Engine</span>
              <span className="w-2 h-2 rounded-full bg-[#253044]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-black bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              <Info className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Demonstration Database Active ({scholarships.length} Records)</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#253044] tracking-tight">
                Scholarship <span className="text-[#6434df]">Discovery Engine</span>
              </h1>
              <p className="text-sm text-[#596174] font-medium max-w-2xl mt-1 leading-relaxed">
                Filter verified and realistic demonstration scholarship records with deterministic profile eligibility comparisons and real-time portfolio saving.
              </p>
            </div>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="self-start md:self-auto px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#fffdf5] text-xs font-heading font-bold text-[#253044] border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] transition-all cursor-pointer hover:-translate-y-0.5"
              >
                ← Return to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Search, Filter & Controls Panel */}
      <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] space-y-4">
        {/* Top Control Bar: Search Input, Quick Filters Toggle, Sort, Saved Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596174] group-focus-within:text-[#6434df] transition-colors stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship title, provider, keyword, or technology..."
              className="w-full pl-10 pr-9 py-2.5 rounded-[12px] bg-[#ffffff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] focus:border-[#6434df] focus:shadow-[3px_3px_0px_#6434df] text-sm font-reading font-medium text-[#253044] placeholder-[#596174] transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#596174] hover:text-[#253044] cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Sort Dropdown & Saved Bookmarks Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-[#ffffff] border-2 border-[#252b3a] rounded-[12px] px-3 py-2 text-xs shadow-[2px_2px_0px_#252b3a]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6434df] mr-2 shrink-0 stroke-[2.5]" />
              <span className="text-[#596174] mr-1.5 font-bold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort scholarships"
                className="bg-transparent text-[#253044] font-heading font-bold outline-none cursor-pointer pr-1"
              >
                <option value="match-desc">Highest Match</option>
                <option value="funding-desc">Highest Funding</option>
                <option value="funding-asc">Lowest Funding</option>
                <option value="deadline-asc">Closing Soon</option>
                <option value="date-desc">Recently Added</option>
              </select>
            </div>

            {/* Saved Only Filter Toggle */}
            <button
              onClick={() => {
                setOnlySaved(!onlySaved);
                showToast(
                  !onlySaved
                    ? 'Displaying saved scholarships'
                    : 'Displaying all opportunities',
                  'info'
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs font-heading font-bold border-2 border-[#252b3a] transition-all cursor-pointer ${
                onlySaved
                  ? 'bg-[#ffd05b] text-[#253044] shadow-[2.5px_2.5px_0px_#252b3a]'
                  : 'bg-white text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#fffdf5]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 stroke-[2.5] ${onlySaved ? 'fill-[#253044]' : ''}`} />
              <span>Saved ({bookmarkedIds.size})</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs font-heading font-bold border-2 border-[#252b3a] transition-all cursor-pointer ${
                showFiltersPanel || activeFilterCount > 0
                  ? 'bg-[#9bf1cd] text-[#253044] shadow-[2.5px_2.5px_0px_#252b3a]'
                  : 'bg-white text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#fffdf5]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#ff78c5] text-[#253044] font-black text-[10px] flex items-center justify-center border border-[#252b3a]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear All Filters Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-1 px-2.5 py-2 rounded-[12px] text-xs font-heading font-bold text-red-600 hover:bg-red-50 border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Eligibility Status Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t-2 border-[#252b3a]/15">
          <span className="text-[11px] font-heading font-black uppercase tracking-wider text-[#253044]/60 shrink-0 mr-1">
            Eligibility:
          </span>
          <button
            onClick={() => setEligibilityFilter('all')}
            className={`px-3 py-1 rounded-[10px] text-xs font-heading font-bold transition-all border-2 border-[#252b3a] shrink-0 cursor-pointer ${
              eligibilityFilter === 'all'
                ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
            }`}
          >
            All Statuses
          </button>
          <button
            onClick={() => setEligibilityFilter('eligible')}
            className={`px-3 py-1 rounded-[10px] text-xs font-heading font-bold transition-all border-2 border-[#252b3a] shrink-0 flex items-center gap-1.5 cursor-pointer ${
              eligibilityFilter === 'eligible'
                ? 'bg-[#9bf1cd] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#e9fff5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#253044]" />
            <span>Eligible Only</span>
          </button>
          <button
            onClick={() => setEligibilityFilter('potentially_eligible')}
            className={`px-3 py-1 rounded-[10px] text-xs font-heading font-bold transition-all border-2 border-[#252b3a] shrink-0 flex items-center gap-1.5 cursor-pointer ${
              eligibilityFilter === 'potentially_eligible'
                ? 'bg-[#ffd05b] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#ffd05b]/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#253044]" />
            <span>Potentially Eligible</span>
          </button>
          <button
            onClick={() => setEligibilityFilter('not_eligible')}
            className={`px-3 py-1 rounded-[10px] text-xs font-heading font-bold transition-all border-2 border-[#252b3a] shrink-0 flex items-center gap-1.5 cursor-pointer ${
              eligibilityFilter === 'not_eligible'
                ? 'bg-[#ff78c5] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#ff78c5]/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#253044]" />
            <span>Disqualified</span>
          </button>
        </div>

        {/* Category Filter Pills (Multi-Select) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-heading font-black uppercase tracking-wider text-[#253044]/60 shrink-0 mr-1">
            Categories:
          </span>
          <button
            onClick={() => setSelectedCategories([])}
            className={`px-3 py-1 rounded-[10px] text-xs font-heading font-bold transition-all border-2 border-[#252b3a] shrink-0 cursor-pointer ${
              selectedCategories.length === 0
                ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
            }`}
          >
            All Categories
          </button>
          {availableCategories.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-[10px] text-xs font-heading font-bold transition-all border-2 border-[#252b3a] shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#ffd05b] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                    : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Expandable Filter Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-3 border-t-2 border-[#252b3a]/15 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Education Level Filter */}
                <div className="space-y-1.5">
                  <label className="text-[#253044] font-heading font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#6434df]" />
                    <span>Education Level</span>
                  </label>
                  <select
                    value={selectedEducationLevel}
                    onChange={(e) => setSelectedEducationLevel(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-[#253044] font-semibold outline-none"
                  >
                    {educationLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl === 'All' ? 'All Education Levels' : lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Funding Range Filter */}
                <div className="space-y-1.5">
                  <label className="text-[#253044] font-heading font-bold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#ff78c5]" />
                    <span>Funding Amount</span>
                  </label>
                  <select
                    value={selectedFundingRange}
                    onChange={(e) => setSelectedFundingRange(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-[#253044] font-semibold outline-none"
                  >
                    {fundingRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div className="space-y-1.5">
                  <label className="text-[#253044] font-heading font-bold flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#ffd05b]" />
                    <span>Country / Geographic Scope</span>
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-[#253044] font-semibold outline-none"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c === 'All' ? 'All Countries & Regions' : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header: Count & Active Query Tag */}
      <div className="flex items-center justify-between text-xs text-[#253044] px-1 font-semibold">
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-sm">
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
          </span>
          {activeFilterCount > 0 && (
            <span className="bg-[#ffd05b] px-2 py-0.5 rounded-full border border-[#252b3a] text-[10px] font-black">
              {activeFilterCount} active filters
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#253044]/70">
          <Sparkles className="w-3.5 h-3.5 text-[#6434df]" />
          <span>Profile comparison active: Alex Rivera • UC Berkeley • 3.85 GPA</span>
        </div>
      </div>

      {/* Scholarship Cards Grid or Empty States */}
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
      ) : onlySaved ? (
        /* Empty State: No Saved Bookmarks */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] text-center flex flex-col items-center justify-center gap-3"
        >
          <div className="w-14 h-14 rounded-[12px] bg-[#ffd05b] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-[#253044] flex items-center justify-center">
            <Bookmark className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="font-heading font-black text-xl text-[#253044]">
            No saved scholarships yet
          </h3>
          <p className="text-xs sm:text-sm text-[#253044]/70 max-w-md font-medium">
            Click the bookmark icon on any scholarship card to save opportunities to your portfolio for quick access.
          </p>
          <button
            onClick={() => setOnlySaved(false)}
            className="mt-2 px-5 py-2.5 rounded-[12px] bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] text-xs font-heading font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Explore All Opportunities
          </button>
        </motion.div>
      ) : (
        /* Empty State: No Search / Filter Matches */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] text-center flex flex-col items-center justify-center gap-3"
        >
          <div className="w-14 h-14 rounded-[12px] bg-[#f1ebff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-[#6434df] flex items-center justify-center">
            <Search className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="font-heading font-black text-xl text-[#253044]">
            No scholarships found
          </h3>
          <p className="text-xs sm:text-sm text-[#253044]/70 max-w-md font-medium">
            No opportunities match your current search query "{searchQuery}" and applied filters. Try adjusting your parameters.
          </p>
          <button
            onClick={handleClearAllFilters}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] text-xs font-heading font-bold transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
