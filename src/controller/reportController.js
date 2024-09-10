import answerModel from "../models/answerModel.js";
import { Types } from "mongoose";

const reportQuery = (userId,standard) => [
  {
    $match: {
      userId: new Types.ObjectId(userId),
      standard:Number(standard)
    },
  },
  {
    $unwind: "$attentedQuestions",
  },
  {
    $lookup: {
      from: "questions",
      localField: "attentedQuestions",
      foreignField: "_id",
      as: "result",
    },
  },
  {
    $project: {
      questionGroupId: 1,
      topicGroupName: {
        $last: "$result.topicGroupName",
      },
      userId: 1,
      standard: 1,
      attentedQuestions: 1,
      marks: 1,
      timeSpent: 1,
      lastPractised: 1,
      isCompleted: 1,
    },
  },
];

export const getReportController = async (req, res) => {
  const { standard } = req.query;

  const userId = req.user.userId;

  try {
    if (!userId || !standard) {
      throw new Error("Either userId or standard is missing");
    }

    const getQuery = reportQuery(userId, standard);

    const question = await answerModel.aggregate(getQuery);

    return res.status(200).json({ success: true, data: question });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};