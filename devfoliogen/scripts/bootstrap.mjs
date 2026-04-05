import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envExamplePath = path.join(cwd, ".env.example");
const envLocalPath = path.join(cwd, ".env.local");

if (!fs.existsSync(envExamplePath)) {
  console.error("Missing .env.example");
  process.exit(1);
}

if (fs.existsSync(envLocalPath)) {
  console.log(".env.local already exists");
  console.log("Next step: run `npm run check:setup`");
  process.exit(0);
}

fs.copyFileSync(envExamplePath, envLocalPath);

console.log("Created .env.local from .env.example");
console.log("Recommended next steps:");
console.log("1. Fill in GITHUB_TOKEN for higher GitHub rate limits");
console.log("2. Fill in GROQ_API_KEY if you want AI-generated summaries");
console.log("3. Fill in DATABASE_URL if you want persistent cache, auth, and custom URLs");
console.log("4. Run `npm run check:setup`");
