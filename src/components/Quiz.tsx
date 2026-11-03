import React, { useState } from 'react';
import { Question } from '../data/quizQuestions';
import { QuizResult, NavigationTab } from '../types/lab';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award, 
  HelpCircle, 
  AlertCircle,
  RotateCcw,
  FlaskConical,
  BookOpen
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface QuizProps {
  type: 'pretest' | 'posttest';
  title: string;
  subtitle: string;
  questions: Question[];
  existingResult?: QuizResult | null;
  onSaveResult: (result: QuizResult) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const Quiz: React.FC<QuizProps> = ({
  type,
  title,
  subtitle,
  questions,
  existingResult,
  onSaveResult,
  onNavigate,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(
    existingResult?.userAnswers || {}
  );
  const [submitted, setSubmitted] = useState<boolean>(existingResult?.completed || false);
  const [result, setResult] = useState<QuizResult | null>(existingResult || null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSelect = (questionId: number, optionKey: string) => {
    if (submitted) return;
    soundFx.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
    setErrorMessage('');
  };

  const handleSubmit = () => {
    // Check all questions answered
    const unanswered = questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      setErrorMessage(`Harap jawab seluruh pertanyaan! Masih ada ${unanswered.length} soal yang belum dijawab.`);
      soundFx.playBeep(false);
      return;
    }

    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const wrongCount = questions.length - correctCount;
    const score = Math.round((correctCount / questions.length) * 100);

    const newResult: QuizResult = {
      completed: true,
      score,
      correctCount,
      wrongCount,
      totalQuestions: questions.length,
      userAnswers: selectedAnswers,
      submittedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    soundFx.playBeep(true);
    setResult(newResult);
    setSubmitted(true);
    onSaveResult(newResult);
  };

  const handleRetake = () => {
    if (!confirm('Apakah Anda yakin ingin mengulang pengerjaan tes ini?')) return;
    soundFx.playClick();
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-blue-900/40 p-6 sm:p-8 shadow-xl">
        <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <span>{type === 'pretest' ? 'Asesmen Diagnostik Awal' : 'Evaluasi Sumatif Pembelajaran'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Submitted Result Scorecard */}
      {submitted && result && (
        <div className="rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hasil Penilaian {type === 'pretest' ? 'Pretest' : 'Posttest'}</h3>
                <p className="text-xs text-slate-400">Tersimpan pada sistem rekapitulasi nilai</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-black text-cyan-400">{result.score}</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Skala 0 - 100</div>
              </div>
              <div className="flex items-center gap-2 text-xs border-l border-slate-800 pl-4">
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {result.correctCount} Benar
                </div>
                <div className="text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {result.wrongCount} Salah
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleRetake}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Tes</span>
            </button>

            {type === 'pretest' ? (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('virtuallab');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Lanjut ke Game Virtual Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('aktivitas');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <span>Lihat Rekapitulasi Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selectedKey = selectedAnswers[q.id];
          const isCorrect = selectedKey === q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                submitted
                  ? isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Question title without symbols */}
              <div className="flex items-start gap-2.5 mb-4">
                <span className="font-black text-blue-400 text-sm sm:text-base shrink-0">
                  {idx + 1}.
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 ml-0 sm:ml-10">
                {q.options.map((opt) => {
                  const isChecked = selectedKey === opt.key;
                  let optionStyle = 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white';

                  if (submitted) {
                    if (opt.key === q.correctAnswer) {
                      optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isChecked && !isCorrect) {
                      optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      optionStyle = 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-60';
                    }
                  } else if (isChecked) {
                    optionStyle = 'bg-blue-600 border-blue-400 text-white font-semibold shadow-md shadow-blue-600/30';
                  }

                  return (
                    <button
                      key={opt.key}
                      disabled={submitted}
                      onClick={() => handleSelect(q.id, opt.key)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-white text-blue-700'
                            : 'bg-slate-700/80 text-slate-300'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-xs sm:text-sm">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {submitted && (
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 ml-0 sm:ml-10 text-xs leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Jawaban Anda Benar (Kunci: {q.correctAnswer})
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Jawaban Anda Salah (Kunci: {q.correctAnswer})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300">
                    <strong className="text-slate-400 font-semibold">Penjelasan Ilmiah: </strong>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Footer */}
      {!submitted && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Terjawab: {Object.keys(selectedAnswers).length} dari {questions.length} soal
            </div>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <span>{type === 'pretest' ? 'Selesaikan Pretest' : 'Kumpulkan Jawaban Posttest'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
