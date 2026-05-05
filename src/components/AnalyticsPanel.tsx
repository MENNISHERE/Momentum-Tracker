import React from 'react';
import { Habit, DayTasks, MentalState } from '../types';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  ResponsiveContainer, XAxis, YAxis, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar 
} from 'recharts';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsPanelProps {
  habits: Habit[];
  dayTasks: DayTasks[];
  mentalState: MentalState[];
  weekDates: string[];
  focusSessions: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ habits, dayTasks, mentalState, weekDates, focusSessions }) => {
  // 1. Habit completion bar chart data (Current Week)
  const habitData = habits.map(h => ({
    name: h.name,
    completed: weekDates.filter(date => (h.history || {})[date] === 'completed').length
  }));

  // 2. Weekly productivity data (Tasks)
  const totalTasks = dayTasks.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = dayTasks.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0);
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // 3. Mindset distribution (Radar chart)
  const avgMood = mentalState.length > 0 ? mentalState.reduce((acc, d) => acc + d.mood, 0) / mentalState.length : 0;
  const avgMotivation = mentalState.length > 0 ? mentalState.reduce((acc, d) => acc + d.motivation, 0) / mentalState.length : 0;
  const avgFocus = mentalState.length > 0 ? mentalState.reduce((acc, d) => acc + d.focus, 0) / mentalState.length : 0;
  
  const radarData = [
    { subject: 'Mood', A: avgMood, fullMark: 10 },
    { subject: 'Motivation', A: avgMotivation, fullMark: 10 },
    { subject: 'Focus', A: avgFocus, fullMark: 10 },
  ];

  // 4. Weekly Productivity Score Calculation
  const habitProgress = (habits.reduce((acc, h) => acc + weekDates.filter(date => (h.history || {})[date] === 'completed').length, 0) / (habits.length * 7)) * 100;
  const focusProgress = Math.min(100, (focusSessions / 10) * 100);
  const weeklyScore = (habitProgress * 0.5) + (taskProgress * 0.3) + (focusProgress * 0.2);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        y: -5,
        borderColor: "rgba(168, 85, 247, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.02)"
      }}
      transition={{ delay: 0.3 }}
      className="glass-card p-8 bg-white/[0.01] border-emerald-500/10 relative overflow-hidden group glow-border"
    >
      {/* Background glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-colors" />

      <div className="space-y-1 mb-10 relative z-10">
        <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Icons.BarChart3 className="w-4 h-4 animate-pulse" />
          Analytics Protocol
        </h2>
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em] ml-6">
          System performance metrics
        </p>
      </div>

      <div className="space-y-12 relative z-10">
        {/* Weekly Score Card */}
        <div className="p-6 rounded-2xl bg-black border border-yellow-500/10 space-y-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Efficiency Score</h3>
            <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{Math.round(weeklyScore)} / 100</span>
          </div>
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${weeklyScore}%` }}
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
            />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest leading-relaxed">
              50% HABIT • 30% TASK • 20% FOCUS
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < Math.floor(weeklyScore / 20) ? 'bg-yellow-500' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Habit Completion Bar Chart */}
        <div className="space-y-6">
          <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Habit Completion</h3>
          <div className="h-[180px] bg-black rounded-xl p-4 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '8px',
                    fontSize: '9px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                />
                <Bar dataKey="completed" fill="#a855f7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Productivity Bar */}
        <div className="space-y-6">
          <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Productivity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{Math.round(taskProgress)}%</span>
              <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{completedTasks} / {totalTasks} UNIT</span>
            </div>
            <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${taskProgress}%` }}
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              />
            </div>
          </div>
        </div>

        {/* Mindset Distribution (Linear Gauges) */}
        <div className="space-y-6">
          <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Mindset Distribution</h3>
          <div className="space-y-5">
            {[
              { label: 'Mood', value: avgMood, color: 'from-rose-600 to-rose-400', shadow: 'rgba(244,63,94,0.3)' },
              { label: 'Motivation', value: avgMotivation, color: 'from-amber-600 to-amber-400', shadow: 'rgba(245,158,11,0.3)' },
              { label: 'Focus', value: avgFocus, color: 'from-cyan-600 to-cyan-400', shadow: 'rgba(6,182,212,0.3)' }
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.15em]">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-white">{item.value.toFixed(1)}</span>
                </div>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 10) * 100}%` }}
                    className={`h-full bg-gradient-to-r ${item.color}`}
                    style={{ boxShadow: `0 0 10px ${item.shadow}` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Mood Score */}
        <div className="pt-10 border-t border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Average Mood Score</span>
          <span className="text-7xl font-black text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">
            {avgMood.toFixed(1)}
          </span>
          <div className="flex gap-2">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-sm transition-all duration-500 ${i < Math.round(avgMood) ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-black border border-white/5'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
