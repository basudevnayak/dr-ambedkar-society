'use client';

import { useTheme } from '@/app/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                 transition-all duration-300 flex items-center justify-center group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sun icon for light mode */}
      <i className={`fas fa-sun text-amber-500 absolute transition-all duration-300 ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}></i>
      
      {/* Moon icon for dark mode */}
      <i className={`fas fa-moon text-blue-400 absolute transition-all duration-300 ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}></i>
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-900 text-white text-xs 
                       py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </span>
    </button>
  );
}