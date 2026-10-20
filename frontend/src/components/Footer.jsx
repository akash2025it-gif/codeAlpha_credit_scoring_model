import React from 'react';
import { BrainCircuit, Heart } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">CrediScore AI</span>
          <span>•</span>
          <span>AI-Based Credit Scoring and Creditworthiness Prediction System</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-slate-300 cursor-pointer">Dashboard</button>
          <button onClick={() => setActiveTab('predict')} className="hover:text-slate-300 cursor-pointer">Prediction</button>
          <button onClick={() => setActiveTab('models')} className="hover:text-slate-300 cursor-pointer">Models</button>
          <button onClick={() => setActiveTab('history')} className="hover:text-slate-300 cursor-pointer">History</button>
          <button onClick={() => setActiveTab('about')} className="hover:text-slate-300 cursor-pointer">Methodology</button>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">FastAPI</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">scikit-learn</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">React + Vite</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">SQLite</span>
        </div>
      </div>
    </footer>
  );
}
