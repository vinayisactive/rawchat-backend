import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import apiV1Router from "./routes";
import { Server } from "socket.io";
import initializeSocketServer from "./socket";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/v1", apiV1Router);

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

initializeSocketServer(io);

app.get("/", (req: Request, res: Response) => {
  res.send("Rawchat-backend is up and running.");
});

httpServer.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});