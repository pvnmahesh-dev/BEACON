import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  DollarSign,
  Award,
  Sparkles,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Bookmark,
  Share2,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Globe2,
  GraduationCap,
  AlertTriangle,
  Check,
  Layers,
  Plus
} from 'lucide-react';
import { Scholarship } from '../../types';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface ScholarshipDetailModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string, title?: string) => void;
  isBookmarked: boolean;
  isApplicationTracked?: boolean;
  applicationStatus?: string;
  onAddToApplications?: (scholarship: Scholarship) => void;
  onNavigateToApplications?: () => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  isOpen,
  onClose,
  onToggleBookmark,
  isBookmarked,
  isApplicationTracked = false,
  applicationStatus,
  onAddToApplications,
  onNavigateToApplications,
}) => {
  const { showToast } = useToast();

  if (!scholarship) return null;

  const handleStartApplication = () => {
    showToast(
      `Demo Application initiated for "${scholarship.title}". Portal link opened!`,
      'success'
    );
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Scholarship opportunity link copied to clipboard!', 'info');
    }
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#253044]/65 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-3xl bg-white border-[3px] border-[#252b3a] rounded-[20px] shadow-[8px_8px_0px_#252b3a] overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col text-[#253044]"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b-2 border-[#252b3a] bg-[#fffdf5] flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="mint" dot>
                    {scholarship.category}
                  </Badge>

                  {/* Deterministic Match Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-heading font-black bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffd05b]" />
                    <span>{scholarship.matchScore}% Match Score</span>
                  </span>

                  {/* Eligibility Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-heading font-extrabold shadow-[1.5px_1.5px_0px_#252b3a] ${getStatusBadgeStyle(
                      scholarship.eligibilityStatus
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{scholarship.statusLabel || 'Evaluated'}</span>
                  </span>

                  {/* Clearly Identified Demo Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-black uppercase tracking-wider bg-white text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
                    <Info className="w-3 h-3 stroke-[2.5]" />
                    <span>Demo Record</span>
                  </span>

                  {/* Application Tracker Status Pill if already tracked */}
                  {isApplicationTracked && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-heading font-black bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
                      <Layers className="w-3 h-3 stroke-[2.5]" />
                      <span>In Tracker: {applicationStatus}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-heading font-black text-[#253044] tracking-tight leading-snug">
                  {scholarship.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#253044]/75">
                  <span className="flex items-center gap-1.5 text-[#253044] font-bold">
                    <Building2 className="w-3.5 h-3.5 text-[#6434df]" />
                    <span>{scholarship.provider}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#6434df]" />
                    <span>{scholarship.country || 'Global'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#ff78c5]" />
                    <span>{scholarship.educationLevel}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleBookmark(scholarship.id, scholarship.title)}
                  className={`p-2.5 rounded-[12px] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer ${
                    isBookmarked
                      ? 'bg-[#ffd05b] text-[#253044]'
                      : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
                  }`}
                  aria-label="Bookmark scholarship"
                  title={isBookmarked ? 'Bookmarked' : 'Save opportunity'}
                >
                  <Bookmark className={`w-4 h-4 stroke-[2.5] ${isBookmarked ? 'fill-[#253044]' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-[12px] bg-white text-[#253044] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] hover:bg-[#fffdf5] transition-all cursor-pointer"
                  aria-label="Share opportunity"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-[12px] bg-white text-[#253044] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] hover:bg-[#ff78c5] transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 bg-white">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-[14px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                  <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#253044]/70 mb-1">
                    <DollarSign className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                    <span>Funding Amount</span>
                  </div>
                  <div className="text-2xl font-heading font-black text-[#253044]">
                    {scholarship.awardFormatted}
                  </div>
                  <div className="text-[11px] text-[#6434df] font-bold mt-0.5">
                    {scholarship.fundingType || 'Award Grant'}
                  </div>
                </div>

                <div className="p-4 rounded-[14px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                  <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#253044]/70 mb-1">
                    <Clock className="w-4 h-4 text-[#ff78c5] stroke-[2.5]" />
                    <span>Submission Deadline</span>
                  </div>
                  <div className="text-2xl font-heading font-black text-[#253044]">
                    {scholarship.daysLeft} Days Left
                  </div>
                  <div className="text-[11px] text-[#253044]/80 font-bold mt-0.5">
                    Closes: {scholarship.deadline}
                  </div>
                </div>

                <div className="p-4 rounded-[14px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a]">
                  <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#253044]/70 mb-1">
                    <Award className="w-4 h-4 text-[#9bf1cd] stroke-[#253044] stroke-[2.5]" />
                    <span>Academic Threshold</span>
                  </div>
                  <div className="text-2xl font-heading font-black text-[#253044]">
                    {scholarship.gpaRequirement ? `${scholarship.gpaRequirement.toFixed(2)}+` : 'Open GPA'}
                  </div>
                  <div className="text-[11px] text-[#253044]/80 font-bold mt-0.5">
                    {scholarship.maxIncomeLimit ? `Income Cap: $${scholarship.maxIncomeLimit.toLocaleString()}` : 'No Income Cap'}
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#253044]/70">
                  Opportunity Description
                </h3>
                <p className="text-sm text-[#253044] leading-relaxed font-medium">
                  {scholarship.description}
                </p>
              </div>

              {/* TRANSPARENT MATCH BREAKDOWN SECTION */}
              <div className="p-5 rounded-[17px] bg-[#fffdf5] border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#6434df] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#252b3a]/20">
                  <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#6434df] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6434df]" />
                    Transparent Eligibility Match Breakdown ({scholarship.matchScore}%)
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-bold ${getStatusBadgeStyle(scholarship.eligibilityStatus)}`}>
                    {scholarship.statusLabel}
                  </span>
                </div>

                {/* Explanation Statement */}
                {scholarship.explanation && (
                  <div className="p-3.5 rounded-[12px] bg-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs text-[#253044] font-medium leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#6434df] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>{scholarship.explanation}</span>
                  </div>
                )}

                {/* Disqualifying Alert if Applicable */}
                {scholarship.disqualifyingReason && (
                  <div className="p-3.5 rounded-[12px] bg-[#ff78c5]/25 border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs text-[#253044] leading-relaxed flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-[#ff78c5] fill-[#253044] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-heading font-black text-[#253044] mb-0.5">Disqualifying Mandatory Criterion:</strong>
                      {scholarship.disqualifyingReason}
                    </div>
                  </div>
                )}

                {/* Requirements Satisfied vs Not Satisfied */}
                <div className="space-y-3 pt-2">
                  {/* Requirements Satisfied */}
                  {scholarship.requirementsSatisfied && scholarship.requirementsSatisfied.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-heading font-black uppercase tracking-wider text-[#253044] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#253044] fill-[#9bf1cd]" />
                        Requirements Satisfied ({scholarship.requirementsSatisfied.length})
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#253044] font-medium">
                        {scholarship.requirementsSatisfied.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-2 rounded-[10px] bg-[#e9fff5] border-2 border-[#252b3a]">
                            <Check className="w-3.5 h-3.5 text-[#253044] shrink-0 mt-0.5 stroke-[3]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements Not Satisfied */}
                  {scholarship.requirementsNotSatisfied && scholarship.requirementsNotSatisfied.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-heading font-black uppercase tracking-wider text-[#253044] flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#ff78c5] fill-[#253044]" />
                        Requirements Not Satisfied ({scholarship.requirementsNotSatisfied.length})
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#253044] font-medium">
                        {scholarship.requirementsNotSatisfied.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-2 rounded-[10px] bg-[#ff78c5]/20 border-2 border-[#252b3a]">
                            <X className="w-3.5 h-3.5 text-[#253044] shrink-0 mt-0.5 stroke-[3]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Information */}
                  {scholarship.missingInformation && scholarship.missingInformation.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-heading font-black uppercase tracking-wider text-[#253044] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#253044] fill-[#ffd05b]" />
                        Missing Profile Information ({scholarship.missingInformation.length})
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#253044] font-medium">
                        {scholarship.missingInformation.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 p-2 rounded-[10px] bg-[#ffd05b]/25 border-2 border-[#252b3a]">
                            <Info className="w-3.5 h-3.5 text-[#253044] shrink-0 mt-0.5 stroke-[2.5]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Deterministic Evaluation Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t-2 border-[#252b3a]/20">
                  {scholarship.matchFactors?.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-[12px] border-2 border-[#252b3a] flex items-start gap-2.5 ${
                        factor.passed
                          ? 'bg-white shadow-[2px_2px_0px_#252b3a]'
                          : 'bg-[#fffdf5] opacity-80'
                      }`}
                    >
                      {factor.passed ? (
                        <CheckCircle className="w-4 h-4 text-[#253044] fill-[#9bf1cd] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#253044] fill-[#ff78c5] shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-heading font-black text-[#253044]">
                            {factor.factor}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#6434df] bg-[#f1ebff] px-1.5 py-0.5 rounded border border-[#252b3a]">
                            +{factor.scoreContribution}/{factor.maxScore} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-[#253044]/80 font-medium leading-tight">
                          {factor.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Published Requirements Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#253044]/70 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#6434df]" />
                  Published Requirements Checklist
                </h3>
                <ul className="space-y-2 text-xs text-[#253044] font-medium">
                  {scholarship.eligibility?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-[12px] bg-[#fffdf5] border-2 border-[#252b3a]">
                      <CheckCircle2 className="w-4 h-4 text-[#253044] fill-[#9bf1cd] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div className="space-y-3">
                <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#253044]/70 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#ff78c5]" />
                  Required Documents & Deliverables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scholarship.requiredDocuments?.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[12px] bg-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs flex items-center gap-2.5 text-[#253044] font-semibold"
                    >
                      <div className="w-6 h-6 rounded-[8px] bg-[#6434df] text-white border border-[#252b3a] flex items-center justify-center shrink-0 text-[11px] font-black">
                        {idx + 1}
                      </div>
                      <span className="leading-snug">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo Notice Disclaimer */}
              <div className="p-3.5 rounded-[12px] bg-[#ffd05b]/30 border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-start gap-3 text-xs text-[#253044] font-medium">
                <Info className="w-4 h-4 text-[#253044] shrink-0 mt-0.5 stroke-[2.5]" />
                <p className="leading-relaxed">
                  <strong>Hackathon Demonstration Notice:</strong> This scholarship record is realistic demonstration data created for testing BEACON's discovery engine, filters, and deterministic matching engine.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 bg-[#fffdf5] border-t-2 border-[#252b3a] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-heading font-bold text-[#253044] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9bf1cd] border border-[#252b3a]" />
                <span>Deterministic Criteria Verification</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {isApplicationTracked ? (
                  onNavigateToApplications && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToApplications();
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-[12px] border-2 border-[#252b3a] bg-[#ffd05b] text-[#253044] shadow-[2.5px_2.5px_0px_#252b3a] text-xs font-heading font-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 stroke-[2.5]" />
                      <span>Open in Application Tracker</span>
                    </button>
                  )
                ) : (
                  onAddToApplications && (
                    <button
                      onClick={() => {
                        onAddToApplications(scholarship);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-[12px] border-2 border-[#252b3a] bg-[#ffd05b] text-[#253044] shadow-[2.5px_2.5px_0px_#252b3a] text-xs font-heading font-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Track in Applications</span>
                    </button>
                  )
                )}

                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-[12px] border-2 border-[#252b3a] bg-white text-xs font-heading font-bold text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#fffdf5] transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleStartApplication}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white text-xs sm:text-sm font-heading font-bold border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Apply Now [Demo Portal]</span>
                  <ExternalLink className="w-4 h-4 text-[#ffd05b] stroke-[2.5]" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
