'use client';

import React from 'react';
import { ToastProvider } from '@/context/ToastContext';
import { ScreenerProvider, useScreener } from '@/context/ScreenerContext';
import { Navbar } from '@/components/layout/Navbar';
import { SidebarFilters } from '@/components/screener/SidebarFilters';
import { ActiveFiltersBar } from '@/components/screener/ActiveFiltersBar';
import { FundCard } from '@/components/screener/FundCard';
import { FundTable } from '@/components/screener/FundTable';
import { KpiModal } from '@/components/screener/KpiModal';
import { ComparisonBar } from '@/components/comparison/ComparisonBar';
import { ComparisonMatrixModal } from '@/components/comparison/ComparisonMatrixModal';
import { FundDetailDrawer } from '@/components/drawer/FundDetailDrawer';
import { SimSimPage } from '@/components/simsim/SimSimPage';
import { SimSimSidebar } from '@/components/simsim/SimSimSidebar';
import { SimSimFloatingTray } from '@/components/simsim/SimSimFloatingTray';
import { SimSimBasketModal } from '@/components/simsim/SimSimBasketModal';
import { BackToTop } from '@/components/common/BackToTop';
import { FundCardSkeleton } from '@/components/screener/FundCardSkeleton';
import { FundTableSkeleton } from '@/components/screener/FundTableSkeleton';

const ScreenerDashboard: React.FC = () => {
  const {
    appMode,
    filteredFunds,
    loading,
    isPrimed,
    viewMode,
    displayLimit,
    loadMoreFunds
  } = useScreener();

  const displayedFunds = filteredFunds.slice(0, displayLimit);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background selection:bg-primary/20">
      <Navbar />

      {/* Main Workspace Layout (Sidebar + Content) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Dynamic Sidebar: Screener Filters OR SimSim Portal Controls */}
        <div key={`sidebar-${appMode}`} className="view-transition-enter flex flex-shrink-0">
          {appMode === 'screener' ? (
            <SidebarFilters />
          ) : (
            <SimSimSidebar />
          )}
        </div>

        {/* Right Main Content Panel */}
        <main
          key={`main-content-${appMode}`}
          className="view-transition-enter flex-1 p-3 sm:p-5 lg:p-6 space-y-4 min-w-0 overflow-y-auto"
        >
          {appMode === 'screener' ? (
            <>
              {/* Active Filters Bar & Controls */}
              <ActiveFiltersBar />

              {/* Loading State Skeleton with Coordinated Atomic Barrier */}
              {loading || !isPrimed ? (
                viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5" data-testid="cards-skeleton-grid">
                    {[...Array(6)].map((_, i) => (
                      <FundCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <FundTableSkeleton rowCount={12} />
                )
              ) : viewMode === 'cards' ? (
                /* Cards View (Responsive 1-col on mobile, 2-col tablet, 3-col desktop) */
                <div className="space-y-6 view-transition-enter">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {displayedFunds.map(fund => (
                      <FundCard key={String(fund.code)} fund={fund} />
                    ))}
                  </div>

                  {/* Load More Button (Fitts's Law 44px min target) */}
                  {displayedFunds.length < filteredFunds.length && (
                    <div className="text-center py-4">
                      <button
                        type="button"
                        onClick={loadMoreFunds}
                        className="min-h-[44px] px-8 py-2.5 rounded-xl border border-surface-container bg-surface-container-low text-xs font-bold text-on-surface hover:text-primary hover:border-primary/40 shadow-xs touch-spring"
                      >
                        Load More Schemes ({filteredFunds.length - displayedFunds.length} remaining)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Table View */
                <div className="view-transition-enter">
                  <FundTable funds={filteredFunds} />
                </div>
              )}
            </>
          ) : (
            /* Dedicated SimSim™ Exclusive Simulation Workspace Canvas */
            <SimSimPage />
          )}
        </main>
      </div>

      {/* Floating Elements */}
      <ComparisonBar />
      <SimSimFloatingTray />
      <BackToTop />

      {/* Modals & Slide-over Drawers */}
      <KpiModal />
      <ComparisonMatrixModal />
      <FundDetailDrawer />
      <SimSimBasketModal />
    </div>
  );
};

export default function Home() {
  return (
    <ToastProvider>
      <ScreenerProvider>
        <ScreenerDashboard />
      </ScreenerProvider>
    </ToastProvider>
  );
}
