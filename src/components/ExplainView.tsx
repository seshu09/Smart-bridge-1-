import React, { useState } from 'react';
import { ExplainResponse } from '../types';
import { explainConcept } from '../services/api';
import { saveItem } from '../lib/storage';
import { ExportToDocsModal } from './ExportToDocsModal';
import Markdown from 'react-markdown';
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  BookmarkPlus,
  Check,
  Copy,
  Baby,
  GraduationCap,
  Award,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';

export const ExplainView: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [subject, setSubject] = useState('');
  const [depth, setDepth] = useState<'child' | 'highschool' | 'college'>('highschool');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSelfCheckAnswer, setShowSelfCheckAnswer] = useState(false);

  const presets = [
    { name: 'Pythagoras Theorem', subject: 'Math', depth: 'highschool' },
    { name: 'Photosynthesis', subject: 'Biology', depth: 'child' },
    { name: 'Quantum Entanglement', subject: 'Physics', depth: 'college' },
    { name: 'Supply and Demand', subject: 'Economics', depth: 'highschool' },
    { name: 'Recursion in Code', subject: 'Computer Science', depth: 'highschool' },
  ];

  const handleExplain = async (cToExplain?: string, dToUse?: 'child' | 'highschool' | 'college') => {
    const c = cToExplain || concept;
    const d = dToUse || depth;
    if (!c.trim()) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);
    setShowSelfCheckAnswer(false);

    try {
      const data = await explainConcept({ concept: c, depth: d, subject });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate explanation. Please try again.');
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
      const textToRead = `${result.simpleSummary}. Analogy: ${result.analogy}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Concept: ${result.concept} (${result.depth})\n\nSummary: ${result.simpleSummary}\n\nAnalogy: ${result.analogy}\n\nDetailed Explanation:\n${result.detailedExplanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    saveItem({
      type: 'explain',
      title: `Explanation: ${result.concept}`,
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
            <BookOpen className="w-4 h-4" />
            <span>Simplified Concept Explainer</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight leading-tight">
            Demystify Complex Topics<br />At Any Learning Level
          </h1>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed">
            Break down tough subjects into intuitive analogies, key term glossaries, misconceptions, and custom depth levels tailored to your background.
          </p>

          {/* Depth Selection Toggle Buttons */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
              Target Learning Depth:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDepth('child')}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center space-x-3 transition-all ${
                  depth === 'child'
                    ? 'bg-[#2DD4BF] border-[#14B8A6] text-white shadow-md font-bold'
                    : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#1F2937] hover:border-[#2DD4BF]'
                }`}
              >
                <div className={`p-2 rounded-xl ${depth === 'child' ? 'bg-white/20 text-white' : 'bg-[#FB923C]/20 text-[#FB923C]'}`}>
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs sm:text-sm">ELI5 (Age 5)</div>
                  <div className={`text-[11px] ${depth === 'child' ? 'text-white/90' : 'text-[#6B7280]'}`}>Simple analogies</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDepth('highschool')}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center space-x-3 transition-all ${
                  depth === 'highschool'
                    ? 'bg-[#2DD4BF] border-[#14B8A6] text-white shadow-md font-bold'
                    : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#1F2937] hover:border-[#2DD4BF]'
                }`}
              >
                <div className={`p-2 rounded-xl ${depth === 'highschool' ? 'bg-white/20 text-white' : 'bg-[#7C3AED]/20 text-[#7C3AED]'}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs sm:text-sm">High School</div>
                  <div className={`text-[11px] ${depth === 'highschool' ? 'text-white/90' : 'text-[#6B7280]'}`}>Balanced facts</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDepth('college')}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center space-x-3 transition-all ${
                  depth === 'college'
                    ? 'bg-[#2DD4BF] border-[#14B8A6] text-white shadow-md font-bold'
                    : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#1F2937] hover:border-[#2DD4BF]'
                }`}
              >
                <div className={`p-2 rounded-xl ${depth === 'college' ? 'bg-white/20 text-white' : 'bg-[#14B8A6]/20 text-[#14B8A6]'}`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs sm:text-sm">University Level</div>
                  <div className={`text-[11px] ${depth === 'college' ? 'text-white/90' : 'text-[#6B7280]'}`}>Technical rigor</div>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExplain();
            }}
            className="pt-2 space-y-3"
          >
            <div className="relative flex items-center">
              <input
                id="concept-input"
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Enter concept to explain (e.g. Pythagoras Theorem, Black Holes)..."
                className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#2DD4BF] focus:ring-4 focus:ring-[#2DD4BF]/20 rounded-2xl py-4 pl-5 pr-36 text-[#1F2937] font-bold placeholder-[#9CA3AF] text-sm shadow-inner transition-all"
              />
              <button
                id="explain-submit-button"
                type="submit"
                disabled={loading || !concept.trim()}
                className="absolute right-2 bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:bg-slate-300 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-lg shadow-[#2DD4BF]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Explain</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preset Buttons */}
          <div className="pt-1">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mr-2">Try an example:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setConcept(p.name);
                    setSubject(p.subject);
                    setDepth(p.depth as any);
                    handleExplain(p.name, p.depth as any);
                  }}
                  className="bg-[#F3F4F6] hover:bg-white border-2 border-[#E5E7EB] hover:border-[#2DD4BF] rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#1F2937] transition-all shadow-sm"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-400 text-red-800 text-sm font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 rounded-[36px] bg-white border-4 border-[#7C3AED] space-y-6 animate-pulse">
          <div className="h-6 w-1/2 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-100 rounded-2xl"></div>
          <div className="h-44 bg-slate-100 rounded-2xl"></div>
        </div>
      )}

      {/* Result Display */}
      {result && !loading && (
        <div className="bg-white border-4 border-[#7C3AED] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#1F2937]">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#E5E7EB] pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-xl bg-[#7C3AED]/10 border-2 border-[#7C3AED]/30 text-[#7C3AED] text-xs font-black capitalize">
                Level: {result.depth === 'child' ? "ELI5 (Age 5)" : result.depth === 'highschool' ? "High School" : "University Level"}
              </span>
              <span className="text-xs text-[#6B7280] font-bold">• EduGenie Concept Breakdown</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSpeech}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 border-2 transition-all ${
                  speaking
                    ? 'bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]'
                    : 'bg-[#F3F4F6] text-[#1F2937] border-[#E5E7EB] hover:border-[#7C3AED]'
                }`}
              >
                {speaking ? <VolumeX className="w-4 h-4 text-[#FB923C]" /> : <Volume2 className="w-4 h-4 text-[#7C3AED]" />}
                <span className="hidden sm:inline">{speaking ? 'Stop' : 'Listen'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-[#F3F4F6] text-[#1F2937] hover:bg-slate-200 border-2 border-[#E5E7EB] rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4 text-[#7C3AED]" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                id="export-explain-google-docs-btn"
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
                title="Export to Google Docs"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Export to Docs</span>
              </button>

              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 border-2 transition-all shadow-md ${
                  saved
                    ? 'bg-[#2DD4BF] text-white border-[#14B8A6]'
                    : 'bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#6D28D9]'
                }`}
              >
                {saved ? <Check className="w-4 h-4 text-white" /> : <BookmarkPlus className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Save Concept'}</span>
              </button>
            </div>
          </div>

          {/* Title & Core Summary */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] mb-3">{result.concept}</h2>
            <p className="text-[#1F2937] text-base leading-relaxed bg-[#F3F4F6] p-5 rounded-2xl border-2 border-[#E5E7EB] font-semibold">
              {result.simpleSummary}
            </p>
          </div>

          {/* Vivid Real-World Analogy */}
          {result.analogy && (
            <div className="bg-[#FB923C] text-white p-6 rounded-3xl shadow-lg space-y-2 relative overflow-hidden">
              <div className="flex items-center space-x-2 text-white font-black text-xs uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full inline-flex">
                <Lightbulb className="w-4 h-4 text-white" />
                <span>Real-World Analogy</span>
              </div>
              <p className="text-white text-base sm:text-lg font-semibold italic leading-relaxed">
                "{result.analogy}"
              </p>
            </div>
          )}

          {/* Key Terms Glossary */}
          {result.keyTerms && result.keyTerms.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                <span>Essential Terminology</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.keyTerms.map((item, idx) => (
                  <div key={idx} className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-4 space-y-1 shadow-sm">
                    <span className="font-extrabold text-sm text-[#7C3AED]">{item.term}</span>
                    <p className="text-xs text-[#1F2937] font-medium leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Markdown Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider">
              Comprehensive Breakdown
            </h3>
            <div className="markdown-body bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-3xl p-6 text-[#1F2937] text-sm leading-relaxed space-y-3 font-medium">
              <Markdown>{result.detailedExplanation}</Markdown>
            </div>
          </div>

          {/* Common Pitfalls / Misconceptions */}
          {result.commonPitfalls && result.commonPitfalls.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-red-700 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Student Pitfalls & Misconceptions</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-red-900 font-bold">
                {result.commonPitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Self Check Question */}
          {result.quickSelfCheck && (
            <div className="bg-[#2DD4BF]/10 border-4 border-[#2DD4BF] rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#14B8A6] font-black text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Quick Self-Check</span>
                </div>
                <button
                  onClick={() => setShowSelfCheckAnswer(!showSelfCheckAnswer)}
                  className="px-3.5 py-1.5 bg-[#2DD4BF] hover:bg-[#14B8A6] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1 transition-all shadow-md"
                >
                  {showSelfCheckAnswer ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Answer</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show Answer</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm font-black text-[#1F2937]">{result.quickSelfCheck.question}</p>

              {showSelfCheckAnswer && (
                <div className="p-4 bg-white border-2 border-[#2DD4BF] rounded-2xl text-xs sm:text-sm font-bold text-[#14B8A6] animate-fadeIn shadow-sm">
                  <span className="font-black">Answer: </span>
                  {result.quickSelfCheck.answer}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export to Google Docs Modal */}
      {result && (
        <ExportToDocsModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          defaultTitle={`EduGenie Concept Guide - ${result.concept}`}
          subtitle={`Level: ${result.depth.toUpperCase()}`}
          sections={[
            { heading: 'Concept', body: result.concept },
            { heading: 'Core Summary', body: result.simpleSummary },
            { heading: 'Intuitive Analogy', body: result.analogy },
            {
              heading: 'Key Terminology',
              body: result.keyTerms.map((k) => `${k.term}: ${k.definition}`),
            },
            { heading: 'Detailed Explanation', body: result.detailedExplanation },
            { heading: 'Common Misconceptions & Pitfalls', body: result.commonPitfalls },
            {
              heading: 'Self-Check Question',
              body: `Question: ${result.quickSelfCheck.question}\nAnswer: ${result.quickSelfCheck.answer}`,
            },
          ]}
        />
      )}
    </div>
  );
};
