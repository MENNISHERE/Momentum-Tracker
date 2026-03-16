import React from 'react';
import { DayTasks } from '../types';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskTrackerProps {
  dayTasks: DayTasks[];
  onToggleTask: (day: string, taskId: string) => void;
}

export const TaskTracker: React.FC<TaskTrackerProps> = ({ dayTasks, onToggleTask }) => {
  return (
    <div>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Icons.CheckSquare className="w-5 h-5 text-purple-400" />
        Weekly Task Tracker
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {dayTasks.map((dayData, dayIdx) => {
          const completedCount = dayData.tasks.filter(t => t.completed).length;
          const totalCount = dayData.tasks.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          const getStatusColor = (p: number) => {
            if (p === 0) return 'bg-white/5 border-white/10';
            if (p < 30) return 'bg-rose-500/20 border-rose-500/30 text-rose-400';
            if (p < 100) return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
            return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
          };

          return (
            <motion.div 
              key={dayData.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ delay: dayIdx * 0.03 }}
              className="glass-card p-3 flex flex-col gap-3 group border-white/5 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-tighter group-hover:text-white transition-colors">
                  {dayData.day}
                </span>
                <div className={`px-1.5 py-0.5 rounded-full border text-[9px] font-black transition-colors ${getStatusColor(progress)}`}>
                  {Math.round(progress)}%
                </div>
              </div>
              
              <div className="space-y-1.5 min-h-[80px]">
                <AnimatePresence mode="popLayout">
                  {dayData.tasks.map((task) => (
                    <motion.label
                      key={task.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2 cursor-pointer group/item"
                    >
                      <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleTask(dayData.day, task.id)}
                          className="peer appearance-none w-3.5 h-3.5 border border-white/20 rounded-md bg-white/5 checked:bg-purple-500 checked:border-purple-500 transition-all"
                        />
                        <Icons.Check className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className={`text-[11px] leading-tight transition-all ${task.completed ? 'text-slate-600 line-through' : 'text-slate-400 group-hover/item:text-slate-200'}`}>
                        {task.text}
                      </span>
                    </motion.label>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-2">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full transition-colors ${
                      progress === 100 ? 'bg-emerald-500' : 
                      progress > 0 ? 'bg-purple-500' : 'bg-transparent'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    {completedCount}/{totalCount}
                  </span>
                  {progress === 100 && <Icons.Zap className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
