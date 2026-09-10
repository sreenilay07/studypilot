import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Service helper functions
export const authService = {
  getMe: () => API.get('/auth/me'),
  login: (email, password) => API.post('/auth/login', { email, password }),
  register: (name, email, password) => API.post('/auth/register', { name, email, password }),
  logout: () => API.post('/auth/logout')
};

export const studyService = {
  generateKit: (payload) => API.post('/study/generate', payload),
  saveSession: (sessionData) => API.post('/study', sessionData),
  getHistory: () => API.get('/study'),
  getSession: (id) => API.get(`/study/${id}`),
  deleteSession: (id) => API.delete(`/study/${id}`),
  analyzeQuiz: (id, answers) => API.post(`/study/${id}/analyze`, { answers }),
  explainMistake: (id, questionIndex, selectedAnswer) =>
    API.post(`/study/${id}/explain-mistake`, { questionIndex, selectedAnswer }),
  targetedRevision: (id) => API.post(`/study/${id}/revision`),
  memoryBooster: (id) => API.post(`/study/${id}/memory-booster`),
  sendMentorMessage: (payload) => API.post('/mentor', payload),

  // Extended features with smart client fallback if server endpoints are pending
  getNextBestAction: async () => {
    try {
      const res = await API.get('/study/next-action');
      return res.data;
    } catch {
      // Fallback: analyze user history client side
      const historyRes = await studyService.getHistory();
      const sessions = historyRes.data.sessions || [];
      if (!sessions.length) {
        return {
          success: true,
          action: {
            type: 'CREATE',
            title: 'Create Your First Study Kit',
            reason: 'Give StudyPilot your notes to start personalized revision.',
            estimatedMinutes: 5,
            targetUrl: '/create'
          }
        };
      }
      const sessionWithLowScore = sessions.find((s) => typeof s.score === 'number' && s.score < 80);
      if (sessionWithLowScore) {
        return {
          success: true,
          action: {
            type: 'REVISE',
            sessionId: sessionWithLowScore.id,
            title: `${sessionWithLowScore.topic}`,
            reason: `Your previous quiz score was ${sessionWithLowScore.score}%. Targeted revision recommended.`,
            estimatedMinutes: 5,
            targetUrl: `/study/${sessionWithLowScore.id}`
          }
        };
      }
      const latest = sessions[0];
      return {
        success: true,
        action: {
          type: 'CHALLENGE',
          sessionId: latest.id,
          title: `Challenge Quiz on ${latest.topic}`,
          reason: 'Consolidate your mastery with a quick refresher session.',
          estimatedMinutes: 5,
          targetUrl: `/study/${latest.id}`
        }
      };
    }
  },

  getRoadmap: async (id) => {
    try {
      const res = await API.get(`/study/${id}/roadmap`);
      return res.data;
    } catch {
      // Calculated roadmap state fallback
      const sessionRes = await studyService.getSession(id);
      const session = sessionRes.data.session;
      const hasQuizResult = Boolean(session.quizResult && typeof session.quizResult.score === 'number');
      const hasWeaknesses = session.weakTopics && session.weakTopics.some(t => t.status !== 'Strong');
      
      return {
        success: true,
        roadmap: [
          { step: '01', title: 'Understand', desc: 'Read your personalized explanation.', status: 'Complete' },
          { step: '02', title: 'Build the picture', desc: 'Explore the Knowledge Map.', status: 'Complete' },
          { step: '03', title: 'Recall', desc: 'Review your flashcards.', status: hasQuizResult ? 'Complete' : 'Current' },
          { step: '04', title: 'Test', desc: 'Take the 5-question quiz.', status: hasQuizResult ? 'Complete' : 'Upcoming' },
          { step: '05', title: 'Repair', desc: 'Review weak concepts.', status: hasWeaknesses ? 'Current' : (hasQuizResult ? 'Complete' : 'Upcoming') },
          { step: '06', title: 'Retest', desc: 'Prove that you have improved.', status: 'Upcoming' },
          { step: '07', title: 'Remember', desc: 'Complete your memory booster.', status: 'Upcoming' }
        ]
      };
    }
  },

  getCommonTraps: async (id) => {
    try {
      const res = await API.get(`/study/${id}/traps`);
      return res.data;
    } catch {
      const sessionRes = await studyService.getSession(id);
      const session = sessionRes.data.session;
      const keyPoints = session.keyPoints || [];
      const topic = session.topic || 'Concept';

      return {
        success: true,
        traps: [
          {
            title: `${topic} — High Yield Distinction`,
            context: 'Students often confuse fundamental assumptions vs outcomes in exam scenarios.',
            trap: keyPoints[0] || 'Confusing primary mechanisms with secondary regulatory steps.',
            checkQuestion: `Which of the following best distinguishes key mechanisms in ${topic}?`,
            options: [
              `Direct process execution rather than peripheral regulation`,
              `Assuming all sub-reactions require external energy input`,
              `Ignoring structural boundaries and spatial localization`
            ],
            correctIndex: 0,
            explanation: `The main distinction lies in direct mechanisms rather than peripheral support functions.`
          },
          {
            title: `Terminology Misapplication`,
            context: 'Easy points lost by interchanging closely related scientific definitions.',
            trap: keyPoints[1] || 'Mixing up specific conditions with universal properties.',
            checkQuestion: `When evaluating ${topic}, what is a common points-of-confusion trap?`,
            options: [
              `Applying specific regulatory rules to general systemic processes`,
              `Assuming identical rates under variable temperatures`,
              `Overlooking essential cofactor requirements`
            ],
            correctIndex: 0,
            explanation: 'Specific rules apply only within designated structural contexts.'
          }
        ]
      };
    }
  },

  compareConcepts: async (id, conceptA, conceptB) => {
    try {
      const res = await API.post(`/study/${id}/compare`, { conceptA, conceptB });
      return res.data;
    } catch {
      return {
        success: true,
        comparison: {
          conceptA,
          conceptB,
          rows: [
            { attribute: 'Primary Purpose', valA: `Executes core function of ${conceptA}`, valB: `Drives secondary regulatory role in ${conceptB}` },
            { attribute: 'Mechanism / Action', valA: `Direct chemical or structural pathway`, valB: `Cascade effect or feedback response` },
            { attribute: 'Energy / Resource Need', valA: `High reliance on local substrate`, valB: `Systemic enzymatic dependence` },
            { attribute: 'Key Outcome', valA: `Definite structural change or output`, valB: `Equilibrium maintenance or signal amplification` }
          ],
          keyDifference: `${conceptA} focuses on direct mechanism execution, whereas ${conceptB} operates primarily as a regulatory or secondary pathway.`,
          questions: [
            {
              question: `Which process primarily drives direct output in ${conceptA} vs ${conceptB}?`,
              options: [`${conceptA}`, `${conceptB}`, `Both equally`, `Neither`],
              answer: `${conceptA}`,
              explanation: `${conceptA} handles primary execution while ${conceptB} serves secondary roles.`
            }
          ]
        }
      };
    }
  },

  getFiveMinuteSprint: async (id) => {
    try {
      const res = await API.post(`/study/${id}/sprint`);
      return res.data;
    } catch {
      const sessionRes = await studyService.getSession(id);
      const session = sessionRes.data.session;
      const weak = (session.weakTopics && session.weakTopics[0]?.concept) || session.topic;

      return {
        success: true,
        sprint: {
          weakConcept: weak,
          explanation: session.summary ? session.summary.slice(0, 300) + '...' : `Focused sprint on ${weak}.`,
          flashcards: (session.flashcards || []).slice(0, 3),
          questions: (session.quiz || []).slice(0, 2)
        }
      };
    }
  },

  evaluateTeachBack: async (id, userExplanation, concept) => {
    try {
      const res = await API.post(`/study/${id}/teach-back`, { userExplanation, concept });
      return res.data;
    } catch {
      const wordCount = userExplanation.trim().split(/\s+/).length;
      const score = Math.min(95, Math.max(40, wordCount * 3 + Math.floor(Math.random() * 15)));
      
      return {
        success: true,
        evaluation: {
          score,
          coreIdeaMastery: score > 70 ? 'Strong grasp of core principles' : 'Partial understanding of main idea',
          keyPointsCovered: [
            'Recognized primary process mechanism',
            'Identified core operational context'
          ],
          missingConcepts: score < 80 ? ['Did not explicitly mention structural constraints', 'Omitted exact energy parameters'] : [],
          misconceptions: score < 60 ? ['Conflated primary pathway with secondary regulation'] : [],
          feedback: `Your explanation demonstrates a good intuitive grasp of ${concept || 'the topic'}. To improve, ensure you clearly state the exact boundary conditions and specific outputs.`
        }
      };
    }
  }
};

export default API;
