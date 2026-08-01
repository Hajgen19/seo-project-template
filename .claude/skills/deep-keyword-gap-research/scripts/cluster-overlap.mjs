#!/usr/bin/env node
// cluster-overlap.mjs — SERP-Overlap-Clustering (Phase 4). Teilt die Methodik mit
// seo-page-research/references/clustering-thresholds.md: zwei Keywords gehören in
// einen Cluster, wenn ihre Top-10-SERPs sich ≥ Threshold überlappen (Default 30 %).
// Regime nach Set-Größe: greedy (<200) / Connected-Components (≥200). >5000 außer Scope.
//
// CLI: node cluster-overlap.mjs --in 03_serp.json --scope 00_scope.json --out 04_clusters.json
// Flags: --threshold 0.30

import { readFileSync, writeFileSync } from "node:fs";
import { foldKey } from "./lib/normalize-de.mjs";

function arg(name, def = null) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

// URL-Key je Treffer: domain + pathname. new URL() wirft bei nicht-leeren, aber
// ungültigen Links (z. B. "javascript:void(0)", relative Pfade) — daher try/catch,
// sonst reißt ein einziger kaputter SerpApi-Link die ganze Phase-4-Berechnung nieder.
const topUrls = (e) =>
  new Set(
    (e.organic || [])
      .map((o) => {
        try {
          return o.domain + new URL(o.link || "http://x/").pathname;
        } catch {
          return o.domain || "";
        }
      })
      .filter(Boolean),
  );

// Overlap = geteilte URLs / min(|A|,|B|) — konsistent mit Baseline (3/10 = 0.30).
function overlap(a, b) {
  const A = topUrls(a),
    B = topUrls(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const u of A) if (B.has(u)) shared++;
  return shared / Math.min(A.size, B.size);
}

function greedy(entries, threshold) {
  const sorted = [...entries].sort((a, b) => (b.volume_approx ?? -1) - (a.volume_approx ?? -1));
  const clusters = [];
  for (const e of sorted) {
    let best = null,
      bestOv = 0;
    for (const c of clusters) {
      const ov = overlap(e, c.members[0]); // gegen Primary
      if (ov >= threshold && ov > bestOv) {
        best = c;
        bestOv = ov;
      }
    }
    if (best) best.members.push(e);
    else clusters.push({ members: [e] });
  }
  return clusters;
}

// Connected Components via Union-Find (für größere Sets).
function connectedComponents(entries, threshold) {
  const parent = entries.map((_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a, b) => {
    parent[find(a)] = find(b);
  };
  for (let i = 0; i < entries.length; i++)
    for (let j = i + 1; j < entries.length; j++)
      if (overlap(entries[i], entries[j]) >= threshold) union(i, j);
  const byRoot = new Map();
  entries.forEach((e, i) => {
    const r = find(i);
    if (!byRoot.has(r)) byRoot.set(r, { members: [] });
    byRoot.get(r).members.push(e);
  });
  return [...byRoot.values()];
}

function consolidate(cluster, id) {
  const members = [...cluster.members].sort(
    (a, b) => (b.volume_approx ?? -1) - (a.volume_approx ?? -1),
  );
  const primary = members[0];
  const secondary = members.slice(1, 9); // 3–8 laut Best Practice
  const supporting = members.slice(9);
  // Intent: Mehrheit der serp_intent-Werte
  const intents = members.map((m) => m.serp_intent).filter(Boolean);
  const intent =
    intents
      .sort((a, b) => intents.filter((x) => x === a).length - intents.filter((x) => x === b).length)
      .pop() || null;
  return {
    id,
    primary: primary.keyword,
    primary_fold: primary.fold_key || foldKey(primary.keyword),
    secondary: secondary.map((m) => m.keyword),
    supporting: supporting.map((m) => m.keyword),
    member_folds: members.map((m) => m.fold_key || foldKey(m.keyword)),
    size: members.length,
    intent,
    volume_sum: members.reduce((s, m) => s + (m.volume_approx || 0), 0),
    competitor_urls: [...new Set((primary.organic || []).slice(0, 5).map((o) => o.link))],
    serp_features: primary.serp_features || null,
    flags:
      members.length > 30
        ? ["mega-cluster: Mixed-Intent/Pillar prüfen"]
        : members.length < 3
          ? ["thin-cluster: ggf. mergen oder Long-Tail-Single"]
          : [],
  };
}

function main() {
  const scope = arg("scope") ? JSON.parse(readFileSync(arg("scope"), "utf8")) : {};
  const threshold = Number(arg("threshold", (scope.thresholds && scope.thresholds.overlap) || 0.3));
  const serp = JSON.parse(readFileSync(arg("in"), "utf8"));
  const entries = (serp.entries || []).filter((e) => (e.organic || []).length);
  if (!entries.length) {
    process.stderr.write("Keine SERP-Entries mit organic[] — erst serp-fetch laufen lassen.\n");
    process.exit(1);
  }
  if (entries.length > 5000) {
    process.stderr.write("Über 5000 Keywords — außerhalb Skill-Scope (O(n^2)). Set verkleinern.\n");
    process.exit(1);
  }

  const regime = entries.length < 200 ? "greedy" : "connected-components";
  const raw =
    regime === "greedy" ? greedy(entries, threshold) : connectedComponents(entries, threshold);
  const clusters = raw
    .sort(
      (a, b) =>
        b.members.reduce((s, m) => s + (m.volume_approx || 0), 0) -
        a.members.reduce((s, m) => s + (m.volume_approx || 0), 0),
    )
    .map((c, i) => consolidate(c, i + 1));

  // cluster_id zurück in die Entries spiegeln
  const idByFold = new Map();
  clusters.forEach((c) => c.member_folds.forEach((f) => idByFold.set(f, c.id)));
  const taggedEntries = entries.map((e) => ({
    ...e,
    cluster_id: idByFold.get(e.fold_key || foldKey(e.keyword)) ?? null,
  }));

  const out = {
    run_id: serp.run_id || scope.run_id || null,
    regime,
    threshold,
    stats: {
      keywords: entries.length,
      clusters: clusters.length,
      mega: clusters.filter((c) => c.size > 30).length,
      thin: clusters.filter((c) => c.size < 3).length,
    },
    clusters,
    entries: taggedEntries,
  };
  const outPath = arg("out");
  if (outPath) {
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    process.stderr.write(
      `[cluster] ${clusters.length} Cluster aus ${entries.length} Keywords (${regime}, Threshold ${threshold}) → ${outPath}\n`,
    );
  } else process.stdout.write(JSON.stringify(out, null, 2));
}

main();
