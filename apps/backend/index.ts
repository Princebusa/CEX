import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import auth  from "./Routes/auth.route";
dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', auth)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});