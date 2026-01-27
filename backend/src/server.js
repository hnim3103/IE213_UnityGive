import express, { response } from "express";
import campaignsRoute from "./routes/campaignsRouters.js"
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000

const app = express();

connectDB();

app.use("/api/campaigns", campaignsRoute);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

