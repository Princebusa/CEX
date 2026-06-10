import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import auth from "./Routes/auth.route";
import order from "./Routes/order.route";
import market from "./Routes/market.route";
import positions from "./Routes/positions.route";
import portfolio from "./Routes/portfolio.route";
import history from "./Routes/history.route";
import { initwebsocket } from "./ws";
dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/", auth);
app.use("/", order);
app.use("/", market);
app.use("/", positions);
app.use("/", portfolio);
app.use("/", history);


export const httpserver = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
initwebsocket(httpserver);  