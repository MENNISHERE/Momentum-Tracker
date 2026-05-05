import React, { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const generateInsight = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
      if (!apiKey) {
        throw new Error("API Key Missing. To enable the AI Coach, please add your Gemini API Key in the Settings (gear icon) → Secrets section. Set the name to VITE_GEMINI_API_KEY and the value to your key.");
      }
      const ai = new GoogleGenAI({ apiKey });
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

      if (isMounted.current) {
        setInsight(response.text || "You're doing great! Keep pushing your boundaries.");
      }
    } catch (error) {
      console.error("AI Insight Error:", error);
      if (isMounted.current) {
        setInsight("Momentum is building. Your consistency in reading is impressive, but don't forget to hydrate to keep your focus sharp!");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        y: -5,
        borderColor: "rgba(168, 85, 247, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.02)"
      }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 bg-white/[0.01] border-purple-500/10 relative overflow-hidden group glow-border"
    >
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full group-hover:bg-purple-500/10 transition-colors" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Icons.Sparkles className="w-4 h-4 animate-pulse" />
            AI Momentum Protocol
          </h3>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em] ml-6">
            Neural analysis engine
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => generateInsight().catch(err => console.error("generateInsight unhandled rejection:", err))}
          disabled={loading}
          className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 border border-purple-400/30"
        >
          {loading ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Zap className="w-5 h-5 fill-white" />}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {insight ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10"
          >
            <div className="relative">
              <Icons.Quote className="absolute -left-2 -top-2 w-8 h-8 text-purple-500/10 rotate-180" />
              <p className="text-sm text-slate-200 leading-relaxed font-black uppercase tracking-wider pl-6 py-2 border-l border-purple-500/30">
                {insight}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-4 pl-6 py-2 border-l border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse" />
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic">
              Awaiting neural initialization...
            </p>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
