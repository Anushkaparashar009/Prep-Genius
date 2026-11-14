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
  { _id: false, timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: 'New Prep Session',
      trim: true,
    },
    topic: {
      type: String,
      default: 'General Technical',
      trim: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatSessionSchema.index({ userId: 1, problemId: 1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;