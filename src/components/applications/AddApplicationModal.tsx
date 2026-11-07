import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Bookmark,
  Building2,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { Scholarship, ApplicationStatus } from '../../types';
import { initialScholarshipDatabase } from '../../data/scholarshipDatabase';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApplication: (
    scholarship: Scholarship,
    initialStatus: ApplicationStatus,
    personalNotes?: string
  ) => void;
  bookmarkedIds: string[] | Set<string>;
  alreadyTrackedScholarshipIds: string[];
}

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  onClose,
  onAddApplication,
  bookmarkedIds,
  alreadyTrackedScholarshipIds,
}) => {
  const { showToast } = useToast();

  const [selectedSchId, setSelectedSchId] = useState<string>('');
  const [initialStatus, setInitialStatus] = useState<ApplicationStatus>('Applying');
  const [personalNotes, setPersonalNotes] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'saved'>('saved');

  const bookmarksArray = useMemo(() => {
    return Array.isArray(bookmarkedIds) ? bookmarkedIds : Array.from(bookmarkedIds);
  }, [bookmarkedIds]);

  // Find bookmarked scholarships that aren't already tracked
  const availableSavedScholarships = initialScholarshipDatabase.filter(
    (s) => bookmarksArray.includes(s.id) && !alreadyTrackedScholarshipIds.includes(s.id)
  );

  // All available scholarships that aren't already tracked
  const availableAllScholarships = initialScholarshipDatabase.filter(
    (s) => !alreadyTrackedScholarshipIds.includes(s.id)
  );

  const displayList = filterMode === 'saved' && availableSavedScholarships.length > 0
    ? availableSavedScholarships
    : availableAllScholarships;

  // Auto-select first available scholarship
  React.useEffect(() => {
    if (displayList.length > 0 && (!selectedSchId || !displayList.some((s) => s.id === selectedSchId))) {
      setSelectedSchId(displayList[0].id);
    }
  }, [displayList, selectedSchId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSch = initialScholarshipDatabase.find((s) => s.id === selectedSchId);
    if (!targetSch) {
      showToast('Please select a scholarship to track.', 'warning');
      return;
    }

    onAddApplication(targetSch, initialStatus, personalNotes);
    showToast(`Added "${targetSch.title}" to application tracker!`, 'success');
    onClose();
  };

  const selectedScholarship = initialScholarshipDatabase.find((s) => s.id === selectedSchId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] overflow-hidden z-10 p-6 space-y-5 font-reading"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
            <h3 className="font-display font-bold text-lg text-[#253044] flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#ffd05b] border-[2px] border-[#252b3a] flex items-center justify-center shadow-[2px_2px_0px_#252b3a]">
                <Plus className="w-4 h-4 stroke-[3] text-[#253044]" />
              </div>
              <span>Track New Scholarship Application</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[10px] text-[#253044] hover:bg-[#ff78c5] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-reading">
            {/* Quick Switcher: Saved Bookmarks vs Entire Database */}
            <div className="flex items-center justify-between">
              <label className="text-[#253044] font-bold">
                Select Opportunity:
              </label>

              <div className="flex items-center gap-1 p-1 rounded-[10px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
                <button
                  type="button"
                  onClick={() => setFilterMode('saved')}
                  className={`px-2.5 py-1 rounded-[7px] text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'saved'
                      ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                      : 'text-[#253044] hover:bg-[#f1ebff]'
                  }`}
                >
                  Saved Bookmarks ({availableSavedScholarships.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-[7px] text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                      : 'text-[#253044] hover:bg-[#f1ebff]'
                  }`}
                >
                  All Opportunities ({availableAllScholarships.length})
                </button>
              </div>
            </div>

            {/* Opportunity Dropdown */}
            {displayList.length > 0 ? (
              <select
                value={selectedSchId}
                onChange={(e) => setSelectedSchId(e.target.value)}
                className="w-full p-3 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a] cursor-pointer"
              >
                {displayList.map((sch) => (
                  <option key={sch.id} value={sch.id} className="bg-white">
                    {sch.title} — {sch.awardFormatted} ({sch.provider})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] text-center font-bold text-[#253044]/70">
                {filterMode === 'saved'
                  ? 'All of your saved scholarships are already in the application pipeline.'
                  : 'All scholarship opportunities are already in your pipeline.'}
              </div>
            )}

            {/* Selected Snapshot Preview */}
            {selectedScholarship && (
              <div className="p-3.5 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-[#253044] text-sm">
                      {selectedScholarship.title}
                    </h4>
                    <p className="text-[11px] font-reading text-[#253044]/70">{selectedScholarship.provider}</p>
                  </div>
                  <span className="font-display font-extrabold text-[#6434df] text-base">
                    {selectedScholarship.awardFormatted}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#253044]/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6434df]" />
                    <span>Deadline: {selectedScholarship.deadline}</span>
                  </span>
                  <span>•</span>
                  <span>Level: {selectedScholarship.educationLevel}</span>
                </div>
              </div>
            )}

            {/* Initial Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[#253044] font-bold block">
                Initial Pipeline Status:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Saved', 'Applying', 'Submitted'] as ApplicationStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setInitialStatus(st)}
                    className={`py-2 px-3 rounded-[12px] font-bold text-xs border-[2px] border-[#252b3a] transition-all cursor-pointer ${
                      initialStatus === st
                        ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
                        : 'bg-[#fffdf5] text-[#253044] hover:bg-[#f1ebff]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Notes */}
            <div className="space-y-1.5">
              <label className="text-[#253044] font-bold block">
                Personal Notes / Strategy (Optional):
              </label>
              <textarea
                rows={3}
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Advisor recommendations, essay progress, priority level..."
                className="w-full p-3 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-reading outline-none focus:ring-2 focus:ring-[#6434df] resize-none leading-relaxed shadow-[2px_2px_0px_#252b3a]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t-[2px] border-[#252b3a]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[12px] text-xs font-bold text-[#253044] hover:bg-[#fffdf5] border-[2px] border-transparent hover:border-[#252b3a] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSchId}
                className="px-4 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                Track in Application Center
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
