import React, { useState, useEffect } from 'react';
import { LabExperimentalData } from '../../types/lab';
import { 
  ArrowLeft, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface Workbench1Props {
  labData: LabExperimentalData;
  onUpdateLabData: (data: Partial<LabExperimentalData>) => void;
  onCompleteTable1: () => void;
  onBackTo3D: () => void;
  onReset: () => void;
}

type Step1Key = 'cut_and_weigh' | 'mortar_crush1' | 'lysis_and_crush2' | 'filtration';

export const Workbench1: React.FC<Workbench1Props> = ({
  labData,
  onUpdateLabData,
  onCompleteTable1,
  onBackTo3D,
  onReset,
}) => {
  const [currentStep, setCurrentStep] = useState<Step1Key>('cut_and_weigh');
  const [showGuide, setShowGuide] = useState(false);

  // STEP 1: CUTTING & WEIGHING (SIDE-BY-SIDE)
  const [chopStage, setChopStage] = useState(0);
  const [isChopping, setIsChopping] = useState(false);
  const [dicedPiles, setDicedPiles] = useState<Array<{ id: number; weight: number; onScale: boolean }>>([]);
  const [isTared, setIsTared] = useState(false);

  // STEP 2: FIRST CRUSHING IN MORTAR
  const [pestleOffset, setPestleOffset] = useState({ x: 0, y: -45, rot: 15 });
  const [isStriking, setIsStriking] = useState(false);
  const [crushHits, setCrushHits] = useState(labData.jumlahPenghancuran || 0);

  // STEP 3: LYSIS BUFFER IN BEAKER -> GLIDE CLOSE TO MORTAR -> TILT & POUR -> CRUSH AGAIN
  const [isLysisCapOpen, setIsLysisCapOpen] = useState(false);
  const [lysisTiltAngle, setLysisTiltAngle] = useState(0);
  const [isPouringFromBottle, setIsPouringFromBottle] = useState(false);
  const [beakerLysisVol, setBeakerLysisVol] = useState(0); // in beaker
  const [mortarLysisVol, setMortarLysisVol] = useState(0); // poured to mortar
  const [isBeakerNearMortar, setIsBeakerNearMortar] = useState(false);
  const [isPouringBeakerToMortar, setIsPouringBeakerToMortar] = useState(false);
  const [crushHitsWithLysis, setCrushHitsWithLysis] = useState(0);

  // STEP 4: FILTRATION (MORTAR GLIDES CLOSE TO CORONG -> TILTS & POURS)
  const [paperInFunnel, setPaperInFunnel] = useState(false);
  const [isMortarNearFunnel, setIsMortarNearFunnel] = useState(false);
  const [isPouringToFunnel, setIsPouringToFunnel] = useState(false);
  const [filtrateProgress, setFiltrateProgress] = useState(0); // 0 to 100%

  // Bottle pour into beaker loop
  useEffect(() => {
    let interval: number;
    if (isPouringFromBottle) {
      soundFx.playPour();
      interval = window.setInterval(() => {
        setBeakerLysisVol((v) => Math.min(50, Math.round((v + 0.5) * 10) / 10));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPouringFromBottle]);

  // Filtration drip continuous interval
  useEffect(() => {
    let interval: number;
    if (isPouringToFunnel && filtrateProgress < 100) {
      interval = window.setInterval(() => {
        setFiltrateProgress((p) => {
          if (p >= 100) {
            setIsPouringToFunnel(false);
            setIsMortarNearFunnel(false);
            soundFx.playBeep(true);
            return 100;
          }
          return p + 4;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPouringToFunnel, filtrateProgress]);

  // Weighing calculations: only sum piles that have been transferred to the scale
  const activeWeight = dicedPiles
    .filter((p) => p.onScale)
    .reduce((sum, p) => sum + p.weight, 0);
  const displayedWeight = isTared ? 0.0 : Math.round(activeWeight * 10) / 10;

  // Sync to labData
  useEffect(() => {
    const finalMass = displayedWeight > 0 ? displayedWeight : (activeWeight > 0 ? activeWeight : 15.0);
    const finalLysis = (mortarLysisVol || beakerLysisVol) > 0 ? (mortarLysisVol || beakerLysisVol) : 15.0;
    const finalFiltrate = Math.round((finalMass * 0.78 + finalLysis * 0.72) * 10) / 10;
    const totalCrushHits = crushHits + crushHitsWithLysis;
    const finalCrushTime = Math.max(1, Math.round((totalCrushHits * 0.08) * 10) / 10);

    onUpdateLabData({
      massaBawang: finalMass,
      volumeEkstraksi: finalFiltrate,
      jumlahPenghancuran: totalCrushHits || 30,
      waktuPenghancuran: finalCrushTime,
      waktuInkubasi: 10.0,
    });
  }, [displayedWeight, activeWeight, mortarLysisVol, beakerLysisVol, crushHits, crushHitsWithLysis]);

  // 1. Knife Chop: knife sits directly above onion, chops down cleanly without text
  const handleChopKnife = () => {
    if (isChopping) return;
    setIsChopping(true);
    soundFx.playChop();

    setTimeout(() => {
      setChopStage((prev) => Math.min(5, prev + 1));
      const newPileWeight = Math.round((2.8 + Math.random() * 0.7) * 10) / 10;
      setDicedPiles((prev) => [
        ...prev,
        { id: prev.length + 1, weight: newPileWeight, onScale: false },
      ]);
      setIsChopping(false);
    }, 200);
  };

  const handleTogglePileToScale = (id: number) => {
    soundFx.playClick();
    setDicedPiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, onScale: !p.onScale } : p))
    );
  };

  const handleTransferAllToScale = () => {
    soundFx.playClick();
    setDicedPiles((prev) => prev.map((p) => ({ ...p, onScale: true })));
  };

  // 2. Mortar strike 1
  const handlePestleStrike1 = () => {
    if (isStriking) return;
    setIsStriking(true);
    soundFx.playGrind();
    setPestleOffset({
      x: (Math.random() - 0.5) * 18,
      y: 12,
      rot: (Math.random() - 0.5) * 15,
    });

    setTimeout(() => {
      setCrushHits((h) => h + 1);
      setPestleOffset({ x: 0, y: -45, rot: 15 });
      setIsStriking(false);
    }, 180);
  };

  // 3. Lysis Bottle pour to Beaker
  const toggleBottlePour = () => {
    if (!isLysisCapOpen) {
      soundFx.playClick();
      setIsLysisCapOpen(true);
      return;
    }
    if (isPouringFromBottle) {
      setIsPouringFromBottle(false);
      setLysisTiltAngle(0);
    } else {
      setIsPouringFromBottle(true);
      setLysisTiltAngle(65);
    }
  };

  // Beaker glides over close to Mortar then tilts to pour
  const handleGlideAndPourBeakerToMortar = () => {
    if (beakerLysisVol <= 0 || isPouringBeakerToMortar) return;
    // Step 1: Glide close to mortar
    setIsBeakerNearMortar(true);
    soundFx.playClick();

    setTimeout(() => {
      // Step 2: Tilt and pour
      setIsPouringBeakerToMortar(true);
      soundFx.playPour();

      setTimeout(() => {
        // Step 3: Complete transfer
        setMortarLysisVol((prev) => prev + beakerLysisVol);
        setBeakerLysisVol(0);
        setIsPouringBeakerToMortar(false);
        setTimeout(() => {
          setIsBeakerNearMortar(false);
          soundFx.playBeep(true);
        }, 500);
      }, 1200);
    }, 600);
  };

  // Pestle strike 2 (with lysis buffer in mortar)
  const handlePestleStrike2 = () => {
    if (isStriking) return;
    setIsStriking(true);
    soundFx.playGrind();
    setPestleOffset({
      x: (Math.random() - 0.5) * 18,
      y: 12,
      rot: (Math.random() - 0.5) * 15,
    });

    setTimeout(() => {
      setCrushHitsWithLysis((h) => h + 1);
      setPestleOffset({ x: 0, y: -45, rot: 15 });
      setIsStriking(false);
    }, 180);
  };

  // 4. Mortar glides close to Funnel then tilts to pour
  const handleGlideAndPourMortarToFunnel = () => {
    if (!paperInFunnel || isPouringToFunnel) return;
    // Step 1: Glide close to funnel
    setIsMortarNearFunnel(true);
    soundFx.playClick();

    setTimeout(() => {
      // Step 2: Tilt and start pouring
      setIsPouringToFunnel(true);
      soundFx.playPour();
    }, 600);
  };

  const handleCompleteMeja1 = () => {
    soundFx.playBeep(true);
    onCompleteTable1();
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
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
              MEJA 1 — PRAKTIKUM AKTIF
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Ekstraksi DNA Bawang Bombai (*Allium cepa*)
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
        <div className="p-3.5 rounded-2xl bg-blue-950/90 border border-cyan-400/40 text-xs text-slate-200 space-y-1 animate-in fade-in">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Petunjuk Langkah Meja 1:</span>
          </div>
          <p>• <strong>Iris & Timbang:</strong> Pisau berada di atas bawang. Klik pisau untuk mengiris sebagian bawang menjadi kecil-kecil, lalu letakkan di piringan neraca analitik.</p>
          <p>• <strong>Mortar & Alu:</strong> Tumbuk potongan bawang di dalam mortar hingga hancur.</p>
          <p>• <strong>Buffer Lisis ke Mortar:</strong> Tuang larutan lisis ke gelas beker, lalu miringkan beker untuk menuang larutan ke dalam mortar dan tumbuk kembali.</p>
          <p>• <strong>Penyaringan:</strong> Pasang kertas saring ke corong kaca, lalu miringkan mortar untuk menuangkan ekstrak ke corong penyaring.</p>
        </div>
      )}

      {/* Step Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'cut_and_weigh', label: '1. Pengirisan & Neraca Analitik' },
          { id: 'mortar_crush1', label: '2. Penghancuran Awal di Mortar' },
          { id: 'lysis_and_crush2', label: '3. Buffer Lisis & Penumbukan Ulang' },
          { id: 'filtration', label: '4. Penyaringan Filtrat' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(s.id as Step1Key)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
              currentStep === s.id
                ? 'bg-blue-600 border-cyan-400 text-white shadow-lg shadow-blue-500/40'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* WORKBENCH 1 STAGE */}
      <div className="relative min-h-[480px] rounded-3xl bg-gradient-to-b from-[#0e1628] via-[#090d16] to-[#0e1628] border-4 border-slate-700/80 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 opacity-30 border-b border-blue-400/30" />

        {/* ----------------- STEP 1: CUTTING & WEIGHING SIDE-BY-SIDE ----------------- */}
        {currentStep === 'cut_and_weigh' && (
          <div className="flex flex-col items-center justify-center space-y-5 text-center my-auto w-full">
            {/* Small Top Prompt Header */}
            <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
              Klik pisau di atas bawang untuk mengiris sebagian menjadi potongan kecil. Berat baru akan diketahui setelah potongan diletakkan di piringan neraca analitik.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl items-center">
              {/* LEFT: Hardwood Cutting Board with Knife DIRECTLY ABOVE the Onion */}
              <div className="relative h-72 rounded-2xl bg-amber-950/40 border-4 border-amber-900 shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
                <div className="relative flex-1 flex items-center justify-around z-10 pt-4">
                  {/* Onion Section with Knife Hovering DIRECTLY ABOVE */}
                  <div className="relative flex flex-col items-center">
                    {/* Real Chef Knife Positioned DIRECTLY ABOVE Onion (Clean, Zero Text) */}
                    <div
                      onClick={handleChopKnife}
                      style={{
                        transform: isChopping
                          ? 'translateY(28px) rotate(-8deg)'
                          : 'translateY(0px) rotate(4deg)',
                      }}
                      className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 cursor-pointer transition-transform duration-150 flex flex-col items-center"
                      title="Klik untuk Mengiris Bawang"
                    >
                      {/* Blade */}
                      <div className="w-24 h-8 bg-gradient-to-b from-slate-200 via-white to-slate-400 rounded-r-2xl border border-slate-300 shadow-xl flex items-end">
                        <div className="w-full h-1 bg-white" />
                      </div>
                      {/* Handle */}
                      <div className="w-12 h-4.5 bg-amber-950 rounded-l border border-amber-800 shadow -mt-2 -mr-10" />
                    </div>

                    {/* Onion Bulb (Uncut portion remains intact) */}
                    <div
                      className="relative w-22 h-22 rounded-full bg-gradient-to-br from-purple-800 via-purple-600 to-amber-700 border-2 border-purple-400/80 shadow-xl flex items-center justify-center transition-all duration-300 mt-2"
                      style={{
                        clipPath: chopStage === 0
                          ? 'none'
                          : `polygon(0% 0%, ${Math.max(30, 100 - chopStage * 14)}% 0%, ${Math.max(20, 100 - chopStage * 14)}% 100%, 0% 100%)`,
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-purple-950/80" />
                      <div className="absolute inset-2 rounded-full border border-purple-300/40 opacity-70" />
                    </div>
                  </div>

                  {/* Chopped Diced Pieces on Cutting Board (NO WEIGHT DISPLAYED BEFORE WEIGHING) */}
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-24 rounded-2xl bg-amber-900/30 border border-amber-700/50 p-2 flex flex-wrap gap-1.5 items-center justify-center overflow-y-auto">
                      {dicedPiles.length === 0 ? (
                        <span className="text-[9px] text-amber-300/60 text-center">
                          Klik pisau di atas bawang untuk mengiris
                        </span>
                      ) : (
                        dicedPiles.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleTogglePileToScale(p.id)}
                            className={`w-7 h-7 rounded-md text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                              p.onScale
                                ? 'bg-slate-800/60 border border-slate-700 text-slate-500 opacity-30 cursor-default'
                                : 'bg-gradient-to-br from-purple-400 via-purple-300 to-purple-200 text-purple-950 border border-purple-600 shadow hover:scale-110 active:scale-95'
                            }`}
                            title={p.onScale ? `Potongan #${p.id} (Sudah di neraca)` : `Klik untuk menaruh Potongan #${p.id} di neraca`}
                          >
                            #{p.id}
                          </button>
                        ))
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-amber-200 mt-1">
                      Irisan Bawang ({dicedPiles.filter((p) => !p.onScale).length} di talenan)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs z-10 pt-1 border-t border-amber-900/60">
                  <span className="text-[11px] text-amber-300">
                    Klik irisan atau tombol untuk menaruh di neraca.
                  </span>
                  <button
                    type="button"
                    onClick={handleTransferAllToScale}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-800 hover:bg-amber-700 text-amber-100 border border-amber-600 cursor-pointer transition-all active:scale-95"
                  >
                    Pindahkan Semua ke Neraca
                  </button>
                </div>
              </div>

              {/* RIGHT: Digital Analytical Balance (WEIGHT ONLY KNOWN WHEN PLACED ON PAN) */}
              <div className="relative h-72 rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-4 border-slate-600 shadow-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      Neraca Analitik Presisi (0.01 g)
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                </div>

                {/* Glass Chamber with Pan */}
                <div className="relative w-full h-32 bg-cyan-950/20 border-2 border-cyan-400/30 rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="relative w-28 h-4 bg-gradient-to-r from-slate-300 via-white to-slate-400 rounded-full border border-slate-400 shadow-md flex items-center justify-center">
                    {/* Pieces physically placed on scale */}
                    {dicedPiles.filter((p) => p.onScale).length > 0 && (
                      <div className="absolute -top-4 flex items-center -space-x-1.5">
                        {dicedPiles
                          .filter((p) => p.onScale)
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleTogglePileToScale(p.id)}
                              className="w-5 h-5 rounded-md bg-purple-400 border border-purple-700 shadow-sm text-[7px] font-bold text-purple-950 flex items-center justify-center cursor-pointer hover:scale-110"
                              title={`Klik untuk mengembalikan potongan #${p.id} ke talenan`}
                            >
                              #{p.id}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Illuminated LCD Screen - Weight is calculated here after weighing */}
                <div className="w-full bg-[#031525] border-2 border-cyan-500/50 rounded-xl p-2.5 flex items-center justify-between font-mono shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase">NET</span>
                    <span className="text-[8px] text-slate-400">
                      {dicedPiles.filter((p) => p.onScale).length} potongan
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-cyan-300 tracking-wider">
                      {displayedWeight.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-cyan-400 ml-1">g</span>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsTared(!isTared);
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    {isTared ? 'Batal Tare' : 'Tare / Zero'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs pt-1">
              <span className="text-slate-300">
                {displayedWeight > 0 ? (
                  <>Massa Terukur: <strong className="text-cyan-400 font-mono text-base">{displayedWeight.toFixed(1)} g</strong></>
                ) : (
                  <span className="text-amber-300 text-xs font-semibold">
                    (Belum ada irisan di neraca analitik. Pindahkan irisan ke neraca untuk menimbang!)
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep('mortar_crush1')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Pindahkan Bawang ke Mortar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEP 2: FIRST CRUSHING IN MORTAR (CLEAN, NO TEXT ON TOOLS) ----------------- */}
        {currentStep === 'mortar_crush1' && (
          <div className="flex flex-col items-center justify-center space-y-5 text-center my-auto">
            <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
              Tekan alu ke dalam cawan mortar untuk menghancurkan potongan bawang hingga mulai halus.
            </div>

            <div className="relative w-80 h-72 flex flex-col items-center justify-end">
              {/* Pestle (Clean, zero text badges) */}
              <div
                onClick={handlePestleStrike1}
                style={{
                  transform: `translate(${pestleOffset.x}px, ${pestleOffset.y}px) rotate(${pestleOffset.rot}deg)`,
                }}
                className="absolute z-20 top-2 cursor-pointer transition-all duration-150 flex flex-col items-center"
                title="Tekan Alu untuk Menumbuk Bawang"
              >
                <div className="w-8 h-28 rounded-t-2xl bg-gradient-to-r from-slate-200 via-white to-slate-300 border-2 border-slate-400 shadow-xl" />
                <div className="w-12 h-10 rounded-b-3xl bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 border border-slate-400 shadow-inner -mt-1" />
              </div>

              {/* Porcelain Mortar Bowl */}
              <div
                onClick={handlePestleStrike1}
                className="relative z-10 w-72 h-40 rounded-b-[80px] bg-gradient-to-b from-slate-300 via-white to-slate-200 border-4 border-slate-400 shadow-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer"
              >
                <div className="w-64 h-32 rounded-b-[70px] bg-gradient-to-b from-slate-200 to-amber-100/30 shadow-inner border border-slate-300 flex items-center justify-center p-3 relative">
                  <div
                    className="w-44 h-18 rounded-full transition-all duration-300 flex items-center justify-center p-2 relative"
                    style={{
                      backgroundColor: crushHits < 12 ? '#c084fc' : crushHits < 30 ? '#9333ea' : '#7e22ce',
                      opacity: Math.min(1, 0.45 + crushHits * 0.015),
                      filter: `blur(${Math.min(3, crushHits * 0.08)}px)`,
                    }}
                  >
                    {crushHits < 15 && (
                      <div className="flex flex-wrap gap-1 items-center justify-center">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded bg-purple-200 border border-purple-500 shadow-xs" />
                        ))}
                      </div>
                    )}
                    {crushHits >= 15 && (
                      <span className="text-[10px] font-black text-white/90">
                        {crushHits < 35 ? 'Mulai Halus & Berair' : 'Bubur Homogenat Sangat Halus'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-300">
                Tumbukan: <strong className="text-cyan-400 font-mono text-base">{crushHits} kali</strong>
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep('lysis_and_crush2')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke Penambahan Buffer Lisis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEP 3: LYSIS BUFFER IN BEAKER -> GLIDE CLOSE TO MORTAR -> TILT & POUR ----------------- */}
        {currentStep === 'lysis_and_crush2' && (
          <div className="flex flex-col items-center justify-center space-y-5 text-center my-auto w-full">
            <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
              Isi beker dengan buffer lisis dari botol, lalu geser beker mendekati bibir mortar untuk menuangkannya ke dalam mortar dan tumbuk kembali.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center w-full max-w-4xl relative">
              {/* LEFT: Bottle & Beaker */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-around h-72 relative">
                {/* Lysis Bottle */}
                <div
                  onClick={toggleBottlePour}
                  style={{
                    transform: `rotate(${lysisTiltAngle}deg)`,
                  }}
                  className="cursor-pointer transition-transform duration-300 flex flex-col items-center z-10"
                  title="Klik untuk Menuang ke Beker"
                >
                  <div
                    className={`w-9 h-5 rounded-t-md bg-slate-900 border-2 border-slate-600 shadow transition-all ${
                      isLysisCapOpen ? '-translate-y-4 rotate-12 opacity-80' : ''
                    }`}
                  />
                  <div className="w-5 h-5 bg-amber-700 border-x border-amber-900" />
                  <div className="w-24 h-32 rounded-2xl bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-600 shadow-xl flex flex-col items-center justify-center p-1">
                    <div className="w-18 bg-amber-100 rounded p-1 text-[7px] text-amber-950 font-bold leading-tight">
                      BUFFER LISIS (SDS+NaCl)
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">
                    {isPouringFromBottle ? 'Sedang Menuang...' : isLysisCapOpen ? 'Klik untuk Tuang' : 'Klik Buka Tutup'}
                  </span>
                </div>

                {/* Glass Beaker (Physically Glides and Positions Next to Mortar Lip) */}
                <div
                  onClick={handleGlideAndPourBeakerToMortar}
                  style={{
                    transform: isBeakerNearMortar
                      ? (isPouringBeakerToMortar ? 'translate(260px, -20px) rotate(52deg)' : 'translate(240px, -20px) rotate(0deg)')
                      : 'translate(0px, 0px) rotate(0deg)',
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  className="cursor-pointer flex flex-col items-center z-30 relative"
                  title={beakerLysisVol > 0 ? 'Klik untuk Menggeser & Menuang ke Mortar' : 'Isi larutan dari botol terlebih dahulu'}
                >
                  <div className="relative w-28 h-36 rounded-b-2xl border-x-2 border-b-2 border-cyan-400/60 bg-cyan-950/20 shadow-2xl flex flex-col justify-end p-2 overflow-hidden">
                    {/* Spout notch on top right */}
                    <div className="absolute top-0 right-0 w-3 h-2 bg-cyan-400/40 rounded-tr" />
                    <div
                      className="w-full bg-cyan-400/50 rounded-b-xl transition-all duration-200 border-t-2 border-cyan-300"
                      style={{
                        height: `${Math.min(100, (beakerLysisVol / 50) * 100)}%`,
                      }}
                    />
                  </div>

                  {/* Flowing liquid stream from beaker spout into mortar when pouring */}
                  {isPouringBeakerToMortar && (
                    <div className="absolute -bottom-16 right-2 w-2 h-20 bg-gradient-to-b from-cyan-300 to-cyan-500 rounded-full animate-pulse shadow-lg shadow-cyan-400/60 z-40" />
                  )}

                  <span className="text-[10px] text-cyan-300 font-mono mt-1 font-bold">
                    {beakerLysisVol.toFixed(1)} mL
                  </span>
                  <span className="text-[9px] text-cyan-400/80">
                    {isPouringBeakerToMortar ? 'Mengalirkan ke mortar...' : 'Klik Geser & Tuang'}
                  </span>
                </div>
              </div>

              {/* RIGHT: Mortar & Alu (Receives Lysis Buffer & Can be crushed again) */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center h-72 relative">
                {/* Pestle */}
                <div
                  onClick={handlePestleStrike2}
                  style={{
                    transform: `translate(${pestleOffset.x}px, ${pestleOffset.y}px) rotate(${pestleOffset.rot}deg)`,
                  }}
                  className="absolute z-20 top-2 cursor-pointer transition-all duration-150 flex flex-col items-center"
                  title="Tekan Alu untuk Menumbuk Homogenat dengan Buffer Lisis"
                >
                  <div className="w-7 h-24 rounded-t-2xl bg-gradient-to-r from-slate-200 via-white to-slate-300 border-2 border-slate-400 shadow-lg" />
                  <div className="w-10 h-8 rounded-b-2xl bg-slate-300 border border-slate-400 shadow-inner -mt-1" />
                </div>

                {/* Mortar Bowl */}
                <div
                  onClick={handlePestleStrike2}
                  className="relative z-10 w-64 h-36 rounded-b-[70px] bg-gradient-to-b from-slate-300 via-white to-slate-200 border-4 border-slate-400 shadow-xl flex flex-col items-center justify-center overflow-hidden cursor-pointer"
                >
                  <div className="w-56 h-28 rounded-b-[60px] bg-gradient-to-b from-slate-200 to-amber-100/30 shadow-inner border border-slate-300 flex items-center justify-center p-2">
                    <div
                      className="w-40 h-16 rounded-full transition-all duration-300 flex items-center justify-center"
                      style={{
                        backgroundColor: mortarLysisVol > 0 ? '#7e22ce' : '#9333ea',
                        opacity: 0.9,
                        boxShadow: mortarLysisVol > 0 ? 'inset 0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                      }}
                    >
                      <span className="text-[9px] font-black text-white">
                        {mortarLysisVol > 0 ? 'Ekstrak Bawang + Buffer Lisis' : 'Homogenat Bawang'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-cyan-300 font-mono mt-2">
                  Lisis di Mortar: {mortarLysisVol.toFixed(1)} mL | Tumbukan ke-2: {crushHitsWithLysis}x
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleGlideAndPourBeakerToMortar}
                disabled={beakerLysisVol <= 0 || isPouringBeakerToMortar}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white shadow-md cursor-pointer transition-all"
              >
                Tuang Beker ke Mortar
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('filtration')}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjut ke Penyaringan Filtrat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEP 4: FILTRATION (MORTAR GLIDES CLOSE TO CORONG -> TILTS & POURS) ----------------- */}
        {currentStep === 'filtration' && (
          <div className="flex flex-col items-center justify-center space-y-5 text-center my-auto w-full">
            <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
              Pasang kertas saring ke corong kaca, lalu klik mortar untuk menggeser mendekati corong dan menuangkan ekstrak ke corong penyaring.
            </div>

            <div className="flex items-center justify-around w-full max-w-3xl relative h-72">
              {/* Circular Filter Paper (Click to seat in funnel) */}
              {!paperInFunnel && (
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setPaperInFunnel(true);
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                  title="Klik untuk Memasang Kertas Saring ke Corong"
                >
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-slate-300 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-[8px] font-black text-slate-700 text-center">
                      Whatman No. 1
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-bold mt-1.5">
                    Kertas Saring (Klik Pasang)
                  </span>
                </div>
              )}

              {/* Mortar & Alu (Physically Glides and Tilts directly above the Funnel Lip) */}
              <div
                onClick={handleGlideAndPourMortarToFunnel}
                style={{
                  transform: isMortarNearFunnel
                    ? (isPouringToFunnel ? 'translate(220px, -45px) rotate(48deg)' : 'translate(200px, -45px) rotate(0deg)')
                    : 'translate(0px, 0px) rotate(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                className={`cursor-pointer flex flex-col items-center z-30 relative ${
                  !paperInFunnel ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title={paperInFunnel ? 'Klik Mortar untuk Menggeser & Menuang Ekstrak ke Corong' : 'Pasang kertas saring terlebih dahulu'}
              >
                <div className="relative w-36 h-20 rounded-b-[40px] bg-gradient-to-b from-slate-300 via-white to-slate-200 border-2 border-slate-400 shadow-2xl flex flex-col justify-end p-1 overflow-hidden">
                  <div className="w-full h-8 bg-purple-700/80 rounded-b-xl" />
                </div>

                {/* Purple Liquid Stream Pouring from Mortar into the Funnel */}
                {isPouringToFunnel && (
                  <div className="absolute -bottom-16 right-4 w-2.5 h-20 bg-gradient-to-b from-purple-600 via-purple-500 to-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-500/60 z-40" />
                )}

                <span className="text-[10px] text-slate-300 font-bold mt-1">
                  Mortar Ekstrak
                </span>
                <span className="text-[9px] text-cyan-400">
                  {isPouringToFunnel ? 'Sedang mengalirkan...' : 'Klik Geser & Tuang'}
                </span>
              </div>

              {/* Glass Funnel over Receiving Beaker/Flask */}
              <div className="flex flex-col items-center z-10">
                {/* Glass Funnel */}
                <div
                  className="relative w-28 h-20 bg-cyan-300/10 border-x-2 border-cyan-300/50 shadow flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 55% 100%, 45% 100%)',
                  }}
                >
                  {paperInFunnel && (
                    <div className="w-20 h-14 bg-white/90 rounded-b-xl border border-slate-300 shadow-inner flex items-center justify-center animate-in zoom-in-75">
                      <span className="text-[7px] font-black text-slate-700">Kertas Saring</span>
                    </div>
                  )}
                </div>

                {/* Funnel Stem */}
                <div className="w-3 h-8 bg-cyan-300/30 border-x border-cyan-400 relative">
                  {isPouringToFunnel && (
                    <div className="absolute inset-0 bg-cyan-400/80 animate-pulse" />
                  )}
                </div>

                {/* Receiving Glass Flask */}
                <div className="relative w-36 h-36 bg-cyan-950/20 border-2 border-cyan-400/40 rounded-b-3xl shadow-2xl flex flex-col justify-end p-2 overflow-hidden -mt-2">
                  <div
                    className="w-full bg-cyan-400/50 rounded-b-2xl transition-all duration-300 border-t border-cyan-300"
                    style={{
                      height: `${filtrateProgress}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-cyan-300 font-bold mt-1">
                  Filtrat Ekstrak DNA ({filtrateProgress}%)
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleGlideAndPourMortarToFunnel}
                disabled={!paperInFunnel || isPouringToFunnel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white shadow-md cursor-pointer transition-all"
              >
                Tuang Ekstrak ke Corong
              </button>

              <button
                type="button"
                onClick={handleCompleteMeja1}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-xl shadow-emerald-600/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SELESAI MEJA 1 & LANJUT KE MEJA 2 (SENTRIFUS)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
