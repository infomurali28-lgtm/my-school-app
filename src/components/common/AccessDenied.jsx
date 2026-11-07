import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';

export function AccessDenied({ moduleName, role, onBackToDashboard }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-200 dark:border-rose-900/60 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-800">
            Access Control Restriction
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-3">
            Unauthorized Access
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Your current assigned role (<strong>{role}</strong>) does not have authorization to access the <strong>{moduleName}</strong> module.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 text-left flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>Role-Based Access Control (RBAC) enforces strict separation of school administrative, financial, faculty, and student portals.</span>
        </div>

        <button
          onClick={onBackToDashboard}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to My Role Dashboard
        </button>
      </div>
    </div>
  );
}
export default AccessDenied;
