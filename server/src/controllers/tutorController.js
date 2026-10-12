import ChatSession from '../models/ChatSession.js';
import Problem from '../models/Problem.js';
import { runGeminiPrompt } from '../services/geminiService.js';
import { asyncHandler } from '../utils/asyncWrapper.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { problemId, message, userCode, language } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message content cannot be empty' });
  }

  let problemContext = 'General algorithmic problem solving';
  if (problemId) {
    const problem = await Problem.findById(problemId);
    if (problem) {
      problemContext = `Problem: "${problem.title}"\nDescription: ${problem.description}\nDifficulty: ${problem.difficulty}`;
    }
  }

  let session = await ChatSession.findOne({
    userId: req.user._id,
    problemId: problemId || null,
  });

  if (!session) {
    session = await ChatSession.create({
      userId: req.user._id,
      problemId: problemId || null,
      messages: [],
    });
  }

  const prompt = `You are a world-class, Socratic DSA and Software Engineering Tutor.
Guide the candidate step-by-step without giving away the full code solution immediately unless they have solved the core logic or explicitly asked for syntax clarification.

CONTEXT:
${problemContext}

CANDIDATE CODE (${language || 'unknown'}):
${userCode ? `\`\`\`${language || 'text'}\n${userCode}\n\`\`\`` : 'No code written yet.'}

RECENT CONVERSATION HISTORY:
${session.messages.slice(-6).map((m) => `${m.role.toUpperCase()}:${m.content}`).join('\n')}

CANDIDATE QUERY:
"${message}"

Respond concisely with clear hints, complexity analysis, or targeted questions to help them think through the problem.`;

  const aiResult = await runGeminiPrompt({
    prompt,
    temperature: 0.3,
    caller: 'AI Tutor',
  });

  session.messages.push({ role: 'user', content: message });
  session.messages.push({ role: 'assistant', content: aiResult.text });
  await session.save();

  res.status(200).json({
    reply: aiResult.text,
    modelUsed: aiResult.model,
    messages: session.messages,
  });
});

// Alias for backwards compatibility if referenced elsewhere
export const handleTutorChat = sendMessage;

export const getTutorHistory = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const session = await ChatSession.findOne({
    userId: req.user._id,
    problemId: problemId || null,
  });

  res.status(200).json(session ? session.messages : []);
});

export const getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ userId: req.user._id })
    .populate('problemId', 'title slug difficulty')
    .sort({ updatedAt: -1 });

  res.status(200).json(sessions);
});

export const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await ChatSession.findOne({
    _id: id,
    userId: req.user._id,
  }).populate('problemId', 'title slug difficulty');

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.status(200).json(session);
});

export const deleteSession = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  await ChatSession.findOneAndDelete({
    userId: req.user._id,
    problemId: problemId || null,
  });

  res.status(200).json({ message: 'Chat session reset successfully' });
});