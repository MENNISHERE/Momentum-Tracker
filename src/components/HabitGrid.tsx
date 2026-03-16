import React, { useState, useMemo } from 'react';
import { Habit, HabitStatus } from '../types';
import { DAYS } from '../constants';
import * as Icons from 'lucide-react';
import { cn, formatDateKey } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface HabitGridProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  weekDates: string[];
}

type ViewMode = 'Weekly' | 'Monthly' | 'Yearly';

export const HabitGrid: React.FC<HabitGridProps> = ({ habits, onToggle, weekDates }) => {
  const [view, setView] = useState<ViewMode>('Weekly');

  const monthDates = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return formatDateKey(d);
    });
  }, []);

  const yearMonths = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(year, i).toLocaleString('default', { month: 'short' });
      const daysInMonth = new Date(year, i + 1, 0).getDate();
      const dates = Array.from({ length: daysInMonth }, (_, j) => {
        const d = new Date(year, i, j + 1);
        return formatDateKey(d);
      });
      return { name: monthName, dates };
    });
  }, []);

  const renderStatusButton = (habitId: string, date: string, status: HabitStatus, size: 'sm' | 'md' = 'md') => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onToggle(habitId, date)}
      className={cn(
        size === 'md' ? "habit-box mx-auto" : "w-4 h-4 rounded-sm transition-all",
        status === 'empty' && (size === 'md' ? "habit-box-empty" : "bg-white/5 hover:bg-white/10"),
        status === 'completed' && (size === 'md' ? "habit-box-completed" : "bg-emerald-500"),
        status === 'skipped' && (size === 'md' ? "habit-box-skipped" : "bg-rose-500")
      )}
    >
      {size === 'md' && (
        <AnimatePresence mode="wait">
          {status === 'completed' && (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
            >
              <Icons.Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
          {status === 'skipped' && (
            <motion.div
              key="x"
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -45 }}
            >
              <Icons.X className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.button>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.LayoutGrid className="w-5 h-5 text-cyan-400" />
          Habit Calendar
        </h2>
        
        <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/5">
          {(['Weekly', 'Monthly', 'Yearly'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                view === mode 
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-6 cursor-grab active:cursor-grabbing">
        <div className="min-w-max space-y-4 select-none">
          {/* Shared Header Row */}
          <div className="flex items-center gap-6 px-4 mb-2">
            <div className="min-w-[200px] invisible" /> {/* Spacer for habit info */}
            <div className="flex-1">
              {view === 'Weekly' && (
                <div className="flex items-center justify-between gap-4 px-2">
                  {DAYS.map((day) => (
                    <div key={day} className="w-12 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day}</span>
                    </div>
                  ))}
                </div>
              )}
              {view === 'Monthly' && (
                <div className="flex items-center gap-2 px-2">
                  {monthDates.map((_, idx) => (
                    <div key={idx} className="w-4 text-center">
                      <span className="text-[9px] font-bold text-slate-600">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
              {view === 'Yearly' && (
                <div className="flex items-start gap-6 px-2">
                  {yearMonths.map((month) => (
                    <div key={month.name} className="flex flex-col items-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{month.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-[100px] invisible" /> {/* Spacer for progress */}
          </div>

          {/* Habit Rows */}
          {habits.map((habit, habitIdx) => {
            const IconComponent = (Icons as any)[habit.icon] || Icons.Circle;
            const history = habit.history || {};
            const completedCount = Object.values(history).filter(s => s === 'completed').length;
            
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: habitIdx * 0.05 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-6">
                  {/* Habit Info */}
                  <div className="min-w-[200px] flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl bg-white/5",
                      habit.category === 'Health' && "text-emerald-400",
                      habit.category === 'Learning' && "text-cyan-400",
                      habit.category === 'Mindset' && "text-purple-400",
                      habit.category === 'Productivity' && "text-orange-400",
                      habit.category === 'Custom' && "text-rose-400"
                    )}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white truncate max-w-[120px]">{habit.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{habit.category}</span>
                        <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold">
                          <Icons.Flame className="w-3 h-3" />
                          {habit.streak}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calendar View (Buttons Only) */}
                  <div className="flex-1 min-w-max">
                    {view === 'Weekly' && (
                      <div className="flex items-center justify-between gap-4 px-2 min-w-max">
                        {weekDates.map((date) => (
                          <div key={date} className="w-12 flex-shrink-0">
                            {renderStatusButton(habit.id, date, (habit.history || {})[date] || 'empty')}
                          </div>
                        ))}
                      </div>
                    )}

                    {view === 'Monthly' && (
                      <div className="flex items-center gap-2 px-2 min-w-max">
                        {monthDates.map((date) => (
                          <div key={date} className="flex-shrink-0">
                            {renderStatusButton(habit.id, date, (habit.history || {})[date] || 'empty', 'sm')}
                          </div>
                        ))}
                      </div>
                    )}

                    {view === 'Yearly' && (
                      <div className="flex items-start gap-6 px-2 min-w-max">
                        {yearMonths.map((month) => (
                          <div key={month.name} className="flex flex-col gap-2 flex-shrink-0">
                            <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                              {month.dates.map((date) => (
                                <div
                                  key={date}
                                  onClick={() => onToggle(habit.id, date)}
                                  className={cn(
                                    "w-3 h-3 rounded-[2px] cursor-pointer transition-all hover:scale-125",
                                    (habit.history || {})[date] === 'completed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" :
                                    (habit.history || {})[date] === 'skipped' ? "bg-rose-500" :
                                    "bg-white/5 hover:bg-white/10"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="min-w-[100px] flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-emerald-400">
                      {completedCount} Total
                    </span>
                    <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (completedCount / 30) * 100)}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
