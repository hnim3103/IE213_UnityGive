import express, { response } from "express";
import campaignsRoute from "./routes/campaignsRouters.js";
import organizationsRoute from "./routes/organizationsRouters.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000

const app = express();

app.use(express.json());

app.use("/api/campaigns", campaignsRoute);
app.use("/api/organizations", organizationsRoute)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
});



