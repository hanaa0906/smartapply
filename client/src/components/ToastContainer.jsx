import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex items-start gap-3 transform transition-all duration-300 animate-slide-in"
        >
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-bold text-white truncate">{toast.title}</h5>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{toast.message}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
