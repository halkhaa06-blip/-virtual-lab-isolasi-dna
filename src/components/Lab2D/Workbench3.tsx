import React, { useState, useEffect } from 'react';
import { LabExperimentalData } from '../../types/lab';
import { 
  ArrowLeft, 
  RotateCcw, 
  HelpCircle, 
  Power, 
  CheckCircle2, 
  Info,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { calculateDnaResults } from '../../utils/dnaSimulation';

interface Workbench3Props {
  labData: LabExperimentalData;
  onUpdateLabData: (data: Partial<LabExperimentalData>) => void;
  onCompleteTable3: () => void;
  onBackTo3D: () => void;
  onReset: () => void;
}

type Step3Key = 'operation' | 'results';

export const Workbench3: React.FC<Workbench3Props> = ({
  labData,
  onUpdateLabData,
  onCompleteTable3,
  onBackTo3D,
  onReset,
}) => {
  const [currentStep, setCurrentStep] = useState<Step3Key>('operation');
  const [showGuide, setShowGuide] = useState(false);

  // Spectrophotometer physical states
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [selectedWavelength, setSelectedWavelength] = useState<260 | 280>(260);

  // Optical Chamber Cuvette slot: null | 'blank' | 'sample'
  const [chamberSlot, setChamberSlot] = useState<'blank' | 'sample' | null>(null);

  // Calibration and measurement states
  const [isBlankCalibrated, setIsBlankCalibrated] = useState(false);
  const [measuredA260, setMeasuredA260] = useState<number | null>(null);
  const [measuredA280, setMeasuredA280] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [screenMessage, setScreenMessage] = useState<string>('READY');

  // Dynamic simulation outcomes based on physical lab parameters
  const simResult = calculateDnaResults({
    massaBawang: labData.massaBawang,
    volumeLisis: labData.volumeEkstraksi ? Math.round(labData.volumeEkstraksi * 0.7) : 15.0,
    jumlahPenghancuran: labData.jumlahPenghancuran,
    waktuPenghancuran: labData.waktuPenghancuran,
    kecepatanSentrifugasi: labData.kecepatanSentrifugasi,
    waktuSentrifugasi: labData.waktuSentrifugasi,
    volumeBufferTE: labData.volumeBufferTE,
  });

  // Zero / Blank Calibration
  const handlePerformBlank = () => {
    if (!isPoweredOn) return;
    if (chamberSlot !== 'blank') {
      soundFx.playBeep(false);
      setScreenMessage('ERR: MASUKKAN BLANKO TE!');
      setTimeout(() => setScreenMessage('READY'), 2000);
      return;
    }
    soundFx.playCentrifuge();
    setIsMeasuring(true);
    setScreenMessage('CALIBRATING AUTO-ZERO...');

    setTimeout(() => {
      setIsBlankCalibrated(true);
      setIsMeasuring(false);
      setScreenMessage('A = 0.000 (BLANK OK)');
      soundFx.playBeep(true);
    }, 1200);
  };

  // Perform UV-Vis Measurement at selected wavelength
  const handleMeasureSample = () => {
    if (!isPoweredOn) return;
    if (chamberSlot !== 'sample') {
      soundFx.playBeep(false);
      setScreenMessage('ERR: MASUKKAN SAMPEL DNA!');
      setTimeout(() => setScreenMessage('READY'), 2000);
      return;
    }
    soundFx.playPour();
    setIsMeasuring(true);
    setScreenMessage(`MEASURING AT ${selectedWavelength} nm...`);

    setTimeout(() => {
      if (selectedWavelength === 260) {
        setMeasuredA260(simResult.absorbansi260);
      } else {
        setMeasuredA280(simResult.absorbansi280);
      }
      setIsMeasuring(false);
      setScreenMessage('DATA ACQUIRED');
      soundFx.playBeep(true);
    }, 1000);
  };

  // Sync measurements to labData
  useEffect(() => {
    if (measuredA260 !== null || measuredA280 !== null) {
      const a260 = measuredA260 ?? simResult.absorbansi260;
      const a280 = measuredA280 ?? simResult.absorbansi280;
      const ratio = Math.round((a260 / a280) * 100) / 100;
      const conc = Math.round(a260 * 50 * 10) / 10;
      const teVol = labData.volumeBufferTE || 0.5;
      const total = Math.round(conc * teVol * 10) / 10;

      onUpdateLabData({
        absorbansi260: a260,
        absorbansi280: a280,
        rasioKemurnian: ratio,
        konsentrasiDNA: conc,
        totalDNA: total,
        interpretasiKemurnian: simResult.interpretasiKemurnian,
      });
    }
  }, [measuredA260, measuredA280]);

  // Finish practical
  const handleFinishPractical = () => {
    soundFx.playBeep(true);
    onUpdateLabData({
      absorbansi260: measuredA260 ?? simResult.absorbansi260,
      absorbansi280: measuredA280 ?? simResult.absorbansi280,
      rasioKemurnian: simResult.rasioKemurnian,
      konsentrasiDNA: simResult.konsentrasiDNA,
      totalDNA: simResult.totalDNA,
      interpretasiKemurnian: simResult.interpretasiKemurnian,
    });
    onCompleteTable3();
  };

  const displayA260 = measuredA260 !== null ? measuredA260.toFixed(3) : '---';
  const displayA280 = measuredA280 !== null ? measuredA280.toFixed(3) : '---';
  const displayRatio = (measuredA260 !== null && measuredA280 !== null)
    ? (measuredA260 / measuredA280).toFixed(2)
    : '---';
  const displayConc = measuredA260 !== null ? (measuredA260 * 50).toFixed(1) : '---';

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0c1e3d]/90 backdrop-blur-md border-2 border-blue-400/40 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onBackTo3D();
            }}
            className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-400/40 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-300" />
            <span>Kembali ke Laboratorium</span>
          </button>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              MEJA 3 — PRAKTIKUM AKTIF
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Spektrofotometer UV-Vis: Pengukuran Absorbansi A260, A280 & Kemurnian DNA
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-400/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Petunjuk</span>
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Meja</span>
          </button>
        </div>
      </div>

      {/* Guide Note */}
      {showGuide && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-400/40 text-xs text-slate-200 space-y-1.5 animate-in fade-in">
          <div className="font-bold text-emerald-300 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Cara Mengoperasikan Spektrofotometer UV-Vis:</span>
          </div>
          <p>1. <strong>Nyalakan Alat:</strong> Tekan tombol Power fisik pada spektrofotometer.</p>
          <p>2. <strong>Kalibrasi Blanko:</strong> Masukkan kuvet Blanko (Buffer TE) ke kompartemen kuvet, tutup penutup, lalu tekan tombol <strong>[0.000 / BLANK]</strong> di panel instrumen.</p>
          <p>3. <strong>Ukur Sampel:</strong> Masukkan kuvet Sampel DNA, pilih panjang gelombang <strong>260 nm</strong> lalu tekan <strong>[START / MEASURE]</strong>. Ulangi untuk <strong>280 nm</strong>.</p>
          <p>4. <strong>Analisis:</strong> Layar digital instrumen akan langsung menampilkan Absorbansi, Rasio Kemurnian (A260/A280), dan Konsentrasi DNA (µg/mL).</p>
        </div>
      )}

      {/* WORKBENCH 3 STAGE */}
      <div className="relative min-h-[510px] rounded-3xl bg-gradient-to-b from-[#0b1329] via-[#070d1d] to-[#0b1329] border-4 border-slate-700/80 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-30 border-b border-emerald-400/30" />

        {/* INSTRUMENT APPARATUS LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center my-auto">
          {/* 1. CUVETTE RACK (QUARTZ CUVETTES) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center space-y-4 shadow-xl">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Rak Kuvet Kuarsa UV (10 mm)
            </span>

            <div className="flex items-center justify-around w-full pt-2">
              {/* Cuvette 1: Blank (Buffer TE) */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setChamberSlot(chamberSlot === 'blank' ? null : 'blank');
                  }}
                  className={`relative w-12 h-28 rounded-sm border-2 transition-all flex flex-col justify-end p-1 cursor-pointer ${
                    chamberSlot === 'blank'
                      ? 'opacity-40 border-slate-600 bg-slate-800'
                      : 'border-cyan-400/70 bg-cyan-950/40 hover:scale-105 shadow-lg shadow-cyan-950'
                  }`}
                  title="Kuvet Blanko (Buffer TE)"
                >
                  <div className="w-full h-18 bg-cyan-200/30 rounded-b-sm border-t border-cyan-300" />
                  <span className="absolute top-1 left-0 right-0 text-[8px] font-mono font-black text-cyan-300 text-center">
                    BLANK
                  </span>
                </button>
                <span className="text-[11px] font-bold text-slate-300 mt-1.5">Blanko TE</span>
                <span className="text-[9px] text-slate-500">{chamberSlot === 'blank' ? '(Di Mesin)' : 'Klik Masukkan'}</span>
              </div>

              {/* Cuvette 2: DNA Sample */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setChamberSlot(chamberSlot === 'sample' ? null : 'sample');
                  }}
                  className={`relative w-12 h-28 rounded-sm border-2 transition-all flex flex-col justify-end p-1 cursor-pointer ${
                    chamberSlot === 'sample'
                      ? 'opacity-40 border-slate-600 bg-slate-800'
                      : 'border-emerald-400/70 bg-emerald-950/40 hover:scale-105 shadow-lg shadow-emerald-950'
                  }`}
                  title="Kuvet Sampel DNA"
                >
                  <div className="w-full h-18 bg-emerald-400/40 rounded-b-sm border-t border-emerald-300" />
                  <span className="absolute top-1 left-0 right-0 text-[8px] font-mono font-black text-emerald-300 text-center">
                    DNA
                  </span>
                </button>
                <span className="text-[11px] font-bold text-slate-300 mt-1.5">Sampel DNA</span>
                <span className="text-[9px] text-slate-500">{chamberSlot === 'sample' ? '(Di Mesin)' : 'Klik Masukkan'}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              Kuvet kuarsa memiliki transmisi optik optimal pada panjang gelombang UV (200 - 350 nm).
            </div>
          </div>

          {/* 2. REALISTIC SPECTROPHOTOMETER CHASSIS (COL-SPAN-2) */}
          <div className="lg:col-span-2 rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-slate-600 p-6 shadow-2xl flex flex-col justify-between space-y-5">
            {/* Top Bar: Brand & Physical Power Switch */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-full shadow-md transition-all ${
                  isPoweredOn ? 'bg-emerald-400 shadow-emerald-400' : 'bg-slate-600'
                }`} />
                <span className="text-sm font-black text-white tracking-wider font-mono">
                  UV-VIS SPECTROPHOTOMETER MODEL 260/280
                </span>
              </div>

              {/* Physical Power Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsPoweredOn(!isPoweredOn);
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  isPoweredOn
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
                title="Tombol Daya Spektrofotometer"
              >
                <Power className="w-4 h-4" />
                <span className="text-xs font-bold">{isPoweredOn ? 'POWER ON' : 'POWER OFF'}</span>
              </button>
            </div>

            {/* Middle Section: Optical Chamber & Graphic Matrix LCD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Optical Chamber */}
              <div className="p-3.5 rounded-2xl bg-black/80 border-2 border-slate-700 flex flex-col items-center space-y-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Kompartemen Kuvet</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsLidOpen(!isLidOpen);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    {isLidOpen ? 'Tutup Penutup' : 'Buka Penutup'}
                  </button>
                </div>

                <div className="relative w-28 h-32 bg-slate-950 border-2 border-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                  {/* UV Optical Light Beam */}
                  {isMeasuring && (
                    <div className="absolute inset-x-0 h-2 bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-pulse z-20" />
                  )}

                  {chamberSlot === null ? (
                    <div className="text-[10px] text-slate-600 text-center px-2">
                      {isLidOpen ? 'Slot Kosong (Pilih kuvet di rak)' : 'Penutup Tertutup'}
                    </div>
                  ) : chamberSlot === 'blank' ? (
                    <div className="w-12 h-24 rounded-sm bg-cyan-900/50 border border-cyan-400 flex items-center justify-center text-[9px] font-bold text-cyan-300">
                      BLANK (TE)
                    </div>
                  ) : (
                    <div className="w-12 h-24 rounded-sm bg-emerald-900/50 border border-emerald-400 flex items-center justify-center text-[9px] font-bold text-emerald-300">
                      SAMPEL DNA
                    </div>
                  )}
                </div>
              </div>

              {/* Graphic Matrix LCD Display */}
              <div className="p-4 rounded-2xl bg-[#03150d] border-2 border-emerald-900/80 font-mono text-emerald-400 shadow-inner space-y-2">
                <div className="flex items-center justify-between text-[10px] text-emerald-600 border-b border-emerald-950 pb-1">
                  <span>STATUS: {screenMessage}</span>
                  <span>λ = {selectedWavelength} nm</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-emerald-500 font-bold">A260 nm:</span>
                    <span className="text-xl font-black text-emerald-300">{displayA260}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-emerald-500 font-bold">A280 nm:</span>
                    <span className="text-xl font-black text-emerald-300">{displayA280}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-emerald-950/80 pt-1">
                    <span className="text-[11px] text-emerald-500 font-bold">Rasio (260/280):</span>
                    <span className="text-lg font-black text-cyan-300">{displayRatio}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-emerald-500 font-bold">Konsentrasi DNA:</span>
                    <span className="text-base font-black text-amber-300">{displayConc} <span className="text-[10px]">µg/mL</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactile Membrane Keypad: Wavelength Buttons, Blank, Measure */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {/* Wavelength Toggles */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pilih λ:</span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedWavelength(260);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedWavelength === 260
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  260 nm (DNA)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedWavelength(280);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedWavelength === 280
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  280 nm (Protein)
                </button>
              </div>

              {/* Membrane Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isPoweredOn || isMeasuring}
                  onClick={handlePerformBlank}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 border border-cyan-500/50 cursor-pointer transition-all active:scale-95"
                >
                  0.000 / BLANK
                </button>
                <button
                  type="button"
                  disabled={!isPoweredOn || isMeasuring}
                  onClick={handleMeasureSample}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/50 cursor-pointer transition-all active:scale-95"
                >
                  START / MEASURE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SCIENTIFIC FEEDBACK & EVALUATION CARD */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Evaluasi Pengaruh Perlakuan Praktikum Terhadap Kemurnian DNA:</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold text-xs">
              Massa: {labData.massaBawang || 15}g | Crushing: {labData.jumlahPenghancuran || 30}x | Sentrifus: {labData.kecepatanSentrifugasi || 8000} RPM
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            {simResult.interpretasiKemurnian}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-slate-400 block text-[9px] uppercase">Penghancuran Mortar:</strong>
              <span className="text-slate-300">{simResult.evaluasiTahapan.penghancuran}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-slate-400 block text-[9px] uppercase">Buffer Lisis:</strong>
              <span className="text-slate-300">{simResult.evaluasiTahapan.lisis}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-slate-400 block text-[9px] uppercase">Sentrifugasi:</strong>
              <span className="text-slate-300">{simResult.evaluasiTahapan.sentrifugasi}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <strong className="text-slate-400 block text-[9px] uppercase">Presipitasi Etanol:</strong>
              <span className="text-slate-300">{simResult.evaluasiTahapan.presipitasi}</span>
            </div>
          </div>
        </div>

        {/* FINISH BUTTON */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleFinishPractical}
            className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-600/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span>SELESAIKAN SELURUH PRAKTIKUM & BUKA LAPORAN AKTIVITAS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
