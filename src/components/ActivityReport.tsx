import React, { useState } from 'react';
import { StudentIdentity, LabExperimentalData, TableStatus, InquiryData, TableId, InquiryStep } from '../types/lab';
import { 
  Download, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  FileSpreadsheet,
  FlaskConical,
  Eye,
  HelpCircle,
  Lightbulb,
  Scale,
  Play,
  FileText,
  Clock,
  BookCheck,
  Lock
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ActivityReportProps {
  identity: StudentIdentity;
  labData: LabExperimentalData;
  tableStatus: TableStatus;
  inquiryData: InquiryData;
  onSaveInquiryData?: (data: InquiryData) => void;
  onResetPractical: () => void;
  onNavigateToTable?: (tableId: TableId) => void;
  onOpenInquiryStepEditor?: (step: InquiryStep) => void;
  onClose?: () => void;
}

export const ActivityReport: React.FC<ActivityReportProps> = ({
  identity,
  labData,
  tableStatus,
  inquiryData,
  onResetPractical,
  onNavigateToTable,
  onOpenInquiryStepEditor,
}) => {
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    soundFx.playBeep(true);
    setTimeout(() => {
      setSaveToast(null);
    }, 3000);
  };

  // Completion calculations
  const isT1Done = tableStatus.table1Completed && labData.massaBawang > 0;
  const isT2Done = tableStatus.table2Completed && labData.kecepatanSentrifugasi > 0;
  const isT3Done = tableStatus.table3Completed && labData.absorbansi260 > 0;

  const isStep1Done = Boolean(inquiryData.orientasiAnswer?.trim());
  const isStep2Done = Boolean(inquiryData.masalahAnswer?.trim());
  const isStep3Done = Boolean(inquiryData.hipotesisAnswer?.trim());
  const isStep4Done = tableStatus.table1Completed && tableStatus.table2Completed && tableStatus.table3Completed;
  const isStep5Done = Boolean(
    inquiryData.ujiHipotesisAnswers?.q1?.trim() ||
    inquiryData.ujiHipotesisAnswers?.q2?.trim() ||
    inquiryData.ujiHipotesisAnswers?.q3?.trim() ||
    inquiryData.ujiHipotesisAnswers?.q4?.trim() ||
    inquiryData.ujiHipotesisAnswers?.q5?.trim() ||
    inquiryData.ujiHipotesisAnswers?.q6?.trim()
  );
  const isStep6Done = Boolean(inquiryData.kesimpulanAnswer?.trim());

  const completedCount = [
    isStep1Done,
    isStep2Done,
    isStep3Done,
    isStep4Done,
    isStep5Done,
    isStep6Done,
  ].filter(Boolean).length;

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleDownloadCSV = () => {
    soundFx.playClick();
    const headers = 'No,Parameter Eksperimental,Nilai Terukur,Satuan / Keterangan\n';
    const rows = [
      `1,Massa Bawang Bombai,${isT1Done && labData.massaBawang > 0 ? labData.massaBawang : '-'},gram (g)`,
      `2,Volume Ekstraksi Filtrat,${isT1Done && labData.volumeEkstraksi > 0 ? labData.volumeEkstraksi : '-'},mL`,
      `3,Jumlah Penghancuran Jaringan,${isT1Done && labData.jumlahPenghancuran > 0 ? labData.jumlahPenghancuran : '-'},kali tumbukan mortar`,
      `4,Waktu Penghancuran,${isT1Done && labData.waktuPenghancuran > 0 ? labData.waktuPenghancuran : '-'},menit`,
      `5,Waktu Inkubasi Lisis,${isT1Done && labData.waktuInkubasi > 0 ? labData.waktuInkubasi : '-'},menit`,
      `6,Kecepatan Sentrifugasi,${isT2Done && labData.kecepatanSentrifugasi > 0 ? labData.kecepatanSentrifugasi : '-'},RPM`,
      `7,Waktu Sentrifugasi,${isT2Done && labData.waktuSentrifugasi > 0 ? labData.waktuSentrifugasi : '-'},menit`,
      `8,Absorbansi 260 nm (A260),${isT3Done && labData.absorbansi260 > 0 ? labData.absorbansi260.toFixed(3) : '-'},kuvet 1 cm`,
      `9,Absorbansi 280 nm (A280),${isT3Done && labData.absorbansi280 > 0 ? labData.absorbansi280.toFixed(3) : '-'},serapan protein`,
      `10,Rasio Kemurnian (A260/A280),${isT3Done && labData.rasioKemurnian > 0 ? labData.rasioKemurnian.toFixed(2) : '-'},standar 1.80 - 2.00`,
      `11,Konsentrasi DNA,${isT3Done && labData.konsentrasiDNA > 0 ? labData.konsentrasiDNA.toFixed(1) : '-'},ng/µL`,
      `12,Total Rendemen DNA,${isT3Done && labData.totalDNA > 0 ? labData.totalDNA.toFixed(1) : '-'},µg`,
      `13,Interpretasi Kemurnian DNA,"${isT3Done && labData.interpretasiKemurnian && labData.interpretasiKemurnian !== '-' ? labData.interpretasiKemurnian : '-'}",Kualitas DNA`,
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Isolasi_DNA_${identity.name || 'Praktikan'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV data praktikum berhasil diunduh!');
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12 select-text">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 1. HEADER LEMBAR AKTIVITAS LENGKAP */}
      <div className="rounded-3xl bg-[#09152b] border-2 border-blue-500/40 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-900/50 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-400/30">
              LEMBAR KERJA & LAPORAN AKTIVITAS LENGKAP
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Isolasi DNA Bawang Bombai (*Allium cepa*)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Data terukur laboratorium dan tinjauan seluruh tahapan sintaks model pembelajaran inkuiri.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              title="Cetak / Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              title="Unduh Data CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
            <button
              onClick={onResetPractical}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/40 flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              title="Reset Praktikum"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Praktikum</span>
            </button>
          </div>
        </div>

        {/* Student Identity Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Praktikan:</span>
            <strong className="text-white text-sm font-semibold">{identity.name || 'Nama Siswa'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Kelas:</span>
            <strong className="text-cyan-300 text-sm font-semibold">{identity.className || 'Kelas X'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Nomor Absen:</span>
            <strong className="text-slate-200 text-sm font-semibold">{identity.studentNumber || '01'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Progres Sintaks Inkuiri:</span>
            <strong className="text-emerald-400 text-sm font-semibold">{completedCount} / 6 Tahap Selesai</strong>
          </div>
        </div>
      </div>

      {/* 2. SECTION I: DATA HASIL EKSPERIMEN 3 MEJA LABORATORIUM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              I. Data Hasil Eksperimen 3 Meja Praktikum
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Status: {tableStatus.table1Completed && tableStatus.table2Completed && tableStatus.table3Completed ? 'Semua Meja Selesai' : 'Sedang Berlangsung'}
          </span>
        </div>

        {/* 3 Meja Status Cards with strict locks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meja 1 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            tableStatus.table1Completed
              ? 'bg-emerald-950/30 border-emerald-500/40'
              : 'bg-slate-900/90 border-blue-500/40'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-400 uppercase">Meja 1</span>
              {tableStatus.table1Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </span>
              ) : (
                <span className="text-[10px] text-cyan-300 font-semibold">Siap Praktikum</span>
              )}
            </div>
            <h3 className="font-bold text-white text-sm mb-1">
              Persiapan & Ekstraksi DNA
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Iris bawang bombai, timbang di neraca analitik, gerus mortar alu, tambahkan buffer lisis, dan saring ekstraknya.
            </p>
            {onNavigateToTable && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNavigateToTable('table1');
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{tableStatus.table1Completed ? 'Buka Kembali Meja 1' : 'Mulai Praktikum Meja 1'}</span>
              </button>
            )}
          </div>

          {/* Meja 2 (Terkunci jika Meja 1 belum selesai) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            tableStatus.table2Completed
              ? 'bg-emerald-950/30 border-emerald-500/40'
              : tableStatus.table1Completed
              ? 'bg-slate-900/90 border-blue-500/40'
              : 'bg-slate-900/50 border-slate-800 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-400 uppercase">Meja 2</span>
              {tableStatus.table2Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </span>
              ) : tableStatus.table1Completed ? (
                <span className="text-[10px] text-cyan-300 font-semibold">Siap Praktikum</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                  <Lock className="w-3 h-3" /> Terkunci
                </span>
              )}
            </div>
            <h3 className="font-bold text-white text-sm mb-1">
              Sentrifugasi & Presipitasi
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Seimbangkan rotor mikrosentrifus, putar filtrat, pisahkan supernatan DNA dengan mikropipet, dan aliri etanol dingin 95%.
            </p>
            {onNavigateToTable && (
              tableStatus.table1Completed ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateToTable('table2');
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{tableStatus.table2Completed ? 'Buka Kembali Meja 2' : 'Mulai Praktikum Meja 2'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-500 flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-700/60"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Meja Masih Terkunci (Selesaikan Meja 1)</span>
                </button>
              )
            )}
          </div>

          {/* Meja 3 (Terkunci jika Meja 2 belum selesai) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            tableStatus.table3Completed
              ? 'bg-emerald-950/30 border-emerald-500/40'
              : tableStatus.table2Completed
              ? 'bg-slate-900/90 border-blue-500/40'
              : 'bg-slate-900/50 border-slate-800 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-400 uppercase">Meja 3</span>
              {tableStatus.table3Completed ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </span>
              ) : tableStatus.table2Completed ? (
                <span className="text-[10px] text-cyan-300 font-semibold">Siap Praktikum</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                  <Lock className="w-3 h-3" /> Terkunci
                </span>
              )}
            </div>
            <h3 className="font-bold text-white text-sm mb-1">
              Spektrofotometri UV-Vis
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Kalibrasi blanko kuvet, ukur absorbansi sinar UV pada panjang gelombang 260 nm dan 280 nm, lalu periksa rasio kemurnian.
            </p>
            {onNavigateToTable && (
              tableStatus.table2Completed ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateToTable('table3');
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{tableStatus.table3Completed ? 'Buka Kembali Meja 3' : 'Mulai Praktikum Meja 3'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-500 flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-700/60"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Meja Masih Terkunci (Selesaikan Meja 2)</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* 13 Experimental Parameters Table (Shows '-' if practical not conducted/reset) */}
        <div className="rounded-2xl bg-slate-900/95 border border-slate-800 overflow-hidden shadow-xl print:bg-white print:border-gray-300 print:text-black">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Tabel 13 Parameter Eksperimental Isolasi DNA</span>
            <span className="text-[11px] text-slate-400 italic">
              * Nilai terukur bertanda (-) jika tahapan praktikum belum diselesaikan atau direset
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800 print:bg-gray-100 print:text-black">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Parameter Eksperimental</th>
                  <th className="px-4 py-3 w-36">Nilai Terukur</th>
                  <th className="px-4 py-3">Satuan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 print:bg-white print:divide-gray-200 print:text-black">
                {/* Meja 1 Parameters */}
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">1</td>
                  <td className="px-4 py-2.5 font-medium">Massa Bawang Bombai</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT1Done && labData.massaBawang > 0 ? labData.massaBawang : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">gram (g)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">2</td>
                  <td className="px-4 py-2.5 font-medium">Volume Ekstraksi Filtrat</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT1Done && labData.volumeEkstraksi > 0 ? labData.volumeEkstraksi : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">mililiter (mL)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">3</td>
                  <td className="px-4 py-2.5 font-medium">Jumlah Penghancuran Jaringan</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT1Done && labData.jumlahPenghancuran > 0 ? labData.jumlahPenghancuran : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">kali tumbukan mortar</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">4</td>
                  <td className="px-4 py-2.5 font-medium">Waktu Penghancuran</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT1Done && labData.waktuPenghancuran > 0 ? labData.waktuPenghancuran : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">menit</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">5</td>
                  <td className="px-4 py-2.5 font-medium">Waktu Inkubasi Lisis</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT1Done && labData.waktuInkubasi > 0 ? labData.waktuInkubasi : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">menit</td>
                </tr>

                {/* Meja 2 Parameters */}
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">6</td>
                  <td className="px-4 py-2.5 font-medium">Kecepatan Sentrifugasi</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT2Done && labData.kecepatanSentrifugasi > 0 ? labData.kecepatanSentrifugasi : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">RPM (Revolutions Per Minute)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">7</td>
                  <td className="px-4 py-2.5 font-medium">Waktu Sentrifugasi</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT2Done && labData.waktuSentrifugasi > 0 ? labData.waktuSentrifugasi : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">menit</td>
                </tr>

                {/* Meja 3 Parameters */}
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">8</td>
                  <td className="px-4 py-2.5 font-medium">Absorbansi 260 nm (A260)</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT3Done && labData.absorbansi260 > 0 ? labData.absorbansi260.toFixed(3) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">Panjang lintasan optik kuvet kuarsa 1 cm</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">9</td>
                  <td className="px-4 py-2.5 font-medium">Absorbansi 280 nm (A280)</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-cyan-300 print:text-black">
                    {isT3Done && labData.absorbansi280 > 0 ? labData.absorbansi280.toFixed(3) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">Serapan protein cincin aromatik</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">10</td>
                  <td className="px-4 py-2.5 font-medium">Rasio Kemurnian (A260/A280)</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-emerald-400 print:text-black">
                    {isT3Done && labData.rasioKemurnian > 0 ? labData.rasioKemurnian.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">Acuan standar DNA murni: 1.80 - 2.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">11</td>
                  <td className="px-4 py-2.5 font-medium">Konsentrasi DNA</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-blue-400 print:text-black">
                    {isT3Done && labData.konsentrasiDNA > 0 ? labData.konsentrasiDNA.toFixed(1) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">ng/µL (Rumus: A260 × 50 ng/µL)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">12</td>
                  <td className="px-4 py-2.5 font-medium">Total Rendemen DNA</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-purple-400 print:text-black">
                    {isT3Done && labData.totalDNA > 0 ? labData.totalDNA.toFixed(1) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 print:text-gray-600">mikrogram (µg; Konsentrasi × 0.5 mL)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-500">13</td>
                  <td className="px-4 py-2.5 font-medium">Interpretasi Kemurnian DNA</td>
                  <td colSpan={2} className="px-4 py-2.5 font-semibold text-emerald-300 print:text-green-800">
                    {isT3Done && labData.interpretasiKemurnian && labData.interpretasiKemurnian !== '-'
                      ? labData.interpretasiKemurnian
                      : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. SECTION II: TINJAUAN JAWABAN SINTAKS MODEL PEMBELAJARAN INKUIRI (READ-ONLY) */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <BookCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              II. Tinjauan Jawaban Sintaks Inkuiri (Tahap 1 s.d. 6)
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
            <span className="text-cyan-400 font-bold">{completedCount} dari 6 Tahap Terisi</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="text-[11px] text-slate-400 italic hidden sm:inline">
              * Pengisian & pengeditan jawaban dilakukan melalui simbol sintaks di bar bagian atas
            </span>
          </div>
        </div>

        {/* TAHAP 1: ORIENTASI */}
        <div id="inquiry-step-1" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600/30 text-cyan-400">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                1. Orientasi
              </h3>
            </div>
            {isStep1Done ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inquiryData.orientasiSavedAt ? `Tersimpan: ${inquiryData.orientasiSavedAt}` : 'Tersimpan'}
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">Belum Diisi</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider block">
              Fenomena:
            </span>
            <p className="text-sm text-slate-100 leading-relaxed">
              DNA merupakan materi genetik yang terdapat di dalam sel. Untuk memperoleh DNA dari jaringan bawang bombai, diperlukan proses penghancuran jaringan, pemecahan sel, pemisahan komponen sel, dan pengukuran kualitas DNA.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
            <span className="text-xs font-black text-indigo-300 uppercase tracking-wider block">
              Pertanyaan pemantik:
            </span>
            <blockquote className="text-sm text-cyan-200 font-semibold italic border-l-4 border-cyan-400 pl-3 py-1">
              &ldquo;Bagaimana cara memperoleh DNA dari jaringan bawang bombai, memisahkannya dari komponen sel lainnya, serta mengetahui konsentrasi dan kemurniannya?&rdquo;
            </blockquote>
          </div>

          {/* Read-Only Answer View */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Jawaban Siswa (Orientasi):
            </label>
            {isStep1Done ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-normal">
                {inquiryData.orientasiAnswer}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-700 text-xs text-slate-400 italic">
                Belum ada jawaban tersimpan.
              </div>
            )}
          </div>
        </div>

        {/* TAHAP 2: MERUMUSKAN MASALAH */}
        <div id="inquiry-step-2" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600/30 text-cyan-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                2. Merumuskan Masalah
              </h3>
            </div>
            {isStep2Done ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inquiryData.masalahSavedAt ? `Tersimpan: ${inquiryData.masalahSavedAt}` : 'Tersimpan'}
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">Belum Diisi</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs leading-relaxed text-slate-200">
            <p>
              Berdasarkan fenomena dan pertanyaan pemantik yang telah kamu amati, buatlah rumusan masalah berupa pertanyaan yang akan kamu selidiki melalui praktikum isolasi DNA bawang bombai.
            </p>
            <p className="text-cyan-300 font-semibold">
              Tuliskan rumusan masalah menggunakan kalimat tanya yang jelas dan berkaitan dengan proses ekstraksi, sentrifugasi, serta pengukuran DNA menggunakan spektrofotometer UV-Vis.
            </p>
          </div>

          {/* Read-Only Answer View */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Jawaban Siswa (Rumusan Masalah):
            </label>
            {isStep2Done ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-normal">
                {inquiryData.masalahAnswer}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-700 text-xs text-slate-400 italic">
                Belum ada rumusan masalah tersimpan.
              </div>
            )}
          </div>
        </div>

        {/* TAHAP 3: MERUMUSKAN HIPOTESIS */}
        <div id="inquiry-step-3" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600/30 text-cyan-400">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                3. Merumuskan Hipotesis
              </h3>
            </div>
            {isStep3Done ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inquiryData.hipotesisSavedAt ? `Tersimpan: ${inquiryData.hipotesisSavedAt}` : 'Tersimpan'}
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">Belum Diisi</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-200">
            <p>
              Berdasarkan rumusan masalah yang telah kamu buat, susunlah hipotesis atau dugaan sementara mengenai hasil yang mungkin diperoleh dari proses isolasi DNA bawang bombai.
            </p>
          </div>

          {/* Read-Only Answer View */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Jawaban Siswa (Hipotesis):
            </label>
            {isStep3Done ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-normal">
                {inquiryData.hipotesisAnswer}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-700 text-xs text-slate-400 italic">
                Belum ada hipotesis tersimpan.
              </div>
            )}
          </div>
        </div>

        {/* TAHAP 4: MENGUMPULKAN DATA */}
        <div id="inquiry-step-4" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600/30 text-cyan-400">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                4. Mengumpulkan Data
              </h3>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              isStep4Done 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
                : 'bg-blue-950 text-cyan-300 border-blue-500/40'
            }`}>
              {isStep4Done ? '3 Meja Praktikum Selesai' : 'Praktikum 3 Meja Lab'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs leading-relaxed text-slate-100">
            <p>
              Lakukan praktikum isolasi DNA bawang bombai melalui tiga meja laboratorium berikut. Ikuti petunjuk penggunaan alat dan lakukan setiap tahapan secara berurutan.
            </p>
          </div>

          {/* Action to launch 3D Practical */}
          {onNavigateToTable && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-300">
                Mulai praktikum langsung di ruang laboratorium 3D:
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNavigateToTable('table1');
                }}
                className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Praktikum Laboratorium</span>
              </button>
            </div>
          )}
        </div>

        {/* TAHAP 5: MENGUJI HIPOTESIS (6 PERTANYAAN ANALISIS) */}
        <div id="inquiry-step-5" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600/30 text-cyan-400">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                5. Menguji Hipotesis
              </h3>
            </div>
            {isStep5Done ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inquiryData.ujiHipotesisSavedAt ? `Tersimpan: ${inquiryData.ujiHipotesisSavedAt}` : 'Tersimpan'}
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">Belum Diisi</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-200 space-y-1">
            <p className="font-semibold text-white">
              Amati dan analisis seluruh data yang diperoleh dari praktikum. Bandingkan hasil eksperimen dengan hipotesis yang telah kamu susun sebelumnya.
            </p>
            <p className="text-slate-400">
              Berikut adalah tinjauan jawaban Anda terhadap 6 pertanyaan analisis hasil praktikum:
            </p>
          </div>

          {/* Quick Data Reference Pill for students */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs">
            <span className="font-bold text-cyan-300 block mb-1">Rujukan Data Terukur Praktikum:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300">
              <div>Massa: <strong className="text-white">{isT1Done && labData.massaBawang > 0 ? `${labData.massaBawang} g` : '-'}</strong></div>
              <div>Filtrat: <strong className="text-white">{isT1Done && labData.volumeEkstraksi > 0 ? `${labData.volumeEkstraksi} mL` : '-'}</strong></div>
              <div>RPM: <strong className="text-white">{isT2Done && labData.kecepatanSentrifugasi > 0 ? labData.kecepatanSentrifugasi : '-'}</strong></div>
              <div>Waktu Sentrifus: <strong className="text-white">{isT2Done && labData.waktuSentrifugasi > 0 ? `${labData.waktuSentrifugasi} mnt` : '-'}</strong></div>
              <div>A260: <strong className="text-white">{isT3Done && labData.absorbansi260 > 0 ? labData.absorbansi260.toFixed(3) : '-'}</strong></div>
              <div>A280: <strong className="text-white">{isT3Done && labData.absorbansi280 > 0 ? labData.absorbansi280.toFixed(3) : '-'}</strong></div>
              <div>Rasio A260/A280: <strong className="text-emerald-300">{isT3Done && labData.rasioKemurnian > 0 ? labData.rasioKemurnian.toFixed(2) : '-'}</strong></div>
              <div>Konsentrasi: <strong className="text-blue-300">{isT3Done && labData.konsentrasiDNA > 0 ? `${labData.konsentrasiDNA.toFixed(1)} ng/µL` : '-'}</strong></div>
            </div>
          </div>

          {/* 6 Sub-Questions (Read-Only) */}
          <div className="space-y-3 pt-1">
            {[
              { num: 1, key: 'q1' as const, question: 'Bagaimana hasil proses ekstraksi dan penyaringan jaringan bawang bombai?' },
              { num: 2, key: 'q2' as const, question: 'Apa perbedaan pelet dan supernatan setelah sentrifugasi?' },
              { num: 3, key: 'q3' as const, question: 'Bagaimana sentrifugasi membantu proses pemisahan komponen sampel?' },
              { num: 4, key: 'q4' as const, question: 'Berapa konsentrasi DNA yang diperoleh berdasarkan hasil pengukuran?' },
              { num: 5, key: 'q5' as const, question: 'Bagaimana interpretasi rasio A260/A280 yang diperoleh?' },
              { num: 6, key: 'q6' as const, question: 'Apakah hasil praktikum sesuai dengan hipotesis awal? Jelaskan berdasarkan data yang diperoleh.' },
            ].map((q) => {
              const ans = inquiryData.ujiHipotesisAnswers?.[q.key];
              const isAnsFilled = Boolean(ans?.trim());
              return (
                <div key={q.num} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="block text-xs font-bold text-cyan-200">
                    {q.num}. {q.question}
                  </span>
                  {isAnsFilled ? (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/70 text-xs text-slate-100 leading-relaxed whitespace-pre-wrap">
                      {ans}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic p-1">
                      Belum dijawab.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TAHAP 6: MERUMUSKAN KESIMPULAN */}
        <div id="inquiry-step-6" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                6. Merumuskan Kesimpulan
              </h3>
            </div>
            {isStep6Done ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inquiryData.kesimpulanSavedAt ? `Tersimpan: ${inquiryData.kesimpulanSavedAt}` : 'Tersimpan'}
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">Belum Diisi</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs leading-relaxed text-slate-100">
            <p className="font-semibold">
              Berdasarkan seluruh tahapan praktikum dan hasil analisis yang telah dilakukan, buatlah kesimpulan mengenai proses isolasi DNA bawang bombai.
            </p>
          </div>

          {/* Read-Only Answer View */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Kesimpulan Akhir Siswa:
            </label>
            {isStep6Done ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-normal">
                {inquiryData.kesimpulanAnswer}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-700 text-xs text-slate-400 italic">
                Belum ada kesimpulan akhir tersimpan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. FOOTER TOOLBAR */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xl print:hidden">
        <div className="text-xs text-slate-400">
          Status Sintaks Inkuiri: <strong className="text-emerald-400">{completedCount} dari 6 Sintaks Inkuiri Selesai</strong>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 shadow cursor-pointer transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow cursor-pointer transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Cetak PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
