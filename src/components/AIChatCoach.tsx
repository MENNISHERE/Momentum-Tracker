import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, DayTasks, MentalState } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatCoachProps {
  habits: Habit[];
  tasks: DayTasks[];
  mentalState: MentalState[];
  weekDates: string[];
}

export const AIChatCoach: React.FC<AIChatCoachProps> = ({ habits, tasks, mentalState, weekDates }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Momentum Coach. I've analyzed your recent performance. How can I help you optimize your consistency today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
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
          focus: m.focus
        }))
      };

      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: `You are the Momentum AI Coach, a high-performance productivity expert. 
          Your goal is to help the user build consistency and achieve their goals using their data.
          
          User's Current Data:
          ${JSON.stringify(summary)}
          
          Guidelines:
          1. Be direct, professional, and encouraging.
          2. Use the user's specific habit names and task data to give advice.
          3. If they are struggling (low completion), suggest small "micro-wins".
          4. If they are succeeding, challenge them to level up.
          5. Keep responses concise and actionable.
          6. Your tone is "Elite Performance Coach" - like a mix of a supportive mentor and a data scientist.`,
        }
      });

      const response = await chat.sendMessage({ message: userMessage });
      if (isMounted.current) {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm processing your data. Let's focus on your next small win." }]);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      if (isMounted.current) {
        setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the momentum grid right now. Focus on your most important habit for the next 10 minutes." }]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 30px rgba(79, 70, 229, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center justify-center border border-indigo-400/30 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icons.MessageSquare className="w-7 h-7 relative z-10" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950 animate-pulse z-20" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40, x: 20 }}
            className="fixed bottom-28 right-8 z-50 w-[420px] h-[650px] glass-card flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border-indigo-500/20 overflow-hidden bg-slate-950/90 backdrop-blur-2xl rounded-[2rem]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-indigo-600/5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <Icons.Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-white">Momentum AI Coach</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Analyzing Performance</span>
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white border border-transparent hover:border-white/10"
              >
                <Icons.X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-950/20"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium border border-indigo-400/30' 
                      : 'bg-slate-900/80 text-slate-200 border border-white/5 rounded-tl-none font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/80 p-4 rounded-2xl rounded-tl-none border border-white/5 shadow-lg">
                    <Icons.Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/5 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend().catch(err => console.error("handleSend unhandled rejection:", err))}
                    placeholder="Ask your coach anything..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-inner"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend().catch(err => console.error("handleSend unhandled rejection:", err))}
                  disabled={loading || !input.trim()}
                  className="p-4 rounded-2xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
                >
                  <Icons.Send className="w-5 h-5 fill-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
