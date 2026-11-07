import {
  Scholarship,
  StatItem,
  DeadlineTask,
  ApplicationProgressItem,
  UserProfile,
  AppNotification,
  MonthlyTrendData
} from '../types';
import { initialScholarshipDatabase } from './scholarshipDatabase';
import { currentUser } from './userData';

export { currentUser };

export const mockStats: StatItem[] = [
  {
    id: 'discovered',
    title: 'Scholarships Discovered',
    value: '1,428',
    numericValue: 1428,
    change: '+18.4%',
    isPositive: true,
    timeframe: 'vs last month',
    icon: 'Sparkles',
    accent: 'violet',
  },
  {
    id: 'eligible',
    title: 'Eligible Matches',
    value: '384',
    numericValue: 384,
    change: '+32 new',
    isPositive: true,
    timeframe: 'this week',
    icon: 'Target',
    accent: 'cyan',
  },
  {
    id: 'applications',
    title: 'Active Applications',
    value: '12',
    numericValue: 12,
    change: '3 in final review',
    isPositive: true,
    timeframe: 'pipeline active',
    icon: 'FileText',
    accent: 'emerald',
  },
  {
    id: 'deadlines',
    title: 'Upcoming Deadlines',
    value: '5',
    numericValue: 5,
    change: '2 within 48h',
    isPositive: false,
    timeframe: 'action required',
    icon: 'Clock',
    accent: 'amber',
  },
];

export const mockScholarships: Scholarship[] = initialScholarshipDatabase.slice(0, 6);

export const mockDeadlines: DeadlineTask[] = [
  {
    id: 'dl-1',
    title: 'Apex Global Tech Innovators Grant',
    provider: 'Apex Venture Foundation',
    awardAmount: '$25,000',
    date: 'Nov 14, 2026',
    daysRemaining: 7,
    urgency: 'urgent',
    category: 'Merit',
    tasks: [
      { id: 't-1', text: 'Upload official university transcript (PDF)', completed: true },
      { id: 't-2', text: 'Finalize 800-word statement of innovation', completed: true },
      { id: 't-3', text: 'Obtain advisor sign-off & GitHub repo link', completed: false },
    ],
  },
  {
    id: 'dl-2',
    title: 'NextGen Quantum Computing Fellowship',
    provider: 'Frontier Quantum Institute',
    awardAmount: '$35,000',
    date: 'Nov 20, 2026',
    daysRemaining: 13,
    urgency: 'approaching',
    category: 'STEM',
    tasks: [
      { id: 't-4', text: 'Complete quantum theory thesis abstract', completed: true },
      { id: 't-5', text: 'Confirm 2 faculty recommendation letters', completed: true },
      { id: 't-6', text: 'Submit video pitch (3 minutes max)', completed: false },
    ],
  },
  {
    id: 'dl-3',
    title: 'Lumina Autonomous Systems Research Grant',
    provider: 'Lumina AI Labs',
    awardAmount: '$20,000',
    date: 'Nov 28, 2026',
    daysRemaining: 21,
    urgency: 'upcoming',
    category: 'Research',
    tasks: [
      { id: 't-7', text: 'Draft research proposal & lab endorsement', completed: true },
      { id: 't-8', text: 'Itemize GPU cloud budget allocation', completed: false },
    ],
  },
];

export const mockApplicationsProgress: ApplicationProgressItem[] = [
  {
    id: 'app-1',
    scholarshipId: 'sch-1',
    title: 'NextGen Quantum Computing Fellowship',
    provider: 'Frontier Quantum Institute',
    award: '$35,000',
    stage: 'review',
    stageLabel: 'Faculty Board Review',
    progressPercentage: 80,
    nextMilestone: 'Interview Panel Invitations',
    dueDate: 'Nov 20, 2026',
    statusBadge: {
      label: 'Under Review',
      variant: 'violet',
    },
  },
  {
    id: 'app-2',
    scholarshipId: 'sch-2',
    title: 'Apex Global Tech Innovators Grant',
    provider: 'Apex Venture Foundation',
    award: '$25,000',
    stage: 'documents_pending',
    stageLabel: 'Documentation Finalization',
    progressPercentage: 65,
    nextMilestone: 'Advisor Endorsement Letter',
    dueDate: 'Nov 14, 2026',
    statusBadge: {
      label: 'Action Required',
      variant: 'amber',
    },
  },
  {
    id: 'app-3',
    scholarshipId: 'sch-3',
    title: 'Lumina Autonomous Systems Research Grant',
    provider: 'Lumina AI Labs',
    award: '$20,000',
    stage: 'draft',
    stageLabel: 'Proposal Construction',
    progressPercentage: 35,
    nextMilestone: 'Budget Justification Draft',
    dueDate: 'Nov 28, 2026',
    statusBadge: {
      label: 'In Draft',
      variant: 'cyan',
    },
  },
  {
    id: 'app-4',
    scholarshipId: 'sch-4',
    title: 'Underrepresented Leaders in Engineering',
    provider: 'Horizon Aerospace',
    award: '$18,500',
    stage: 'submitted',
    stageLabel: 'Verification & Scoring',
    progressPercentage: 100,
    nextMilestone: 'Decision Announcement (Dec 18)',
    dueDate: 'Dec 05, 2026',
    statusBadge: {
      label: 'Submitted',
      variant: 'emerald',
    },
  },
];

export const mockTrendData: MonthlyTrendData[] = [
  { month: 'Jun', discovered: 240, applied: 3, potentialValueK: 45 },
  { month: 'Jul', discovered: 380, applied: 5, potentialValueK: 75 },
  { month: 'Aug', discovered: 620, applied: 7, potentialValueK: 110 },
  { month: 'Sep', discovered: 890, applied: 9, potentialValueK: 145 },
  { month: 'Oct', discovered: 1150, applied: 11, potentialValueK: 185 },
  { month: 'Nov', discovered: 1428, applied: 14, potentialValueK: 230 },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Critical Deadline Alert',
    description: 'Apex Global Tech Innovators Grant closes in 7 days. 1 task remains pending.',
    timestamp: '15m ago',
    read: false,
    type: 'deadline',
  },
  {
    id: 'notif-2',
    title: 'New High-Score Match',
    description: 'AI match engine identified "NextGen Quantum Computing Fellowship" with 98% compatibility.',
    timestamp: '2h ago',
    read: false,
    type: 'match',
  },
  {
    id: 'notif-3',
    title: 'Application Status Updated',
    description: 'Horizon Aerospace confirmed your application moved to "Committee Final Round".',
    timestamp: '1d ago',
    read: true,
    type: 'status',
  },
  {
    id: 'notif-4',
    title: 'System Profile Optimization',
    description: 'Adding your GitHub repository boosted your STEM eligibility score by +14%.',
    timestamp: '3d ago',
    read: true,
    type: 'system',
  },
];
