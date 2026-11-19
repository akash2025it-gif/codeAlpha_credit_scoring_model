import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Layers, 
  Calendar, 
  DollarSign, 
  Activity, 
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function PredictionResultView({ result, onBackToForm, onNavigateHistory }) {
  if (!result) return null;

  const isCreditworthy = result.prediction_code === 1;
  const score = result.risk_score || Math.round(300 + (result.probability * 550));
  const probPct = (result.probability * 100).toFixed(1);
  const ratios = result.financial_ratios || {};

  // Score meter percentage for arc/bar (300 to 850 scale -> 0% to 100%)
  const scorePercent = Math.max(0, Math.min(100, ((score - 300) / 550) * 100));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <button
          onClick={onBackToForm}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Evaluate Another Applicant
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Print / Export Underwriting Report
          </button>
          <button
            onClick={onNavigateHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            View In Audit History
          </button>
        </div>
      </div>

      {/* Main Decision Banner */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-2xl ${
        isCreditworthy
          ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/40'
          : 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border-rose-500/40'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isCreditworthy
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {isCreditworthy ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                Decision: {result.prediction}
              </span>
              <span className="text-xs text-slate-400">Model: <strong className="text-white">{result.model_used}</strong></span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isCreditworthy ? 'Application Recommended for Approval' : 'Application Flagged as Elevated Credit Risk'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {/* Credit Score Gauge Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center min-w-[240px] shadow-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Standardized Credit Score
            </span>
            <div className="text-5xl font-black font-mono tracking-tight text-white mb-2">
              {score}
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  isCreditworthy ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-3">
              <span>300 (Poor)</span>
              <span>850 (Exceptional)</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-300">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Risk Tier: {result.risk_level} Risk</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 font-mono">
              Approval Confidence: {probPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Key Financial Ratios Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Debt-to-Income (DTI)</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {ratios.debt_to_income_ratio || 0}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Calculated monthly payment vs income</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Loan-to-Income (LTI)</span>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            {ratios.loan_to_income_ratio || 0}x
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Requested principal vs annual income</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Monthly Installment</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${ratios.monthly_installment ? ratios.monthly_installment.toLocaleString() : 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Required monthly service amount</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Financial Resilience</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {ratios.financial_resilience_score || 0}/10
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Checking & savings buffer score</p>
        </div>
      </div>

      {/* Explainable Decision Drivers */}
      {result.key_drivers && result.key_drivers.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Underwriting Decision Drivers (Explainable AI)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Regulatory compliance rationale highlighting the primary positive and negative contributors to this machine learning outcome:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {result.key_drivers.map((driver, idx) => {
              const isPos = driver.impact === 'positive';
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    isPos
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isPos ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{driver.feature}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                        isPos ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {driver.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {driver.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Disclaimer Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          {result.disclaimer || "CrediScore AI is an educational machine-learning demonstration and underwriting simulation platform. Standardized credit scores (300-850) are mathematically projected from out-of-sample logistic and random forest class probabilities."}
        </p>
      </div>
    </div>
  );
}
