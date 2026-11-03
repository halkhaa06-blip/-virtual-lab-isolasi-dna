import React from 'react';
import { Volume2, VolumeX, RotateCcw, X, Info, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetPractical: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  onResetPractical,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <span>Pengaturan Simulasi</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="font-bold text-white block">Efek Suara Lab</span>
                <span className="text-[10px] text-slate-400">Audio sintetis Web Audio API</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleSound();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                soundEnabled
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Reset Practical */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Reset Kondisi Meja Praktikum</span>
                <span className="text-[10px] text-slate-400">
                  Mengembalikan Meja 1, 2, 3 ke kondisi awal.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onResetPractical();
              }}
              className="w-full py-2 px-3 rounded-xl font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Praktikum Laboratorium</span>
            </button>
          </div>

          {/* About App */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tentang Game Virtual Lab</span>
            </div>
            <p>
              Simulasi isolasi DNA bawang bombai (*Allium cepa*) berbasis kurikulum biologi modern Fase F (Kelas XII SMA).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
