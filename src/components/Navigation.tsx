import React from 'react';
import { NavigationTab, StudentIdentity, TableStatus } from '../types/lab';
import { 
  Home, 
  Target, 
  BookOpen, 
  HelpCircle, 
  Gamepad2, 
  FileCheck2, 
  Award, 
  Volume2, 
  VolumeX, 
  UserCheck,
  Lock
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  identity: StudentIdentity;
  pretestDone: boolean;
  tableStatus: TableStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  identity,
  pretestDone,
  tableStatus,
  soundEnabled,
  onToggleSound
}) => {
  const isIdentityComplete = identity.isRegistered && identity.name.trim().length > 0;

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode; isUnlocked: boolean; badge?: string }[] = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: <Home className="w-4 h-4" />,
      isUnlocked: true,
    },
    {
      id: 'tujuan',
      label: 'Tujuan Belajar',
      icon: <Target className="w-4 h-4" />,
      isUnlocked: isIdentityComplete,
    },
    {
      id: 'materi',
      label: 'Materi Lengkap',
      icon: <BookOpen className="w-4 h-4" />,
      isUnlocked: isIdentityComplete,
    },
    {
      id: 'virtuallab',
      label: 'Game Virtual Lab',
      icon: <Gamepad2 className="w-4 h-4" />,
      isUnlocked: isIdentityComplete,
      badge: tableStatus.table3Completed 
        ? 'Selesai' 
        : tableStatus.table2Completed 
        ? 'Meja 3' 
        : tableStatus.table1Completed 
        ? 'Meja 2' 
        : 'Meja 1',
    },
    {
      id: 'aktivitas',
      label: 'Aktivitas & Sintaks',
      icon: <Award className="w-4 h-4" />,
      isUnlocked: isIdentityComplete,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
            <span className="font-extrabold text-white text-base tracking-tighter">DNA</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Virtual Lab Allium cepa
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 hidden md:inline-block">
                Fase F SMA
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Isolasi DNA, Sentrifugasi & Spektrofotometri UV-Vis
            </p>
          </div>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {isIdentityComplete ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              <UserCheck className="w-3.5 h-3.5" />
              <span className="font-semibold max-w-[120px] sm:max-w-[180px] truncate">{identity.name}</span>
              <span className="text-[11px] text-emerald-400/70 border-l border-emerald-500/30 pl-1.5">
                {identity.className} #{identity.studentNumber}
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[11px]">
              Belum Registrasi
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundFx.playClick();
            }}
            title={soundEnabled ? 'Matikan Suara' : 'Hidupkan Suara'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="border-t border-slate-800/80 bg-slate-950/70 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center gap-1 py-1.5 min-w-max">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                disabled={!tab.isUnlocked}
                onClick={() => {
                  soundFx.playClick();
                  onSelectTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : tab.isUnlocked
                    ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                {tab.isUnlocked ? tab.icon : <Lock className="w-3.5 h-3.5 text-slate-600" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-cyan-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
