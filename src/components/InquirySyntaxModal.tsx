import React, { useState, useEffect } from 'react';
import { InquiryStep, InquiryData, TableStatus, LabExperimentalData, TableId } from '../types/lab';
import { 
  Eye, 
  HelpCircle, 
  Lightbulb, 
  FlaskConical, 
  Scale, 
  CheckCircle2, 
  X, 
  Save, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Play, 
  FileText, 
  Download, 
  Sparkles,
  Info
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface InquirySyntaxModalProps {
  isOpen: boolean;
  initialStep?: InquiryStep;
  onClose: () => void;
  inquiryData: InquiryData;
  onSaveInquiryData: (data: InquiryData) => void;
  tableStatus: TableStatus;
  labData: LabExperimentalData;
  onStartExperiment: () => void;
  onEnterTableDirect?: (tableId: TableId) => void;
}

export const SYNTAX_STEPS_INFO = [
  { step: 1 as InquiryStep, name: 'Orientasi', desc: 'Pengamatan fenomena & pertanyaan pemantik' },
  { step: 2 as InquiryStep, name: 'Merumuskan Masalah', desc: 'Perumusan masalah penyelidikan' },
  { step: 3 as InquiryStep, name: 'Merumuskan Hipotesis', desc: 'Penyusunan dugaan sementara' },
  { step: 4 as InquiryStep, name: 'Mengumpulkan Data', desc: 'Eksperimen 3 meja laboratorium' },
  { step: 5 as InquiryStep, name: 'Menguji Hipotesis', desc: 'Analisis data & perbandingan hipotesis' },
  { step: 6 as InquiryStep, name: 'Merumuskan Kesimpulan', desc: 'Penarikan kesimpulan akhir' },
];

export const InquirySyntaxModal: React.FC<InquirySyntaxModalProps> = ({
  isOpen,
  initialStep = 1,
  onClose,
  inquiryData,
  onSaveInquiryData,
  tableStatus,
  labData,
  onStartExperiment,
  onEnterTableDirect,
}) => {
  const [currentStep, setCurrentStep] = useState<InquiryStep>(initialStep);
  const [localData, setLocalData] = useState<InquiryData>(inquiryData);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    setLocalData(inquiryData);
  }, [inquiryData]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    soundFx.playBeep(true);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3000);
  };

  const handleSaveStep1 = () => {
    const updated: InquiryData = {
      ...localData,
      orientasiSavedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalData(updated);
    onSaveInquiryData(updated);
    showToast('Jawaban Orientasi berhasil disimpan!');
  };

  const handleSaveStep2 = () => {
    const updated: InquiryData = {
      ...localData,
      masalahSavedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalData(updated);
    onSaveInquiryData(updated);
    showToast('Rumusan masalah berhasil disimpan!');
  };

  const handleSaveStep3 = () => {
    const updated: InquiryData = {
      ...localData,
      hipotesisSavedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalData(updated);
    onSaveInquiryData(updated);
    showToast('Hipotesis berhasil disimpan!');
  };

  const handleSaveStep5 = () => {
    const updated: InquiryData = {
      ...localData,
      ujiHipotesisSavedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalData(updated);
    onSaveInquiryData(updated);
    showToast('Jawaban Uji Hipotesis berhasil disimpan!');
  };

  const handleSaveStep6 = () => {
    const updated: InquiryData = {
      ...localData,
      kesimpulanSavedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalData(updated);
    onSaveInquiryData(updated);
    showToast('Kesimpulan berhasil disimpan!');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const isStepComplete = (step: InquiryStep): boolean => {
    switch (step) {
      case 1:
        return Boolean(localData.orientasiAnswer?.trim());
      case 2:
        return Boolean(localData.masalahAnswer?.trim());
      case 3:
        return Boolean(localData.hipotesisAnswer?.trim());
      case 4:
        return tableStatus.table1Completed && tableStatus.table2Completed && tableStatus.table3Completed;
      case 5:
        return Boolean(
          localData.ujiHipotesisAnswers?.q1?.trim() ||
          localData.ujiHipotesisAnswers?.q2?.trim() ||
          localData.ujiHipotesisAnswers?.q3?.trim() ||
          localData.ujiHipotesisAnswers?.q4?.trim() ||
          localData.ujiHipotesisAnswers?.q5?.trim() ||
          localData.ujiHipotesisAnswers?.q6?.trim()
        );
      case 6:
        return Boolean(localData.kesimpulanAnswer?.trim());
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#09152b] border-2 border-blue-500/40 shadow-2xl overflow-hidden">
        
        {/* Top Header matching reference image dark-navy banner */}
        <div className="px-5 py-3 sm:px-6 sm:py-4 bg-[#061021] border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Vertical DNA Ladder Glyph */}
            <div className="w-5 h-8 flex flex-col justify-between items-center py-1">
              <div className="w-4 h-1 bg-cyan-400 rounded-full" />
              <div className="w-2.5 h-1 bg-blue-400 rounded-full" />
              <div className="w-4 h-1 bg-cyan-400 rounded-full" />
              <div className="w-3 h-1 bg-blue-300 rounded-full" />
              <div className="w-4 h-1 bg-cyan-400 rounded-full" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
                SINTAKS MODEL PEMBELAJARAN INKUIRI
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Tahap {currentStep}: {SYNTAX_STEPS_INFO[currentStep - 1].name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 SYMBOLS IN A ROW ("SIMBOL BERDERET, SIMBOL SAJA YA") matching reference board */}
        <div className="bg-[#0b1933] px-3 py-2.5 sm:px-6 sm:py-3 border-b border-blue-900/40 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mx-auto">
            {SYNTAX_STEPS_INFO.map((item) => {
              const isActive = currentStep === item.step;
              const isDone = isStepComplete(item.step);

              return (
                <button
                  key={item.step}
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentStep(item.step);
                  }}
                  className={`group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transition-all transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.7)] border-2 border-cyan-300 scale-105'
                      : isDone
                      ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:border-emerald-400 hover:text-white'
                      : 'bg-slate-900/80 border border-blue-900/60 text-slate-400 hover:text-white hover:border-blue-400'
                  }`}
                  title={`${item.step}. ${item.name}`}
                >
                  {/* Icon Only according to "SIMBOL SAJA YA" */}
                  {item.step === 1 && <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {item.step === 2 && <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {item.step === 3 && <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {item.step === 4 && <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {item.step === 5 && <Scale className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {item.step === 6 && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}

                  {/* Little status badge dot */}
                  {isDone && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toast Notification */}
        {saveSuccessMsg && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Scrollable Step Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* STEP 1: ORIENTASI */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block">
                  Bacalah fenomena berikut dengan saksama:
                </span>
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  DNA merupakan materi genetik yang terdapat di dalam sel. Untuk memperoleh DNA dari jaringan bawang bombai, diperlukan proses penghancuran jaringan, pemecahan sel, pemisahan komponen sel, dan pengukuran kualitas DNA.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider block">
                  Pertanyaan pemantik:
                </span>
                <blockquote className="text-sm sm:text-base text-cyan-200 font-semibold italic border-l-4 border-cyan-400 pl-3 py-1">
                  &ldquo;Bagaimana cara memperoleh DNA dari jaringan bawang bombai, memisahkannya dari komponen sel lainnya, serta mengetahui konsentrasi dan kemurniannya?&rdquo;
                </blockquote>
              </div>

              {/* Textarea for Student's Answer */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Tuliskan jawaban Anda terhadap pertanyaan pemantik di atas:
                </label>
                <textarea
                  rows={4}
                  value={localData.orientasiAnswer || ''}
                  onChange={(e) => setLocalData({ ...localData, orientasiAnswer: e.target.value })}
                  placeholder="Ketikkan analisis awal dan gagasan Anda di sini..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm leading-relaxed resize-y outline-none transition-all placeholder:text-slate-500"
                />
                {localData.orientasiSavedAt && (
                  <p className="text-[11px] text-slate-400">
                    Tersimpan pada: {localData.orientasiSavedAt}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={handleSaveStep1}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Jawaban</span>
                </button>

                <button
                  onClick={() => {
                    handleSaveStep1();
                    setCurrentStep(2);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Tahap 2: Merumuskan Masalah</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MERUMUSKAN MASALAH */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  Berdasarkan fenomena dan pertanyaan pemantik yang telah kamu amati, buatlah rumusan masalah berupa pertanyaan yang akan kamu selidiki melalui praktikum isolasi DNA bawang bombai.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-400/30 text-xs sm:text-sm text-cyan-200">
                  <span className="font-bold text-white block mb-1">Petunjuk Perumusan Masalah:</span>
                  Tuliskan rumusan masalah menggunakan kalimat tanya yang jelas dan berkaitan dengan proses ekstraksi, sentrifugasi, serta pengukuran DNA menggunakan spektrofotometer UV-Vis.
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Kolom Rumusan Masalah:
                </label>
                <textarea
                  rows={4}
                  value={localData.masalahAnswer || ''}
                  onChange={(e) => setLocalData({ ...localData, masalahAnswer: e.target.value })}
                  placeholder="Contoh: Bagaimana pengaruh perlakuan buffer lisis dan kecepatan sentrifugasi terhadap kemurnian DNA bawang bombai yang terukur pada spektrofotometer?"
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm leading-relaxed resize-y outline-none transition-all placeholder:text-slate-500"
                />
                {localData.masalahSavedAt && (
                  <p className="text-[11px] text-slate-400">
                    Tersimpan pada: {localData.masalahSavedAt}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    onClick={handleSaveStep2}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Jawaban</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleSaveStep2();
                    setCurrentStep(3);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Tahap 3: Hipotesis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MERUMUSKAN HIPOTESIS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  Berdasarkan rumusan masalah yang telah kamu buat, susunlah hipotesis atau dugaan sementara mengenai hasil yang mungkin diperoleh dari proses isolasi DNA bawang bombai.
                </p>
                <div className="text-xs text-slate-300">
                  Tips: Hubungkan variabel perlakuan fisik/kimia (misal: penambahan buffer lisis, sentrifugasi, dan presipitasi etanol dingin) dengan hasil kemurnian dan rendemen DNA yang diharapkan.
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Kolom Rumusan Hipotesis (Dugaan Sementara):
                </label>
                <textarea
                  rows={4}
                  value={localData.hipotesisAnswer || ''}
                  onChange={(e) => setLocalData({ ...localData, hipotesisAnswer: e.target.value })}
                  placeholder="Contoh: Jika jaringan bawang bombai dilisis sempurna dan disentrifugasi pada kecepatan optimal, maka fraksi supernatan akan menghasilkan DNA dengan rasio A260/A280 berkisar 1.8..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm leading-relaxed resize-y outline-none transition-all placeholder:text-slate-500"
                />
                {localData.hipotesisSavedAt && (
                  <p className="text-[11px] text-slate-400">
                    Tersimpan pada: {localData.hipotesisSavedAt}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    onClick={handleSaveStep3}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Jawaban</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleSaveStep3();
                    setCurrentStep(4);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Tahap 4: Mengumpulkan Data</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MENGUMPULKAN DATA */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  Lakukan praktikum isolasi DNA bawang bombai melalui tiga meja laboratorium berikut. Ikuti petunjuk penggunaan alat dan lakukan setiap tahapan secara berurutan.
                </p>
              </div>

              {/* 3 Tables Status Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Meja 1 */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  tableStatus.table1Completed
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : 'bg-blue-950/30 border-blue-500/40'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-white">
                      MEJA 1
                    </span>
                    {tableStatus.table1Completed ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Selesai
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-cyan-300">Siap Dikerjakan</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">Persiapan & Ekstraksi DNA</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Pengirisan bawang, penimbangan neraca analitik, penumbukan mortar alu, buffer lisis, dan penyaringan filtrat.
                  </p>
                </div>

                {/* Meja 2 */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  tableStatus.table2Completed
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : tableStatus.table1Completed
                    ? 'bg-blue-950/30 border-blue-500/40'
                    : 'bg-slate-900/60 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-600 text-white">
                      MEJA 2
                    </span>
                    {tableStatus.table2Completed ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Selesai
                      </span>
                    ) : tableStatus.table1Completed ? (
                      <span className="text-xs font-bold text-cyan-300">Terbuka</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Terkunci
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">Sentrifugasi & Pemisahan DNA</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Pipet filtrat ke mikrosentrifus, balancing rotor, sentrifugasi bebas RPM/waktu, pemisahan supernatan, dan presipitasi etanol dingin 95%.
                  </p>
                  {!tableStatus.table1Completed && (
                    <span className="text-[10px] text-amber-300 font-semibold block mt-2">
                      * Selesaikan Meja 1 terlebih dahulu
                    </span>
                  )}
                </div>

                {/* Meja 3 */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  tableStatus.table3Completed
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : tableStatus.table2Completed
                    ? 'bg-blue-950/30 border-blue-500/40'
                    : 'bg-slate-900/60 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-600 text-white">
                      MEJA 3
                    </span>
                    {tableStatus.table3Completed ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Selesai
                      </span>
                    ) : tableStatus.table2Completed ? (
                      <span className="text-xs font-bold text-cyan-300">Terbuka</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Terkunci
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">Spektrofotometri UV-Vis</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Blanking buffer TE, kuvet kuarsa, pembacaan absorbansi A260 & A280, perhitungan kemurnian dan konsentrasi DNA.
                  </p>
                  {!tableStatus.table2Completed && (
                    <span className="text-[10px] text-amber-300 font-semibold block mt-2">
                      * Selesaikan Meja 2 terlebih dahulu
                    </span>
                  )}
                </div>
              </div>

              {/* BIG "MULAI PRAKTIKUM" BUTTON DIRECTING TO 3D LAB ROOM */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-cyan-900/50 border-2 border-cyan-400/50 text-center space-y-3 shadow-xl">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Siap Melakukan Pengumpulan Data di Laboratorium?
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
                  Tombol ini langsung mengarahkan Anda ke tampilan laboratorium 3D yang memuat praktikan dan 3 meja praktikum. Meja 2 tetap terkunci jika belum menyelesaikan Meja 1, begitupun Meja 3 tetap terkunci jika belum menyelesaikan Meja 2.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      soundFx.playBeep(true);
                      onStartExperiment();
                    }}
                    className="px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white shadow-2xl shadow-cyan-500/40 border border-white/40 flex items-center justify-center gap-3 mx-auto transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>MULAI PRAKTIKUM</span>
                  </button>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Tahap 5: Menguji Hipotesis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: MENGUJI HIPOTESIS */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  Amati dan analisis seluruh data yang diperoleh dari praktikum. Bandingkan hasil eksperimen dengan hipotesis yang telah kamu susun sebelumnya.
                </p>
              </div>

              {/* Data Summary Quick-Card from student's actual lab work */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Info className="w-4 h-4" />
                  <span>Ringkasan Data Eksperimen Anda:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Massa Bawang</span>
                    <span className="font-bold text-white">{labData.massaBawang.toFixed(2)} gram</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Sentrifugasi</span>
                    <span className="font-bold text-white">{labData.kecepatanSentrifugasi} RPM ({labData.waktuSentrifugasi} mnt)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">A260 / A280</span>
                    <span className="font-bold text-white">{labData.absorbansi260.toFixed(3)} / {labData.absorbansi280.toFixed(3)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Kemurnian / Konsentrasi</span>
                    <span className="font-bold text-emerald-400">{labData.rasioKemurnian.toFixed(2)} ({labData.konsentrasiDNA.toFixed(1)} ng/µL)</span>
                  </div>
                </div>
              </div>

              {/* 6 Guided Questions verbatim from prompt */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-cyan-300 block">
                  Jawablah pertanyaan berikut berdasarkan data praktikum Anda:
                </span>

                {/* Question 1 */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200">
                    1. Bagaimana hasil proses ekstraksi dan penyaringan jaringan bawang bombai?
                  </label>
                  <textarea
                    rows={2}
                    value={localData.ujiHipotesisAnswers?.q1 || ''}
                    onChange={(e) => setLocalData({
                      ...localData,
                      ujiHipotesisAnswers: { ...localData.ujiHipotesisAnswers, q1: e.target.value }
                    })}
                    placeholder="Tuliskan pengamatan warna, tekstur filtrat, dan efisiensi penyaringan..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Question 2 */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200">
                    2. Apa perbedaan pelet dan supernatan setelah sentrifugasi?
                  </label>
                  <textarea
                    rows={2}
                    value={localData.ujiHipotesisAnswers?.q2 || ''}
                    onChange={(e) => setLocalData({
                      ...localData,
                      ujiHipotesisAnswers: { ...localData.ujiHipotesisAnswers, q2: e.target.value }
                    })}
                    placeholder="Jelaskan karakteristik pelet endapan di dasar tabung dibandingkan cairan supernatan di bagian atas..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Question 3 */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200">
                    3. Bagaimana sentrifugasi membantu proses pemisahan komponen sampel?
                  </label>
                  <textarea
                    rows={2}
                    value={localData.ujiHipotesisAnswers?.q3 || ''}
                    onChange={(e) => setLocalData({
                      ...localData,
                      ujiHipotesisAnswers: { ...localData.ujiHipotesisAnswers, q3: e.target.value }
                    })}
                    placeholder="Jelaskan pengaruh gaya sentrifugal dalam memisahkan partikel berdasarkan massa jenisnya..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Question 4 */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200">
                    4. Berapa konsentrasi DNA yang diperoleh berdasarkan hasil pengukuran?
                  </label>
                  <textarea
                    rows={2}
                    value={localData.ujiHipotesisAnswers?.q4 || ''}
                    onChange={(e) => setLocalData({
                      ...localData,
                      ujiHipotesisAnswers: { ...localData.ujiHipotesisAnswers, q4: e.target.value }
                    })}
                    placeholder="Tuliskan nilai konsentrasi DNA (ng/µL) dan evaluasi apakah rendemen memadai..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Question 5 */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200">
                    5. Bagaimana interpretasi rasio A260/A280 yang diperoleh?
                  </label>
                  <textarea
                    rows={2}
                    value={localData.ujiHipotesisAnswers?.q5 || ''}
                    onChange={(e) => setLocalData({
                      ...localData,
                      ujiHipotesisAnswers: { ...localData.ujiHipotesisAnswers, q5: e.target.value }
                    })}
                    placeholder="Tuliskan nilai rasio A260/A280 dan jelaskan tingkat kemurnian DNA (kontaminasi protein atau RNA)..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Question 6 */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-200">
                    6. Apakah hasil praktikum sesuai dengan hipotesis awal? Jelaskan berdasarkan data yang diperoleh.
                  </label>
                  <textarea
                    rows={3}
                    value={localData.ujiHipotesisAnswers?.q6 || ''}
                    onChange={(e) => setLocalData({
                      ...localData,
                      ujiHipotesisAnswers: { ...localData.ujiHipotesisAnswers, q6: e.target.value }
                    })}
                    placeholder="Bandingkan data kuantitatif dan kualitatif dengan dugaan sementara yang telah Anda buat di Tahap 3..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {localData.ujiHipotesisSavedAt && (
                <p className="text-[11px] text-slate-400">
                  Tersimpan pada: {localData.ujiHipotesisSavedAt}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    onClick={handleSaveStep5}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Jawaban</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleSaveStep5();
                    setCurrentStep(6);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Tahap 6: Kesimpulan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: MERUMUSKAN KESIMPULAN */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  Berdasarkan seluruh tahapan praktikum dan hasil analisis yang telah dilakukan, buatlah kesimpulan mengenai proses isolasi DNA bawang bombai.
                </p>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Kolom Kesimpulan Akhir:
                </label>
                <textarea
                  rows={5}
                  value={localData.kesimpulanAnswer || ''}
                  onChange={(e) => setLocalData({ ...localData, kesimpulanAnswer: e.target.value })}
                  placeholder="Rangkum prinsip isolasi DNA (penghancuran mekanik, lisis deterjen, sentrifugasi, presipitasi etanol dingin) dan kesesuaian kemurnian DNA yang diperoleh..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm leading-relaxed resize-y outline-none transition-all placeholder:text-slate-500"
                />
                {localData.kesimpulanSavedAt && (
                  <p className="text-[11px] text-slate-400">
                    Tersimpan pada: {localData.kesimpulanSavedAt}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    onClick={handleSaveStep6}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Jawaban</span>
                  </button>
                </div>

                <button
                  onClick={handlePrintReport}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-all"
                  title="Cetak atau simpan sebagai dokumen PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Cetak / Ekspor Laporan</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Quick Step Indicator */}
        <div className="px-5 py-3 bg-[#061021] border-t border-blue-900/50 flex items-center justify-between text-xs text-slate-400">
          <span>Tahap {currentStep} dari 6 Sintaks Inkuiri</span>
          <span className="text-[11px] text-cyan-300">
            {isStepComplete(currentStep) ? '✓ Jawaban Tersimpan' : 'Harap simpan jawaban setelah mengisi'}
          </span>
        </div>

      </div>
    </div>
  );
};
