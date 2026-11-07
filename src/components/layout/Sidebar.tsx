import React from 'react';
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
  UserCheck
} from 'lucide-react';
import { useToast } from '../ui/Toast';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
  applicationsCount?: number;
  vaultCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  className = '',
  applicationsCount = 4,
  vaultCount,
}) => {
  const { showToast } = useToast();

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
    if (id !== 'dashboard' && id !== 'discover' && id !== 'profile') {
      showToast(`Navigated to ${label}.`, 'info');
    }
  };

  return (
    <aside
      className={`w-72 bg-[#fffdf5] border-r-[2.5px] border-[#252b3a] flex flex-col justify-between h-screen sticky top-0 select-none z-30 ${className}`}
    >
      {/* Top Branding Section */}
      <div className="p-5">
        <div
          className="flex items-center justify-between mb-6 p-2 rounded-[14px] cursor-pointer hover:bg-white transition-all group"
          onClick={() => setActiveTab('dashboard')}
          title="BEACON - Return to Dashboard"
        >
          <div className="flex items-center gap-2">
            <img
              src="/beacon-logo.png"
              alt="BEACON Scholarship Platform"
              className="h-10 w-auto object-contain select-none group-hover:scale-[1.02] transition-transform"
            />
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a] self-center">
              v2.4
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-[#596174]">
            Platform Hub
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.label)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-heading font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] translate-x-1'
                      : 'text-[#253044] hover:bg-[#f1ebff] hover:text-[#253044] hover:border-2 hover:border-[#252b3a] hover:shadow-[2px_2px_0px_#252b3a] border-2 border-transparent'
                  }`}
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
      <div className="p-4 m-4 rounded-[17px] bg-[#ffffff] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] relative overflow-hidden">
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
              setActiveTab('discover');
              showToast('Viewing verified scholarship opportunities.', 'info');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#6434df] hover:bg-[#5527cb] text-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs font-heading font-bold transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <span>Browse Catalog</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#ffd05b]" />
          </button>
        </div>
      </div>
    </aside>
  );
};
