import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import GroupControllers from "../controllers/group-controllers";

const groupRouter = Router(); 

groupRouter.use(authMiddleware);
groupRouter.post("/", GroupControllers.create);
groupRouter.get("/", GroupControllers.showAll);
groupRouter.get("/:id", GroupControllers.show);
groupRouter.patch("/:id", GroupControllers.update);
groupRouter.delete("/:id", GroupControllers.delete);

export default groupRouter; 