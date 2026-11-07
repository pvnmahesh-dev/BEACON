import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Sparkles,
  Settings,
  ShieldCheck,
  FileCheck2,
  LogOut,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useToast } from '../ui/Toast';

interface ProfileDropdownProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToVault?: () => void;
  onResetDemoData?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isOpen,
  onClose,
  onNavigateToProfile,
  onNavigateToVault,
  onResetDemoData,
}) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAction = (label: string) => {
    showToast(`${label} opened`, 'info');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="absolute right-0 mt-3 w-80 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[6px_6px_0px_#252b3a] overflow-hidden z-50 text-[#253044]"
      >
        {/* User Card Header */}
        <div className="p-4 border-b-2 border-[#252b3a] bg-[#fffdf5]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-[10px] object-cover border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#9bf1cd] border-2 border-[#252b3a]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-extrabold text-sm text-[#253044] truncate">
                  {user.name}
                </h3>
                <ShieldCheck className="w-3.5 h-3.5 text-[#6434df] shrink-0" />
              </div>
              <p className="text-xs font-semibold text-[#253044]/70 truncate">{user.handle}</p>
              <p className="text-[11px] text-[#6434df] font-bold truncate mt-0.5">
                {user.degree}
              </p>
            </div>
          </div>

          {/* Profile Strength Bar */}
          <div className="mt-3.5 pt-3 border-t-2 border-[#252b3a]/20">
            <div className="flex items-center justify-between text-xs mb-1.5 font-heading font-bold">
              <span className="text-[#253044] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#6434df]" />
                Profile Strength
              </span>
              <span className="text-[#6434df]">{user.profileCompletion}%</span>
            </div>
            <div className="w-full h-2.5 bg-white border-2 border-[#252b3a] rounded-full overflow-hidden shadow-[1px_1px_0px_#252b3a]">
              <div
                className="h-full bg-gradient-to-r from-[#6434df] to-[#ff78c5] rounded-full"
                style={{ width: `${user.profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Institution Info */}
        <div className="px-4 py-2.5 bg-white border-b-2 border-[#252b3a] flex items-center justify-between text-xs text-[#253044]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#6434df]" />
            <span className="truncate max-w-[170px] font-semibold">{user.institution}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#ffd05b] text-[#253044] font-black text-[11px] border border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
            GPA {user.gpa}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="p-2.5 text-xs space-y-1 bg-white">
          <button
            onClick={() => {
              if (onNavigateToProfile) {
                onNavigateToProfile();
              } else {
                handleAction('Scholar Profile');
              }
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[#253044] hover:bg-[#f1ebff] hover:text-[#6434df] font-heading font-bold transition-all cursor-pointer border border-transparent hover:border-[#252b3a]"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-[#6434df]" />
              <span>Full Scholar Profile & Eligibility</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#253044]/60" />
          </button>

          <button
            onClick={() => {
              if (onNavigateToVault) {
                onNavigateToVault();
              } else {
                handleAction('Document Vault');
              }
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[#253044] hover:bg-[#f1ebff] hover:text-[#6434df] font-heading font-bold transition-all cursor-pointer border border-transparent hover:border-[#252b3a]"
          >
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4 text-[#9bf1cd] stroke-[#253044]" />
              <span>Document Vault & Transcripts</span>
            </div>
            <span className="text-[10px] bg-[#9bf1cd] text-[#253044] font-black px-2 py-0.5 rounded-full border border-[#252b3a]">
              3 verified
            </span>
          </button>

          <button
            onClick={() => handleAction('Match Preferences')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[#253044] hover:bg-[#f1ebff] hover:text-[#6434df] font-heading font-bold transition-all cursor-pointer border border-transparent hover:border-[#252b3a]"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-[#253044]/70" />
              <span>Match Engine Preferences</span>
            </div>
          </button>

          {onResetDemoData && (
            <button
              onClick={() => {
                onResetDemoData();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[#253044] hover:bg-[#ffd05b]/40 font-heading font-bold transition-all cursor-pointer border border-transparent hover:border-[#252b3a]"
            >
              <RotateCcw className="w-4 h-4 text-[#253044]" />
              <span>Reset Demo Data to Defaults</span>
            </button>
          )}
        </div>

        {/* Sign Out */}
        <div className="p-2 border-t-2 border-[#252b3a] bg-[#fffdf5]">
          <button
            onClick={() => handleAction('Session Lock')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-[#253044] hover:bg-[#ff78c5]/30 text-xs font-heading font-bold transition-all border border-transparent hover:border-[#252b3a] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
