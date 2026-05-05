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
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-[0.2em] text-white">
          <Icons.CheckSquare className="w-5 h-5 text-purple-400" />
          Task Protocol
        </h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-8">
          Daily operational objectives
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {dayTasks.map((dayData, dayIdx) => {
          const completedCount = dayData.tasks.filter(t => t.completed).length;
          const totalCount = dayData.tasks.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          const getStatusColor = (p: number) => {
            if (p === 0) return 'bg-white/[0.02] border-white/5 text-slate-600';
            if (p < 30) return 'bg-rose-500/5 border-rose-500/10 text-rose-400';
            if (p < 100) return 'bg-purple-500/5 border-purple-500/10 text-purple-400';
            return 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400';
          };

          return (
            <motion.div 
              key={dayData.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -4, 
                borderColor: "rgba(168, 85, 247, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.02)"
              }}
              transition={{ delay: dayIdx * 0.03 }}
              className="glass-card p-5 flex flex-col gap-5 group border-white/5 transition-all relative overflow-hidden bg-white/[0.01] glow-border"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                  {dayData.day}
                </span>
                <div className={`px-2 py-0.5 rounded border text-[9px] font-black transition-all ${getStatusColor(progress)}`}>
                  {Math.round(progress)}%
                </div>
              </div>
              
              <div className="space-y-3 min-h-[120px]">
                <AnimatePresence mode="popLayout">
                  {dayData.tasks.map((task) => (
                    <motion.label
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                      className="flex items-start gap-3 cursor-pointer group/item p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleTask(dayData.day, task.id)}
                          className="peer appearance-none w-4 h-4 border border-white/10 rounded bg-black checked:bg-purple-500 checked:border-purple-500 transition-all"
                        />
                        <Icons.Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className={`text-[11px] leading-tight font-black uppercase tracking-wider transition-all ${task.completed ? 'text-slate-700 line-through italic' : 'text-slate-400 group-hover/item:text-white'}`}>
                        {task.text}
                      </span>
                    </motion.label>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-4">
                <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.3)] ${
                      progress === 100 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 
                      progress > 0 ? 'bg-gradient-to-r from-purple-600 to-purple-400' : 'bg-transparent'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.1em]">
                    {completedCount} / {totalCount} UNIT
                  </span>
                  {progress === 100 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">SYNCED</span>
                      <Icons.Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
