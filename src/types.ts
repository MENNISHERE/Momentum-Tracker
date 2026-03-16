export type HabitStatus = 'empty' | 'completed' | 'skipped';

export type HabitCategory = 'Health' | 'Learning' | 'Productivity' | 'Mindset' | 'Custom';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  history: Record<string, HabitStatus>; // Key: YYYY-MM-DD
  streak: number;
  reminder?: string; // "09:00 AM"
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface DayTasks {
  day: string;
  tasks: Task[];
}

export interface MentalState {
  day: string;
  mood: number;
  motivation: number;
  focus: number;
  journal?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirement: string;
}

export type Theme = 'Dark' | 'Midnight Blue' | 'Purple Gradient' | 'Neon Dark' | 'Light Mode' | 'Forest Green' | 'Darken Black' | 'Lighten White';

export type LayoutPreset = 'Standard' | 'Focus' | 'Habit-Centric' | 'Analytics' | 'Minimalist';

export type FontFamily = 'Inter' | 'Space Grotesk' | 'Outfit' | 'Playfair Display' | 'JetBrains Mono';

export interface UserSettings {
  theme: Theme;
  layout: LayoutPreset;
  font: FontFamily;
  focusSessions: number;
}
