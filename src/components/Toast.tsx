import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const bgMap = {
    success: 'bg-emerald-600 text-white shadow-emerald-200',
    error: 'bg-rose-600 text-white shadow-rose-200',
    warning: 'bg-amber-600 text-white shadow-amber-200',
    info: 'bg-blue-600 text-white shadow-blue-200',
  };

  const IconMap = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = IconMap[toast.type];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm transition-all duration-300 animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl ${bgMap[toast.type]}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <div className="flex-1 text-sm font-medium pr-1 leading-tight">
          {toast.title && <div className="font-bold mb-0.5 text-xs opacity-90">{toast.title}</div>}
          <div>{toast.message}</div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
