import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Download,
  Filter,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  FileCheck2
} from 'lucide-react';
import { DeadlineTask, ScholarshipCategory } from '../../types';
import { mockDeadlines } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface DeadlinesCalendarViewProps {
  onBackToDashboard?: () => void;
  onNavigateToDiscover?: () => void;
}

export const DeadlinesCalendarView: React.FC<DeadlinesCalendarViewProps> = ({
  onBackToDashboard,
  onNavigateToDiscover,
}) => {
  const [deadlines, setDeadlines] = useState<DeadlineTask[]>([
    ...mockDeadlines,
    {
      id: 'dl-4',
      title: 'Horizon Aerospace Diversity & Leadership Award',
      provider: 'Horizon Aerospace Consortium',
      awardAmount: '$18,500',
      date: 'Dec 05, 2026',
      daysRemaining: 28,
      urgency: 'upcoming',
      category: 'Diversity',
      tasks: [
        { id: 't-9', text: 'Obtain university chapter leadership endorsement', completed: true },
        { id: 't-10', text: 'Upload diversity in space exploration essay', completed: false },
        { id: 't-11', text: 'Submit official fall semester grades', completed: false },
      ],
    },
    {
      id: 'dl-5',
      title: 'Ada Lovelace Computational Sciences Fellowship',
      provider: 'International Society for Computational Mathematics',
      awardAmount: '$30,000',
      date: 'Dec 10, 2026',
      daysRemaining: 33,
      urgency: 'upcoming',
      category: 'Merit',
      tasks: [
        { id: 't-12', text: 'Nomination letter from department dean', completed: true },
        { id: 't-13', text: 'Algorithm and proofs sample portfolio', completed: false },
      ],
    },
  ]);

  const [filterUrgency, setFilterUrgency] = useState<'all' | 'urgent' | 'approaching' | 'upcoming'>('all');
  const [viewMode, setViewMode] = useState<'agenda' | 'calendar'>('agenda');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedDeadlineId, setSelectedDeadlineId] = useState(deadlines[0]?.id || '');
  const [newTaskText, setNewTaskText] = useState('');
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
              ? `Completed: "${task.text}"`
              : `Marked incomplete: "${task.text}"`,
            nextState ? 'success' : 'info'
          );
          return { ...task, completed: nextState };
        });
        return { ...dl, tasks: updatedTasks };
      })
    );
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedDeadlineId) return;

    setDeadlines((prev) =>
      prev.map((dl) => {
        if (dl.id !== selectedDeadlineId) return dl;
        return {
          ...dl,
          tasks: [
            ...dl.tasks,
            {
              id: `t-${Date.now()}`,
              text: newTaskText.trim(),
              completed: false,
            },
          ],
        };
      })
    );

    showToast('New milestone task added to deadline checklist', 'success');
    setNewTaskText('');
    setIsAddTaskModalOpen(false);
  };

  const handleExportICal = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//BEACON//Scholarship Deadlines//EN\n${deadlines
      .map(
        (dl) =>
          `BEGIN:VEVENT\nSUMMARY:${dl.title} Deadline\nDESCRIPTION:Scholarship closing date for ${dl.awardAmount} by ${dl.provider}\nSTATUS:CONFIRMED\nEND:VEVENT`
      )
      .join('\n')}\nEND:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'beacon_scholarship_deadlines.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Calendar schedule (.ics) generated and downloaded!', 'success');
  };

  const filteredDeadlines = deadlines.filter((dl) => {
    if (filterUrgency === 'all') return true;
    return dl.urgency === filterUrgency;
  });

  const urgentCount = deadlines.filter((d) => d.urgency === 'urgent' || d.daysRemaining <= 7).length;
  const approachingCount = deadlines.filter((d) => d.urgency === 'approaching').length;

  return (
    <div className="space-y-6 font-reading">
      {/* Top Banner */}
      <div className="rounded-[17px] p-6 sm:p-8 bg-white border-[2.5px] border-[#252b3a] relative overflow-hidden shadow-[6px_6px_0px_#6434df]">
        <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-[#ffd05b]/40 border-[2px] border-[#252b3a] pointer-events-none -rotate-6" />
        <div className="absolute -bottom-4 right-28 w-14 h-14 bg-[#ff78c5]/40 border-[2px] border-[#252b3a] rotate-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#ffd05b] text-[#253044] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a]">
              <CalendarIcon className="w-3.5 h-3.5 text-[#6434df]" />
              <span>BEACON Milestone & Deadline Schedule</span>
              <span className="w-2 h-2 rounded-full bg-[#6434df] animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-[#253044] tracking-tight">
              Deadlines & <span className="text-[#6434df]">Task Schedule</span>
            </h1>

            <p className="text-sm font-reading text-[#596174] max-w-2xl leading-relaxed">
              Track closing dates, manage deliverables checklists, and sync submission deadlines with your personal calendar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-4 py-2.5 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs sm:text-sm font-bold border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#252b3a] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Checklist Task</span>
            </button>

            <button
              onClick={handleExportICal}
              className="px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#f1ebff] border-[2.5px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] text-xs sm:text-sm font-bold text-[#253044] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
              <span>Export iCal / Google</span>
            </button>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#fffdf5] border-[2.5px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] text-xs sm:text-sm font-bold text-[#253044] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[17px] bg-[#ffd05b] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#253044] block">Urgent Deadlines</span>
            <span className="text-2xl font-extrabold font-display text-[#253044] mt-1 block">
              {urgentCount} Closing Soon
            </span>
            <span className="text-[11px] font-reading font-bold text-[#253044]/80 block mt-0.5">Under 7 days remaining</span>
          </div>
          <div className="p-3 rounded-[12px] bg-white border-[2px] border-[#252b3a] text-[#253044] shadow-[2px_2px_0px_#252b3a]">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="p-5 rounded-[17px] bg-[#f1ebff] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#6434df] block">Approaching Milestones</span>
            <span className="text-2xl font-extrabold font-display text-[#253044] mt-1 block">
              {approachingCount} Opportunities
            </span>
            <span className="text-[11px] font-reading font-semibold text-[#253044]/70 block mt-0.5">Within 14–21 days</span>
          </div>
          <div className="p-3 rounded-[12px] bg-white border-[2px] border-[#252b3a] text-[#6434df] shadow-[2px_2px_0px_#252b3a]">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="p-5 rounded-[17px] bg-[#9bf1cd] border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#253044] block">Pending Deliverables</span>
            <span className="text-2xl font-extrabold font-display text-[#253044] mt-1 block">
              {deadlines.reduce((acc, d) => acc + d.tasks.filter((t) => !t.completed).length, 0)} Tasks
            </span>
            <span className="text-[11px] font-reading font-bold text-[#253044]/80 block mt-0.5">Checklist requirements</span>
          </div>
          <div className="p-3 rounded-[12px] bg-white border-[2px] border-[#252b3a] text-[#253044] shadow-[2px_2px_0px_#252b3a]">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#253044]/70 font-bold mr-1 shrink-0">
            Filter:
          </span>
          <button
            onClick={() => setFilterUrgency('all')}
            className={`px-3.5 py-1.5 rounded-[12px] font-bold border-[2px] border-[#252b3a] transition-all shrink-0 cursor-pointer ${
              filterUrgency === 'all'
                ? 'bg-[#6434df] text-white shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#f1ebff]'
            }`}
          >
            All Deadlines ({deadlines.length})
          </button>
          <button
            onClick={() => setFilterUrgency('urgent')}
            className={`px-3.5 py-1.5 rounded-[12px] font-bold border-[2px] border-[#252b3a] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterUrgency === 'urgent'
                ? 'bg-[#ffd05b] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#fffdf5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#253044]" />
            <span>Urgent (7d)</span>
          </button>
          <button
            onClick={() => setFilterUrgency('approaching')}
            className={`px-3.5 py-1.5 rounded-[12px] font-bold border-[2px] border-[#252b3a] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterUrgency === 'approaching'
                ? 'bg-[#f1ebff] text-[#6434df] shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#f1ebff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#6434df]" />
            <span>Approaching (14d)</span>
          </button>
          <button
            onClick={() => setFilterUrgency('upcoming')}
            className={`px-3.5 py-1.5 rounded-[12px] font-bold border-[2px] border-[#252b3a] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterUrgency === 'upcoming'
                ? 'bg-[#9bf1cd] text-[#253044] shadow-[2px_2px_0px_#252b3a]'
                : 'bg-white text-[#253044] hover:bg-[#e9fff5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#253044]" />
            <span>Later This Term</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-[12px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[2px_2px_0px_#252b3a] text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-[9px] font-bold transition-all cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                : 'text-[#253044] hover:bg-[#f1ebff]'
            }`}
          >
            Timeline Agenda
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-[9px] font-bold transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-[#6434df] text-white border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]'
                : 'text-[#253044] hover:bg-[#f1ebff]'
            }`}
          >
            Month Grid
          </button>
        </div>
      </div>

      {/* Main View: Timeline Agenda vs Month Grid */}
      {viewMode === 'agenda' ? (
        <div className="space-y-4">
          {filteredDeadlines.map((dl) => {
            const completedCount = dl.tasks.filter((t) => t.completed).length;
            const totalCount = dl.tasks.length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={dl.id}
                className="p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#252b3a] transition-all duration-300 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6"
              >
                {/* Left Section: Info & Due Date */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a] ${
                        dl.urgency === 'urgent'
                          ? 'bg-[#ffd05b] text-[#253044]'
                          : dl.urgency === 'approaching'
                          ? 'bg-[#f1ebff] text-[#6434df]'
                          : 'bg-[#9bf1cd] text-[#253044]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{dl.daysRemaining} Days Remaining</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fffdf5] text-[#253044] border-[1.5px] border-[#252b3a]">
                      {dl.category}
                    </span>

                    <span className="font-display font-extrabold text-sm text-[#6434df]">
                      {dl.awardAmount}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#253044]">
                      {dl.title}
                    </h3>
                    <p className="text-xs font-reading text-[#253044]/70 mt-0.5">{dl.provider}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#253044]/80 font-bold">
                    <span className="flex items-center gap-1.5 text-[#253044]">
                      <CalendarIcon className="w-4 h-4 text-[#6434df] stroke-[2.5]" />
                      Portal Closure Date: <strong className="text-[#6434df]">{dl.date}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[#253044]">
                      {completedCount} of {totalCount} Requirements Completed ({percent}%)
                    </span>
                  </div>

                  <div className="w-full max-w-md h-2.5 bg-[#fffdf5] rounded-full border-[1.5px] border-[#252b3a] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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

                {/* Right Section: Interactive Deliverables Checklist */}
                <div className="w-full lg:w-96 space-y-2.5 p-4 rounded-[14px] bg-[#fffdf5] border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] shrink-0">
                  <div className="flex items-center justify-between text-xs pb-1 border-b-[1.5px] border-[#252b3a]/20">
                    <span className="font-bold uppercase tracking-wider text-[#253044]">
                      Checklist Requirements
                    </span>
                    <span className="text-[11px] text-[#6434df] font-bold">Click to toggle</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {dl.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(dl.id, task.id)}
                        className={`p-2 rounded-[10px] border-[1.5px] border-[#252b3a] transition-all cursor-pointer flex items-center gap-2.5 text-xs shadow-[1.5px_1.5px_0px_#252b3a] ${
                          task.completed
                            ? 'bg-[#e9fff5] text-[#253044]'
                            : 'bg-white hover:bg-[#fffdf5] text-[#253044]'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#253044] stroke-[2.5] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#253044]/50 shrink-0 hover:text-[#6434df] transition-colors" />
                        )}
                        <span className={`select-none leading-snug font-semibold ${task.completed ? 'line-through text-[#253044]/60' : ''}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      showToast(`Portal submission verification initiated for "${dl.title}".`, 'success')
                    }
                    className="w-full py-2 rounded-[10px] bg-[#f1ebff] hover:bg-[#6434df] text-[#6434df] hover:text-white border-[2px] border-[#252b3a] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#252b3a] cursor-pointer"
                  >
                    <span>Launch Portal Submission</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar Month Grid Simulation */
        <div className="p-6 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[5px_5px_0px_#252b3a] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#253044]">November – December 2026</h3>
            <span className="text-xs text-[#253044]/70 font-semibold">Deadlines mapped across academic calendar</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-[#253044] font-bold border-b-[2px] border-[#252b3a] pb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {/* Days simulation */}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = (i % 30) + 1;
              const hasDl = deadlines.find((d) => d.date.includes(day.toString()));
              return (
                <div
                  key={i}
                  className={`min-h-[70px] p-2 rounded-[12px] border-[2px] border-[#252b3a] flex flex-col justify-between transition-colors shadow-[2px_2px_0px_#252b3a] ${
                    hasDl
                      ? 'bg-[#f1ebff]'
                      : 'bg-[#fffdf5]'
                  }`}
                >
                  <span className={`font-mono text-[11px] ${hasDl ? 'text-[#6434df] font-bold' : 'text-[#253044]/60'}`}>
                    {day}
                  </span>
                  {hasDl && (
                    <span className="text-[10px] p-1 rounded-[6px] bg-[#ffd05b] border-[1px] border-[#252b3a] text-[#253044] truncate font-bold">
                      {hasDl.title.split(' ')[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddTaskModalOpen(false)}
              className="fixed inset-0 bg-[#253044]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white border-[3px] border-[#252b3a] rounded-[17px] shadow-[8px_8px_0px_#252b3a] p-6 space-y-4 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#252b3a]">
                <h3 className="font-display font-bold text-base text-[#253044] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#ffd05b] border-[1.5px] border-[#252b3a] flex items-center justify-center shadow-[1.5px_1.5px_0px_#252b3a]">
                    <Plus className="w-4 h-4 stroke-[3] text-[#253044]" />
                  </div>
                  <span>Add Milestone Task</span>
                </h3>
                <button
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="p-1 rounded-[8px] text-[#253044] hover:bg-[#ff78c5] border border-transparent hover:border-[#252b3a] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNewTask} className="space-y-3 text-xs font-reading">
                <div>
                  <label className="block text-[#253044] font-bold mb-1">
                    Select Target Opportunity
                  </label>
                  <select
                    value={selectedDeadlineId}
                    onChange={(e) => setSelectedDeadlineId(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] font-bold outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a]"
                  >
                    {deadlines.map((dl) => (
                      <option key={dl.id} value={dl.id} className="bg-white">
                        {dl.title} ({dl.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#253044] font-bold mb-1">
                    Task Description / Deliverable
                  </label>
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="e.g. Request faculty recommendation letter from Prof. Smith"
                    className="w-full p-2.5 rounded-[12px] bg-[#ffffff] border-[2px] border-[#252b3a] text-[#253044] outline-none focus:ring-2 focus:ring-[#6434df] shadow-[2px_2px_0px_#252b3a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t-[2px] border-[#252b3a]">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskModalOpen(false)}
                    className="px-4 py-2 rounded-[12px] text-xs font-bold text-[#253044] hover:bg-[#fffdf5] border-[2px] border-transparent hover:border-[#252b3a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-[12px] bg-[#6434df] hover:bg-[#5228bf] text-white text-xs font-bold border-[2px] border-[#252b3a] shadow-[3px_3px_0px_#252b3a] cursor-pointer"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
