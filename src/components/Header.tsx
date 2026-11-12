import React from 'react';
import { useApp } from '../context/AppContext';
import { BMobilLogo } from './BMobilLogo';
import { Sun, Moon, Globe } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface HeaderProps {
  onNavigateTab?: (tab: 'schedule' | 'alerts' | 'family') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateTab }) => {
  const { currentUser, theme, toggleTheme, language, toggleLanguage, isCloudConnected, t } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 pt-safe pb-3 transition-colors duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: App Logo & Clean B-Mobil Brand with Cloud Live Badge - Tapping returns Home */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigateTab?.('schedule');
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer active-press"
          title="B-Mobil Home"
        >
          <BMobilLogo size={36} />
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] transition-colors">
              B-Mobil
            </h1>
            {isCloudConnected && (
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shadow-2xs select-none"
                title="Cloud Live: Echtzeit-Synchronisation aktiv"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
        </button>

        {/* Right Actions: Language Toggle, Theme Toggle & Authenticated User Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher Button (DE / EN) */}
          <button
            onClick={() => {
              triggerHaptic('light');
              toggleLanguage();
            }}
            className="px-2 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition-colors active-press flex items-center gap-1 cursor-pointer"
            aria-label="Switch language between German and English"
            title={language === 'de' ? 'Sprache auf Englisch umschalten' : 'Switch language to German'}
          >
            <Globe className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              toggleTheme();
            }}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-colors active-press cursor-pointer"
            aria-label="Toggle light or dark theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Authenticated User Profile Pill (Tapping navigates to Family & Account settings) */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigateTab?.('family');
            }}
            className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 rounded-full pl-1.5 pr-2.5 py-1 select-none shadow-2xs transition-all active-press cursor-pointer"
            title={`${currentUser.name} – ${t.tabFamily}`}
          >
            <span
              className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-2xs shrink-0"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name.charAt(0)}
            </span>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[70px] truncate">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
