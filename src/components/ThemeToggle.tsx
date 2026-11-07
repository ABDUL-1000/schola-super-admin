import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'pill' | 'expanded';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'icon',
}) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800 backdrop-blur-md transition-colors ${className}`}
        role="group"
        aria-label="Theme switcher"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !isDark
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Switch to Light Mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isDark
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Switch to Dark Mode"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
          isDark
            ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-300/80 text-slate-700 hover:text-slate-900 shadow-sm'
        } ${className}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        aria-label="Toggle theme"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-600'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <p className="font-semibold">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              Click to switch
            </p>
          </div>
        </div>
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
            isDark ? 'bg-indigo-600' : 'bg-amber-500'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
      </button>
    );
  }

  // Default: Compact Icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl transition-all duration-200 group border ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-amber-400'
          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`w-4 h-4 transition-all duration-300 absolute inset-0 ${
            isDark
              ? 'opacity-0 rotate-90 scale-50'
              : 'opacity-100 rotate-0 scale-100 text-amber-500'
          }`}
        />
        <Moon
          className={`w-4 h-4 transition-all duration-300 absolute inset-0 ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-indigo-400'
              : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </div>
    </button>
  );
};
export default ThemeToggle;
