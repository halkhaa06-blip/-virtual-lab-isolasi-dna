export interface StudentIdentity {
  name: string;
  className: string;
  studentNumber: string;
  isRegistered: boolean;
}

export interface QuizResult {
  completed: boolean;
  score: number; // 0 - 100
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  userAnswers: Record<number, string>;
  submittedAt?: string;
}

export interface LabExperimentalData {
  massaBawang: number; // grams (e.g. 15.4 g)
  volumeEkstraksi: number; // mL (filtrate volume, e.g. 18.5 mL)
  jumlahPenghancuran: number; // hits (e.g. 45 kali)
  waktuPenghancuran: number; // minutes (e.g. 2.5 menit)
  waktuInkubasi: number; // minutes (e.g. 10.0 menit)
  kecepatanSentrifugasi: number; // RPM (e.g. 8000 RPM)
  waktuSentrifugasi: number; // minutes (e.g. 10 menit)
  absorbansi260: number; // A260 (e.g. 0.942)
  absorbansi280: number; // A280 (e.g. 0.518)
  rasioKemurnian: number; // A260 / A280 (e.g. 1.82)
  konsentrasiDNA: number; // ng/µL (e.g. 47.1 ng/µL)
  totalDNA: number; // µg
  interpretasiKemurnian: string;
  volumeBufferTE: number; // mL (e.g. 0.5 mL)
}

export type TableId = 'table1' | 'table2' | 'table3';

export interface TableStatus {
  table1Completed: boolean;
  table2Completed: boolean;
  table3Completed: boolean;
  currentActiveTable: TableId | null; // null means in 3D room
}

export type NavigationTab = 
  | 'beranda'
  | 'tujuan'
  | 'materi'
  | 'virtuallab'
  | 'aktivitas';

export type InquiryStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface InquiryData {
  orientasiAnswer: string;
  orientasiSavedAt?: string;
  masalahAnswer: string;
  masalahSavedAt?: string;
  hipotesisAnswer: string;
  hipotesisSavedAt?: string;
  ujiHipotesisAnswers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
  };
  ujiHipotesisSavedAt?: string;
  kesimpulanAnswer: string;
  kesimpulanSavedAt?: string;
}
