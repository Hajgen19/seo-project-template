#!/usr/bin/env node
// kw-enrich.mjs — Keyword-Metriken via Google Ads Keyword Planner (Phase 2).
// Liefert Volumen (≈, gebucketet), Competition, Top-of-Page-Bid (CPC-Proxy). Zurückgegebene
// NEUE Ideen werden als zusätzliche Seeds (source: "gkp") mitgenommen.
//
// ⚠️ BYO-JSON-Modus (Standard-Workflow):
//    Der Keyword Planner läuft über den Ads-MCP-Server (Template: mcpwerk-ads, Tool
//    `mcp__mcpwerk-ads__run_keyword_planner`). Dieses Skript kann die Session-MCP-Tools
//    des Modells NICHT selbst aufrufen. Deshalb:
//    1) Das MODELL ruft run_keyword_planner (customer_id via list_accounts, geo_target_ids
//       ["2276"], language_id "1001") für die Seed-Batches + Competitor-URLs auf und schreibt
//       die Roh-Ergebnisse nach tmp/kw-planner-raw.json (Format siehe --raw unten).
//    2) Dieses Skript liest diese Datei mit `--raw <file>` und macht die Fleißarbeit
//       (Normalisieren, Bucketen, Mergen, No-Data-Tracking) deterministisch.
//    Ohne --raw fällt es auf den mcpCall-Pfad zurück (Server-Name aus skill.config.json →
//    mcpServers.googleAds) — der greift nur, wenn der Ads-Server direkt über die .mcp.json
//    des Projekts erreichbar ist. Bei anders benannten Servern (z. B. claude.ai-Connectoren)
//    nur den Server-Namen bzw. Tool-Präfix anpassen.
//
//    --raw-Format (tolerant): entweder ein flaches Array von Idea-Rows, ODER
//      { "geo": "DE", "batches": [ { "source": "gkp"|"competitor_gap", "url"?: "...",
//                                    "rows": [ <run_keyword_planner-Idea-Objekte> ] }, ... ] }
//
// Server-Eigenheiten (mcpwerk): seasonality über start/end-Monat erhebbar, sonst null
//    (ehrliche Datenlücke). Konten ohne Spend liefern Volumen-RANGES → volume_flag="bucket".
//
// CLI:
//   node kw-enrich.mjs --raw tmp/kw-planner-raw.json --in 01_seeds.json --scope 00_scope.json --out 02_metrics.json
//   node kw-enrich.mjs --in 01_seeds.json --scope 00_scope.json --out 02_metrics.json   (mcpCall-Fallback)

import { readFileSync, writeFileSync } from "node:fs";
import { foldKey, chNormalize, dedupeKeywords } from "./lib/normalize-de.mjs";
import { mcpCall } from "./lib/mcp.mjs";
import { loadConfig } from "./lib/config.mjs";

const CFG = loadConfig();

// Hinweis: Geo/Sprache sind über run_keyword_planner NICHT steuerbar (Schema kennt die
// Felder nicht). Geo-IDs (DE 2276 / AT 2040 / CH 2756) bleiben in dach-normalization.md
// dokumentiert; relevant nur für die SERP-Phase (gl/hl), nicht für GKP.
const BATCH = 20;

function arg(name, def = null) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

// Robust gegen unbekannte Response-Shape: zieht eine flache Liste von Rows.
function extractRows(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const k of ["keywords", "results", "keyword_ideas", "ideas", "metrics", "data"]) {
    if (Array.isArray(data[k])) return data[k];
  }
  return [];
}

function num(...cands) {
  for (const c of cands) {
    if (c === 0) return 0;
    if (c != null && !Number.isNaN(Number(c))) return Number(c);
  }
  return null;
}

// CPC: Google-Ads-Bids kommen i. d. R. in Micros (€·1e6). Heuristik: Werte > 1000
// → Micros → /1e6; sonst als EUR interpretieren. Beim 1. Lauf verifizieren.
function toEur(v) {
  if (v == null) return null;
  return v > 1000 ? +(v / 1e6).toFixed(2) : +Number(v).toFixed(2);
}

function mapRow(row, geo) {
  const keyword = row.text || row.keyword || row.keyword_text || row.query || "";
  if (!keyword) return null;
  const vol = num(
    row.avg_monthly_searches,
    row.avgMonthlySearches,
    row.search_volume,
    row.volume,
    row.monthly_searches,
  );
  const compIdx = num(row.competition_index, row.competitionIndex, row.competition_value);
  let comp = row.competition || row.competition_level || null;
  if (typeof comp === "string") comp = comp.toUpperCase();
  const bidLow = num(
    row.low_top_of_page_bid_micros,
    row.low_top_of_page_bid,
    row.lowTopOfPageBid,
    row.cpc_low,
  );
  const bidHigh = num(
    row.high_top_of_page_bid_micros,
    row.high_top_of_page_bid,
    row.highTopOfPageBid,
    row.cpc_high,
  );
  let cpc = null;
  if (bidLow != null || bidHigh != null) {
    const lo = toEur(bidLow),
      hi = toEur(bidHigh);
    cpc = lo != null && hi != null ? +((lo + hi) / 2).toFixed(2) : (hi ?? lo);
  }
  return {
    keyword,
    fold_key: foldKey(keyword),
    geo,
    volume_approx: vol === 0 ? null : vol, // 0 → behandeln wie no-data (flaggen)
    volume_flag: vol == null ? null : "bucket", // konservativ; "exact" nie ohne Beleg
    competition: comp || null,
    competition_index: compIdx,
    cpc_eur: cpc,
    cpc_flag: cpc == null ? null : "gkp",
    seasonality: null, // GKP-Trend-Endpoint defekt → Datenlücke
  };
}

async function enrichBatch(keywords, customerId, geo, pageUrl = null) {
  const args = { customer_id: String(customerId).replace(/-/g, ""), keywords };
  // page_url wird vom Server NUR zusammen mit keywords akzeptiert (Competitor-URL-Mode).
  if (pageUrl) args.page_url = pageUrl;
  // ⚠️ KEIN location_ids/language_id: das run_keyword_planner-Schema kennt diese Felder
  // NICHT und lehnt sie hart ab (Pydantic "unexpected_keyword_argument"). Geo-Targeting ist
  // über diesen Server nicht steuerbar — Volumina kommen in der Standard-Account-Sicht
  // (deutscher Account → DE-Daten). AT/CH-Trennung daher nur über die SERP-Phase, nicht GKP.
  const res = await mcpCall(CFG.mcpServers.googleAds, "run_keyword_planner", args);
  if (!res.ok) {
    process.stderr.write(`[gkp] Batch fehlgeschlagen: ${res.error}\n`);
    return { rows: [], error: res.error };
  }
  return { rows: extractRows(res.data), error: null };
}

async function main() {
  const scope = arg("scope") ? JSON.parse(readFileSync(arg("scope"), "utf8")) : {};
  const geo = arg("geo", (scope.geo && scope.geo[0]) || "DE");
  const rawPath = arg("raw"); // BYO-JSON: vom Modell via Ads-MCP gezogene Roh-Ideen
  const customerId = arg("customer-id", scope.customer_id);
  if (!customerId && !rawPath) {
    process.stderr.write(
      "Keine customer_id (--customer-id oder scope.customer_id) und kein --raw. Standard-Workflow: das Modell zieht run_keyword_planner über den Ads-MCP und übergibt --raw tmp/kw-planner-raw.json.\n",
    );
    process.exit(1);
  }

  // Seed-Herkunft aus Phase 1 durchreichen (sonst gehen die source-Tags verloren).
  const seedSources = new Map(); // fold_key → Set(sources)
  let keywords = [];
  if (arg("in")) {
    const seeds = JSON.parse(readFileSync(arg("in"), "utf8"));
    for (const g of seeds.groups || []) {
      keywords.push(g.display);
      seedSources.set(foldKey(g.display), new Set(g.sources || []));
    }
  }
  if (typeof arg("keywords") === "string") {
    keywords = keywords.concat(
      arg("keywords")
        .split(",")
        .map((s) => s.trim()),
    );
  }
  keywords = [...new Set(keywords.filter(Boolean))];
  if (geo === "CH") keywords = keywords.map(chNormalize);
  if (!keywords.length) {
    process.stderr.write("Keine Keywords (--in 01_seeds.json oder --keywords).\n");
    process.exit(1);
  }

  const byKey = new Map();
  let errors = 0;
  // sources mergen statt überschreiben; neue GKP-Ideen erben "gkp" bzw. die Competitor-Quelle.
  const absorb = (e, defaultSource) => {
    const seeded = seedSources.get(e.fold_key);
    const src = new Set(seeded || []);
    if (!seeded) src.add(defaultSource);
    const prev = byKey.get(e.fold_key);
    if (prev) {
      e.sources = [...new Set([...(prev.sources || []), ...src])];
      if ((e.volume_approx ?? -1) <= (prev.volume_approx ?? -1)) {
        prev.sources = e.sources;
        return;
      }
    } else {
      e.sources = [...src];
    }
    byKey.set(e.fold_key, e);
  };
  if (rawPath) {
    // BYO-JSON: das Modell hat run_keyword_planner über den Ads-MCP gezogen und die
    // Roh-Ideen (inkl. Competitor-URL-Batches) in diese Datei geschrieben.
    const raw = JSON.parse(readFileSync(rawPath, "utf8"));
    const batches = Array.isArray(raw)
      ? [{ source: "gkp", rows: raw }]
      : raw.batches || [{ source: "gkp", rows: extractRows(raw) }];
    for (const b of batches) {
      const rows = extractRows(b.rows ?? b);
      let fresh = 0;
      for (const row of rows) {
        const e = mapRow(row, geo);
        if (!e) continue;
        if (!byKey.has(e.fold_key)) fresh++;
        absorb(e, b.source || "gkp");
      }
      process.stderr.write(
        `[gkp] raw-batch (${b.source || "gkp"}${b.url ? " " + b.url : ""}): ${rows.length} Rows, ${fresh} neu (kumuliert ${byKey.size} unique)\n`,
      );
    }
  } else {
    for (let i = 0; i < keywords.length; i += BATCH) {
      const batch = keywords.slice(i, i + BATCH);
      const { rows, error } = await enrichBatch(batch, customerId, geo);
      if (error) errors++;
      for (const row of rows) {
        const e = mapRow(row, geo);
        if (e) absorb(e, "gkp");
      }
      process.stderr.write(
        `[gkp] Batch ${i / BATCH + 1}: ${rows.length} Rows (kumuliert ${byKey.size} unique)\n`,
      );
    }

    // Competitor-Gap: je Wettbewerber-URL GKP-Ideen aus dem Themenfeld holen (page_url +
    // Seed-Keywords, wie vom Server verlangt). Ergebnisse mit source "competitor_gap".
    const competitors = (arg("competitors") || (scope.competitors || []).join(",") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const topSeeds = keywords.slice(0, 10);
    for (const url of competitors) {
      const { rows, error } = await enrichBatch(topSeeds, customerId, geo, url);
      if (error) {
        errors++;
        continue;
      }
      let fresh = 0;
      for (const row of rows) {
        const e = mapRow(row, geo);
        if (!e) continue;
        if (!byKey.has(e.fold_key)) fresh++;
        absorb(e, "competitor_gap");
      }
      process.stderr.write(
        `[gkp] Competitor ${url}: ${rows.length} Ideen (${fresh} neu) als competitor_gap\n`,
      );
    }
  }

  // Keywords, die GKP gar nicht kannte → als no-data-Entry behalten (Markenregel: nicht raten)
  for (const kw of keywords) {
    const fk = foldKey(kw);
    if (!byKey.has(fk)) {
      byKey.set(fk, {
        keyword: kw,
        fold_key: fk,
        geo,
        volume_approx: null,
        volume_flag: null,
        competition: null,
        competition_index: null,
        cpc_eur: null,
        cpc_flag: null,
        seasonality: null,
        no_gkp_data: true,
        sources: [...(seedSources.get(fk) || [])],
      });
    }
  }

  const entries = [...byKey.values()];
  const out = {
    run_id: scope.run_id || null,
    geo,
    stats: {
      input: keywords.length,
      enriched: entries.filter((e) => e.volume_approx != null).length,
      no_data: entries.filter((e) => e.volume_approx == null).length,
      batchErrors: errors,
    },
    entries,
  };
  const outPath = arg("out");
  if (outPath) {
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    process.stderr.write(
      `[gkp] ${entries.length} Entries → ${outPath} (${out.stats.enriched} mit Volumen, ${out.stats.no_data} ohne)\n`,
    );
  } else {
    process.stdout.write(JSON.stringify(out, null, 2));
  }
}

main().catch((e) => {
  process.stderr.write("FEHLER: " + (e.stack || e.message || e) + "\n");
  process.exit(1);
});
