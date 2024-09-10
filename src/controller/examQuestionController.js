import ExamQuestion from "../models/examQuestionModel.js";
import ExamAnswer from "../models/examAnswerModel.js";
import { answerLogic } from "./questionController.js";
import QuestionModel from "../models/questionModel.js";

const getNewAnswerModel = (userId, standard, examinationDoc) => {
  return new ExamAnswer({
    userId,
    standard,
    examinationId:examinationDoc.examinationId,
    examinationName:examinationDoc.examinationName,
    attentedQuestions: [],
    answers: [],
    marks: 0,
    total: examinationDoc.total,
    totalQuestions: examinationDoc.totalQuestions,
    isCompleted: false,
    examinationStartedDate: new Date(),
    tickerCount:0
  });
};

export const getQuestions = async (userId, standard, examinationDoc) => {
  try {
    const examinationName=examinationDoc?.examinationName;

    let answerCollectionDoc= await ExamAnswer.findOne({
      userId,
      standard,
      examinationName,
    });

    if (!answerCollectionDoc) {
      answerCollectionDoc = getNewAnswerModel(userId, standard, examinationDoc);
      await answerCollectionDoc.save();
    }

    const tickerCount=Number(answerCollectionDoc.tickerCount)+1

    const questionId=examinationDoc?.questions[tickerCount]

    const newQuestion =  await QuestionModel.findById(questionId)
      .select("questions question questionType answerType standard")
      .lean();

    if (!newQuestion) {
      return { isCompleted: true, question: {} };
    }

    return {
      isCompleted: false,
      question: {
        ...newQuestion,
        docId:answerCollectionDoc?._id,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getQuestionsController = async (req, res) => {
  try {
    const { std, examinationName } = req.query;
    const userId = req.user.userId;
    const standard = Number(std);

    if (!standard || !examinationName) {
      throw new Error("Standard or examination name is missing");
    }

    const examinationDoc= await ExamQuestion.findOne({
      examinationName:examinationName
    })


    if (!examinationDoc) {
      throw new Error("Exam not found");
    }

    const response = await getQuestions(userId, standard,examinationDoc);

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Error in getQuestionsController:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getAnswersController = async (req, res) => {
  try {
    const { questionId } = req.query;

    if (!questionId) {
      throw new Error("Question ID is missing");
    }

    const question = await ExamQuestion.findById(questionId)
      .select("answerType correctAnswer")
      .lean();

    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const { answerType, correctAnswer } = question;

    return res.status(200).json({
      success: true,
      data: { answerType, correctAnswer },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { questionId, docId, answer, standard, examinationName } = req.body;

    if (!questionId || !docId || !answer || !standard || !examinationName) {
      throw new Error("Required parameters missing");
    }

    const examinationDoc= await ExamQuestion.findOne({
      examinationName:examinationName
    })
    if (!examinationDoc) {
      throw new Error("Exam not found");
    }

    const question = await QuestionModel.findById(questionId)
      .select("answer")
      .lean();

    if (!question) {
      throw new Error("Question not found");
    }

    const answerDoc = await ExamAnswer.findById(docId);

    if (!answerDoc) {
      throw new Error("Answer document not found");
    }

    let isCorrect = false;
    let isCompleted = false;

    if (answerLogic(question.answerType, question.correctAnswer, answer)) {
      isCorrect = true;
    }

    const newTickerCount = answerDoc.tickerCount+1;
    const oldAttendedQuestions = answerDoc.attentedQuestions || [];
    const newAttendedQuestion = [...oldAttendedQuestions, question._id];
    answerDoc.attentedQuestions = newAttendedQuestion;

    if (isCorrect) {
      answerDoc.marks = Number(answerDoc.marks + examinationDoc.baseMarks);

      if (newTickerCount === answerDoc.totalQuestions) {
        answerDoc.isCompleted = true;
      }

      await answerDoc.save();
    }

    if (newTickerCount === answerDoc.totalQuestions) {
      return res.status(200).json({
        success: true,
        data: { isCorrect, isCompleted, question: {} },
      });
    }


    answerDoc.tickerCount=newTickerCount
    await answerDoc.save()


    const newQuestion = await getQuestions(
      answerDoc.userId,
      standard,
      examinationDoc
    );

    return res.status(200).json({
      success: true,
      data: { isCorrect, isCompleted, question: newQuestion?.question },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { question, standard, examinationName } = req.body;

    const newQuestion = new ExamQuestion({
      question,
      standard,
      examinationName,
    });

    await newQuestion.save();

    return res.status(201).json({ success: true, data: newQuestion });
  } catch (error) {
    console.error("Error creating question:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


 