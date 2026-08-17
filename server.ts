import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    aiEngine: hasApiKey ? 'Gemini 3.6 Flash (Server-Side)' : 'EduGenie Rules Engine (Fallback)',
    hasApiKey,
  });
});

// Helper for cleaning JSON response from LLM output
function cleanJsonResponse(text: string): any {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
    const rawJson = jsonMatch[1].trim();
    return JSON.parse(rawJson);
  } catch (err) {
    console.error('Failed to parse JSON response from Gemini:', err, 'Raw text:', text);
    throw new Error('Malformed JSON returned from AI model');
  }
}

// 1. QUESTION ANSWERING ROUTE
app.post('/api/qa', async (req, res) => {
  try {
    const { question, subject } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGeminiAI();
    if (ai) {
      const prompt = `You are EduGenie, an expert educational AI assistant.
Answer the student's question accurately, concisely, and with engaging educational context.

Question: "${question}"
${subject ? `Subject Context: ${subject}` : ''}

Respond STRICTLY with a valid JSON object matching this schema:
{
  "question": "${question}",
  "answer": "Direct, clear, comprehensive answer to the question",
  "keyFacts": ["3-5 essential bullet point facts related to this topic"],
  "context": "Background context explaining WHY or HOW this works or historical significance",
  "relatedTopics": ["3-4 related academic topics or concepts"],
  "followUpQuestions": ["3 thought-provoking follow-up questions the student might explore"],
  "category": "Academic field (e.g., Oceanography, Physics, History, Math, Computer Science, Literature)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = cleanJsonResponse(response.text);
        return res.json(parsed);
      }
    }

    // Fallback Rule-Based Engine for QA
    const lower = question.toLowerCase();
    let category = 'General Science';
    let answer = `Regarding "${question}": `;
    let keyFacts = [
      'This is a fundamental concept in academic study.',
      'Understanding this helps build broader domain knowledge.',
      'Always consider historical and empirical evidence when studying this area.'
    ];
    let context = 'EduGenie fallback explanation: Learning about this topic expands your conceptual foundation.';
    let relatedTopics = ['System Dynamics', 'Core Principles', 'Practical Applications'];
    let followUpQuestions = ['How does this relate to everyday phenomena?', 'What are the key historical discoveries in this area?'];

    if (lower.includes('ocean') || lower.includes('largest ocean')) {
      category = 'Oceanography & Geography';
      answer = 'The Pacific Ocean is the largest and deepest ocean on Earth. It covers over 60 million square miles (165 million square kilometers), which is more than 30% of the Earth\'s total surface area and exceeds the total landmass of all continents combined.';
      keyFacts = [
        'Covers ~165,250,000 square kilometers (63,800,000 sq miles).',
        'Contains Mariana Trench (Challenger Deep, ~10,994m deep), the deepest known point on Earth.',
        'Bordered by Asia and Australia to the west, and the Americas to the east.',
        'Borders the "Ring of Fire", known for high tectonic and volcanic activity.'
      ];
      context = 'The Pacific Ocean plays a crucial role in global climate regulation, driving major weather phenomena like El Niño and La Niña, and supporting rich marine ecosystems.';
      relatedTopics = ['Ocean Currents & Thermo-haline Circulation', 'The Ring of Fire & Plate Tectonics', 'Mariana Trench Exploration', 'Marine Ecosystems & Biodiversity'];
      followUpQuestions = ['Why is the Ring of Fire so seismically active?', 'How do ocean currents in the Pacific affect global weather?'];
    } else if (lower.includes('pythagoras') || lower.includes('pythagorean')) {
      category = 'Mathematics (Geometry)';
      answer = 'The Pythagoras Theorem states that in any right-angled triangle, the square of the length of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the lengths of the other two sides: a² + b² = c².';
      keyFacts = [
        'Hypotenuse (c) is always the longest side in a right triangle.',
        'Common Pythagorean triples include (3, 4, 5), (5, 12, 13), and (8, 15, 17).',
        'Used extensively in trigonometry, navigation, construction, and computer graphics.'
      ];
      context = 'Attributed to the ancient Greek philosopher Pythagoras (~570–495 BCE), this fundamental theorem bridges geometric shapes and algebraic equations.';
      relatedTopics = ['Trigonometry Basics', 'Distance Formula in Coordinate Geometry', 'Euclidean Geometry', 'Vector Addition'];
      followUpQuestions = ['How is the Pythagoras Theorem derived geometrically?', 'How is it used to derive the distance formula in 2D and 3D space?'];
    }

    return res.json({
      question,
      answer,
      keyFacts,
      context,
      relatedTopics,
      followUpQuestions,
      category,
    });
  } catch (err: any) {
    console.error('Error in /api/qa:', err);
    res.status(500).json({ error: err.message || 'Failed to process question' });
  }
});

// 2. CONCEPT EXPLANATION ROUTE
app.post('/api/explain', async (req, res) => {
  try {
    const { concept, depth = 'highschool', subject } = req.body;
    if (!concept || typeof concept !== 'string') {
      return res.status(400).json({ error: 'Concept is required' });
    }

    const ai = getGeminiAI();
    if (ai) {
      const depthPrompts = {
        child: "Explain like the user is 5 years old: Use vivid analogies, simple everyday words, fun metaphors, and zero dense jargon.",
        highschool: "Target high school students: Clear step-by-step breakdown with intuitive formulas/concepts, key terms defined, and real-world examples.",
        college: "Target university/advanced learners: In-depth technical explanation, rigorous mechanism breakdown, mathematical or structural foundations, and nuance."
      };

      const prompt = `You are EduGenie, an expert educator.
Explain the concept: "${concept}"
Target Level: ${depth} (${depthPrompts[depth as keyof typeof depthPrompts] || depthPrompts.highschool})
${subject ? `Subject: ${subject}` : ''}

Respond STRICTLY as a JSON object:
{
  "concept": "${concept}",
  "depth": "${depth}",
  "simpleSummary": "2-3 sentence core summary of the concept",
  "analogy": "A clear, intuitive real-world analogy explaining how this concept works",
  "keyTerms": [
    {"term": "Term 1", "definition": "Clear explanation of Term 1"},
    {"term": "Term 2", "definition": "Clear explanation of Term 2"}
  ],
  "detailedExplanation": "Comprehensive markdown explanation with clear headers (###), bullet points, and step-by-step breakdown.",
  "commonPitfalls": ["Common misconception 1", "Common mistake students make 2"],
  "quickSelfCheck": {
    "question": "A quick check-for-understanding question",
    "answer": "Explanation of the correct answer"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = cleanJsonResponse(response.text);
        return res.json(parsed);
      }
    }

    // Fallback explanation generator
    return res.json({
      concept,
      depth,
      simpleSummary: `${concept} is a fundamental concept. At its core, it describes how elements interact or transform within its system.`,
      analogy: `Imagine a busy highway: cars represent components, traffic rules represent constraints, and the destination represents the output. ${concept} operates similarly!`,
      keyTerms: [
        { term: 'Inputs/Premises', definition: 'The initial state or starting conditions required.' },
        { term: 'Mechanism', definition: 'The process or step-by-step rule governing transformation.' },
        { term: 'Output/State', definition: 'The resulting equilibrium or final value produced.' }
      ],
      detailedExplanation: `### Understanding ${concept}\n\n1. **Core Idea**: ${concept} provides structure to understand complex phenomena.\n2. **How it Works**: When inputs are applied, the underlying system processes them sequentially.\n3. **Why it Matters**: Master this concept to build stronger insights across related fields.`,
      commonPitfalls: [
        `Confusing correlation with causation when observing ${concept}.`,
        'Skipping foundational premises before attempting complex problems.'
      ],
      quickSelfCheck: {
        question: `What is the single most important rule to remember about ${concept}?`,
        answer: 'The core mechanism remains consistent regardless of scale or specific input variations.'
      }
    });
  } catch (err: any) {
    console.error('Error in /api/explain:', err);
    res.status(500).json({ error: err.message || 'Failed to explain concept' });
  }
});

// 3. QUIZ GENERATION ROUTE
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic, difficulty = 'medium', questionCount = 5 } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const ai = getGeminiAI();
    if (ai) {
      const prompt = `You are EduGenie Quiz Master.
Generate an interactive multiple-choice quiz on the topic: "${topic}"
Difficulty: ${difficulty}
Number of questions: ${questionCount}

Requirements for each question:
- Exactly 4 options
- Only ONE correct option (correctAnswerIndex: 0, 1, 2, or 3)
- Clear, educational explanation explaining why the correct answer is right and why others are wrong.

Respond STRICTLY with JSON matching this structure:
{
  "id": "quiz-${Date.now()}",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "title": "${topic} Knowledge Assessment",
  "description": "Test your mastery of ${topic} with these target questions.",
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Detailed step-by-step reason for the answer."
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = cleanJsonResponse(response.text);
        return res.json(parsed);
      }
    }

    // Fallback Quiz Generator
    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);
    const questions = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: `q-${i}`,
        question: `Question ${i}: Which statement regarding ${topic} is correct?`,
        options: [
          `Key principle ${i} applies under standard conditions.`,
          `It is completely unrelated to real-world applications.`,
          `It was disproven in the 18th century.`,
          `It only functions in a vacuum.`
        ],
        correctAnswerIndex: 0,
        explanation: `Option A is correct because standard principles of ${topic} mandate this behavior.`
      });
    }

    return res.json({
      id: `quiz-local-${Date.now()}`,
      topic,
      difficulty,
      title: `${topic} Assessment`,
      description: `Evaluate your knowledge on ${topic}.`,
      questions,
      createdAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in /api/quiz:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// 4. TEXT SUMMARIZATION ROUTE
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, format = 'bullets' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text material is required' });
    }

    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeMin = Math.ceil(wordCount / 200);

    const ai = getGeminiAI();
    if (ai) {
      const prompt = `You are EduGenie Summarizer.
Analyze the provided educational text (${wordCount} words) and create an structured summary.

Text:
"""
${text}
"""

Format preference: ${format}

Respond STRICTLY with a JSON object:
{
  "originalLength": ${wordCount},
  "summaryLength": 120,
  "readingTimeSaved": "Reduced from ~${readingTimeMin} min read to ~1 min",
  "executiveSummary": "Concise 3-sentence high-level overview of the entire material",
  "bulletPoints": [
    "Key highlight 1",
    "Key highlight 2",
    "Key highlight 3",
    "Key highlight 4",
    "Key highlight 5"
  ],
  "keyTakeaways": [
    "Core actionable concept 1",
    "Core actionable concept 2",
    "Core actionable concept 3"
  ],
  "flashcards": [
    {"front": "Key Question / Term 1", "back": "Clear concise answer / definition"},
    {"front": "Key Question / Term 2", "back": "Clear concise answer / definition"},
    {"front": "Key Question / Term 3", "back": "Clear concise answer / definition"}
  ],
  "glossary": [
    {"term": "Term 1", "definition": "Definition from text"},
    {"term": "Term 2", "definition": "Definition from text"}
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = cleanJsonResponse(response.text);
        return res.json(parsed);
      }
    }

    // Fallback Summarizer
    return res.json({
      originalLength: wordCount,
      summaryLength: 80,
      readingTimeSaved: `Reduced from ~${readingTimeMin} min read to 45 seconds`,
      executiveSummary: text.length > 200 ? text.substring(0, 200) + '...' : text,
      bulletPoints: [
        'Main concept introduced in the opening section.',
        'Core supporting arguments and data points.',
        'Primary conclusion and takeaways.'
      ],
      keyTakeaways: [
        'Understand the central theme presented.',
        'Identify key definitions and scope.'
      ],
      flashcards: [
        { front: 'What is the main topic of this text?', back: 'The core subject matter discussed.' }
      ],
      glossary: [
        { term: 'Key Concept', definition: 'The central idea emphasized in the material.' }
      ]
    });
  } catch (err: any) {
    console.error('Error in /api/summarize:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize text' });
  }
});

// 5. PERSONALIZED LEARNING ROADMAP ROUTE
app.post('/api/roadmap', async (req, res) => {
  try {
    const { subject, timeframeWeeks = 4, weeklyHours = 5, currentLevel = 'Beginner' } = req.body;
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ error: 'Subject goal is required' });
    }

    const ai = getGeminiAI();
    if (ai) {
      const prompt = `You are EduGenie Career & Academic Pathway Advisor.
Design a step-by-step personalized learning path roadmap for a student wanting to master:
Subject: "${subject}"
Current Level: ${currentLevel}
Target Timeframe: ${timeframeWeeks} weeks (${weeklyHours} hours/week commitment)

Structured Requirements:
Break down the roadmap into 3 distinct phases (e.g. Phase 1: Foundations, Phase 2: Core Mastery, Phase 3: Advanced Applications & Projects).
For each phase, provide 2-3 specific milestones. Each milestone must include:
- Title & Description
- Key subtopics
- Estimated hours
- Free high-quality learning resources (videos, articles, practice)
- Hands-on practical project/challenge

Respond STRICTLY with a JSON object:
{
  "id": "roadmap-${Date.now()}",
  "subject": "${subject}",
  "targetLevel": "${currentLevel} to Advanced",
  "timeframeWeeks": ${timeframeWeeks},
  "weeklyHours": ${weeklyHours},
  "overview": "Comprehensive overview of what the student will achieve by following this pathway.",
  "prerequisites": ["Prereq 1", "Prereq 2"],
  "phases": [
    {
      "phaseName": "Phase 1: Foundations & Core Concepts",
      "level": "Beginner",
      "durationWeeks": 1,
      "milestones": [
        {
          "id": "m1",
          "title": "Milestone Title",
          "description": "Clear milestone description",
          "keyTopics": ["Topic A", "Topic B", "Topic C"],
          "estimatedHours": 5,
          "resources": [
            {"name": "Official Docs / Tutorial", "type": "article"},
            {"name": "Video Crash Course", "type": "video"}
          ],
          "practiceProject": "Build a simple project to test learning."
        }
      ]
    }
  ],
  "careerOrAcademicOutcome": "Where this learning path positions the student academically or professionally.",
  "createdAt": "${new Date().toISOString()}"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = cleanJsonResponse(response.text);
        return res.json(parsed);
      }
    }

    // Fallback Roadmap Generator
    return res.json({
      id: `roadmap-local-${Date.now()}`,
      subject,
      targetLevel: `${currentLevel} to Mastery`,
      timeframeWeeks: Number(timeframeWeeks) || 4,
      weeklyHours: Number(weeklyHours) || 5,
      overview: `A structured ${timeframeWeeks}-week learning path tailored for ${subject}, covering essential theory and practical applications.`,
      prerequisites: ['Basic problem solving skills', 'Curiosity & dedication'],
      phases: [
        {
          phaseName: 'Phase 1: Fundamentals & Core Principles',
          level: 'Beginner',
          durationWeeks: Math.ceil(timeframeWeeks * 0.3),
          milestones: [
            {
              id: 'm1',
              title: `Introduction to ${subject}`,
              description: `Master basic concepts and terminology of ${subject}.`,
              keyTopics: ['Core Definitions', 'Environment Setup', 'Basic Syntax/Rules'],
              estimatedHours: weeklyHours * 2,
              resources: [
                { name: `Free OpenSource ${subject} Guide`, type: 'article' },
                { name: 'Video Fundamentals Playlist', type: 'video' }
              ],
              practiceProject: 'Create a foundational cheat-sheet and complete 5 practice exercises.'
            }
          ]
        },
        {
          phaseName: 'Phase 2: Deep Dive & Practical Work',
          level: 'Intermediate',
          durationWeeks: Math.ceil(timeframeWeeks * 0.4),
          milestones: [
            {
              id: 'm2',
              title: `Applied Techniques in ${subject}`,
              description: 'Implement core mechanics in real-world scenarios.',
              keyTopics: ['Intermediate Patterns', 'Data Processing / Problem Solving', 'Optimization'],
              estimatedHours: weeklyHours * 3,
              resources: [
                { name: 'Interactive Exercises & Katas', type: 'practice' },
                { name: 'Recommended Textbook Chapters', type: 'book' }
              ],
              practiceProject: 'Build a mini-application or comprehensive case study.'
            }
          ]
        },
        {
          phaseName: 'Phase 3: Advanced Mastery & Portfolio Project',
          level: 'Advanced',
          durationWeeks: Math.ceil(timeframeWeeks * 0.3),
          milestones: [
            {
              id: 'm3',
              title: 'Capstone Implementation & Review',
              description: 'Synthesize all knowledge into an end-to-end project.',
              keyTopics: ['Advanced Architecture', 'Performance & Debugging', 'Best Practices'],
              estimatedHours: weeklyHours * 3,
              resources: [
                { name: 'Advanced Engineering / Academic Whitepaper', type: 'article' }
              ],
              practiceProject: 'Publish a complete capstone project or comprehensive study report.'
            }
          ]
        }
      ],
      careerOrAcademicOutcome: `Prepares you for exam excellence, technical interviews, and real-world project execution in ${subject}.`,
      createdAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in /api/roadmap:', err);
    res.status(500).json({ error: err.message || 'Failed to generate roadmap' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
