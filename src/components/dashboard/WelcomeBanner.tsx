import React from 'react';
import { Sparkles, ArrowRight, RefreshCw, Zap, Award } from 'lucide-react';
import { UserProfile } from '../../types';
import { useToast } from '../ui/Toast';

interface WelcomeBannerProps {
  user: UserProfile;
  onExploreRecommendations: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  user,
  onExploreRecommendations,
}) => {
  const { showToast } = useToast();

  const handleSyncData = () => {
    showToast('Syncing transcript and criteria parameters with academic records...', 'info');
    setTimeout(() => {
      showToast('Profile sync complete! 4 additional STEM opportunities matched.', 'success');
    }, 1000);
  };

  return (
    <div className="relative rounded-[17px] p-6 sm:p-8 bg-white border-[2.5px] border-[#252b3a] shadow-[6px_6px_0px_#6434df] overflow-hidden">
      {/* Playful Geometric Decorative Shapes (Static & Non-obstructive) */}
      <div className="absolute top-4 right-12 w-8 h-8 rounded-full bg-[#ff78c5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] hidden sm:block pointer-events-none" />
      <div className="absolute top-16 right-4 w-6 h-6 rotate-12 bg-[#ffd05b] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] hidden sm:block pointer-events-none" />
      <div className="absolute bottom-3 right-64 w-10 h-5 rounded-t-full bg-[#9bf1cd] border-2 border-[#252b3a] hidden md:block pointer-events-none" />

      {/* Small Section Identification Tab */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] mb-4">
        <Sparkles className="w-3.5 h-3.5 text-[#6434df]" />
        <span>BEACON Criteria Match Engine Active</span>
        <span className="w-2 h-2 rounded-full bg-[#253044]" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Welcome Copy */}
        <div className="max-w-2xl space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#253044] tracking-tight">
            Welcome back, <span className="text-[#6434df]">{user.name}</span>
          </h1>

          <p className="text-sm sm:text-base text-[#596174] font-medium leading-relaxed">
            Your intelligence engine identified{' '}
            <span className="text-[#6434df] font-bold">22 qualified scholarship opportunities</span>{' '}
            matching your <span className="text-[#253044] font-bold bg-[#f1ebff] px-1.5 py-0.5 rounded border border-[#252b3a]/30">{user.degree}</span> track at{' '}
            <span className="text-[#253044] font-bold">{user.institution}</span>.
          </p>

          {/* Quick CTA Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreRecommendations}
              className="px-5 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white text-xs sm:text-sm font-heading font-bold border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-y-0.5 active:translate-y-0.5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore Recommendations</span>
              <ArrowRight className="w-4 h-4 text-[#ffd05b]" />
            </button>

            <button
              onClick={handleSyncData}
              className="px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#fffdf5] text-[#253044] border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:-translate-y-0.5 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#6434df]" />
              <span>Sync Coursework</span>
            </button>
          </div>
        </div>

        {/* Right Snapshot Card */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-[14px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[4px_4px_0px_#252b3a]">
          {/* Profile Strength Circle */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="#252b3a"
                  strokeWidth="5"
                  fill="white"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="#6434df"
                  strokeWidth="5"
                  strokeDasharray={144.5}
                  strokeDashoffset={144.5 - (144.5 * user.profileCompletion) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-heading font-black text-xs text-[#253044]">
                {user.profileCompletion}%
              </span>
            </div>

            <div>
              <div className="text-xs font-heading font-bold text-[#253044] flex items-center gap-1">
                <span>Profile Match Power</span>
                <Zap className="w-3.5 h-3.5 text-[#ffd05b]" />
              </div>
              <span className="text-[11px] text-[#253044]/70 font-semibold">Targeting STEM Grants</span>
              <button
                onClick={() => showToast('Boost checklist: update Spring transcript to gain +8% match confidence.', 'info')}
                className="text-[11px] text-[#6434df] font-black hover:text-[#5527cb] block mt-0.5 cursor-pointer"
              >
                +8% Boost Available →
              </button>
            </div>
          </div>

          <div className="hidden sm:block w-0.5 h-10 bg-[#252b3a]" />

          {/* Total Pipeline Funding Potential */}
          <div className="px-1 sm:px-2">
            <div className="text-[11px] text-[#253044]/70 font-bold flex items-center gap-1 mb-0.5">
              <Award className="w-3.5 h-3.5 text-[#6434df]" />
              <span>Target Funding Pool</span>
            </div>
            <div className="text-xl sm:text-2xl font-heading font-black text-[#253044]">
              $135,500
            </div>
            <div className="inline-block mt-0.5 text-[10px] font-black text-[#253044] bg-[#9bf1cd] px-2 py-0.5 rounded-full border border-[#252b3a]">
              4 active applications
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
