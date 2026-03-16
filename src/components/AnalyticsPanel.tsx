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
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
        <Icons.BarChart3 className="w-5 h-5 text-emerald-400" />
        Analysis
      </h2>

      <div className="space-y-10">
        {/* Weekly Score Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Weekly Score</h3>
            <span className="text-2xl font-black text-white">{Math.round(weeklyScore)} / 100</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${weeklyScore}%` }}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
            />
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Score based on 50% Habits, 30% Tasks, and 20% Focus.
          </p>
        </div>

        {/* Habit Completion Bar Chart */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Habit Completion</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #ffffff20', borderRadius: '4px' }}
                />
                <Bar dataKey="completed" fill="#22d3ee" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Productivity Bar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Productivity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-black text-emerald-400">{Math.round(taskProgress)}%</span>
              <span className="text-[10px] text-slate-500 font-bold">{completedTasks} / {totalTasks} TASKS</span>
            </div>
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${taskProgress}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Mindset Distribution (Linear Gauges) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mindset Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'Mood', value: avgMood, color: 'bg-rose-500' },
              { label: 'Motivation', value: avgMotivation, color: 'bg-amber-500' },
              { label: 'Focus', value: avgFocus, color: 'bg-cyan-500' }
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">{item.value.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 10) * 100}%` }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Mood Score */}
        <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Average Mood Score</span>
          <span className="text-6xl font-black text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            {avgMood.toFixed(1)}
          </span>
          <div className="flex gap-1.5">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-sm ${i < Math.round(avgMood) ? 'bg-rose-500' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
