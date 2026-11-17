import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

const PREFERRED_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
];

const withTimeout = (promise, ms = 12000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms)
    ),
  ]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dynamically discover an active Flash model if static IDs return 404
const discoverAvailableFlashModels = async (ai) => {
  try {
    const pager = await ai.models.list();
    const discovered = [];
    for await (const m of pager) {
      const name = (m.name || '').replace(/^models\//, '');
      const actions = m.supportedActions || m.supportedGenerationMethods || [];
      if (
        name.includes('flash') &&
        !name.includes('image') &&
        !name.includes('tts') &&
        !name.includes('audio') &&
        (actions.length === 0 || actions.includes('generateContent'))
      ) {
        discovered.push(name);
      }
    }
    return discovered;
  } catch (err) {
    console.warn('[GeminiService] Model discovery failed:', err?.message);
    return [];
  }
};

export const runGeminiPrompt = async ({
  prompt,
  responseMimeType = 'text/plain',
  temperature = 0.2,
  caller = 'AI Service',
}) => {
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in server configuration.');
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;
  let all404 = true;

  const tryModel = async (model) => {
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType,
          temperature,
        },
      }),
      12000
    );

    if (response && response.text) {
      console.log(`[${caller}] Successfully evaluated via ${model}`);
      return { text: response.text, model };
    }
    return null;
  };

  for (const model of PREFERRED_MODELS) {
    try {
      const result = await tryModel(model);
      if (result) return result;
    } catch (err) {
      const rawMsg = String(err?.message || '');
      const status = err?.status || '';
      console.warn(`[${caller}] ${model} failed (${status || rawMsg}). Switching model...`);
      lastError = err;

      if (status !== 404 && !rawMsg.includes('404')) {
        all404 = false;
      }

      if (rawMsg.includes('503') || rawMsg.includes('429') || rawMsg.includes('UNAVAILABLE')) {
        await sleep(400);
      }
    }
  }

  // Fallback: query Google's API for live models on this key if static IDs returned 404
  if (all404) {
    const liveModels = await discoverAvailableFlashModels(ai);
    for (const model of liveModels) {
      if (PREFERRED_MODELS.includes(model)) continue;
      try {
        const result = await tryModel(model);
        if (result) return result;
      } catch (err) {
        console.warn(`[${caller}] Discovered model ${model} failed (${err?.status || err?.message}).`);
        lastError = err;
      }
    }
  }

  const rawLast = String(lastError?.message || '');
  if (rawLast.includes('503') || rawLast.includes('UNAVAILABLE')) {
    const busyErr = new Error('AI service is temporarily experiencing high traffic. Please wait a few seconds and click Analyze again.');
    busyErr.statusCode = 503;
    throw busyErr;
  }

  if (rawLast.includes('429') || rawLast.includes('RESOURCE_EXHAUSTED')) {
    const rateErr = new Error('AI rate limit reached. Please wait 30 seconds before trying again.');
    rateErr.statusCode = 429;
    throw rateErr;
  }

  throw new Error(`Unable to complete ${caller} request right now. Please try again.`);
};