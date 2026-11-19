import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast notification component.
 * Usage: <Toast message="Done!" type="success" onClose={() => setToast(null)} />
 * types: "success" | "error" | "info"
 */
export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: {
      wrapper: 'bg-emerald-950 border-emerald-500/40 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    },
    error: {
      wrapper: 'bg-rose-950 border-rose-500/40 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    },
    info: {
      wrapper: 'bg-indigo-950 border-indigo-500/40 text-indigo-200',
      icon: <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />,
    },
  };

  const { wrapper, icon } = styles[type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slideInRight">
      <div className={`flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-xl border shadow-2xl ${wrapper}`}>
        {icon}
        <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
        <button onClick={onClose} className="mt-0.5 opacity-60 hover:opacity-100 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
