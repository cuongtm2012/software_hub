/**
 * Parse awesome-selfhosted-data YAML files → scripts/data/awesome-selfhosted.json
 * Run: npm run parse:awesome-selfhosted
 */
import {
  type FreeSoftwareEntry,
  normalizePlatforms,
  parseSimpleYaml,
  writeJson,
} from "./lib/data-expansion.js";

const TREE_URL =
  "https://api.github.com/repos/awesome-selfhosted/awesome-selfhosted-data/git/trees/master?recursive=1";

async function fetchYaml(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

function yamlToEntry(raw: string): FreeSoftwareEntry | null {
  const data = parseSimpleYaml(raw);
  const name = String(data.name ?? "").trim();
  const description = String(data.description ?? "").trim();
  if (!name || description.length < 8) return null;

  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const category = tags[0] || "Self-hosted";
  const platforms = Array.isArray(data.platforms) ? data.platforms.map(String) : ["web"];
  const licenses = Array.isArray(data.licenses) ? data.licenses.join(", ") : String(data.license ?? "Open Source");
  const website = String(data.website_url ?? "");
  const sourceCode = String(data.source_code_url ?? "");
  const url = website || sourceCode;
  if (!url) return null;
  const downloadLink = sourceCode || website;

  return {
    name,
    description: description.slice(0, 500),
    category: "Self-hosted",
    subcategory: category,
    url,
    download_link: downloadLink,
    documentation_link: website && website !== downloadLink ? website : undefined,
    platform: normalizePlatforms(platforms),
    license: licenses,
    source: "awesome-selfhosted",
  };
}

async function main() {
  const limit = Number(process.env.PARSE_LIMIT || "0");
  console.log("Fetching awesome-selfhosted file tree...");
  const treeRes = await fetch(TREE_URL, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!treeRes.ok) throw new Error(`Tree fetch failed: ${treeRes.status}`);
  const tree = (await treeRes.json()) as { tree: { path: string }[] };
  const files = tree.tree
    .map((t) => t.path)
    .filter((p) => p.startsWith("software/") && p.endsWith(".yml"));
  console.log(`Found ${files.length} software YAML files`);

  const entries: FreeSoftwareEntry[] = [];
  const batchSize = 40;
  const targetFiles = limit > 0 ? files.slice(0, limit) : files;

  for (let i = 0; i < targetFiles.length; i += batchSize) {
    const batch = targetFiles.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (path) => {
        const raw = await fetchYaml(
          `https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted-data/master/${path}`,
        );
        return raw ? yamlToEntry(raw) : null;
      }),
    );
    for (const entry of results) {
      if (entry) entries.push(entry);
    }
    if ((i + batchSize) % 400 === 0 || i + batchSize >= targetFiles.length) {
      console.log(`  ... ${Math.min(i + batchSize, targetFiles.length)}/${targetFiles.length}`);
    }
  }

  const unique = new Map<string, FreeSoftwareEntry>();
  for (const e of entries) unique.set(e.name.toLowerCase(), e);

  const deduped = [...unique.values()];
  console.log(`Parsed ${deduped.length} unique self-hosted apps`);
  writeJson("awesome-selfhosted.json", { source: "awesome-selfhosted", entries: deduped });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
