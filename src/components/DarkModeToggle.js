import React, { useEffect, useState } from 'react';
import './DarkModeToggle.css';

const DARK_CLASS = 'dark-mode-active';

const toggleBodyClass = (enabled) => {
  if (enabled) {
    document.body.classList.add(DARK_CLASS);
  } else {
    document.body.classList.remove(DARK_CLASS);
  }
};

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    toggleBodyClass(darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      aria-label="Toggle dark mode"
      style={{
        position: 'fixed',
        left: 32,
        bottom: 32,
        zIndex: 2000,
        padding: '24px 48px',
        borderRadius: 32,
        border: darkMode ? '3px solid #ff9800' : '3px solid #888',
        fontWeight: 800,
        fontSize: '1.5rem',
        cursor: 'pointer',
        background: darkMode ? '#ff9800' : '#f1f1f1',
        color: darkMode ? '#fff' : '#333',
        boxShadow: darkMode ? '0 8px 32px rgba(255, 152, 0, 0.25)' : '0 4px 16px rgba(0,0,0,0.10)',
        transition: 'background 0.3s, color 0.3s, border 0.3s',
        outline: darkMode ? '3px solid #ff9800' : 'none',
        textShadow: darkMode ? '0 2px 8px #b36b00' : 'none',
      }}
    >
      {darkMode ? '🌙 Dark Mode: ON' : '☀️ Dark Mode: OFF'}
    </button>
  );
};

export default DarkModeToggle; 