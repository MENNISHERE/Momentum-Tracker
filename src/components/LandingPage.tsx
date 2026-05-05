import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI Behavioral Coaching",
      description: "Our neural-linked AI analyzes your habits and provides real-time adjustments to your momentum strategy.",
      icon: <Icons.Brain className="w-6 h-6 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/20"
    },
    {
      title: "Visual Momentum Analytics",
      description: "Deep-dive into your behavioral patterns with high-fidelity heatmaps and progress velocity charts.",
      icon: <Icons.Activity className="w-6 h-6 text-purple-400" />,
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Cloud-Sync Persistence",
      description: "Your productivity data is synchronized across the global edge network with military-grade encryption.",
      icon: <Icons.Cloud className="w-6 h-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      title: "Focus State Optimization",
      description: "Integrated Pomodoro and deep-work timers designed to trigger and maintain peak flow states.",
      icon: <Icons.Target className="w-6 h-6 text-rose-400" />,
      color: "from-rose-500/20 to-orange-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-xl shadow-indigo-500/30 overflow-hidden">
            {/* Unique "Momentum Hex" Mark */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              {/* Left Half Hex */}
              <div 
                className="absolute left-0 w-3 h-5 bg-white/40"
                style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 75%, 0 25%)' }}
              />
              {/* Right Half Hex (Shifted Up) */}
              <div 
                className="absolute right-0 w-3 h-5 bg-white -translate-y-1 shadow-lg"
                style={{ clipPath: 'polygon(0 0, 100% 25%, 100% 75%, 0 100%)' }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            Momentum<span className="text-cyan-400">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/login')}
            className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-7xl lg:text-8xl font-black tracking-tight leading-[0.85] uppercase"
              >
                Master Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Momentum.
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/50 max-w-lg font-medium leading-relaxed"
              >
                The high-performance productivity ecosystem designed for those who demand excellence. Track habits, manage tasks, and optimize your focus with AI-driven insights.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => navigate('/login')}
                className="px-10 py-5 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95"
              >
                Initialize Access
              </button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                View Demo
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-12 pt-8"
            >
              <div className="space-y-1">
                <p className="text-2xl font-black text-white">12k+</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-white/30">Active Users</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="space-y-1">
                <p className="text-2xl font-black text-white">98%</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-white/30">Consistency Rate</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="space-y-1">
                <p className="text-2xl font-black text-white">24/7</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-white/30">AI Coaching</p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-[100px] rounded-full" />
            <div className="relative bg-[#111114] border border-white/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src="https://picsum.photos/seed/productivity/1200/800" 
                alt="Momentum Dashboard Preview" 
                className="rounded-[2rem] w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-10 bg-[#1a1a1e] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Icons.CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Habit Complete</p>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Morning Meditation</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 -right-10 bg-[#1a1a1e] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Icons.Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">12 Day Streak</p>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Momentum Multiplier: 1.5x</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

          {/* Features Grid */}
          <section className="relative z-10 py-32 px-8 max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-[10px] uppercase tracking-[0.5em] font-black text-cyan-400">Core_Systems</h2>
              <h3 className="text-5xl font-black uppercase tracking-tight">Engineered for <br /> Peak Performance</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative p-8 bg-[#111114] border border-white/5 rounded-3xl hover:border-white/20 transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                  <div className="relative space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-tight">{feature.title}</h4>
                      <p className="text-sm text-white/40 leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative z-10 py-32 px-8 max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[3rem] p-16 lg:p-24 overflow-hidden text-center space-y-12">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="relative space-y-6">
                <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none text-black">
                  Ready to enter <br /> the flow state?
                </h2>
                <p className="text-black/60 text-lg font-bold uppercase tracking-widest max-w-xl mx-auto">
                  Join thousands of high-performers who have mastered their momentum.
                </p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-12 py-6 bg-black text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95"
                >
                  Initialize Access Now
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 py-20 px-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icons.Orbit className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-black tracking-tighter uppercase italic">
                    Momentum<span className="text-cyan-400">.</span>
                  </h1>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-black text-white/20">
                  Stay Consistent • Built for Excellence
                </p>
              </div>
              
              <div className="flex gap-12">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Product</p>
                  <ul className="space-y-2 text-xs font-bold text-white/20 uppercase tracking-widest">
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">Features</li>
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">Pricing</li>
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">API</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Company</p>
                  <ul className="space-y-2 text-xs font-bold text-white/20 uppercase tracking-widest">
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">About</li>
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy</li>
                    <li className="hover:text-cyan-400 cursor-pointer transition-colors">Terms</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Icons.Github className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                <Icons.Twitter className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                <Icons.Instagram className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
            <div className="mt-20 text-center">
              <p className="text-[8px] uppercase tracking-[0.5em] font-black text-white/10">
                Momentum Productivity Ecosystem © 2026. All Rights Reserved.
              </p>
            </div>
          </footer>
        </div>
      );
    };
