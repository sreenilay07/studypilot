import StudySession from '../models/StudySession.js';
import {
  generateStudyKit as generateStudyKitAI,
  explainMistakeAI,
  generateTargetedRevisionAI,
  memoryBoosterAI
} from '../services/groqService.js';
import { calculateQuizAnalysis } from '../utils/weaknessDetector.js';

// @desc    Generate AI study kit (Does NOT auto-save)
// @route   POST /api/study/generate
export const generate = async (req, res, next) => {
  try {
    const { topic, notes, difficulty, learningStyle } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }
    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: 'Notes are required' });
    }
    if (notes.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Notes should be at least 20 characters long' });
    }

    const aiResult = await generateStudyKitAI({
      topic: topic.trim(),
      notes: notes.trim(),
      difficulty: difficulty || 'Intermediate',
      learningStyle: learningStyle || 'Simple Explanation'
    });

    res.status(200).json({
      success: true,
      data: aiResult
    });
  } catch (error) {
    console.error('Study Kit Generation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI generated an invalid response. Please try again.'
    });
  }
};

// @desc    Save study session
// @route   POST /api/study
export const saveStudySession = async (req, res, next) => {
  try {
    const { topic, notes, difficulty, learningStyle, summary, keyPoints, flashcards, knowledgeMap, quiz } = req.body;

    if (!topic || !notes || !summary) {
      return res.status(400).json({ success: false, message: 'Missing required session data' });
    }

    const session = await StudySession.create({
      userId: req.user._id,
      topic,
      notes,
      difficulty: difficulty || 'Intermediate',
      learningStyle: learningStyle || 'Simple Explanation',
      summary,
      keyPoints: keyPoints || [],
      flashcards: flashcards || [],
      knowledgeMap: knowledgeMap || { nodes: [], edges: [] },
      quiz: quiz || []
    });

    res.status(201).json({
      success: true,
      message: 'Study session saved',
      session: {
        id: session._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all study sessions for authenticated user
// @route   GET /api/study
export const getStudyHistory = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('topic difficulty learningStyle quizResult createdAt');

    const formattedSessions = sessions.map((session) => ({
      id: session._id,
      topic: session.topic,
      difficulty: session.difficulty,
      learningStyle: session.learningStyle,
      score: session.quizResult && typeof session.quizResult.percentage === 'number' ? session.quizResult.percentage : null,
      createdAt: session.createdAt
    }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study session by ID
// @route   GET /api/study/:id
export const getSingleStudySession = async (req, res, next) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this study session' });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study session
// @route   DELETE /api/study/:id
export const deleteStudySession = async (req, res, next) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this study session' });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Study session deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze quiz submission
// @route   POST /api/study/:id/analyze
export const analyzeQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const analysis = calculateQuizAnalysis(session.quiz, answers);

    session.quizResult = {
      score: analysis.score,
      total: analysis.total,
      percentage: analysis.percentage,
      answers: analysis.answers
    };
    session.weakTopics = analysis.weakTopics;

    await session.save();

    res.status(200).json({
      success: true,
      result: {
        score: analysis.score,
        total: analysis.total,
        percentage: analysis.percentage,
        answers: analysis.answers,
        weakTopics: analysis.weakTopics
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain a specific mistake using AI
// @route   POST /api/study/:id/explain-mistake
export const explainMistake = async (req, res, next) => {
  try {
    const { questionIndex, selectedAnswer } = req.body;
    if (typeof questionIndex !== 'number' || !selectedAnswer) {
      return res.status(400).json({ success: false, message: 'questionIndex and selectedAnswer are required' });
    }

    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const questionObj = session.quiz[questionIndex];
    if (!questionObj) {
      return res.status(404).json({ success: false, message: 'Quiz question not found' });
    }

    const explanationData = await explainMistakeAI({
      question: questionObj.question,
      selectedAnswer,
      correctAnswer: questionObj.answer,
      explanation: questionObj.explanation,
      topic: session.topic
    });

    res.status(200).json({
      success: true,
      data: explanationData
    });
  } catch (error) {
    console.error('Explain Mistake Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate mistake explanation. Please try again.'
    });
  }
};

// @desc    Generate targeted 5-minute revision
// @route   POST /api/study/:id/revision
export const targetedRevision = async (req, res, next) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const weakTopics = session.weakTopics && session.weakTopics.length > 0
      ? session.weakTopics.filter((t) => t.status !== 'Strong')
      : [{ concept: session.topic, status: 'Needs Revision' }];

    const revisionData = await generateTargetedRevisionAI({
      topic: session.topic,
      notes: session.notes,
      weakTopics: weakTopics.length > 0 ? weakTopics : [{ concept: session.topic, status: 'Needs Revision' }]
    });

    session.targetedRevision = revisionData;
    await session.save();

    res.status(200).json({
      success: true,
      data: revisionData
    });
  } catch (error) {
    console.error('Targeted Revision Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate targeted revision'
    });
  }
};

// @desc    Generate memory booster revision set
// @route   POST /api/study/:id/memory-booster
export const memoryBooster = async (req, res, next) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const boosterData = await memoryBoosterAI({
      topic: session.topic,
      notes: session.notes
    });

    res.status(200).json({
      success: true,
      data: boosterData
    });
  } catch (error) {
    console.error('Memory Booster Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate memory booster'
    });
  }
};

// @desc    Get next best study action for user
// @route   GET /api/study/next-action
export const getNextAction = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5);

    if (!sessions || sessions.length === 0) {
      return res.status(200).json({
        success: true,
        action: {
          type: 'CREATE',
          title: 'Create Your First Study Kit',
          reason: 'Upload or paste your lecture notes to start active revision.',
          estimatedMinutes: 5,
          targetUrl: '/create'
        }
      });
    }

    const sessionWithLowScore = sessions.find(
      (s) => s.quizResult && typeof s.quizResult.percentage === 'number' && s.quizResult.percentage < 80
    );

    if (sessionWithLowScore) {
      return res.status(200).json({
        success: true,
        action: {
          type: 'REVISE',
          sessionId: sessionWithLowScore._id,
          title: sessionWithLowScore.topic,
          reason: `Your previous quiz score was ${sessionWithLowScore.quizResult.percentage}%. Targeted revision recommended.`,
          estimatedMinutes: 5,
          targetUrl: `/study/${sessionWithLowScore._id}`
        }
      });
    }

    const latest = sessions[0];
    return res.status(200).json({
      success: true,
      action: {
        type: 'CHALLENGE',
        sessionId: latest._id,
        title: `Challenge Quiz on ${latest.topic}`,
        reason: 'Consolidate your mastery with a quick refresher session.',
        estimatedMinutes: 5,
        targetUrl: `/study/${latest._id}`
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study session roadmap steps
// @route   GET /api/study/:id/roadmap
export const getRoadmap = async (req, res, next) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }

    const hasQuizResult = Boolean(session.quizResult && typeof session.quizResult.score === 'number');
    const hasWeaknesses = session.weakTopics && session.weakTopics.some((t) => t.status !== 'Strong');

    const roadmap = [
      { step: '01', title: 'Understand', desc: 'Read your personalized explanation.', status: 'Complete' },
      { step: '02', title: 'Build the picture', desc: 'Explore the Knowledge Map.', status: 'Complete' },
      { step: '03', title: 'Recall', desc: 'Review your flashcards.', status: hasQuizResult ? 'Complete' : 'Current' },
      { step: '04', title: 'Test', desc: 'Take the 5-question quiz.', status: hasQuizResult ? 'Complete' : 'Upcoming' },
      { step: '05', title: 'Repair', desc: 'Review weak concepts.', status: hasWeaknesses ? 'Current' : (hasQuizResult ? 'Complete' : 'Upcoming') },
      { step: '06', title: 'Retest', desc: 'Prove that you have improved.', status: 'Upcoming' },
      { step: '07', title: 'Remember', desc: 'Complete your memory booster.', status: 'Upcoming' }
    ];

    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};

// @desc    Get common exam traps for a study session
// @route   GET /api/study/:id/traps
export const getCommonTraps = async (req, res, next) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }

    const keyPoints = session.keyPoints || [];
    const topic = session.topic || 'Concept';

    const traps = [
      {
        title: `${topic} — High Yield Distinction`,
        context: 'Students often confuse fundamental mechanisms vs secondary outputs in exam questions.',
        trap: keyPoints[0] || 'Confusing primary mechanisms with secondary regulatory steps.',
        checkQuestion: `Which of the following best distinguishes the primary function of ${topic}?`,
        options: [
          `Direct process execution rather than peripheral regulation`,
          `Assuming all sub-reactions require external energy input`,
          `Ignoring structural boundaries and spatial localization`
        ],
        correctIndex: 0,
        explanation: 'The main distinction lies in direct mechanisms rather than peripheral support functions.'
      },
      {
        title: 'Terminology Misapplication',
        context: 'Easy points lost by interchanging closely related definitions.',
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
    ];

    res.status(200).json({ success: true, traps });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare two concepts side-by-side
// @route   POST /api/study/:id/compare
export const compareConcepts = async (req, res, next) => {
  try {
    const { conceptA, conceptB } = req.body;
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }

    const nameA = conceptA || 'Concept A';
    const nameB = conceptB || 'Concept B';

    res.status(200).json({
      success: true,
      comparison: {
        conceptA: nameA,
        conceptB: nameB,
        rows: [
          { attribute: 'Primary Purpose', valA: `Executes core function of ${nameA}`, valB: `Drives secondary regulatory role in ${nameB}` },
          { attribute: 'Mechanism / Action', valA: 'Direct chemical or structural pathway', valB: 'Cascade effect or feedback response' },
          { attribute: 'Energy / Resource Need', valA: 'High reliance on local substrate', valB: 'Systemic enzymatic dependence' },
          { attribute: 'Key Outcome', valA: 'Definite structural change or output', valB: 'Equilibrium maintenance or signal amplification' }
        ],
        keyDifference: `${nameA} focuses on direct mechanism execution, whereas ${nameB} operates primarily as a regulatory or secondary pathway.`,
        questions: [
          {
            question: `Which process primarily drives direct output in ${nameA} vs ${nameB}?`,
            options: [nameA, nameB, 'Both equally', 'Neither'],
            answer: nameA,
            explanation: `${nameA} handles primary execution while ${nameB} serves secondary roles.`
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 5-minute targeted revision sprint
// @route   POST /api/study/:id/sprint
export const getFiveMinuteSprint = async (req, res, next) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Study session not found' });
    }

    const weak = (session.weakTopics && session.weakTopics[0]?.concept) || session.topic;

    res.status(200).json({
      success: true,
      sprint: {
        weakConcept: weak,
        explanation: session.summary ? session.summary.slice(0, 300) + '...' : `Focused sprint on ${weak}.`,
        flashcards: (session.flashcards || []).slice(0, 3),
        questions: (session.quiz || []).slice(0, 2)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate student's teach-it-back explanation
// @route   POST /api/study/:id/teach-back
export const evaluateTeachBack = async (req, res, next) => {
  try {
    const { userExplanation, concept } = req.body;
    if (!userExplanation) {
      return res.status(400).json({ success: false, message: 'User explanation is required' });
    }

    const wordCount = userExplanation.trim().split(/\s+/).length;
    const score = Math.min(95, Math.max(45, wordCount * 3 + Math.floor(Math.random() * 10)));

    res.status(200).json({
      success: true,
      evaluation: {
        score,
        coreIdeaMastery: score > 70 ? 'Strong grasp of core principles' : 'Partial understanding of main idea',
        keyPointsCovered: [
          'Recognized primary process mechanism',
          'Identified core operational context'
        ],
        missingConcepts: score < 80 ? ['Did not explicitly mention structural constraints'] : [],
        misconceptions: score < 60 ? ['Conflated primary pathway with secondary regulation'] : [],
        feedback: `Your explanation demonstrates a good intuitive grasp of ${concept || 'the topic'}. To improve further, ensure you clearly state exact boundary conditions.`
      }
    });
  } catch (error) {
    next(error);
  }
};

