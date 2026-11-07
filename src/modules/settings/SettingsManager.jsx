import React from 'react';
import { Settings, Moon, Sun, Globe, ShieldCheck, Database, Layers } from 'lucide-react';
import { Card, Button, Badge } from '../../components/common/UIComponents';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { useAuth } from '../../auth/AuthContext';

export function SettingsManager() {
  const { theme, toggleTheme, language, setLanguage } = useThemeLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600" />
          System Preferences & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize UI theme, localizations, and examine cloud database storage details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Appearance Settings */}
        <Card title="Interface Theme & Appearance" subtitle="Switch color scheme">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Current Theme</p>
                <p className="text-[11px] text-slate-400 capitalize">{theme} Mode Active</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={theme === 'dark' ? Sun : Moon}
                onClick={toggleTheme}
              >
                Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </div>
        </Card>

        {/* Language Settings */}
        <Card title="Language & Regional Settings" subtitle="Multi-language localization">
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select ERP Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="en">English (English)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Local Storage Engine Details */}
        <Card title="Cloud Database Architecture" subtitle="Database-Free Technology Stack">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database Engine:</span>
              <Badge variant="purple">Supabase PostgreSQL (Supabase PostgreSQL)</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Local Persistence:</span>
              <Badge variant="success">Active (Permanent)</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Server Requirement:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">0 MB (Zero Server Needed)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Node Runtime:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">Node.js v24 Compatible</span>
            </div>
          </div>
        </Card>

        {/* User Session Profile */}
        <Card title="Current Session Profile" subtitle="Authenticated identity details">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">User Account:</span>
              <span className="font-bold text-slate-900 dark:text-white">{user?.name || user?.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Active Role:</span>
              <Badge variant="info">{user?.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Affiliated Campus:</span>
              <span className="font-bold">Main Campus (Jubilee Hills)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
