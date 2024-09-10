import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connect from "./src/db/db.js";
import { verifyToken } from "./src/middleware/authMiddleware.js";
import authRoutes from "./src/routes/authRoutes.js";
import questionRoute from "./src/routes/questionRouter.js";
import reportRoute from "./src/routes/reportRouter.js";
import examQuestionRouter from './src/routes/examQuestionRouter.js'
import examReportRouter from './src/routes/examreportroute.js'
dotenv.config();

const server = express();

server.use(express.json());

server.use(cors());
server.use("/ping", (_, res) => res.send("pong"));
server.use(verifyToken);
server.use("/", authRoutes);
server.use("/", questionRoute);
server.use("/report", reportRoute);
server.use("/exam", examQuestionRouter);
server.use("/examreport",examReportRouter);

const PORT = process.env.PORT || 5050;

server.listen(PORT, async () => {
  connect();
  console.log(`Server Running On: http://localhost:${PORT}`);
});