import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Building2,
  Bookmark,
  ArrowRight,
  GraduationCap,
  Clock,
  Globe2,
  XCircle
} from 'lucide-react';
import { Scholarship } from '../../types';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onViewDetails: (scholarship: Scholarship) => void;
  onToggleBookmark: (id: string, title?: string) => void;
  isBookmarked: boolean;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  onViewDetails,
  onToggleBookmark,
  isBookmarked,
}) => {
  const { showToast } = useToast();

  const handleQuickApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`Demo Application draft created for ${scholarship.title}!`, 'success');
  };

  const getDaysUrgencyClass = (days: number) => {
    if (days <= 7) return 'text-[#253044] bg-[#ffd05b] border-2 border-[#252b3a]';
    if (days <= 14) return 'text-[#253044] bg-[#9bf1cd] border-2 border-[#252b3a]';
    return 'text-[#253044] bg-[#fffdf5] border-2 border-[#252b3a]';
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'eligible':
        return 'bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a]';
      case 'potentially_eligible':
        return 'bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a]';
      case 'not_eligible':
        return 'bg-[#ff78c5] text-[#253044] border-2 border-[#252b3a]';
      case 'insufficient_information':
        return 'bg-[#f1ebff] text-[#6434df] border-2 border-[#252b3a]';
      default:
        return 'bg-[#fffdf5] text-[#253044] border-2 border-[#252b3a]';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      onClick={() => onViewDetails(scholarship)}
      className={`group cursor-pointer rounded-[17px] bg-white border-[2.5px] border-[#252b3a] p-5 flex flex-col justify-between relative transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 ${
        scholarship.eligibilityStatus === 'not_eligible'
          ? 'shadow-[4px_4px_0px_#ff78c5] hover:shadow-[6px_6px_0px_#ff78c5]'
          : 'shadow-[4px_4px_0px_#252b3a] hover:shadow-[6px_6px_0px_#252b3a]'
      }`}
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="mint" size="sm" dot>
              {scholarship.category}
            </Badge>

            {/* Calculated Match Percentage */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-heading font-black border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a] ${
                scholarship.eligibilityStatus === 'not_eligible'
                  ? 'bg-[#ff78c5] text-[#253044]'
                  : 'bg-[#6434df] text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#ffd05b]" />
              <span>{scholarship.matchScore}% Match</span>
            </span>

            {/* Eligibility Status Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold shadow-[1px_1px_0px_#252b3a] ${getStatusBadgeStyle(
                scholarship.eligibilityStatus
              )}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{scholarship.statusLabel || 'Evaluated'}</span>
            </span>

            {/* Clear Demonstration Record Pill */}
            {scholarship.isDemo && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black uppercase tracking-wider bg-[#fffdf5] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]"
                title="Realistic Hackathon Demonstration Record"
              >
                Demo
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(scholarship.id, scholarship.title);
            }}
            className={`p-2 rounded-[10px] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-[#ffd05b] text-[#253044]'
                : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark scholarship'}
            title={isBookmarked ? 'Bookmarked' : 'Save opportunity'}
          >
            <Bookmark className={`w-3.5 h-3.5 stroke-[2.5] ${isBookmarked ? 'fill-[#253044]' : ''}`} />
          </button>
        </div>

        {/* Title & Provider */}
        <div className="mb-3">
          <h3 className="font-heading font-black text-base sm:text-lg text-[#253044] group-hover:text-[#6434df] transition-colors line-clamp-1 leading-snug">
            {scholarship.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#253044]/70 mt-1">
            <Building2 className="w-3.5 h-3.5 text-[#6434df] shrink-0" />
            <span className="truncate">{scholarship.provider}</span>
          </div>
        </div>

        {/* Disqualifying Alert Banner if Failed Mandatory Criteria */}
        {scholarship.disqualifyingReason && (
          <div className="p-2.5 mb-3 rounded-[12px] bg-[#ff78c5]/20 border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-start gap-2 text-[11px] text-[#253044] font-medium leading-snug">
            <XCircle className="w-3.5 h-3.5 text-[#ff78c5] fill-[#253044] shrink-0 mt-0.5" />
            <span>
              <strong className="font-heading font-black">Disqualified:</strong> {scholarship.disqualifyingReason}
            </span>
          </div>
        )}

        {/* Award Amount & Deadline Box */}
        <div className="flex items-baseline justify-between gap-2 py-3 px-3.5 rounded-[12px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] mb-3.5">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#253044]/60 block">
              Grant Award
            </span>
            <span className="text-xl sm:text-2xl font-heading font-black text-[#253044]">
              {scholarship.awardFormatted}
            </span>
            <span className="text-[10px] text-[#6434df] font-bold block mt-0.5">
              {scholarship.fundingType || 'Award Grant'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-black tracking-wider text-[#253044]/60 block">
              Deadline
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-heading font-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#252b3a] ${getDaysUrgencyClass(
                scholarship.daysLeft
              )}`}
            >
              <Clock className="w-3 h-3 stroke-[2.5]" />
              <span>{scholarship.daysLeft}d left</span>
            </span>
            <span className="text-[10px] text-[#253044]/70 font-semibold block mt-0.5">
              {scholarship.deadline}
            </span>
          </div>
        </div>

        {/* Description Excerpt */}
        <p className="text-xs text-[#253044]/80 font-medium line-clamp-2 leading-relaxed mb-3">
          {scholarship.description}
        </p>

        {/* Location & Education tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-bold text-[#253044]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
            <Globe2 className="w-3 h-3 text-[#6434df]" />
            <span>{scholarship.country || 'Global'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
            <GraduationCap className="w-3 h-3 text-[#ff78c5]" />
            <span>{scholarship.educationLevel}</span>
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t-2 border-[#252b3a] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#253044]/70">
          <span>Min GPA: <strong className="font-heading font-black text-[#253044]">{scholarship.gpaRequirement ? scholarship.gpaRequirement.toFixed(2) : 'Open'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {scholarship.eligibilityStatus !== 'not_eligible' ? (
            <button
              onClick={handleQuickApply}
              className="px-3 py-1.5 rounded-[10px] bg-[#6434df] hover:bg-[#5527cb] text-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs font-heading font-bold transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Quick Apply
            </button>
          ) : (
            <span className="text-[11px] text-[#253044] font-heading font-bold px-2 py-1 bg-[#ff78c5] rounded-md border border-[#252b3a]">
              Ineligible
            </span>
          )}
          <button
            onClick={() => onViewDetails(scholarship)}
            className="p-1.5 rounded-[10px] bg-white hover:bg-[#fffdf5] text-[#253044] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer hover:-translate-y-0.5"
            title="View full requirements breakdown"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
