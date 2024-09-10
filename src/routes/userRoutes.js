import { Router } from "express";
import { getQuestions } from "../controller/questionController";

export const questionRouter = Router();

questionRouter.get("/getQuestion", getQuestions);
