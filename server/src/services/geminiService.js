import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

const VERIFIED_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a Gemini prompt with automatic model failover and retries.
 * 
 * @param {Object} options
 * @param {string} options.prompt - Prompt text to evaluate
 * @param {string} [options.responseMimeType='text/plain'] - Target output format ('application/json' or 'text/plain')
 * @param {number} [options.temperature=0.2] - Generation sampling temperature
 * @param {string} [options.caller='AI Service'] - Identifier for debug logging
 * @returns {Promise<{ text: string, model: string }>}
 */
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

  for (const model of VERIFIED_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType,
          temperature,
        },
      });

      if (response && response.text) {
        console.log(`[${caller}] Successfully evaluated via ${model}`);
        return { text: response.text, model };
      }
    } catch (err) {
      console.warn(`[${caller}] Attempt on ${model} failed (${err?.status || err?.message}). Switching to fallback...`);
      lastError = err;
      await sleep(1000);
    }
  }

  throw lastError || new Error(`All Gemini model endpoints failed for ${caller}.`);
};