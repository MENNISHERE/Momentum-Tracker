import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { HabitCategory } from '../types';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, category?: HabitCategory) => void;
  title: string;
  placeholder: string;
  showCategory?: boolean;
}

export const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onAdd, title, placeholder, showCategory }) => {
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Productivity');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value.trim(), showCategory ? category : undefined);
      setValue('');
      onClose();
    }
  };

  const categories: HabitCategory[] = ['Health', 'Learning', 'Productivity', 'Mindset', 'Custom'];

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
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-md bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
                <div className="h-1 w-12 bg-indigo-500 mt-2 rounded-full" />
              </div>
              <motion.button 
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="p-3 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/10"
              >
                <Icons.X className="w-6 h-6 text-slate-500 hover:text-white" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Label / Name</label>
                <div className="relative group">
                  <input
                    autoFocus
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {showCategory && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Classification</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat}
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                          category === cat 
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                            : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-white/10'
                        }`}
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-5 rounded-2xl bg-slate-900/50 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white font-black uppercase tracking-widest text-[11px] transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(79, 70, 229, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all"
                >
                  Initialize
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
