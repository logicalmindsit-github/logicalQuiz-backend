import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const { ACCESS_TOKEN_SECRET} = process.env;

const verifyToken = async (req, res, next) => {
  try {
    const PATH = req.path;

    if (PATH === "/login" || PATH === "/signup") {
      next();
      return;
    }

    const authorization = req.headers["authorization"];

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header not found" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token not found" });
    }
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token has expired" });
    }
    return res.status(403).json({ message: "Token verification failed" });
  }
};
 

export { verifyToken };
