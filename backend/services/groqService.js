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
  // Remove markdown code blocks if present
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.substring(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.substring(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.substring(0, cleanedText.length - 3);
  }
  cleanedText = cleanedText.trim();

  return JSON.parse(cleanedText);
};

// Available Groq models list with automatic fallbacks
const getAvailableModels = () => {
  const envModel = process.env.GROQ_MODEL;
  const defaults = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'groq/compound',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'groq/compound-mini',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
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
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Groq model '${model}' failed: ${error.message}. Retrying with next model...`);
      // If error is not model_not_found/404/decommissioned, throw immediately
      if (
        !error.message?.includes('model_not_found') &&
        !error.message?.includes('does not exist') &&
        !error.message?.includes('model_decommissioned') &&
        !error.message?.includes('decommissioned') &&
        error.status !== 404
      ) {
        throw error;
      }
    }
  }

  throw lastError || new Error('All Groq AI models failed.');
};

export const generateStudyKit = async ({ topic, notes, difficulty = 'Intermediate', learningStyle = 'Simple Explanation' }) => {
  const groq = getGroqClient();

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
7. Generate approximately 8 flashcards. Each flashcard MUST have a "question" and an "answer".
8. Generate exactly 5 multiple-choice questions in the "quiz" array.
9. Every quiz question must contain exactly 4 options in the "options" array.
10. Each quiz question must have exactly one correct "answer" (which MUST match one of the string items in "options").
11. Include a short "explanation" for every correct answer.
12. Assign every quiz question to a meaningful "concept" (e.g. "Definition", "Light Reactions", "Calvin Cycle").
13. Generate a "knowledgeMap" showing important relationships between concepts, with "nodes" array (id, label) and "edges" array (from, to, relationship).
14. Avoid duplicate questions.
15. Do not generate irrelevant content.
16. Return ONLY valid JSON matching this exact structure:
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
17. Do not wrap JSON in markdown or add conversational filler.
`;

  const userPrompt = `
Topic: ${topic}
Difficulty: ${difficulty}
Learning Style: ${learningStyle}

Student Notes:
${notes}
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

  // Validate response contract strictly
  if (!parsed.summary || typeof parsed.summary !== 'string') {
    throw new Error('Invalid AI response: summary missing or invalid');
  }
  if (!Array.isArray(parsed.keyPoints)) {
    throw new Error('Invalid AI response: keyPoints is not an array');
  }
  if (!Array.isArray(parsed.flashcards) || parsed.flashcards.length === 0) {
    throw new Error('Invalid AI response: flashcards array missing');
  }
  if (!Array.isArray(parsed.quiz) || parsed.quiz.length !== 5) {
    throw new Error('Invalid AI response: quiz must contain exactly 5 questions');
  }
  for (const q of parsed.quiz) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.answer || !q.explanation || !q.concept) {
      throw new Error('Invalid AI response: quiz question structural violation');
    }
  }

  if (!parsed.knowledgeMap || !Array.isArray(parsed.knowledgeMap.nodes)) {
    parsed.knowledgeMap = {
      nodes: parsed.keyPoints.map((kp, idx) => ({ id: `${idx + 1}`, label: kp })),
      edges: []
    };
  }

  return parsed;
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
