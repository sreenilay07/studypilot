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
