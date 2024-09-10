import mongoose, { Schema } from "mongoose";

const answerStoreSchema = new mongoose.Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
    },
    isCorrect: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const answerSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    questionGroupId: {
      type: String,
      index: true,
    },
    standard: {
      type: Number,
      index: true,
    },
    attentedQuestions: {
      type: [Schema.Types.ObjectId],
    },
    answers: [answerStoreSchema],
    total: {
      type: Number,
    },
    marks: {
      type: Number,
    },
    totalQuestions: {
      type: Number,
    },
    isCompleted: {
      type: Boolean,
    },
    timeSpent: {
      type: Number,
    },
    lastPractised: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("answer", answerSchema);
