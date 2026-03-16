import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Theme, LayoutPreset, FontFamily } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentLayout: LayoutPreset;
  onLayoutChange: (layout: LayoutPreset) => void;
  currentFont: FontFamily;
  onFontChange: (font: FontFamily) => void;
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  exportingFormat: 'csv' | 'json' | 'pdf' | null;
  onImport: (file: File) => void;
}

const THEMES: { name: Theme; color: string }[] = [
  { name: 'Dark', color: 'bg-slate-950' },
  { name: 'Midnight Blue', color: 'bg-blue-950' },
  { name: 'Purple Gradient', color: 'bg-indigo-950' },
  { name: 'Neon Dark', color: 'bg-black' },
  { name: 'Light Mode', color: 'bg-slate-50' },
  { name: 'Forest Green', color: 'bg-emerald-950' },
  { name: 'Darken Black', color: 'bg-black' },
  { name: 'Lighten White', color: 'bg-white' },
];

const LAYOUTS: { name: LayoutPreset; icon: keyof typeof Icons; desc: string }[] = [
  { name: 'Standard', icon: 'Layout', desc: 'Default balanced view' },
  { name: 'Focus', icon: 'Target', desc: 'Prioritize timer & tasks' },
  { name: 'Habit-Centric', icon: 'Activity', desc: 'Focus on consistency' },
  { name: 'Analytics', icon: 'BarChart3', desc: 'Data-driven dashboard' },
  { name: 'Minimalist', icon: 'Minus', desc: 'Essential trackers only' },
];

const FONTS: { name: FontFamily; class: string }[] = [
  { name: 'Inter', class: 'font-sans' },
  { name: 'Space Grotesk', class: 'font-space' },
  { name: 'Outfit', class: 'font-outfit' },
  { name: 'Playfair Display', class: 'font-serif' },
  { name: 'JetBrains Mono', class: 'font-mono' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentTheme, 
  onThemeChange,
  currentLayout,
  onLayoutChange,
  currentFont,
  onFontChange,
  onExport,
  exportingFormat,
  onImport
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between p-8 pb-4 border-b border-white/5">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Icons.Settings className="w-6 h-6 text-cyan-400" />
                Settings
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-sm transition-colors">
                <Icons.X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
              {/* Theme Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Icons.Palette className="w-3 h-3" />
                  Theme Selection
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => onThemeChange(theme.name)}
                      className={`p-3 rounded-xl border transition-all text-left space-y-2 ${
                        currentTheme === theme.name 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-sm ${theme.color} border border-white/10`} />
                      <span className={`text-xs font-bold ${currentTheme === theme.name ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Presets */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Icons.LayoutTemplate className="w-3 h-3" />
                  Layout Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LAYOUTS.map((layout) => {
                    const Icon = Icons[layout.icon] as React.ElementType;
                    return (
                      <button
                        key={layout.name}
                        onClick={() => onLayoutChange(layout.name)}
                        className={`p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                          currentLayout === layout.name 
                            ? 'border-purple-500 bg-purple-500/10' 
                            : 'border-white/5 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`p-2 rounded-sm ${currentLayout === layout.name ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${currentLayout === layout.name ? 'text-purple-400' : 'text-white'}`}>
                            {layout.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {layout.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Icons.Type className="w-3 h-3" />
                  Typography
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => onFontChange(font.name)}
                      className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                        currentFont === font.name 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${font.class} ${currentFont === font.name ? 'text-emerald-400' : 'text-white'}`}>
                          {font.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          The quick brown fox jumps...
                        </span>
                      </div>
                      {currentFont === font.name && <Icons.Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Icons.Database className="w-3 h-3" />
                  Data Management
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => onExport('csv')}
                    disabled={exportingFormat !== null}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-bold text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingFormat === 'csv' ? (
                      <Icons.Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    ) : (
                      <Icons.FileText className="w-4 h-4 text-emerald-400" />
                    )}
                    CSV
                  </button>
                  <button
                    onClick={() => onExport('json')}
                    disabled={exportingFormat !== null}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-bold text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingFormat === 'json' ? (
                      <Icons.Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    ) : (
                      <Icons.Code className="w-4 h-4 text-orange-400" />
                    )}
                    JSON
                  </button>
                  <button
                    onClick={() => onExport('pdf')}
                    disabled={exportingFormat !== null}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-bold text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingFormat === 'pdf' ? (
                      <Icons.Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                    ) : (
                      <Icons.File className="w-4 h-4 text-rose-400" />
                    )}
                    PDF
                  </button>
                </div>

                <div className="pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json,.csv"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all text-sm font-bold text-cyan-400"
                  >
                    <Icons.Upload className="w-4 h-4" />
                    Import Data (JSON/CSV)
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-slate-500 text-center font-medium">
                  Momentum v2.0.0 • All data is stored locally on your device.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
