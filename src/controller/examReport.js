import ExamAnswer from "../models/examAnswerModel.js";
import { Types } from "mongoose";

const reportQuery = (userId, standard) => [
  {
    $match: {
      userId: new Types.ObjectId(userId),
      standard: Number(standard),
    },
  },
  {
    $unwind: "$attentedQuestions",
  },
  {
    $lookup: {
      from: "examQuestions", 
      localField: "attentedQuestions",
      foreignField: "_id",
      as: "result",
    },
  },
  {
    $project: {
      userId: 1,
      standard: 1,
      examinationName: 1,
      attentedQuestions: 1,
      marks: 1,
      isCompleted: 1,
      examinationStartedDate: 1,
      tickerCount: 1,
      examinationId: 1,
      total: 1,
      totalQuestions: 1,
      examinationName: 1,
    },
  },
];

export const getExamReportController = async (req, res) => {
  const { standard } = req.query;
  const userId = req.user.userId;

  try {
    if (!userId || !standard) {
      throw new Error("Either userId or standard is missing");
    }

    const aggregationPipeline = reportQuery(userId, standard);

    const report = await ExamAnswer.aggregate(aggregationPipeline);

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};