import React from 'react';
import { BookOpen, FlaskConical, BarChart3 } from 'lucide-react';
import { soundFx } from '../utils/audio';

export type ActiveModal = 'none' | 'materi' | 'aktivitas';

interface BottomDockProps {
  activeModal: ActiveModal;
  onSelectModal: (modal: ActiveModal) => void;
  onExitToHome?: () => void;
  tableProgressText?: string;
  isUnlocked: boolean;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeModal,
  onSelectModal,
}) => {
  const items: { id: ActiveModal; label: string; icon: React.ReactNode }[] = [
    {
      id: 'materi',
      label: 'Materi',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      id: 'none', // 'none' means pure Lab view
      label: 'Lab',
      icon: <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      id: 'aktivitas',
      label: 'Aktivitas',
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
  ];

  return (
    // Placed directly beneath the student profile card on the top left
    <aside
      aria-label="Menu Pembelajaran"
      className="fixed top-[76px] sm:top-[84px] left-3 sm:left-4 z-40 pointer-events-auto select-none"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 rounded-2xl bg-[#0c1e3d]/90 backdrop-blur-md border-2 border-blue-400/40 shadow-2xl">
        {items.map((item) => {
          const isActive = (item.id === 'none' && activeModal === 'none') || (item.id !== 'none' && activeModal === item.id);

          return (
            <button
              key={item.label}
              onClick={() => {
                soundFx.playClick();
                onSelectModal(item.id);
              }}
              className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl transition-all transform active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] text-white shadow-[0_0_18px_rgba(56,189,248,0.6)] border-2 border-cyan-300 scale-105'
                  : 'bg-[#1e3a8a]/70 hover:bg-[#1e40af] border border-blue-400/30 text-blue-200 hover:text-white shadow'
              }`}
            >
              <div className="drop-shadow-md">{item.icon}</div>
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
