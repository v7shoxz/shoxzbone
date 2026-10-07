import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.get("/api/v2/status", (req, res) => {
  res.json({ bot: "online", status: "running" });
});

app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`[Backend] Server running on port ${PORT}`);
});
