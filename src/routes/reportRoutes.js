import express from "express";
import {getReportController  } from "../controller/reportController.js";

const router = express.Router();

router.get("/getReport", getReportController);

export default router;
