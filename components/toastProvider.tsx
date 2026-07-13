"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';



type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  isVisible: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, isVisible: false }]);

    // Trigger entrance animation after a brief delay
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, isVisible: true } : toast
        )
      );
    }, 50);

    // Start exit animation
    setTimeout(() => {
      setRemoving((prev) => new Set(prev).add(id));
      // Remove from DOM after exit animation completes
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        setRemoving((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 300);
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setRemoving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      setRemoving((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 min-w-80 p-4 rounded-lg border shadow-lg pointer-events-auto transform transition-all duration-500 ease-out ${
              removing.has(toast.id) 
                ? 'translate-x-full opacity-0 scale-95' 
                : toast.isVisible
                ? 'translate-x-0 opacity-100 scale-100'
                : 'translate-x-full opacity-0 scale-95'
            } ${getStyles(toast.type)}`}
            style={{
              transitionProperty: 'transform, opacity, scale'
            }}
          >
            {getIcon(toast.type)}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
