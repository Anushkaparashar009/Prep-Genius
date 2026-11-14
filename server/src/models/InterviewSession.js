import mongoose from 'mongoose';

const transcriptEntrySchema = new mongoose.Schema(
  {
    speaker: {
      type: String,
      enum: ['interviewer', 'candidate', 'assistant', 'user'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: 'Full Stack Engineer (SDE-1)',
    },
    roleTitle: {
      type: String,
      required: true,
      default: 'Full Stack Engineer (SDE-1)',
    },
    difficulty: {
      type: String,
      enum: ['Entry', 'Intermediate', 'Advanced'],
      default: 'Entry',
    },
    interviewType: {
      type: String,
      default: 'Entry',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    transcript: [transcriptEntrySchema],
    feedback: {
      technicalScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      overallScore: { type: Number, default: 0 },
      verdict: { type: String, default: '' },
      summary: { type: String, default: '' },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
    },
  },
  { timestamps: true }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;