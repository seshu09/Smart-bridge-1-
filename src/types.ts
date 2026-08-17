export type TabType = 'qa' | 'explain' | 'quiz' | 'summarize' | 'roadmap' | 'library';

export interface QARequest {
  question: string;
  subject?: string;
  depth?: 'basic' | 'intermediate' | 'detailed';
}

export interface QAResponse {
  question: string;
  answer: string;
  keyFacts: string[];
  context: string;
  relatedTopics: string[];
  followUpQuestions: string[];
  category: string;
}

export interface ExplainRequest {
  concept: string;
  depth: 'child' | 'highschool' | 'college';
  subject?: string;
}

export interface ExplainResponse {
  concept: string;
  depth: 'child' | 'highschool' | 'college';
  simpleSummary: string;
  analogy: string;
  keyTerms: { term: string; definition: string }[];
  detailedExplanation: string;
  commonPitfalls: string[];
  quickSelfCheck: { question: string; answer: string };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export interface QuizData {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface SummarizeRequest {
  text: string;
  format: 'bullets' | 'executive' | 'flashcards' | 'elevator';
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface SummarizeResponse {
  originalLength: number;
  summaryLength: number;
  readingTimeSaved: string;
  executiveSummary: string;
  bulletPoints: string[];
  keyTakeaways: string[];
  flashcards: Flashcard[];
  glossary: { term: string; definition: string }[];
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  keyTopics: string[];
  estimatedHours: number;
  resources: { name: string; url?: string; type: 'video' | 'article' | 'book' | 'practice' }[];
  practiceProject: string;
  completed?: boolean;
}

export interface RoadmapPhase {
  phaseName: string; // e.g. "Phase 1: Foundations"
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  milestones: RoadmapMilestone[];
}

export interface RoadmapRequest {
  subject: string;
  timeframeWeeks: number;
  weeklyHours: number;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface RoadmapData {
  id: string;
  subject: string;
  targetLevel: string;
  timeframeWeeks: number;
  weeklyHours: number;
  overview: string;
  prerequisites: string[];
  phases: RoadmapPhase[];
  careerOrAcademicOutcome: string;
  createdAt: string;
}

export interface SavedItem {
  id: string;
  type: 'qa' | 'explain' | 'quiz' | 'summary' | 'roadmap';
  title: string;
  timestamp: string;
  data: any;
}
