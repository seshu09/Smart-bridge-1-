import React from 'react';
import { TabType } from '../types';
import {
  Sparkles,
  HelpCircle,
  BookOpen,
  CheckSquare,
  FileText,
  Map,
  BookmarkCheck,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  aiEngineText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  aiEngineText = 'Gemini 3.6 Flash Active',
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'qa', label: 'Q&A', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'explain', label: 'Concept Explainer', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz Generator', icon: <CheckSquare className="w-4 h-4" />, badge: 'AI Quiz' },
    { id: 'summarize', label: 'Summarizer', icon: <FileText className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Learning Paths', icon: <Map className="w-4 h-4" />, badge: 'Roadmap' },
    { id: 'library', label: 'Saved Library', icon: <BookmarkCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white/95 border-b-4 border-[#7C3AED]/30 text-[#1F2937] sticky top-0 z-50 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('qa')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-200">
              <span className="text-white font-black text-2xl">G</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-[#1F2937]">
                  EduGenie
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FB923C]/20 text-[#FB923C] border border-[#FB923C]/30">
                  AI Hub
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium hidden sm:block">
                Interactive Learning Companion
              </p>
            </div>
          </div>

          {/* AI Engine Status Badge */}
          <div className="hidden md:flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-[#F3F4F6] border-2 border-[#2DD4BF]/40 text-xs text-[#1F2937] font-bold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#14B8A6]"></span>
            </span>
            <Zap className="w-4 h-4 text-[#FB923C]" />
            <span>{aiEngineText}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none border-t border-[#E5E7EB]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30 scale-102'
                    : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-black tracking-normal ${
                      isActive
                        ? 'bg-[#FB923C] text-white'
                        : 'bg-[#2DD4BF]/20 text-[#14B8A6] border border-[#2DD4BF]/30'
                    }`}
                  >
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
