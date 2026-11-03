import React from 'react';
import { RotateCcw, AlertTriangle, X, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Reset Praktikum Laboratorium",
  description = "Apakah Anda yakin ingin mengatur ulang kondisi praktikum? Meja 1, 2, dan 3 akan dikembalikan ke kondisi awal dan alat-alat dapat dioperasikan ulang dari Meja 1. Identitas dan nilai tes Anda akan tetap tersimpan aman."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-rose-500/60 p-6 sm:p-7 shadow-2xl text-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <span className="font-bold text-slate-300 block">Dampak Reset:</span>
          <div>• Meja 1, 2, dan 3 kembali ke kondisi awal (mulai dari pemotongan bawang)</div>
          <div>• Nilai massa, volume filtrat, sentrifugasi, dan spektrofotometri direset</div>
          <div>• <strong className="text-emerald-400">Nama siswa, kelas, nilai pretest dan posttest TIDAK dihapus</strong></div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playBeep(true);
              onConfirm();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ya, Reset Praktikum</span>
          </button>
        </div>
      </div>
    </div>
  );
};
