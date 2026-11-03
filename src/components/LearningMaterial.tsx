import React, { useState } from 'react';
import { NavigationTab } from '../types/lab';
import { LEARNING_SECTIONS } from '../data/learningContent';
import { 
  BookOpen, 
  ChevronRight, 
  Lightbulb, 
  Dna, 
  ArrowRight,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LearningMaterialProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const LearningMaterial: React.FC<LearningMaterialProps> = ({ onNavigate }) => {
  const [activeSectionId, setActiveSectionId] = useState(LEARNING_SECTIONS[0].id);

  const activeSection = LEARNING_SECTIONS.find((s) => s.id === activeSectionId) || LEARNING_SECTIONS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-blue-900/40 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Buku Panduan Teori Biologi Molekuler</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Materi Pembelajaran Isolasi DNA & Spektrofotometri
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          Pelajari 7 topik utama biokimia asam nukleat, lisis sel membran, mekanisme gaya sedimentasi sentrifugasi, serta pengukuran kuantitatif kemurnian UV-Vis.
        </p>
      </div>

      {/* Main Grid: Sidebar topic navigation + Content detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Topic Selector */}
        <div className="lg:col-span-4 space-y-2 sticky top-20">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            7 Kelompok Pembahasan
          </div>
          {LEARNING_SECTIONS.map((sec) => {
            const isSelected = sec.id === activeSectionId;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveSectionId(sec.id);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600/90 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-white text-blue-700 font-extrabold'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {sec.letter}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold truncate max-w-[210px]">
                    {sec.title}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? 'translate-x-0.5 text-white' : 'text-slate-500'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 space-y-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Section Title & Summary */}
          <div className="border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Topik {activeSection.letter}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {activeSection.summary}
            </p>
          </div>

          {/* SVG Diagram illustrations specific to topic */}
          {activeSection.letter === 'A' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] font-semibold text-slate-400 mb-2">
                Diagram Struktur Heliks Ganda DNA & Pasangan Basa Purin-Pirimidin
              </span>
              <svg viewBox="0 0 400 120" className="w-full max-w-md h-28">
                {/* Simplified DNA helix representation */}
                <path d="M 20 60 Q 60 10 100 60 T 180 60 T 260 60 T 340 60 T 380 60" fill="none" stroke="#38bdf8" strokeWidth="3" />
                <path d="M 20 60 Q 60 110 100 60 T 180 60 T 260 60 T 340 60 T 380 60" fill="none" stroke="#818cf8" strokeWidth="3" />
                {/* Base pairs ladder */}
                <line x1="60" y1="28" x2="60" y2="92" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="100" y1="60" x2="100" y2="60" stroke="#10b981" strokeWidth="3" />
                <line x1="140" y1="28" x2="140" y2="92" stroke="#eab308" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="180" y1="60" x2="180" y2="60" stroke="#3b82f6" strokeWidth="3" />
                <line x1="220" y1="28" x2="220" y2="92" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="260" y1="60" x2="260" y2="60" stroke="#10b981" strokeWidth="3" />
                <line x1="300" y1="28" x2="300" y2="92" stroke="#eab308" strokeWidth="2" strokeDasharray="3,3" />
                <line x1="340" y1="60" x2="340" y2="60" stroke="#3b82f6" strokeWidth="3" />
                {/* Labels */}
                <text x="50" y="112" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Adenin = Timin (2 Ikatan H)</text>
                <text x="210" y="112" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Guanin ≡ Sitosin (3 Ikatan H)</text>
              </svg>
            </div>
          )}

          {activeSection.letter === 'D' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] font-semibold text-slate-400 mb-2">
                Mekanisme Sedimentasi: Supernatan vs Pelet dalam Tabung Sentrifus
              </span>
              <svg viewBox="0 0 360 110" className="w-full max-w-md h-28">
                {/* Tube outline */}
                <rect x="80" y="15" width="45" height="60" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <path d="M 80 75 Q 102.5 98 125 75 Z" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                {/* Liquid supernatant */}
                <rect x="82" y="25" width="41" height="50" fill="#0284c7" fillOpacity="0.4" />
                {/* Pellet at bottom */}
                <path d="M 85 75 Q 102.5 93 120 75 Z" fill="#f59e0b" />
                {/* Annotations */}
                <line x1="130" y1="45" x2="190" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="195" y="49" fill="#38bdf8" fontSize="11" fontWeight="bold">Supernatan (Cairan Bening Atas)</text>
                <line x1="125" y1="82" x2="190" y2="82" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="195" y="86" fill="#f59e0b" fontSize="11" fontWeight="bold">Pelet (Endapan Padat di Dasar)</text>
              </svg>
            </div>
          )}

          {activeSection.letter === 'E' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] font-semibold text-slate-400 mb-2">
                Prinsip Spektrofotometri UV: Berkas Sinar Menembus Kuvet Optik (Panjang Lintasan 1 cm)
              </span>
              <svg viewBox="0 0 380 95" className="w-full max-w-md h-24">
                {/* Light source */}
                <circle cx="35" cy="45" r="14" fill="#fbbf24" />
                <text x="23" y="49" fill="#000" fontSize="9" fontWeight="bold">UV Lamp</text>
                {/* Incident ray */}
                <line x1="55" y1="45" x2="155" y2="45" stroke="#38bdf8" strokeWidth="3" />
                <text x="75" y="35" fill="#94a3b8" fontSize="10">Intensitas I₀</text>
                {/* Cuvette */}
                <rect x="155" y="15" width="40" height="65" rx="3" fill="#0284c7" fillOpacity="0.3" stroke="#e2e8f0" strokeWidth="2" />
                <text x="158" y="90" fill="#94a3b8" fontSize="9">Kuvet (1 cm)</text>
                {/* Transmitted ray */}
                <line x1="195" y1="45" x2="285" y2="45" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="215" y="35" fill="#94a3b8" fontSize="10">Intensitas I</text>
                {/* Detector */}
                <rect x="290" y="25" width="20" height="40" rx="3" fill="#6366f1" />
                <text x="315" y="49" fill="#e2e8f0" fontSize="10" fontWeight="bold">Detektor</text>
              </svg>
            </div>
          )}

          {/* Subtopics Details */}
          <div className="space-y-6">
            {activeSection.subtopics.map((sub, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{sub.title}</span>
                </h3>

                <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed pl-4 border-l-2 border-slate-800">
                  {sub.content.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Key Points */}
                {sub.keyPoints && sub.keyPoints.length > 0 && (
                  <div className="ml-4 p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Poin Kunci & Makna Praktikum:</span>
                    </div>
                    <ul className="space-y-1 pl-4 text-xs text-slate-300 list-disc">
                      {sub.keyPoints.map((point, kIdx) => (
                        <li key={kIdx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Data Table */}
                {sub.tableData && (
                  <div className="ml-4 overflow-x-auto rounded-xl border border-slate-700/80 my-3">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800 text-slate-200 uppercase font-semibold">
                        <tr>
                          {sub.tableData.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-3.5 py-2.5 border-b border-slate-700">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300 bg-slate-900/60">
                        {sub.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/40">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2 font-medium">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Selesai membaca materi? Lanjutkan ke tahapan sintaks inkuiri dan praktikum lab.</span>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('aktivitas');
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Lanjut ke Aktivitas Sintaks & Praktikum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
