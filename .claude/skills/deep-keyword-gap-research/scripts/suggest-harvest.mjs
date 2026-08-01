#!/usr/bin/env node
// suggest-harvest.mjs — Google-Autocomplete "Alphabet-Soup" (Phase 1, kostenlose Seed-Quelle).
// Freier Endpoint (verifiziert): https://www.google.com/complete/search?client=firefox&q=…&gl=de&hl=de
// → JSON [query, [suggestions…]]; Suggestions in Array-Index [1]; kein Key/Login.
// Kein offizielles DSGVO-Interstitial am Suggest-Endpoint (server-side, kein Cookie-Gate);
// trotzdem Format-Check: liefert es HTML statt JSON → als Soft-Block behandeln.
//
// CLI:
//   node suggest-harvest.mjs --seeds "balkonkraftwerk,photovoltaik reinigung" --geo DE --out tmp/suggest.json
//   node suggest-harvest.mjs --scope seo/keyword-gap/<slug>/00_scope.json --out 01_suggest.json
// Flags: --depth 1|2 (default 1) · --max-per-seed N (default 60) · --modifiers (auch komm. Modifier anhängen)

import { readFileSync, writeFileSync } from "node:fs";
import { chNormalize, dedupeKeywords } from "./lib/normalize-de.mjs";
import { cacheKey, cacheGet, cacheSet, TTL } from "./lib/cache.mjs";
import { sleep, withBackoff } from "./lib/rate-limit.mjs";
import { loadConfig, modifiersPath } from "./lib/config.mjs";

const CFG = loadConfig();
const MODIFIERS = JSON.parse(readFileSync(modifiersPath(), "utf8").replace(/^﻿/, ""));

function arg(name, def = null) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const GEO_MAP = CFG.geo;

async function suggest(query, geo) {
  const { gl, hl } = GEO_MAP[geo] || GEO_MAP[CFG.defaultGeo];
  const key = cacheKey("suggest", query, gl, hl);
  const hit = cacheGet(key);
  if (hit !== null) return { terms: hit, fromCache: true };
  const url = `https://www.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(query)}`;
  const terms = await withBackoff(
    async () => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; kw-gap-research)" },
      });
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        const e = new Error("non-JSON (Soft-Block/Consent)");
        e.softBlock = true;
        throw e;
      }
      const arr = JSON.parse(text);
      return Array.isArray(arr?.[1]) ? arr[1] : [];
    },
    { maxRetries: 1, baseMs: 60000, label: "suggest:" + query },
  ).catch((e) => {
    process.stderr.write(`[suggest] ${query}: ${e.message}\n`);
    return null; // Block → null; Aufrufer zaehlt als Datenlücke, bricht NICHT ab
  });
  if (terms === null) return { terms: [], blocked: true };
  cacheSet(key, terms, TTL.SUGGEST);
  return { terms, fromCache: false };
}

async function main() {
  let seeds = [];
  let geo = arg("geo", "DE");
  const scopePath = arg("scope");
  if (scopePath) {
    const scope = JSON.parse(readFileSync(scopePath, "utf8"));
    seeds = scope.seeds || [];
    geo = (scope.geo && scope.geo[0]) || geo;
  }
  const seedArg = arg("seeds");
  if (typeof seedArg === "string")
    seeds = seedArg
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (!seeds.length) {
    process.stderr.write("Keine Seeds (--seeds oder --scope mit seeds[]).\n");
    process.exit(1);
  }
  if (geo === "CH") seeds = seeds.map(chNormalize);

  const depth = Number(arg("depth", 1));
  const maxPerSeed = Number(arg("max-per-seed", 60));
  const useModifiers = arg("modifiers") === true;
  const alphabet = " abcdefghijklmnopqrstuvwxyz".split("");
  const prefixes = MODIFIERS.questionWords;
  const suffixMods = useModifiers
    ? [
        ...MODIFIERS.expansionModifiers,
        ...Object.values(MODIFIERS.commercialModifiers).flatMap((b) => b.terms || []),
      ]
    : [];

  const collected = [];
  let calls = 0,
    blocked = 0,
    cacheHits = 0;
  const queue = [];
  for (const seed of seeds) {
    for (const ch of alphabet) queue.push({ seed, q: `${seed}${ch}`.trim() });
    for (const p of prefixes) queue.push({ seed, q: `${p} ${seed}` });
    for (const m of suffixMods) queue.push({ seed, q: `${seed} ${m}` });
  }
  // Cap pro Seed
  const perSeedCount = {};
  for (const { seed, q } of queue) {
    if ((perSeedCount[seed] = (perSeedCount[seed] || 0) + 1) > maxPerSeed) continue;
    const { terms, fromCache, blocked: bl } = await suggest(q, geo);
    if (bl) blocked++;
    if (fromCache) cacheHits++;
    else if (!bl) {
      calls++;
      await sleep(2000);
    } // 2s nur bei echtem Netz-Call
    for (const t of terms) collected.push({ keyword: t, source: "suggest" });
  }

  // Depth 2: die haeufigsten neuen Terme nochmal expandieren (begrenzt)
  if (depth >= 2) {
    const top = dedupeKeywords(collected)
      .slice(0, 15)
      .map((g) => g.display);
    for (const seed of top) {
      for (const ch of " abcdefghijklmnopqrstuvwxyz".split("").slice(0, 12)) {
        const { terms, fromCache, blocked: bl } = await suggest(`${seed}${ch}`.trim(), geo);
        if (bl) {
          blocked++;
          continue;
        }
        if (fromCache) cacheHits++;
        else {
          calls++;
          await sleep(2000);
        }
        for (const t of terms) collected.push({ keyword: t, source: "suggest" });
      }
    }
  }

  const groups = dedupeKeywords(collected);
  const out = {
    source: "suggest",
    geo,
    stats: {
      queries: queue.length,
      netCalls: calls,
      cacheHits,
      blocked,
      uniqueTerms: groups.length,
    },
    groups,
  };
  const outPath = arg("out");
  if (outPath) {
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    process.stderr.write(
      `[suggest] ${groups.length} unique Terme → ${outPath} (${calls} Netz-Calls, ${cacheHits} Cache, ${blocked} blockiert)\n`,
    );
  } else {
    process.stdout.write(JSON.stringify(out, null, 2));
  }
}

main().catch((e) => {
  process.stderr.write("FEHLER: " + (e.stack || e.message || e) + "\n");
  process.exit(1);
});
