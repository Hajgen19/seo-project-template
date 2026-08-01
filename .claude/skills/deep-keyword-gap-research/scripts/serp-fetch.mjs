#!/usr/bin/env node
// serp-fetch.mjs — SERP-Analyse via SerpApi (Phase 3). SerpApi-first (Google blockt
// direkte Scrapes häufig per reCAPTCHA — Playwright nur manueller Notnagel). Erfasst pro
// Keyword Organic-Top-10, SERP-Features, AIO-Detection und harvestet related_searches
// als Bonus-Seeds. Hartes Lauf-Cap (Free-Plan-Schutz), Snapshot-Cache.
// Voraussetzung: serpapi-MCP in der .mcp.json des Projekts (eigener Account, URL mit
// persönlichem Key) — Server-Name aus skill.config.json → mcpServers.serpapi.
//
// CLI:
//   node serp-fetch.mjs --in 02_metrics.json --scope 00_scope.json --out 03_serp.json
//   node serp-fetch.mjs --keywords "a,b" --geo DE --top 30 --out 03_serp.json
// Flags: --top N (nur die N volumenstärksten Keywords ge-SERP-t; Default 40) · --self-domain <domain> (Default aus skill.config.json)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { slugify, foldKey } from "./lib/normalize-de.mjs";
import { cacheKey, cacheGet, cacheSet, TTL } from "./lib/cache.mjs";
import { SerpBudget } from "./lib/rate-limit.mjs";
import { mcpCall } from "./lib/mcp.mjs";
import { loadConfig } from "./lib/config.mjs";

const CFG = loadConfig();
const GEO_MAP = CFG.geo;
const TX_HINT = new RegExp(CFG.txHintPattern, "i");

function arg(name, def = null) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const UGC_HOSTS = new RegExp(CFG.ugcHostPattern, "i");

function pageTypeOf(r) {
  const u = (r.link || "").toLowerCase();
  const t = (r.title || "").toLowerCase();
  const d = domainOf(r.link);
  if (UGC_HOSTS.test(u)) return "forum";
  if (/wikipedia\.org/.test(d)) return "wikipedia";
  if (/\/(produkt|product|p|artikel\/\d|dp\/)/.test(u) || /(amazon|idealo|otto|ebay)\./.test(d))
    return "produkt";
  if (/\/(kategorie|category|c\/|shop)/.test(u)) return "kategorie";
  if (/(vergleich|test|beste|testsieger|ratgeber|guide|\/blog\/|magazin)/.test(u + t))
    return "ratgeber";
  return "sonstige";
}

// Intent-Heuristik aus SERP-Komposition (grob; feine Klasse macht score.mjs/Modell)
function serpIntent(features, types, keyword) {
  if (features.shopping || features.ads_top >= 2) return "transactional";
  const forums = types.filter((t) => t === "forum").length;
  if (TX_HINT.test(keyword)) return "commercial";
  if (forums >= 3 || features.paa >= 3) return "informational";
  return "informational";
}

function extractSerp(data, keyword, selfDomain) {
  const organic = (data.organic_results || []).slice(0, 10).map((r) => ({
    position: r.position,
    link: r.link,
    domain: domainOf(r.link),
    title: r.title,
    snippet: r.snippet || "",
    page_type: pageTypeOf(r),
    date: r.date || r.publication_date || null,
  }));
  const aio = data.ai_overview || null;
  const aioSources = aio
    ? (aio.references || aio.sources || []).map((x) => x.link || x.source || "").filter(Boolean)
    : [];
  const fs = data.answer_box || data.featured_snippet || null;
  const features = {
    aio: !!aio,
    // Fallback-Proxy: kein ai_overview-Key → Featured Snippet als schwaches AIO-Signal
    aio_proxy: !aio && !!fs,
    featured_snippet: !!fs,
    paa: (data.related_questions || []).length,
    shopping: !!(data.shopping_results || data.immersive_products),
    ads_top: (data.ads || []).length,
    local_pack: !!(data.local_results || data.local_pack),
    video: !!(data.inline_videos || data.video_results),
  };
  const types = organic.map((o) => o.page_type);
  const aioCitedSelf = selfDomain
    ? aioSources.some((s) => domainOf(s) === selfDomain.replace(/^www\./, ""))
    : false;
  return {
    organic,
    features,
    aio_sources: aioSources,
    aio_cited_self: aioCitedSelf,
    related_searches: (data.related_searches || []).map((r) => r.query).filter(Boolean),
    paa_questions: (data.related_questions || []).map((q) => q.question).filter(Boolean),
    serp_intent: serpIntent(features, types, keyword),
  };
}

async function main() {
  const scope = arg("scope") ? JSON.parse(readFileSync(arg("scope"), "utf8")) : {};
  const geo = arg("geo", (scope.geo && scope.geo[0]) || "DE");
  const selfDomain = arg("self-domain", scope.self_domain || CFG.selfDomain);
  const topN = Number(arg("top", 40));
  const cap = Number(arg("cap", scope.serp_cap || process.env.SERP_RUN_CAP || CFG.serpCapDefault));
  const niche = scope.niche_slug || slugify(scope.niche || "lauf");

  let entries = [];
  if (arg("in")) {
    const metrics = JSON.parse(readFileSync(arg("in"), "utf8"));
    entries = metrics.entries || [];
  }
  if (typeof arg("keywords") === "string") {
    entries = entries.concat(
      arg("keywords")
        .split(",")
        .map((s) => ({ keyword: s.trim(), fold_key: foldKey(s), volume_approx: null })),
    );
  }
  if (!entries.length) {
    process.stderr.write("Keine Keywords (--in 02_metrics.json oder --keywords).\n");
    process.exit(1);
  }

  // Nur die topN volumenstärksten ge-SERP-t (Budget-Schutz). No-Volume ans Ende.
  const ranked = [...entries]
    .sort((a, b) => (b.volume_approx ?? -1) - (a.volume_approx ?? -1))
    .slice(0, topN);
  const budget = new SerpBudget(cap);
  const snapDir = resolve(process.cwd(), "tmp", "serp-snapshots", niche);
  mkdirSync(snapDir, { recursive: true });

  const { google_domain, gl, hl } = GEO_MAP[geo] || GEO_MAP[CFG.defaultGeo];
  const results = [];
  const bonusSeeds = new Set();
  let budgetHit = false;

  for (const e of ranked) {
    const kw = e.keyword;
    const isTx = TX_HINT.test(kw);
    const ttl = isTx ? TTL.SERP_TX : TTL.SERP_INFO;
    const key = cacheKey("serp", kw, google_domain, gl, hl);
    let data = cacheGet(key);
    if (data === null) {
      // spend() VOR dem Call (bewusst): SerpApi kann auch fehlgeschlagene Suchen aufs
      // Kontingent anrechnen → lieber das Lauf-Budget leicht überschätzen als das
      // Free-Plan-Limit zu überschreiten. Cache-Treffer (oben) kosten nichts.
      try {
        budget.spend(kw);
      } catch (err) {
        process.stderr.write(`[serp] ${err.message}\n`);
        budgetHit = true;
        break;
      }
      // serpapi-Tool erwartet die SerpApi-Parameter in `params` + `mode` (NICHT top-level).
      const res = await mcpCall(CFG.mcpServers.serpapi, "search", {
        params: { q: kw, engine: "google", google_domain, gl, hl, num: 10 },
        mode: "complete",
      });
      if (!res.ok || !res.data) {
        process.stderr.write(`[serp] "${kw}" fehlgeschlagen: ${res.error}\n`);
        continue;
      }
      data = res.data;
      cacheSet(key, data, ttl);
      try {
        writeFileSync(resolve(snapDir, slugify(kw) + ".json"), JSON.stringify(data));
      } catch {}
    }
    const ex = extractSerp(data, kw, selfDomain);
    ex.related_searches.forEach((q) => bonusSeeds.add(q));
    results.push({
      ...e,
      serp_features: ex.features,
      aio_sources: ex.aio_sources,
      aio_cited_self: ex.aio_cited_self,
      organic: ex.organic,
      paa_questions: ex.paa_questions,
      serp_intent: ex.serp_intent,
    });
    process.stderr.write(
      `[serp] ${results.length}/${ranked.length} "${kw}" — AIO:${ex.features.aio ? "ja" : "nein"} PAA:${ex.features.paa} Ads:${ex.features.ads_top} (Budget ${budget.remaining} übrig)\n`,
    );
  }

  const out = {
    run_id: scope.run_id || null,
    geo,
    serp_calls_used: budget.used,
    budget_exhausted: budgetHit,
    not_serped: ranked.length - results.length,
    snapshots_dir: snapDir,
    bonus_seeds: [...bonusSeeds].map((q) => ({ keyword: q, source: "related_search" })),
    entries: results,
  };
  const outPath = arg("out");
  if (outPath) {
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    process.stderr.write(
      `[serp] ${results.length} SERPs (${budget.used} Calls), ${out.bonus_seeds.length} Related-Search-Bonus-Seeds → ${outPath}${budgetHit ? " [BUDGET-CAP — Resume nötig]" : ""}\n`,
    );
  } else {
    process.stdout.write(JSON.stringify(out, null, 2));
  }
}

main().catch((e) => {
  process.stderr.write("FEHLER: " + (e.stack || e.message || e) + "\n");
  process.exit(1);
});
