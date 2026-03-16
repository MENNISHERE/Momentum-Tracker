import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setServerStatus('online');
        else setServerStatus('offline');
      } catch (err) {
        setServerStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const query = new URLSearchParams(location.search);
  const fromCheckout = query.get('from') === 'checkout' || query.get('status') === 'success';
  const receiptId = query.get('receipt_id');
  const revoked = query.get('revoked') === 'true';

  const SALES_PAGE_URL = "https://whop.com/checkout/plan_LmpKdB61bva3r";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          navigate('/');
        } else {
          if (res.status === 404) {
            setError(`API Error (404): The login route was not found. This usually means the server is still starting or misconfigured. Please wait 10 seconds and try again.`);
          } else {
            setError(data.error === 'no valid membership' 
              ? `No active membership found. Purchase access at ${SALES_PAGE_URL}`
              : data.error || 'Login failed');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 space-y-8 relative z-10 border-white/10"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-4">
            <Icons.Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-syne font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Momentum .
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 
              serverStatus === 'offline' ? 'bg-rose-500' : 'bg-slate-500'
            }`} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {serverStatus === 'online' ? 'Server Online' : 
               serverStatus === 'offline' ? 'Server Offline (Restarting...)' : 'Checking Server...'}
            </p>
          </div>
          <p className="text-slate-400 font-medium">Access your performance lab</p>
        </div>

        {fromCheckout && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Icons.CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Payment successful! Log in with the email you used to pay.</span>
            </div>
            {receiptId && (
              <span className="text-[10px] opacity-60 ml-8 uppercase tracking-widest">
                Receipt ID: {receiptId}
              </span>
            )}
          </div>
        )}

        {revoked && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold flex items-center gap-3">
            <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>Your access has been revoked. Membership may have been cancelled or refunded.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-3">
            <Icons.XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative">
              <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Icons.Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Login</span>
                <Icons.ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-slate-500 text-sm">
            Don't have access?{' '}
            <a 
              href={SALES_PAGE_URL} 
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              Buy here
            </a>
          </p>

          <button 
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors"
          >
            {showTroubleshooting ? 'Hide Troubleshooting' : 'Need help? Troubleshooting Guide'}
          </button>

          <AnimatePresence>
            {showTroubleshooting && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-left bg-white/5 rounded-xl p-4 border border-white/5 space-y-3 overflow-hidden"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Error 404 / Offline</p>
                  <p className="text-[11px] text-slate-400">The server is likely restarting. Wait 10-20 seconds and refresh the page.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Error 500 / Config</p>
                  <p className="text-[11px] text-slate-400">Ensure WHOP_API_KEY and WHOP_COMPANY_ID are set in the Settings &gt; Secrets tab.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">No Membership</p>
                  <p className="text-[11px] text-slate-400">Use the exact email you used on Whop. Check if your subscription is active.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
