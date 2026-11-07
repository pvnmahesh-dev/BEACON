import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { DeadlineTask } from '../../types';
import { mockDeadlines } from '../../data/mockData';
import { useToast } from '../ui/Toast';

export const UpcomingDeadlines: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineTask[]>(mockDeadlines);
  const { showToast } = useToast();

  const toggleTask = (deadlineId: string, taskId: string) => {
    setDeadlines((prev) =>
      prev.map((dl) => {
        if (dl.id !== deadlineId) return dl;
        const updatedTasks = dl.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const nextState = !task.completed;
          showToast(
            nextState
              ? `Task completed: "${task.text}"`
              : `Task marked incomplete: "${task.text}"`,
            nextState ? 'success' : 'info'
          );
          return { ...task, completed: nextState };
        });
        return { ...dl, tasks: updatedTasks };
      })
    );
  };

  const getUrgencyBadge = (urgency: DeadlineTask['urgency'], days: number) => {
    if (urgency === 'urgent' || days <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-heading font-black bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
          <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{days} Days Remaining</span>
        </span>
      );
    }
    if (urgency === 'approaching') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-heading font-black bg-[#9bf1cd] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{days} Days Remaining</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-heading font-black bg-[#fffdf5] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
        <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{days} Days</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#253044] tracking-tight">
              Upcoming Deadlines & Tasks
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-heading font-black bg-[#ff78c5] text-[#253044] border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              Action Required
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#253044]/70 font-medium mt-1">
            Track key application milestones and complete checklist requirements before portal closures.
          </p>
        </div>

        <button
          onClick={() => showToast('Calendar synced with your academic schedule', 'info')}
          className="text-xs text-[#6434df] hover:text-[#5527cb] flex items-center gap-1 font-heading font-bold transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Sync with iCal / Google</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Deadlines List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {deadlines.map((dl) => {
          const completedCount = dl.tasks.filter((t) => t.completed).length;
          const totalCount = dl.tasks.length;
          const percent = Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={dl.id}
              className={`p-5 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 ${
                dl.urgency === 'urgent'
                  ? 'shadow-[4px_4px_0px_#ffd05b] hover:shadow-[6px_6px_0px_#ffd05b]'
                  : 'shadow-[4px_4px_0px_#252b3a] hover:shadow-[6px_6px_0px_#252b3a]'
              }`}
            >
              <div>
                {/* Header with Urgency Badge & Award */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  {getUrgencyBadge(dl.urgency, dl.daysRemaining)}
                  <span className="font-heading font-black text-sm text-[#6434df]">
                    {dl.awardAmount}
                  </span>
                </div>

                {/* Title & Provider */}
                <h3 className="font-heading font-black text-base text-[#253044] line-clamp-1">
                  {dl.title}
                </h3>
                <p className="text-xs font-semibold text-[#253044]/70 mb-3 truncate">{dl.provider}</p>

                {/* Due Date & Task Progress Bar */}
                <div className="p-3 rounded-[12px] bg-[#fffdf5] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a] mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-heading font-bold">
                    <span className="text-[#253044]/80 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#6434df]" />
                      Closing: <strong className="text-[#253044]">{dl.date}</strong>
                    </span>
                    <span className="text-[#6434df]">
                      {completedCount}/{totalCount} Done
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-white border-2 border-[#252b3a] rounded-full overflow-hidden shadow-[1px_1px_0px_#252b3a]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent === 100
                          ? 'bg-[#9bf1cd]'
                          : dl.urgency === 'urgent'
                          ? 'bg-[#ffd05b]'
                          : 'bg-[#6434df]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Checklist */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#253044]/70 block">
                    Submission Checklist
                  </span>
                  {dl.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(dl.id, task.id)}
                      className={`p-2.5 rounded-[10px] border-2 border-[#252b3a] transition-all cursor-pointer flex items-center gap-2.5 ${
                        task.completed
                          ? 'bg-[#e9fff5] text-[#253044] shadow-[1px_1px_0px_#252b3a]'
                          : 'bg-white hover:bg-[#fffdf5] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#253044] fill-[#9bf1cd] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#253044]/50 shrink-0 hover:text-[#6434df] transition-colors" />
                      )}
                      <span
                        className={`text-xs select-none font-medium ${
                          task.completed ? 'line-through text-[#253044]/60' : ''
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() =>
                  showToast(
                    `Portal launch sequence triggered for "${dl.title}".`,
                    'success'
                  )
                }
                className="w-full py-2.5 px-3 rounded-[12px] bg-[#6434df] hover:bg-[#5527cb] text-white border-2 border-[#252b3a] shadow-[2.5px_2.5px_0px_#252b3a] text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <span>Finalize & Submit Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ffd05b]" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
