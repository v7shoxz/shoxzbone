import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
const PORT = process.env.PORT || 5000;
const BOT_TOKEN = process.env.BOT_TOKEN;

// Discord Bot
const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

bot.on("ready", () => {
  console.log(`[Discord Bot] Logged in as ${bot.user?.tag}`);
  if (bot.user) {
    bot.user.setActivity("your server", { type: "WATCHING" });
  }
});

bot.on("error", (err) => {
  console.error("[Discord Bot] Error:", err);
});

// Start bot
if (BOT_TOKEN) {
  bot.login(BOT_TOKEN).catch((err) => {
    console.error("[Discord Bot] Failed to login:", err.message);
  });
} else {
  console.warn("[Discord Bot] BOT_TOKEN not found in environment variables");
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    bot: bot.isReady() ? "online" : "connecting"
  });
});

// API routes
app.get("/api/v2/status", (req, res) => {
  res.json({ 
    bot: bot.isReady() ? "online" : "offline", 
    status: "running",
    botUser: bot.user?.tag || "not logged in"
  });
});

app.get("/", (req, res) => {
  res.send("Backend API is running. Bot: " + (bot.isReady() ? "online" : "offline"));
});

// Start server
app.listen(PORT, () => {
  console.log(`[Backend] Server running on port ${PORT}`);
});
