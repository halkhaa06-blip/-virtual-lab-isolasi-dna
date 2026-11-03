import React, { useState, useEffect } from 'react';
import { LabExperimentalData } from '../../types/lab';
import { 
  ArrowLeft, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { RealisticMicropipette } from './RealisticMicropipette';

interface Workbench2Props {
  labData: LabExperimentalData;
  onUpdateLabData: (data: Partial<LabExperimentalData>) => void;
  onCompleteTable2: () => void;
  onBackTo3D: () => void;
  onReset: () => void;
}

type Step2Key = 'pipette_filtrate' | 'centrifuge_run' | 'ethanol_two_tubes';

export const Workbench2: React.FC<Workbench2Props> = ({
  labData,
  onUpdateLabData,
  onCompleteTable2,
  onBackTo3D,
  onReset,
}) => {
  const [currentStep, setCurrentStep] = useState<Step2Key>('pipette_filtrate');
  const [showGuide, setShowGuide] = useState(false);

  // STEP 1: PIPETTING FILTRATE INTO TUBE
  const [tube1CapOpen, setTube1CapOpen] = useState(false);
  const [tube1Volume, setTube1Volume] = useState(0); // in µL
  const [pipetteVol, setPipetteVol] = useState(1000); // µL
  const [pipetteLiquidPct, setPipetteLiquidPct] = useState(0);
  const [capAlert, setCapAlert] = useState(false);

  // STEP 2: CENTRIFUGE WITH ROTATING ROTOR
  const [sampleInRotor, setSampleInRotor] = useState(false);
  const [counterbalanceInRotor, setCounterbalanceInRotor] = useState(false);
  const [lidClosed, setLidClosed] = useState(false);
  const [rpmSetting, setRpmSetting] = useState(labData.kecepatanSentrifugasi || 8000);
  const [timeSettingMin, setTimeSettingMin] = useState(labData.waktuSentrifugasi || 10);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRpm, setCurrentRpm] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [rotorAngle, setRotorAngle] = useState(0);
  const [centrifugeDone, setCentrifugeDone] = useState(false);

  // STEP 3: 2 TUBES -> REALISTIC MICROPIPETTE SUPERNATANT FROM TUBE 1 TO TUBE 2 -> GLIDE COLD ETHANOL -> SHAKE
  const [tube1Step3CapOpen, setTube1Step3CapOpen] = useState(false);
  const [tube2Step3CapOpen, setTube2Step3CapOpen] = useState(false);
  const [tube1HasSupernatant, setTube1HasSupernatant] = useState(true);
  const [tube2HasDNA, setTube2HasDNA] = useState(false);
  const [step3PipetteVol, setStep3PipetteVol] = useState(1000);
  const [step3PipetteLiquidPct, setStep3PipetteLiquidPct] = useState(0);
  const [step3CapAlert, setStep3CapAlert] = useState<string | null>(null);

  const [isEthanolCapOpen, setIsEthanolCapOpen] = useState(false);
  const [isEthanolNearTube2, setIsEthanolNearTube2] = useState(false);
  const [isPouringEthanol, setIsPouringEthanol] = useState(false);
  const [ethanolVolume, setEthanolVolume] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [shakeDone, setShakeDone] = useState(false);

  // Centrifuge continuous spin animation
  useEffect(() => {
    let animId: number;
    let rpmInterval: number;
    let countdownInterval: number;

    if (isRunning) {
      rpmInterval = window.setInterval(() => {
        setCurrentRpm((prev) => {
          if (prev < rpmSetting) {
            return Math.min(rpmSetting, prev + 1000);
          }
          return rpmSetting;
        });
        setRotorAngle((a) => (a + 40) % 360);
      }, 40);

      countdownInterval = window.setInterval(() => {
        setCountdownSeconds((c) => {
          if (c <= 1) {
            clearInterval(rpmInterval);
            clearInterval(countdownInterval);
            setIsRunning(false);
            setCurrentRpm(0);
            setCentrifugeDone(true);
            soundFx.playBeep(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(rpmInterval);
      clearInterval(countdownInterval);
    };
  }, [isRunning, rpmSetting]);

  // Ethanol pour continuous loop
  useEffect(() => {
    let interval: number;
    if (isPouringEthanol) {
      soundFx.playPour();
      interval = window.setInterval(() => {
        setEthanolVolume((v) => Math.min(10, Math.round((v + 0.5) * 10) / 10));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPouringEthanol]);

  // Sync to labData
  useEffect(() => {
    onUpdateLabData({
      kecepatanSentrifugasi: rpmSetting,
      waktuSentrifugasi: timeSettingMin,
      volumeBufferTE: 0.5,
    });
  }, [rpmSetting, timeSettingMin]);

  // Pipette step 1 handlers
  const handleAspirateFiltrate = () => {
    setPipetteLiquidPct(100);
  };

  const handleDispenseFiltrate = () => {
    setPipetteLiquidPct(0);
    setTube1Volume((v) => v + pipetteVol);
  };

  const handleClosedCapWarning = () => {
    setCapAlert(true);
    setTimeout(() => setCapAlert(false), 2500);
  };

  // Start centrifuge
  const handleStartCentrifuge = () => {
    if (!lidClosed) {
      soundFx.playBeep(false);
      return;
    }
    soundFx.playCentrifuge();
    setIsRunning(true);
    setCentrifugeDone(false);
    setCountdownSeconds(Math.min(10, Math.max(3, Math.round(timeSettingMin * 0.6))));
  };

  // Step 3 Micropipette Handlers
  const handleAspirateSupernatantPipette = () => {
    if (!tube1Step3CapOpen) {
      setStep3CapAlert('Buka tutup Tabung 1 (hasil sentrifus) terlebih dahulu!');
      setTimeout(() => setStep3CapAlert(null), 2500);
      return;
    }
    if (!tube1HasSupernatant) return;
    setStep3PipetteLiquidPct(100);
    setTube1HasSupernatant(false);
    soundFx.playPour();
  };

  const handleDispenseSupernatantPipette = () => {
    if (!tube2Step3CapOpen) {
      setStep3CapAlert('Buka tutup Tabung 2 (tabung DNA baru) terlebih dahulu!');
      setTimeout(() => setStep3CapAlert(null), 2500);
      return;
    }
    setStep3PipetteLiquidPct(0);
    setTube2HasDNA(true);
    soundFx.playPour();
  };

  // Glide and pour cold ethanol bottle to Tube 2
  const handleGlideAndPourEthanol = () => {
    if (!tube2HasDNA || isPouringEthanol) return;
    if (!isEthanolCapOpen) {
      soundFx.playClick();
      setIsEthanolCapOpen(true);
    }
    // Step 1: glide close to Tube 2
    setIsEthanolNearTube2(true);
    soundFx.playClick();

    setTimeout(() => {
      // Step 2: tilt and pour
      setIsPouringEthanol(true);
      soundFx.playPour();

      setTimeout(() => {
        // Step 3: finish pour
        setIsPouringEthanol(false);
        setTimeout(() => {
          setIsEthanolNearTube2(false);
          soundFx.playBeep(true);
        }, 600);
      }, 1500);
    }, 600);
  };

  // Gentle shake / vortex of Tube 2
  const handleGentleShake = () => {
    if (tube2Step3CapOpen) {
      setStep3CapAlert('Tutup tabung 2 terlebih dahulu sebelum menggoyangkan!');
      setTimeout(() => setStep3CapAlert(null), 2500);
      return;
    }
    soundFx.playCentrifuge();
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setShakeDone(true);
      soundFx.playBeep(true);
    }, 1200);
  };

  const handleCompleteMeja2 = () => {
    soundFx.playBeep(true);
    onCompleteTable2();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0c1e3d]/90 backdrop-blur-md border-2 border-blue-400/40 shadow-xl">
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
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              MEJA 2 — PRAKTIKUM AKTIF
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Sentrifugasi Pemisahan & Presipitasi Etanol Dingin 95%
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
        <div className="p-3.5 rounded-2xl bg-amber-950/90 border border-amber-400/40 text-xs text-slate-200 space-y-1 animate-in fade-in">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Petunjuk Langkah Meja 2:</span>
          </div>
          <p>• <strong>Pemipetan:</strong> Geser mikropipet ke gelas filtrat untuk mengambil larutan, lalu geser ke atas tabung mikrosentrifus (buka tutupnya terlebih dahulu) untuk mengalirkan filtrat.</p>
          <p>• <strong>Sentrifugasi:</strong> Masukkan tabung sampel & penyeimbang ke rotor, kunci penutup, atur RPM & durasi, lalu tekan START.</p>
          <p>• <strong>Presipitasi 2 Tabung:</strong> Gunakan pipet untuk memindahkan supernatan dari Tabung 1 ke Tabung 2 (Tabung DNA). Tuang etanol dingin 95%, tutup tabung, goyangkan sedikit, lalu selesai!</p>
        </div>
      )}

      {/* Step Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'pipette_filtrate', label: '1. Pemipetan Filtrat ke Tabung' },
          { id: 'centrifuge_run', label: '2. Mesin Sentrifus & Rotor Berputar' },
          { id: 'ethanol_two_tubes', label: '3. Pemindahan DNA & Presipitasi Etanol Dingin (2 Tabung)' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(s.id as Step2Key)}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
              currentStep === s.id
                ? 'bg-amber-600 border-yellow-300 text-white shadow-lg shadow-amber-500/40'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* WORKBENCH 2 STAGE */}
      <div className="relative min-h-[490px] rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#0f172a] border-4 border-slate-700/80 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-600 via-yellow-500 to-blue-600 opacity-30 border-b border-amber-400/30" />

        {/* ----------------- STEP 1: PIPETTING FILTRATE (CLEAN PIPETTE, CAP ENFORCEMENT) ----------------- */}
        {currentStep === 'pipette_filtrate' && (
          <div className="relative w-full h-[410px] flex flex-col justify-between">
            <div className="text-center">
              <div className="inline-block bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
                Geser mikropipet ke gelas filtrat untuk mengambil larutan, lalu geser ke atas tabung mikrosentrifus yang telah dibuka tutupnya.
              </div>
            </div>

            {/* Closed Cap Alert Banner */}
            {capAlert && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-rose-950 border-2 border-rose-500 text-rose-200 text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Buka tutup tabung mikrosentrifus terlebih dahulu!</span>
              </div>
            )}

            {/* Compact Clean Draggable Micropipette (Zero Text on Chassis) */}
            <RealisticMicropipette
              volumeMicroLiters={pipetteVol}
              onVolumeChange={(v) => setPipetteVol(v)}
              liquidColor="#38bdf8"
              liquidAmountPct={pipetteLiquidPct}
              onAspirate={handleAspirateFiltrate}
              onDispense={handleDispenseFiltrate}
              canAspirate={pipetteLiquidPct === 0}
              canDispense={pipetteLiquidPct > 0}
              isTargetCapOpen={tube1CapOpen}
              onAttemptDispenseWithClosedCap={handleClosedCapWarning}
              labelSource="Gelas Filtrat"
              labelTarget="Tabung Mikrosentrifus"
              sourcePos={{ x: 130, y: 20 }}
              targetPos={{ x: 420, y: 20 }}
            />

            {/* Bench Equipment Stations */}
            <div className="flex items-end justify-around w-full max-w-2xl mx-auto pt-24 pb-2">
              {/* Station A: Filtrat Beaker */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-40 rounded-b-2xl border-x-2 border-b-2 border-cyan-400/50 bg-cyan-950/20 shadow-xl flex flex-col justify-end p-2 overflow-hidden">
                  <div className="w-full h-24 bg-cyan-400/50 rounded-b-xl border-t border-cyan-300" />
                </div>
                <span className="text-xs font-bold text-slate-300 mt-2">Gelas Filtrat</span>
              </div>

              {/* Station B: 1.5 mL Eppendorf Tube */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setTube1CapOpen(!tube1CapOpen);
                  }}
                  className="cursor-pointer flex flex-col items-center"
                  title="Klik Tutup untuk Buka / Tutup"
                >
                  {/* Hinged Snap Cap */}
                  <div
                    className={`w-7 h-3 rounded-t bg-blue-500 border border-blue-300 shadow transition-all duration-200 ${
                      tube1CapOpen ? '-rotate-60 -translate-x-3 -translate-y-2' : ''
                    }`}
                  />
                  {/* Tube Body */}
                  <div
                    className="relative w-8 h-28 bg-slate-100/20 border-x border-b border-slate-300/60 shadow-xl flex flex-col justify-end p-1 overflow-hidden"
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)',
                    }}
                  >
                    {tube1Volume > 0 && (
                      <div
                        className="w-full bg-cyan-400/70 border-t border-cyan-200 transition-all duration-300"
                        style={{
                          height: `${Math.min(100, (tube1Volume / 1500) * 100)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-xs font-bold text-slate-300 block">Tabung Mikrosentrifus</span>
                  <span className={`text-[10px] font-bold block ${tube1CapOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tube1CapOpen ? 'Tutup Terbuka' : 'Tutup Tertutup (Klik untuk Buka)'}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Terisi: {tube1Volume} µL
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep('centrifuge_run')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke Mesin Sentrifus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEP 2: CENTRIFUGE WITH ROTATING ROTOR ----------------- */}
        {currentStep === 'centrifuge_run' && (
          <div className="flex flex-col items-center justify-center space-y-5 text-center my-auto w-full">
            <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
              Masukkan tabung sampel & penyeimbang ke rotor, kunci penutup, tentukan RPM & durasi, lalu tekan START.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-4xl items-center">
              {/* SIDE TUBE RACK */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center space-y-4 shadow-xl">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Rak Tabung Samping
                </span>

                <div className="flex items-center justify-around w-full pt-2">
                  {/* Tube 1: Sample */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSampleInRotor(!sampleInRotor);
                      }}
                      className={`w-10 h-24 rounded-b-xl border-2 transition-all flex flex-col justify-end p-1 cursor-pointer ${
                        sampleInRotor
                          ? 'opacity-40 border-slate-700 bg-slate-800'
                          : 'border-blue-400 bg-blue-950 hover:scale-105 shadow-md shadow-blue-900'
                      }`}
                      title="Klik untuk Memasukkan ke Rotor Slot 1"
                    >
                      <div className="w-full h-14 bg-cyan-400/60 rounded-b-lg border-t border-cyan-200" />
                      <span className="text-[8px] font-mono font-black text-cyan-200 text-center">DNA</span>
                    </button>
                    <span className="text-[11px] font-bold text-slate-300 mt-1.5">Tabung Sampel</span>
                    <span className="text-[9px] text-slate-500">{sampleInRotor ? '(Di Rotor 1)' : 'Klik Masukkan'}</span>
                  </div>

                  {/* Tube 2: Counterbalance */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setCounterbalanceInRotor(!counterbalanceInRotor);
                      }}
                      className={`w-10 h-24 rounded-b-xl border-2 transition-all flex flex-col justify-end p-1 cursor-pointer ${
                        counterbalanceInRotor
                          ? 'opacity-40 border-slate-700 bg-slate-800'
                          : 'border-emerald-400 bg-emerald-950 hover:scale-105 shadow-md shadow-emerald-900'
                      }`}
                      title="Klik untuk Memasukkan ke Rotor Slot 4"
                    >
                      <div className="w-full h-14 bg-emerald-400/60 rounded-b-lg border-t border-emerald-200" />
                      <span className="text-[8px] font-mono font-black text-emerald-200 text-center">BAL</span>
                    </button>
                    <span className="text-[11px] font-bold text-slate-300 mt-1.5">Penyeimbang</span>
                    <span className="text-[9px] text-slate-500">{counterbalanceInRotor ? '(Di Rotor 4)' : 'Klik Masukkan'}</span>
                  </div>
                </div>
              </div>

              {/* MASTER CENTRIFUGE WITH DYNAMIC ROTATING ROTOR */}
              <div className="lg:col-span-2 rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-slate-600 p-6 shadow-2xl flex flex-col justify-between space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  {/* Rotating Rotor */}
                  <div
                    style={{
                      transform: `rotate(${rotorAngle}deg)`,
                      transition: isRunning ? 'none' : 'transform 0.2s',
                    }}
                    className="relative w-36 h-36 rounded-full bg-slate-800 border-4 border-slate-600 shadow-inner flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-slate-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-400" />
                    </div>

                    {/* Slot 1: Sample */}
                    <div
                      onClick={() => setSampleInRotor(!sampleInRotor)}
                      className={`absolute top-2 w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                        sampleInRotor
                          ? 'bg-blue-600 border-cyan-400 text-white shadow'
                          : 'bg-slate-900 border-dashed border-slate-600 text-slate-500'
                      }`}
                    >
                      <span className="text-[8px] font-bold">{sampleInRotor ? 'DNA' : '1'}</span>
                    </div>

                    {/* Slot 4: Counterbalance */}
                    <div
                      onClick={() => setCounterbalanceInRotor(!counterbalanceInRotor)}
                      className={`absolute bottom-2 w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                        counterbalanceInRotor
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                          : 'bg-slate-900 border-dashed border-slate-600 text-slate-500'
                      }`}
                    >
                      <span className="text-[8px] font-bold">{counterbalanceInRotor ? 'BAL' : '4'}</span>
                    </div>

                    <div className="absolute top-8 right-2 w-7 h-7 rounded-full bg-slate-900/60 border border-slate-700" />
                    <div className="absolute bottom-8 right-2 w-7 h-7 rounded-full bg-slate-900/60 border border-slate-700" />
                    <div className="absolute bottom-8 left-2 w-7 h-7 rounded-full bg-slate-900/60 border border-slate-700" />
                    <div className="absolute top-8 left-2 w-7 h-7 rounded-full bg-slate-900/60 border border-slate-700" />
                  </div>

                  {/* Lid Controller */}
                  <div className="flex flex-col items-center sm:items-end space-y-2">
                    <span className={`text-xs font-bold ${sampleInRotor && counterbalanceInRotor ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sampleInRotor && counterbalanceInRotor ? 'Rotor Seimbang 180°' : 'Pasang kedua tabung di slot 1 & 4'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setLidClosed(!lidClosed);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        lidClosed
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                          : 'bg-amber-600 text-white border-amber-400 animate-pulse'
                      }`}
                    >
                      {lidClosed ? 'Buka Penutup Mesin' : 'Kunci Penutup Pengaman'}
                    </button>
                  </div>
                </div>

                {/* Speed & Timer Controls */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/80 border-2 border-slate-700 font-mono shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">SPEED (RPM)</span>
                    <span className="text-3xl font-black text-cyan-400 tracking-wider">
                      {isRunning ? currentRpm : rpmSetting}
                    </span>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={() => setRpmSetting((r) => Math.max(1000, r - 1000))}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                      >
                        -1000
                      </button>
                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={() => setRpmSetting((r) => Math.min(14000, r + 1000))}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                      >
                        +1000
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">TIMER (MENIT)</span>
                    <span className="text-3xl font-black text-amber-400 tracking-wider">
                      {isRunning ? countdownSeconds : timeSettingMin}
                    </span>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={() => setTimeSettingMin((t) => Math.max(1, t - 1))}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={() => setTimeSettingMin((t) => Math.min(30, t + 1))}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={handleStartCentrifuge}
                  className={`w-full py-3 px-6 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                    isRunning
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-600/40 active:scale-95'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isRunning ? 'SEDANG SENTRIFUGASI BERPUTAR...' : 'START SENTRIFUS'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs pt-2">
              <span className="text-slate-300">
                Status: <strong className="text-emerald-400">{centrifugeDone ? 'Sentrifugasi Selesai!' : 'Siap Dijalankan'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep('ethanol_two_tubes')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke Pemisahan DNA & Presipitasi Etanol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEP 3: 2 TUBES -> REALISTIC MICROPIPETTE SUPERNATANT -> COLD ETHANOL GLIDE & POUR -> GENTLE SHAKE ----------------- */}
        {currentStep === 'ethanol_two_tubes' && (
          <div className="relative w-full min-h-[440px] flex flex-col justify-between">
            <div className="text-center space-y-1">
              <div className="inline-block bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
                Gunakan mikropipet untuk menyedot supernatan DNA dari Tabung 1 (buka tutupnya) dan pindahkan ke Tabung 2 (buka tutupnya). Lalu tuang etanol dingin 95%, tutup tabung, dan goyangkan sedikit.
              </div>
            </div>

            {/* Alert banner for closed caps */}
            {step3CapAlert && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-rose-950 border-2 border-rose-500 text-rose-200 text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{step3CapAlert}</span>
              </div>
            )}

            {/* Realistic Draggable Micropipette for Step 3 */}
            <RealisticMicropipette
              volumeMicroLiters={step3PipetteVol}
              onVolumeChange={(v) => setStep3PipetteVol(v)}
              liquidColor="#bae6fd"
              liquidAmountPct={step3PipetteLiquidPct}
              onAspirate={handleAspirateSupernatantPipette}
              onDispense={handleDispenseSupernatantPipette}
              canAspirate={step3PipetteLiquidPct === 0 && tube1HasSupernatant}
              canDispense={step3PipetteLiquidPct > 0}
              isTargetCapOpen={tube2Step3CapOpen}
              onAttemptDispenseWithClosedCap={() => {
                setStep3CapAlert('Buka tutup Tabung 2 terlebih dahulu!');
                setTimeout(() => setStep3CapAlert(null), 2500);
              }}
              labelSource="Tabung 1 (Supernatan)"
              labelTarget="Tabung 2 (Tabung DNA)"
              sourcePos={{ x: 120, y: 15 }}
              targetPos={{ x: 380, y: 15 }}
            />

            {/* Bench Equipment Stations: Tabung 1, Tabung 2, and Cold Ethanol Bottle */}
            <div className="flex items-end justify-around w-full max-w-3xl mx-auto pt-24 pb-2 relative">
              {/* STATION 1: TABUNG 1 (Hasil Sentrifugasi: Pelet di dasar & Supernatan di atas) */}
              <div className="flex flex-col items-center z-10">
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setTube1Step3CapOpen(!tube1Step3CapOpen);
                  }}
                  className="cursor-pointer flex flex-col items-center"
                  title="Klik Tutup Tabung 1 untuk Buka / Tutup"
                >
                  {/* Hinged Snap Cap */}
                  <div
                    className={`w-7 h-3 rounded-t bg-blue-600 border border-blue-400 shadow transition-all duration-200 ${
                      tube1Step3CapOpen ? '-rotate-60 -translate-x-3 -translate-y-2' : ''
                    }`}
                  />
                  {/* Tube Body */}
                  <div
                    className="relative w-12 h-36 bg-slate-100/15 border-2 border-slate-300/60 rounded-b-2xl shadow-xl flex flex-col justify-between p-1 overflow-hidden"
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',
                    }}
                  >
                    {/* Top Supernatant Layer */}
                    <div
                      className={`w-full transition-all duration-300 rounded-t ${
                        tube1HasSupernatant ? 'h-24 bg-cyan-300/40 border-b border-cyan-200/50' : 'h-6 bg-transparent'
                      }`}
                    >
                      <span className="text-[7px] font-bold text-cyan-200 block text-center mt-1">
                        {tube1HasSupernatant ? 'Supernatan DNA' : '(Tersedot)'}
                      </span>
                    </div>

                    {/* Bottom Insoluble Cell Debris Pellet */}
                    <div className="w-full h-8 bg-amber-800 rounded-b-xl flex items-center justify-center">
                      <span className="text-[7px] font-black text-amber-200 uppercase">Pelet</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-xs font-bold text-slate-300 block">Tabung 1 (Sentrifus)</span>
                  <span className={`text-[10px] font-bold block ${tube1Step3CapOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tube1Step3CapOpen ? 'Tutup Terbuka' : 'Tutup Tertutup (Klik Buka)'}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {tube1HasSupernatant ? 'Siap disedot pipet' : 'Supernatan telah dipindahkan'}
                  </span>
                </div>
              </div>

              {/* STATION 2: TABUNG 2 (Tabung DNA Baru yang menerima supernatan + etanol dingin) */}
              <div className="flex flex-col items-center z-10">
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setTube2Step3CapOpen(!tube2Step3CapOpen);
                  }}
                  className={`cursor-pointer flex flex-col items-center ${isShaking ? 'animate-bounce' : ''}`}
                  title="Klik Tutup Tabung 2 untuk Buka / Tutup"
                >
                  {/* Hinged Snap Cap */}
                  <div
                    className={`w-7 h-3 rounded-t bg-emerald-600 border border-emerald-400 shadow transition-all duration-200 ${
                      tube2Step3CapOpen ? '-rotate-60 -translate-x-3 -translate-y-2' : ''
                    }`}
                  />
                  {/* Tube Body */}
                  <div
                    className="relative w-12 h-36 bg-slate-100/15 border-2 border-emerald-400/60 rounded-b-2xl shadow-xl flex flex-col justify-end p-1 overflow-hidden"
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',
                    }}
                  >
                    {tube2HasDNA && (
                      <div
                        className="w-full bg-cyan-400/40 border-t border-cyan-200 rounded-b-xl flex flex-col items-center justify-center relative transition-all duration-300"
                        style={{
                          height: `${ethanolVolume > 0 ? '90%' : '55%'}`,
                        }}
                      >
                        {/* Precipitated White DNA Strands */}
                        {(ethanolVolume > 0 || shakeDone) && (
                          <div className="w-8 h-16 border-l-2 border-r-2 border-dashed border-white/95 animate-pulse flex items-center justify-center">
                            <span className="text-[7px] font-black text-white bg-slate-950/60 px-1 rounded">
                              DNA
                            </span>
                          </div>
                        )}
                        <span className="text-[7px] font-black text-cyan-200 text-center leading-tight">
                          {shakeDone
                            ? 'Presipitat DNA Nyata'
                            : ethanolVolume > 0
                            ? 'Etanol + DNA'
                            : 'Supernatan DNA'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-center space-y-1">
                  <span className="text-xs font-bold text-emerald-300 block">Tabung 2 (DNA Baru)</span>
                  <span className={`text-[10px] font-bold block ${tube2Step3CapOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {tube2Step3CapOpen ? 'Tutup Terbuka' : 'Tutup Tertutup'}
                  </span>

                  {tube2HasDNA && ethanolVolume > 0 && (
                    <button
                      type="button"
                      onClick={handleGentleShake}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        !tube2Step3CapOpen
                          ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400 shadow-md'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {shakeDone ? '✓ Sudah Digoyang Sedikit' : 'Goyangkan Sedikit Tabung 2'}
                    </button>
                  )}
                </div>
              </div>

              {/* STATION 3: COLD ETHANOL 95% BOTTLE (Physically Glides and Tilts directly above Tabung 2) */}
              <div className="flex flex-col items-center z-20">
                <div
                  onClick={handleGlideAndPourEthanol}
                  style={{
                    transform: isEthanolNearTube2
                      ? (isPouringEthanol ? 'translate(-210px, -30px) rotate(55deg)' : 'translate(-190px, -30px) rotate(0deg)')
                      : 'translate(0px, 0px) rotate(0deg)',
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  className={`cursor-pointer flex flex-col items-center relative ${
                    !tube2HasDNA ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  title={tube2HasDNA ? 'Klik untuk Menggeser & Menuangkan Etanol Dingin ke Tabung 2' : 'Pindahkan supernatan ke Tabung 2 terlebih dahulu'}
                >
                  {/* Bottle Cap */}
                  <div
                    className={`w-9 h-5 rounded-t-md bg-slate-800 border-2 border-slate-500 transition-all ${
                      isEthanolCapOpen ? '-translate-y-3 rotate-12' : ''
                    }`}
                  />
                  <div className="w-5 h-4 bg-cyan-200/40 border-x border-cyan-400" />
                  {/* Bottle Body */}
                  <div className="w-24 h-32 rounded-2xl bg-gradient-to-b from-cyan-950 via-blue-950 to-slate-900 border-2 border-cyan-400 shadow-2xl flex flex-col items-center justify-center p-2 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/40" />
                    <span className="text-[7px] font-black text-cyan-200 uppercase text-center leading-tight">
                      ETANOL DINGIN 95% (-20°C)
                    </span>
                  </div>

                  {/* Flowing Frosty Stream from Bottle into Tabung 2 */}
                  {isPouringEthanol && (
                    <div className="absolute -bottom-16 left-2 w-2 h-20 bg-gradient-to-b from-white via-cyan-200 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-300/80 z-40" />
                  )}
                </div>

                <div className="mt-2 text-center space-y-1">
                  <span className="text-xs font-bold text-cyan-300 block">Etanol Dingin 95%</span>
                  <span className="text-[10px] text-cyan-400 font-mono block">
                    Terisi: {ethanolVolume.toFixed(1)} mL
                  </span>
                  <button
                    type="button"
                    onClick={handleGlideAndPourEthanol}
                    disabled={!tube2HasDNA || isPouringEthanol}
                    className="px-3 py-1 rounded-lg text-[10px] font-bold bg-cyan-800 hover:bg-cyan-700 disabled:opacity-40 text-white border border-cyan-500 cursor-pointer transition-all"
                  >
                    Tuang ke Tabung 2
                  </button>
                </div>
              </div>
            </div>

            {/* Finish Meja 2 button directly leading to 3D room and Meja 3 */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleCompleteMeja2}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-xl shadow-emerald-600/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SELESAI MEJA 2 & LANJUT KE MEJA 3 (SPEKTROFOTOMETRI)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
