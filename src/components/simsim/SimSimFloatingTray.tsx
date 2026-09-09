'use client';

import React, { useState } from 'react';
import { useScreener } from '@/context/ScreenerContext';

export const SimSimFloatingTray: React.FC = () => {
  const {
    appMode,
    setAppMode,
    simsimBucket,
    clearBucket
  } = useScreener();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Hide when in SimSim page mode, or no funds, or dismissed
  if (appMode === 'simsim' || simsimBucket.length === 0 || isDismissed) {
    return null;
  }

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`simsim-tray ${isExpanded ? 'is-expanded' : ''}`}
      role="region"
      aria-label="SimSim Portfolio Bucket Tray"
    >
      {/* Peek Tab Handle */}
      <div
        onClick={() => setAppMode('simsim')}
        className="flex items-center gap-2.5 cursor-pointer touch-spring min-h-[44px]"
        title="Click to launch SimSim™ Time Machine"
      >
        <div className="relative w-8 h-8 rounded-xl bg-[#00F090]/20 border border-[#00F090]/40 flex items-center justify-center text-[#00F090] flex-shrink-0">
          <span className="material-symbols-outlined text-lg simsim-pulse-icon">hourglass_top</span>
          <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00F090] text-black font-black text-[11px] flex items-center justify-center shadow-md">
            {simsimBucket.length}
          </span>
        </div>
        <div className="min-w-[85px]">
          <p className="text-xs font-bold text-on-surface dark:text-white leading-tight">SimSim™ Bucket</p>
          <p className="text-[11px] text-[#00A86B] dark:text-[#00F090] font-bold">
            {simsimBucket.length} Fund{simsimBucket.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setAppMode('simsim')}
          className="px-3.5 py-2 min-h-[36px] rounded-xl bg-[#00F090] hover:bg-[#00d880] text-black text-xs font-black transition-all cursor-pointer touch-spring flex items-center gap-1 shadow-md"
        >
          <span>Launch SimSim™</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>

        <button
          type="button"
          onClick={clearBucket}
          className="p-2 min-h-[36px] min-w-[36px] rounded-xl bg-surface-container hover:bg-loss-bg dark:bg-white/10 dark:hover:bg-[#FF4D4D]/20 text-on-surface-variant hover:text-loss dark:text-[#94A3B8] dark:hover:text-[#FF4D4D] text-xs font-bold transition-all cursor-pointer touch-spring flex items-center justify-center"
          title="Clear bucket"
          aria-label="Clear bucket"
        >
          <span className="material-symbols-outlined text-sm">delete_sweep</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-2 min-h-[36px] min-w-[36px] rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-white/5 dark:hover:bg-white/10 text-on-surface-variant hover:text-on-surface dark:text-[#94A3B8] dark:hover:text-white text-xs font-bold transition-all cursor-pointer touch-spring flex items-center justify-center"
          title="Dismiss tray"
          aria-label="Dismiss tray"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};
