'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3200);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notifications Container */}
      <aside
        className="fixed bottom-6 right-6 z-[150] flex flex-col gap-2.5 pointer-events-none max-w-[92vw] sm:max-w-sm"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(t => {
          const iconMap: Record<ToastType, string> = {
            info: 'info',
            success: 'check_circle',
            warning: 'warning',
            error: 'error'
          };
          return (
            <div
              key={t.id}
              onClick={() => removeToast(t.id)}
              className={`toast-notification toast-${t.type} cursor-pointer group`}
              role="status"
            >
              <span className="material-symbols-outlined text-lg flex-shrink-0">
                {iconMap[t.type]}
              </span>
              <span className="flex-1 leading-snug">{t.message}</span>
              <span className="material-symbols-outlined text-xs opacity-60 group-hover:opacity-100 flex-shrink-0">
                close
              </span>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
