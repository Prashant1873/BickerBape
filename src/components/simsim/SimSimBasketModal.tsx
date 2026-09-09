'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScreener } from '@/context/ScreenerContext';
import { MODEL_BASKETS } from '@/lib/simsim-models';
import { useToast } from '@/context/ToastContext';

export const SimSimBasketModal: React.FC = () => {
  const {
    funds,
    isBasketModalOpen,
    setIsBasketModalOpen,
    activeBasketPreset,
    setActiveBasketPreset,
    setAppMode
  } = useScreener();

  const { showToast } = useToast();
  const basketDef = MODEL_BASKETS[activeBasketPreset] || MODEL_BASKETS.titan;

  const [selectedCodes, setSelectedCodes] = useState<Record<number, string | number>>({});

  // Match top schemes for each slot based on category and SmartScore
  const slotOptions = useMemo(() => {
    return basketDef.slots.map(slot => {
      const matches = funds
        .filter(f => f.category.toLowerCase().includes(slot.category.toLowerCase()))
        .sort((a, b) => (b.smart_score?.overall || 0) - (a.smart_score?.overall || 0));
      return {
        slot,
        matches: matches.slice(0, 8)
      };
    });
  }, [basketDef, funds]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scrolling when basket modal is open
  useEffect(() => {
    if (!isBasketModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isBasketModalOpen]);

  if (!isBasketModalOpen || !mounted || typeof document === 'undefined') return null;

  const handleApplyBasket = () => {
    const chosenCodes: (string | number)[] = [];
    slotOptions.forEach((so, idx) => {
      const code = selectedCodes[idx] || (so.matches[0] ? so.matches[0].code : null);
      if (code && !chosenCodes.includes(code)) {
        chosenCodes.push(code);
      }
    });

    if (chosenCodes.length > 0) {
      const weightsMap: Record<string | number, number> = {};
      chosenCodes.forEach((c, idx) => {
        weightsMap[c] = basketDef.slots[idx]?.suggestedWeight ?? Math.round(100 / chosenCodes.length);
      });

      try {
        localStorage.setItem('bickerbape_simsim_bucket', JSON.stringify(chosenCodes));
        localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(weightsMap));
      } catch (e) {}

      showToast(`Applied custom ${basketDef.name} portfolio!`, 'success');
      setIsBasketModalOpen(false);
      setAppMode('simsim');
      // Reload page state
      window.location.reload();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest dark:bg-[#0B0F19] text-on-surface dark:text-white border border-surface-container dark:border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container dark:border-white/10 bg-surface-container-low dark:bg-[#0F1626] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00F090]/15 border border-[#00F090]/30 flex items-center justify-center text-[#00A86B] dark:text-[#00F090]">
              <span className="material-symbols-outlined text-xl">{basketDef.icon}</span>
            </div>
            <div>
              <h3 className="font-headline-md font-bold text-base text-on-surface dark:text-white">
                Customize Basket: {basketDef.name}
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-[#94A3B8]">
                Select which top-rated scheme represents each institutional category slot
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBasketModalOpen(false)}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high dark:bg-white/5 dark:hover:bg-white/10 text-on-surface dark:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body: Slots */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 hide-scrollbar">
          {/* Preset Selector Buttons */}
          <div className="flex items-center gap-2 pb-2">
            {(['titan', 'aggressive', 'defensive'] as const).map(k => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setActiveBasketPreset(k);
                  setSelectedCodes({});
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeBasketPreset === k
                    ? 'bg-primary text-white dark:bg-[#00F090] dark:text-black shadow-sm font-extrabold'
                    : 'bg-surface-container text-on-surface-variant dark:bg-white/5 dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white border border-surface-container-high dark:border-white/10'
                }`}
              >
                {MODEL_BASKETS[k].name}
              </button>
            ))}
          </div>

          {/* Slots List */}
          {slotOptions.map((so, slotIdx) => {
            const currentCode = selectedCodes[slotIdx] || (so.matches[0]?.code);
            return (
              <div
                key={slotIdx}
                className="p-4 rounded-2xl bg-surface-container-low dark:bg-[#12192B] border border-surface-container dark:border-white/10 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#00A86B] dark:text-[#00F090] uppercase tracking-wider">
                      Slot {slotIdx + 1}: {so.slot.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#00F090]/15 text-[#00A86B] dark:text-[#00F090] border border-[#00F090]/30">
                    Weight: {so.slot.suggestedWeight}%
                  </span>
                </div>

                {/* Scheme Select Dropdown */}
                <select
                  value={currentCode || ''}
                  onChange={(e) => setSelectedCodes(prev => ({ ...prev, [slotIdx]: Number(e.target.value) || e.target.value }))}
                  className="w-full bg-surface-container-lowest dark:bg-[#090D16] border border-surface-container dark:border-white/15 rounded-xl py-2.5 px-3 text-xs text-on-surface dark:text-white font-medium outline-none focus:border-primary dark:focus:border-[#00F090] cursor-pointer"
                >
                  {so.matches.map(f => (
                    <option key={String(f.code)} value={f.code} className="bg-surface dark:bg-[#090D16] text-on-surface dark:text-white">
                      {f.name.split(' - Direct')[0]} (SmartScore: {(f.smart_score?.overall || 6.5).toFixed(1)}/10, 3Y: {f.cagr_3y ? `${f.cagr_3y.toFixed(1)}%` : 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-surface-container dark:border-white/10 bg-surface-container-low dark:bg-[#0F1626] flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsBasketModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-on-surface-variant dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyBasket}
            className="px-6 py-2 rounded-xl bg-[#00F090] hover:bg-[#00d880] text-black text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5 touch-spring cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            <span>Apply & Launch SimSim™</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
