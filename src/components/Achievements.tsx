import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Trophy className="w-5 h-5 text-yellow-400" />
          Achievements
        </h2>
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {achievements.map((achievement, idx) => {
          const IconComponent = (Icons as any)[achievement.icon] || Icons.Circle;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-2xl border transition-all text-center space-y-3 relative overflow-hidden group ${
                achievement.unlocked 
                  ? 'bg-yellow-500/10 border-yellow-500/20' 
                  : 'bg-white/5 border-white/5 grayscale opacity-50'
              }`}
            >
              {achievement.unlocked && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-500/20 rounded-bl-lg flex items-center justify-center">
                  <Icons.Check className="w-4 h-4 text-yellow-500" />
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${
                achievement.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-slate-500'
              }`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-xs font-black uppercase tracking-wider ${
                  achievement.unlocked ? 'text-white' : 'text-slate-500'
                }`}>
                  {achievement.title}
                </h3>
                <p className="text-[9px] text-slate-500 font-medium leading-tight">
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
