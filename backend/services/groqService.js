import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is missing or not configured in server/.env file.');
  }
  return new Groq({ apiKey });
};

// Helper function to safely clean and parse JSON from AI response
const parseAndValidateJSON = (text) => {
  let cleanedText = text.trim();
  cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonSubstring = cleanedText.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSubstring);
    }
    throw err;
  }
};

// Available Groq models list with automatic fallbacks
const getAvailableModels = () => {
  const envModel = process.env.GROQ_MODEL;
  const defaults = [
    'groq/compound',
    'groq/compound-mini',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b'
  ];
  if (envModel && !defaults.includes(envModel)) {
    return [envModel, ...defaults];
  }
  return defaults;
};

// Execute Groq completion with model fallback retry
const createCompletionWithFallback = async (groq, params) => {
  const models = getAvailableModels();
  let lastError = null;

  for (const model of models) {
    try {
      const response = await groq.chat.completions.create({
        ...params,
        model
      });
      if (response && response.choices && response.choices[0]?.message?.content) {
        return response;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Groq model '${model}' failed: ${error.message}. Trying next model...`);
    }
  }

  throw lastError || new Error('All Groq AI models failed.');
};

export const generateStudyKit = async ({ topic, notes, difficulty = 'Intermediate', learningStyle = 'Simple Explanation' }) => {
  const groq = getGroqClient();

  // Truncate notes safely if too large for Groq TPM token limits (8000 TPM limit)
  const MAX_NOTES_CHARS = 10000;
  let safeNotes = notes;
  if (notes.length > MAX_NOTES_CHARS) {
    const head = notes.substring(0, 5000);
    const tail = notes.substring(notes.length - 5000);
    safeNotes = `${head}\n\n[... Note Context Truncated for AI Analysis ...]\n\n${tail}`;
  }

  const systemPrompt = `
You are Pocket Mentor, an AI educational assistant.
Your job is to transform student-provided notes into a personalized learning kit.

IMPORTANT RULES:
1. Treat the student's notes as the primary source.
2. Do not unnecessarily introduce information not supported by the notes.
3. Correct obvious factual issues only when necessary.
4. Adapt explanations according to the requested learning style: ${learningStyle}.
5. Adapt complexity according to difficulty: ${difficulty}.
6. Keep explanations concise and useful for revision.
7. Generate approximately 6 to 8 flashcards. Each flashcard MUST have a "question" and an "answer".
8. Generate 5 multiple-choice questions in the "quiz" array.
9. Every quiz question must contain exactly 4 options in the "options" array.
10. Each quiz question must have exactly one correct "answer" (which MUST match one of the string items in "options").
11. Include a short "explanation" for every correct answer.
12. Assign every quiz question to a meaningful "concept" (e.g. "Definition", "Core Mechanics", "Application").
13. Generate a "knowledgeMap" showing important relationships between concepts, with "nodes" array (id, label) and "edges" array (from, to, relationship).
14. Avoid duplicate questions.
15. Return ONLY valid JSON matching this exact structure:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "flashcards": [
    { "question": "...", "answer": "..." }
  ],
  "knowledgeMap": {
    "nodes": [{ "id": "1", "label": "..." }],
    "edges": [{ "from": "1", "to": "2", "relationship": "..." }]
  },
  "quiz": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": "...",
      "explanation": "...",
      "concept": "..."
    }
  ]
}
`;

  const userPrompt = `
Topic: ${topic}
Difficulty: ${difficulty}
Learning Style: ${learningStyle}

Student Notes:
${safeNotes}
`;

  const response = await createCompletionWithFallback(groq, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response received from Groq AI');
  }

  const parsed = parseAndValidateJSON(content);

  // Robust field extraction & key normalization
  const summary =
    typeof parsed.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim()
      : parsed.overview || `Study Kit overview for ${topic}.`;

  const keyPoints = Array.isArray(parsed.keyPoints)
    ? parsed.keyPoints
    : Array.isArray(parsed.key_points)
    ? parsed.key_points
    : [summary];

  // Flashcards extraction & fallback construction
  const rawCards =
    parsed.flashcards || parsed.flashCards || parsed.flash_cards || parsed.cards || [];

  let flashcards = Array.isArray(rawCards)
    ? rawCards
        .filter((c) => c && (c.question || c.front || c.q))
        .map((c) => ({
          question: c.question || c.front || c.q || 'Question',
          answer: c.answer || c.back || c.a || 'Answer'
        }))
    : [];

  if (flashcards.length === 0) {
    flashcards = keyPoints.map((kp, idx) => ({
      question: `Key Concept ${idx + 1} (${topic}): What should you remember?`,
      answer: typeof kp === 'string' ? kp : JSON.stringify(kp)
    }));
  }

  if (flashcards.length === 0) {
    flashcards = [
      { question: `What is the core subject of ${topic}?`, answer: summary },
      { question: `What is the primary takeaway for ${topic}?`, answer: `Review the notes on ${topic} to master the fundamentals.` }
    ];
  }

  // Quiz extraction & fallback construction
  const rawQuiz = parsed.quiz || parsed.questions || parsed.quizQuestions || [];
  let quiz = Array.isArray(rawQuiz)
    ? rawQuiz.map((q, idx) => {
        const questionText = q.question || q.title || `Question ${idx + 1} on ${topic}`;
        let opts = Array.isArray(q.options) ? q.options.map(String) : [];
        if (opts.length < 4) {
          const defaults = ['Option A', 'Option B', 'Option C', 'Option D'];
          while (opts.length < 4) {
            opts.push(defaults[opts.length]);
          }
        } else if (opts.length > 4) {
          opts = opts.slice(0, 4);
        }
        const ans = q.answer && opts.includes(String(q.answer)) ? String(q.answer) : opts[0];
        return {
          question: questionText,
          options: opts,
          answer: ans,
          explanation: q.explanation || `The correct answer is "${ans}".`,
          concept: q.concept || `Concept ${idx + 1}`
        };
      })
    : [];

  // Ensure quiz has at least some questions if empty
  if (quiz.length === 0) {
    quiz = keyPoints.slice(0, 5).map((kp, idx) => ({
      question: `Which statement correctly describes concept ${idx + 1} of ${topic}?`,
      options: [
        typeof kp === 'string' ? kp : 'Correct definition',
        'Incorrect alternative statement A',
        'Incorrect alternative statement B',
        'Incorrect alternative statement C'
      ],
      answer: typeof kp === 'string' ? kp : 'Correct definition',
      explanation: `Based on your study notes: ${kp}`,
      concept: `Key Concept ${idx + 1}`
    }));
  }

  // Knowledge map normalization
  let knowledgeMap = parsed.knowledgeMap;
  if (!knowledgeMap || !Array.isArray(knowledgeMap.nodes) || knowledgeMap.nodes.length === 0) {
    knowledgeMap = {
      nodes: keyPoints.slice(0, 6).map((kp, idx) => ({
        id: `${idx + 1}`,
        label: typeof kp === 'string' ? (kp.length > 25 ? kp.substring(0, 25) + '...' : kp) : `Node ${idx + 1}`
      })),
      edges: []
    };
  }

  return {
    summary,
    keyPoints,
    flashcards,
    quiz,
    knowledgeMap
  };
};

export const explainMistakeAI = async ({ question, selectedAnswer, correctAnswer, explanation, topic }) => {
  const groq = getGroqClient();

  const systemPrompt = `
You are Pocket Mentor, a friendly student-focused AI tutor.
The student took a quiz on "${topic}" and got a question wrong.
Explain the mistake in a short, encouraging, and clear student-friendly manner.

Return ONLY valid JSON matching this schema:
{
  "whyWrong": "Short clear explanation of why the selected answer is incorrect and what misconception led to it.",
  "correctConcept": "Short concise summary of the correct concept.",
  "memoryTrick": "A fun or memorable mnemonic / trick to remember the correct answer."
}
`;

  const userPrompt = `
Topic: ${topic}
Question: ${question}
Student's Answer: ${selectedAnswer}
Correct Answer: ${correctAnswer}
Standard Explanation: ${explanation}
`;

  const response = await createCompletionWithFallback(groq, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return parseAndValidateJSON(content);
};

export const generateTargetedRevisionAI = async ({ topic, notes, weakTopics }) => {
  const groq = getGroqClient();

  const weakConceptsStr = weakTopics.map((t) => `${t.concept} (${t.status})`).join(', ');

  const systemPrompt = `
You are Pocket Mentor. Create a focused 5-minute revision kit targeting ONLY the student's weak concepts.
Weak concepts to target: ${weakConceptsStr}

Return ONLY valid JSON with this structure:
{
  "topic": "${topic} - Weak Area Focus",
  "summary": "Clear, direct 5-minute explanation targeted at fixing misconceptions in: ${weakConceptsStr}",
  "flashcards": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "questions": [
    { "question": "...", "answer": "...", "explanation": "..." },
    { "question": "...", "answer": "...", "explanation": "..." }
  ]
}
`;

  const userPrompt = `
Topic: ${topic}
Weak Topics: ${weakConceptsStr}
Original Notes Context: ${notes.substring(0, 1000)}
`;

  const response = await createCompletionWithFallback(groq, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return parseAndValidateJSON(content);
};

export const socraticMentorAI = async ({ topic, notes, conversation = [], message }) => {
  const groq = getGroqClient();

  const systemPrompt = `
You are Pocket Mentor behaving as a Socratic mentor.
Your goal is to help the student understand "${topic}" using the Socratic method.

RULES:
1. Do not immediately reveal the answer.
2. Ask guiding questions to help the student reach the answer themselves.
3. Give subtle hints when the student struggles.
4. Encourage reasoning and confirm correct logic.
5. Keep responses concise (2-4 sentences max).
6. Stay strictly within the supplied study topic: ${topic}.
7. Return ONLY valid JSON:
{
  "reply": "Your Socratic response or guiding question here"
}
`;

  const formattedConversation = conversation.map((c) => ({
    role: c.role === 'assistant' ? 'assistant' : 'user',
    content: c.message || c.content
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Topic notes context: ${notes.substring(0, 500)}` },
    ...formattedConversation,
    { role: 'user', content: message }
  ];

  const response = await createCompletionWithFallback(groq, {
    messages,
    temperature: 0.5,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return parseAndValidateJSON(content);
};

export const memoryBoosterAI = async ({ topic, notes }) => {
  const groq = getGroqClient();

  const systemPrompt = `
You are Pocket Mentor. Generate a quick 2-minute memory booster revision set for "${topic}".
Return ONLY valid JSON:
{
  "estimatedTime": "2 minutes",
  "flashcards": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "questions": [
    { "question": "...", "answer": "...", "explanation": "..." }
  ]
}
`;

  const response = await createCompletionWithFallback(groq, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Topic: ${topic}\nNotes: ${notes.substring(0, 800)}` }
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return parseAndValidateJSON(content);
};
