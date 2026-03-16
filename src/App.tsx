import React, { useState, useMemo, useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HabitGrid } from './components/HabitGrid';
import { TaskTracker } from './components/TaskTracker';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { INITIAL_HABITS, INITIAL_TASKS, ACHIEVEMENTS } from './constants';
import { Habit, DayTasks, MentalState, HabitStatus, Theme, Achievement, HabitCategory, LayoutPreset, FontFamily } from './types';
import { formatDateKey } from './lib/utils';

import { AICoach } from './components/AICoach';
import { AIChatCoach } from './components/AIChatCoach';
import { FocusTimer } from './components/FocusTimer';
import { AddModal } from './components/AddModal';
import { SettingsModal } from './components/SettingsModal';
import { Achievements } from './components/Achievements';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Momentum Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20">
              <Icons.AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Something went wrong</h1>
              <p className="text-slate-400 text-sm">Momentum encountered an unexpected error. Don't worry, your data is safe.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-left">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">Error Details</p>
              <p className="text-xs font-mono text-slate-500 break-all">{this.state.error?.message || 'Unknown error'}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all uppercase tracking-widest text-xs"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('momentum_habits');
    if (!saved) return INITIAL_HABITS;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_HABITS;
      // Migration: Ensure history object exists for all habits
      return parsed.map((h: any) => ({
        ...h,
        history: h.history || {},
        streak: typeof h.streak === 'number' ? h.streak : 0
      }));
    } catch (e) {
      console.error('Failed to parse habits from localStorage', e);
      return INITIAL_HABITS;
    }
  });

  const [dayTasks, setDayTasks] = useState<DayTasks[]>(() => {
    const saved = localStorage.getItem('momentum_tasks');
    if (!saved) return INITIAL_TASKS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      return INITIAL_TASKS;
    }
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('momentum_theme') as Theme;
    return saved || 'Dark';
  });

  const [layout, setLayout] = useState<LayoutPreset>(() => {
    const saved = localStorage.getItem('momentum_layout') as LayoutPreset;
    return saved || 'Standard';
  });

  const [font, setFont] = useState<FontFamily>(() => {
    const saved = localStorage.getItem('momentum_font') as FontFamily;
    return saved || 'Inter';
  });

  const [focusSessions, setFocusSessions] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('momentum_focus_sessions') || '0');
    } catch (e) {
      return 0;
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('momentum_achievements');
    if (!saved) return ACHIEVEMENTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : ACHIEVEMENTS;
    } catch (e) {
      return ACHIEVEMENTS;
    }
  });
  
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'json' | 'pdf' | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- Global Error Handling ---
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Momentum caught an unhandled promise rejection:', event.reason);
      setNotification({
        message: 'A background task failed. Please check your connection.',
        type: 'error'
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('momentum_habits', JSON.stringify(habits));
    localStorage.setItem('momentum_tasks', JSON.stringify(dayTasks));
    localStorage.setItem('momentum_theme', theme);
    localStorage.setItem('momentum_layout', layout);
    localStorage.setItem('momentum_font', font);
    localStorage.setItem('momentum_focus_sessions', focusSessions.toString());
    localStorage.setItem('momentum_achievements', JSON.stringify(achievements));
  }, [habits, dayTasks, theme, layout, font, focusSessions, achievements]);

  // --- Theme Application ---
  useEffect(() => {
    const root = document.documentElement;
    const themes: Record<Theme, string> = {
      'Dark': 'radial-gradient(circle at top left, #0f172a, #1e1b4b, #312e81)',
      'Midnight Blue': 'radial-gradient(circle at top left, #020617, #0f172a, #1e293b)',
      'Purple Gradient': 'radial-gradient(circle at top left, #2e1065, #4c1d95, #5b21b6)',
      'Neon Dark': 'radial-gradient(circle at top left, #000000, #09090b, #18181b)',
      'Light Mode': 'radial-gradient(circle at top left, #f8fafc, #f1f5f9, #e2e8f0)',
      'Forest Green': 'radial-gradient(circle at top left, #064e3b, #065f46, #047857)',
      'Darken Black': '#000000',
      'Lighten White': '#ffffff',
    };
    document.body.style.background = themes[theme];
    if (theme === 'Light Mode' || theme === 'Lighten White') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // --- Font Application ---
  useEffect(() => {
    const fontMap: Record<FontFamily, string> = {
      'Inter': 'font-sans',
      'Space Grotesk': 'font-space',
      'Outfit': 'font-outfit',
      'Playfair Display': 'font-serif',
      'JetBrains Mono': 'font-mono'
    };
    
    // Remove all font classes
    Object.values(fontMap).forEach(cls => document.body.classList.remove(cls));
    // Add selected font class
    document.body.classList.add(fontMap[font]);
  }, [font]);

  // --- Handlers ---
  const toggleHabit = (habitId: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const history = habit.history || {};
        const current = history[date] || 'empty';
        
        let nextStatus: HabitStatus = 'empty';
        if (current === 'empty') nextStatus = 'completed';
        else if (current === 'completed') nextStatus = 'skipped';
        else nextStatus = 'empty';

        const newHistory = { ...history, [date]: nextStatus };

        // Streak Logic
        let newStreak = habit.streak;
        if (nextStatus === 'completed') {
          newStreak += 1;
        } else if (nextStatus === 'skipped' || nextStatus === 'empty') {
          newStreak = Math.max(0, newStreak - 1);
        }

        return { ...habit, history: newHistory, streak: newStreak };
      }
      return habit;
    }));
  };

  const toggleTask = (day: string, taskId: string) => {
    setDayTasks(prev => prev.map(dt => {
      if (dt.day === day) {
        return {
          ...dt,
          tasks: dt.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return dt;
    }));
  };

  const addHabit = (name: string, category?: HabitCategory) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      icon: 'Activity',
      category: category || 'Custom',
      history: {},
      streak: 0
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const addTask = (text: string) => {
    setDayTasks(prev => prev.map(dt => ({
      ...dt,
      tasks: [...dt.tasks, { id: Date.now().toString() + Math.random(), text, completed: false }]
    })));
  };

  const resetWeek = () => {
    setHabits(INITIAL_HABITS);
    setDayTasks(INITIAL_TASKS);
  };

  const handleFocusComplete = () => {
    setFocusSessions(prev => prev + 1);
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      setExportingFormat(format);
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const data = { habits, dayTasks, focusSessions, date: new Date().toISOString() };
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `momentum_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Habits CSV
        let csvContent = "Type,Name,Category,Streak,Status/Completed\n";
        habits.forEach(h => {
          csvContent += `Habit,${h.name},${h.category},${h.streak},-\n`;
        });
        dayTasks.forEach(dt => {
          dt.tasks.forEach(t => {
            csvContent += `Task,${t.text},${dt.day},-,${t.completed ? 'Yes' : 'No'}\n`;
          });
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `momentum_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text('Momentum Productivity Report', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Focus Sessions Completed: ${focusSessions}`, 14, 35);
        
        // Habits Table
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text('Habits Summary', 14, 50);
        
        const habitRows = habits.map(h => [
          h.name,
          h.category,
          h.streak.toString(),
          Object.values(h.history).filter(s => s === 'completed').length.toString()
        ]);
        
        autoTable(doc, {
          startY: 55,
          head: [['Habit Name', 'Category', 'Current Streak', 'Total Completions']],
          body: habitRows,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] } // emerald-500
        });
        
        // Tasks Table
        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.setFontSize(16);
        doc.text('Weekly Tasks', 14, finalY + 15);
        
        const taskRows: string[][] = [];
        dayTasks.forEach(dt => {
          dt.tasks.forEach(t => {
            taskRows.push([dt.day, t.text, t.completed ? 'Completed' : 'Pending']);
          });
        });
        
        autoTable(doc, {
          startY: finalY + 20,
          head: [['Day', 'Task Description', 'Status']],
          body: taskRows,
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241] } // indigo-500
        });
        
        doc.save(`momentum_report_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      showNotification('Report exported successfully!', 'success');
    } catch (err) {
      console.error("Export failed:", err);
      showNotification('Failed to export report. Please try again.', 'error');
    } finally {
      setExportingFormat(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onerror = () => {
      showNotification('Failed to read the file. Please try again.', 'error');
    };
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          if (data.habits) setHabits(data.habits);
          if (data.dayTasks) setDayTasks(data.dayTasks);
          if (data.focusSessions !== undefined) setFocusSessions(data.focusSessions);
          showNotification('All data imported successfully from JSON!', 'success');
        } catch (err) {
          showNotification('Failed to parse JSON file. Please check the format.', 'error');
        }
      } else if (file.name.endsWith('.csv')) {
        try {
          const lines = content.split('\n');
          const newHabits: Habit[] = [];
          const newDayTasks = JSON.parse(JSON.stringify(INITIAL_TASKS)) as DayTasks[];

          lines.slice(1).forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 2) return;
            const [type, name, category, streak, completed] = parts;

            if (type === 'Habit') {
              newHabits.push({
                id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name,
                category: (category as HabitCategory) || 'Custom',
                streak: parseInt(streak) || 0,
                icon: 'Activity',
                history: {} 
              });
            } else if (type === 'Task') {
              const dayTask = newDayTasks.find(dt => dt.day === category);
              if (dayTask) {
                dayTask.tasks.push({
                  id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  text: name,
                  completed: completed?.toLowerCase() === 'yes' || completed === 'true'
                });
              }
            }
          });

          if (newHabits.length > 0) setHabits(newHabits);
          setDayTasks(newDayTasks);
          showNotification('Habits and tasks imported from CSV!', 'success');
        } catch (err) {
          showNotification('Failed to import CSV data.', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  // --- Achievement Logic ---
  useEffect(() => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;

      let unlocked = false;
      if (achievement.requirement.startsWith('streak:')) {
        const target = parseInt(achievement.requirement.split(':')[1]);
        unlocked = habits.some(h => h.streak >= target);
      } else if (achievement.requirement.startsWith('focus:')) {
        const target = parseInt(achievement.requirement.split(':')[1]);
        unlocked = focusSessions >= target;
      } else if (achievement.requirement.startsWith('total:')) {
        const target = parseInt(achievement.requirement.split(':')[1]);
        const totalCompleted = habits.reduce((acc, h) => acc + Object.values(h.history).filter(s => s === 'completed').length, 0);
        unlocked = totalCompleted >= target;
      }

      return { ...achievement, unlocked };
    }));
  }, [habits, focusSessions]);

  // --- Calculations ---
  const weekDates = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return formatDateKey(d);
    });
  }, []);

  // --- Derived Behavioral State (Auto-Mental State) ---
  const behavioralState = useMemo<MentalState[]>(() => {
    return weekDates.map((date, idx) => {
      const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx];
      
      // Habit completion for this date
      const totalHabits = habits.length;
      const completedHabits = habits.filter(h => h.history[date] === 'completed').length;
      const habitRate = totalHabits > 0 ? completedHabits / totalHabits : 0;

      // Task completion for this day
      const dayTaskData = dayTasks.find(dt => dt.day === dayName);
      const totalTasks = dayTaskData?.tasks.length || 0;
      const completedTasks = dayTaskData?.tasks.filter(t => t.completed).length || 0;
      const taskRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

      // Focus sessions (distributed for demo, but normally tracked per day)
      // For now, we'll use a mock distribution based on the index
      const focusSessionsToday = idx === 0 ? Math.min(3, focusSessions) : 0; // Mon gets some focus sessions for demo

      // Mood calculation: Base 5, +3 for habits, +2 for tasks
      const mood = Math.min(10, 4 + (habitRate * 4) + (taskRate * 2));
      
      // Motivation calculation: Base 4, +4 for habits, +2 for streaks
      const avgStreak = habits.length > 0 ? habits.reduce((acc, h) => acc + h.streak, 0) / habits.length : 0;
      const motivation = Math.min(10, 3 + (habitRate * 5) + (Math.min(2, avgStreak / 5) * 2));

      // Focus calculation: Base 3, +4 for tasks, +3 for focus sessions
      const focus = Math.min(10, 3 + (taskRate * 4) + (focusSessionsToday > 0 ? 3 : 0));

      return {
        day: dayName,
        mood: Number(mood.toFixed(1)),
        motivation: Number(motivation.toFixed(1)),
        focus: Number(focus.toFixed(1))
      };
    });
  }, [habits, dayTasks, focusSessions, weekDates]);

  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const completedHabitsCount = habits.reduce((acc, h) => 
      acc + weekDates.filter(date => h.history[date] === 'completed').length, 0
    );
    const totalPossibleHabits = totalHabits * 7;
    const habitProgress = totalPossibleHabits > 0 ? (completedHabitsCount / totalPossibleHabits) * 100 : 0;

    const totalTasks = dayTasks.reduce((acc, d) => acc + d.tasks.length, 0);
    const completedTasks = dayTasks.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0);
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Weekly Productivity Score
    // Habit completion = 50%
    // Task completion = 30%
    // Focus sessions = 20% (Target 10 sessions/week)
    const focusProgress = Math.min(100, (focusSessions / 10) * 100);
    const weeklyScore = (habitProgress * 0.5) + (taskProgress * 0.3) + (focusProgress * 0.2);

    const overallProgress = (habitProgress + taskProgress) / 2;

    return {
      totalHabits,
      completedHabitsCount,
      overallProgress,
      habitProgress,
      taskProgress,
      weeklyScore,
      focusSessions
    };
  }, [habits, dayTasks, focusSessions]);

  const currentDate = new Date();
  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className={`relative text-white ${(theme === 'Light Mode' || theme === 'Lighten White') ? 'text-slate-900' : ''}`}>
      {/* Background Visuals */}
      {(theme !== 'Darken Black' && theme !== 'Lighten White') && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] rounded-full" />
        </div>
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Icons.Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-syne font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Momentum .
              </h1>
              <p className="text-slate-400 font-medium flex items-center gap-2">
                <Icons.Calendar className="w-4 h-4" />
                {monthYear}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsHabitModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-bold flex items-center gap-2"
            >
              <Icons.Plus className="w-4 h-4 text-cyan-400" />
              Add Habit
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-bold flex items-center gap-2"
            >
              <Icons.Plus className="w-4 h-4 text-purple-400" />
              Add Task
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-bold flex items-center gap-2"
            >
              <Icons.Settings className="w-4 h-4 text-slate-400" />
              Settings
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                } catch (err) {
                  console.error("Logout failed:", err);
                } finally {
                  window.location.href = '/login';
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-sm font-bold text-rose-400 flex items-center gap-2"
            >
              <Icons.LogOut className="w-4 h-4" />
              Logout
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetWeek}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-sm font-bold text-rose-400 flex items-center gap-2"
            >
              <Icons.RotateCcw className="w-4 h-4" />
              Reset Week
            </motion.button>
          </div>
        </motion.header>

        {/* Global Progress Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Weekly Score', value: `${Math.round(stats.weeklyScore)} / 100`, icon: Icons.Target, color: 'text-yellow-400', isLarge: true },
            { label: 'Focus Sessions', value: stats.focusSessions, icon: Icons.Timer, color: 'text-cyan-400' },
            { label: 'Overall Progress', value: `${Math.round(stats.overallProgress)}%`, icon: Icons.Zap, color: 'text-purple-400' },
            { 
              label: 'Momentum Score', 
              value: (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl font-black text-emerald-400">{Math.round(stats.overallProgress)}</span>
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.overallProgress}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              ), 
              isWidget: true 
            }
          ].map((widget, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-4 flex items-center justify-between group cursor-default border-white/5 hover:border-white/20 transition-all"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{widget.label}</span>
                {typeof widget.value === 'string' || typeof widget.value === 'number' ? (
                  <p className={`text-2xl font-black transition-colors ${widget.isLarge ? 'text-white group-hover:text-yellow-400' : 'text-slate-200 group-hover:text-white'}`}>
                    {widget.value}
                  </p>
                ) : (
                  <div className="pt-1">{widget.value}</div>
                )}
              </div>
              {widget.icon && (
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className={`p-2.5 rounded-md bg-white/5 border border-white/10 ${widget.color}`}
                >
                  <widget.icon className="w-5 h-5" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={layout}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 xl:grid-cols-4 gap-8"
          >
            {layout === 'Standard' && (
              <>
                <div className="xl:col-span-3 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Achievements achievements={achievements} />
                    <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
                      <Icons.Quote className="w-8 h-8 text-emerald-500/20 mb-2" />
                      <p className="text-lg font-serif italic text-slate-300">"Momentum is built one habit at a time."</p>
                      <div className="w-12 h-0.5 bg-emerald-500/20 rounded-full" />
                    </div>
                  </div>
                  <HabitGrid habits={habits} onToggle={toggleHabit} weekDates={weekDates} />
                  <TaskTracker dayTasks={dayTasks} onToggleTask={toggleTask} />
                </div>
                <div className="xl:col-span-1 space-y-6">
                  <FocusTimer onComplete={handleFocusComplete} totalSessions={focusSessions} />
                  <AICoach habits={habits} tasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} />
                  <AnalyticsPanel habits={habits} dayTasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} focusSessions={focusSessions} />
                </div>
              </>
            )}

            {layout === 'Focus' && (
              <>
                <div className="xl:col-span-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <FocusTimer onComplete={handleFocusComplete} totalSessions={focusSessions} />
                  </div>
                  <div className="lg:col-span-8">
                    <AICoach habits={habits} tasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} />
                  </div>
                </div>
                <div className="xl:col-span-3 space-y-6">
                  <TaskTracker dayTasks={dayTasks} onToggleTask={toggleTask} />
                  <HabitGrid habits={habits} onToggle={toggleHabit} weekDates={weekDates} />
                </div>
                <div className="xl:col-span-1 space-y-6">
                  <AnalyticsPanel habits={habits} dayTasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} focusSessions={focusSessions} />
                  <Achievements achievements={achievements} />
                </div>
              </>
            )}

            {layout === 'Habit-Centric' && (
              <>
                <div className="xl:col-span-4 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <HabitGrid habits={habits} onToggle={toggleHabit} weekDates={weekDates} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                      <AnalyticsPanel habits={habits} dayTasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} focusSessions={focusSessions} />
                      <Achievements achievements={achievements} />
                    </div>
                  </div>
                  <TaskTracker dayTasks={dayTasks} onToggleTask={toggleTask} />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <FocusTimer onComplete={handleFocusComplete} totalSessions={focusSessions} />
                    </div>
                    <div className="lg:col-span-2">
                      <AICoach habits={habits} tasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {layout === 'Analytics' && (
              <>
                <div className="xl:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <AnalyticsPanel habits={habits} dayTasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} focusSessions={focusSessions} />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FocusTimer onComplete={handleFocusComplete} totalSessions={focusSessions} />
                      <Achievements achievements={achievements} />
                    </div>
                    <AICoach habits={habits} tasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} />
                    <TaskTracker dayTasks={dayTasks} onToggleTask={toggleTask} />
                  </div>
                </div>
                <div className="xl:col-span-4">
                  <HabitGrid habits={habits} onToggle={toggleHabit} weekDates={weekDates} />
                </div>
              </>
            )}

            {layout === 'Minimalist' && (
              <div className="xl:col-span-4 max-w-5xl mx-auto w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4">
                    <FocusTimer onComplete={handleFocusComplete} totalSessions={focusSessions} />
                  </div>
                  <div className="md:col-span-8">
                    <AICoach habits={habits} tasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} />
                  </div>
                </div>
                <HabitGrid habits={habits} onToggle={toggleHabit} weekDates={weekDates} />
                <TaskTracker dayTasks={dayTasks} onToggleTask={toggleTask} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="pt-12 pb-8 border-t border-white/5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="flex items-center gap-6 mb-4">
              <Icons.Github className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
              <Icons.Twitter className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
              <Icons.Instagram className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
              Momentum Habit Tracker &copy; 2026 • Stay Consistent • Built for Excellence
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] text-cyan-500/50 font-bold uppercase tracking-widest">System Operational</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AddModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onAdd={addHabit}
        title="Create New Habit"
        placeholder="e.g. Morning Meditation"
        showCategory
      />
      <AddModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAdd={addTask}
        title="Add Weekly Task"
        placeholder="e.g. Review Project Specs"
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={setTheme}
        currentLayout={layout}
        onLayoutChange={setLayout}
        currentFont={font}
        onFontChange={setFont}
        onExport={handleExport}
        exportingFormat={exportingFormat}
        onImport={handleImport}
      />

      {/* Professional Notification Toast */}
      <AIChatCoach habits={habits} tasks={dayTasks} mentalState={behavioralState} weekDates={weekDates} />
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[300px] ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            } backdrop-blur-xl`}
          >
            {notification.type === 'success' ? (
              <Icons.CheckCircle2 className="w-5 h-5" />
            ) : (
              <Icons.AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-bold tracking-tight">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto p-1 hover:bg-white/5 rounded-sm transition-colors"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

// Global Error Prevention
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    // Prevent default browser handling (optional)
    // event.preventDefault();
  });
}
