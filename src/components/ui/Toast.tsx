import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning';

interface Toast {
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

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[4px_4px_0px_#252b3a] text-sm text-[#253044] min-w-[280px] max-w-md"
            >
              <div className="shrink-0 w-7 h-7 rounded-full border-2 border-[#252b3a] flex items-center justify-center font-bold">
                {toast.type === 'success' && (
                  <span className="w-full h-full rounded-full bg-[#9bf1cd] flex items-center justify-center text-[#253044]">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
                {toast.type === 'info' && (
                  <span className="w-full h-full rounded-full bg-[#6434df] flex items-center justify-center text-white">
                    <Info className="w-4 h-4" />
                  </span>
                )}
                {toast.type === 'warning' && (
                  <span className="w-full h-full rounded-full bg-[#ffd05b] flex items-center justify-center text-[#253044]">
                    <AlertCircle className="w-4 h-4" />
                  </span>
                )}
              </div>
              <span className="flex-1 font-semibold text-xs leading-snug">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#253044]/60 hover:text-[#253044] hover:bg-[#fffdf5] rounded-lg p-1 border border-transparent hover:border-[#252b3a] transition-all"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
