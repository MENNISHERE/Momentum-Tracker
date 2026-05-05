import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusTimerProps {
  onComplete?: () => void;
  totalSessions?: number;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onComplete, totalSessions = 0 }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (mode === 'work') {
        if (onComplete) onComplete();
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        y: -5,
        borderColor: "rgba(168, 85, 247, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.02)"
      }}
      className="glass-card p-6 bg-white/[0.01] border-cyan-500/10 relative overflow-hidden group glow-border"
    >
      {/* Progress bar at the top */}
      <div className="absolute top-0 left-0 h-1 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" style={{ width: `${100 - progress}%` }} />
      
      {/* Background glow */}
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full group-hover:bg-cyan-500/10 transition-colors" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Icons.Timer className="w-4 h-4 text-cyan-400 animate-pulse" />
            Focus Protocol
          </h3>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em] ml-6">
            Temporal isolation unit
          </p>
        </div>
        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border transition-all ${mode === 'work' ? 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'}`}>
          {mode}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="text-6xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] bg-black px-3 py-1 rounded border border-white/5">
          <Icons.Award className="w-3 h-3 text-yellow-500" />
          Sessions: {totalSessions}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)" }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTimer}
            className="p-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 border border-cyan-400/30"
          >
            {isActive ? <Icons.Pause className="w-6 h-6 fill-slate-950" /> : <Icons.Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="p-4 rounded-xl bg-black hover:bg-white/5 text-slate-500 transition-all border border-white/10 shadow-inner"
          >
            <Icons.RotateCcw className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
