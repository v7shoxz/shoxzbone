import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { Client, GatewayIntentBits, Events } from "discord.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// Discord Bot Setup
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

bot.once(Events.ClientReady, (client) => {
  console.log(`[Discord Bot] Ready! Logged in as ${client.user.tag}`);
});

bot.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  console.log(`[Discord] Message from ${message.author.tag}: ${message.content}`);
});

bot.on(Events.Error, (error) => {
  console.error("[Discord Bot] Error:", error);
});

bot.on("warn", (info) => {
  console.warn("[Discord Bot] Warn:", info);
});

// Start Discord Bot
if (process.env.BOT_TOKEN) {
  bot.login(process.env.BOT_TOKEN).catch((err) => {
    console.error("[Discord Bot] Failed to login:", err);
  });
} else {
  console.warn("[Discord Bot] BOT_TOKEN not set in environment variables");
}

// API Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", bot: bot.isReady() ? "online" : "offline" });
});

app.get("/api/v2/status", (req, res) => {
  res.json({
    bot: bot.isReady() ? "online" : "offline",
    status: "running",
    tag: bot.user?.tag || "not logged in",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dashboard.html"));
});

app.get("/api/v2/info", (req, res) => {
  res.json({
    app: "shoxzbone",
    version: "1.0.0",
    bot_status: bot.isReady() ? "online" : "offline",
    bot_user: bot.user?.tag || null,
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Backend] Server running on port ${PORT}`);
});
