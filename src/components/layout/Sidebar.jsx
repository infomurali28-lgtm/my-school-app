import React from 'react';
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { normalizeRole, ROLE_THEMES } from '../../auth/roles';
import { getRoleNav } from './roleNavConfig';

export function Sidebar({ currentModule, onSelectModule, isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const role = normalizeRole(user?.role);
  const theme = ROLE_THEMES[role] || ROLE_THEMES['School Admin'];
  const navItems = getRoleNav(role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
            onClick={() => onSelectModule('dashboard')}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.color} flex items-center justify-center text-white shadow-md shrink-0`}>
              <GraduationCap className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight">
                  The School
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
                  {theme.label} Portal
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Card */}
        {!isCollapsed && user && (
          <div className="p-3 mx-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${theme.color} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0`}>
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.name || user.username}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                  {theme.label}
                </span>
                <span className="text-[9px] text-slate-400 truncate">
                  {user.schoolId || 'SCH-00001'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items (Role Specific) */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Logout Bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
