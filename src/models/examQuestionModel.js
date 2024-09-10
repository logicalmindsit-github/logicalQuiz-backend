import mongoose from "mongoose";
const examQuestionSchema = new mongoose.Schema(
  {
    questions: [mongoose.Types.ObjectId],
    
    standard: {
      type: Number,
      required: true,
      index: true,
    },
    examinationName: {
      index: true,
      type: String,
    },
    total: {
      type: Number,
    },
    baseMarks: {
      type: Number,
    },
    totalQuestions: {
      type: Number,
    },
    isCompleted: {
      type: Boolean,
    },
    examinationStartDate: {
      type: Date,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  {
    Timestamp: true,
  }
);

export default mongoose.model("examQuestions", examQuestionSchema);
