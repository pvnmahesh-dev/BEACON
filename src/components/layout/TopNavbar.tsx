import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  Command,
  PlusCircle
} from 'lucide-react';
import { UserProfile } from '../../types';
import { NotificationsDropdown } from '../modals/NotificationsDropdown';
import { ProfileDropdown } from '../modals/ProfileDropdown';
import { useToast } from '../ui/Toast';

interface TopNavbarProps {
  user: UserProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onOpenMobileMenu?: () => void;
  onOpenNewApplication?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToVault?: () => void;
  onResetDemoData?: () => void;
  onNavigateToDashboard?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  searchQuery,
  setSearchQuery,
  isSidebarOpen = false,
  onToggleSidebar,
  menuButtonRef,
  onOpenMobileMenu,
  onOpenNewApplication,
  onNavigateToProfile,
  onNavigateToVault,
  onResetDemoData,
  onNavigateToDashboard,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Keyboard shortcut Ctrl/Cmd + K for quick search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickAdd = () => {
    if (onOpenNewApplication) {
      onOpenNewApplication();
    } else {
      showToast('Fast-track application wizard initiated!', 'info');
    }
  };

  return (
    <header className="h-[72px] bg-[#fffdf5] border-b-[2.5px] border-[#252b3a] sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left Area: Accessible Menu Toggle, Brand Logo & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
        <button
          ref={menuButtonRef}
          onClick={onToggleSidebar || onOpenMobileMenu}
          className="p-2.5 rounded-[12px] bg-white border-2 border-[#252b3a] text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#f1ebff] hover:text-[#6434df] focus-visible:ring-2 focus-visible:ring-[#6434df] focus:outline-none transition-all cursor-pointer shrink-0"
          aria-label={isSidebarOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
          aria-expanded={isSidebarOpen}
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Brand Logo in Top Navbar */}
        <div
          onClick={onNavigateToDashboard}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0 hover:opacity-90 transition-opacity"
          title="BEACON - Return to Dashboard"
        >
          <img
            src="/beacon-logo.png"
            alt="BEACON"
            className="h-8 md:h-9 w-auto object-contain hidden sm:block"
          />
          <img
            src="/beacon-icon.png"
            alt="BEACON"
            className="h-8 w-8 object-contain sm:hidden"
          />
          <span className="hidden md:inline-block text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
            v2.4
          </span>
        </div>

        {/* Global Search with Playful Geometric Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#596174] group-focus-within:text-[#6434df] transition-colors">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships, grants, STEM fellowships..."
            className="w-full pl-10 pr-24 py-2 rounded-[12px] bg-[#ffffff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] focus:border-[#6434df] focus:shadow-[3px_3px_0px_#6434df] text-sm font-reading font-medium text-[#253044] placeholder-[#596174] transition-all outline-none"
          />

          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-[#596174] hover:text-[#253044] transition-colors mr-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-black text-[#253044] bg-[#ffd05b] border border-[#252b3a] rounded-md shadow-[1px_1px_0px_#252b3a]">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Area: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Action Button */}
        <button
          onClick={handleQuickAdd}
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] hover:-translate-y-0.5 text-xs font-heading font-bold transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#ffd05b] stroke-[2.5]" />
          <span>New Application</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className={`p-2 sm:p-2.5 rounded-[12px] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all relative cursor-pointer ${
              isNotificationsOpen
                ? 'bg-[#f1ebff] text-[#6434df]'
                : 'bg-white text-[#253044] hover:bg-[#f1ebff]'
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ff78c5] border-2 border-[#252b3a] text-[9px] font-black text-[#253044] flex items-center justify-center">
              2
            </span>
          </button>

          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Profile Dropdown Trigger */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-[12px] border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] transition-all cursor-pointer ${
              isProfileOpen
                ? 'bg-[#f1ebff]'
                : 'bg-white hover:bg-[#f1ebff]'
            }`}
            aria-label="User profile settings"
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-[8px] object-cover border-2 border-[#252b3a]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#9bf1cd] border-2 border-[#252b3a]" />
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-heading font-bold text-[#253044] leading-tight">
                {user.name}
              </div>
              <span className="text-[10px] text-[#6434df] font-black tracking-wide">
                {user.institution ? `${user.institution} Scholar` : 'Verified Scholar'}
              </span>
            </div>
          </button>

          <ProfileDropdown
            user={user}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToVault={onNavigateToVault}
            onResetDemoData={onResetDemoData}
          />
        </div>
      </div>
    </header>
  );
};
