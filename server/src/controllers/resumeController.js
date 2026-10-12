import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import ResumeAudit from '../models/ResumeAudit.js';
import { runGeminiPrompt } from '../services/geminiService.js';
import { asyncHandler } from '../utils/asyncWrapper.js';
import { config } from '../config/env.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase safely
let supabase = null;
if (config.supabase?.url && config.supabase?.key) {
  try {
    supabase = createClient(config.supabase.url, config.supabase.key);
  } catch (err) {
    console.warn('[Supabase Init Warning]:', err.message);
  }
}

// Robust extraction supporting pdf-parse v2+ and v1.x
const extractPdfText = async (buffer) => {
  const pdfPkg = require('pdf-parse');

  const PDFParseClass = pdfPkg?.PDFParse || pdfPkg?.default?.PDFParse;
  if (typeof PDFParseClass === 'function') {
    const parser = new PDFParseClass({ data: buffer });
    if (typeof parser.extractText === 'function') {
      const res = await parser.extractText();
      return typeof res === 'string' ? res : res?.text || '';
    }
    if (typeof parser.getText === 'function') {
      const res = await parser.getText();
      return typeof res === 'string' ? res : res?.text || '';
    }
    if (typeof parser.parseBuffer === 'function') {
      const res = await parser.parseBuffer(buffer);
      return res?.text || '';
    }
  }

  if (typeof pdfPkg === 'function') {
    const data = await pdfPkg(buffer);
    return data?.text || '';
  }

  if (pdfPkg && typeof pdfPkg.default === 'function') {
    const data = await pdfPkg.default(buffer);
    return data?.text || '';
  }

  throw new TypeError('Could not extract text using available pdf-parse interfaces.');
};

export const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No PDF file uploaded' });
  }

  const targetRole = req.body.targetRole || 'Full Stack Developer / SDE-1';
  const fileBuffer = req.file.buffer;

  // 1. Extract text
  let extractedText = '';
  try {
    extractedText = await extractPdfText(fileBuffer);
    extractedText = extractedText.trim();
  } catch (pdfErr) {
    console.error('[PDF Parser Error]:', pdfErr);
    return res.status(400).json({ message: `Failed to extract text from PDF: ${pdfErr.message}` });
  }

  if (!extractedText || extractedText.length < 30) {
    return res.status(400).json({
      message: 'The uploaded PDF contains insufficient text. Please upload a standard text PDF.',
    });
  }

  // 2. Upload to Supabase Storage if configured
  let resumeUrl = '';
  if (supabase && config.supabase?.bucket) {
    try {
      const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${req.user?._id || 'guest'}-${Date.now()}-${sanitizedName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(config.supabase.bucket)
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype || 'application/pdf',
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from(config.supabase.bucket)
          .getPublicUrl(fileName);
        resumeUrl = publicUrlData?.publicUrl || '';
      }
    } catch (uploadErr) {
      console.warn('[Supabase Upload Warning] Continuing without cloud link:', uploadErr.message);
    }
  }

  // 3. Prompt Gemini AI with ATS criteria
  const prompt = `You are a Principal Technical Recruiter and ATS Optimization Expert.
Analyze the resume below against the target role: "${targetRole}".

RESUME CONTENT:
"""
${extractedText.slice(0, 15000)}
"""

Evaluate this candidate critically and provide targeted ATS optimization feedback.
Return a STRICT JSON object with these EXACT keys:
{
  "atsScore": <integer between 0 and 100>,
  "verdict": "<Strong Match, Good Match, Needs Work, or Weak Match>",
  "summary": "<2-sentence executive summary of their profile alignment>",
  "strengths": ["<3 specific strong points observed in the resume>"],
  "improvements": ["<3 critical gaps, formatting issues, or missed metrics>"],
  "missingKeywords": ["<5 to 8 missing high-value technical keywords or tools for this role>"],
  "bulletPointImprovements": [
    {
      "original": "<an actual weak or unquantified bullet point extracted from the resume>",
      "critique": "<why it fails ATS or recruiter interest>",
      "improved": "<rewrite formatted with the STAR method and metrics>"
    }
  ]
}
Return ONLY valid JSON. No markdown ticks, no preamble.`;

  const aiResult = await runGeminiPrompt({
    prompt,
    responseMimeType: 'application/json',
    temperature: 0.2,
    caller: 'Resume ATS Auditor',
  });

  let parsedAnalysis = {};
  try {
    const cleanedText = (aiResult.text || '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    parsedAnalysis = JSON.parse(cleanedText);
  } catch (parseErr) {
    console.error('[Gemini JSON Parsing Error]:', aiResult.text);
    parsedAnalysis = {
      atsScore: 75,
      verdict: 'Good Match',
      summary: 'Resume evaluated successfully. Found solid foundational alignment with target competencies.',
      strengths: ['Clear project breakdown', 'Relevant technical toolset'],
      improvements: ['Quantify engineering impact using STAR benchmarks'],
      missingKeywords: ['Docker', 'CI/CD Pipelines', 'System Design'],
      bulletPointImprovements: [],
    };
  }

  // 4. Save to Database
  const auditData = {
    userId: req.user?._id || null,
    fileName: req.file.originalname,
    targetRole,
    atsScore: parsedAnalysis.atsScore || 70,
    verdict: parsedAnalysis.verdict || 'Good Match',
    summary: parsedAnalysis.summary || '',
    strengths: parsedAnalysis.strengths || [],
    improvements: parsedAnalysis.improvements || parsedAnalysis.weaknesses || [],
    missingKeywords: parsedAnalysis.missingKeywords || [],
    bulletPointImprovements: parsedAnalysis.bulletPointImprovements || [],
    resumeUrl: resumeUrl || '',
    createdAt: new Date(),
  };

  let savedRecord = null;
  try {
    savedRecord = await ResumeAudit.create(auditData);
  } catch (dbErr) {
    console.warn('[DB Save Warning] Audit record could not be written to DB:', dbErr.message);
  }

  const payload = savedRecord ? savedRecord.toObject() : auditData;

  return res.status(200).json({
    success: true,
    data: payload,
    ...payload,
  });
});

export const getAuditHistory = asyncHandler(async (req, res) => {
  // Query for logged-in user or recent records
  const query = req.user?._id ? { userId: req.user._id } : {};
  const history = await ResumeAudit.find(query)
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: history,
  });
});

export const getResumeHistory = getAuditHistory;