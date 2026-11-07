import React, { useState, useMemo, Suspense, lazy } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { MobileNav } from './components/layout/MobileNav';
import { WelcomeBanner } from './components/dashboard/WelcomeBanner';
import { StatCards } from './components/dashboard/StatCards';
import { RecommendationSection } from './components/dashboard/RecommendationSection';
import { UpcomingDeadlines } from './components/dashboard/UpcomingDeadlines';
import { ApplicationProgress } from './components/dashboard/ApplicationProgress';
import { ScholarshipDetailModal } from './components/modals/ScholarshipDetailModal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { useBookmarks } from './hooks/useBookmarks';
import { useStudentProfile } from './hooks/useStudentProfile';
import { useApplications } from './hooks/useApplications';
import { useDocumentVault } from './hooks/useDocumentVault';
import { mockStats } from './data/mockData';
import { getComputedScholarships } from './data/scholarshipDatabase';
import { Scholarship } from './types';
import { Loader2 } from 'lucide-react';

// Code-split dynamic page-level modules to optimize initial bundle size & performance (Phase 5)
const ScholarshipDiscoveryEngine = lazy(() =>
  import('./components/discovery/ScholarshipDiscoveryEngine').then((m) => ({
    default: m.ScholarshipDiscoveryEngine,
  }))
);

const StudentProfilePage = lazy(() =>
  import('./components/profile/StudentProfilePage').then((m) => ({
    default: m.StudentProfilePage,
  }))
);

const ApplicationsTracker = lazy(() =>
  import('./components/applications/ApplicationsTracker').then((m) => ({
    default: m.ApplicationsTracker,
  }))
);

const DeadlinesCalendarView = lazy(() =>
  import('./components/deadlines/DeadlinesCalendarView').then((m) => ({
    default: m.DeadlinesCalendarView,
  }))
);

const DocumentVault = lazy(() =>
  import('./components/vault/DocumentVault').then((m) => ({
    default: m.DocumentVault,
  }))
);

const AiEssayAssistant = lazy(() =>
  import('./components/assistant/AiEssayAssistant').then((m) => ({
    default: m.AiEssayAssistant,
  }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-20 space-y-4">
    <div className="relative w-14 h-14 rounded-[14px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] flex items-center justify-center p-1.5 animate-pulse">
      <img src="/beacon-icon.png" alt="BEACON" className="w-full h-full object-contain" />
    </div>
    <div className="flex items-center gap-2 text-xs font-display font-bold text-[#253044] uppercase tracking-wider">
      <Loader2 className="w-4 h-4 text-[#6434df] animate-spin" />
      <span>Loading BEACON Module...</span>
    </div>
  </div>
);

const DashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Persistent student profile & validation hook
  const { profile, updateProfile, resetProfile, validationErrors } = useStudentProfile();

  // Persistent bookmarks via localStorage
  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();

  // Persistent Application Command Center & funding analytics hook
  const applicationsState = useApplications();

  // Persistent Centralized Document Vault hook with IndexedDB binary storage
  const vaultState = useDocumentVault();

  const { showToast } = useToast();

  // Recompute deterministic eligibility matches dynamically whenever the student profile updates
  const computedScholarships = useMemo(() => {
    return getComputedScholarships(profile);
  }, [profile]);

  // Real-time count of fully eligible scholarships
  const eligibleCount = useMemo(() => {
    return computedScholarships.filter((s) => s.eligibilityStatus === 'eligible').length;
  }, [computedScholarships]);

  // Connect computed counts to the Dashboard statistics cards
  const dynamicStats = useMemo(() => {
    return mockStats.map((st) => {
      if (st.id === 'eligible') {
        return {
          ...st,
          value: `${eligibleCount}`,
          numericValue: eligibleCount,
          change: `${eligibleCount} qualified`,
          isPositive: true,
        };
      }
      if (st.id === 'discovered') {
        return {
          ...st,
          value: `${computedScholarships.length}`,
          numericValue: computedScholarships.length,
        };
      }
      if (st.id === 'applications') {
        return {
          ...st,
          value: `${applicationsState.fundingAnalytics.activeCount}`,
          numericValue: applicationsState.fundingAnalytics.activeCount,
          change: `${applicationsState.fundingAnalytics.underReviewCount} under review`,
          isPositive: true,
        };
      }
      return st;
    });
  }, [eligibleCount, computedScholarships.length, applicationsState.fundingAnalytics]);

  // Dynamic recommendations prioritized by computed match score (highest matching eligible opportunities first)
  const topRecommendations = useMemo(() => {
    return [...computedScholarships]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  }, [computedScholarships]);

  const handleOpenDetails = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setIsModalOpen(true);
  };

  const handleExploreRecommendations = () => {
    setActiveTab('discover');
    showToast('Navigated to Scholarship Discovery Engine', 'info');
  };

  const handleStatCardClick = (statId: string) => {
    if (statId === 'discovered' || statId === 'eligible') {
      setActiveTab('discover');
      showToast('Viewing verified and qualified scholarship matches', 'info');
    } else if (statId === 'applications') {
      setActiveTab('applications');
      showToast('Focusing on your active application tracking pipeline', 'info');
    } else if (statId === 'deadlines') {
      setActiveTab('deadlines');
      showToast('Navigated to Deadlines & Tasks calendar', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] text-[#253044] font-reading flex selection:bg-[#f1ebff] selection:text-[#6434df]">
      {/* Premium Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationsCount={applicationsState.fundingAnalytics.activeCount}
        vaultCount={vaultState.vaultStats.totalCount}
        className="hidden lg:flex"
      />

      {/* Responsive Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationsCount={applicationsState.fundingAnalytics.activeCount}
        vaultCount={vaultState.vaultStats.totalCount}
        user={profile}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          user={profile}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            // If user searches from top bar while on dashboard, offer instant discovery
            if (q.trim() && activeTab !== 'discover') {
              setActiveTab('discover');
            }
          }}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onNavigateToProfile={() => setActiveTab('profile')}
        />

        {/* Dynamic Main Body based on Active Tab with Suspense fallback for code-split chunks */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          <Suspense fallback={<PageLoadingFallback />}>
            {activeTab === 'discover' ? (
              /* Complete Functional Scholarship Discovery Engine */
              <ScholarshipDiscoveryEngine
                scholarships={computedScholarships}
                onViewDetails={handleOpenDetails}
                onToggleBookmark={toggleBookmark}
                bookmarkedIds={bookmarkedIds}
                initialSearchQuery={searchQuery}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            ) : activeTab === 'profile' ? (
              /* Complete Student Profile & Eligibility Intelligence Engine */
              <StudentProfilePage
                profile={profile}
                onUpdateProfile={updateProfile}
                onResetProfile={resetProfile}
                validationErrors={validationErrors}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToDiscover={() => setActiveTab('discover')}
              />
            ) : activeTab === 'applications' ? (
              /* Application Command Center & Pipeline View */
              <ApplicationsTracker
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToDiscover={() => setActiveTab('discover')}
                bookmarkedIds={bookmarkedIds}
                externalApplicationsState={applicationsState}
              />
            ) : activeTab === 'deadlines' ? (
              /* Deadlines Calendar & Milestone View */
              <DeadlinesCalendarView
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToDiscover={() => setActiveTab('discover')}
              />
            ) : activeTab === 'vault' ? (
              /* Centralized Document Vault with IndexedDB Storage */
              <DocumentVault
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToApplications={() => setActiveTab('applications')}
                externalApplicationsState={applicationsState}
                externalVaultState={vaultState}
              />
            ) : activeTab === 'assistant' ? (
              /* AI Essay Assistant & Personal Statement Workshop */
              <AiEssayAssistant
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToVault={() => setActiveTab('vault')}
                onNavigateToApplications={() => setActiveTab('applications')}
                externalApplicationsState={applicationsState}
                externalVaultState={vaultState}
              />
            ) : activeTab === 'analytics' ? (
              /* Analytics & Financials Breakdown */
              <ApplicationsTracker
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToDiscover={() => setActiveTab('discover')}
                bookmarkedIds={bookmarkedIds}
                externalApplicationsState={applicationsState}
                initialViewMode="analytics"
              />
            ) : activeTab === 'settings' ? (
              /* Scholar Settings & Profile Configuration */
              <StudentProfilePage
                profile={profile}
                onUpdateProfile={updateProfile}
                onResetProfile={resetProfile}
                validationErrors={validationErrors}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToDiscover={() => setActiveTab('discover')}
              />
            ) : (
              /* Preserved Dashboard Foundation with Real-Time Data Wiring */
              <>
                {/* 4. Welcome Section with Live Profile Data */}
                <WelcomeBanner
                  user={profile}
                  onExploreRecommendations={handleExploreRecommendations}
                />

                {/* 5. Statistics Cards with Dynamically Computed Eligible Count & Applications */}
                <StatCards
                  stats={dynamicStats}
                  onStatClick={handleStatCardClick}
                />

                {/* 8. Application Progress Visualization Wired to Live Application Records */}
                <ApplicationProgress
                  applications={applicationsState.applications}
                  onNavigateToApplications={() => setActiveTab('applications')}
                  onSelectApplication={() => setActiveTab('applications')}
                />

                {/* 7. Upcoming Deadline Section */}
                <div id="deadlines-section">
                  <UpcomingDeadlines />
                </div>

                {/* 6. Dynamic Scholarship Recommendation Cards based on Student Profile */}
                <RecommendationSection
                  scholarships={topRecommendations}
                  onViewDetails={handleOpenDetails}
                  searchQuery={searchQuery}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark}
                  onOpenDiscovery={() => setActiveTab('discover')}
                />
              </>
            )}
          </Suspense>

          {/* Persistent Playful Geometric Footer */}
          <footer className="pt-10 pb-6 border-t-[2.5px] border-[#252b3a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-reading text-[#253044]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-white border-[2px] border-[#252b3a] flex items-center justify-center shadow-[2px_2px_0px_#252b3a] p-1 overflow-hidden shrink-0">
                <img src="/beacon-icon.png" alt="BEACON" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-extrabold text-base text-[#253044] tracking-tight">
                BEACON
              </span>
              <span className="text-[#252b3a]/40">•</span>
              <span className="font-semibold">Unified Scholarship Discovery & Management Platform</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9bf1cd] text-[#253044] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
                <span className="w-2 h-2 rounded-full bg-[#253044] animate-pulse" />
                Eligibility Engine Online
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1ebff] text-[#6434df] border-[1.5px] border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
                <span className="w-2 h-2 rounded-full bg-[#6434df] animate-pulse" />
                Command Center Active
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* Global Scholarship Details Modal with Full Transparent Breakdown & Tracker Action */}
      <ScholarshipDetailModal
        scholarship={selectedScholarship}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleBookmark={toggleBookmark}
        isBookmarked={
          selectedScholarship ? isBookmarked(selectedScholarship.id) : false
        }
        isApplicationTracked={
          selectedScholarship ? applicationsState.hasApplication(selectedScholarship.id) : false
        }
        applicationStatus={
          selectedScholarship ? applicationsState.getApplication(selectedScholarship.id)?.status : undefined
        }
        onAddToApplications={(sch) => {
          applicationsState.addApplication(sch);
          showToast(`Added "${sch.title}" to application tracker!`, 'success');
        }}
        onNavigateToApplications={() => {
          setActiveTab('applications');
          showToast('Navigated to Application Command Center', 'info');
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
};

export default App;
