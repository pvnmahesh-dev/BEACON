import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Target,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { StatItem } from '../../types';

interface StatCardsProps {
  stats: StatItem[];
  onStatClick?: (statId: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, onStatClick }) => {
  const getIcon = (name: string, accent: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#253044] stroke-[2.5]" />;
      case 'Target':
        return <Target className="w-5 h-5 text-white stroke-[2.5]" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-[#253044] stroke-[2.5]" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-[#253044] stroke-[2.5]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#253044] stroke-[2.5]" />;
    }
  };

  const getCardStyle = (accent: string, id: string) => {
    if (id === 'eligible') {
      return 'shadow-[5px_5px_0px_#6434df] hover:shadow-[7px_7px_0px_#6434df]';
    }
    if (accent === 'pink') {
      return 'shadow-[4px_4px_0px_#ff78c5] hover:shadow-[6px_6px_0px_#ff78c5]';
    }
    if (accent === 'amber') {
      return 'shadow-[4px_4px_0px_#ffd05b] hover:shadow-[6px_6px_0px_#ffd05b]';
    }
    return 'shadow-[4px_4px_0px_#252b3a] hover:shadow-[6px_6px_0px_#252b3a]';
  };

  const getIconBg = (accent: string, id: string) => {
    if (id === 'eligible') {
      return 'bg-[#6434df] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
    }
    switch (accent) {
      case 'violet':
        return 'bg-[#f1ebff] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'cyan':
        return 'bg-[#9bf1cd] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'emerald':
        return 'bg-[#9bf1cd] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      case 'amber':
        return 'bg-[#ffd05b] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
      default:
        return 'bg-[#ff78c5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: idx * 0.05 }}
            onClick={() => onStatClick?.(stat.id)}
            className={`group cursor-pointer p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] transition-all duration-200 relative overflow-hidden hover:-translate-y-1 ${getCardStyle(
              stat.accent,
              stat.id
            )}`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs font-heading font-extrabold text-[#253044]/70 uppercase tracking-wider">
                {stat.title}
              </span>
              <div
                className={`p-2 rounded-[10px] transition-transform group-hover:scale-105 ${getIconBg(
                  stat.accent,
                  stat.id
                )}`}
              >
                {getIcon(stat.icon, stat.accent)}
              </div>
            </div>

            {/* Main Value in Host Grotesk bold typography */}
            <div className="text-3xl sm:text-4xl font-heading font-black text-[#253044] tracking-tight mb-2">
              {stat.value}
            </div>

            {/* Sub-label & Trend Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 font-heading font-bold px-2 py-0.5 rounded-full text-[11px] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a] ${stat.isPositive
                    ? 'text-[#253044] bg-[#9bf1cd]'
                    : 'text-[#253044] bg-[#ffd05b]'
                  }`}
              >
                {stat.isPositive ? (
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                )}
                <span>{stat.change}</span>
              </span>
              <span className="text-[#253044]/60 text-[11px] font-semibold truncate">
                {stat.timeframe}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
