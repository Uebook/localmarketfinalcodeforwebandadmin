'use client';

import { useState, useEffect } from 'react';
import { FESTIVAL_THEMES } from '@/constants/festivalThemes';
import { getAllThemes, getThemeCSS, saveCustomTheme, deleteCustomTheme, isCustomTheme } from '@/lib/themeUtils';
// Icons will be replaced with emojis/text

export default function ThemeManagement() {
  const [selectedTheme, setSelectedTheme] = useState('diwali');
  const [previewMode, setPreviewMode] = useState(false);
  const [showAddThemeModal, setShowAddThemeModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [allThemes, setAllThemes] = useState(getAllThemes());
  
  // Form state for new/edit theme
  const [themeForm, setThemeForm] = useState({
    name: '',
    description: '',
    icon: '🎨',
    colors: {
      primary: '#E86A2C',
      secondary: '#4A6CF7',
      accent: '#FFD700',
      background: '#FFFFFF',
      text: '#1A1A1A'
    }
  });

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedFestivalTheme');
    const themes = getAllThemes();
    setAllThemes(themes);
    
    if (savedTheme && themes[savedTheme]) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme(selectedTheme);
    }
  }, []);

  // Reload themes when custom themes change
  useEffect(() => {
    setAllThemes(getAllThemes());
  }, [showAddThemeModal]);

  const applyTheme = (themeId) => {
    const themes = getAllThemes();
    const theme = themes[themeId];
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

  const handleAddTheme = () => {
    setEditingTheme(null);
    setThemeForm({
      name: '',
      description: '',
      icon: '🎨',
      colors: {
        primary: '#E86A2C',
        secondary: '#4A6CF7',
        accent: '#FFD700',
        background: '#FFFFFF',
        text: '#1A1A1A'
      }
    });
    setShowAddThemeModal(true);
  };

  const handleEditTheme = (theme) => {
    setEditingTheme(theme);
    setThemeForm({
      name: theme.name,
      description: theme.description || '',
      icon: theme.icon || '🎨',
      colors: { ...theme.colors }
    });
    setShowAddThemeModal(true);
  };

  const handleDeleteTheme = (themeId) => {
    if (!isCustomTheme(themeId)) {
      alert('Cannot delete default themes');
      return;
    }
    
    if (confirm('Are you sure you want to delete this custom theme?')) {
      deleteCustomTheme(themeId);
      setAllThemes(getAllThemes());
      
      // If deleted theme was selected, switch to default
      if (selectedTheme === themeId) {
        setSelectedTheme('diwali');
        applyTheme('diwali');
        localStorage.setItem('selectedFestivalTheme', 'diwali');
      }
    }
  };

  const handleSaveTheme = () => {
    if (!themeForm.name.trim()) {
      alert('Please enter a theme name');
      return;
    }

    const themeId = editingTheme 
      ? editingTheme.id 
      : `custom_${Date.now()}_${themeForm.name.toLowerCase().replace(/\s+/g, '_')}`;

    const newTheme = {
      id: themeId,
      name: themeForm.name,
      description: themeForm.description,
      icon: themeForm.icon,
      colors: {
        primary: themeForm.colors.primary,
        secondary: themeForm.colors.secondary,
        accent: themeForm.colors.accent,
        background: themeForm.colors.background,
        text: themeForm.colors.text
      }
    };

    if (saveCustomTheme(newTheme)) {
      setAllThemes(getAllThemes());
      setShowAddThemeModal(false);
      setEditingTheme(null);
      alert(editingTheme ? 'Theme updated successfully!' : 'Theme created successfully!');
    } else {
      alert('Error saving theme');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Theme Management</h2>
            <p className="text-gray-600">Select, create, or customize themes to personalize the admin panel appearance</p>
          </div>
          <button
            onClick={handleAddTheme}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:opacity-90 transition shadow-md"
          >
            <span className="text-xl">➕</span>
            <span>Add Custom Theme</span>
          </button>
        </div>
      </div>

      {/* Default Themes Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Default Festival Themes</h3>
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
      </div>

      {/* Custom Themes Section */}
      {Object.values(allThemes).filter(theme => isCustomTheme(theme.id)).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Themes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(allThemes)
              .filter(theme => isCustomTheme(theme.id))
              .map((theme) => (
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
                    <div className="flex items-center gap-2">
                      {selectedTheme === theme.id && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          Selected
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTheme(theme);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Theme"
                      >
                        <span>✏️</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTheme(theme.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Theme"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{theme.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{theme.description || 'Custom theme'}</p>
                  
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
        </div>
      )}

      {/* Theme Preview */}
      {selectedTheme && allThemes[selectedTheme] && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Theme Preview</h3>
          <div
            className="p-6 rounded-lg mb-4"
            style={{ backgroundColor: allThemes[selectedTheme].colors.background }}
          >
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: allThemes[selectedTheme].colors.primary }}
              >
                <h4 className="font-bold">Primary Color</h4>
                <p className="text-sm opacity-90">This is how primary buttons and elements will look</p>
              </div>
              <div
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: allThemes[selectedTheme].colors.secondary }}
              >
                <h4 className="font-bold">Secondary Color</h4>
                <p className="text-sm opacity-90">This is how secondary elements will look</p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: allThemes[selectedTheme].colors.accent,
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

      {/* Add/Edit Theme Modal */}
      {showAddThemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTheme ? 'Edit Custom Theme' : 'Create Custom Theme'}
              </h2>
              <button
                onClick={() => {
                  setShowAddThemeModal(false);
                  setEditingTheme(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Theme Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Theme Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={themeForm.name}
                  onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                  placeholder="Enter theme name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Theme Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={themeForm.description}
                  onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
                  placeholder="Enter theme description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Theme Icon */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={themeForm.icon}
                  onChange={(e) => setThemeForm({ ...themeForm, icon: e.target.value })}
                  placeholder="🎨"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-2xl text-center"
                />
              </div>

              {/* Color Picker Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Theme Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Primary Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={themeForm.colors.primary}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, primary: e.target.value }
                        })}
                        className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeForm.colors.primary}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, primary: e.target.value }
                        })}
                        placeholder="#E86A2C"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Secondary Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={themeForm.colors.secondary}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, secondary: e.target.value }
                        })}
                        className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeForm.colors.secondary}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, secondary: e.target.value }
                        })}
                        placeholder="#4A6CF7"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Accent Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={themeForm.colors.accent}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, accent: e.target.value }
                        })}
                        className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeForm.colors.accent}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, accent: e.target.value }
                        })}
                        placeholder="#FFD700"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Background Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={themeForm.colors.background}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, background: e.target.value }
                        })}
                        className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeForm.colors.background}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, background: e.target.value }
                        })}
                        placeholder="#FFFFFF"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Text Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={themeForm.colors.text}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, text: e.target.value }
                        })}
                        className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeForm.colors.text}
                        onChange={(e) => setThemeForm({
                          ...themeForm,
                          colors: { ...themeForm.colors, text: e.target.value }
                        })}
                        placeholder="#1A1A1A"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
                <div
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: themeForm.colors.background }}
                >
                  <div className="space-y-3">
                    <div
                      className="p-3 rounded-lg text-white"
                      style={{ backgroundColor: themeForm.colors.primary }}
                    >
                      <span className="text-2xl mr-2">{themeForm.icon}</span>
                      <span className="font-bold">{themeForm.name || 'Theme Name'}</span>
                    </div>
                    <div
                      className="p-3 rounded-lg text-white"
                      style={{ backgroundColor: themeForm.colors.secondary }}
                    >
                      Secondary Color Preview
                    </div>
                    <div
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: themeForm.colors.accent,
                        color: themeForm.colors.text
                      }}
                    >
                      Accent Color Preview
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddThemeModal(false);
                    setEditingTheme(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTheme}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <span>💾</span>
                  <span>{editingTheme ? 'Update Theme' : 'Create Theme'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
