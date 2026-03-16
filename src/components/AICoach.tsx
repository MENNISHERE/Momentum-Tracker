import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, DayTasks, MentalState } from '../types';

interface AICoachProps {
  habits: Habit[];
  tasks: DayTasks[];
  mentalState: MentalState[];
  weekDates: string[];
}

export const AICoach: React.FC<AICoachProps> = ({ habits, tasks, mentalState, weekDates }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-flash-lite-preview";
      
      const summary = {
        habits: habits.map(h => {
          const history = h.history || {};
          const completedInWeek = weekDates.filter(date => history[date] === 'completed').length;
          return { 
            name: h.name, 
            streak: h.streak, 
            completionRate: (completedInWeek / 7 * 100).toFixed(0) + '%'
          };
        }),
        tasks: tasks.map(t => ({ 
          day: t.day, 
          completion: `${t.tasks.filter(tk => tk.completed).length}/${t.tasks.length}` 
        })),
        mental: mentalState.map(m => ({ 
          day: m.day,
          mood: m.mood, 
          motivation: m.motivation, 
          focus: m.focus,
          journal: m.journal
        }))
      };

      const response = await ai.models.generateContent({
        model,
        contents: `You are the Momentum AI Coach. Analyze this user's data and provide a high-impact, personalized coaching insight.
        
        Data Context:
        ${JSON.stringify(summary)}
        
        Rules:
        1. Identify one specific positive trend (e.g., "Your focus is highest when you complete your morning habits").
        2. Identify one area for improvement based on the data (e.g., "Motivation dips on Tuesdays, consider a lighter task load then").
        3. Keep it under 50 words.
        4. Be direct, professional, and slightly provocative to spark action.
        5. Do not use generic praise. Use the specific habit names or mental scores provided.`,
      });

      setInsight(response.text || "You're doing great! Keep pushing your boundaries.");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setInsight("Momentum is building. Your consistency in reading is impressive, but don't forget to hydrate to keep your focus sharp!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -5 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
          <Icons.Sparkles className="w-4 h-4" />
          AI Momentum Coach
        </h3>
        <button
          onClick={generateInsight}
          disabled={loading}
          className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/20"
        >
          {loading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Zap className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {insight ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-slate-300 leading-relaxed italic"
          >
            "{insight}"
          </motion.p>
        ) : (
          <p className="text-sm text-slate-500 italic">
            Tap the zap to get personalized AI insights based on your performance...
          </p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
