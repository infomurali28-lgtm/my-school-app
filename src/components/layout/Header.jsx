import React, { useState } from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Globe,
  Bell,
  Building,
  Calendar,
  User,
  LogOut,
  ChevronDown,
  Palette,
  Check
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useThemeLanguage, THEME_PALETTES } from '../../context/ThemeLanguageContext';

export function Header({ onOpenMobileSidebar, onOpenSearch, onNavigate }) {
  const { user, logout } = useAuth();
  const {
    theme,
    toggleTheme,
    colorPalette,
    setColorPalette,
    language,
    setLanguage,
    branches,
    academicYears,
    activeBranch,
    setActiveBranch,
    activeAcademicYear,
    setActiveAcademicYear,
    t
  } = useThemeLanguage();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Term 1 Mid-Term Assessment', desc: 'Schedules announced for Grade 1-12.', time: '10m ago' },
    { id: 2, title: 'Fee Collection Update', desc: '₹1,25,000 received today via UPI.', time: '1h ago' },
    { id: 3, title: 'Parent-Teacher Meeting', desc: 'Saturday, Sep 6th at 9:30 AM.', time: '2h ago' }
  ];

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 flex items-center justify-between gap-3 transition-colors">
      {/* Left: Mobile menu toggle + Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs w-44 sm:w-64 md:w-80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <Search className="w-4 h-4 text-indigo-500" />
          <span className="truncate">{t('common.search')}</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 font-bold">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Campus / Branch Selector (Dynamic from DB) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
          <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <select
            value={activeBranch}
            onChange={e => setActiveBranch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs cursor-pointer font-bold"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id} className="dark:bg-slate-900">{b.name}</option>
            ))}
          </select>
        </div>

        {/* Academic Year Selector (Dynamic from DB) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <select
            value={activeAcademicYear}
            onChange={e => setActiveAcademicYear(e.target.value)}
            className="bg-transparent border-none outline-none text-xs cursor-pointer font-bold"
          >
            {academicYears.map(ay => (
              <option key={ay.id} value={ay.id} className="dark:bg-slate-900">
                {ay.name} {ay.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200/60 dark:border-slate-700 outline-none"
          >
            <option value="en">English (EN)</option>
            <option value="te">తెలుగు (TE)</option>
            <option value="hi">हिंदी (HI)</option>
          </select>
        </div>

        {/* Palette Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPaletteMenu(!showPaletteMenu)}
            title="Choose ERP Color Theme"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Palette className="w-4 h-4 text-indigo-500" />
          </button>

          {showPaletteMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
              <p className="text-[11px] font-extrabold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Theme Color Palette
              </p>
              <div className="space-y-1 mt-1">
                {THEME_PALETTES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setColorPalette(p.id);
                      setShowPaletteMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${p.preview}`} />
                      <span>{p.name}</span>
                    </div>
                    {colorPalette === p.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Dark / Light Mode"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4 text-indigo-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Campus Notifications
                </h4>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-1 max-h-60 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-1 rounded-lg">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || user?.username}</p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{user?.role}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-bold"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
