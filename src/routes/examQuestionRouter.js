import express from "express";
import { getQuestionsController, answerQuestion, createQuestion ,getAnswersController} from  "../controller/examQuestionController.js"

const router = express.Router();

router.get('/getExamQuestions', getQuestionsController);
router.get('/getExamAnswers', getAnswersController)
router.post('/examAnswer', answerQuestion);

router.post('/examQuestions', createQuestion);

export default router;
