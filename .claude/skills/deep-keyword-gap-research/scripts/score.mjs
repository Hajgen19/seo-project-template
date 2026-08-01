#!/usr/bin/env node
// score.mjs — Difficulty-Proxy, Commercial-Intent-Score, AIO-Screening, Opportunity-Score,
// Buckets (Phase 5). JEDE Zahl hier ist in references/opportunity-scoring.md begründet —
// beim Ändern BEIDE Stellen anfassen. Rein deterministisch (kein LLM): die CIS-Faktoren
// B/E sind hier Heuristik-Defaults; eine optionale Haiku-Verfeinerung für Graubereich-
// Keywords steuert das MODELL im Skill-Ablauf, nicht dieses Skript.

import { readFileSync, writeFileSync } from "node:fs";
import { foldKey } from "./lib/normalize-de.mjs";
import { loadConfig, modifiersPath } from "./lib/config.mjs";

const CFG = loadConfig();
const MODIFIERS = JSON.parse(readFileSync(modifiersPath(), "utf8").replace(/^﻿/, ""));

// ── Defaults (Spiegel von opportunity-scoring.md; via scope.weights/thresholds überschreibbar) ──
const WEIGHTS = { w1: 0.3, w2: 0.15, w3: 0.25, w4: 0.15, w5: 0.1, w6: 0.05 };
const THRESHOLDS = {
  weakness_min: 3,
  qw_diff: 0.3,
  qw_vol: 100,
  mid_diff: 0.6,
  mid_vol: 200,
  auth_vol: 1000,
};
// Projekt-spezifisch → aus skill.config.json (Difficulty-Proxy / weak_domains).
// Kopie (nicht die Config mutieren); in main um scope.tier_a_extra erweitert —
// vertikale Nischen haben eigene starke Spezial-Shops, die die globale Mainstream-Liste
// nicht kennt (sonst meldet der Proxy sie faelschlich als weak_domains).
const TIER_A_DOMAINS = [...CFG.tierADomains];

function arg(name, def = null) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// ── §2 Difficulty-Proxy aus SERP-Komposition ──
function difficultyProxy(e) {
  const org = e.organic || [];
  if (!org.length) return null;
  const n = org.length;
  const domainTierMix =
    org.filter((o) => TIER_A_DOMAINS.some((d) => (o.domain || "").endsWith(d))).length / n;
  const f = e.serp_features || {};
  const serpFeatureDensity = clamp01(
    ((f.featured_snippet ? 1 : 0) +
      (f.paa >= 1 ? 1 : 0) +
      (f.shopping ? 1 : 0) +
      (f.video ? 1 : 0)) /
      4,
  );
  const kwFold = e.fold_key || foldKey(e.keyword);
  const titleMatchDensity = org.filter((o) => foldKey(o.title || "").includes(kwFold)).length / n;
  const dated = org.map((o) => o.date).filter(Boolean);
  let freshnessGap = 0;
  if (dated.length >= 3) {
    const ages = dated
      .map((d) => {
        const t = Date.parse(d);
        return Number.isNaN(t) ? null : (Date.now() - t) / (1000 * 3600 * 24 * 30);
      })
      .filter((x) => x != null)
      .sort((a, b) => a - b);
    if (ages.length) {
      const med = ages[Math.floor(ages.length / 2)];
      freshnessGap = med > 18 ? clamp01((med - 18) / 24) : 0;
    }
  }
  const thinContentShare =
    org.filter((o) => !(o.snippet || "").trim() || (o.snippet || "").length < 50).length / n;
  return +clamp01(
    0.4 * domainTierMix +
      0.25 * serpFeatureDensity +
      0.2 * titleMatchDensity -
      0.1 * freshnessGap -
      0.05 * thinContentShare,
  ).toFixed(3);
}

// ── §5 Commercial-Intent-Score ──
function factorA(kwFold) {
  // Purchase-Modifier (longest-match-first, max gewinnt)
  let best = 0;
  for (const bucket of Object.values(MODIFIERS.commercialModifiers)) {
    if (!bucket.terms) continue;
    for (const term of bucket.terms)
      if (kwFold.includes(foldKey(term))) best = Math.max(best, bucket.score);
  }
  return best;
}
function factorB(kw) {
  // Solution Specificity (Heuristik aus Wortzahl)
  const w = kw.trim().split(/\s+/).length;
  return w >= 5 ? 200 : w === 4 ? 150 : w === 3 ? 100 : 50;
}
function factorC(kwFold) {
  // Urgency
  let best = 0;
  for (const lvl of Object.values(MODIFIERS.urgencyTerms)) {
    if (!lvl.terms) continue;
    for (const term of lvl.terms)
      if (kwFold.includes(foldKey(term))) best = Math.max(best, lvl.score);
  }
  return best;
}
function adsSignal(f) {
  // Faktor D
  if (!f) return 0;
  let s = 0;
  if (f.ads_top >= 4) s = 100;
  else if (f.ads_top >= 2) s = 70;
  else if (f.ads_top === 1) s = 40;
  if (f.shopping) s = Math.max(s, 80);
  if (f.local_pack) s = Math.max(s, 60);
  return s;
}
function cisScore(e, businessRelevance) {
  const kwFold = e.fold_key || foldKey(e.keyword);
  const A = factorA(kwFold),
    B = factorB(e.keyword),
    C = factorC(kwFold),
    D = adsSignal(e.serp_features),
    E = Math.round((businessRelevance ?? 0.6) * 100);
  const raw = A + B + C + D + E; // max 700
  return {
    cis: Math.round(raw / 7),
    parts: { A, B, C, D, E },
    localDominant: D === 60 && (e.serp_features || {}).local_pack,
  };
}
// Comparison-/Test-Intent → IMMER Vergleichsseite (Projektregel: "test/Vergleich" wird
// nie als Ratgeber bedient). Override des reinen CIS-Schwellenwerts.
// Seitentyp-Namen + Schwellen aus skill.config.json (Taxonomie-Brücke des Projekts).
const COMPARISON_RE = new RegExp(CFG.comparisonPattern);
const PT = CFG.pageType;
function pageTypeFromCis(cis, localDominant, kwFold = "") {
  if (localDominant)
    return {
      page_type: PT.localSkipType,
      page_type_cta: false,
      note: "Local-Pack dominiert — kein passender Seitentyp",
    };
  const comparison = COMPARISON_RE.test(kwFold);
  if (cis > PT.thresholds.compMax)
    return { page_type: PT.moneyType, page_type_cta: false, money_page: true };
  if (cis > PT.thresholds.ctaMax || comparison)
    return {
      page_type: PT.comparisonType,
      page_type_cta: false,
      ...(comparison && cis <= PT.thresholds.ctaMax
        ? { note: "Comparison-Override (test/Vergleich → Vergleichsseite)" }
        : {}),
    };
  if (cis > PT.thresholds.infoMax) return { page_type: PT.infoCtaType, page_type_cta: true };
  return { page_type: PT.infoType, page_type_cta: false };
}

// ── §4 AIO-Screening ──
function intentWeight(e) {
  const f = e.serp_features || {};
  const kwFold = e.fold_key || foldKey(e.keyword);
  const isQuestion =
    /^(wer|was|wie|warum|weshalb|welche|welcher|welches|wo|wann|womit|wozu|ist|sind|kann man|lohnt sich) /.test(
      kwFold,
    );
  if (f.shopping || e.serp_intent === "transactional") return 0;
  if (e.serp_intent === "commercial") return 1;
  if (isQuestion) return 3;
  return 2; // informational-default
}
function aioRisk(e) {
  const words = e.keyword.trim().split(/\s+/).length;
  const lengthWeight = words >= 4 ? 2 : -1;
  const cpc = e.cpc_eur;
  const cpcWeight = cpc == null ? 0 : cpc < 0.5 ? 2 : cpc <= 2 ? 1 : cpc > 5 ? -2 : 0;
  const score = intentWeight(e) + lengthWeight + cpcWeight;
  const level = score >= 5 ? "HOCH" : score >= 3 ? "MITTEL" : "NIEDRIG";
  const f = e.serp_features || {};
  const ctr_multiplier = f.aio ? (e.aio_cited_self ? 0.62 : 0.28) : 1.0;
  return { aio_risk: level, ctr_multiplier, aio_strategy_required: level === "HOCH" };
}

// ── §3 SERP-Schwäche-Signale (ableitbar ohne Extra-Calls) ──
function weaknessSignals(e, expectedTransactional) {
  const org = e.organic || [],
    n = org.length || 1,
    f = e.serp_features || {};
  const sig = [];
  const forumsTop5 = org.slice(0, 5).filter((o) => o.page_type === "forum").length;
  const forumsTop10 = org.filter((o) => o.page_type === "forum").length;
  if (forumsTop5 >= 1) sig.push("ugc_top5");
  if (forumsTop10 >= 3) sig.push("ugc_heavy");
  const kwFold = e.fold_key || foldKey(e.keyword);
  if (!org.some((o) => foldKey(o.title || "").includes(kwFold))) sig.push("no_exact_match");
  if (
    org.filter((o) => !(o.snippet || "").trim() || (o.snippet || "").length < 50).length / n >=
    0.3
  )
    sig.push("thin_content");
  const tierA = org.filter((o) => TIER_A_DOMAINS.some((d) => (o.domain || "").endsWith(d))).length;
  if (tierA / n <= 0.2) sig.push("weak_domains");
  if (f.paa >= 3) sig.push("paa_demand");
  // Intent-Mismatch: kommerziell erwartet, aber Top-10 nur informational (oder umgekehrt)
  const txInSerp = f.shopping || f.ads_top >= 2 || org.some((o) => o.page_type === "produkt");
  if (expectedTransactional && !txInSerp) sig.push("intent_mismatch");
  return sig;
}
function gapType(e, sig, coverage) {
  if (e.cluster_id && (e.cluster_shared || false)) return "shared";
  if (sig.includes("no_exact_match")) return "missing";
  if (sig.includes("ugc_top5") || sig.includes("ugc_heavy") || sig.includes("weak_domains"))
    return e.volume_approx ? "untapped" : "weak";
  return e.volume_approx ? "untapped" : "weak";
}

// Buckets in klarer Prioritäts-Reihenfolge (disjunkt ausgewertet, kein Überlappen):
// Skip → Quick-Win → Authority-Builder → Mid-Term. Authority steht VOR Mid-Term, damit
// hochvolumige kommerzielle Keywords nicht fälschlich als Mid-Term durchrutschen.
function bucket(e, T) {
  const d = e.difficulty_proxy,
    v = e.volume_approx,
    rank = e.current_rank;
  const isCommercial = ["commercial", "transactional"].includes(e.serp_intent);
  const strongGap = e.weakness_count >= T.weakness_min && d != null && d <= T.qw_diff;
  // Skip: zu wenig Volumen (Ausnahme: klare, leichte Lücke) …
  if (v == null || v < T.qw_vol) {
    if (!(strongGap && v != null)) return "skip";
  }
  // … oder hart UND geringvolumig.
  if (d != null && d > T.mid_diff && (v == null || v < T.auth_vol)) return "skip";
  // Quick-Win: leicht + genug Volumen + nicht bereits top-rankend.
  if (
    d != null &&
    d <= T.qw_diff &&
    v != null &&
    v >= T.qw_vol &&
    (rank == null || (rank >= 6 && rank <= 20))
  )
    return "quick-win";
  // Authority-Builder: hohes Volumen + kommerziell + NICHT trivial-leicht (Spec §6:
  // Difficulty > qw_diff). Leichte Fälle hat der Quick-Win-Check oben schon gefangen;
  // der Guard verhindert, dass leichte hochvolumige KW mit rank<6 hier fälschlich landen.
  if (v != null && v >= T.auth_vol && isCommercial && (d == null || d > T.qw_diff))
    return "authority-builder";
  // Mid-Term: mittlere Schwierigkeit + echte Lücke.
  if (
    d != null &&
    d <= T.mid_diff &&
    v != null &&
    v >= T.mid_vol &&
    ["missing", "untapped"].includes(e.gap_type)
  )
    return "mid-term";
  return "mid-term";
}

function main() {
  const scope = arg("scope") ? JSON.parse(readFileSync(arg("scope"), "utf8")) : {};
  // Nischenspezifische starke Domains ergänzen (z. B. Vertikal-Spezial-Shops), damit der
  // Difficulty-Proxy/weak_domains sie nicht fälschlich als schwach wertet.
  if (Array.isArray(scope.tier_a_extra)) TIER_A_DOMAINS.push(...scope.tier_a_extra);
  const W = { ...WEIGHTS, ...(scope.weights || {}) };
  const T = { ...THRESHOLDS, ...(scope.thresholds || {}) };
  const src = JSON.parse(readFileSync(arg("in"), "utf8"));
  let entries = src.entries || [];
  const businessRel = scope.business_relevance ?? CFG.businessRelevanceDefault;
  const TX_HINT = new RegExp(CFG.txHintPattern, "i");
  const expectTx = (kw) => TX_HINT.test(kw);

  // CPC-Median je Cluster für Fallback
  const cpcByCluster = {};
  for (const e of entries)
    if (e.cpc_eur != null)
      (cpcByCluster[e.cluster_id] = cpcByCluster[e.cluster_id] || []).push(e.cpc_eur);
  const medianOf = (a) =>
    a && a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null;

  entries = entries.map((e0) => {
    const e = { ...e0 };
    e.difficulty_proxy = difficultyProxy(e);
    const cis = cisScore(e, businessRel);
    e.cis_score = cis.cis;
    e.cis_parts = cis.parts;
    Object.assign(e, pageTypeFromCis(cis.cis, cis.localDominant, e.fold_key || foldKey(e.keyword)));
    // SERP-Intent überstimmt die CIS-Modifier-Schwäche: Feature-Kauf-Keywords ohne
    // explizites Kauf-Wort (z. B. "balkonkraftwerk mit speicher") tragen einen niedrigen CIS,
    // sind laut SERP aber transaktional/commercial → gehören auf eine Vergleichsseite, nicht
    // in einen Ratgeber. Money-Page und Local-Skip bleiben unberührt.
    if (
      ["transactional", "commercial"].includes(e.serp_intent) &&
      (e.page_type === PT.infoType || e.page_type === PT.infoCtaType)
    ) {
      e.page_type = PT.comparisonType;
      e.page_type_cta = false;
      e.page_type_intent_override = true;
    }
    Object.assign(e, aioRisk(e));
    e.adjusted_traffic_approx =
      e.volume_approx != null ? Math.round(e.volume_approx * e.ctr_multiplier) : null;
    e.weakness_signals = weaknessSignals(e, expectTx(e.keyword));
    e.weakness_count = e.weakness_signals.length;
    e.gap_type = gapType(e, e.weakness_signals);
    // CPC-Fallback
    if (e.cpc_eur == null) {
      const m = medianOf(cpcByCluster[e.cluster_id]);
      if (m != null) {
        e.cpc_eur = +m.toFixed(2);
        e.cpc_flag = "cluster_median";
      } else {
        e.cpc_eur = CFG.cpcFloorEur;
        e.cpc_flag = "fallback";
      } // Branchen-Floor aus skill.config.json
    }
    return e;
  });

  // Min-Max-Normalisierung über das Set
  const vols = entries
    .map((e) => e.volume_approx)
    .filter((v) => v != null)
    .map((v) => Math.log10(1 + v));
  const cpcs = entries.map((e) => e.cpc_eur).filter((v) => v != null);
  const range = (arr) => {
    const lo = Math.min(...arr),
      hi = Math.max(...arr);
    return [lo, hi - lo || 1];
  };
  const [vLo, vSpan] = vols.length ? range(vols) : [0, 1];
  const [cLo, cSpan] = cpcs.length ? range(cpcs) : [0, 1];

  for (const e of entries) {
    const nVol = e.volume_approx != null ? (Math.log10(1 + e.volume_approx) - vLo) / vSpan : 0;
    const nCpc = e.cpc_eur != null ? (e.cpc_eur - cLo) / cSpan : 0;
    const serpWeak = clamp01(e.weakness_count / 5);
    const bizRel = businessRel;
    const diff = e.difficulty_proxy ?? 0.5;
    const aioPen = 1 - e.ctr_multiplier;
    const score =
      W.w1 * nVol + W.w2 * nCpc + W.w3 * serpWeak + W.w4 * bizRel - W.w5 * diff - W.w6 * aioPen;
    e.opportunity_score = Math.round(clamp01(score) * 100);
    e.priority_bucket = bucket(e, T);
    e.status = "open";
  }

  entries.sort((a, b) => b.opportunity_score - a.opportunity_score);
  const out = {
    run_id: src.run_id || scope.run_id || null,
    weights: W,
    thresholds: T,
    stats: {
      total: entries.length,
      quickWins: entries.filter((e) => e.priority_bucket === "quick-win").length,
      midTerm: entries.filter((e) => e.priority_bucket === "mid-term").length,
      authority: entries.filter((e) => e.priority_bucket === "authority-builder").length,
      aioHigh: entries.filter((e) => e.aio_risk === "HOCH").length,
      needKeywords: entries.filter((e) => e.weakness_count >= T.weakness_min).length,
    },
    clusters: src.clusters || null,
    entries,
  };
  const outPath = arg("out");
  if (outPath) {
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    process.stderr.write(
      `[score] ${entries.length} Keywords gescored — ${out.stats.quickWins} Quick-Wins, ${out.stats.needKeywords} Need-Keywords (≥${T.weakness_min} Schwäche-Signale) → ${outPath}\n`,
    );
  } else process.stdout.write(JSON.stringify(out, null, 2));
}

main();
