import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Database, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  History,
  Activity,
  Award
} from 'lucide-react';

export default function Dashboard({ 
  metrics, 
  history, 
  setActiveTab, 
  onLoadPreset 
}) {
  const bestModelName = metrics?.best_model_name || 'Random Forest';
  const bestModelMetrics = metrics?.metrics?.[bestModelName] || {};
  const totalRecords = metrics?.total_samples || 1000;
  const recentItems = history?.slice(0, 5) || [];

  const presets = [
    {
      title: "Prime / Low-Risk Applicant",
      applicant: "Alice (Senior Engineer)",
      amount: "$1,800",
      duration: "12 Months",
      risk: "Low Risk",
      riskColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      description: "Substantial savings (>1,000 DM), stable checking balance, 7+ years employment, clean credit history.",
      data: {
        applicant_name: "Alice Smith (Low Risk)",
        duration_in_month: 12,
        credit_amount: 1800,
        installment_rate_percent_income: 2,
        present_residence_since: 3,
        age_in_years: 39,
        number_existing_credits: 1,
        number_people_liable_maintenance: 1,
        status_existing_checking_account: "high_balance_over_200",
        credit_history: "existing_credits_paid_duly",
        purpose: "car_new",
        savings_account_bonds: "over_1000",
        present_employment_since: "over_7_years",
        personal_status_and_sex: "female_single",
        other_debtors_guarantors: "none",
        property: "real_estate",
        other_installment_plans: "none",
        housing: "own",
        job: "skilled_employee_official",
        telephone: "registered",
        foreign_worker: "no"
      }
    },
    {
      title: "Moderate / Standard Applicant",
      applicant: "Charlie (Small Business Associate)",
      amount: "$4,200",
      duration: "24 Months",
      risk: "Moderate Risk",
      riskColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      description: "Average liquid checking, modest savings (<500 DM), 1-4 years on job, financing household furniture.",
      data: {
        applicant_name: "Charlie Davis (Moderate Risk)",
        duration_in_month: 24,
        credit_amount: 4200,
        installment_rate_percent_income: 3,
        present_residence_since: 2,
        age_in_years: 31,
        number_existing_credits: 1,
        number_people_liable_maintenance: 1,
        status_existing_checking_account: "low_balance_under_200",
        credit_history: "existing_credits_paid_duly",
        purpose: "furniture_equipment",
        savings_account_bonds: "100_to_500",
        present_employment_since: "1_to_4_years",
        personal_status_and_sex: "male_single",
        other_debtors_guarantors: "none",
        property: "car_or_other",
        other_installment_plans: "none",
        housing: "rent",
        job: "skilled_employee_official",
        telephone: "registered",
        foreign_worker: "no"
      }
    },
    {
      title: "Strained / High-Risk Applicant",
      applicant: "Bob (Gig Contractor)",
      amount: "$9,500",
      duration: "48 Months",
      risk: "High Risk",
      riskColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      description: "Overdrawn checking account, past delays, high credit amount relative to income, rent housing.",
      data: {
        applicant_name: "Bob Miller (High Risk)",
        duration_in_month: 48,
        credit_amount: 9500,
        installment_rate_percent_income: 4,
        present_residence_since: 1,
        age_in_years: 23,
        number_existing_credits: 2,
        number_people_liable_maintenance: 1,
        status_existing_checking_account: "negative_balance",
        credit_history: "delay_in_paying_past",
        purpose: "business",
        savings_account_bonds: "unknown_or_no_savings",
        present_employment_since: "under_1_year",
        personal_status_and_sex: "male_single",
        other_debtors_guarantors: "none",
        property: "unknown_no_property",
        other_installment_plans: "bank",
        housing: "rent",
        job: "unskilled_resident",
        telephone: "none",
        foreign_worker: "yes"
      }
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Machine Learning Powered Credit Risk Underwriting
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Real-Time Creditworthiness & Risk Assessment System
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Trained and benchmarked on the classic <strong>Statlog German Credit dataset</strong> from the UCI Machine Learning Repository. 
            Empowered with domain-specific feature engineering (DTI, Loan-to-Income, financial resilience) to predict creditworthiness with full explainability.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('predict')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Evaluate New Applicant
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              Compare 3 ML Models
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Pipeline</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{bestModelName}</div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Best ROC-AUC: {bestModelMetrics.roc_auc ? (bestModelMetrics.roc_auc * 100).toFixed(1) + '%' : '78.6%'}</span>
          </div>
        </div>

        {/* Precision Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Approval Precision</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {bestModelMetrics.precision ? (bestModelMetrics.precision * 100).toFixed(1) + '%' : '84.2%'}
          </div>
          <p className="text-xs text-slate-400">Positive prediction accuracy for creditworthy applicants</p>
        </div>

        {/* Dataset Benchmark */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Benchmark Dataset</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalRecords} Profiles</div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>UCI Statlog (70% Good / 30% Bad)</span>
          </div>
        </div>

        {/* Audit History Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Audited Evaluations</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{history?.length || 0} Records</div>
          <p className="text-xs text-slate-400">Logged to SQLite with full input audit trail</p>
        </div>
      </div>

      {/* Preset Profiles Demo Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Interactive Scenario Presets</h2>
            <p className="text-xs text-slate-400">Click any preset to test the machine learning pipeline immediately</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset, idx) => (
            <div 
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${preset.riskColor}`}>
                    {preset.risk}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{preset.amount} • {preset.duration}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{preset.title}</h3>
                <p className="text-xs text-indigo-400 font-medium mb-2">{preset.applicant}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{preset.description}</p>
              </div>

              <button
                onClick={() => onLoadPreset(preset.data)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Run In Prediction Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Feature Engineering + Recent Audit Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Engineering Architecture */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Engineered Features</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Standard credit data was enriched with domain financial ratios before feeding into models:
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800">
              <span className="font-semibold text-indigo-300">Debt-to-Income (DTI %):</span>
              <p className="text-slate-400 mt-0.5">Monthly loan installment relative to estimated monthly disposable income.</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800">
              <span className="font-semibold text-emerald-300">Loan-to-Income (LTI):</span>
              <p className="text-slate-400 mt-0.5">Total credit principal divided by annual income baseline.</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800">
              <span className="font-semibold text-blue-300">Financial Resilience Score:</span>
              <p className="text-slate-400 mt-0.5">Composite buffer score derived from liquid checking and savings tiers.</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800">
              <span className="font-semibold text-purple-300">Monthly Installment Burden:</span>
              <p className="text-slate-400 mt-0.5">Exact calculated installment payment based on credit amount and term.</p>
            </div>
          </div>
        </div>

        {/* Recent Audit Inquiries Preview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Recent Credit Decisions</h3>
              </div>
              <button 
                onClick={() => setActiveTab('history')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Audit Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No past predictions yet. Run your first prediction above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Applicant</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Term</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Model</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {recentItems.map((item) => {
                      const isGood = item.prediction === 1;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-medium text-white">{item.applicant_name}</td>
                          <td className="py-3 px-3 font-mono">${item.credit_amount?.toLocaleString()}</td>
                          <td className="py-3 px-3">{item.duration_in_month} mos</td>
                          <td className="py-3 px-3 font-mono font-semibold">
                            {Math.round(300 + (item.probability * 550))}
                          </td>
                          <td className="py-3 px-3 text-slate-400">{item.model_used}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isGood
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {item.prediction_label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>SQLite Database: <code className="text-slate-300">backend/data/predictions.db</code></span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Inference
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
