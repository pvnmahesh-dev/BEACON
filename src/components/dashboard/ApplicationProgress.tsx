import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  FileCheck2,
  BarChart2
} from 'lucide-react';
import { ApplicationRecord, ApplicationStatus } from '../../types';
import { mockTrendData } from '../../data/mockData';
import { useToast } from '../ui/Toast';

interface ApplicationProgressProps {
  applications?: ApplicationRecord[];
  onNavigateToApplications?: () => void;
  onSelectApplication?: (app: ApplicationRecord) => void;
}

export const ApplicationProgress: React.FC<ApplicationProgressProps> = ({
  applications = [],
  onNavigateToApplications,
  onSelectApplication,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics'>('pipeline');
  const { showToast } = useToast();

  const getStatusBadgeStyle = (status: ApplicationStatus) => {
    switch (status) {
      case 'Awarded':
        return 'bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a]';
      case 'Under Review':
        return 'bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a]';
      case 'Submitted':
        return 'bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a]';
      case 'Applying':
        return 'bg-[#6434df] text-white border-2 border-[#252b3a]';
      case 'Saved':
        return 'bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a]';
      case 'Rejected':
        return 'bg-[#ff78c5] text-[#253044] border-2 border-[#252b3a]';
      default:
        return 'bg-[#fffdf5] text-[#253044] border-2 border-[#252b3a]';
    }
  };

  const getProgressBarColor = (progress: number, status: ApplicationStatus) => {
    if (status === 'Awarded') return 'bg-[#9bf1cd]';
    if (status === 'Rejected') return 'bg-[#b8b6c5]';
    if (status === 'Saved') return 'bg-[#ffd05b]';
    if (status === 'Submitted') return 'bg-[#9bf1cd]';
    return 'bg-[#6434df]';
  };

  const handleCardClick = (app: ApplicationRecord) => {
    if (onSelectApplication) {
      onSelectApplication(app);
    } else if (onNavigateToApplications) {
      onNavigateToApplications();
    }
    showToast(`Inspecting application dossier for "${app.scholarshipName}"`, 'info');
  };

  // Active applications for display
  const activeApps = applications.filter((a) =>
    ['Saved', 'Applying', 'Submitted', 'Under Review'].includes(a.status)
  ).slice(0, 4);

  const displayList = activeApps.length > 0 ? activeApps : applications.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#253044] tracking-tight">
              Application Pipeline & Progress
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-heading font-black bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              {activeApps.length} Active in Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#253044]/70 font-medium mt-1">
            Real-time status tracking, document verification checkpoints, and funding readiness.
          </p>
        </div>

        {/* Tab Switcher & Command Center Shortcut */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onNavigateToApplications && (
            <button
              onClick={onNavigateToApplications}
              className="text-xs font-heading font-bold text-[#6434df] hover:text-[#5527cb] px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Command Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center p-1 rounded-[12px] bg-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-heading font-bold transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-[#6434df] text-white shadow-[1px_1px_0px_#252b3a]'
                  : 'text-[#253044] hover:bg-[#fffdf5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Active Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-heading font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#6434df] text-white shadow-[1px_1px_0px_#252b3a]'
                  : 'text-[#253044] hover:bg-[#fffdf5]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Trajectory Chart</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'pipeline' ? (
        /* Tracker Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((app) => {
            const readyDocs = app.documents.filter((d) => d.status === 'ready').length;

            return (
              <div
                key={app.id}
                onClick={() => handleCardClick(app)}
                className="group cursor-pointer p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:shadow-[6px_6px_0px_#252b3a] transition-all duration-200 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-heading font-extrabold shadow-[1px_1px_0px_#252b3a] ${getStatusBadgeStyle(
                        app.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{app.status}</span>
                    </span>

                    <span className="font-heading font-black text-xl text-[#253044]">
                      {app.fundingFormatted}
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="font-heading font-black text-base text-[#253044] group-hover:text-[#6434df] transition-colors line-clamp-1">
                    {app.scholarshipName}
                  </h3>
                  <p className="text-xs font-semibold text-[#253044]/70 mb-4">{app.provider}</p>

                  {/* Progress Bar & Stage */}
                  <div className="p-3.5 rounded-[12px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] mb-3.5">
                    <div className="flex items-center justify-between text-xs mb-2 font-heading font-bold">
                      <span className="text-[#253044]">Readiness Dossier</span>
                      <span className="text-[#6434df]">
                        {app.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-white border-2 border-[#252b3a] rounded-full overflow-hidden shadow-[1px_1px_0px_#252b3a]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
                          app.progressPercentage,
                          app.status
                        )}`}
                        style={{ width: `${app.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Milestone & Documents Readiness */}
                  <div className="flex items-center justify-between text-xs text-[#253044] mb-2 px-1 font-semibold">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#6434df] shrink-0" />
                      <span className="truncate">{readyDocs}/{app.documents.length} Documents Ready</span>
                    </span>
                    <span className="text-[#253044] text-[11px] shrink-0 font-bold flex items-center gap-1 bg-[#ffd05b] px-2 py-0.5 rounded-full border border-[#252b3a]">
                      <Clock className="w-3 h-3 stroke-[2.5]" />
                      {app.deadline}
                    </span>
                  </div>
                </div>

                {/* Action row */}
                <div className="pt-3 border-t-2 border-[#252b3a] flex items-center justify-between text-xs font-heading font-bold text-[#253044] group-hover:text-[#6434df] transition-colors">
                  <span>Open Application Dossier</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Analytics Trajectory Chart View */
        <div className="p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#6434df]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-heading font-black text-lg text-[#253044] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#6434df] stroke-[2.5]" />
                Opportunities Discovered & Funding Value ($K)
              </h3>
              <p className="text-xs text-[#253044]/70 font-medium mt-0.5">
                BEACON personalized match conversion and discovery trajectory over the last 6 months.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-heading font-bold">
              <span className="flex items-center gap-1.5 text-[#253044]">
                <span className="w-3 h-3 rounded-full bg-[#9bf1cd] border border-[#252b3a]" />
                Discovered Opportunities
              </span>
              <span className="flex items-center gap-1.5 text-[#253044]">
                <span className="w-3 h-3 rounded-full bg-[#6434df] border border-[#252b3a]" />
                Pipeline Value ($K)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDiscovered" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#9bf1cd" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#9bf1cd" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorValue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#6434df" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6434df" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#b8b6c5" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#252b3a"
                  tick={{ fill: '#253044', fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#252b3a', strokeWidth: 1.5 }}
                />
                <YAxis
                  stroke="#252b3a"
                  tick={{ fill: '#253044', fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-[12px] bg-white border-2 border-[#252b3a] shadow-[3px_3px_0px_#252b3a] text-xs space-y-1">
                          <p className="font-heading font-black text-[#253044] mb-1">{label} 2026</p>
                          <p className="text-[#253044] font-bold flex items-center justify-between gap-4">
                            <span>Discovered:</span>
                            <span className="font-mono bg-[#9bf1cd] px-1.5 py-0.5 rounded border border-[#252b3a]">{payload[0]?.value}</span>
                          </p>
                          <p className="text-[#6434df] font-bold flex items-center justify-between gap-4">
                            <span>Target Potential:</span>
                            <span className="font-mono bg-[#f1ebff] px-1.5 py-0.5 rounded border border-[#252b3a]">${payload[1]?.value}K</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="discovered"
                  stroke="#252b3a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDiscovered)"
                />
                <Area
                  type="monotone"
                  dataKey="potentialValueK"
                  stroke="#6434df"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
