const { spawn } = require("child_process");
const path = require("path");

// Start backend directly
const backend = spawn("node", ["node_modules/.bin/tsx", "Source/index.ts"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: false,
  env: { ...process.env },
});

backend.on("error", (err) => console.error("[backend] error:", err));
backend.on("exit", (code) => console.log("[backend] exited with code", code));

console.log("[App] Starting backend...");
