import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import ResumeAudit from '../models/ResumeAudit.js';
import { uploadResumeToSupabase } from '../utils/supabaseStorage.js';

dotenv.config();

const VERIFIED_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
];

const safeJsonParse = (rawText) => {
  try {
    return JSON.parse(rawText);
  } catch {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runResumeAnalysisAI = async (prompt) => {
  const apiKey = (process.env.RESUME_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in server/.env');
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;

  for (const model of VERIFIED_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        console.log(`[Resume Analyzer] Evaluated successfully with: ${model}`);
        return response.text;
      }
    } catch (err) {
      console.warn(`[Resume Analyzer] Attempt on ${model} failed (${err?.status || err?.message}). Switching to fallback...`);
      lastError = err;
      await sleep(1000);
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed.');
};

export const analyzeResume = async (req, res) => {
  let parser = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF resume file to upload.',
      });
    }

    const targetRole = req.body.targetRole?.trim() || 'Full Stack Developer / SDE-1';

    // 1. Text extraction using PDFParse instance
    let resumeText = '';
    try {
      parser = new PDFParse({ data: req.file.buffer });
      const pdfData = await parser.getText();
      resumeText = pdfData?.text ? pdfData.text.replace(/\s+/g, ' ').trim() : '';
    } catch (pdfErr) {
      console.error('PDF Extraction Error:', pdfErr);
      return res.status(400).json({
        success: false,
        message: 'Could not parse PDF. Ensure the file is not password-protected.',
      });
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch (_) {}
      }
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'No readable text found. Please upload a standard text PDF resume.',
      });
    }

    const trimmedResumeText = resumeText.slice(0, 3000);

    const prompt = `
You are an expert ATS auditor. Critique this resume concisely for role: "${targetRole}".

Resume content:
"""
${trimmedResumeText}
"""

Return ONLY a valid JSON object matching this schema:
{
  "atsScore": 85,
  "verdict": "Ready",
  "summary": "Direct 2-sentence summary of candidate fit.",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "missingKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "bulletPointImprovements": [
    {
      "original": "Weak bullet line from resume",
      "critique": "Brief critique",
      "improved": "Action-oriented STAR rewrite with metrics"
    }
  ]
}
`;

    // 2. Parallel upload to Supabase & AI evaluation
    const [uploadResult, aiResult] = await Promise.allSettled([
      uploadResumeToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype),
      runResumeAnalysisAI(prompt),
    ]);

    const uploadedPdfUrl = uploadResult.status === 'fulfilled' ? uploadResult.value : '';
    if (uploadResult.status === 'rejected') {
      console.warn('Storage upload bypassed:', uploadResult.reason?.message);
    }

    if (aiResult.status === 'rejected') {
      throw aiResult.reason;
    }

    const parsedAnalysis = safeJsonParse(aiResult.value);

    const sanitizedData = {
      atsScore: typeof parsedAnalysis.atsScore === 'number' ? parsedAnalysis.atsScore : 75,
      verdict: parsedAnalysis.verdict || 'Needs Polish',
      summary: parsedAnalysis.summary || 'Resume evaluated successfully.',
      strengths: Array.isArray(parsedAnalysis.strengths) ? parsedAnalysis.strengths.slice(0, 4) : [],
      weaknesses: Array.isArray(parsedAnalysis.weaknesses) ? parsedAnalysis.weaknesses.slice(0, 4) : [],
      missingKeywords: Array.isArray(parsedAnalysis.missingKeywords) ? parsedAnalysis.missingKeywords.slice(0, 6) : [],
      bulletPointImprovements: Array.isArray(parsedAnalysis.bulletPointImprovements)
        ? parsedAnalysis.bulletPointImprovements.slice(0, 2)
        : [],
    };

    // 3. Save to MongoDB
    let savedAuditId = null;
    if (req.user && req.user._id) {
      const auditRecord = await ResumeAudit.create({
        userId: req.user._id,
        fileName: req.file.originalname || 'Resume.pdf',
        resumeUrl: uploadedPdfUrl,
        targetRole,
        ...sanitizedData,
      });
      savedAuditId = auditRecord._id;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...sanitizedData,
        resumeUrl: uploadedPdfUrl,
        auditId: savedAuditId,
      },
    });
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete analysis. Please try again.',
    });
  }
};

export const getAuditHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const history = await ResumeAudit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('fileName resumeUrl targetRole atsScore verdict createdAt');

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Fetch Audit History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch history.',
    });
  }
};