// config.mjs — zentrale projekt-spezifische Konfiguration (Portabilität).
// Lädt `skill.config.json` aus dem Skill-Root, falls vorhanden, und merged sie über die
// eingebauten Defaults. Die verbindliche Projekt-Konfiguration ist skill.config.json —
// sie wird beim Projekt-Setup vom project-setup-Skill befüllt (Platzhalter ersetzt).
// Die Defaults hier sind neutrale DACH-Beispielwerte (example.com), damit die Skripte
// auch ohne Config lauffähig bleiben; für den Produktivbetrieb immer die Config füllen.
// Lauf-spezifische Werte (Nische, Seeds, customer_id, geo-Auswahl) bleiben im
// 00_scope.json — diese Config ist projekt-weit (gilt für alle Läufe).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__dirname, "..", ".."); // scripts/lib → Skill-Root

// ── Eingebaute Defaults (neutral, DACH) ──
const DEFAULTS = {
  mcpServers: { googleAds: "mcpwerk-ads", serpapi: "serpapi", gsc: "mcpwerk-gsc" },
  language: "de",
  defaultGeo: "DE",
  geo: {
    DE: { location_id: 2276, google_domain: "google.de", gl: "de", hl: "de" },
    AT: { location_id: 2040, google_domain: "google.at", gl: "at", hl: "de" },
    CH: { location_id: 2756, google_domain: "google.ch", gl: "ch", hl: "de" },
  },
  selfDomain: "example.com",
  gscSite: "sc-domain:example.com",
  businessRelevanceDefault: 0.6,
  serpCapDefault: 50,
  // Eigen-Coverage-Inventar: Markdown-Datei der Wissensbasis (laut Projekt-CLAUDE.md) +
  // Regex, das die URL-Pfad-Keys zieht.
  seoInventory: {
    path: "wissensbasis/website-struktur.md",
    format: "markdown",
    pathKeyPattern: "[`\"'](/[a-z0-9][a-z0-9\\-/]*)[`\"']",
  },
  // Difficulty-Proxy: starke Marken (Anteil in Top-10). Nischenspezifische Domains über
  // skill.config.json (tierADomains) bzw. pro Lauf über scope.tier_a_extra ergänzen.
  tierADomains: [
    "wikipedia.org",
    "amazon.de",
    "otto.de",
    "ebay.de",
    "idealo.de",
    "check24.de",
    "test.de",
    "stiftung-warentest.de",
    "verbraucherzentrale.de",
    "finanztip.de",
    "chip.de",
    "computerbild.de",
    "t3n.de",
    "spiegel.de",
    "focus.de",
  ],
  // UGC-/Forenerkennung (Schwäche-Doppelsignal). Als Regex-Quelle (String); pro Nische
  // um die Fachforen der Branche erweitern (in skill.config.json).
  ugcHostPattern:
    "(reddit\\.com|gutefrage\\.net|quora\\.com|forum\\.|\\.forumieren\\.|wer-weiss-was|yahoo\\.com/answers)",
  // Kommerzielle/transaktionale Wort-Marker (SERP-TTL, serp_intent-Heuristik, Comparison).
  txHintPattern:
    "(kaufen|bestellen|preis|kosten|günstig|guenstig|test|vergleich|beste|angebot|shop)",
  comparisonPattern:
    "(^|\\s)(test|testsieger|vergleich|vergleichstest|beste[rs]?|top \\d|vs|gegen|alternative[n]?|oder)(\\s|$)",
  cpcFloorEur: 0.1,
  // Seitentyp-Mapping (Taxonomie-Brücke des Projekts): CIS-Schwellen → Seitentypen.
  pageType: {
    infoType: "ratgeber", // CIS 0–thresholds.infoMax
    infoCtaType: "ratgeber", // thresholds.infoMax+1 … thresholds.ctaMax (mit CTA-Box)
    comparisonType: "beratung", // thresholds.ctaMax+1 … thresholds.compMax
    moneyType: "produktbeschreibung", // > thresholds.compMax (money_page-Flag)
    localSkipType: "skip",
    thresholds: { infoMax: 28, ctaMax: 57, compMax: 78 },
  },
  stopwords: [
    "und",
    "oder",
    "der",
    "die",
    "das",
    "den",
    "dem",
    "des",
    "ein",
    "eine",
    "fuer",
    "von",
    "mit",
    "auf",
    "aus",
    "bei",
    "ist",
    "sind",
    "wie",
    "was",
    "wer",
    "wo",
    "man",
    "im",
    "am",
    "zur",
    "zum",
  ],
  modifiersFile: "references/intent-modifiers-de.json",
};

function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (
    over &&
    typeof over === "object" &&
    base &&
    typeof base === "object" &&
    !Array.isArray(base)
  ) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}

let _cfg = null;
export function loadConfig() {
  if (_cfg) return _cfg;
  const path = resolve(SKILL_ROOT, "skill.config.json");
  let user = {};
  if (existsSync(path)) {
    try {
      user = JSON.parse(readFileSync(path, "utf8").replace(/^﻿/, ""));
      delete user._doc;
    } catch (e) {
      process.stderr.write(
        `[config] skill.config.json nicht lesbar (${e.message}) — nutze Defaults.\n`,
      );
    }
  }
  _cfg = deepMerge(DEFAULTS, user);
  _cfg._skillRoot = SKILL_ROOT;
  return _cfg;
}

export function modifiersPath() {
  const cfg = loadConfig();
  return resolve(SKILL_ROOT, cfg.modifiersFile);
}
