import { Habit, DayTasks, MentalState, Achievement } from './types';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Drink Water', icon: 'Droplets', category: 'Health', history: {}, streak: 5, reminder: '09:00 AM' },
  { id: '2', name: 'Workout', icon: 'Dumbbell', category: 'Health', history: {}, streak: 3, reminder: '07:00 AM' },
  { id: '3', name: 'Read', icon: 'BookOpen', category: 'Learning', history: {}, streak: 12, reminder: '09:00 PM' },
  { id: '4', name: 'Meditate', icon: 'Wind', category: 'Mindset', history: {}, streak: 0, reminder: '08:00 AM' },
  { id: '5', name: 'Walk 10k Steps', icon: 'Footprints', category: 'Health', history: {}, streak: 8 },
  { id: '6', name: 'Sleep 8 Hours', icon: 'Moon', category: 'Health', history: {}, streak: 2 },
];

export const INITIAL_TASKS: DayTasks[] = DAYS.map(day => ({
  day,
  tasks: [
    { id: `${day}-1`, text: 'Morning Workout', completed: false },
    { id: `${day}-2`, text: 'Read 20 Pages', completed: false },
    { id: `${day}-3`, text: 'Drink 8 Glasses Water', completed: false },
    { id: `${day}-4`, text: 'Journal', completed: false },
    { id: `${day}-5`, text: 'Meditation', completed: false },
  ]
}));

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Consistency Starter', description: 'Complete habits 5 days in a row', icon: 'Zap', unlocked: false, requirement: 'streak:5' },
  { id: '2', title: '7 Day Warrior', description: 'Maintain a 7 day streak', icon: 'Shield', unlocked: false, requirement: 'streak:7' },
  { id: '3', title: 'Focus Master', description: 'Complete 20 focus sessions', icon: 'Target', unlocked: false, requirement: 'focus:20' },
  { id: '4', title: 'Habit Champion', description: 'Complete 100 habits total', icon: 'Trophy', unlocked: false, requirement: 'total:100' },
];
