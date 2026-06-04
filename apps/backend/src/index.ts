import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import auth  from "./Routes/auth.route";
import { initwebsocket } from "./ws";
dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', auth)


export const httpserver = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
initwebsocket(httpserver);  