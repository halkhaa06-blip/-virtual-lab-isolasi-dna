import React, { useState, useEffect } from 'react';
import { 
  StudentIdentity, 
  LabExperimentalData, 
  TableStatus, 
  TableId, 
  NavigationTab,
  InquiryStep,
  InquiryData
} from './types/lab';
import { VirtualLab3D } from './components/Lab3D/VirtualLab3D';
import { TopBarHUD } from './components/TopBarHUD';
import { BottomDock, ActiveModal } from './components/BottomDock';
import { VirtualJoystick } from './components/VirtualJoystick';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { LearningMaterial } from './components/LearningMaterial';
import { LearningObjectives } from './components/LearningObjectives';
import { Workbench1 } from './components/Lab2D/Workbench1';
import { Workbench2 } from './components/Lab2D/Workbench2';
import { Workbench3 } from './components/Lab2D/Workbench3';
import { ActivityReport } from './components/ActivityReport';
import { InquirySyntaxModal } from './components/InquirySyntaxModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { soundFx } from './utils/audio';
import { CheckCircle2, ArrowRight, X, LogOut, BookOpen, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  IDENTITY: 'dna_lab_identity_v2',
  TABLE_STATUS: 'dna_lab_tablestatus_v2',
  LAB_DATA: 'dna_lab_data_v2',
  COINS: 'dna_lab_coins_v2',
  INQUIRY: 'dna_lab_inquiry_v2',
};

const DEFAULT_LAB_DATA: LabExperimentalData = {
  massaBawang: 0,
  volumeEkstraksi: 0,
  jumlahPenghancuran: 0,
  waktuPenghancuran: 0,
  waktuInkubasi: 0,
  kecepatanSentrifugasi: 0,
  waktuSentrifugasi: 0,
  absorbansi260: 0,
  absorbansi280: 0,
  rasioKemurnian: 0,
  konsentrasiDNA: 0,
  totalDNA: 0,
  interpretasiKemurnian: '-',
  volumeBufferTE: 0,
};

const DEFAULT_INQUIRY_DATA: InquiryData = {
  orientasiAnswer: '',
  masalahAnswer: '',
  hipotesisAnswer: '',
  ujiHipotesisAnswers: {
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
  },
  kesimpulanAnswer: '',
};

export default function App() {
  // Active modal opened from the bottom dock: 'none' | 'materi' | 'aktivitas'
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');

  const [inquiryData, setInquiryData] = useState<InquiryData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INQUIRY);
      return saved ? JSON.parse(saved) : DEFAULT_INQUIRY_DATA;
    } catch {
      return DEFAULT_INQUIRY_DATA;
    }
  });

  const handleOpenInquiry = () => {
    setActiveModal('aktivitas');
  };

  const handleSaveInquiryData = (data: InquiryData) => {
    setInquiryData(data);
    localStorage.setItem(STORAGE_KEYS.INQUIRY, JSON.stringify(data));
  };

  // Profile and Settings dialogs
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryModalStep, setInquiryModalStep] = useState<InquiryStep>(1);
  const [workbenchSessionKey, setWorkbenchSessionKey] = useState(0);
  const [resetToast, setResetToast] = useState<string | null>(null);

  // Audio SFX state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Move vector from virtual joystick
  const [moveVector, setMoveVector] = useState<{ x: number; y: number } | null>(null);

  // Student Identity
  const [identity, setIdentity] = useState<StudentIdentity>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IDENTITY);
      return saved ? JSON.parse(saved) : {
        name: 'Nama Siswa',
        className: 'Kelas X',
        studentNumber: '01',
        isRegistered: true,
      };
    } catch {
      return {
        name: 'Nama Siswa',
        className: 'Kelas X',
        studentNumber: '01',
        isRegistered: true,
      };
    }
  });

  // Points and Level system
  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COINS);
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });



  // Table Status
  const [tableStatus, setTableStatus] = useState<TableStatus>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLE_STATUS);
      return saved ? JSON.parse(saved) : {
        table1Completed: false,
        table2Completed: false,
        table3Completed: false,
        currentActiveTable: null,
      };
    } catch {
      return {
        table1Completed: false,
        table2Completed: false,
        table3Completed: false,
        currentActiveTable: null,
      };
    }
  });

  // Experimental metrics
  const [labData, setLabData] = useState<LabExperimentalData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAB_DATA);
      return saved ? JSON.parse(saved) : DEFAULT_LAB_DATA;
    } catch {
      return DEFAULT_LAB_DATA;
    }
  });

  // Modal alert when finishing a table
  const [justCompletedTable, setJustCompletedTable] = useState<TableId | null>(null);

  // Auto navigation target & transition message between tables in 3D room
  const [autoNavTarget, setAutoNavTarget] = useState<TableId | null>(null);
  const [navTransitionMsg, setNavTransitionMsg] = useState<string | null>(null);
  const [playerInitialX, setPlayerInitialX] = useState<number>(0);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(identity));
  }, [identity]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COINS, JSON.stringify(coins));
  }, [coins]);

  // Player level based on inquiry syntax progress and table completions
  const calculateLevel = () => {
    let lvl = 1;
    if (inquiryData.orientasiAnswer?.trim()) lvl++;
    if (inquiryData.masalahAnswer?.trim()) lvl++;
    if (inquiryData.hipotesisAnswer?.trim()) lvl++;
    if (tableStatus.table1Completed) lvl++;
    if (tableStatus.table2Completed) lvl++;
    if (tableStatus.table3Completed) lvl++;
    if (
      inquiryData.ujiHipotesisAnswers?.q1?.trim() ||
      inquiryData.ujiHipotesisAnswers?.q2?.trim()
    ) lvl++;
    if (inquiryData.kesimpulanAnswer?.trim()) lvl++;
    return Math.min(lvl, 9);
  };

  const inquiryCompletion: Record<InquiryStep, boolean> = {
    1: Boolean(inquiryData.orientasiAnswer?.trim()),
    2: Boolean(inquiryData.masalahAnswer?.trim()),
    3: Boolean(inquiryData.hipotesisAnswer?.trim()),
    4: tableStatus.table1Completed && tableStatus.table2Completed && tableStatus.table3Completed,
    5: Boolean(
      inquiryData.ujiHipotesisAnswers?.q1?.trim() ||
      inquiryData.ujiHipotesisAnswers?.q2?.trim() ||
      inquiryData.ujiHipotesisAnswers?.q3?.trim() ||
      inquiryData.ujiHipotesisAnswers?.q4?.trim() ||
      inquiryData.ujiHipotesisAnswers?.q5?.trim() ||
      inquiryData.ujiHipotesisAnswers?.q6?.trim()
    ),
    6: Boolean(inquiryData.kesimpulanAnswer?.trim()),
  };

  const handleSelectInquiryStep = (step: InquiryStep) => {
    setActiveModal('none');
    setInquiryModalStep(step);
    setIsInquiryModalOpen(true);
  };

  const handleEnterTable = (tableId: TableId) => {
    if (tableId === 'table2' && !tableStatus.table1Completed) {
      soundFx.playBeep(false);
      setResetToast('Meja 2 masih TERKUNCI! Selesaikan praktikum di Meja 1 terlebih dahulu.');
      setTimeout(() => setResetToast(null), 3000);
      return;
    }
    if (tableId === 'table3' && !tableStatus.table2Completed) {
      soundFx.playBeep(false);
      setResetToast('Meja 3 masih TERKUNCI! Selesaikan praktikum di Meja 2 terlebih dahulu.');
      setTimeout(() => setResetToast(null), 3000);
      return;
    }
    setActiveModal('none');
    setIsInquiryModalOpen(false);
    setAutoNavTarget(null);
    setTableStatus((prev) => ({
      ...prev,
      currentActiveTable: tableId,
    }));
  };

  const handleToggleSound = () => {
    setSoundEnabled((s) => {
      soundFx.enabled = !s;
      return !s;
    });
  };

  const handleSaveIdentity = (newIdentity: StudentIdentity) => {
    setIdentity(newIdentity);
    setCoins((c) => Math.max(c, 20));
  };

  const handleUpdateLabData = (partial: Partial<LabExperimentalData>) => {
    setLabData((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  // Table completions: Return to 3D 3-table room first, then auto-walk to next table!
  const handleCompleteTable1 = () => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    setCoins((c) => c + 50);
    setPlayerInitialX(-4.0); // start at Meja 1 position
    setTableStatus((prev) => ({
      ...prev,
      table1Completed: true,
      currentActiveTable: null, // Return to 3D room first!
    }));
    setAutoNavTarget('table2'); // walk to Meja 2
    setNavTransitionMsg('Meja 1 Selesai (+50 Koin)! Praktikan sedang berjalan menuju Meja 2 (Sentrifugasi)...');
  };

  const handleCompleteTable2 = () => {
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    setCoins((c) => c + 50);
    setPlayerInitialX(0.0); // start at Meja 2 position
    setTableStatus((prev) => ({
      ...prev,
      table2Completed: true,
      currentActiveTable: null, // Return to 3D room first!
    }));
    setAutoNavTarget('table3'); // walk to Meja 3
    setNavTransitionMsg('Meja 2 Selesai (+50 Koin)! Praktikan sedang berjalan menuju Meja 3 (Spektrofotometri)...');
  };

  const handleCompleteTable3 = () => {
    try {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setCoins((c) => c + 75);
    setTableStatus((prev) => ({
      ...prev,
      table3Completed: true,
      currentActiveTable: null,
    }));
    setJustCompletedTable('table3');
  };

  const handleResetPractical = () => {
    soundFx.playClick();
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = () => {
    const cleanTables: TableStatus = {
      table1Completed: false,
      table2Completed: false,
      table3Completed: false,
      currentActiveTable: null,
    };
    setTableStatus(cleanTables);
    localStorage.setItem(STORAGE_KEYS.TABLE_STATUS, JSON.stringify(cleanTables));

    const cleanData: LabExperimentalData = {
      massaBawang: 0,
      volumeEkstraksi: 0,
      jumlahPenghancuran: 0,
      waktuPenghancuran: 0,
      waktuInkubasi: 0,
      kecepatanSentrifugasi: 0,
      waktuSentrifugasi: 0,
      absorbansi260: 0,
      absorbansi280: 0,
      rasioKemurnian: 0,
      konsentrasiDNA: 0,
      totalDNA: 0,
      interpretasiKemurnian: '-',
      volumeBufferTE: 0,
    };
    setLabData(cleanData);
    localStorage.setItem(STORAGE_KEYS.LAB_DATA, JSON.stringify(cleanData));

    setJustCompletedTable(null);
    setWorkbenchSessionKey((prev) => prev + 1);
    setIsSettingsOpen(false);
    setActiveModal('none');
    setIsInquiryModalOpen(false);
    setIsResetModalOpen(false);
    soundFx.playBeep(true);

    setResetToast('Praktikum laboratorium berhasil direset ke kondisi awal. Meja 1 siap digunakan kembali, Meja 2 dan 3 terkunci.');
    setTimeout(() => setResetToast(null), 4000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-slate-100 flex flex-col justify-between">
      {/* Top HUD: Student Avatar Card, Points, Syntax Badges, and Settings */}
      <TopBarHUD
        identity={identity}
        points={coins}
        level={calculateLevel()}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReturnToRoom={() => {
          setTableStatus((p) => ({ ...p, currentActiveTable: null }));
          setActiveModal('none');
        }}
        isInWorkbench={tableStatus.currentActiveTable !== null}
        inquiryCompletion={inquiryCompletion}
        onSelectInquiryStep={handleSelectInquiryStep}
      />

      {/* Main View Area: 3D Virtual Lab or 2D Workbench */}
      <div className="relative w-full h-full flex items-center justify-center">
        {tableStatus.currentActiveTable === null ? (
          <VirtualLab3D
            tableStatus={tableStatus}
            onEnterTable={handleEnterTable}
            externalMoveVector={moveVector}
            autoNavigateTarget={autoNavTarget}
            onAutoNavigateArrived={() => {
              setAutoNavTarget(null);
            }}
            transitionMessage={navTransitionMsg}
            initialPlayerX={playerInitialX}
            onOpenInquiry={handleOpenInquiry}
          />
        ) : tableStatus.currentActiveTable === 'table1' ? (
          <div className="w-full h-full pt-16 pb-20 overflow-y-auto">
            <Workbench1
              key={`wb1-${workbenchSessionKey}`}
              labData={labData}
              onUpdateLabData={handleUpdateLabData}
              onCompleteTable1={handleCompleteTable1}
              onBackTo3D={() => setTableStatus((p) => ({ ...p, currentActiveTable: null }))}
              onReset={handleResetPractical}
            />
          </div>
        ) : tableStatus.currentActiveTable === 'table2' ? (
          <div className="w-full h-full pt-16 pb-20 overflow-y-auto">
            <Workbench2
              key={`wb2-${workbenchSessionKey}`}
              labData={labData}
              onUpdateLabData={handleUpdateLabData}
              onCompleteTable2={handleCompleteTable2}
              onBackTo3D={() => setTableStatus((p) => ({ ...p, currentActiveTable: null }))}
              onReset={handleResetPractical}
            />
          </div>
        ) : (
          <div className="w-full h-full pt-16 pb-20 overflow-y-auto">
            <Workbench3
              key={`wb3-${workbenchSessionKey}`}
              labData={labData}
              onUpdateLabData={handleUpdateLabData}
              onCompleteTable3={handleCompleteTable3}
              onBackTo3D={() => setTableStatus((p) => ({ ...p, currentActiveTable: null }))}
              onReset={handleResetPractical}
            />
          </div>
        )}
      </div>

      {/* Virtual Joystick on Bottom Left matching Reference Image (visible when in 3D room) */}
      {tableStatus.currentActiveTable === null && (
        <VirtualJoystick onMove={(vec) => setMoveVector(vec)} />
      )}

      {/* Exit / Return Icon Button on Bottom Right matching Reference Image */}
      <button
        onClick={() => {
          soundFx.playClick();
          if (tableStatus.currentActiveTable !== null) {
            setTableStatus((p) => ({ ...p, currentActiveTable: null }));
          } else {
            setIsProfileOpen(true);
          }
        }}
        title="Menu Utama / Profil"
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 border-blue-400/50 shadow-2xl flex items-center justify-center text-white hover:border-cyan-300 transition-all active:scale-95"
      >
        {/* Stylized Door/Exit Icon matching Reference Image */}
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-none stroke-current stroke-2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      {/* Bottom Center Dock matching Reference Image: [ Materi | Lab | Soal | Aktivitas ] */}
      <BottomDock
        activeModal={activeModal}
        onSelectModal={(modal) => {
          if (modal === 'none') {
            // Lab clicked: close modals and show 3D lab
            setActiveModal('none');
          } else {
            setActiveModal(modal);
          }
        }}
        isUnlocked={true}
      />

      {/* MODAL 1: MATERI */}
      {activeModal === 'materi' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between pt-16 pb-24 px-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full relative">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-2 right-2 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <LearningMaterial onNavigate={() => setActiveModal('aktivitas')} />
          </div>
        </div>
      )}

      {/* MODAL 2: AKTIVITAS & PENGISIAN SINTAKS INKUIRI */}
      {activeModal === 'aktivitas' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between pt-16 pb-24 px-2 sm:px-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full relative">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-2 right-2 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 z-10 cursor-pointer"
              title="Tutup Aktivitas"
            >
              <X className="w-5 h-5" />
            </button>
            <ActivityReport
              identity={identity}
              labData={labData}
              tableStatus={tableStatus}
              inquiryData={inquiryData}
              onSaveInquiryData={handleSaveInquiryData}
              onResetPractical={handleResetPractical}
              onNavigateToTable={(tableId) => {
                handleEnterTable(tableId);
              }}
              onOpenInquiryStepEditor={(step) => {
                setActiveModal('none');
                setInquiryModalStep(step);
                setIsInquiryModalOpen(true);
              }}
              onClose={() => setActiveModal('none')}
            />
          </div>
        </div>
      )}

      {/* Inquiry Syntax Dedicated Interactive Modal (for editing syntax answers) */}
      <InquirySyntaxModal
        isOpen={isInquiryModalOpen}
        initialStep={inquiryModalStep}
        onClose={() => setIsInquiryModalOpen(false)}
        inquiryData={inquiryData}
        onSaveInquiryData={handleSaveInquiryData}
        tableStatus={tableStatus}
        labData={labData}
        onStartExperiment={() => {
          setIsInquiryModalOpen(false);
          setActiveModal('none');
        }}
        onEnterTableDirect={(tableId) => {
          handleEnterTable(tableId);
        }}
      />

      {/* Student Profile Dialog */}
      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        identity={identity}
        onSave={handleSaveIdentity}
      />

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetPractical={handleResetPractical}
      />

      {/* Stage Completion Transition Modal */}
      {justCompletedTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-emerald-500/60 p-6 sm:p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Praktikum Berhasil!
              </span>
              <h3 className="text-xl font-black text-white">
                {justCompletedTable === 'table1'
                  ? 'Meja 1 Selesai (+50 Koin)'
                  : justCompletedTable === 'table2'
                  ? 'Meja 2 Selesai (+50 Koin)'
                  : 'Seluruh Meja Selesai (+75 Koin)!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {justCompletedTable === 'table1'
                  ? 'Filtrat ekstrak DNA telah berhasil diperoleh. Meja 2 (Sentrifugasi) kini telah TERBUKA.'
                  : justCompletedTable === 'table2'
                  ? 'Pemisahan pelet dan supernatan DNA selesai. Meja 3 (Spektrofotometri UV-Vis) kini telah TERBUKA.'
                  : 'Pengukuran absorbansi DNA selesai. Lanjutkan mengisi analisis pada menu Aktivitas & Pengisian Sintaks Inkuiri!'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  const wasTable3 = justCompletedTable === 'table3';
                  setJustCompletedTable(null);
                  if (wasTable3) {
                    setActiveModal('aktivitas');
                  } else {
                    setActiveModal('none');
                  }
                }}
                className="w-full py-3 px-6 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>
                  {justCompletedTable === 'table3'
                    ? 'LIHAT LAPORAN LENGKAP & PENGISIAN SINTAKS'
                    : 'LANJUT KE MEJA BERIKUTNYA'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Practical Confirmation Dialog */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

      {/* Floating Reset Notification Toast */}
      {resetToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xl shadow-emerald-950 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{resetToast}</span>
        </div>
      )}
    </div>
  );
}
