import { Router } from "express";
import authRouter from "./auth-router";
import groupRouter from "./group-router";

const apiV1Router = Router(); 
apiV1Router.use("/auth", authRouter)
apiV1Router.use("/chat-group", groupRouter)

export default apiV1Router; 
