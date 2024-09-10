import Question from "../models/questionModel.js";
import AnswerModel from "../models/answerModel.js";
import { deepEqualObjectAnswer } from "../utils/utils.js";
import { Types } from "mongoose";
import { ALL_QUESTION_GROUP_IDS } from '../controller/constants.js';

const TOTAL_ALL_QUESTIONS_MARKS = 100;
const TOTAL_ALL_QUESTIONS = 30;
const MARK = 3;



const getNewAnswerModel = (userId, standard, questionGroupId) => {
  if (!ALL_QUESTION_GROUP_IDS.includes(questionGroupId)) {
    return null;
  }

  return new AnswerModel({
    userId: Types.ObjectId.createFromHexString(userId),
    standard,
    questionGroupId,
    attentedQuestions: [],
    answers: [],
    marks: 0,
    total: TOTAL_ALL_QUESTIONS_MARKS,
    totalQuestions: TOTAL_ALL_QUESTIONS,
    isCompleted: false,
  });
};

export const getQuestions = async (userId, standard, questionGroupId) => {
  try {
    const isAnswerCollectionExist = await AnswerModel.findOne({
      userId,
      questionGroupId: questionGroupId,
      standard: standard,
    });

    let newAnswerModel = undefined;
    if (!isAnswerCollectionExist) {
      newAnswerModel = getNewAnswerModel(userId, standard, questionGroupId);
      if (newAnswerModel) {
        await newAnswerModel.save();
      }
    }

    const userQuestionGroupId = isAnswerCollectionExist?.attentedQuestions || [];

    // get questions from question collection
    const newQuestion = await Question.findOne({
      _id: {
        $nin: userQuestionGroupId,
      },
      standard: standard,
      questionGroupId: questionGroupId,
      disabled: false,
    })
      .select(["patterns", "question", "questionType", "answerType", "audio", "topic", "questionGroupId", "standard"])
      .lean();

    if (!newQuestion) {
      return { isCompleted: true, question: {} };
    }

    return { isCompleted: false, question: { ...newQuestion, docId: isAnswerCollectionExist._id } };
  } catch (error) {
    throw new Error(error);
  }
};

export const getQuestionsController = async (req, res) => {
  try {
    const { std, id } = req.query;
    const userId = req?.user?.userId;

    const standard = Number(std);
    const questionGroupId = id;

    if (!standard || !questionGroupId) {
      throw new Error("Either standard or question group id is missing");
    }
    const response = await getQuestions(userId, standard, questionGroupId);
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { questionId, docId, answer, standard, questionGroupId } = req.body;

    if (!questionId || !docId || !answer || !standard || !questionGroupId) {
      throw new Error("questionId or docId or standard or questionGroupId or answer not found");
    }

    const userId = req?.user?.userId;

    const question = await Question.findById(questionId).select(["answer", "answerType"]).lean();

    if (!question) {
      throw new Error("Question not found");
    }

    const answerDoc = await AnswerModel.findById(docId);

    if (!answerDoc) {
      throw new Error("Answer document not found");
    }

    let isCorrect = false;
    let isCompleted = false;

    if (answerLogic(question.answerType, question.answer, answer)) {
      isCorrect = true;
    }

    const newQuestionCount = Number(answerDoc.totalQuestions - 1);
    const oldAttentedQuestions = answerDoc?.attentedQuestions || [];
    const newAttendtedQuestion = [...oldAttentedQuestions, question._id];

    if (isCorrect) {
      answerDoc.totalQuestions = newQuestionCount;
      answerDoc.marks = Number(answerDoc.marks + MARK);
      if (newQuestionCount === 0) {
        answerDoc.isCompleted = true;
      }
      await answerDoc.save();
    }

    // Last Practiced time
    answerDoc.lastPractised = new Date();
    answerDoc.attentedQuestions = newAttendtedQuestion;
    await answerDoc.save();

    // Check if completed
    if (newQuestionCount <= 0) {
      return res.status(200).json({ success: true, data: { isCorrect, isCompleted, question: {} } });
    }

    const newQuestion = await getQuestions(userId, standard, questionGroupId);

    return res.status(200).json({ success: true, data: { isCorrect, isCompleted, question: newQuestion?.question } });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    // Your code to create a new question
  } catch (error) {
    console.error("Error creating question:", error);

    return res.status(500).json({ success: false, error: error.message });
  }
};

export const answerLogic = (type, answer, userAnswer) => {
  // TO check if the answer type is match with the answer

  if (type === "string" || type === "number") {
    return answer == userAnswer;
  } else if (type === "array") {
    const parsedArray = answer?.sort((a, b) => a.localeCompare(b));
    const parsedUserArray = userAnswer?.sort((a, b) => a.localeCompare(b));
    return JSON.stringify(parsedArray) == JSON.stringify(parsedUserArray);
  } else if (type === "object") {
    return deepEqualObjectAnswer(answer, userAnswer);
  } else {
    return false;
  }
};

export const getExplanationForAQuestionController = async (req, res) => {
  try {
    const { questionId } = req.query;

    if (!questionId) {
      throw new Error("Question Id not found");
    }

    const explanation = await Question.findById(questionId).select(["explanation", "explanationType"]).lean();

    return res.status(200).json({ success: true, data: explanation });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getQuestionsByIds = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id || !Array.isArray(id)) {
      throw new Error("Invalid question IDs provided.");
    }

    const questions = await Question.find({ _id: { $in: ids } });

    if (!questions || questions.length === 0) {
      throw new Error("No questions found for the provided IDs.");
    }

    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};