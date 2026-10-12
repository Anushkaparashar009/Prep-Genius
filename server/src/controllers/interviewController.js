import InterviewSession from '../models/InterviewSession.js';
import { generateInterviewResponse, generateInterviewFeedback } from '../services/aiService.js';

/**
 * @desc    Start a new mock interview session and fetch the opening question
 * @route   POST /api/interview/start
 * @access  Private
 */
export const startInterview = async (req, res, next) => {
  try {
    const { roleTitle = 'Full Stack Engineer (SDE-1)', difficulty = 'Entry' } = req.body;
    const userId = req.user._id;

    // Create a new session in the database
    const session = new InterviewSession({
      userId,
      roleTitle,
      difficulty,
      status: 'in-progress',
      messages: [],
    });

    // Generate opening greeting and first question from AI
    const openingQuestion = await generateInterviewResponse([], roleTitle, difficulty);

    session.messages.push({
      role: 'assistant',
      content: openingQuestion,
    });

    await session.save();

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('--- Start Interview Error ---', error);
    next(error);
  }
};

/**
 * @desc    Submit candidate answer and get interviewer's follow-up question
 * @route   POST /api/interview/reply
 * @access  Private
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    const userId = req.user._id;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: 'Answer cannot be empty.' });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This interview has already concluded.' });
    }

    // Append candidate's answer
    session.messages.push({
      role: 'user',
      content: answer.trim(),
    });

    // Generate follow-up probe or next question
    const aiReply = await generateInterviewResponse(
      session.messages,
      session.roleTitle,
      session.difficulty
    );

    session.messages.push({
      role: 'assistant',
      content: aiReply,
    });

    await session.save();

    res.status(200).json({
      success: true,
      messages: session.messages,
      latestReply: aiReply,
    });
  } catch (error) {
    console.error('--- Submit Interview Answer Error ---', error);
    next(error);
  }
};

/**
 * @desc    Conclude the interview and generate final scorecard & feedback
 * @route   POST /api/interview/finish
 * @access  Private
 */
export const finishInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (session.messages.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Interview must have at least one back-and-forth answer before concluding.',
      });
    }

    // Generate structured scorecard via AI
    const scorecard = await generateInterviewFeedback(session.messages, session.roleTitle);

    session.status = 'completed';
    session.feedback = {
      technicalScore: scorecard.technicalScore || 70,
      communicationScore: scorecard.communicationScore || 70,
      overallScore: scorecard.overallScore || 70,
      verdict: scorecard.verdict || 'Ready with Practice',
      summary: scorecard.summary || 'Interview concluded.',
      strengths: Array.isArray(scorecard.strengths) ? scorecard.strengths : [],
      improvements: Array.isArray(scorecard.improvements) ? scorecard.improvements : [],
    };

    await session.save();

    res.status(200).json({
      success: true,
      session,
      feedback: session.feedback,
    });
  } catch (error) {
    console.error('--- Finish Interview Error ---', error);
    next(error);
  }
};

/**
 * @desc    Get user's past mock interview history
 * @route   GET /api/interview/history
 * @access  Private
 */
export const getUserInterviews = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sessions = await InterviewSession.find({ userId })
      .select('roleTitle difficulty status feedback createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('--- Get User Interviews Error ---', error);
    next(error);
  }
};

/**
 * @desc    Get single interview details by ID
 * @route   GET /api/interview/:id
 * @access  Private
 */
export const getInterviewById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('--- Get Interview By ID Error ---', error);
    next(error);
  }
};