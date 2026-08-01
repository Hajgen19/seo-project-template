#!/usr/bin/env node
// coverage-gsc.mjs — Nischenweiter Eigen-Coverage-/Kannibalisierungs-Abgleich (Phase 4).
// Beantwortet "decken wir das Keyword schon ab?" auf SET-Ebene (anders als der
// seitenweise Cannibalization-Check von seo-page-research).
//
// Zwei Quellen, automatisch gewählt:
//   (A) GSC (query,page) → current_rank + echte Kannibalisierung. Standard-Workflow ist
//       BYO-JSON: das MODELL zieht die GSC-Daten über den GSC-MCP (Template: mcpwerk-gsc,
//       z. B. get_search_analytics für die Property aus skill.config.json mit dims
//       query+page, oder get_search_by_page_query je Seite) und schreibt die Rows nach
//       tmp/gsc-raw.json; dieses Skript liest sie mit --gsc-raw.
//       (Der mcpCall-Fallback tryGsc greift nur, wenn der GSC-Server direkt über die
//       .mcp.json erreichbar ist; Server-Name aus skill.config.json → mcpServers.gsc.)
//   (B) Fallback: das Markdown-URL-Inventar der Wissensbasis (Pfad aus skill.config.json →
//       seoInventory.path, laut Projekt-CLAUDE.md) → lexikalische Coverage. Bei junger
//       Domain (wenig GSC-Signal) ist das der Normalfall, Ergebnis meist GAP_NEW (erwartbar).
// Embedding-Matching bewusst NICHT als Auto-Aktion (nur Discovery-Signal; Konsolidierung
// braucht manuellen Review). Neue Cluster gegen eine ggf. vorhandene Ownership-Map des
// Projekts prüfen (z. B. seo/content-ownership-map.md).
//
// CLI: node coverage-gsc.mjs --in 04_clusters.json --scope 00_scope.json --gsc-raw tmp/gsc-raw.json --out 04_clusters.json
// Flags: --gsc-raw <file> (BYO-JSON GSC) · --inventory <md> (Default aus skill.config.json) · --gsc-site <property>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { foldKey } from "./lib/normalize-de.mjs";
import { mcpReachable, mcpList, mcpCall } from "./lib/mcp.mjs";
import { loadConfig } from "./lib/config.mjs";

const CFG = loadConfig();
const STOP = new Set(CFG.stopwords);

function arg(name, def = null) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const contentTokens = (s) =>
  foldKey(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4 && !STOP.has(t));

// ── Fallback B: Markdown-URL-Inventory (CONTENT-AWARE) ──
// Das URL-Inventar ist eine Markdown-Datei der Wissensbasis (Pfad laut CLAUDE.md,
// konfiguriert in skill.config.json → seoInventory): pro Zeile eine backtick-/quote-
// quotierte URL (`/products/beispiel-produkt`) plus beschreibender Text. Match-Korpus je
// Seite = Pfad-Segmente + die ganze Zeile (fängt Beschreibungs-Tokens, nicht nur den Slug).
// URL-MUSTER wie `/products/<slug>` matchen bewusst nicht (der `<`-Platzhalter bricht die Regex).
function loadSeoInventory(invPath) {
  if (!existsSync(invPath)) return null;
  const txt = readFileSync(invPath, "utf8");
  const re = new RegExp(CFG.seoInventory.pathKeyPattern, "gi");
  const byPath = new Map();
  for (const line of txt.split("\n")) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      const path = m[1];
      if (!path || path.length < 2) continue;
      const corpus = path.replace(/[/\-]/g, " ") + " " + line;
      const toks = contentTokens(corpus);
      const prev = byPath.get(path);
      if (prev) toks.forEach((t) => prev.tokens.add(t));
      else byPath.set(path, { path, tokens: new Set(toks) });
    }
  }
  return [...byPath.values()];
}

function lexicalCoverage(keyword, inventory) {
  const kt = contentTokens(keyword);
  if (!kt.length || !inventory || !inventory.length)
    return { coverage_status: "GAP_NEW", matched_path: null };
  let best = { hits: 0, path: null };
  for (const page of inventory) {
    const hits = kt.filter((t) => page.tokens.has(t)).length;
    if (hits > best.hits) best = { hits, path: page.path };
  }
  const ratio = best.hits / kt.length;
  if (ratio >= 0.99) return { coverage_status: "COVERED", matched_path: best.path };
  if (ratio >= 0.5) return { coverage_status: "PARTIAL", matched_path: best.path };
  return { coverage_status: "GAP_NEW", matched_path: null };
}

// ── Quelle A: GSC-Bulk (best-effort) ──
async function tryGsc(site) {
  const GSC = CFG.mcpServers.gsc;
  if (!(await mcpReachable(GSC))) return null;
  const { tools } = await mcpList(GSC);
  const tool = (tools || [])
    .map((t) => t.name)
    .find((n) => /search.?analytics|query|performance/i.test(n));
  if (!tool) return null;
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 90 * 86400000).toISOString().slice(0, 10);
  const res = await mcpCall(GSC, tool, {
    site_url: site,
    siteUrl: site,
    start_date: start,
    end_date: end,
    startDate: start,
    endDate: end,
    dimensions: ["query", "page"],
    row_limit: 25000,
    rowLimit: 25000,
  });
  if (!res.ok || !res.data) return null;
  const rows = Array.isArray(res.data) ? res.data : res.data.rows || res.data.results || [];
  if (!rows.length) return { rows: [], empty: true };
  return { rows, empty: false };
}

function indexGsc(rows) {
  // fold_key → { best_position, pages:Set, byPage:[{page,position,impressions,clicks}] }
  const map = new Map();
  for (const r of rows) {
    const q = (r.keys ? r.keys[0] : r.query) || "";
    const page = (r.keys ? r.keys[1] : r.page) || "";
    if (!q) continue;
    const fk = foldKey(q);
    const pos = Number(r.position ?? r.avg_position ?? 0);
    const rec = map.get(fk) || { best_position: Infinity, byPage: [] };
    rec.byPage.push({
      page,
      position: pos,
      impressions: Number(r.impressions || 0),
      clicks: Number(r.clicks || 0),
    });
    rec.best_position = Math.min(rec.best_position, pos || Infinity);
    map.set(fk, rec);
  }
  return map;
}

function cannibalization(rec) {
  const pages = rec.byPage.filter((p) => p.clicks > 0 || p.impressions > 0);
  const distinct = [...new Set(pages.map((p) => p.page))];
  if (distinct.length < 2) return null;
  const sorted = pages.sort((a, b) => a.position - b.position);
  const [a, b] = sorted;
  const gap = Math.abs(a.position - b.position);
  const ratio = a.impressions ? b.impressions / a.impressions : 0;
  let severity = "low";
  if (gap < 3 && ratio > 0.5) severity = "high";
  else if (gap < 5 && ratio > 0.3) severity = "medium";
  return { severity, urls: distinct.slice(0, 5) };
}

async function main() {
  const scope = arg("scope") ? JSON.parse(readFileSync(arg("scope"), "utf8")) : {};
  const invPath = arg("inventory", arg("seo-ts", CFG.seoInventory.path));
  const gscSite = arg("gsc-site", scope.gsc_site || CFG.gscSite);
  const gscRawPath = arg("gsc-raw"); // BYO-JSON: vom Modell über den GSC-MCP gezogene Rows
  const src = JSON.parse(readFileSync(arg("in"), "utf8"));
  const entries = src.entries || [];

  let gsc = null;
  if (gscRawPath) {
    const raw = JSON.parse(readFileSync(gscRawPath, "utf8"));
    const rows = Array.isArray(raw) ? raw : raw.rows || raw.results || [];
    gsc = { rows, empty: rows.length === 0 };
  } else {
    gsc = await tryGsc(gscSite).catch(() => null);
  }
  const inventory = loadSeoInventory(resolve(process.cwd(), invPath));
  let mode;
  let gscIndex = null;
  if (gsc && !gsc.empty) {
    mode = "gsc";
    gscIndex = indexGsc(gsc.rows);
  } else {
    mode = inventory ? "inventory-fallback" : "none";
  }
  process.stderr.write(
    `[coverage] Modus: ${mode}${gsc && gsc.empty ? " (GSC erreichbar aber leer — Domain wohl noch nicht indexiert)" : ""}\n`,
  );

  let cannibCount = 0;
  for (const e of entries) {
    const fk = e.fold_key || foldKey(e.keyword);
    if (mode === "gsc" && gscIndex) {
      const rec = gscIndex.get(fk);
      if (rec) {
        e.current_rank = rec.best_position === Infinity ? null : +rec.best_position.toFixed(1);
        // rank > 30 = kein nutzbares GSC-Signal → GAP_NEW (NICHT PARTIAL; PARTIAL ist
        // laut output-contract.md dem lexikalischen Fallback vorbehalten).
        e.coverage_status =
          e.current_rank != null && e.current_rank <= 10
            ? "COVERED"
            : e.current_rank != null && e.current_rank <= 30
              ? "GAP_WEAK"
              : "GAP_NEW";
        const c = cannibalization(rec);
        if (c) {
          e.cannibalization = c;
          cannibCount++;
        } else e.cannibalization = null;
      } else {
        e.current_rank = null;
        e.coverage_status = "GAP_NEW";
        e.cannibalization = null;
      }
    } else {
      const cov = lexicalCoverage(e.keyword, inventory || []);
      e.current_rank = null;
      e.coverage_status = cov.coverage_status;
      e.matched_path = cov.matched_path;
      e.cannibalization = null;
    }
  }

  src.coverage_mode = mode;
  src.coverage_stats = {
    covered: entries.filter((e) => e.coverage_status === "COVERED").length,
    partial: entries.filter((e) => e.coverage_status === "PARTIAL").length,
    gap_weak: entries.filter((e) => e.coverage_status === "GAP_WEAK").length,
    gap_new: entries.filter((e) => e.coverage_status === "GAP_NEW").length,
    cannibalization: cannibCount,
  };
  const outPath = arg("out") || arg("in");
  writeFileSync(outPath, JSON.stringify(src, null, 2));
  process.stderr.write(
    `[coverage] ${entries.length} Keywords (${mode}): ${src.coverage_stats.gap_new} GAP_NEW, ${src.coverage_stats.covered} COVERED, ${cannibCount} Kannibalisierungs-Konflikte → ${outPath}\n`,
  );
}

main().catch((e) => {
  process.stderr.write("FEHLER: " + (e.stack || e.message || e) + "\n");
  process.exit(1);
});
