#!/usr/bin/env node
/**
 * Post-build fixes for Node ESM production:
 * 1. Rewrite "@shared/schema" to a relative path (package.json "imports" only supports # prefixes).
 * 2. Append ".js" to relative specifiers that tsc left extensionless.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const appRoot = existsSync(join(scriptDir, "dist", "server"))
  ? scriptDir
  : join(scriptDir, "..");
const root = join(appRoot, "dist");

function hasExtension(specifier) {
  return /\.(?:js|json|node|mjs|cjs)$/.test(specifier);
}

function fixRelativeExtensions(source) {
  return source
    .replace(/from (["'])(\.\.?\/[^"']+)(["'])/g, (match, q, path, end) => {
      if (hasExtension(path)) return match;
      return `from ${q}${path}.js${end}`;
    })
    .replace(/import\s*\(\s*(["'])(\.\.?\/[^"']+)(["'])\s*\)/g, (match, q, path, end) => {
      if (hasExtension(path)) return match;
      return `import(${q}${path}.js${end})`;
    });
}

function rewriteSharedImports(source, filePath) {
  return source.replace(/(["'])@shared\/([^"']+)\1/g, (match, q, subpath) => {
    const target = join(root, "shared", `${subpath}.js`);
    let rel = relative(dirname(filePath), target).replaceAll(sep, "/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `${q}${rel}${q}`;
  });
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const filePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
      continue;
    }
    if (!entry.name.endsWith(".js")) continue;

    const original = readFileSync(filePath, "utf8");
    let updated = rewriteSharedImports(original, filePath);
    updated = fixRelativeExtensions(updated);
    if (updated !== original) writeFileSync(filePath, updated);
  }
}

for (const sub of ["server", "services"]) {
  const dir = join(root, sub);
  try {
    walk(dir);
  } catch {
    /* services/ may be absent */
  }
}
