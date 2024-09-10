import express from "express";
import {
  getQuestionsController,
  createQuestion,
  answerQuestion,
  getExplanationForAQuestionController,
  getQuestionsByIds
} from "../controller/questionController.js";

const router = express.Router();

router.get("/questions", getQuestionsController);
router.get("/questionsByIds", getQuestionsByIds);
router.post("/questions", createQuestion);
router.post("/question/answer", answerQuestion);
router.get("/getExplanation", getExplanationForAQuestionController);
export default router;
