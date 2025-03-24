import { Router } from "express";
import authRouter from "./auth-router";

const apiV1Router = Router(); 
apiV1Router.use("/auth", authRouter)

export default apiV1Router; 
