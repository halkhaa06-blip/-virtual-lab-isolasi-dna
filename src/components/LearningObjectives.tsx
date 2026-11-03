import React from 'react';
import { NavigationTab } from '../types/lab';
import { LEARNING_OBJECTIVES } from '../data/learningContent';
import { Target, CheckCircle2, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LearningObjectivesProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const LearningObjectives: React.FC<LearningObjectivesProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Kurikulum Merdeka — Biologi Fase F (Kelas XII SMA)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
          Tujuan Pembelajaran Virtual Lab Isolasi DNA
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          Dirancang untuk memberikan pengalaman laboratorium autentik dalam menganalisis prinsip kerja bioteknologi modern melalui isolasi DNA tanaman, teknik sentrifugasi diferensial, serta spektrofotometri asam nukleat.
        </p>

        {/* CP Fase F Banner */}
        <div className="mt-6 p-4 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
              Capaian Pembelajaran (CP) Fase F
            </h2>
            <p className="text-sm font-semibold text-white mt-0.5">
              "Menganalisis proses bioteknologi modern."
            </p>
          </div>
        </div>
      </div>

      {/* 12 Objectives Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            12 Indikator Capaian Pembelajaran Peserta Didik
          </h2>
          <span className="text-xs text-slate-400">
            Setelah menyelesaikan simulasi virtual lab
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {LEARNING_OBJECTIVES.map((objective, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 flex items-start gap-3.5 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {objective}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>
                    {idx < 4 
                      ? 'Konseptual & Preparasi' 
                      : idx < 7 
                      ? 'Prosedural Sentrifugasi' 
                      : 'Kuantitatif & Spektrofotometri'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Langkah berikutnya: Pelajari materi komprehensif atau langsung uji pemahaman pada pretest.
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('materi');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Baca Materi Lengkap</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('aktivitas');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Mulai Sintaks Inkuiri</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
