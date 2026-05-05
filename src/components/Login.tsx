import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const fromCheckout = query.get('from') === 'checkout' || query.get('status') === 'success';
  const receiptId = query.get('receipt_id');
  const revoked = query.get('revoked') === 'true';
  const membershipId = query.get('membership_id');

  const SALES_PAGE_URL = "https://momentum-sale.netlify.app";

  useEffect(() => {
    let mounted = true;
    if (membershipId) {
      handleInstantLogin(membershipId, mounted).catch(err => {
        if (mounted) console.error("handleInstantLogin unhandled rejection:", err);
      });
    }
    return () => { mounted = false; };
  }, [membershipId]);

  const handleInstantLogin = async (id: string, mounted: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/auth/whop-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: id }),
      });

      if (!mounted) return;

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        if (mounted) setError(data.error || 'Instant login failed. Please try manual login.');
      }
    } catch (err: any) {
      if (mounted) {
        console.error("Instant login error:", err);
        setError(`Connection error during instant login: ${err.message}`);
      }
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          navigate('/dashboard');
        } else {
          if (res.status === 404) {
            setError(`API Error (404): The login route was not found. This usually means the server is still starting or misconfigured. Please wait 10 seconds and try again.`);
          } else {
            if (data.error === 'no valid membership') {
              setError(
                <span className="flex items-center flex-wrap gap-1">
                  No active membership detected. Unlock premium access{' '}
                  <a 
                    href={SALES_PAGE_URL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="relative inline-flex items-center group px-2 py-0.5"
                  >
                    <span className="relative z-10 font-black text-cyan-400 group-hover:text-white transition-colors duration-300">here.</span>
                    <motion.span 
                      className="absolute inset-0 bg-cyan-400/20 rounded-md -z-0"
                      animate={{ 
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.span 
                      className="absolute inset-0 border border-cyan-400/50 rounded-md -z-0"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      style={{ backgroundSize: '200% 200%' }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </a>
                </span>
              );
            } else {
              setError(data.error || 'Login failed');
            }
          }
        }
      } else {
        const text = await res.text();
        console.error("Server returned non-JSON:", text);
        if (res.status === 404) {
          setError("Server error (404): The backend server is not responding to this request. It might be restarting.");
        } else {
          setError(`Server error (${res.status}). Please check the console for details.`);
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(`Connection error: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showFingerprintInfo, setShowFingerprintInfo] = useState(false);

  return (
    <div className={`min-h-screen transition-all duration-700 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#f8fafc] text-slate-900'} font-sans selection:bg-cyan-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
      
      {/* Background Ambient Glows - Matching the "Momentum" atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ${isDarkMode ? 'bg-cyan-500/10 opacity-100' : 'bg-cyan-500/5 opacity-30'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ${isDarkMode ? 'bg-purple-500/10 opacity-100' : 'bg-purple-500/5 opacity-30'}`} />
        
        {/* Grid Overlay */}
        <div className={`absolute inset-0 opacity-[0.03] ${isDarkMode ? 'invert-0' : 'invert'}`} style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Top Navigation Bar Style */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
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

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`group relative p-2 px-4 rounded-full border transition-all duration-300 flex items-center gap-3 ${
            isDarkMode 
              ? 'bg-[#111114] border-white/5 text-white/40 hover:text-white hover:border-white/20' 
              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="relative w-4 h-4">
            <motion.div
              animate={{ rotate: isDarkMode ? 0 : 180, opacity: isDarkMode ? 1 : 0 }}
              className="absolute inset-0"
            >
              <Icons.Moon className="w-4 h-4" />
            </motion.div>
            <motion.div
              animate={{ rotate: isDarkMode ? -180 : 0, opacity: isDarkMode ? 0 : 1 }}
              className="absolute inset-0"
            >
              <Icons.Sun className="w-4 h-4" />
            </motion.div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black">
            {isDarkMode ? 'Dark_Active' : 'Light_Active'}
          </span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        {/* Main Login Card */}
        <div className={`relative transition-all duration-500 rounded-[2.5rem] p-12 space-y-12 ${
          isDarkMode 
            ? 'bg-[#111114] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]' 
            : 'bg-white border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]'
        }`}>
          
          {/* Card Header */}
          <div className="space-y-4">
            <h2 className={`text-4xl font-black tracking-tight leading-[1.1] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Welcome to the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300">Inner Circle, Champion.</span>
            </h2>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
              Your high-performance environment is ready.
            </p>
          </div>

          <div className="space-y-8">
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {(fromCheckout || revoked || error) ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-[10px] uppercase tracking-widest font-black py-4 px-6 rounded-2xl border text-center ${
                        fromCheckout 
                          ? (isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600')
                          : (isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600')
                      }`}
                    >
                      {fromCheckout ? 'Identity_Verified // Access_Granted' : (revoked ? 'Access_Revoked // Denied' : error)}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-blue-900/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}
                    >
                      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Security Protocol</h4>
                      <p className={`text-[11px] font-bold leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                        To ensure data integrity, please authenticate using the exact same email associated with your payment.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            <form 
              onSubmit={(e) => {
                handleLogin(e).catch(err => console.error("handleLogin unhandled rejection:", err));
              }} 
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <label className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                    Laboratory_ID
                  </label>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setShowFingerprintInfo(!showFingerprintInfo)}
                      whileHover={{ scale: 1.2, color: '#22d3ee' }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className={`p-1 rounded-lg transition-colors cursor-help ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`}
                    >
                      <Icons.Fingerprint className="w-5 h-5" />
                    </motion.button>
                    <AnimatePresence>
                      {!showFingerprintInfo && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: [0.3, 0.7, 0.3],
                            x: 0 
                          }}
                          transition={{ 
                            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            x: { duration: 0.5 }
                          }}
                          className={`text-[8px] uppercase tracking-[0.2em] font-black pointer-events-none ${isDarkMode ? 'text-cyan-400/40' : 'text-cyan-600/60'}`}
                        >
                          Click_Me
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <AnimatePresence>
                  {showFingerprintInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="overflow-hidden"
                    >
                      <div className={`mb-4 p-4 rounded-xl border text-[10px] uppercase tracking-widest font-black leading-relaxed ${
                        isDarkMode ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400/80' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1 h-1 rounded-full bg-current" />
                          <span>Input Requirement</span>
                        </div>
                        Please enter the email address associated with your Whop membership to initialize your session.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@momentum.sys"
                    required
                    className={`w-full transition-all duration-300 rounded-2xl px-7 py-5 text-sm font-bold focus:outline-none ring-offset-transparent ${
                      isDarkMode 
                        ? 'bg-[#1a1a1e] border border-white/5 text-white placeholder:text-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10' 
                        : 'bg-slate-100 border border-transparent text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/5'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 ${isDarkMode ? 'shadow-[0_0_30px_rgba(34,211,238,0.1)]' : ''}`} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-6 rounded-2xl text-[11px] uppercase tracking-[0.5em] font-black transition-all duration-500 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-20 relative overflow-hidden group ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-cyan-400' 
                    : 'bg-slate-900 text-white hover:bg-black shadow-xl'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {loading ? (
                  <Icons.Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">Initialize Tracker</span>
                    <Icons.ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-10 flex flex-col items-center gap-12">
              <div className="flex flex-col items-center gap-4">
                <span className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDarkMode ? 'text-white/10' : 'text-slate-300'}`}>
                  No_License_Detected?
                </span>
                <a 
                  href={SALES_PAGE_URL} 
                  className={`group relative text-xs font-black uppercase tracking-widest transition-all duration-300 pb-1 ${
                    isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Acquire_Access
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              </div>

              <div className="w-full text-center">
                <button 
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className={`text-[10px] uppercase tracking-[0.2em] font-black transition-colors duration-300 ${
                    isDarkMode ? 'text-white/10 hover:text-white/40' : 'text-slate-200 hover:text-slate-400'
                  }`}
                >
                  {showTroubleshooting ? '[ Close_Diagnostics ]' : '[ Run_Diagnostics ]'}
                </button>

                <AnimatePresence>
                  {showTroubleshooting && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`mt-8 space-y-8 text-left p-10 rounded-[2rem] border transition-all duration-500 ${
                        isDarkMode 
                          ? 'bg-black/40 border-white/5' 
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-cyan-400" />
                            <span className={`text-[9px] uppercase tracking-widest font-black ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
                              Connectivity_Node
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed font-bold uppercase tracking-tight ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                            Laboratory nodes are operational. Cold boot may require up to 15 seconds for session initialization.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-400" />
                            <span className={`text-[9px] uppercase tracking-widest font-black ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
                              Identity_Sync
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed font-bold uppercase tracking-tight ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                            Ensure your Whop credentials are active and synchronized with the global edge network.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding - Matching the screenshot */}
      <div className="mt-12 text-center space-y-4 relative z-10">
        <div className="flex items-center justify-center gap-6 opacity-20">
          <Icons.Github className="w-4 h-4" />
          <Icons.Twitter className="w-4 h-4" />
          <Icons.Instagram className="w-4 h-4" />
        </div>
        <p className={`text-[9px] uppercase tracking-[0.4em] font-black ${isDarkMode ? 'text-white/10' : 'text-slate-300'}`}>
          Momentum Habit Tracker © 2026 • Stay Consistent • Built for Excellence
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className={`text-[8px] uppercase tracking-[0.2em] font-bold ${isDarkMode ? 'text-emerald-500/40' : 'text-emerald-600/60'}`}>System Operational</span>
        </div>
      </div>
    </div>
  );
};
