import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  Building2,
  ArrowRight,
  ExternalLink,
  MoreVertical,
  X,
  FileCheck2,
  Trash2,
  Search,
  DollarSign,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  FolderArchive,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  ApplicationRecord,
  ApplicationStatus,
  DocumentChecklistStatus,
  Scholarship,
} from '../../types';
import { useApplications } from '../../hooks/useApplications';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { AddApplicationModal } from './AddApplicationModal';

interface ApplicationsTrackerProps {
  onBackToDashboard?: () => void;
  onNavigateToDiscover?: () => void;
  bookmarkedIds?: string[] | Set<string>;
  externalApplicationsState?: ReturnType<typeof useApplications>;
  initialViewMode?: 'kanban' | 'list' | 'analytics';
}

export const ApplicationsTracker: React.FC<ApplicationsTrackerProps> = ({
  onBackToDashboard,
  onNavigateToDiscover,
  bookmarkedIds = [],
  externalApplicationsState,
  initialViewMode = 'kanban',
}) => {
  // Use shared applications state or fallback to local hook instance
  const internalHook = useApplications();
  const {
    applications,
    addApplication,
    updateApplication,
    changeStatus,
    advanceToNextStatus,
    updateDocumentStatus,
    addCustomDocument,
    deleteCustomDocument,
    updateMilestone,
    deleteApplication,
    fundingAnalytics,
  } = externalApplicationsState || internalHook;

  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'analytics'>(initialViewMode);

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [sortBy, setSortBy] = useState<'deadline-asc' | 'funding-desc' | 'progress-desc' | 'recent'>('deadline-asc');
  const [deleteConfirmAppId, setDeleteConfirmAppId] = useState<string | null>(null);

  const statuses: ApplicationStatus[] = [
    'Saved',
    'Applying',
    'Submitted',
    'Under Review',
    'Awarded',
    'Rejected',
  ];

  // Filter & sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (statusFilter !== 'All' && app.status !== statusFilter) {
          return false;
        }
        // Search query (name, provider, notes)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = app.scholarshipName.toLowerCase().includes(q);
          const matchProvider = app.provider.toLowerCase().includes(q);
          const matchNotes = app.personalNotes?.toLowerCase().includes(q);
          if (!matchName && !matchProvider && !matchNotes) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'funding-desc') {
          return (b.fundingAmount || 0) - (a.fundingAmount || 0);
        }
        if (sortBy === 'progress-desc') {
          return b.progressPercentage - a.progressPercentage;
        }
        if (sortBy === 'recent') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        // default deadline-asc: sort by deadline string or days
        return a.deadline.localeCompare(b.deadline);
      });
  }, [applications, statusFilter, searchQuery, sortBy]);

  const getStatusBadgeStyle = (status: ApplicationStatus) => {
    switch (status) {
      case 'Awarded':
        return 'bg-[#9bf1cd] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Under Review':
        return 'bg-[#6434df] text-white border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Submitted':
        return 'bg-[#e9fff5] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Applying':
        return 'bg-[#f1ebff] text-[#6434df] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Saved':
        return 'bg-[#ffd05b] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'Rejected':
        return 'bg-[#ff78c5] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      default:
        return 'bg-[#fffdf5] text-[#253044] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
    }
  };

  const getStatusColumnHeaderBg = (status: ApplicationStatus) => {
    switch (status) {
      case 'Saved':
        return 'bg-[#ffd05b] text-[#253044]';
      case 'Applying':
        return 'bg-[#f1ebff] text-[#6434df]';
      case 'Submitted':
        return 'bg-[#e9fff5] text-[#253044]';
      case 'Under Review':
        return 'bg-[#6434df] text-white';
      case 'Awarded':
        return 'bg-[#9bf1cd] text-[#253044]';
      case 'Rejected':
        return 'bg-[#ff78c5] text-[#253044]';
      default:
        return 'bg-white text-[#253044]';
    }
  };

  const handleAdvance = (appId: string, currentStatus: ApplicationStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = advanceToNextStatus(appId);
    if (next) {
      showToast(`Advanced application to "${next}"!`, 'success');
    } else {
      showToast(`Application is already at "${currentStatus}".`, 'info');
    }
  };

  const handleDeleteWithPrompt = (appId: string, appName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmAppId(appId);
  };

  const confirmDelete = () => {
    if (deleteConfirmAppId) {
      const app = applications.find((a) => a.id === deleteConfirmAppId);
      deleteApplication(deleteConfirmAppId);
      setDeleteConfirmAppId(null);
      showToast(`Removed "${app?.scholarshipName || 'application'}" from tracker.`, 'info');
    }
  };

  // Recharts data for Funding Analytics View
  const analyticsBarData = useMemo(() => {
    return statuses.map((st) => ({
      status: st,
      fundingK: Math.round((fundingAnalytics.statusFunding[st] || 0) / 1000),
      count: fundingAnalytics.statusCounts[st] || 0,
    }));
  }, [fundingAnalytics]);

  return (
    <div className="space-y-6">
      {/* Top Application Command Center Banner */}
      <div className="rounded-[17px] p-6 sm:p-8 bg-white border-[2.5px] border-[#252b3a] relative overflow-hidden shadow-[6px_6px_0px_#6434df]">
        {/* Geometric playful shapes in background */}
        <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-[#ffd05b]/40 border-[2px] border-[#252b3a] pointer-events-none -rotate-6" />
        <div className="absolute -bottom-4 right-28 w-14 h-14 bg-[#9bf1cd]/50 border-[2px] border-[#252b3a] rotate-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#ffd05b] text-[#253044] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
              <Layers className="w-3.5 h-3.5 text-[#6434df]" />
              <span>BEACON Application Command Center</span>
              <span className="w-2 h-2 rounded-full bg-[#6434df] animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-[#253044] tracking-tight">
              Application <span className="text-[#6434df]">Command Center</span>
            </h1>

            <p className="text-sm font-reading text-[#596174] max-w-2xl leading-relaxed">
              Orchestrate scholarship submissions, manage document vault verification checklists, trace chronological milestones, and analyze funding trajectory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs sm:text-sm font-bold border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#252b3a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#252b3a] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Track New Application</span>
            </button>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#f1ebff] border-[2.5px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] text-xs sm:text-sm font-bold text-[#253044] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FEATURE 6: FUNDING ANALYTICS KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Funding Pursued */}
        <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]/70">
            <span>Total Funding Pursued</span>
            <div className="w-7 h-7 rounded-lg bg-[#f1ebff] border-[2px] border-[#252b3a] flex items-center justify-center text-[#6434df] shadow-[2px_2px_0px_#252b3a]">
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#6434df] mt-2">
            ${fundingAnalytics.totalPursued.toLocaleString()}
          </div>
          <p className="text-[11px] font-reading font-semibold text-[#253044]/70 mt-1">
            Active pipeline ({fundingAnalytics.activeCount} applications)
          </p>
        </div>

        {/* Metric 2: Funding Awarded (STRICTLY AWARDED ONLY) */}
        <div className="p-5 rounded-[17px] bg-[#9bf1cd] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]">
            <span>Funding Awarded</span>
            <div className="w-7 h-7 rounded-lg bg-white border-[2px] border-[#252b3a] flex items-center justify-center text-[#253044] shadow-[2px_2px_0px_#252b3a]">
              <Award className="w-4 h-4 text-[#253044] stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#253044] mt-2">
            ${fundingAnalytics.fundingAwarded.toLocaleString()}
          </div>
          <p className="text-[11px] font-reading font-bold text-[#253044] mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#253044] animate-pulse" />
            <span>Guaranteed disbursed funds</span>
          </p>
        </div>

        {/* Metric 3: Applications Under Review */}
        <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]/70">
            <span>Under Review</span>
            <div className="w-7 h-7 rounded-lg bg-[#ffd05b] border-[2px] border-[#252b3a] flex items-center justify-center text-[#253044] shadow-[2px_2px_0px_#252b3a]">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#253044] mt-2">
            {fundingAnalytics.underReviewCount} {fundingAnalytics.underReviewCount === 1 ? 'Grant' : 'Grants'}
          </div>
          <p className="text-[11px] font-reading font-semibold text-[#253044]/70 mt-1">
            Committee evaluation in progress
          </p>
        </div>

        {/* Metric 4: Successful Applications */}
        <div className="p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]/70">
            <span>Successful Grants</span>
            <div className="w-7 h-7 rounded-lg bg-[#ff78c5] border-[2px] border-[#252b3a] flex items-center justify-center text-[#253044] shadow-[2px_2px_0px_#252b3a]">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-display text-[#253044] mt-2">
            {fundingAnalytics.awardedCount}{' '}
            <span className="text-xs font-normal text-[#253044]/70">
              ({applications.length > 0 ? Math.round((fundingAnalytics.awardedCount / applications.length) * 100) : 0}% win rate)
            </span>
          </div>
          <p className="text-[11px] font-reading font-semibold text-[#253044]/70 mt-1">
            {applications.length} total applications on record
          </p>
        </div>
      </div>

      {/* FILTER, SEARCH & VIEW MODE SWITCHER BAR */}
      <div className="p-4 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-[4px_4px_0px_#252b3a]">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#596174] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications by scholarship, sponsor, or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-xs font-reading text-[#253044] placeholder-[#596174] outline-none focus:ring-2 focus:ring-[#6434df] transition-all shadow-[2px_2px_0px_#252b3a]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#253044]/60 hover:text-[#253044]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-[12px] bg-white border-[2px] border-[#252b3a] text-xs font-bold text-[#253044] outline-none shadow-[2px_2px_0px_#252b3a] cursor-pointer"
          >
            <option value="deadline-asc">Sort: Deadline (Soonest)</option>
            <option value="funding-desc">Sort: Highest Award</option>
            <option value="progress-desc">Sort: Highest Progress</option>
            <option value="recent">Sort: Recently Updated</option>
          </select>

          {/* View switcher buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-[9px] font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#6434df] text-white border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]'
                  : 'text-[#253044] hover:bg-[#f1ebff]'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-[9px] font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#6434df] text-white border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]'
                  : 'text-[#253044] hover:bg-[#f1ebff]'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1.5 rounded-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-[#6434df] text-white border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]'
                  : 'text-[#253044] hover:bg-[#f1ebff]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Funding Charts</span>
            </button>
          </div>
        </div>
      </div>

      {/* STATUS FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-3.5 py-1.5 rounded-[12px] font-bold whitespace-nowrap transition-all border-[2px] border-[#252b3a] cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-[#6434df] text-white shadow-[3px_3px_0px_#252b3a]'
              : 'bg-white text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#f1ebff]'
          }`}
        >
          All Applications ({applications.length})
        </button>

        {statuses.map((st) => {
          const count = fundingAnalytics.statusCounts[st] || 0;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-[12px] font-bold whitespace-nowrap transition-all border-[2px] border-[#252b3a] cursor-pointer flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-[#6434df] text-white shadow-[3px_3px_0px_#252b3a]'
                  : 'bg-white text-[#253044] shadow-[2px_2px_0px_#252b3a] hover:bg-[#f1ebff]'
              }`}
            >
              <span>{st}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                statusFilter === st
                  ? 'bg-white text-[#6434df] border-white'
                  : 'bg-[#fffdf5] text-[#253044] border-[#252b3a]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {statuses.map((statusKey) => {
            const columnApps = filteredApplications.filter((a) => a.status === statusKey);
            const columnTotalFunding = columnApps.reduce((sum, a) => sum + (a.fundingAmount || 0), 0);

            return (
              <div
                key={statusKey}
                className="rounded-[17px] bg-[#fffdf5] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] p-3.5 space-y-3 min-h-[460px] flex flex-col justify-between"
              >
                <div>
                  {/* Column Header */}
                  <div className={`flex items-center justify-between p-2 rounded-[12px] border-[2px] border-[#252b3a] mb-3 shadow-[2px_2px_0px_#252b3a] ${getStatusColumnHeaderBg(statusKey)}`}>
                    <span className="font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      {statusKey}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#253044] border-[1.5px] border-[#252b3a]">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Column Total Funding Subhead */}
                  {columnApps.length > 0 && (
                    <div className="text-[11px] font-reading font-bold text-[#253044]/80 pb-2 px-1 flex justify-between border-b border-[#252b3a]/20 mb-2">
                      <span>Total:</span>
                      <span className="text-[#6434df] font-display font-extrabold">
                        ${columnTotalFunding.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Cards inside column */}
                  <div className="space-y-3">
                    {columnApps.map((app) => {
                      const readyDocs = app.documents.filter((d) => d.status === 'ready').length;

                      return (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setSelectedApp(app)}
                          className="p-3.5 rounded-[14px] bg-white border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] hover:shadow-[5px_5px_0px_#6434df] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer group space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="font-display font-bold text-xs text-[#253044] group-hover:text-[#6434df] transition-colors line-clamp-2 leading-snug">
                              {app.scholarshipName}
                            </h4>
                          </div>

                          <p className="text-[11px] font-reading text-[#253044]/70 truncate">{app.provider}</p>

                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[#6434df] font-display font-extrabold text-sm">
                              {app.fundingFormatted}
                            </span>
                            <span className="text-[10px] font-reading font-bold px-2 py-0.5 rounded-full bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a] flex items-center gap-1">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                              {app.deadline}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[#253044]/70">
                              <span>Readiness</span>
                              <span className="text-[#6434df] font-extrabold">{app.progressPercentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#fffdf5] rounded-full border-[1.5px] border-[#252b3a] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  app.status === 'Awarded'
                                    ? 'bg-[#9bf1cd]'
                                    : app.status === 'Rejected'
                                    ? 'bg-[#ff78c5]'
                                    : 'bg-[#6434df]'
                                }`}
                                style={{ width: `${app.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Documents Readiness Snapshot */}
                          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#252b3a]/15 text-[#253044]/80">
                            <span className="flex items-center gap-1 font-bold">
                              <FileCheck2 className="w-3 h-3 text-[#6434df] stroke-[2.5]" />
                              <span>{readyDocs}/{app.documents.length} Docs Ready</span>
                            </span>

                            {app.status !== 'Awarded' && app.status !== 'Rejected' && (
                              <button
                                onClick={(e) => handleAdvance(app.id, app.status, e)}
                                className="px-2 py-0.5 rounded-[8px] bg-[#f1ebff] hover:bg-[#6434df] text-[#6434df] hover:text-white text-[10px] font-bold border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] transition-all cursor-pointer"
                                title="Advance to next stage"
                              >
                                Advance →
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    {columnApps.length === 0 && (
                      <div className="p-5 rounded-[12px] border-[2px] border-dashed border-[#252b3a]/30 text-center text-[11px] font-reading font-semibold text-[#253044]/50">
                        No applications in {statusKey}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="w-full py-2 rounded-[12px] border-[2px] border-dashed border-[#252b3a] hover:bg-[#f1ebff] text-xs font-bold text-[#253044] transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Application</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MAIN VIEW 2: TABLE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="rounded-[17px] bg-white border-[2.5px] border-[#252b3a] overflow-hidden shadow-[5px_5px_0px_#252b3a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-reading">
              <thead className="bg-[#fffdf5] text-[#253044] uppercase text-[10px] font-bold tracking-wider border-b-[2.5px] border-[#252b3a]">
                <tr>
                  <th className="p-4">Scholarship Opportunity</th>
                  <th className="p-4">Funding Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Readiness Progress</th>
                  <th className="p-4">Document Vault</th>
                  <th className="p-4">Deadline & Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-[#252b3a]/20 text-[#253044]">
                {filteredApplications.map((app) => {
                  const readyDocs = app.documents.filter((d) => d.status === 'ready').length;
                  const pendingDocs = app.documents.filter((d) => d.status === 'pending').length;
                  const missingDocs = app.documents.filter((d) => d.status === 'missing').length;

                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="hover:bg-[#f1ebff]/50 cursor-pointer transition-colors"
                    >
                      {/* Scholarship & Sponsor */}
                      <td className="p-4 max-w-xs">
                        <div className="font-display font-bold text-[#253044] text-sm hover:text-[#6434df] transition-colors">
                          {app.scholarshipName}
                        </div>
                        <div className="text-[#253044]/70 text-[11px] truncate">{app.provider}</div>
                      </td>

                      {/* Grant Award */}
                      <td className="p-4 font-display font-extrabold text-[#6434df] text-sm whitespace-nowrap">
                        {app.fundingFormatted}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={app.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as ApplicationStatus;
                            changeStatus(app.id, newStatus);
                            showToast(`Status updated to ${newStatus}`, 'success');
                          }}
                          className={`text-xs font-bold px-3 py-1 rounded-full border-[2px] border-[#252b3a] outline-none cursor-pointer ${getStatusBadgeStyle(
                            app.status
                          )}`}
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st} className="bg-white text-[#253044]">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Progress */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[#fffdf5] rounded-full border-[1.5px] border-[#252b3a] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                app.status === 'Awarded'
                                  ? 'bg-[#9bf1cd]'
                                  : app.status === 'Rejected'
                                  ? 'bg-[#ff78c5]'
                                  : 'bg-[#6434df]'
                              }`}
                              style={{ width: `${app.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#6434df]">
                            {app.progressPercentage}%
                          </span>
                        </div>
                      </td>

                      {/* Document Vault Summary */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-[8px] bg-[#9bf1cd] text-[#253044] border-[1.5px] border-[#252b3a]">
                            {readyDocs} Ready
                          </span>
                          {pendingDocs > 0 && (
                            <span className="px-2 py-0.5 rounded-[8px] bg-[#ffd05b] text-[#253044] border-[1.5px] border-[#252b3a]">
                              {pendingDocs} Pend
                            </span>
                          )}
                          {missingDocs > 0 && (
                            <span className="px-2 py-0.5 rounded-[8px] bg-[#ff78c5] text-[#253044] border-[1.5px] border-[#252b3a]">
                              {missingDocs} Miss
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="p-4 text-xs whitespace-nowrap">
                        <div className="text-[#253044] font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#6434df]" />
                          <span>{app.deadline}</span>
                        </div>
                        {app.submissionDate && (
                          <div className="text-[10px] text-[#253044]/60 mt-0.5">
                            Sub: {app.submissionDate}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status !== 'Awarded' && app.status !== 'Rejected' && (
                            <button
                              onClick={(e) => handleAdvance(app.id, app.status, e)}
                              className="px-2.5 py-1 rounded-[8px] bg-[#f1ebff] hover:bg-[#6434df] text-[#6434df] hover:text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
                            >
                              Advance
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-2.5 py-1 rounded-[8px] bg-white hover:bg-[#fffdf5] text-[#253044] text-xs font-bold border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={(e) => handleDeleteWithPrompt(app.id, app.scholarshipName, e)}
                            className="p-1.5 rounded-[8px] text-[#253044]/60 hover:text-white hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors"
                            title="Remove application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN VIEW 3: FUNDING ANALYTICS & BREAKDOWN */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart: Pipeline Value Distribution */}
            <div className="lg:col-span-2 p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#252b3a] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#6434df]" />
                    <span>Funding Distribution by Application Status ($K)</span>
                  </h3>
                  <p className="text-xs font-reading text-[#253044]/70 mt-0.5">
                    Total funding breakdown across all six application pipeline checkpoints.
                  </p>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#b8b6c5" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="status"
                      stroke="#253044"
                      tick={{ fill: '#253044', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#252b3a', strokeWidth: 2 }}
                    />
                    <YAxis
                      stroke="#253044"
                      tick={{ fill: '#253044', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      unit="K"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3.5 rounded-[14px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] text-xs font-reading space-y-1">
                              <p className="font-display font-bold text-[#253044] mb-1">Status: {label}</p>
                              <p className="text-[#6434df] font-bold flex items-center justify-between gap-4">
                                <span>Total Funding:</span>
                                <span className="font-display font-extrabold">${data.fundingK}K</span>
                              </p>
                              <p className="text-[#253044]/80 font-bold flex items-center justify-between gap-4">
                                <span>Grant Count:</span>
                                <span>{data.count}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="fundingK" radius={[6, 6, 0, 0]} stroke="#252b3a" strokeWidth={2}>
                      {analyticsBarData.map((entry, index) => {
                        const colors: Record<string, string> = {
                          'Saved': '#ffd05b',
                          'Applying': '#f1ebff',
                          'Submitted': '#e9fff5',
                          'Under Review': '#6434df',
                          'Awarded': '#9bf1cd',
                          'Rejected': '#ff78c5',
                        };
                        return <Cell key={`cell-${index}`} fill={colors[entry.status] || '#6434df'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategic Pipeline Health & Summary */}
            <div className="p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#252b3a] space-y-4">
              <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6434df]" />
                <span>Strategic Portfolio Health</span>
              </h3>

              <div className="space-y-3 text-xs font-reading">
                <div className="p-3 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] flex items-center justify-between shadow-[2px_2px_0px_#252b3a]">
                  <span className="text-[#253044]/70 font-semibold">Active Pipeline Sum</span>
                  <span className="font-display font-bold text-[#6434df] text-sm">
                    ${fundingAnalytics.totalPursued.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-[12px] bg-[#9bf1cd] border-[2px] border-[#252b3a] flex items-center justify-between shadow-[2px_2px_0px_#252b3a]">
                  <span className="text-[#253044] font-bold">Confirmed Awarded Funds</span>
                  <span className="font-display font-extrabold text-[#253044] text-sm">
                    ${fundingAnalytics.fundingAwarded.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] flex items-center justify-between shadow-[2px_2px_0px_#252b3a]">
                  <span className="text-[#253044]/70 font-semibold">Awarded Grant Count</span>
                  <span className="font-bold text-[#253044]">
                    {fundingAnalytics.awardedCount} Grants
                  </span>
                </div>

                <div className="p-3 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] flex items-center justify-between shadow-[2px_2px_0px_#252b3a]">
                  <span className="text-[#253044]/70 font-semibold">Under Review Opportunities</span>
                  <span className="font-bold text-[#6434df]">
                    {fundingAnalytics.underReviewCount} Grants
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#f1ebff] border-[2px] border-[#252b3a] text-[11px] font-reading text-[#253044] leading-relaxed shadow-[2px_2px_0px_#252b3a]">
                <p>
                  <strong>BEACON Accuracy Rule:</strong> Pending and review-stage awards are strictly categorized under active pipeline and never mixed into confirmed awarded funding.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredApplications.length === 0 && (
        <div className="p-12 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] text-center space-y-4 shadow-[5px_5px_0px_#252b3a]">
          <div className="w-16 h-16 rounded-[14px] bg-[#ffd05b] border-[2.5px] border-[#252b3a] flex items-center justify-center mx-auto text-[#253044] shadow-[3px_3px_0px_#252b3a]">
            <FileText className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="font-display font-bold text-xl text-[#253044]">
            No Applications Match Your Query
          </h3>

          <p className="text-sm font-reading text-[#253044]/70 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'Try broadening your search keywords or switching your status filter back to "All Applications".'
              : 'You do not have any applications tracked yet. Add opportunities from your bookmarks or scholarship discovery.'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="px-4 py-2 rounded-[12px] bg-white hover:bg-[#fffdf5] border-[2px] border-[#252b3a] text-xs font-bold text-[#253044] shadow-[2px_2px_0px_#252b3a] transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            )}

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-xs font-bold text-white border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] cursor-pointer"
            >
              Track First Scholarship
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD APPLICATION WIZARD */}
      <AddApplicationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddApplication={(sch, initialSt, notes) => {
          addApplication(sch, initialSt, notes);
        }}
        bookmarkedIds={bookmarkedIds}
        alreadyTrackedScholarshipIds={applications.map((a) => a.scholarshipId)}
      />

      {/* MODAL 2: APPLICATION DOSSIER & VAULT INSPECTION */}
      <ApplicationDetailModal
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onUpdateApplication={updateApplication}
        onChangeStatus={changeStatus}
        onUpdateDocumentStatus={updateDocumentStatus}
        onAddCustomDocument={addCustomDocument}
        onDeleteCustomDocument={deleteCustomDocument}
        onUpdateMilestone={updateMilestone}
        onDeleteApplication={(id) => {
          deleteApplication(id);
          setSelectedApp(null);
        }}
      />

      {/* CONFIRMATION DIALOG FOR DELETE */}
      <AnimatePresence>
        {deleteConfirmAppId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmAppId(null)}
              className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border-[3px] border-[#252b3a] rounded-[17px] shadow-[8px_8px_0px_#252b3a] p-6 space-y-4 z-10"
            >
              <div className="flex items-center gap-3 text-[#253044]">
                <div className="w-10 h-10 rounded-[10px] bg-[#ff78c5] border-[2px] border-[#252b3a] flex items-center justify-center shadow-[2px_2px_0px_#252b3a]">
                  <Trash2 className="w-5 h-5 text-[#253044] stroke-[2.5]" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#253044]">
                  Remove Application?
                </h3>
              </div>

              <p className="text-xs font-reading text-[#253044]/80 leading-relaxed">
                Are you sure you want to remove this application and its document checklist from your tracking pipeline? This action can be undone by tracking the scholarship again.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-[2px] border-[#252b3a]/20">
                <button
                  onClick={() => setDeleteConfirmAppId(null)}
                  className="px-4 py-2 rounded-[12px] text-xs font-bold text-[#253044] hover:bg-[#fffdf5] border-[2px] border-transparent hover:border-[#252b3a]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-[12px] bg-[#ff78c5] hover:bg-[#ff5bb8] text-[#253044] text-xs font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a]"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
