import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <div className="glass-card p-8 bg-slate-950/40 border-yellow-500/10 relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-yellow-500/5 blur-3xl rounded-full group-hover:bg-yellow-500/10 transition-colors" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Icons.Trophy className="w-4 h-4 animate-bounce" />
          Achievements
        </h2>
        <div className="px-3 py-1 rounded-full bg-slate-950 border border-white/5 text-[9px] text-slate-500 font-black uppercase tracking-widest shadow-inner">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        {achievements.map((achievement, idx) => {
          const IconComponent = (Icons as any)[achievement.icon] || Icons.Circle;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ 
                y: -5,
                boxShadow: achievement.unlocked ? "0 10px 30px -10px rgba(234, 179, 8, 0.2)" : "none",
                borderColor: achievement.unlocked ? "rgba(234, 179, 8, 0.3)" : "rgba(255,255,255,0.1)"
              }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-2xl border transition-all text-center space-y-4 relative overflow-hidden group/item ${
                achievement.unlocked 
                  ? 'bg-yellow-500/5 border-yellow-500/20' 
                  : 'bg-slate-950/40 border-white/5 grayscale opacity-40'
              }`}
            >
              {achievement.unlocked && (
                <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-500/20 rounded-bl-lg flex items-center justify-center">
                  <Icons.Check className="w-3 h-3 text-yellow-500" />
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover/item:scale-110 ${
                achievement.unlocked ? 'bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20' : 'bg-slate-950 text-slate-600'
              }`}>
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className={`text-[10px] font-black uppercase tracking-widest leading-tight ${
                  achievement.unlocked ? 'text-white' : 'text-slate-600'
                }`}>
                  {achievement.title}
                </h3>
                <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                  {achievement.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
