import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  Database, 
  Layers, 
  ShieldCheck, 
  Scale, 
  GitBranch, 
  CheckCircle2, 
  FileCode2,
  Lock
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          Technical Documentation & Methodology
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI-Based Credit Scoring & Creditworthiness Prediction System
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          An internship-level machine learning underwriting system built with Python, scikit-learn, FastAPI, SQLite, and React.
        </p>
      </div>

      {/* Section 1: Executive Summary & Problem Statement */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h2>1. Project Objective & Problem Statement</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Traditional credit evaluation often relies on static manual rules or rigid linear cutoff scorecards that fail to capture subtle non-linear interactions across borrower debt burdens, liquid buffers, and historical payment discipline. 
          The goal of this project is to build an explainable, end-to-end Machine Learning credit underwriting platform that predicts whether a prospective loan applicant is creditworthy based on verified historical financial profiles.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-indigo-400 block mb-1">Empirical Science</span>
            <p className="text-[11px] text-slate-400">Strictly trained on real historical financial data. Zero hardcoded or random prediction logic.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-emerald-400 block mb-1">Multi-Model Benchmark</span>
            <p className="text-[11px] text-slate-400">Trains and evaluates Logistic Regression, Decision Tree, and Random Forest side-by-side.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-blue-400 block mb-1">Explainable AI (XAI)</span>
            <p className="text-[11px] text-slate-400">Generates human-readable positive and negative decision drivers for regulatory transparency.</p>
          </div>
        </div>
      </div>

      {/* Section 2: Dataset Provenance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Database className="w-5 h-5 text-blue-400" />
          <h2>2. Dataset Provenance & Specification</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The models are trained on the internationally recognized <strong>Statlog German Credit Dataset</strong>, curated by Prof. Dr. Hans Hofmann at the University of Hamburg and distributed via the UCI Machine Learning Repository.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block">Total Records:</span>
            <span className="text-white font-mono font-bold">1,000 instances</span>
          </div>
          <div>
            <span className="text-slate-500 block">Class Split:</span>
            <span className="text-white font-mono font-bold">70% Good / 30% Bad</span>
          </div>
          <div>
            <span className="text-slate-500 block">Split Strategy:</span>
            <span className="text-white font-mono font-bold">Stratified 80/20</span>
          </div>
          <div>
            <span className="text-slate-500 block">Missing Values:</span>
            <span className="text-emerald-400 font-mono font-bold">0 (Clean)</span>
          </div>
        </div>
      </div>

      {/* Section 3: Feature Engineering Methodology */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2>3. Domain Financial Feature Engineering</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Rather than relying solely on raw categorical variables, our pipeline computes four domain-informed financial health indicators:
        </p>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-white font-mono">1. Monthly Installment = Credit Amount / Duration Months</span>
            <p className="text-slate-400 mt-1">Calculates the exact periodic liquidity burden imposed on the borrower each month.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-white font-mono">2. Debt-to-Income (DTI %) = (Monthly Installment / Monthly Income) * 100</span>
            <p className="text-slate-400 mt-1">Evaluates what percentage of the borrower's disposable monthly income is consumed by debt servicing.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-white font-mono">3. Loan-to-Income (LTI) = Credit Amount / Estimated Annual Income</span>
            <p className="text-slate-400 mt-1">Measures the scale of principal obligation relative to annual earning power.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="font-semibold text-white font-mono">4. Financial Resilience Score (0 to 10)</span>
            <p className="text-slate-400 mt-1">Synthesizes liquid checking account status, savings reserve tiers, and active obligations into a single safety buffer index.</p>
          </div>
        </div>
      </div>

      {/* Section 4: Machine Learning Algorithms Compared */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h2>4. Machine Learning Algorithms Evaluated</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-indigo-400 text-sm">Logistic Regression</h3>
            <p className="text-slate-300 leading-relaxed">
              Generalized linear model with L2 regularization and balanced class weighting. Provides high interpretability and standard credit risk log-odds.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              ROC-AUC: ~76.1%
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-cyan-400 text-sm">Decision Tree</h3>
            <p className="text-slate-300 leading-relaxed">
              Non-linear rule partitioner constrained to depth 5 with minimum leaf samples to curb variance and prevent overfitting.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              ROC-AUC: ~66.9%
            </div>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-emerald-400 text-sm">Random Forest</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Selected</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Ensemble of 120 decorrelated decision trees using bootstrap aggregation. Achieves the highest discriminating power (ROC-AUC 78.6%) and superior precision.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              ROC-AUC: ~78.6%
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Tech Stack & System Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <GitBranch className="w-5 h-5 text-amber-400" />
          <h2>5. Technology Stack & Architecture</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Backend Framework:</span>
            <span className="text-white font-bold">FastAPI + Uvicorn</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Machine Learning:</span>
            <span className="text-white font-bold">scikit-learn + joblib</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Database Storage:</span>
            <span className="text-white font-bold">SQLite 3 (Audit Trail)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Frontend Stack:</span>
            <span className="text-white font-bold">React + Vite + Tailwind</span>
          </div>
        </div>
      </div>

      {/* Section 6: Fair Lending & Regulatory Ethics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Scale className="w-5 h-5 text-rose-400" />
          <h2>6. Fair Lending & Responsible AI Considerations</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In compliance with modern fair lending frameworks (such as the Equal Credit Opportunity Act and GDPR Article 22):
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 leading-relaxed">
          <li>The system outputs explainable risk factors alongside probability scores so applicants can understand adverse actions.</li>
          <li>Models avoid relying on non-financial demographic proxies as primary drivers, prioritizing repayment records, savings reserves, and debt ratios.</li>
          <li>All automated decisions are logged to an audit trail in SQLite for compliance review and model drift monitoring.</li>
        </ul>
      </div>
    </div>
  );
}
