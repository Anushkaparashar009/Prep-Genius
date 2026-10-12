import InterviewSession from '../models/InterviewSession.js';
import { runGeminiPrompt } from '../services/geminiService.js';
import { asyncHandler } from '../utils/asyncWrapper.js';

export const startInterview = asyncHandler(async (req, res) => {
  const role = req.body.role || req.body.roleTitle || 'Full Stack Engineer (SDE-1)';
  const difficulty = req.body.difficulty || req.body.interviewType || 'Entry';

  // Step 1: Realistic Interview Kickoff - Icebreaker / Introduction
  const kickoffPrompt = `You are a Principal Engineering Lead conducting a professional technical interview for a "${role}" position (${difficulty} level).
Welcome the candidate warmly in 1-2 friendly sentences. Do NOT ask complex technical questions yet.
Instead, invite them to introduce themselves, share their core tech stack, and briefly mention a favorite technical project they have worked on recently. Keep it encouraging and human.`;

  let openingQuestion = `Welcome! I'm glad to speak with you today for the ${role} role. To get us started, could you briefly introduce yourself, what technologies you enjoy working with most, and a recent project you built?`;

  try {
    const aiResult = await runGeminiPrompt({
      prompt: kickoffPrompt,
      temperature: 0.6,
      caller: 'Mock Interviewer Starter',
    });
    if (aiResult?.text?.trim()) {
      openingQuestion = aiResult.text.trim();
    }
  } catch (err) {
    console.warn('[Interview Starter Warning] Using default starter:', err.message);
  }

  const initialEntry = {
    speaker: 'interviewer',
    message: openingQuestion,
    timestamp: new Date(),
  };

  const session = await InterviewSession.create({
    userId: req.user?._id || null,
    role,
    roleTitle: role,
    difficulty,
    interviewType: difficulty,
    status: 'in-progress',
    transcript: [initialEntry],
  });

  const formattedMessages = [
    {
      role: 'assistant',
      speaker: 'interviewer',
      content: openingQuestion,
      message: openingQuestion,
    },
  ];

  res.status(201).json({
    success: true,
    session,
    transcript: session.transcript,
    messages: formattedMessages,
  });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const { sessionId, answer } = req.body;

  if (!sessionId || !answer || !answer.trim()) {
    return res.status(400).json({ message: 'Session ID and answer are required' });
  }

  const query = { _id: sessionId };
  if (req.user?._id) {
    query.userId = req.user._id;
  }

  let session = await InterviewSession.findOne(query);
  if (!session) {
    session = await InterviewSession.findById(sessionId);
  }

  if (!session) {
    return res.status(404).json({ message: 'Interview session not found' });
  }

  if (!Array.isArray(session.transcript)) {
    session.transcript = [];
  }

  // Record candidate's answer
  session.transcript.push({
    speaker: 'candidate',
    message: answer.trim(),
    timestamp: new Date(),
  });

  // Calculate current interview stage based on turns answered
  const candidateTurnCount = session.transcript.filter((t) => t.speaker === 'candidate').length;
  const roleName = session.role || session.roleTitle || 'Full Stack Engineer';
  const difficultyLevel = session.difficulty || session.interviewType || 'Entry';

  // Build progression stage instructions
  let stageGuideline = '';
  if (candidateTurnCount === 1) {
    stageGuideline = `STAGE: INTRO TRANSITION -> EASY FOUNDATIONAL QUESTION
The candidate just introduced themselves.
1. Acknowledge their background or project positively in 1 short sentence.
2. Formulate your first EASY to FUNDAMENTAL technical question relevant to ${roleName} (at ${difficultyLevel} level) or dive gently into an element of the stack/project they mentioned.`;
  } else if (candidateTurnCount === 2 || candidateTurnCount === 3) {
    stageGuideline = `STAGE: MODERATE TECHNICAL DEEP DIVE
1. Briefly evaluate their previous response (acknowledge if correct, or gently redirect if they passed/struggled).
2. Transition to a MODERATE difficulty question covering core logic, state management, API flow, database transactions, or debugging practical problems for ${roleName}.`;
  } else {
    stageGuideline = `STAGE: HARD / SYSTEM EDGE CASES & SCALABILITY
1. Briefly react to their answer.
2. Challenge them with a HARDER, senior-level question: probe an architectural edge case, race condition, caching tradeoff, failure recovery, or 10x-100x traffic scaling.`;
  }

  const historyContext = session.transcript
    .slice(-10)
    .map((t) => `${(t.speaker || 'candidate').toUpperCase()}: ${t.message}`)
    .join('\n');

  const turnPrompt = `You are an elite Technical Hiring Manager conducting a live mock technical interview for a "${roleName}" role (${difficultyLevel} level).

CURRENT INTERVIEW PROGRESSION:
${stageGuideline}

CONVERSATION TRANSCRIPT:
${historyContext}

INTERVIEWER INSTRUCTIONS:
- Stay completely in character as the interviewer.
- Keep your entire reply concise (2-4 sentences total).
- If the candidate answers "no", "don't know", or passes, be supportive, briefly explain the core concept in one sentence, and smoothly transition to a fresh question at the target difficulty.
- Do NOT provide giant code blocks or answer for them. Ask ONE targeted question at a time.`;

  const aiResult = await runGeminiPrompt({
    prompt: turnPrompt,
    temperature: 0.5,
    caller: 'Mock Interviewer Turn',
  });

  const replyText =
    aiResult?.text?.trim() ||
    `Thanks for explaining that. Let's dig deeper: how would you structure the API layer and database indexing to handle heavy concurrent read/write loads?`;

  session.transcript.push({
    speaker: 'interviewer',
    message: replyText,
    timestamp: new Date(),
  });

  session.markModified('transcript');
  await session.save();

  const allMessages = session.transcript.map((t) => ({
    role: t.speaker === 'interviewer' || t.speaker === 'assistant' ? 'assistant' : 'user',
    speaker: t.speaker,
    content: t.message,
    message: t.message,
  }));

  res.status(200).json({
    success: true,
    reply: replyText,
    transcript: session.transcript,
    messages: allMessages,
  });
});

export const sendInterviewReply = submitAnswer;
export const respondInterview = submitAnswer;

export const finishInterview = asyncHandler(async (req, res) => {
  const sessionId = req.body.sessionId || req.params?.sessionId || req.params?.id;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required to conclude interview' });
  }

  const session = await InterviewSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: 'Interview session not found' });
  }

  if (!Array.isArray(session.transcript)) {
    session.transcript = [];
  }

  // Filter only meaningful turns
  const candidateReplies = session.transcript.filter(
    (t) => (t.speaker === 'candidate' || t.role === 'user') && t.message && t.message.trim()
  );

  // If the user concludes without answering any questions
  if (candidateReplies.length === 0) {
    const earlyExitFeedback = {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      verdict: 'Incomplete',
      summary: 'The session was concluded before any questions were answered. Complete at least 2-3 interview rounds to receive an evaluation.',
      strengths: ['Initiated the mock interview session', 'Selected targeted role and track'],
      improvements: ['Engage with the interviewer by answering the introductory and technical questions', 'Practice explaining problem-solving thought process aloud'],
    };

    session.status = 'completed';
    session.feedback = earlyExitFeedback;
    await session.save();

    return res.status(200).json({
      success: true,
      feedback: earlyExitFeedback,
      session,
    });
  }

  // Build full transcript text
  const fullTranscript = session.transcript
    .map((t) => `${(t.speaker || t.role || 'user').toUpperCase()}: ${t.message || t.content || ''}`)
    .join('\n\n');

  const roleName = session.role || session.roleTitle || 'Full Stack Engineer';
  const difficulty = session.difficulty || session.interviewType || 'Entry';

  const prompt = `You are an Executive Hiring Committee Leader evaluating a completed technical interview for a ${roleName} candidate (${difficulty} level).

FULL TRANSCRIPT:
"""
${fullTranscript}
"""

CRITICAL EVALUATION INSTRUCTIONS:
- Review the candidate's answers in detail.
- For "strengths", highlight 2 to 3 genuine positive attributes (e.g. willingness to communicate, clarity, specific concepts correctly mentioned, or honest self-awareness). NEVER say "None observed" or "lack of data". Find constructive strengths from the interaction.
- For "improvements", offer 2 to 3 actionable technical or behavioral areas where they can improve.
- Score overallScore, technicalScore, and communicationScore realistically between 30 and 95 based on their actual answers.

Return a STRICT JSON object with these EXACT keys:
{
  "overallScore": <integer between 0 and 100>,
  "technicalScore": <integer between 0 and 100>,
  "communicationScore": <integer between 0 and 100>,
  "verdict": "<Strong Hire, Hire, Leaning Hire, or Needs Work>",
  "summary": "<2-sentence constructive summary of candidate performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}
Return ONLY valid JSON. No markdown ticks.`;

  const aiResult = await runGeminiPrompt({
    prompt,
    responseMimeType: 'application/json',
    temperature: 0.2,
    caller: 'Mock Interview Evaluator',
  });

  let evaluation = {};
  try {
    const rawText = (aiResult.text || '').replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    evaluation = JSON.parse(rawText);
  } catch (err) {
    evaluation = {
      overallScore: 65,
      technicalScore: 60,
      communicationScore: 70,
      verdict: 'Needs Work',
      summary: 'Candidate participated in the technical dialogue and demonstrated basic awareness.',
      strengths: ['Responsive and communicative', 'Willingness to tackle difficult technical topics'],
      improvements: ['Deepen knowledge in core architecture and data flow', 'Elaborate on edge cases and trade-offs'],
    };
  }

  session.status = 'completed';
  session.feedback = evaluation;
  await session.save();

  res.status(200).json({
    success: true,
    feedback: evaluation,
    session,
  });
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const targetId = req.params.sessionId || req.params.id;
  const session = await InterviewSession.findById(targetId);

  if (!session) {
    return res.status(404).json({ message: 'Interview session not found' });
  }

  res.status(200).json(session);
});

export const getInterviewSession = getInterviewById;

export const getUserInterviews = asyncHandler(async (req, res) => {
  const query = req.user?._id ? { userId: req.user._id } : {};
  const sessions = await InterviewSession.find(query).sort({ createdAt: -1 }).limit(10);

  res.status(200).json({
    success: true,
    sessions,
    data: sessions,
  });
});

export const getInterviewHistory = getUserInterviews;