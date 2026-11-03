import React, { useState } from 'react';
import { StudentIdentity, NavigationTab, TableStatus } from '../types/lab';
import { 
  Dna, 
  User, 
  BookOpen, 
  FlaskConical, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface HomeProps {
  identity: StudentIdentity;
  onSaveIdentity: (id: StudentIdentity) => void;
  onNavigate: (tab: NavigationTab) => void;
  tableStatus: TableStatus;
}

export const Home: React.FC<HomeProps> = ({
  identity,
  onSaveIdentity,
  onNavigate,
  tableStatus
}) => {
  const [name, setName] = useState(identity.name || '');
  const [className, setClassName] = useState(identity.className || '');
  const [studentNumber, setStudentNumber] = useState(identity.studentNumber || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !className.trim() || !studentNumber.trim()) {
      alert('Mohon lengkapi Nama Lengkap, Kelas, dan Nomor Absen.');
      return;
    }
    soundFx.playBeep(true);
    onSaveIdentity({
      name: name.trim(),
      className: className.trim(),
      studentNumber: studentNumber.trim(),
      isRegistered: true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isRegistered = identity.isRegistered && identity.name.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border border-blue-900/40 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Media Pembelajaran Biologi Modern Fase F</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Virtual Lab Isolasi DNA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Bawang Bombai</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Simulasi interaktif ekstraksi asam deoksiribonukleat (*Allium cepa*), purifikasi fraksi melalui 
              sentrifugasi kecepatan tinggi, serta analisis kuantitatif konsentrasi dan rasio kemurnian menggunakan spektrofotometer UV-Vis.
            </p>

            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>Simulasi 3D Lab + 2D Interaktif</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
                <Dna className="w-4 h-4 text-cyan-400" />
                <span>Prinsip A260 / A280 Riil</span>
              </div>
            </div>
          </div>

          {/* Student Identity Card / Form */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Identitas Praktikan</h3>
                </div>
                {isRegistered && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terdaftar
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Kelas *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: XII MIPA 1"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nomor Absen *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 12"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isRegistered ? 'Perbarui Identitas' : 'Simpan & Buka Modul'}</span>
                </button>

                {savedSuccess && (
                  <p className="text-center text-xs text-emerald-400 font-medium animate-pulse">
                    Identitas berhasil disimpan! Modul pembelajaran telah terbuka.
                  </p>
                )}
              </form>

              {isRegistered && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Siap memulai?</span>
                  <button
                    onClick={() => onNavigate('tujuan')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Lanjut ke Tujuan Belajar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Learning Path & Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Alur Tahapan Pembelajaran</h2>
            <p className="text-xs text-slate-400">
              Selesaikan setiap tahap secara berurutan sesuai alur kurikulum biologi modern.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Tahap 1</span>
                {isRegistered ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terbuka
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 font-medium">Isi Identitas</span>
                )}
              </div>
              <h3 className="font-bold text-white text-sm">Tujuan & Materi</h3>
              <p className="text-xs text-slate-400">
                Pahami capaian pembelajaran Fase F dan 7 materi pokok biologi molekuler DNA.
              </p>
            </div>
            <button
              disabled={!isRegistered}
              onClick={() => onNavigate('materi')}
              className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> Buka Materi
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Tahap 2</span>
                <span className="text-xs text-blue-400 font-medium">Inkuiri</span>
              </div>
              <h3 className="font-bold text-white text-sm">Sintaks & Hipotesis</h3>
              <p className="text-xs text-slate-400">
                Pahami fenomena pemantik dan rumuskan hipotesis awal isolasi DNA.
              </p>
            </div>
            <button
              disabled={!isRegistered}
              onClick={() => onNavigate('aktivitas')}
              className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1 transition-colors"
            >
              Mulai Sintaks
            </button>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Tahap 3</span>
                {tableStatus.table3Completed ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                  </span>
                ) : (
                  <span className="text-xs text-cyan-400 font-medium">Siap Dimainkan</span>
                )}
              </div>
              <h3 className="font-bold text-white text-sm">Game Virtual Lab</h3>
              <p className="text-xs text-slate-400">
                Eksplorasi lab 3D dan praktikum 3 meja (Ekstraksi, Sentrifugasi, Spektrofotometer).
              </p>
            </div>
            <button
              disabled={!isRegistered}
              onClick={() => onNavigate('virtuallab')}
              className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1 transition-colors font-semibold"
            >
              <FlaskConical className="w-3.5 h-3.5" /> Masuk Lab 3D
            </button>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Tahap 4</span>
                {tableStatus.table3Completed ? (
                  <span className="text-xs text-indigo-300 font-medium">Lengkap</span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Proses</span>
                )}
              </div>
              <h3 className="font-bold text-white text-sm">Aktivitas & Laporan</h3>
              <p className="text-xs text-slate-400">
                Pengisian analisis 6 sintaks, rekapitulasi data 13 parameter, dan unduh CSV/cetak.
              </p>
            </div>
            <button
              disabled={!isRegistered}
              onClick={() => onNavigate('aktivitas')}
              className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1 transition-colors"
            >
              Aktivitas & Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
