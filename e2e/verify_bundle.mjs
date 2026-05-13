import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const distAssetsDir = process.env.DIST_ASSETS_DIR || path.resolve(process.cwd(), 'dist', 'assets');
const entryJs = readdirSync(distAssetsDir).find((f) => /^index-.*\.js$/.test(f));

if (!entryJs) {
  console.error(`entry js not found in: ${distAssetsDir}`);
  process.exit(1);
}

const entryPath = path.join(distAssetsDir, entryJs);
const content = readFileSync(entryPath, 'utf8');

if (/\bxlsx\b/i.test(content) || /SheetJS/i.test(content)) {
  console.error(`xlsx detected in entry bundle: ${entryPath}`);
  process.exit(1);
}

console.log(`ok: xlsx not in entry bundle (${entryJs})`);
