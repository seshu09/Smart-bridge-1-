import React, { useState } from 'react';
import { QAResponse } from '../types';
import { askQuestion } from '../services/api';
import { saveItem } from '../lib/storage';
import {
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  BookmarkPlus,
  Check,
  Copy,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Compass,
  Layers,
  Tag,
  Loader2,
} from 'lucide-react';

export const QAView: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('General');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<QAResponse[]>([]);

  const sampleQuestions = [
    { text: 'Which is the largest ocean?', subject: 'Earth Science', icon: '🌊' },
    { text: 'Why is the sky blue?', subject: 'Physics', icon: '🌤️' },
    { text: 'What is the Pythagorean Theorem used for?', subject: 'Math', icon: '📐' },
    { text: 'How does photosynthesis turn sunlight into energy?', subject: 'Biology', icon: '🌿' },
    { text: 'What triggered the Industrial Revolution?', subject: 'History', icon: '⚙️' },
  ];

  const subjects = ['General', 'Earth Science', 'Physics', 'Math', 'Biology', 'History', 'Computer Science'];

  const handleAsk = async (qToAsk?: string, sToAsk?: string) => {
    const q = qToAsk || question;
    const s = sToAsk || subject;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      const data = await askQuestion({ question: q, subject: s });
      setResult(data);
      setHistory((prev) => [data, ...prev.filter((item) => item.question !== data.question)]);
    } catch (err: any) {
      setError(err.message || 'Failed to get answer. Please try again.');
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
      const textToRead = `${result.answer}. ${result.context}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Q: ${result.question}\n\nA: ${result.answer}\n\nKey Facts:\n${result.keyFacts.map((f) => `• ${f}`).join('\n')}\n\nContext: ${result.context}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    saveItem({
      type: 'qa',
      title: result.question,
      data: result,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Header Hero */}
      <div className="bg-white border-4 border-[#7C3AED] rounded-[36px] p-6 sm:p-8 shadow-xl relative overflow-hidden text-[#1F2937]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-[#2DD4BF]/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#7C3AED]/10 border-2 border-[#7C3AED]/30 text-[#7C3AED] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Intelligent Question Answering</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight leading-tight">
            What do you want to<br />uncover today?
          </h1>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed">
            Get instant, accurate answers enriched with essential key facts, deep context, related academic topics, and follow-up inquiry prompts.
          </p>

          {/* Subject Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubject(sub)}
                className={`text-xs px-3.5 py-1.5 rounded-xl border-2 font-bold transition-all ${
                  subject === sub
                    ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md'
                    : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#1F2937] hover:border-[#7C3AED]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="pt-2"
          >
            <div className="relative flex items-center">
              <input
                id="qa-search-input"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here (e.g. Which is the largest ocean?)..."
                className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/20 rounded-2xl py-4 pl-5 pr-32 text-[#1F2937] font-bold placeholder-[#9CA3AF] text-sm shadow-inner transition-all"
              />
              <button
                id="qa-submit-button"
                type="submit"
                disabled={loading || !question.trim()}
                className="absolute right-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-slate-300 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-lg shadow-[#7C3AED]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sample Prompts */}
          <div className="pt-2">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Compass className="w-4 h-4 text-[#FB923C]" />
              <span>Try asking about:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(s.text);
                    setSubject(s.subject);
                    handleAsk(s.text, s.subject);
                  }}
                  className="bg-[#F3F4F6] hover:bg-white border-2 border-[#E5E7EB] hover:border-[#7C3AED] rounded-xl px-3.5 py-2 text-xs font-bold text-[#1F2937] flex items-center space-x-2 transition-all shadow-sm"
                >
                  <span>{s.icon}</span>
                  <span>{s.text}</span>
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 rounded-[36px] bg-white border-4 border-[#2DD4BF] space-y-6 animate-pulse">
          <div className="h-6 w-1/3 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* Answer Output */}
      {result && !loading && (
        <div className="bg-white border-4 border-[#2DD4BF] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#1F2937]">
          {/* Top Bar / Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#E5E7EB] pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-xl bg-[#2DD4BF]/20 border-2 border-[#2DD4BF]/40 text-[#14B8A6] text-xs font-extrabold uppercase tracking-wider">
                {result.category || subject}
              </span>
              <span className="text-xs text-[#6B7280] font-bold">• EduGenie Explanation</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSpeech}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 border-2 transition-all ${
                  speaking
                    ? 'bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]'
                    : 'bg-[#F3F4F6] text-[#1F2937] border-[#E5E7EB] hover:border-[#7C3AED]'
                }`}
                title="Read answer aloud"
              >
                {speaking ? <VolumeX className="w-4 h-4 text-[#FB923C]" /> : <Volume2 className="w-4 h-4 text-[#7C3AED]" />}
                <span className="hidden sm:inline">{speaking ? 'Stop' : 'Listen'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-[#F3F4F6] text-[#1F2937] hover:bg-slate-200 border-2 border-[#E5E7EB] rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
                title="Copy response"
              >
                {copied ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4 text-[#7C3AED]" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
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
                <span>{saved ? 'Saved to Library' : 'Save Q&A'}</span>
              </button>
            </div>
          </div>

          {/* Question Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] flex items-start space-x-3">
              <HelpCircle className="w-7 h-7 text-[#7C3AED] shrink-0 mt-0.5" />
              <span>{result.question}</span>
            </h2>
          </div>

          {/* Main Direct Answer Box */}
          <div className="bg-[#7C3AED] text-white p-6 rounded-3xl shadow-lg space-y-2 relative overflow-hidden">
            <div className="text-xs font-black uppercase tracking-widest text-[#FB923C] bg-white/10 px-3 py-1 rounded-full inline-flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Answer</span>
            </div>
            <p className="text-white text-base sm:text-lg leading-relaxed font-semibold">{result.answer}</p>
          </div>

          {/* Key Facts & Context Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Facts Card */}
            <div className="bg-white border-4 border-[#FB923C] rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center space-x-2 text-[#FB923C] font-black text-sm uppercase tracking-wider">
                <Lightbulb className="w-5 h-5" />
                <span>Key Facts & Takeaways</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[#1F2937] font-semibold">
                {result.keyFacts?.map((fact, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#FB923C] shrink-0 mt-2"></span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Context Card */}
            <div className="bg-white border-4 border-[#2DD4BF] rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center space-x-2 text-[#14B8A6] font-black text-sm uppercase tracking-wider">
                <Layers className="w-5 h-5" />
                <span>Educational Context</span>
              </div>
              <p className="text-xs sm:text-sm text-[#1F2937] font-medium leading-relaxed">{result.context}</p>
            </div>
          </div>

          {/* Related Topics Badges */}
          {result.relatedTopics && result.relatedTopics.length > 0 && (
            <div className="space-y-2 border-t-2 border-[#E5E7EB] pt-4">
              <div className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-[#7C3AED]" />
                <span>Related Academic Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.relatedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(`Explain ${topic}`);
                      handleAsk(`Explain ${topic}`, subject);
                    }}
                    className="bg-[#F3F4F6] hover:bg-[#7C3AED] border-2 border-[#E5E7EB] hover:border-[#7C3AED] text-[#1F2937] hover:text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <span>{topic}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions Prompts */}
          {result.followUpQuestions && result.followUpQuestions.length > 0 && (
            <div className="bg-[#FB923C]/10 border-2 border-[#FB923C]/40 rounded-3xl p-6 space-y-3">
              <div className="text-xs font-black text-[#FB923C] uppercase tracking-wider flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#FB923C]" />
                <span>Explore Next (Inquiry Prompts)</span>
              </div>
              <div className="space-y-2">
                {result.followUpQuestions.map((fq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(fq);
                      handleAsk(fq, subject);
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-[#FB923C] border-2 border-[#E5E7EB] hover:border-[#FB923C] text-xs sm:text-sm font-bold text-[#1F2937] hover:text-white flex items-center justify-between transition-all group shadow-sm"
                  >
                    <span>{fq}</span>
                    <ArrowRight className="w-4 h-4 text-[#FB923C] group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Section */}
      {history.length > 1 && (
        <div className="bg-white border-4 border-[#7C3AED]/20 rounded-[32px] p-6 space-y-4 shadow-lg">
          <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-[#7C3AED]" />
            <span>Recent Session Questions</span>
          </h3>
          <div className="space-y-2">
            {history.slice(1).map((h, idx) => (
              <button
                key={idx}
                onClick={() => setResult(h)}
                className="w-full text-left p-3.5 rounded-2xl bg-[#F3F4F6] hover:bg-[#7C3AED] text-[#1F2937] hover:text-white border-2 border-[#E5E7EB] hover:border-[#7C3AED] text-xs font-bold flex items-center justify-between transition-all"
              >
                <div className="truncate pr-4">
                  <span>{h.question}</span>
                  <span className="ml-2 opacity-75 font-normal">({h.category})</span>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
