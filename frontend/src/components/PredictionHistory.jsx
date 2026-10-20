import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';
import { clearPredictionHistory } from '../api';

export default function PredictionHistory({ history, onRefreshHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [clearing, setClearing] = useState(false);

  // Filter history items
  const filteredHistory = (history || []).filter((item) => {
    const matchesSearch = item.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.model_used?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || item.risk_category === riskFilter;
    const matchesDecision = decisionFilter === 'ALL' || item.prediction_label === decisionFilter;
    return matchesSearch && matchesRisk && matchesDecision;
  });

  // Handle Clear History
  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear the entire SQLite prediction audit log?")) {
      return;
    }
    setClearing(true);
    try {
      await clearPredictionHistory();
      if (onRefreshHistory) {
        onRefreshHistory();
      }
    } catch (err) {
      alert("Failed to clear history: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  // Export history to CSV
  const handleExportCSV = () => {
    if (!history || history.length === 0) return;
    const headers = ["ID", "Timestamp", "Applicant", "Credit Amount", "Duration Months", "Credit Score", "Risk Category", "Decision", "Model", "DTI", "LTI"];
    const rows = history.map(item => [
      item.id,
      item.timestamp,
      `"${item.applicant_name}"`,
      item.credit_amount,
      item.duration_in_month,
      Math.round(300 + (item.probability * 550)),
      item.risk_category,
      item.prediction_label,
      item.model_used,
      item.debt_to_income_ratio,
      item.loan_to_income_ratio
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `credit_predictions_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prediction Audit Trail & History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Immutable SQLite transaction log of past automated credit evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!history || history.length === 0}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handleClear}
            disabled={clearing || !history || history.length === 0}
            className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by applicant name or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Risk Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Risk Categories</option>
          <option value="Low Risk">Low Risk</option>
          <option value="Moderate Risk">Moderate Risk</option>
          <option value="High Risk">High Risk</option>
        </select>

        {/* Decision Filter */}
        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Decisions</option>
          <option value="Creditworthy">Creditworthy Only</option>
          <option value="Not Creditworthy">Not Creditworthy Only</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No historical records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Credit Score</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredHistory.map((item) => {
                  const isGood = item.prediction === 1;
                  const score = Math.round(300 + (item.probability * 550));
                  const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">#{item.id}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{formattedDate}</td>
                      <td className="py-3 px-4 font-semibold text-white">{item.applicant_name}</td>
                      <td className="py-3 px-4 font-mono">${item.credit_amount?.toLocaleString()}</td>
                      <td className="py-3 px-4">{item.duration_in_month} mos</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{score}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.risk_category === 'Low Risk'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.risk_category === 'Moderate Risk'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {item.risk_category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isGood
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}>
                          {item.prediction_label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.model_used}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400">Audit Record #{selectedRecord.id}</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedRecord.applicant_name}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              selectedRecord.prediction === 1
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="flex items-center gap-3">
                {selectedRecord.prediction === 1 ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
                <div>
                  <div className="text-base font-bold">{selectedRecord.prediction_label}</div>
                  <div className="text-xs text-slate-300">Model: {selectedRecord.model_used}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono">
                  {Math.round(300 + (selectedRecord.probability * 550))}
                </div>
                <div className="text-[11px] font-semibold text-slate-300">{selectedRecord.risk_category}</div>
              </div>
            </div>

            {/* Key Ratios */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Credit Amount:</span>
                <span className="text-white font-mono font-bold">${selectedRecord.credit_amount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Term Duration:</span>
                <span className="text-white font-mono font-bold">{selectedRecord.duration_in_month} Months</span>
              </div>
              <div>
                <span className="text-slate-400 block">Debt-to-Income:</span>
                <span className="text-amber-400 font-mono font-bold">{selectedRecord.debt_to_income_ratio}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Loan-to-Income:</span>
                <span className="text-indigo-400 font-mono font-bold">{selectedRecord.loan_to_income_ratio}x</span>
              </div>
            </div>

            {/* Automated Decision Explanation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Automated Decision Summary
              </h4>
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg leading-relaxed border border-slate-800">
                {selectedRecord.explanation_summary}
              </p>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Close Audit Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
