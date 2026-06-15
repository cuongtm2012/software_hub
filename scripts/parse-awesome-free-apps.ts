/**
 * Parse Axorax/awesome-free-apps README → scripts/data/awesome-free-apps.json
 * Run: npm run parse:awesome-free-apps
 */
import {
  type FreeSoftwareEntry,
  normalizePlatforms,
  writeJson,
} from "./lib/data-expansion.js";

const SOURCE_URL =
  "https://raw.githubusercontent.com/Axorax/awesome-free-apps/main/README.md";

function parseReadme(content: string): FreeSoftwareEntry[] {
  const entries: FreeSoftwareEntry[] = [];
  const lines = content.split("\n");

  let currentCategory = "";
  let currentSubcategory = "";
  const parentCategory = "Free Applications";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (
      line.includes("Windows Only") ||
      line.includes("macOS Only") ||
      line.includes("Mobile version")
    ) {
      continue;
    }

    if (line.startsWith("## ")) {
      const header = line.replace(/^##\s+/, "").trim();
      const skip = ["Table of Contents", "Contributing", "License", "Awesome Free Apps"];
      if (!skip.includes(header)) {
        currentCategory = header;
        currentSubcategory = "";
      }
      continue;
    }

    if (line.startsWith("### ")) {
      currentSubcategory = line.replace(/^###\s+/, "").trim();
      continue;
    }

    if (!line.startsWith("- [") || !currentCategory) continue;

    const match = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:[-–—]\s*)?(.*)$/);
    if (!match) continue;

    const name = match[1].trim();
    const url = match[2].trim();
    let description = match[3].trim();
    const platforms: string[] = [];
    let essential = false;

    const tags = description.match(/`([^`]+)`/g);
    if (tags) {
      for (const tag of tags) {
        const clean = tag.replace(/`/g, "").toLowerCase();
        if (clean.includes("windows")) platforms.push("windows");
        if (clean.includes("macos") || clean.includes("mac")) platforms.push("mac");
        if (clean.includes("linux")) platforms.push("linux");
        if (clean.includes("android")) platforms.push("android");
        if (clean.includes("ios")) platforms.push("ios");
        if (clean.includes("web")) platforms.push("web");
        if (clean.includes("recommended") || line.includes("⭐")) essential = true;
      }
      description = description.replace(/`[^`]+`/g, "").trim();
    }

    if (line.includes("⭐")) essential = true;
    description = description.replace(/^[-–—]\s*/, "").trim();
    if (!description) description = `${name} — ứng dụng miễn phí`;

    entries.push({
      name,
      description: description.slice(0, 500),
      category: parentCategory,
      subcategory: currentSubcategory || currentCategory,
      url,
      download_link: url,
      platform: normalizePlatforms(platforms.length ? platforms : ["windows"]),
      license: "Free",
      source: "awesome-free-apps",
      essential,
    });
  }

  return entries;
}

async function main() {
  console.log("Fetching Axorax/awesome-free-apps...");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const entries = parseReadme(await res.text());
  console.log(`Parsed ${entries.length} entries (${entries.filter((e) => e.essential).length} essential)`);
  writeJson("awesome-free-apps.json", { source: "awesome-free-apps", entries });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
