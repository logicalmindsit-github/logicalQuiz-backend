import mongoose, { Schema } from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    patternName: {
      type: String,
      required: true,
    },
    question: {
      type: Schema.Types.Mixed,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
    answerType: {
      type: String,
      required: true,
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    explanationType:{
      type: String,
      required: true,
    },
    explanation: {
      type: Schema.Types.Mixed,
      required: true,
    },
    standard: {
      type: Number,
      required: true,
      index: true,
    },
    classesGroupName: {
      type: String,
      index: true,
    },
    topicGroupName: {
      type: String,
      index: true,
    },
    topic: {
      type: String,
      index: true,
    },
    questionGroupId: {
      type: String,
      index: true,
    },
  },
  {
    Timestamp: true,
  }
);

export default mongoose.model("question", questionSchema);