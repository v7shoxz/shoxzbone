const { spawn } = require("child_process");
const path = require("path");

// Start Next.js on port 3000
const next = spawn("node", ["node_modules/.bin/next", "start", "--port", "3000"], {
  cwd: path.join(__dirname, "../frontend"),
  stdio: "inherit",
  shell: false,
});

next.on("error", (err) => console.error("[next] error:", err));

// Wait 4s then start backend
setTimeout(() => {
  const backend = spawn("node", ["node_modules/.bin/tsx", "Source/index.ts"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    shell: false,
    env: { ...process.env },
  });
  backend.on("error", (err) => console.error("[backend] error:", err));
}, 4000);
