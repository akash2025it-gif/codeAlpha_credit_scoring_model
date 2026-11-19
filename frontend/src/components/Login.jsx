import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  KeyRound,
  Building2
} from 'lucide-react';
import { loginUser } from '../services/api';

export default function Login({ onLoginSuccess, setActiveTab }) {
  const [identifier, setIdentifier] = useState('demo_analyst');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please provide your username/email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(identifier.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('demo_analyst');
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-400 p-0.5 shadow-xl shadow-indigo-600/20 mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Sign In to CrediScore AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Enterprise Credit Underwriting & Automated Risk Scoring Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Quick Demo Credentials Banner */}
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Demo Portfolio Reviewer Account
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Username: <code className="text-slate-200 font-mono">demo_analyst</code> • Password: <code className="text-slate-200 font-mono">Password@123</code>
            </p>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="analyst@crediscore.ai"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In as Risk Officer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800 pt-5 text-center text-xs text-slate-400">
          <span>Don't have an analyst account yet? </span>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
          >
            Register a new account
          </button>
        </div>
      </div>
    </div>
  );
}
