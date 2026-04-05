import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envPath = fs.existsSync(path.join(cwd, ".env.local"))
  ? path.join(cwd, ".env.local")
  : path.join(cwd, ".env.example");

const envText = fs.readFileSync(envPath, "utf8");
const env = {};

for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) {
    continue;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim();
  env[key] = value;
}

function hasValue(key) {
  const runtimeValue = process.env[key];
  if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
    return true;
  }

  return typeof env[key] === "string" && env[key].length > 0;
}

const checks = [
  {
    key: "GITHUB_TOKEN",
    label: "GitHub API token",
    requiredFor: "higher rate limits, contribution stats, private repo support",
  },
  {
    key: "GROQ_API_KEY",
    label: "Groq API key",
    requiredFor: "AI-generated about/SEO content",
  },
  {
    key: "DATABASE_URL",
    label: "Postgres database",
    requiredFor: "persistent cache, custom URLs, GitHub OAuth",
  },
  {
    key: "GITHUB_CLIENT_ID",
    label: "GitHub OAuth client ID",
    requiredFor: "GitHub sign-in",
  },
  {
    key: "GITHUB_CLIENT_SECRET",
    label: "GitHub OAuth client secret",
    requiredFor: "GitHub sign-in",
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    label: "Public site URL",
    requiredFor: "correct metadata and deployment links",
  },
];

console.log(`Using env source: ${path.basename(envPath)}`);
console.log("");
console.log("Setup status:");

for (const check of checks) {
  const ok = hasValue(check.key);
  console.log(`${ok ? "[ok]" : "[missing]"} ${check.label} (${check.key})`);
  if (!ok) {
    console.log(`  Enables: ${check.requiredFor}`);
  }
}

console.log("");
console.log("Runtime mode:");
console.log(
  hasValue("DATABASE_URL")
    ? "- Persistent mode: database-backed cache and custom URLs enabled"
    : "- Lightweight mode: in-memory cache/custom URLs; no persistent auth state"
);
console.log(
  hasValue("GROQ_API_KEY")
    ? "- AI mode: profile summaries and SEO content generated with Groq"
    : "- Fallback mode: deterministic non-AI summaries/SEO"
);
console.log(
  hasValue("GITHUB_TOKEN")
    ? "- Authenticated GitHub mode: richer GitHub data and higher rate limits"
    : "- Public GitHub mode: core profile + repos still work, but rate limits are lower"
);
