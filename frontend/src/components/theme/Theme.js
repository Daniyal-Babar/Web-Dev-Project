// Theme.js
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './Theme.css';

export default function Theme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`icon-button theme-toggle-${theme}`}
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'dark' ? (
        <Moon size={22} />
      ) : (
        <Sun size={22} />
      )}
    </button>
  );
}