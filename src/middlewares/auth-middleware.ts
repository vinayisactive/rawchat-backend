import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../utilities/type";

const authMiddleware = (request: Request, response: Response, next: NextFunction) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token || token === undefined) {
      response.status(401).json({
        message: "Authorization token is missing.",
      });

      return;
    }

    jwt.verify(token, process.env.JWT_SECRET!, (error, user) => {
      if (error) {
        response.status(401).json({
          message: "Invalid JSON token.",
        });

        return;
      }

      if (user) {
        request.user = user as AuthUser;
      }
    });

    next();
  } catch (error) {
    response.status(500).json({
      message: "Authentication failed.",
    });
  }
};

export default authMiddleware;
