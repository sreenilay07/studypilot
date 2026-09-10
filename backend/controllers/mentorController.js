import { socraticMentorAI } from '../services/groqService.js';

// @desc    Socratic mentor interactive chat
// @route   POST /api/mentor
export const socraticMentor = async (req, res, next) => {
  try {
    const { topic, notes, conversation, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const aiResult = await socraticMentorAI({
      topic: topic || 'General Topic',
      notes: notes || '',
      conversation: conversation || [],
      message: message.trim()
    });

    res.status(200).json({
      success: true,
      data: aiResult
    });
  } catch (error) {
    console.error('Socratic Mentor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to communicate with mentor'
    });
  }
};
