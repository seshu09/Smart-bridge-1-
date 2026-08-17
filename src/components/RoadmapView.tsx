import React, { useState } from 'react';
import { RoadmapData, RoadmapMilestone } from '../types';
import { generateRoadmap } from '../services/api';
import { saveItem } from '../lib/storage';
import { ExportToDocsModal } from './ExportToDocsModal';
import confetti from 'canvas-confetti';
import {
  Map,
  Sparkles,
  BookmarkPlus,
  Check,
  Clock,
  ExternalLink,
  Download,
  Calendar,
  Compass,
  CheckCircle2,
  Circle,
  Loader2,
  Award,
  Video,
  FileText,
  Book,
  Code,
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [timeframeWeeks, setTimeframeWeeks] = useState(4);
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [loading, setLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Completed milestone tracking
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  const presets = [
    { name: 'SQL Database Mastery', weeks: 4, hours: 5, level: 'Beginner' },
    { name: 'Python for Data Science', weeks: 6, hours: 6, level: 'Beginner' },
    { name: 'Organic Chemistry Essentials', weeks: 8, hours: 8, level: 'Intermediate' },
    { name: 'Quantum Computing Fundamentals', weeks: 6, hours: 5, level: 'Intermediate' },
    { name: 'Full-Stack Web Architecture', weeks: 8, hours: 10, level: 'Beginner' },
  ];

  const handleGenerateRoadmap = async (sToGen?: string) => {
    const s = sToGen || subject;
    if (!s.trim()) return;

    setLoading(true);
    setError(null);
    setRoadmapData(null);
    setCompletedMilestones({});
    setSaved(false);

    try {
      const data = await generateRoadmap({
        subject: s,
        timeframeWeeks,
        weeklyHours,
        currentLevel,
      });
      setRoadmapData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (mId: string) => {
    setCompletedMilestones((prev) => {
      const next = { ...prev, [mId]: !prev[mId] };

      // Calculate if 100% completed
      if (roadmapData) {
        const totalMilestones = roadmapData.phases.flatMap((p) => p.milestones).length;
        const completedCount = Object.values(next).filter(Boolean).length;
        if (completedCount === totalMilestones && totalMilestones > 0) {
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } catch (e) {}
        }
      }

      return next;
    });
  };

  const calculateProgress = () => {
    if (!roadmapData) return 0;
    const allMilestones = roadmapData.phases.flatMap((p) => p.milestones);
    if (allMilestones.length === 0) return 0;
    const completed = allMilestones.filter((m) => completedMilestones[m.id]).length;
    return Math.round((completed / allMilestones.length) * 100);
  };

  const handleSaveRoadmap = () => {
    if (!roadmapData) return;
    saveItem({
      type: 'roadmap',
      title: `Roadmap: ${roadmapData.subject}`,
      data: {
        roadmapData,
        completedMilestones,
        progress: calculateProgress(),
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportMarkdown = () => {
    if (!roadmapData) return;
    let md = `# Learning Roadmap: ${roadmapData.subject}\n`;
    md += `Target Level: ${roadmapData.targetLevel} | Timeframe: ${roadmapData.timeframeWeeks} Weeks (${roadmapData.weeklyHours} hrs/wk)\n\n`;
    md += `## Overview\n${roadmapData.overview}\n\n`;
    md += `## Prerequisites\n${roadmapData.prerequisites.map((p) => `- ${p}`).join('\n')}\n\n`;

    roadmapData.phases.forEach((phase, pIdx) => {
      md += `### ${phase.phaseName} (${phase.level})\n`;
      phase.milestones.forEach((m) => {
        const isDone = completedMilestones[m.id] ? '[x]' : '[ ]';
        md += `- ${isDone} **${m.title}** (${m.estimatedHours} hrs)\n`;
        md += `  Description: ${m.description}\n`;
        md += `  Key Topics: ${m.keyTopics.join(', ')}\n`;
        md += `  Practical Project: ${m.practiceProject}\n\n`;
      });
    });

    md += `## Academic/Career Outcome\n${roadmapData.careerOrAcademicOutcome}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edugenie-roadmap-${roadmapData.subject.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border-4 border-[#7C3AED] rounded-[36px] p-6 sm:p-8 shadow-xl relative overflow-hidden text-[#1F2937]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-[#7C3AED]/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#7C3AED]/10 border-2 border-[#7C3AED]/30 text-[#7C3AED] text-xs font-bold uppercase tracking-wider">
            <Map className="w-4 h-4" />
            <span>Personalized Learning Path Recommendations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight leading-tight">
            Structured Educational Roadmaps
          </h1>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed">
            Specify any subject, timeframe, or goal (e.g. SQL, Quantum Physics, Calculus) to receive a phased learning roadmap with milestones, free curated resources, and progress tracking.
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateRoadmap();
            }}
            className="pt-2 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Subject Input */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Subject Goal / Skill</label>
                <input
                  id="roadmap-subject-input"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (e.g. SQL Database Mastery, Organic Chem)..."
                  className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/20 rounded-2xl py-3 px-4 text-[#1F2937] font-bold placeholder-[#9CA3AF] text-sm shadow-inner transition-all"
                />
              </div>

              {/* Timeframe weeks */}
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Timeframe (Weeks)</label>
                <select
                  value={timeframeWeeks}
                  onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
                  className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#7C3AED] rounded-2xl py-3 px-3 text-[#1F2937] font-bold text-sm shadow-inner transition-all"
                >
                  <option value={2}>2 Weeks (Sprint)</option>
                  <option value={4}>4 Weeks (1 Month)</option>
                  <option value={6}>6 Weeks</option>
                  <option value={8}>8 Weeks (Semester)</option>
                  <option value={12}>12 Weeks (Quarter)</option>
                </select>
              </div>

              {/* Weekly commitment */}
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Hours / Week</label>
                <select
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#7C3AED] rounded-2xl py-3 px-3 text-[#1F2937] font-bold text-sm shadow-inner transition-all"
                >
                  <option value={3}>3 Hours / Week</option>
                  <option value={5}>5 Hours / Week</option>
                  <option value={10}>10 Hours / Week</option>
                  <option value={15}>15+ Hours / Week</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Level options */}
              <div className="flex items-center space-x-2 bg-[#F3F4F6] border-2 border-[#E5E7EB] rounded-2xl p-1.5">
                <span className="text-xs text-[#6B7280] px-2 font-bold uppercase tracking-wider">Starting Level:</span>
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCurrentLevel(lvl)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                      currentLevel === lvl
                        ? 'bg-[#7C3AED] text-white shadow-sm'
                        : 'text-[#1F2937] hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                id="generate-roadmap-button"
                type="submit"
                disabled={loading || !subject.trim()}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-slate-300 disabled:text-slate-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-[#7C3AED]/20 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Designing Pathway...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Presets */}
          <div className="pt-1">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mr-2">Try a scenario preset:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSubject(p.name);
                    setTimeframeWeeks(p.weeks);
                    setWeeklyHours(p.hours);
                    setCurrentLevel(p.level as any);
                    handleGenerateRoadmap(p.name);
                  }}
                  className="bg-[#F3F4F6] hover:bg-white border-2 border-[#E5E7EB] hover:border-[#7C3AED] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1F2937] transition-all shadow-sm"
                >
                  🗺️ {p.name}
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
          <div className="h-20 bg-slate-100 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* Roadmap Output */}
      {roadmapData && !loading && (
        <div className="space-y-6">
          {/* Header Card with Progress */}
          <div className="bg-white border-4 border-[#2DD4BF] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-2xl text-[#1F2937]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937]">{roadmapData.subject} Learning Path</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#6B7280] mt-1 uppercase tracking-wider">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-[#7C3AED]" />
                    <span>{roadmapData.timeframeWeeks} Weeks</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-[#FB923C]" />
                    <span>{roadmapData.weeklyHours} Hours / Week</span>
                  </span>
                  <span>•</span>
                  <span className="px-3 py-0.5 rounded-full bg-[#2DD4BF]/20 text-[#14B8A6] font-black">
                    {roadmapData.targetLevel}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  id="export-roadmap-google-docs-btn"
                  onClick={() => setShowExportModal(true)}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
                  title="Export Roadmap to Google Docs"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Docs Export</span>
                </button>

                <button
                  onClick={handleExportMarkdown}
                  className="px-4 py-2 bg-[#F3F4F6] hover:bg-slate-200 border-2 border-[#E5E7EB] text-[#1F2937] rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Export MD</span>
                </button>

                <button
                  onClick={handleSaveRoadmap}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-2 transition-all shadow-md ${
                    saved
                      ? 'bg-[#2DD4BF] text-white border-[#14B8A6]'
                      : 'bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#6D28D9]'
                  }`}
                >
                  {saved ? <Check className="w-4 h-4 text-white" /> : <BookmarkPlus className="w-4 h-4" />}
                  <span>{saved ? 'Saved' : 'Save Path'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 bg-[#F9FAFB] p-4 rounded-2xl border-2 border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-[#6B7280]">Overall Roadmap Progress</span>
                <span className="text-[#14B8A6]">{calculateProgress()}% Completed</span>
              </div>
              <div className="w-full h-4 bg-[#E5E7EB] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#2DD4BF] rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Overview & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider">Course Overview</h3>
                <p className="text-xs sm:text-sm text-[#1F2937] font-semibold leading-relaxed bg-[#F9FAFB] p-4 rounded-2xl border-2 border-[#E5E7EB]">
                  {roadmapData.overview}
                </p>
              </div>

              {roadmapData.prerequisites && roadmapData.prerequisites.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-[#6B7280] uppercase tracking-wider">Prerequisites</h3>
                  <div className="bg-[#F9FAFB] p-4 rounded-2xl border-2 border-[#E5E7EB] space-y-2">
                    <ul className="space-y-1.5 text-xs text-[#1F2937] font-semibold">
                      {roadmapData.prerequisites.map((prereq, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phase-by-Phase Cards */}
          <div className="space-y-6">
            {roadmapData.phases.map((phase, pIdx) => (
              <div
                key={pIdx}
                className="bg-white border-4 border-[#FB923C] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden text-[#1F2937]"
              >
                {/* Phase Title Badge */}
                <div className="flex items-center justify-between border-b-2 border-[#E5E7EB] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FB923C] text-white flex items-center justify-center font-black text-base shadow-sm">
                      {pIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1F2937]">{phase.phaseName}</h3>
                      <div className="text-xs font-extrabold text-[#6B7280] uppercase">Level: {phase.level} • Duration: ~{phase.durationWeeks} Weeks</div>
                    </div>
                  </div>
                </div>

                {/* Milestones in Phase */}
                <div className="space-y-4">
                  {phase.milestones.map((m) => {
                    const isDone = Boolean(completedMilestones[m.id]);

                    return (
                      <div
                        key={m.id}
                        className={`p-5 rounded-2xl border-2 transition-all ${
                          isDone
                            ? 'bg-[#2DD4BF]/20 border-[#2DD4BF] text-[#14B8A6]'
                            : 'bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#FB923C]'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => toggleMilestone(m.id)}
                            className="shrink-0 mt-0.5 text-[#6B7280] hover:text-[#14B8A6] transition-colors"
                            title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-6 h-6 text-[#14B8A6]" />
                            ) : (
                              <Circle className="w-6 h-6" />
                            )}
                          </button>

                          <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className={`text-base font-black ${isDone ? 'text-[#14B8A6] line-through' : 'text-[#1F2937]'}`}>
                                {m.title}
                              </h4>
                              <span className="text-xs px-3 py-1 rounded-full bg-white border-2 border-[#E5E7EB] text-[#1F2937] font-extrabold uppercase">
                                ~{m.estimatedHours} Hours
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-[#1F2937] font-semibold leading-relaxed">{m.description}</p>

                            {/* Subtopics */}
                            {m.keyTopics && m.keyTopics.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {m.keyTopics.map((topic, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[11px] px-2.5 py-1 rounded-xl bg-white border-2 border-[#E5E7EB] text-[#7C3AED] font-extrabold"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Practice Project */}
                            {m.practiceProject && (
                              <div className="p-3.5 rounded-xl bg-[#7C3AED]/10 border-2 border-[#7C3AED]/20 text-xs text-[#1F2937] flex items-start space-x-2">
                                <Code className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-black text-[#7C3AED]">Practical Challenge: </span>
                                  <span className="font-semibold">{m.practiceProject}</span>
                                </div>
                              </div>
                            )}

                            {/* Free Resources */}
                            {m.resources && m.resources.length > 0 && (
                              <div className="pt-2 border-t-2 border-[#E5E7EB] space-y-1.5">
                                <span className="text-[11px] font-black text-[#6B7280] uppercase tracking-wider block">
                                  Recommended Study Resources:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {m.resources.map((res, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="text-xs px-3 py-1 rounded-xl bg-white border-2 border-[#E5E7EB] text-[#1F2937] font-bold flex items-center space-x-1.5 shadow-sm"
                                    >
                                      {res.type === 'video' ? (
                                        <Video className="w-3.5 h-3.5 text-red-500" />
                                      ) : res.type === 'book' ? (
                                        <Book className="w-3.5 h-3.5 text-[#FB923C]" />
                                      ) : (
                                        <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                                      )}
                                      <span>{res.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Academic / Career Outcome Card */}
          {roadmapData.careerOrAcademicOutcome && (
            <div className="bg-[#FB923C] text-white rounded-[32px] p-6 sm:p-8 space-y-3 shadow-xl">
              <div className="flex items-center space-x-2 text-white font-black text-xs uppercase tracking-wider">
                <Award className="w-5 h-5 text-white" />
                <span>Target Educational Outcome</span>
              </div>
              <p className="text-white text-sm sm:text-base font-bold leading-relaxed">
                {roadmapData.careerOrAcademicOutcome}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Export to Google Docs Modal */}
      {roadmapData && (
        <ExportToDocsModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          defaultTitle={`EduGenie Learning Path - ${roadmapData.subject}`}
          subtitle={`Timeline: ${roadmapData.timeframeWeeks} Weeks • ${roadmapData.weeklyHours} hrs/week • Target: ${roadmapData.targetLevel}`}
          sections={[
            { heading: 'Overview & Target Outcome', body: roadmapData.careerOrAcademicOutcome || roadmapData.overview || roadmapData.subject },
            ...(roadmapData.prerequisites && roadmapData.prerequisites.length > 0
              ? [{ heading: 'Prerequisites', body: roadmapData.prerequisites }]
              : []),
            ...roadmapData.phases.flatMap((phase) => [
              {
                heading: `${phase.phaseName} (${phase.durationWeeks} Weeks - ${phase.level})`,
                body: phase.milestones.map((m) =>
                  `• ${m.title} (${m.estimatedHours} hrs): ${m.description}\n  Topics: ${m.keyTopics.join(', ')}${m.practiceProject ? `\n  Project: ${m.practiceProject}` : ''}`
                ),
              },
            ]),
          ]}
        />
      )}
    </div>
  );
};
