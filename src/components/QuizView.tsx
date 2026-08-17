import React, { useState } from 'react';
import { QuizData, QuizQuestion } from '../types';
import { generateQuiz } from '../services/api';
import { saveItem } from '../lib/storage';
import { ExportToDocsModal } from './ExportToDocsModal';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Sparkles,
  Trophy,
  RotateCcw,
  Download,
  BookmarkPlus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

export const QuizView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Quiz active state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const presets = [
    { name: 'Pythagoras Theorem', diff: 'medium', count: 5 },
    { name: 'Oceans and Rivers', diff: 'easy', count: 5 },
    { name: 'Python Data Structures', diff: 'medium', count: 5 },
    { name: 'World History Basics', diff: 'easy', count: 5 },
    { name: 'Cellular Respiration', diff: 'hard', count: 5 },
  ];

  const handleGenerateQuiz = async (tToGen?: string) => {
    const t = tToGen || topic;
    if (!t.trim()) return;

    setLoading(true);
    setError(null);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setSaved(false);

    try {
      const data = await generateQuiz({ topic: t, difficulty, questionCount });
      setQuizData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return; // Locked once final quiz submitted
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percent: 0 };
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    const total = quizData.questions.length;
    const percent = Math.round((correct / total) * 100);
    return { correct, total, percent };
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const { percent } = calculateScore();
    if (percent >= 60) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
  };

  const handleSaveQuiz = () => {
    if (!quizData) return;
    saveItem({
      type: 'quiz',
      title: `Quiz: ${quizData.topic} (${quizData.difficulty})`,
      data: {
        quizData,
        userAnswers,
        score: calculateScore(),
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportText = () => {
    if (!quizData) return;
    let content = `EDUGENIE AI QUIZ: ${quizData.title}\nTopic: ${quizData.topic} | Difficulty: ${quizData.difficulty}\n\n`;
    quizData.questions.forEach((q, idx) => {
      content += `Q${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        content += `   ${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
      });
      content += `   [Correct Answer: ${String.fromCharCode(65 + q.correctAnswerIndex)}]\n`;
      content += `   Explanation: ${q.explanation}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edugenie-quiz-${quizData.topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentQ: QuizQuestion | undefined = quizData?.questions[currentQuestionIndex];
  const selectedOptionForCurrentQ = userAnswers[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border-4 border-[#FB923C] rounded-[36px] p-6 sm:p-8 shadow-xl relative overflow-hidden text-[#1F2937]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-[#FB923C]/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FB923C]/20 border-2 border-[#FB923C]/50 text-[#FB923C] text-xs font-bold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>AI-Powered Quiz Generator</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight leading-tight">
            Assess & Master Any Subject
          </h1>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed">
            Generate topic-specific self-evaluation quizzes with instant feedback, explanations, score calculations, and exportable study guides.
          </p>

          {/* Form Controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateQuiz();
            }}
            className="pt-2 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Topic Input */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Quiz Subject or Topic</label>
                <input
                  id="quiz-topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic (e.g. Pythagoras Theorem, World War II)..."
                  className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#FB923C] focus:ring-4 focus:ring-[#FB923C]/20 rounded-2xl py-3.5 px-4 text-[#1F2937] font-bold placeholder-[#9CA3AF] text-sm shadow-inner transition-all"
                />
              </div>

              {/* Difficulty Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#FB923C] rounded-2xl py-3.5 px-3 text-[#1F2937] font-bold text-sm shadow-inner transition-all"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Question Count Slider */}
              <div className="flex items-center space-x-3 bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl px-4 py-2">
                <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Questions:</span>
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                      questionCount === num
                        ? 'bg-[#FB923C] text-white shadow-sm'
                        : 'text-[#1F2937] hover:bg-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Submit button */}
              <button
                id="generate-quiz-button"
                type="submit"
                disabled={loading || !topic.trim()}
                className="bg-[#FB923C] hover:bg-amber-600 disabled:bg-slate-300 disabled:text-slate-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-[#FB923C]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preset Prompts */}
          <div className="pt-1">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mr-2">Try a scenario preset:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(p.name);
                    setDifficulty(p.diff as any);
                    setQuestionCount(p.count);
                    handleGenerateQuiz(p.name);
                  }}
                  className="bg-[#F3F4F6] hover:bg-white border-2 border-[#E5E7EB] hover:border-[#FB923C] rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#1F2937] transition-all shadow-sm"
                >
                  📝 {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-400 text-red-800 text-sm font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 rounded-[36px] bg-white border-4 border-[#7C3AED] space-y-6 animate-pulse">
          <div className="h-6 w-1/3 bg-slate-200 rounded-xl"></div>
          <div className="h-16 bg-slate-100 rounded-2xl"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-100 rounded-2xl"></div>
            <div className="h-12 bg-slate-100 rounded-2xl"></div>
            <div className="h-12 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Area */}
      {quizData && !loading && (
        <div className="space-y-6">
          {/* Quiz Header Bar */}
          <div className="bg-white border-4 border-[#7C3AED] rounded-[32px] p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl text-[#1F2937]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl text-[#1F2937]">{quizData.title}</span>
                <span className="text-xs px-3 py-1 rounded-xl bg-[#7C3AED]/10 border-2 border-[#7C3AED]/30 text-[#7C3AED] font-black uppercase tracking-wider">
                  {quizData.difficulty}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-semibold mt-1">{quizData.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                id="export-quiz-google-docs-btn"
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
                title="Export Quiz & Answers to Google Docs"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Docs Export</span>
              </button>

              <button
                onClick={handleSaveQuiz}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 border-2 transition-all shadow-md ${
                  saved
                    ? 'bg-[#2DD4BF] text-white border-[#14B8A6]'
                    : 'bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#6D28D9]'
                }`}
              >
                {saved ? <Check className="w-4 h-4 text-white" /> : <BookmarkPlus className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Quiz'}</span>
              </button>
            </div>
          </div>

          {/* Question Navigator Bar */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
            {quizData.questions.map((q, idx) => {
              const isAnswered = userAnswers[idx] !== undefined;
              const isCurrent = currentQuestionIndex === idx;
              const isCorrect = isSubmitted && userAnswers[idx] === q.correctAnswerIndex;
              const isWrong = isSubmitted && isAnswered && userAnswers[idx] !== q.correctAnswerIndex;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-2xl text-xs font-black shrink-0 flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'ring-4 ring-[#7C3AED] scale-105 shadow-md'
                      : ''
                  } ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-[#2DD4BF] text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : 'bg-[#F3F4F6] text-[#1F2937]'
                      : isAnswered
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Player */}
          {currentQ && (
            <div className="bg-white border-4 border-[#7C3AED] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-2xl text-[#1F2937]">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#6B7280] border-b-2 border-[#E5E7EB] pb-3 uppercase tracking-wider">
                <span className="text-[#7C3AED]">
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </span>
                <span>
                  Answered: {answeredCount}/{quizData.questions.length}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-xl sm:text-2xl font-black text-[#1F2937] leading-snug">
                {currentQ.question}
              </h3>

              {/* Options Grid */}
              <div className="space-y-3">
                {currentQ.options.map((optionText, oIdx) => {
                  const isSelected = selectedOptionForCurrentQ === oIdx;
                  const isCorrectAnswer = currentQ.correctAnswerIndex === oIdx;

                  let optionStyle = 'bg-[#F3F4F6] border-2 border-[#E5E7EB] text-[#1F2937] hover:border-[#7C3AED]';

                  if (selectedOptionForCurrentQ !== undefined) {
                    // Answer chosen for this question
                    if (isCorrectAnswer) {
                      optionStyle = 'bg-[#2DD4BF]/20 border-2 border-[#2DD4BF] text-[#14B8A6] font-bold';
                    } else if (isSelected && !isCorrectAnswer) {
                      optionStyle = 'bg-red-100 border-2 border-red-500 text-red-800 font-bold';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(currentQuestionIndex, oIdx)}
                      className={`w-full p-4 rounded-2xl text-left flex items-start space-x-3 transition-all ${optionStyle}`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-xs font-black text-[#1F2937] shrink-0 mt-0.5 shadow-sm">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="text-sm font-semibold leading-relaxed flex-1">{optionText}</span>
                      {selectedOptionForCurrentQ !== undefined && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-[#14B8A6] shrink-0" />
                      )}
                      {selectedOptionForCurrentQ !== undefined && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card (shows immediately when option selected) */}
              {selectedOptionForCurrentQ !== undefined && (
                <div className="p-5 rounded-2xl bg-[#F9FAFB] border-2 border-[#E5E7EB] space-y-1.5 animate-fadeIn">
                  <div className="text-xs font-black text-[#7C3AED] uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Explanation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1F2937] font-semibold leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-[#E5E7EB]">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 bg-[#F3F4F6] hover:bg-slate-200 disabled:opacity-40 text-[#1F2937] rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentQuestionIndex < quizData.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(quizData.questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  !isSubmitted && (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={answeredCount === 0}
                      className="px-6 py-3 bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:bg-slate-300 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-[#2DD4BF]/20"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Submit & Grade Quiz</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Final Results & Summary Banner */}
          {isSubmitted && (
            <div className="bg-[#FB923C] text-white rounded-[36px] p-6 sm:p-8 space-y-6 shadow-2xl text-center animate-fadeIn relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center mx-auto text-white shadow-md">
                <Trophy className="w-8 h-8 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white">Quiz Completed!</h2>
                <p className="text-white/90 text-sm font-semibold mt-1">Here is your performance evaluation</p>
              </div>

              <div className="max-w-md mx-auto grid grid-cols-3 gap-4 bg-white text-[#1F2937] p-5 rounded-3xl shadow-lg border-2 border-white/50">
                <div>
                  <div className="text-xs font-bold text-[#6B7280] uppercase">Score</div>
                  <div className="text-xl font-black text-[#1F2937]">
                    {calculateScore().correct} / {calculateScore().total}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#6B7280] uppercase">Accuracy</div>
                  <div className={`text-xl font-black ${calculateScore().percent >= 70 ? 'text-[#14B8A6]' : 'text-[#FB923C]'}`}>
                    {calculateScore().percent}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#6B7280] uppercase">Rating</div>
                  <div className="text-xs font-extrabold text-[#7C3AED] mt-1">
                    {calculateScore().percent >= 80 ? '🌟 Mastery' : calculateScore().percent >= 60 ? '👍 Good' : '📚 Practice'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRetake}
                  className="px-6 py-3 bg-white text-[#FB923C] hover:bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>

                <button
                  onClick={() => setShowExportModal(true)}
                  className="px-6 py-3 bg-white text-blue-700 hover:bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Save to Google Docs</span>
                </button>

                <button
                  onClick={handleExportText}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 border-2 border-white/40 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Text</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export to Google Docs Modal */}
      {quizData && (
        <ExportToDocsModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          defaultTitle={`EduGenie Quiz & Key - ${quizData.topic}`}
          subtitle={`Difficulty: ${quizData.difficulty.toUpperCase()} • ${quizData.questions.length} Questions`}
          sections={quizData.questions.flatMap((q, index) => [
            {
              heading: `Question ${index + 1}: ${q.question}`,
              body: q.options.map(
                (opt, optIdx) =>
                  `${String.fromCharCode(65 + optIdx)}) ${opt}${
                    optIdx === q.correctAnswerIndex ? ' [CORRECT ANSWER]' : ''
                  }`
              ),
            },
            {
              heading: `Explanation (Q${index + 1})`,
              body: q.explanation,
            },
          ])}
        />
      )}
    </div>
  );
};
