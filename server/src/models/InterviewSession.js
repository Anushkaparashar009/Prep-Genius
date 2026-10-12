import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    messages: [messageSchema],
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