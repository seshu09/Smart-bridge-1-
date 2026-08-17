import React, { useState, useEffect } from 'react';
import { SummarizeResponse } from '../types';
import { summarizeText } from '../services/api';
import { saveItem } from '../lib/storage';
import { ExportToDocsModal } from './ExportToDocsModal';
import {
  FileText,
  Sparkles,
  Volume2,
  VolumeX,
  BookmarkPlus,
  Check,
  Copy,
  Clock,
  Upload,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  BookOpen,
  Loader2,
  List,
} from 'lucide-react';

interface SummarizerViewProps {
  initialText?: string;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({ initialText }) => {
  const [text, setText] = useState(initialText || '');
  const [format, setFormat] = useState<'bullets' | 'executive' | 'flashcards' | 'elevator'>('bullets');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  // Flashcard state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const sampleTexts = [
    {
      title: 'Oceanography: Pacific Ocean Overview',
      content: `The Pacific Ocean is the largest and deepest of Earth's oceanic divisions. It extends from the Arctic Ocean in the north to the Southern Ocean in the south and is bounded by Asia and Australia in the west and the Americas in the east. At 165.25 million square kilometers (63.8 million square miles) in area, this largest division of the World Ocean and the hydrosphere covers about 46% of Earth's water surface and about 32% of its total surface area, making it larger than all of Earth's land area combined. The centers of both the Water Hemisphere and the Western Hemisphere are in the Pacific Ocean. Ocean circulation divides it into two largely independent volumes of water that meet at the equator: the North Pacific Ocean and the South Pacific Ocean. The Mariana Trench in the western North Pacific is the deepest point in the world, reaching a depth of 10,928 meters (35,853 feet). The Pacific Ocean also contains the Ring of Fire, a region around much of the rim of the Pacific Ocean where many volcanic eruptions and earthquakes occur.`
    },
    {
      title: 'Mathematics: Pythagoras Theorem Context',
      content: `The Pythagoras Theorem, named after the ancient Greek mathematician Pythagoras, is a fundamental relationship in Euclidean geometry among the three sides of a right triangle. It states that the area of the square whose side is the hypotenuse is equal to the sum of the areas of the squares on the other two sides. This theorem can be written as an equation relating the lengths of the sides a, b and c, often called the Pythagorean equation: a² + b² = c², where c represents the length of the hypotenuse and a and b represent the lengths of the triangle's other two sides. The theorem has numerous derivations, possibly the most of any mathematical theorem. They are very diverse, including both geometric proofs and algebraic proofs, with some dating back thousands of years. The theorem can be generalized in various ways to higher-dimensional spaces, to spaces that are not Euclidean, to objects that are not right triangles, and to objects that are not triangles at all, but 3-dimensional solids.`
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setText(content);
    };
    reader.readAsText(file);
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);

    try {
      const data = await summarizeText({ text, format });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to summarize material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!result) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${result.executiveSummary}. Key points: ${result.bulletPoints.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `EXECUTIVE SUMMARY:\n${result.executiveSummary}\n\nKEY BULLET POINTS:\n${result.bulletPoints.map((b) => `• ${b}`).join('\n')}\n\nKEY TAKEAWAYS:\n${result.keyTakeaways.map((t) => `• ${t}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    saveItem({
      type: 'summary',
      title: `Summary (${result.originalLength} words)`,
      data: result,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border-4 border-[#2DD4BF] rounded-[36px] p-6 sm:p-8 shadow-xl relative overflow-hidden text-[#1F2937]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-[#2DD4BF]/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/20 border-2 border-[#2DD4BF]/50 text-[#14B8A6] text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Educational Text Summarizer</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight leading-tight">
            Condensed Study Notes & Flashcards
          </h1>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed">
            Transform lengthy chapters, articles, and research papers into executive summaries, bullet takeaways, flashcards, and reading time metrics.
          </p>

          {/* Form */}
          <div className="space-y-4 pt-2">
            <div className="relative">
              <textarea
                id="summarize-text-input"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste study material, textbook chapter, or research paper excerpt here..."
                className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#2DD4BF] focus:ring-4 focus:ring-[#2DD4BF]/20 rounded-2xl p-4 text-[#1F2937] font-semibold placeholder-[#9CA3AF] text-sm leading-relaxed shadow-inner transition-all"
              />
              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                <label className="cursor-pointer px-3.5 py-1.5 bg-[#F3F4F6] hover:bg-slate-200 border-2 border-[#E5E7EB] rounded-xl text-xs font-black uppercase text-[#1F2937] flex items-center space-x-1 shadow-sm transition-all">
                  <Upload className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Upload File</span>
                  <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider self-center">Load sample:</span>
                {sampleTexts.map((st, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setText(st.content)}
                    className="bg-[#F3F4F6] hover:bg-white border-2 border-[#E5E7EB] hover:border-[#2DD4BF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1F2937] transition-all shadow-sm"
                  >
                    📄 {st.title}
                  </button>
                ))}
              </div>

              <button
                id="summarize-submit-button"
                onClick={handleSummarize}
                disabled={loading || !text.trim()}
                className="bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:bg-slate-300 disabled:text-slate-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-[#2DD4BF]/20 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Summarize Text</span>
                  </>
                )}
              </button>
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
        <div className="p-8 rounded-[36px] bg-white border-4 border-[#2DD4BF] space-y-6 animate-pulse">
          <div className="h-6 w-1/3 bg-slate-200 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-2xl"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
        </div>
      )}

      {/* Result Display */}
      {result && !loading && (
        <div className="bg-white border-4 border-[#7C3AED] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-2xl text-[#1F2937]">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#E5E7EB] pb-4">
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1.5 rounded-full bg-[#7C3AED]/10 border-2 border-[#7C3AED]/30 text-[#7C3AED] text-xs font-black uppercase tracking-wider">
                Summary Complete
              </span>
              <span className="text-xs font-extrabold text-[#6B7280] flex items-center space-x-1">
                <Clock className="w-4 h-4 text-[#2DD4BF]" />
                <span>{result.readingTimeSaved}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSpeech}
                className={`p-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1 border-2 transition-all ${
                  speaking
                    ? 'bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]'
                    : 'bg-[#F3F4F6] text-[#1F2937] border-[#E5E7EB] hover:bg-slate-200'
                }`}
              >
                {speaking ? <VolumeX className="w-4 h-4 text-[#FB923C]" /> : <Volume2 className="w-4 h-4 text-[#7C3AED]" />}
                <span className="hidden sm:inline">{speaking ? 'Stop' : 'Listen'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-2.5 bg-[#F3F4F6] text-[#1F2937] hover:bg-slate-200 border-2 border-[#E5E7EB] rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4 text-[#7C3AED]" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                id="export-summary-google-docs-btn"
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
                title="Export Summary to Google Docs"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Export to Docs</span>
              </button>

              <button
                onClick={handleSave}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-2 transition-all shadow-md ${
                  saved
                    ? 'bg-[#2DD4BF] text-white border-[#14B8A6]'
                    : 'bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#6D28D9]'
                }`}
              >
                {saved ? <Check className="w-4 h-4 text-white" /> : <BookmarkPlus className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Summary'}</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-[#F9FAFB] p-4 rounded-2xl border-2 border-[#E5E7EB] shadow-sm">
              <div className="text-xs font-bold text-[#6B7280] uppercase">Original Words</div>
              <div className="text-xl font-black text-[#1F2937]">{result.originalLength}</div>
            </div>
            <div className="bg-[#F9FAFB] p-4 rounded-2xl border-2 border-[#E5E7EB] shadow-sm">
              <div className="text-xs font-bold text-[#6B7280] uppercase">Condensed Words</div>
              <div className="text-xl font-black text-[#7C3AED]">{result.summaryLength}</div>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-[#F9FAFB] p-4 rounded-2xl border-2 border-[#E5E7EB] shadow-sm">
              <div className="text-xs font-bold text-[#6B7280] uppercase">Reading Time Saved</div>
              <div className="text-xs font-black text-[#14B8A6] mt-1">{result.readingTimeSaved}</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-[#7C3AED]/10 border-l-4 border-[#7C3AED] p-5 rounded-r-2xl space-y-2">
            <div className="text-xs font-black text-[#7C3AED] uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Executive Overview</span>
            </div>
            <p className="text-[#1F2937] text-base font-semibold leading-relaxed">{result.executiveSummary}</p>
          </div>

          {/* Bullet Points */}
          {result.bulletPoints && result.bulletPoints.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider flex items-center space-x-1.5">
                <List className="w-4 h-4 text-[#7C3AED]" />
                <span>Key Bullet Takeaways</span>
              </h3>
              <div className="bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                <ul className="space-y-3 text-sm text-[#1F2937]">
                  {result.bulletPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] shrink-0 mt-1.5"></span>
                      <span className="font-semibold leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Interactive Flashcard Deck */}
          {result.flashcards && result.flashcards.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-[#7C3AED]" />
                  <span>AI Generated Flashcards ({result.flashcards.length})</span>
                </h3>
                <span className="text-xs font-extrabold text-[#6B7280]">
                  Card {currentFlashcardIndex + 1} of {result.flashcards.length}
                </span>
              </div>

              {/* Flashcard Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer bg-[#7C3AED] border-4 border-[#7C3AED] rounded-[32px] p-8 min-h-[200px] flex flex-col items-center justify-center text-center shadow-xl relative transition-all duration-300 hover:bg-[#6D28D9] group"
              >
                <div className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-white/20 text-white border border-white/40 absolute top-4 left-4">
                  {isFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)'}
                </div>

                <div className="text-xs text-white/80 font-bold absolute top-4 right-4 flex items-center space-x-1 group-hover:text-white">
                  <RotateCw className="w-4 h-4" />
                  <span>Click to Flip</span>
                </div>

                <p className={`text-lg sm:text-xl font-extrabold px-4 ${isFlipped ? 'text-[#2DD4BF]' : 'text-white'}`}>
                  {isFlipped
                    ? result.flashcards[currentFlashcardIndex]?.back
                    : result.flashcards[currentFlashcardIndex]?.front}
                </p>
              </div>

              {/* Flashcard Nav */}
              <div className="flex items-center justify-between">
                <button
                  disabled={currentFlashcardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="px-4 py-2.5 bg-[#F3F4F6] hover:bg-slate-200 disabled:opacity-40 text-[#1F2937] rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev Card</span>
                </button>

                <button
                  disabled={currentFlashcardIndex === result.flashcards.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex((prev) => Math.min(result.flashcards.length - 1, prev + 1));
                  }}
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1 transition-all shadow-md"
                >
                  <span>Next Card</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Glossary */}
          {result.glossary && result.glossary.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                <span>Text Glossary & Key Definitions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.glossary.map((g, idx) => (
                  <div key={idx} className="bg-[#F9FAFB] p-4 rounded-2xl border-2 border-[#E5E7EB] shadow-sm">
                    <span className="font-black text-sm text-[#7C3AED]">{g.term}: </span>
                    <span className="text-xs font-semibold text-[#1F2937] leading-relaxed">{g.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export to Google Docs Modal */}
      {result && (
        <ExportToDocsModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          defaultTitle={`EduGenie Summary - ${result.executiveSummary.substring(0, 40)}`}
          subtitle={`Reading Time Saved: ${result.readingTimeSaved} (${result.originalLength} words -> ${result.summaryLength} words)`}
          sections={[
            { heading: 'Executive Summary', body: result.executiveSummary },
            { heading: 'Key Bullet Points', body: result.bulletPoints },
            { heading: 'Core Takeaways', body: result.keyTakeaways },
            ...(result.glossary && result.glossary.length > 0
              ? [
                  {
                    heading: 'Glossary & Definitions',
                    body: result.glossary.map((g) => `${g.term}: ${g.definition}`),
                  },
                ]
              : []),
          ]}
        />
      )}
    </div>
  );
};
