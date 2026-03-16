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
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm processing your data. Let's focus on your next small win." }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the momentum grid right now. Focus on your most important habit for the next 10 minutes." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center border border-indigo-400/20"
      >
        <Icons.MessageSquare className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 z-50 w-[400px] h-[600px] glass-card flex flex-col shadow-2xl border-indigo-500/20 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-indigo-600/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Icons.Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Momentum AI Coach</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Analyzing Performance</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10">
                    <Icons.Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your coach anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
                >
                  <Icons.Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
