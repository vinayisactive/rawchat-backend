import { Router } from "express";
import AuthController from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/login", (req, res) => {
  AuthController.login(req, res);
});

export default authRouter;