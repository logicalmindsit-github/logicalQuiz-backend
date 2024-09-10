import express from "express";
import {getExamReportController} from "../controller/examReport.js";
const router = express.Router();

router.get("/", getExamReportController);
export default router;