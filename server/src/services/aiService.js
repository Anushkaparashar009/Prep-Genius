import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const SOCRATIC_SYSTEM_INSTRUCTION = `
You are the PrepGenius Socratic Tutor, an expert mentor dedicated to preparing college students for technical interviews, DSA, and core engineering topics.

Guiding Principles:
1. Never give the direct solution or complete code upfront.
2. Ask thought-provoking, guiding questions to steer the user toward the solution.
3. If the user is completely stuck, break down the problem into smaller milestones or offer an intuitive hint.
4. Encourage optimal time and space complexity considerations.
5. Keep your tone encouraging, concise, and professional.
`;

const INTERVIEW_SYSTEM_INSTRUCTION = `
You are a warm, professional Senior Technical Interviewer conducting a realistic mock interview for a software engineering position.

INTERVIEW PHASES & FLOW:
1. STEP 1 (FIRST TURN ONLY - MANDATORY):
   - Welcome the candidate warmly and introduce yourself briefly (1 sentence).
   - Ask the candidate to briefly introduce themselves, their background, and the primary technologies or projects they have worked with.
   - DO NOT ask any heavy technical questions in the first turn.

2. STEP 2 (AFTER INTRODUCTION):
   - Acknowledge whatever background or tech stack they shared in 1 encouraging sentence.
   - Seamlessly ask your first foundational question tailored to that target role and selected difficulty level.

3. SUBSEQUENT TURNS:
   - Ask exactly ONE question at a time.
   - Briefly acknowledge the candidate's previous response (1 sentence) and either ask a relevant follow-up or transition to the next natural interview topic.

STRICT DIFFICULTY LEVEL CALIBRATION:
- "Entry" (Freshers / Final Year College / SDE-1 / Placements):
  * Keep questions accessible, fundamental, and concept-based.
  * Avoid convoluted system design or multi-step networking protocols right off the bat.
  * Focus on: core language basics (JS, Python, C++), how frontend connects to backend, basic state vs props, HTTP status codes, simple CRUD operations, or beginner array/string logic.
  * Speak in a friendly, approachable tone that calms interview nerves.

- "Intermediate" (1-3 years experience):
  * Focus on practical implementation details: asynchronous handling, database indexing, caching strategies, API security/JWT, error handling, component re-renders, and moderate DSA optimization.

- "Advanced" (Senior / Lead level):
  * Focus on architectural trade-offs, scaling bottlenecks, distributed systems, concurrency, low-level performance, and system resiliency.

CONSTRAINTS:
- Keep your total response under 100 words per turn.
- Be professional, conversational, and encouraging.
`;

const VERIFIED_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

const getAIClient = () => {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.RESUME_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in server/.env');
  }
  return new GoogleGenAI({ apiKey });
};

const runWithTimeout = (promise, ms = 18000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`AI generation timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
};

/**
 * Socratic Tutor response generation (DSA Workspace)
 */
export const generateSocraticResponse = async (history = [], currentCode = '', language = '') => {
  const ai = getAIClient();

  if (!Array.isArray(history) || history.length === 0) {
    throw new Error('Chat history is required to generate a response.');
  }

  const formattedContents = history
    .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim().length > 0)
    .map((msg) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content.trim() }],
    }));

  while (formattedContents.length > 0 && formattedContents[0].role === 'model') {
    formattedContents.shift();
  }

  if (formattedContents.length === 0) {
    throw new Error('No valid user messages found in chat history.');
  }

  if (currentCode && currentCode.trim().length > 0) {
    const lastIndex = formattedContents.length - 1;
    if (formattedContents[lastIndex].role === 'user') {
      const codeSnippet = `\n\n[User's Current Code (${language || 'plaintext'})]:\n\`\`\`${language || ''}\n${currentCode.trim()}\n\`\`\``;
      formattedContents[lastIndex].parts[0].text += codeSnippet;
    }
  }

  let lastError = null;

  for (const model of VERIFIED_MODELS) {
    try {
      const response = await runWithTimeout(
        ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction: { parts: [{ text: SOCRATIC_SYSTEM_INSTRUCTION }] },
            temperature: 0.7,
          },
        })
      );

      if (response && response.text) {
        console.log(`[AI Tutor] Response successfully generated with: ${model}`);
        return response.text;
      }
    } catch (err) {
      console.warn(`[AI Tutor] Attempt on ${model} failed (${err?.message}). Switching to fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All model endpoints are busy. Please try again.');
};

/**
 * Mock Interview conversational turn generation
 */
export const generateInterviewResponse = async (history = [], roleTitle = 'Full Stack Engineer', difficulty = 'Entry') => {
  const ai = getAIClient();

  const roleInstruction = `${INTERVIEW_SYSTEM_INSTRUCTION}\n\nTARGET ROLE: ${roleTitle}\nTARGET DIFFICULTY LEVEL: ${difficulty}`;

  const formattedContents = history
    .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim().length > 0)
    .map((msg) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content.trim() }],
    }));

  // If opening greeting, trigger introductory kickoff
  if (formattedContents.length === 0) {
    formattedContents.push({
      role: 'user',
      parts: [
        {
          text: `Hi! I'm here for the mock interview for "${roleTitle}" at "${difficulty}" level. Please introduce yourself and start with the introductory icebreaker question.`,
        },
      ],
    });
  } else {
    while (formattedContents.length > 0 && formattedContents[0].role === 'model') {
      formattedContents.shift();
    }
  }

  let lastError = null;

  for (const model of VERIFIED_MODELS) {
    try {
      console.log(`[Mock Interview] Generating turn via: ${model}...`);
      const response = await runWithTimeout(
        ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction: { parts: [{ text: roleInstruction }] },
            temperature: 0.7,
          },
        }),
        15000
      );

      if (response && response.text) {
        console.log(`[Mock Interview] Successfully generated turn with: ${model}`);
        return response.text;
      }
    } catch (err) {
      console.warn(`[Mock Interview] Attempt on ${model} failed (${err?.message}). Trying fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate interview response from AI.');
};

/**
 * Mock Interview final evaluation & scorecard generation
 */
export const generateInterviewFeedback = async (history = [], roleTitle = 'Full Stack Engineer') => {
  const ai = getAIClient();

  const conversationText = history
    .map((m) => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  const prompt = `
You are a Senior Engineering Hiring Committee Chair.
Evaluate the candidate's performance in this completed mock interview for role: "${roleTitle}".

Interview Transcript:
"""
${conversationText}
"""

Return ONLY a valid JSON object matching this exact schema:
{
  "technicalScore": 80,
  "communicationScore": 85,
  "overallScore": 82,
  "verdict": "Strong Hire",
  "summary": "2-3 sentences evaluating the candidate's technical depth, problem-solving, and communication clarity.",
  "strengths": [
    "Identified clear trade-offs between approaches",
    "Strong understanding of core architectural principles"
  ],
  "improvements": [
    "Could discuss space complexity trade-offs earlier",
    "Practice deeper explanations on edge-case scenarios"
  ]
}
`;

  let lastError = null;

  for (const model of VERIFIED_MODELS) {
    try {
      console.log(`[Mock Interview Scorecard] Generating scorecard with: ${model}...`);
      const response = await runWithTimeout(
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        18000
      );

      if (response && response.text) {
        console.log(`[Mock Interview Scorecard] Evaluated successfully with: ${model}`);
        try {
          return JSON.parse(response.text);
        } catch {
          const cleaned = response.text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          return JSON.parse(cleaned);
        }
      }
    } catch (err) {
      console.warn(`[Mock Interview Scorecard] Attempt on ${model} failed (${err?.message}). Retrying fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate interview scorecard.');
};