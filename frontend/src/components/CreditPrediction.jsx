import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Wallet, 
  User, 
  Briefcase, 
  Home, 
  Percent, 
  Loader2, 
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { submitPrediction } from '../api';

const DEFAULT_FORM = {
  applicant_name: "Alexander Vance",
  duration_in_month: 24,
  credit_amount: 4500,
  installment_rate_percent_income: 3,
  present_residence_since: 2,
  age_in_years: 34,
  number_existing_credits: 1,
  number_people_liable_maintenance: 1,
  status_existing_checking_account: "low_balance_under_200",
  credit_history: "existing_credits_paid_duly",
  purpose: "car_new",
  savings_account_bonds: "100_to_500",
  present_employment_since: "1_to_4_years",
  personal_status_and_sex: "male_single",
  other_debtors_guarantors: "none",
  property: "car_or_other",
  other_installment_plans: "none",
  housing: "own",
  job: "skilled_employee_official",
  telephone: "registered",
  foreign_worker: "no",
  model_name: "Random Forest"
};

export default function CreditPrediction({ initialPreset, onPredictionSuccess }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Sync with preset if loaded from Dashboard
  useEffect(() => {
    if (initialPreset) {
      setFormData(prev => ({
        ...prev,
        ...initialPreset
      }));
      setResult(null);
      setError(null);
    }
  }, [initialPreset]);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // Real-time quick financial estimates
  const estMonthlyPayment = formData.duration_in_month > 0
    ? (formData.credit_amount / formData.duration_in_month).toFixed(0)
    : 0;
  const ratePct = (formData.installment_rate_percent_income * 0.08);
  const estMonthlyIncome = ratePct > 0 ? (estMonthlyPayment / ratePct) : 0;
  const estAnnualIncome = (estMonthlyIncome * 12).toFixed(0);
  const estDti = estMonthlyIncome > 0 ? ((estMonthlyPayment / estMonthlyIncome) * 100).toFixed(1) : 0;
  const estLti = estAnnualIncome > 0 ? (formData.credit_amount / estAnnualIncome).toFixed(2) : 0;

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await submitPrediction(formData);
      setResult(response);
      if (onPredictionSuccess) {
        onPredictionSuccess(response);
      }
    } catch (err) {
      setError(err.message || "Failed to process credit prediction");
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setFormData(DEFAULT_FORM);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Credit Scoring & Risk Underwriting Form
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Input applicant financial information. All parameters match the underlying machine learning pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Form
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Financial Ratios Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Estimated Monthly Payment</span>
          <div className="text-lg font-bold text-white font-mono mt-0.5">${Number(estMonthlyPayment).toLocaleString()}/mo</div>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Estimated Annual Income</span>
          <div className="text-lg font-bold text-white font-mono mt-0.5">${Number(estAnnualIncome).toLocaleString()}</div>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Est. Debt-to-Income (DTI)</span>
          <div className={`text-lg font-bold font-mono mt-0.5 ${Number(estDti) > 28 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {estDti}%
          </div>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Est. Loan-to-Income (LTI)</span>
          <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{estLti}x</div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Prediction Failed</div>
            <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Result Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Applicant & Loan Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white font-bold text-sm">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <span>1. Requested Loan Terms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Applicant Name / ID</label>
                <input
                  type="text"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Loan Purpose</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="car_new">New Automobile</option>
                  <option value="car_used">Used Automobile</option>
                  <option value="furniture_equipment">Furniture / Equipment</option>
                  <option value="radio_television">Radio / Television</option>
                  <option value="domestic_appliances">Domestic Appliances</option>
                  <option value="repairs">Repairs & Maintenance</option>
                  <option value="education">Education / Tuition</option>
                  <option value="business">Business Investment</option>
                  <option value="retraining">Career Retraining</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Credit Amount ($ / DM)
                  <span className="text-[10px] text-slate-500 ml-1 font-mono">(Range: 250 - 50,000)</span>
                </label>
                <input
                  type="number"
                  name="credit_amount"
                  value={formData.credit_amount}
                  onChange={handleChange}
                  min={250}
                  max={50000}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Loan Duration
                  <span className="text-[10px] text-slate-500 ml-1 font-mono">(4 to 72 Months)</span>
                </label>
                <input
                  type="number"
                  name="duration_in_month"
                  value={formData.duration_in_month}
                  onChange={handleChange}
                  min={4}
                  max={72}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financial Reserves & Banking */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white font-bold text-sm">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>2. Banking & Liquid Reserves</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Checking Account Balance</label>
                <select
                  name="status_existing_checking_account"
                  value={formData.status_existing_checking_account}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="high_balance_over_200">High Balance (&gt;= 200 DM / Regular Salary)</option>
                  <option value="low_balance_under_200">Modest Balance (&lt; 200 DM)</option>
                  <option value="no_checking_account">No Checking Account</option>
                  <option value="negative_balance">Negative / Overdrawn Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Savings Account & Bonds</label>
                <select
                  name="savings_account_bonds"
                  value={formData.savings_account_bonds}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="over_1000">&gt;= 1,000 DM (Substantial Reserve)</option>
                  <option value="500_to_1000">500 to 1,000 DM (Solid Buffer)</option>
                  <option value="100_to_500">100 to 500 DM (Modest)</option>
                  <option value="under_100">&lt; 100 DM (Minimal)</option>
                  <option value="unknown_or_no_savings">Unknown or No Savings Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Installment Rate Bracket</label>
                <select
                  name="installment_rate_percent_income"
                  value={formData.installment_rate_percent_income}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1: Very Low (&lt; 20% of Disposable Income)</option>
                  <option value={2}>2: Low (20% - 25% of Disposable Income)</option>
                  <option value={3}>3: Moderate (25% - 35% of Disposable Income)</option>
                  <option value={4}>4: High (&gt; 35% of Disposable Income)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Credit History Track Record</label>
                <select
                  name="credit_history"
                  value={formData.credit_history}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="existing_credits_paid_duly">Existing credits paid duly till now</option>
                  <option value="all_credits_paid_bank">All credits at this bank paid back duly</option>
                  <option value="no_credits_all_paid">No prior credits / all paid back duly</option>
                  <option value="delay_in_paying_past">Delay in paying off obligations in past</option>
                  <option value="critical_account">Critical account / other credits existing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Employment & Demographics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white font-bold text-sm">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>3. Employment, Demographics & Collateral</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Employment Tenure</label>
                <select
                  name="present_employment_since"
                  value={formData.present_employment_since}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="over_7_years">&gt;= 7 Years</option>
                  <option value="4_to_7_years">4 to 7 Years</option>
                  <option value="1_to_4_years">1 to 4 Years</option>
                  <option value="under_1_year">&lt; 1 Year</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age in Years</label>
                <input
                  type="number"
                  name="age_in_years"
                  value={formData.age_in_years}
                  onChange={handleChange}
                  min={18}
                  max={95}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Housing Status</label>
                <select
                  name="housing"
                  value={formData.housing}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="own">Homeowner (Own)</option>
                  <option value="rent">Rented Housing</option>
                  <option value="for_free">Living for Free</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Primary Property / Asset</label>
                <select
                  name="property"
                  value={formData.property}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="real_estate">Real Estate</option>
                  <option value="building_society_life_insurance">Building Society / Life Insurance</option>
                  <option value="car_or_other">Automobile or Other Asset</option>
                  <option value="unknown_no_property">Unknown / No Property</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Number of Credits</label>
                <input
                  type="number"
                  name="number_existing_credits"
                  value={formData.number_existing_credits}
                  onChange={handleChange}
                  min={1}
                  max={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dependents Liable</label>
                <input
                  type="number"
                  name="number_people_liable_maintenance"
                  value={formData.number_people_liable_maintenance}
                  onChange={handleChange}
                  min={1}
                  max={5}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Model Choice & Submission */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Underwriting Model</span>
              </div>
              <span className="text-[11px] text-slate-400">Select model engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["Random Forest", "Logistic Regression", "Decision Tree"].map((m) => (
                <label
                  key={m}
                  className={`p-3 rounded-lg border cursor-pointer flex flex-col justify-between transition-all ${
                    formData.model_name === m
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{m}</span>
                    <input
                      type="radio"
                      name="model_name"
                      value={m}
                      checked={formData.model_name === m}
                      onChange={handleChange}
                      className="text-indigo-600 focus:ring-0"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {m === 'Random Forest' ? 'Recommended (Best ROC-AUC)' : m === 'Logistic Regression' ? 'Linear baseline' : 'Interpretable Tree'}
                  </span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Credit Risk...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run Credit Scoring Model</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Result Display Column */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl sticky top-20 animate-fadeIn">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  ML Evaluation Result
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Model: {result.model_used}
                </span>
              </div>

              {/* Decision Hero Banner */}
              <div className={`p-5 rounded-xl border text-center ${
                result.prediction === 1
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <div className="inline-flex p-3 rounded-full bg-slate-900/80 mb-2">
                  {result.prediction === 1 ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                  )}
                </div>
                <h3 className="text-2xl font-black tracking-tight">{result.prediction_label}</h3>
                <p className="text-xs mt-1 text-slate-300">
                  Risk Category: <strong className="text-white">{result.risk_category}</strong>
                </p>
              </div>

              {/* FICO-Equivalent Credit Score Gauge */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Standardized Credit Score</span>
                <div className="text-4xl font-extrabold text-white font-mono my-1 tracking-tight">
                  {result.risk_score}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between max-w-xs mx-auto mb-2 font-mono">
                  <span>300 (Poor)</span>
                  <span>580 (Fair)</span>
                  <span>670 (Good)</span>
                  <span>850 (Exceptional)</span>
                </div>
                {/* Meter Bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      result.risk_score >= 670 ? 'bg-emerald-500' : result.risk_score >= 580 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${((result.risk_score - 300) / 550) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Model Approval Confidence: <strong className="text-white">{(result.probability * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {/* Key Contributing Drivers */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Key Decision Drivers
                </h4>
                <div className="space-y-2">
                  {result.key_drivers?.map((driver, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-start gap-2.5 text-xs"
                    >
                      {driver.impact === 'positive' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">{driver.feature}</div>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{driver.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated Financial Ratios Summary */}
              {result.financial_ratios && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-2">
                    Verified Financial Ratios
                  </span>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Debt-to-Income (DTI):</span>
                    <span className="font-mono text-white font-semibold">{result.financial_ratios.debt_to_income_ratio}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Loan-to-Income (LTI):</span>
                    <span className="font-mono text-white font-semibold">{result.financial_ratios.loan_to_income_ratio}x</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Financial Resilience:</span>
                    <span className="font-mono text-indigo-400 font-semibold">{result.financial_ratios.financial_resilience_score} / 10</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Monthly Payment Burden:</span>
                    <span className="font-mono text-white font-semibold">${result.financial_ratios.monthly_installment}</span>
                  </div>
                </div>
              )}

              {result.history_record_id && (
                <p className="text-[11px] text-slate-500 text-center">
                  Logged to SQLite Audit Trail as Record #{result.history_record_id}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Awaiting Application Submission</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
                Fill out the applicant financial details or select a preset scenario from the Dashboard, then click <strong>Run Credit Scoring Model</strong>.
              </p>
              <div className="text-[11px] text-indigo-400 font-medium">
                Predictions are generated by the real trained scikit-learn models.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
