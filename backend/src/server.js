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

// Expose Swagger UI at /docs. For the UI to work in some browsers
// with strict CSP we allow eval for this route only (development).
// Ensure CSP header allows eval for Swagger UI only (development).
app.use((req, res, next) => {
  if (req.path && req.path.startsWith('/docs')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;"
    );
  }
  next();
});

// Generate Swagger HTML and inject CSP meta allowing eval for the UI (dev only)
app.get(['/docs', '/docs/'], (req, res) => {
  let html = swaggerUi.generateHTML(swaggerSpec, { explorer: true });
  const cspMeta = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:;">';
  html = html.replace('<head>', `<head>${cspMeta}`);
  res.send(html);
});

// Serve swagger static assets (CSS/JS)
app.use('/docs', swaggerUi.serve);

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