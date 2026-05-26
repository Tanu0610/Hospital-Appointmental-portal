/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast() {
  const { toast, clearToast } = useApp();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-sky-50 border-sky-200 text-sky-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />,
  };

  return (
    <div id="toast-wrapper" className="fixed top-6 right-6 z-50 animate-bounce max-w-sm w-full md:max-w-md bg-white rounded-xl shadow-xl border p-4 flex items-start gap-3 transition-all duration-300">
      <div className={`p-2 rounded-lg border flex-shrink-0 ${bgColors[toast.type]}`}>
        {icons[toast.type]}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium text-slate-800">{toast.message}</p>
      </div>
      <button 
        id="btn-close-toast"
        onClick={clearToast}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
