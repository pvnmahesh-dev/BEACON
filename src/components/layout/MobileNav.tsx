import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Compass,
  LayoutDashboard,
  FileText,
  Calendar,
  FolderArchive,
  PenTool,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useToast } from '../ui/Toast';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  applicationsCount?: number;
  vaultCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  user,
  applicationsCount = 4,
  vaultCount,
}) => {
  const { showToast } = useToast();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover', label: 'Scholarship Discovery', icon: Compass, count: '22' },
    { id: 'profile', label: 'Profile & Eligibility', icon: UserCheck, count: 'Match' },
    { id: 'applications', label: 'My Applications', icon: FileText, count: `${applicationsCount}` },
    { id: 'deadlines', label: 'Deadlines & Tasks', icon: Calendar, count: '2 urgent' },
    { id: 'vault', label: 'Document Vault', icon: FolderArchive, count: vaultCount ? `${vaultCount}` : undefined },
    { id: 'assistant', label: 'AI Essay Assistant', icon: PenTool, count: 'AI' },
    { id: 'analytics', label: 'Analytics & Financials', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id: string, label: string) => {
    setActiveTab(id);
    onClose();
    if (id !== 'dashboard' && id !== 'discover' && id !== 'profile') {
      showToast(`Switched view to ${label}`, 'info');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
          />

          {/* Drawer Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#fffdf5] border-r-[3px] border-[#252b3a] p-6 flex flex-col justify-between shadow-[6px_0px_0px_#252b3a] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b-2 border-[#252b3a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-white border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      src="/beacon-icon.png"
                      alt="BEACON"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-extrabold text-xl text-[#253044]">
                        BEACON
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#9bf1cd] text-[#253044] border border-[#252b3a]">
                        v2.4
                      </span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#596174]">
                      Scholarship Platform
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-[10px] bg-white border-2 border-[#252b3a] text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#ff78c5] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="py-5 space-y-1.5">
                <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[#596174]">
                  Navigation
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id, item.label)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-heading font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a]'
                          : 'text-[#253044] hover:bg-[#f1ebff] hover:text-[#253044] border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 stroke-[2.5] ${
                            isActive ? 'text-[#ffd05b]' : 'text-[#253044]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.count && (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#252b3a] ${
                            isActive ? 'bg-[#ffd05b] text-[#253044]' : 'bg-white text-[#253044]'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Profile Snapshot */}
            <div className="pt-4 border-t-2 border-[#252b3a]">
              <div className="p-3 rounded-[14px] bg-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-[10px] object-cover border-2 border-[#252b3a]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-heading font-bold text-[#253044] truncate">{user.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6434df] shrink-0" />
                  </div>
                  <span className="text-[11px] text-[#596174] font-semibold truncate block">
                    {user.institution}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#596174] px-1">
                <span className="flex items-center gap-1 text-[#6434df]">
                  <Sparkles className="w-3 h-3 text-[#6434df]" />
                  Criteria Engine Active
                </span>
                <span className="bg-[#9bf1cd] text-[#253044] px-1.5 py-0.5 rounded border border-[#252b3a]">
                  ONLINE
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
