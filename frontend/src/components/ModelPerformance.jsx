import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Cpu, 
  CheckCircle2, 
  Award, 
  HelpCircle, 
  Layers, 
  TrendingUp, 
  SlidersHorizontal 
} from 'lucide-react';

export default function ModelPerformance({ metricsData }) {
  const [selectedModel, setSelectedModel] = useState("Random Forest");

  const models = metricsData?.models_evaluated || ["Logistic Regression", "Decision Tree", "Random Forest"];
  const metrics = metricsData?.metrics || {};
  const bestModelName = metricsData?.best_model_name || "Random Forest";
  const featureImportances = metricsData?.top_feature_importances || [];

  // Prepare comparison data for grouped Bar Chart
  const comparisonData = [
    {
      metric: 'Accuracy',
      'Logistic Regression': (metrics?.['Logistic Regression']?.accuracy || 0) * 100,
      'Decision Tree': (metrics?.['Decision Tree']?.accuracy || 0) * 100,
      'Random Forest': (metrics?.['Random Forest']?.accuracy || 0) * 100,
    },
    {
      metric: 'Precision',
      'Logistic Regression': (metrics?.['Logistic Regression']?.precision || 0) * 100,
      'Decision Tree': (metrics?.['Decision Tree']?.precision || 0) * 100,
      'Random Forest': (metrics?.['Random Forest']?.precision || 0) * 100,
    },
    {
      metric: 'Recall',
      'Logistic Regression': (metrics?.['Logistic Regression']?.recall || 0) * 100,
      'Decision Tree': (metrics?.['Decision Tree']?.recall || 0) * 100,
      'Random Forest': (metrics?.['Random Forest']?.recall || 0) * 100,
    },
    {
      metric: 'F1-Score',
      'Logistic Regression': (metrics?.['Logistic Regression']?.f1_score || 0) * 100,
      'Decision Tree': (metrics?.['Decision Tree']?.f1_score || 0) * 100,
      'Random Forest': (metrics?.['Random Forest']?.f1_score || 0) * 100,
    },
    {
      metric: 'ROC-AUC',
      'Logistic Regression': (metrics?.['Logistic Regression']?.roc_auc || 0) * 100,
      'Decision Tree': (metrics?.['Decision Tree']?.roc_auc || 0) * 100,
      'Random Forest': (metrics?.['Random Forest']?.roc_auc || 0) * 100,
    },
  ];

  // Prepare ROC curve data for the selected model
  const activeRocPoints = metrics?.[selectedModel]?.roc_curve || [];
  const cm = metrics?.[selectedModel]?.confusion_matrix || {
    true_negative: 0,
    false_positive: 0,
    false_negative: 0,
    true_positive: 0
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Award className="w-3.5 h-3.5" />
          Rigorous Out-Of-Sample Benchmark (Stratified 20% Holdout Test Set)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Machine Learning Model Benchmarking & Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Comparative empirical performance of Logistic Regression, Decision Tree, and Random Forest trained on 800 samples and evaluated on 200 holdout credit profiles.
        </p>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Algorithm Benchmark Comparison</h2>
          </div>
          <span className="text-xs text-slate-400">Winning Model: <strong className="text-emerald-400">{bestModelName}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {models.map((modelName) => {
                const m = metrics[modelName] || {};
                const isBest = modelName === bestModelName;
                return (
                  <tr 
                    key={modelName} 
                    className={`transition-colors cursor-pointer ${
                      selectedModel === modelName ? 'bg-indigo-950/40' : 'hover:bg-slate-800/40'
                    }`}
                    onClick={() => setSelectedModel(modelName)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span>{modelName}</span>
                      {isBest && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Selected Best
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{m.accuracy ? `${(m.accuracy * 100).toFixed(2)}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{m.precision ? `${(m.precision * 100).toFixed(2)}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{m.recall ? `${(m.recall * 100).toFixed(2)}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{m.f1_score ? `${(m.f1_score * 100).toFixed(2)}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{m.roc_auc ? `${(m.roc_auc * 100).toFixed(2)}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(modelName);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                          selectedModel === modelName
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metrics Bar Chart Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Comparative Metric Evaluation Chart</h2>
            <p className="text-xs text-slate-400">Side-by-side performance across all 5 standard statistical metrics</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`${val.toFixed(2)}%`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Logistic Regression" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Decision Tree" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Random Forest" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Diagnostics for Selected Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Confusion Matrix</h2>
              <p className="text-xs text-slate-400 font-medium">Model: {selectedModel}</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Test N = 200</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negative */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">True Negative (TN)</span>
              <div className="text-2xl font-black text-white font-mono">{cm.true_negative}</div>
              <p className="text-[10px] text-emerald-400 mt-1">Correctly identified bad risk</p>
            </div>

            {/* False Positive */}
            <div className="bg-slate-950 border border-rose-900/30 p-4 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">False Positive (FP)</span>
              <div className="text-2xl font-black text-rose-400 font-mono">{cm.false_positive}</div>
              <p className="text-[10px] text-rose-400/80 mt-1">Bad risk misclassified as good</p>
            </div>

            {/* False Negative */}
            <div className="bg-slate-950 border border-amber-900/30 p-4 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">False Negative (FN)</span>
              <div className="text-2xl font-black text-amber-400 font-mono">{cm.false_negative}</div>
              <p className="text-[10px] text-amber-400/80 mt-1">Good credit misclassified as bad</p>
            </div>

            {/* True Positive */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">True Positive (TP)</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{cm.true_positive}</div>
              <p className="text-[10px] text-emerald-400 mt-1">Correctly approved creditworthy</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Financial Risk Note:</p>
            <p className="text-[11px] leading-relaxed">
              In retail credit scoring, minimizing <strong>False Positives</strong> is paramount because lending capital to defaulting customers incurs substantial write-offs. Random Forest achieved higher specificity and precision.
            </p>
          </div>
        </div>

        {/* ROC Curve Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">ROC Curve (Receiver Operating Characteristic)</h2>
              <p className="text-xs text-slate-400">
                {selectedModel} • Area Under Curve (AUC): <strong className="text-indigo-400 font-mono">{((metrics?.[selectedModel]?.roc_auc || 0) * 100).toFixed(1)}%</strong>
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeRocPoints} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  dataKey="fpr" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  unit="" 
                  label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 10 }} 
                />
                <YAxis 
                  domain={[0, 1]} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(val, name) => [Number(val).toFixed(3), name === 'tpr' ? 'TPR (Sensitivity)' : 'FPR']}
                />
                <Line 
                  type="monotone" 
                  dataKey="tpr" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#818cf8' }} 
                  name="ROC Curve" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importance Ranking Chart */}
      {featureImportances.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Top 15 Feature Importances (Random Forest Ensemble)</h2>
              <p className="text-xs text-slate-400">Gini-impurity reduction ranking across decision trees</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featureImportances.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-200 truncate pr-2">
                    #{idx + 1} {item.feature.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {(item.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(item.importance / featureImportances[0].importance) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
