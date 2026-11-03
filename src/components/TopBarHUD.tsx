import React from 'react';
import { StudentIdentity, InquiryStep } from '../types/lab';
import { 
  Settings, 
  RotateCcw,
  Eye,
  HelpCircle,
  Lightbulb,
  FlaskConical,
  Scale,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TopBarHUDProps {
  identity: StudentIdentity;
  points: number;
  level: number;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onReturnToRoom?: () => void;
  isInWorkbench?: boolean;
  inquiryCompletion?: Record<InquiryStep, boolean>;
  onSelectInquiryStep?: (step: InquiryStep) => void;
}

const INQUIRY_STEPS: Array<{
  id: InquiryStep;
  title: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 1, title: '1. Orientasi', shortName: 'Orientasi', icon: Eye },
  { id: 2, title: '2. Merumuskan Masalah', shortName: 'Masalah', icon: HelpCircle },
  { id: 3, title: '3. Merumuskan Hipotesis', shortName: 'Hipotesis', icon: Lightbulb },
  { id: 4, title: '4. Mengumpulkan Data (Praktikum)', shortName: 'Data', icon: FlaskConical },
  { id: 5, title: '5. Menguji Hipotesis', shortName: 'Uji Hipotesis', icon: Scale },
  { id: 6, title: '6. Merumuskan Kesimpulan', shortName: 'Kesimpulan', icon: CheckCircle2 },
];

export const TopBarHUD: React.FC<TopBarHUDProps> = ({
  identity,
  points,
  level,
  onOpenProfile,
  onOpenSettings,
  onReturnToRoom,
  isInWorkbench,
  inquiryCompletion,
  onSelectInquiryStep,
}) => {
  const completedCount = inquiryCompletion
    ? Object.values(inquiryCompletion).filter(Boolean).length
    : 0;
  const allCompleted = inquiryCompletion ? Object.values(inquiryCompletion).every(Boolean) : false;

  return (
    <header className="fixed top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-40 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: Student Profile Badge matching Reference Image */}
      <div
        onClick={() => {
          soundFx.playClick();
          onOpenProfile();
        }}
        className="pointer-events-auto flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 border-blue-400/50 shadow-xl cursor-pointer hover:border-cyan-300 transition-all active:scale-95"
      >
        {/* Avatar Box */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden border border-white/60">
          {/* Stylized Pixel/Voxel Avatar SVG matching image */}
          <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Background */}
            <rect width="64" height="64" fill="#38bdf8" />
            {/* Hair */}
            <rect x="14" y="8" width="36" height="42" fill="#5c2e17" rx="6" />
            {/* Face */}
            <rect x="20" y="16" width="24" height="24" fill="#fed7aa" rx="2" />
            {/* Bangs */}
            <rect x="16" y="12" width="32" height="10" fill="#5c2e17" />
            {/* Eyes */}
            <rect x="24" y="24" width="4" height="6" fill="#1e293b" />
            <rect x="36" y="24" width="4" height="6" fill="#1e293b" />
            {/* Cheeks */}
            <rect x="22" y="32" width="4" height="2" fill="#f43f5e" />
            <rect x="38" y="32" width="4" height="2" fill="#f43f5e" />
            {/* White Collar / Shirt */}
            <polygon points="20,44 44,44 48,64 16,64" fill="#ffffff" />
            <polygon points="30,44 34,44 32,56" fill="#2563eb" />
          </svg>
        </div>

        {/* Name, Class, Level */}
        <div className="space-y-0.5">
          <div className="font-extrabold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5">
            <span className="truncate max-w-[100px] sm:max-w-[150px]">
              {identity.name || 'Nama Siswa'}
            </span>
          </div>

          <div className="text-[10px] font-semibold text-cyan-200">
            {identity.className || 'Kelas X'}
          </div>

          {/* XP Progress Bar + Lv.1 Badge */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="w-16 sm:w-24 h-2 rounded-full bg-slate-950 border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(25, points * 0.8))}%` }}
              />
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-600 text-white border border-blue-400">
              Lv.{level}
            </span>
          </div>
        </div>
      </div>

      {/* Top Center: 6 Scientific Inquiry Syntax Badges (Orientasi, Masalah, Hipotesis, Data, Uji Hipotesis, Kesimpulan) */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 border-blue-400/50 shadow-2xl">
        {/* Menu / DNA indicator icon with 4 cyan bars */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onSelectInquiryStep?.(1);
          }}
          title="Sintaks Model Pembelajaran Inkuiri (Klik untuk buka seluruh aktivitas)"
          className="flex items-center gap-1 px-1 sm:px-1.5 py-1 text-cyan-400 border-r border-slate-700/80 cursor-pointer hover:text-cyan-300 transition-colors"
        >
          <div className="flex flex-col gap-0.5 justify-center">
            <span className="w-3.5 sm:w-4 h-0.5 bg-cyan-400 rounded-full" />
            <span className="w-2.5 sm:w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="w-3.5 sm:w-4 h-0.5 bg-cyan-400 rounded-full" />
            <span className="w-2 sm:w-2.5 h-0.5 bg-cyan-400 rounded-full" />
          </div>
        </button>

        {/* 6 Stage Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {INQUIRY_STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = inquiryCompletion?.[step.id] ?? false;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectInquiryStep?.(step.id);
                }}
                title={`${step.title} ${isDone ? '(Selesai - Terisi)' : '(Klik untuk mengisi)'}`}
                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  isDone
                    ? 'bg-emerald-950/60 text-emerald-300 border-2 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.35)] hover:bg-emerald-900/70'
                    : 'bg-slate-800/70 text-slate-400 border border-slate-700/80 hover:text-cyan-200 hover:border-cyan-400/60 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {isDone && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 ring-1 ring-emerald-300 shadow" />
                )}
              </button>
            );
          })}
        </div>

        {/* Completion Shield at far right */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onSelectInquiryStep?.(1);
          }}
          title={allCompleted ? 'Seluruh 6 Sintaks Inkuiri Telah Lengkap!' : `${completedCount}/6 Sintaks Inkuiri Telah Selesai`}
          className={`ml-0.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            allCompleted
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)]'
              : 'bg-blue-950/50 text-cyan-400 border-cyan-500/50 hover:border-cyan-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Top Right: Gold Coin Badge & Settings Gear matching Reference Image */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Coin Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 border-blue-400/50 shadow-xl">
          {/* Gold Coin Icon */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-yellow-200 shadow flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full border border-amber-600 flex items-center justify-center">
              <span className="text-[8px] font-black text-amber-800">★</span>
            </div>
          </div>
          <span className="font-mono text-sm sm:text-base font-black text-white">
            {points}
          </span>
        </div>

        {/* Settings Gear Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onOpenSettings();
          }}
          className="w-10 h-10 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 border-blue-400/50 shadow-xl flex items-center justify-center text-slate-200 hover:text-white hover:border-cyan-300 transition-all active:scale-95 cursor-pointer"
          title="Pengaturan"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Back to Room button if inside 2D workbench */}
        {isInWorkbench && onReturnToRoom && (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onReturnToRoom();
            }}
            className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-cyan-300 shadow-xl flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            title="Kembali ke Laboratorium 3D"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
