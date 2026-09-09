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

const ScreenerDashboard: React.FC = () => {
  const {
    appMode,
    filteredFunds,
    loading,
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

              {/* Loading State Skeleton */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-56 rounded-2xl bg-surface-container-low border border-surface-container animate-pulse p-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="h-6 w-24 bg-surface-container rounded-lg" />
                        <div className="h-4 w-3/4 bg-surface-container rounded" />
                        <div className="h-3 w-1/2 bg-surface-container rounded" />
                      </div>
                      <div className="h-14 bg-surface-container rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : viewMode === 'cards' ? (
                /* Cards View (Responsive 1-col on mobile, 2-col tablet, 3-col desktop) */
                <div className="space-y-6">
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
                <FundTable funds={filteredFunds} />
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
