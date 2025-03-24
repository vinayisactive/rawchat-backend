import express from "express";
import cors from "cors";
import apiV1Router from "./routes";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false})); 

app.use("/api/v1", apiV1Router); 

app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
}); 