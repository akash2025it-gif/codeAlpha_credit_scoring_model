import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  Building2, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { registerUser } from '../services/api';

export default function Register({ onRegisterSuccess, setActiveTab }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
    role: 'Credit Risk Analyst',
    department: 'Credit Underwriting & Risk'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Compute password strength (0 to 4 score)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department
      });
      if (onRegisterSuccess) {
        onRegisterSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please check inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-400 p-0.5 shadow-xl shadow-indigo-600/20 mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Risk Officer Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Join the CrediScore AI Underwriting Team
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Elena Rostova"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="elena_risk"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="elena.rostova@bankcorp.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role / Title
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Credit Risk Analyst">Credit Risk Analyst</option>
                <option value="Senior Underwriter">Senior Underwriter</option>
                <option value="Portfolio Risk Officer">Portfolio Risk Officer</option>
                <option value="Compliance Auditor">Compliance Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Retail Lending"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Security Strength:</span>
                <span className={`font-semibold font-mono ${strength.textColor}`}>{strength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                <div className={`rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                <div className={`rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`} />
                <div className={`rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                <div className={`rounded-full transition-all ${strength.score >= 4 ? strength.color : 'bg-slate-800'}`} />
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-0.5">
                <span className={formData.password.length >= 8 ? 'text-emerald-400 font-medium' : ''}>• 8+ chars</span>
                <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-400 font-medium' : ''}>• 1 uppercase</span>
                <span className={/[0-9]/.test(formData.password) ? 'text-emerald-400 font-medium' : ''}>• 1 number</span>
                <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-400 font-medium' : ''}>• 1 special char</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800 pt-5 text-center text-xs text-slate-400">
          <span>Already registered? </span>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
