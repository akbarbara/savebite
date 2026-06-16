'use client';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  const styles = {
    success: 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/80 dark:border-emerald-900',
    error: 'border-red-200 bg-red-50 dark:bg-red-950/80 dark:border-red-900',
    warning: 'border-amber-200 bg-amber-50 dark:bg-amber-950/80 dark:border-amber-900',
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-950/80 dark:border-blue-900',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in-right min-w-[300px]',
            styles[toast.type]
          )}>
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium text-text-primary">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="cursor-pointer">
              <X size={16} className="text-text-muted hover:text-text-primary" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
