import {
  QARequest,
  QAResponse,
  ExplainRequest,
  ExplainResponse,
  QuizRequest,
  QuizData,
  SummarizeRequest,
  SummarizeResponse,
  RoadmapRequest,
  RoadmapData,
} from '../types';

export async function checkHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function askQuestion(req: QARequest): Promise<QAResponse> {
  const res = await fetch('/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to answer question');
  }
  return res.json();
}

export async function explainConcept(req: ExplainRequest): Promise<ExplainResponse> {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to explain concept');
  }
  return res.json();
}

export async function generateQuiz(req: QuizRequest): Promise<QuizData> {
  const res = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate quiz');
  }
  return res.json();
}

export async function summarizeText(req: SummarizeRequest): Promise<SummarizeResponse> {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to summarize text');
  }
  return res.json();
}

export async function generateRoadmap(req: RoadmapRequest): Promise<RoadmapData> {
  const res = await fetch('/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate roadmap');
  }
  return res.json();
}
