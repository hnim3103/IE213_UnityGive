import dotenv from "dotenv";
dotenv.config();

import express from "express";
import campaignsRoute from "./routes/campaignsRouters.js";
import donationRoute from "./routes/donationsRouters.js";
import authRoute from "./routes/authRouters.js";
import usersRoute from "./routes/userRouters.js";
import commentRoute from "./routes/commentRouters.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/campaigns", campaignsRoute);
app.use("/api/donations", donationRoute);
app.use("/api/auth", authRoute);
app.use("/api/comments", commentRoute);
app.use("/api/users", usersRoute);

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/docs`);
    });
  });
}

export default app;
