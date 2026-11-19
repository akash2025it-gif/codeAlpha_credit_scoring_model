import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Layers, 
  Activity, 
  Cpu, 
  User, 
  Home, 
  Briefcase, 
  CreditCard,
  Download,
  Loader2,
  Code2
} from 'lucide-react';
import { fetchPredictionDetail } from '../services/api';

export default function PredictionDetailView({ recordId, recordData, onBack }) {
  const [record, setRecord] = useState(recordData || null);
  const [loading, setLoading] = useState(!recordData && !!recordId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recordData && recordId) {
      setLoading(true);
      fetchPredictionDetail(recordId)
        .then(data => setRecord(data))
        .catch(err => setError(err.message || "Failed to load assessment details."))
        .finally(() => setLoading(false));
    }
  }, [recordId, recordData]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading audit record #{recordId}...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400">{error || "The requested credit evaluation could not be loaded."}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
        >
          Return to History
        </button>
      </div>
    );
  }

  const isGood = record.prediction === 1;
  const score = Math.round(300 + (record.probability * 550));
  const rawInput = record.raw_input_json || {};

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Audit Trail
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Audit ID: <strong className="text-white font-mono">#{record.id}</strong></span>
          <span>•</span>
          <span>Logged: {new Date(record.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Decision Summary Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        isGood
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
              isGood
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {record.prediction_label}
            </span>
            <span className="text-xs text-slate-400">Model: <strong className="text-white">{record.model_used}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {record.applicant_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {record.explanation_summary}
          </p>
        </div>

        <div className="text-right bg-slate-950/80 border border-slate-800 p-5 rounded-xl min-w-[180px]">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-0.5">Calculated Score</span>
          <div className="text-4xl font-black font-mono text-white mb-1">{score}</div>
          <div className="text-xs font-semibold text-indigo-300">{record.risk_category}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">{(record.probability * 100).toFixed(1)}% Confidence</div>
        </div>
      </div>

      {/* Financial Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Credit Principal</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${record.credit_amount ? record.credit_amount.toLocaleString() : 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Requested term: {record.duration_in_month} mos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Debt-to-Income (DTI)</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {record.debt_to_income_ratio}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Monthly debt burden ratio</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Loan-to-Income (LTI)</span>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
            {record.loan_to_income_ratio}x
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Loan vs annual baseline</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Checking Status</span>
          <div className="text-sm font-semibold text-slate-200 mt-1.5 truncate">
            {record.checking_status?.replace(/_/g, ' ') || 'None'}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Liquid balance tier</p>
        </div>
      </div>

      {/* Raw Assessment JSON Input Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Raw Model Input Payload</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">20 Financial Variables</span>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs text-slate-300 font-mono overflow-x-auto border border-slate-800/80 leading-relaxed max-h-72">
          {JSON.stringify(rawInput, null, 2)}
        </pre>
      </div>
    </div>
  );
}
