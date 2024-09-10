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
    standard: {
      type: Number,
      index: true,
    },
    examinationId: {
      type: mongoose.Types.ObjectId,
      ref: "examQuestions",
    },
    examinationName: {
      type: String,
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
    examinationStartedDate: {
      type: Date,
    },
    tickerCount:{
      default:0,
      type:Number
    }
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("examAnswers", answerSchema);
