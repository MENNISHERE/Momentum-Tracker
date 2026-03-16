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
      whileHover={{ y: -5 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 h-1 bg-cyan-500 transition-all duration-1000" style={{ width: `${100 - progress}%` }} />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Icons.Timer className="w-4 h-4 text-cyan-400" />
          Focus Session
        </h3>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${mode === 'work' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
          {mode}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl font-black tabular-nums tracking-tighter text-white">
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Total Sessions: {totalSessions}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTimer}
            className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          >
            {isActive ? <Icons.Pause className="w-5 h-5" /> : <Icons.Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={resetTimer}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all border border-white/10"
          >
            <Icons.RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
