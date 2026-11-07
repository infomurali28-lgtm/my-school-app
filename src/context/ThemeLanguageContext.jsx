import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import te from '../locales/te.json';
import hi from '../locales/hi.json';
import db from '../database/db';

const translations = { en, te, hi };

export const THEME_PALETTES = [
  { id: 'indigo', name: 'Classic Indigo', primary: '#4f46e5', class: 'theme-indigo', preview: 'bg-indigo-600' },
  { id: 'emerald', name: 'Emerald Forest', primary: '#059669', class: 'theme-emerald', preview: 'bg-emerald-600' },
  { id: 'purple', name: 'Royal Purple', primary: '#7c3aed', class: 'theme-purple', preview: 'bg-purple-600' },
  { id: 'amber', name: 'Sunset Amber', primary: '#d97706', class: 'theme-amber', preview: 'bg-amber-600' },
  { id: 'blue', name: 'Ocean Blue', primary: '#0284c7', class: 'theme-blue', preview: 'bg-sky-600' },
  { id: 'midnight', name: 'Midnight Dark', primary: '#6366f1', class: 'theme-midnight', preview: 'bg-slate-900' }
];

const ThemeLanguageContext = createContext(null);

export function ThemeLanguageProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('the_school_theme') || 'light';
  });

  const [colorPalette, setColorPalette] = useState(() => {
    return localStorage.getItem('the_school_palette') || 'indigo';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('the_school_lang') || 'en';
  });

  const [branches, setBranches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [activeBranch, setActiveBranch] = useState('BR-00001');
  const [activeAcademicYear, setActiveAcademicYear] = useState('AY-2025-2026');

  // Load branches & academic years from Supabase PostgreSQL
  const refreshBranchesAndYears = async () => {
    try {
      const [brList, ayList] = await Promise.all([
        db.branches.toArray(),
        db.academicYears.toArray()
      ]);
      setBranches(brList);
      setAcademicYears(ayList);
      if (brList.length > 0 && !brList.some(b => b.id === activeBranch)) {
        setActiveBranch(brList[0].id);
      }
      const currentYear = ayList.find(y => y.isCurrent === 1) || ayList[0];
      if (currentYear && !ayList.some(y => y.id === activeAcademicYear)) {
        setActiveAcademicYear(currentYear.id);
      }
    } catch (e) {
      console.error('Error loading branches:', e);
    }
  };

  useEffect(() => {
    refreshBranchesAndYears();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('the_school_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    THEME_PALETTES.forEach(p => root.classList.remove(p.class));
    root.classList.add(`theme-${colorPalette}`);
    localStorage.setItem('the_school_palette', colorPalette);
  }, [colorPalette]);

  useEffect(() => {
    localStorage.setItem('the_school_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (path, params = {}) => {
    try {
      const keys = path.split('.');
      let curr = translations[language] || translations.en;
      for (const k of keys) {
        if (!curr || curr[k] === undefined) {
          let fb = translations.en;
          for (const fbk of keys) {
            if (!fb || fb[fbk] === undefined) return path;
            fb = fb[fbk];
          }
          curr = fb;
          break;
        }
        curr = curr[k];
      }

      if (typeof curr === 'string') {
        let str = curr;
        Object.keys(params).forEach(param => {
          str = str.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });
        return str;
      }
      return curr || path;
    } catch {
      return path;
    }
  };

  return (
    <ThemeLanguageContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      colorPalette,
      setColorPalette,
      language,
      setLanguage,
      t,
      branches,
      academicYears,
      activeBranch,
      setActiveBranch,
      activeAcademicYear,
      setActiveAcademicYear,
      refreshBranchesAndYears
    }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within ThemeLanguageProvider');
  }
  return context;
}
