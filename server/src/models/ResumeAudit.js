import mongoose from 'mongoose';

const resumeAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      default: 'Resume.pdf',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      required: true,
    },
    atsScore: {
      type: Number,
      required: true,
    },
    verdict: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    weaknesses: [{ type: String }],
    missingKeywords: [{ type: String }],
    bulletPointImprovements: [
      {
        original: String,
        critique: String,
        improved: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('ResumeAudit', resumeAuditSchema);