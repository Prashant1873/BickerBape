'use client';

import React, { useState, useEffect } from 'react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-30 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container-lowest dark:bg-surface-container-low border border-surface-container shadow-xl text-primary hover:bg-surface-container flex items-center justify-center transition-all touch-spring animate-in fade-in duration-200"
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <span className="material-symbols-outlined text-xl">arrow_upward</span>
    </button>
  );
};
