export type ScholarshipCategory = 'STEM' | 'Merit' | 'Research' | 'Diversity' | 'Leadership' | 'Need-Based';

export type ApplicationStage = 'not_applied' | 'draft' | 'documents_pending' | 'review' | 'submitted' | 'interview' | 'awarded';

export type ApplicationStatus = 'Saved' | 'Applying' | 'Submitted' | 'Under Review' | 'Awarded' | 'Rejected';

export type DocumentChecklistStatus = 'ready' | 'pending' | 'missing';

export interface ApplicationDocument {
  id: string;
  name: string;
  category: 'transcript' | 'id' | 'recommendation' | 'essay' | 'resume' | 'income' | 'other';
  status: DocumentChecklistStatus;
  fileName?: string;
  fileSize?: string;
  lastUpdated?: string;
  required: boolean;
  notes?: string;
}

export type TimelineEventStage = 'created' | 'documents' | 'submitted' | 'under_review' | 'decision';

export interface ApplicationTimelineEvent {
  id: string;
  title: string;
  stage: TimelineEventStage;
  date?: string;
  completed: boolean;
  notes?: string;
}

export interface ApplicationRecord {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  provider: string;
  fundingAmount: number;
  fundingFormatted: string;
  deadline: string;
  status: ApplicationStatus;
  submissionDate?: string;
  personalNotes: string;
  progressPercentage: number;
  documents: ApplicationDocument[];
  timeline: ApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  category?: ScholarshipCategory;
  educationLevel?: string;
  portalUrl?: string;
}

export interface ApplicationFilters {
  searchQuery: string;
  status: 'All' | ApplicationStatus;
  sortBy: 'deadline-asc' | 'funding-desc' | 'progress-desc' | 'recent';
}

export type VaultDocumentCategory =
  | 'Academic Transcripts'
  | 'Identification'
  | 'Recommendation Letters'
  | 'Personal Statements'
  | 'Resume/CV'
  | 'Financial Documents'
  | 'Certificates'
  | 'Other';

export type VerificationStatus =
  | 'Uploaded'
  | 'Pending Verification'
  | 'Verified'
  | 'Expired';

export interface VaultDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  category: VaultDocumentCategory;
  uploadDate: string;
  lastModified: string;
  verificationStatus: VerificationStatus;
  verificationIssuer?: string;
  linkedApplicationIds: string[];
  tags: string[];
  description?: string;
  previewUrl?: string;
  fileType: 'pdf' | 'docx' | 'doc' | 'png' | 'jpg' | 'other';
  mimeType: string;
}

export type EssayTone = 'Academic' | 'Persuasive' | 'Visionary' | 'Storytelling';

export interface EssayCritiqueFactor {
  name: string;
  score: number; // 0 - 100
  weight: number;
  status: 'excellent' | 'good' | 'needs_work';
  feedback: string;
  actionItem: string;
}

export interface EssayCritiqueResult {
  overallScore: number;
  strengthLabel: 'Highly Competitive' | 'Competitive' | 'Promising' | 'Needs Revision';
  wordCount: number;
  targetWordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  factors: EssayCritiqueFactor[];
  strengths: string[];
  recommendations: string[];
}

export interface EssayPrompt {
  id: string;
  scholarshipId?: string;
  scholarshipTitle: string;
  provider: string;
  promptText: string;
  targetWordCount: number;
  minWordCount?: number;
  maxWordCount?: number;
  suggestedOutline: {
    section: string;
    focus: string;
    targetWords: number;
  }[];
}

export interface EssayDraft {
  id: string;
  title: string;
  promptId: string;
  promptText: string;
  targetScholarshipTitle: string;
  scholarshipId?: string;
  content: string;
  tone: EssayTone;
  targetWordCount: number;
  lastUpdated: string;
  savedToVault?: boolean;
}

export type FundingType = 'Full Tuition' | 'Partial Tuition' | 'Research Stipend' | 'One-Time Grant' | 'Annual Award' | 'Living Allowance';

export type EducationLevel = 'Undergraduate' | 'Graduate' | 'Doctorate' | 'High School' | 'All Levels' | (string & {});

export type EligibilityStatus = 'eligible' | 'potentially_eligible' | 'not_eligible' | 'insufficient_information';

export interface MatchFactor {
  factor: 'Education Level' | 'GPA Requirement' | 'Academic Discipline' | 'Residency & Nationality' | 'Financial Need & Income';
  passed: boolean;
  scoreContribution: number;
  maxScore: number;
  detail: string;
}

export interface CalculatedMatch {
  matchPercentage: number;
  status: EligibilityStatus;
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'red' | 'cyan';
  requirementsSatisfied: string[];
  requirementsNotSatisfied: string[];
  missingInformation: string[];
  explanation: string;
  disqualifyingReason?: string;
  factors: MatchFactor[];
}

export interface EligibilityRequirement {
  id: string;
  label: string;
  fulfilled: boolean;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  providerLogo?: string;
  awardAmount: number;
  awardFormatted: string;
  fundingType?: FundingType;
  deadline: string;
  daysLeft: number;
  matchScore: number;
  eligibilityStatus?: EligibilityStatus;
  statusLabel?: string;
  statusColor?: 'emerald' | 'amber' | 'red' | 'cyan';
  requirementsSatisfied?: string[];
  requirementsNotSatisfied?: string[];
  missingInformation?: string[];
  explanation?: string;
  disqualifyingReason?: string;
  matchFactors?: MatchFactor[];
  category: ScholarshipCategory;
  educationLevel: EducationLevel;
  country?: string;
  gpaRequirement?: number;
  maxIncomeLimit?: number;
  eligibleDisciplines?: string[];
  mandatoryRequirements?: string[];
  description: string;
  requirementsCount: number;
  eligibility?: string[];
  requiredDocuments?: string[];
  applicationProcess?: string[];
  applicationUrl?: string;
  isDemo?: boolean;
  dateAdded?: string;
  appliedStatus?: ApplicationStage;
  tags: string[];
  featured?: boolean;
  bookmarked?: boolean;
  essayRequired?: boolean;
  location?: string;
}

export interface ApplicationMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface ApplicationProgressItem {
  id: string;
  scholarshipId: string;
  title: string;
  provider: string;
  award: string;
  stage: ApplicationStage;
  stageLabel: string;
  progressPercentage: number;
  nextMilestone: string;
  dueDate: string;
  statusBadge: {
    label: string;
    variant: 'violet' | 'cyan' | 'emerald' | 'amber';
  };
}

export interface StatItem {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  change: string;
  isPositive: boolean;
  timeframe: string;
  icon: string;
  accent: 'violet' | 'cyan' | 'emerald' | 'amber';
}

export interface DeadlineTask {
  id: string;
  title: string;
  provider: string;
  awardAmount: string;
  date: string;
  daysRemaining: number;
  urgency: 'urgent' | 'approaching' | 'upcoming';
  category: ScholarshipCategory;
  tasks: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  country: string;
  state: string;
  educationLevel: 'Undergraduate' | 'Graduate' | 'Doctorate' | 'High School';
  university: string;
  degree: string;
  currentAcademicYear: string;
  gpa: number;
  annualFamilyIncome?: number;
  fieldOfStudy: string;
  relevantAchievements: string[];

  // Compatibility and auxiliary fields
  role: string;
  handle: string;
  avatar: string;
  institution: string;
  major: string;
  profileCompletion: number;
  totalAwarded: string;
  activeApplicationsCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'deadline' | 'match' | 'status' | 'system';
}

export interface MonthlyTrendData {
  month: string;
  discovered: number;
  applied: number;
  potentialValueK: number;
}

export type SortOption =
  | 'match-desc'
  | 'funding-desc'
  | 'funding-asc'
  | 'deadline-asc'
  | 'date-desc';

export interface DiscoveryFilters {
  searchQuery: string;
  categories: ScholarshipCategory[];
  educationLevel: string;
  fundingRange: string;
  country: string;
  onlyBookmarked: boolean;
  eligibilityFilter?: 'all' | 'eligible' | 'potentially_eligible' | 'not_eligible';
  sortBy: SortOption;
}
