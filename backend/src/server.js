import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import campaignsRoute from "./routes/campaignsRouters.js";
import organizationsRoute from "./routes/organizationsRouters.js";
import authRoute from "./routes/authRouters.js";
import favouritesRoute from "./routes/favouritesRouters.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/campaigns", campaignsRoute);
app.use("/api/organizations", organizationsRoute);
app.use("/api/auth", authRoute);
app.use("/api/favourites", favouritesRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/docs`);
  });
});