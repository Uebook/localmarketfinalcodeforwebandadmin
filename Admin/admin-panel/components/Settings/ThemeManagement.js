'use client';

import { useState, useEffect } from 'react';
import { FESTIVAL_THEMES, getThemeCSS } from '@/constants/festivalThemes';

export default function ThemeManagement() {
  const [selectedTheme, setSelectedTheme] = useState('diwali');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedFestivalTheme');
    if (savedTheme && FESTIVAL_THEMES[savedTheme]) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme(selectedTheme);
    }
  }, []);

  const applyTheme = (themeId) => {
    const theme = FESTIVAL_THEMES[themeId];
    if (!theme) return;

    // Apply theme CSS
    const styleId = 'festival-theme-style';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = getThemeCSS(themeId);

    // Apply theme colors to root
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-header-gradient', `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`);
  };

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    if (!previewMode) {
      applyTheme(themeId);
      localStorage.setItem('selectedFestivalTheme', themeId);
    }
  };

  const handleSave = () => {
    applyTheme(selectedTheme);
    localStorage.setItem('selectedFestivalTheme', selectedTheme);
    setPreviewMode(false);
    alert('Theme saved successfully!');
  };

  const handlePreview = () => {
    if (previewMode) {
      // Restore saved theme
      const savedTheme = localStorage.getItem('selectedFestivalTheme') || 'diwali';
      applyTheme(savedTheme);
      setSelectedTheme(savedTheme);
    } else {
      // Apply preview theme
      applyTheme(selectedTheme);
    }
    setPreviewMode(!previewMode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Festival Theme Management</h2>
        <p className="text-gray-600">Select and apply festival themes to customize the admin panel appearance</p>
      </div>

      {/* Theme Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(FESTIVAL_THEMES).map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all ${
              selectedTheme === theme.id
                ? 'border-orange-500 ring-4 ring-orange-200'
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{theme.icon}</span>
              {selectedTheme === theme.id && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                  Selected
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{theme.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
            
            {/* Color Preview */}
            <div className="flex gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full border border-gray-300"
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary"
              />
              <div
                className="w-8 h-8 rounded-full border border-gray-300"
                style={{ backgroundColor: theme.colors.secondary }}
                title="Secondary"
              />
              <div
                className="w-8 h-8 rounded-full border border-gray-300"
                style={{ backgroundColor: theme.colors.accent }}
                title="Accent"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleThemeChange(theme.id);
              }}
              className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                selectedTheme === theme.id
                  ? 'gradient-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectedTheme === theme.id ? 'Selected' : 'Select Theme'}
            </button>
          </div>
        ))}
      </div>

      {/* Theme Preview */}
      {selectedTheme && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Theme Preview</h3>
          <div
            className="p-6 rounded-lg mb-4"
            style={{ backgroundColor: FESTIVAL_THEMES[selectedTheme].colors.background }}
          >
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: FESTIVAL_THEMES[selectedTheme].colors.primary }}
              >
                <h4 className="font-bold">Primary Color</h4>
                <p className="text-sm opacity-90">This is how primary buttons and elements will look</p>
              </div>
              <div
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: FESTIVAL_THEMES[selectedTheme].colors.secondary }}
              >
                <h4 className="font-bold">Secondary Color</h4>
                <p className="text-sm opacity-90">This is how secondary elements will look</p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: FESTIVAL_THEMES[selectedTheme].colors.accent,
                  color: '#1A1A1A'
                }}
              >
                <h4 className="font-bold">Accent Color</h4>
                <p className="text-sm">This is how accent elements will look</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {previewMode ? 'Exit Preview' : 'Preview Theme'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
}
