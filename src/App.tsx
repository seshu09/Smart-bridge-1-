import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import { Navbar } from './components/Navbar';
import { QAView } from './components/QAView';
import { ExplainView } from './components/ExplainView';
import { QuizView } from './components/QuizView';
import { SummarizerView } from './components/SummarizerView';
import { RoadmapView } from './components/RoadmapView';
import { LibraryView } from './components/LibraryView';
import { DriveDocsView } from './components/DriveDocsView';
import { checkHealth } from './services/api';
import { Sparkles, BookOpen, CheckSquare, FileText, Map, HelpCircle, ShieldCheck, HardDrive } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('qa');
  const [aiEngineText, setAiEngineText] = useState<string>('Gemini 3.6 Flash Active');
  const [importedTextForSummary, setImportedTextForSummary] = useState<string>('');

  useEffect(() => {
    checkHealth()
      .then((data) => {
        if (data?.aiEngine) {
          setAiEngineText(data.aiEngine);
        }
      })
      .catch(() => {
        setAiEngineText('EduGenie Local Rules Engine');
      });
  }, []);

  const handleImportToSummarizer = (text: string) => {
    setImportedTextForSummary(text);
    setActiveTab('summarize');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#1F2937] flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiEngineText={aiEngineText}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'qa' && <QAView />}
        {activeTab === 'explain' && <ExplainView />}
        {activeTab === 'quiz' && <QuizView />}
        {activeTab === 'summarize' && <SummarizerView initialText={importedTextForSummary} />}
        {activeTab === 'roadmap' && <RoadmapView />}
        {activeTab === 'library' && <LibraryView />}
        {activeTab === 'drive' && (
          <DriveDocsView
            onImportToSummarizer={handleImportToSummarizer}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-[#7C3AED]/20 py-8 text-xs text-slate-600 mt-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-black text-lg shadow-md transform rotate-3">
              G
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#1F2937]">EduGenie AI</span>
              <p className="text-[11px] text-slate-500 font-medium">
                Interactive Learning & Educational AI Companion • Google Drive & Docs Enabled
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
              <span>FastAPI & Gemini AI</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-[#7C3AED]" />
              <span>Google Drive & Docs</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
