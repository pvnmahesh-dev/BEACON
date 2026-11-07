import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Compass,
  LayoutDashboard,
  FileText,
  Calendar,
  FolderArchive,
  PenTool,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  UserCheck,
  X
} from 'lucide-react';
import { useToast } from '../ui/Toast';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  applicationsCount?: number;
  vaultCount?: number;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  applicationsCount = 4,
  vaultCount,
  menuButtonRef,
}) => {
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(isOpen);

  // Focus management: Return focus to menu toggle button when sidebar closes
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      menuButtonRef?.current?.focus();
    }
    if (!wasOpenRef.current && isOpen) {
      // Focus close button on open for instant keyboard access
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, menuButtonRef]);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'discover',
      label: 'Scholarship Discovery',
      icon: Compass,
      badge: { text: '22', bg: 'bg-[#9bf1cd]', textCol: 'text-[#253044]' },
    },
    {
      id: 'profile',
      label: 'Profile & Eligibility',
      icon: UserCheck,
      badge: { text: 'Match', bg: 'bg-[#ffd05b]', textCol: 'text-[#253044]' },
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: FileText,
      badge: { text: `${applicationsCount}`, bg: 'bg-[#ff78c5]', textCol: 'text-[#253044]' },
    },
    {
      id: 'deadlines',
      label: 'Deadlines & Tasks',
      icon: Calendar,
      badge: { text: '2 urgent', bg: 'bg-[#ffd05b]', textCol: 'text-[#253044]' },
    },
    {
      id: 'vault',
      label: 'Document Vault',
      icon: FolderArchive,
      badge: vaultCount ? { text: `${vaultCount}`, bg: 'bg-[#9bf1cd]', textCol: 'text-[#253044]' } : null,
    },
    {
      id: 'assistant',
      label: 'AI Essay Assistant',
      icon: PenTool,
      badge: { text: 'AI', bg: 'bg-[#f1ebff]', textCol: 'text-[#6434df]' },
    },
    {
      id: 'analytics',
      label: 'Analytics & Financials',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (id: string, label: string) => {
    setActiveTab(id);
    onClose();
    if (id !== 'dashboard' && id !== 'discover' && id !== 'profile') {
      showToast(`Navigated to ${label}.`, 'info');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Subtle backdrop overlay with blur (main page remains visible behind it) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.05 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#253044]/30 backdrop-blur-[2px] transition-colors"
            aria-hidden="true"
          />

          {/* Left-side drawer overlay */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="BEACON Platform Navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: shouldReduceMotion ? 'tween' : 'spring',
              damping: 28,
              stiffness: 300,
              duration: shouldReduceMotion ? 0.1 : undefined,
            }}
            className="fixed inset-y-0 left-0 w-[268px] max-w-[85vw] bg-[#fffdf5] border-r-[2.5px] border-[#252b3a] shadow-[6px_0px_0px_#252b3a] z-50 flex flex-col justify-between overflow-y-auto select-none outline-none"
          >
            {/* Top Branding & Navigation Section */}
            <div className="p-5 pb-3">
              {/* Header with Official Logo, Version Badge, and Close Button */}
              <div className="flex items-center justify-between gap-2 mb-5 pb-4 border-b-2 border-[#252b3a]">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleNavClick('dashboard', 'Dashboard')}
                  title="BEACON - Return to Dashboard"
                >
                  <img
                    src="/beacon-logo.png"
                    alt="BEACON Scholarship Platform"
                    className="h-9 w-auto object-contain select-none"
                  />
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a] self-center">
                    v2.4
                  </span>
                </div>

                {/* Visible Close Button */}
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  aria-label="Close navigation sidebar"
                  className="p-1.5 rounded-[10px] bg-white border-2 border-[#252b3a] text-[#253044] hover:bg-[#ff78c5] shadow-[2px_2px_0px_#252b3a] hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6434df] focus:outline-none shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Navigation Section */}
              <div className="space-y-1">
                <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-[#596174]">
                  Platform Hub
                </div>

                <nav className="space-y-1.5" aria-label="Platform Hub Navigation">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id, item.label)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-heading font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6434df] focus:outline-none ${
                          isActive
                            ? 'bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] translate-x-1'
                            : 'text-[#253044] hover:bg-[#f1ebff] hover:text-[#253044] hover:border-2 hover:border-[#252b3a] hover:shadow-[2px_2px_0px_#252b3a] border-2 border-transparent'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 stroke-[2.5] ${
                              isActive ? 'text-[#ffd05b]' : 'text-[#253044]'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a] ${
                              isActive ? 'bg-[#ffd05b] text-[#253044]' : `${item.badge.bg} ${item.badge.textCol}`
                            }`}
                          >
                            {item.badge.text}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Engine Status & Bottom Card */}
            <div className="p-4 m-4 rounded-[17px] bg-[#ffffff] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] relative overflow-hidden shrink-0">
              {/* Playful geometric corner triangle decoration */}
              <div className="absolute top-0 right-0 w-7 h-7 bg-[#ff78c5] border-b-2 border-l-2 border-[#252b3a]" />

              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#253044]">
                    <Sparkles className="w-3.5 h-3.5 text-[#6434df]" />
                    Match Engine
                  </span>
                  <span className="text-[10px] font-black text-[#253044] bg-[#9bf1cd] px-2 py-0.5 rounded-full border-2 border-[#252b3a]">
                    ACTIVE
                  </span>
                </div>

                <p className="text-[11px] text-[#596174] font-medium leading-snug">
                  Deterministic criteria matching across 20+ verified opportunity records.
                </p>

                <button
                  onClick={() => {
                    handleNavClick('discover', 'Scholarship Discovery');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#6434df] hover:bg-[#5527cb] text-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs font-heading font-bold transition-all cursor-pointer hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#ffd05b] focus:outline-none"
                >
                  <span>Browse Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#ffd05b]" />
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
