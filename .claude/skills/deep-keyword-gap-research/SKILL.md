---
name: deep-keyword-gap-research
description: |
  Datengetriebene, NISCHENWEITE Keyword-Gap-/Need-Keyword-Recherche fuer [KUNDENNAME] ([WEBSITE_DOMAIN], de-DE).
  Findet "Need Keywords" — Suchbegriffe mit belegter Nachfrage, deren SERP-Angebot
  schwach oder am Intent vorbei ist (unterbediente Luecken). Kombiniert echte Google-Ads-
  Keyword-Planner-Daten mit SerpApi-SERP-Analyse, SERP-Overlap-Clustering und einem
  transparenten Opportunity-Scoring zu einer priorisierten Keyword-/Cluster-Map.
  Use this skill whenever the user wants niche-wide keyword discovery, gap analysis,
  or to find underserved keywords. Triggers: "Keyword-Gap-Analyse", "Need Keywords finden",
  "nischenweite Keywordrecherche", "unterbediente Keywords", "Marktluecken Keywords", "Content-Gap",
  "deep keyword research", "keyword gap", "find underserved keywords", "niche keyword map".
  Abgrenzung: NICHT fuer Einzelseiten-Briefings (→ seo-page-research) und NICHT fuer den
  Code-Einbau (→ article-create). Dieser Skill liefert die Discovery-/Gap-EBENE DAVOR;
  sein Output ist der Input fuer seo-page-research.
allowed-tools:
  - mcp__serpapi__search
  - mcp__mcpwerk-ads__run_keyword_planner
  - mcp__mcpwerk-ads__list_accounts
  - mcp__mcpwerk-gsc__get_search_analytics
  - mcp__mcpwerk-gsc__get_search_by_page_query
  - mcp__mcpwerk-gsc__list_properties
  - mcp__playwright__*
  - Bash
  - Read
  - Write
  - WebSearch
  - WebFetch
---

# Deep Keyword Gap Research — nischenweite Need-Keyword-Discovery

Findet auf **Nischen-Ebene** unterbediente Keywords und bündelt sie zu einer priorisierten,
gap-bewerteten Keyword-/Cluster-Map. Arbeitet in **7 Phasen mit Confirmation-Gates**;
jede Phase ist **resumebar** (Artefakt vorhanden → überspringen). Headless **und**
interaktiv lauffähig.

## Verhältnis zu den bestehenden Skills (keine Doppelung)

| Ebene                             | Skill                                                       | Output                                             |
| --------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| **Discovery / Gap (nischenweit)** | **dieser Skill**                                            | priorisierte Keyword-/Cluster-Map + Briefing-Seeds |
| Architektur (Cluster→Seiten)      | content-cluster-plan _(noch nicht gebaut — Contract steht)_ | Seiten-Architektur                                 |
| Einzelseite                       | `seo-page-research`                                         | publikationsreifes Briefing                        |
| Code-Einbau                       | `article-create`                                            | Artikel-Dateien (`artikel/content/<content-typ>/<slug>/`)        |

Dieser Skill baut die nachgelagerten Schritte **nicht** nach. Er übergibt pro Top-Cluster
ein `briefing-seed-<id>.json` (Schema: `references/output-contract.md`).

## Kernprinzipien

1. **Echte Daten oder „n/a".** Volumen/Wettbewerb/CPC IMMER aus dem Keyword Planner — nie
   schätzen. Fehlt ein Wert: `n/a` + Flag, nie `0`. (Projektregel: belegbare Fakten, nicht raten.)
2. **SerpApi-first.** SERP/PAA/AIO über SerpApi; Playwright nur manueller Notnagel (Google
   blockt direkte Scrapes häufig per reCAPTCHA).
3. **Fleißarbeit in Skripten, nicht im Modell.** Harvest, GKP-Batches, SERP-Fetch, Clustering
   und Scoring laufen als deterministische Node-Skripte (0 Token). Das Modell macht nur:
   Scope-Dialog, Urteile an Gates, optionale Graubereich-Intent-Verfeinerung, Report-Narrativ.
4. **Transparentes, justierbares Scoring.** Jede Zahl ist in `references/opportunity-scoring.md`
   begründet und über `scope.weights`/`scope.thresholds` überschreibbar. Heuristiken sind als
   solche annotiert (keine Folklore als Fakt — KGR/Information-Gain bewusst verworfen).

## Voraussetzungen & MCP-Weiche

Das Template liefert die gehosteten mcpwerk-Server (`mcpwerk-ads`, `mcpwerk-gsc`, `mcpwerk-ga4`,
`mcpwerk-gtm`) in der `.mcp.json`; die Tool-Präfixe lauten entsprechend `mcp__mcpwerk-ads__…`
und `mcp__mcpwerk-gsc__…`. Sind die Server im Projekt anders benannt (z. B. claude.ai-Connectoren),
muss nur der Tool-Präfix angepasst werden — Ablauf und Skripte bleiben gleich.
**Voraussetzung SERP:** serpapi-MCP in der `.mcp.json` des Projekts (eigener Account, URL mit
persönlichem Key) — SerpApi ist im Template NICHT vorkonfiguriert.

Die Ads-/GSC-Daten laufen im Standard-Workflow im **BYO-JSON-Modus**: das Modell zieht die
Rohdaten über die MCP-Tools, die Skripte verarbeiten sie deterministisch weiter.

| Datenquelle | Wer ruft auf | Wie |
|---|---|---|
| **SERP** (`serp-fetch.mjs`, Phase 3) | Skript direkt | via `scripts/lib/mcp.mjs` → `.mcp.json`-Server `serpapi` (läuft headless) |
| **Suggest** (`suggest-harvest.mjs`, Phase 1) | Skript direkt | freier Google-Autocomplete-Endpoint, kein Key |
| **Keyword Planner** (Phase 2) | **Modell** zieht, Skript verarbeitet | Modell ruft `mcp__mcpwerk-ads__run_keyword_planner` → schreibt `tmp/kw-planner-raw.json` → `kw-enrich.mjs --raw` |
| **GSC** (Phase 4) | **Modell** zieht, Skript verarbeitet | Modell ruft `mcp__mcpwerk-gsc__get_search_analytics` (Property [GSC_PROPERTY]) → schreibt `tmp/gsc-raw.json` → `coverage-gsc.mjs --gsc-raw` |
| **Clustering/Scoring** (Phase 4/5) | Skript direkt | reine Berechnung auf lokalen JSONs, kein MCP |

- **customer_id** via `mcp__mcpwerk-ads__list_accounts` (10-stellig, ohne Bindestriche) ermitteln und ins `00_scope.json` schreiben.
- **SerpApi-Kontingent** → hartes Lauf-Cap (Default 50, `scope.serp_cap` / env `SERP_RUN_CAP` / `skill.config.json` `serpCapDefault`). Große Nischen über mehrere Tage via Cache-Resume (s. u.).
- **GSC-Pfad** liefert echte current_rank-/Kannibalisierungs-Daten nur bei indexierter Domain mit Suchtraffic. Fehlt das GSC-Signal (junge Domain, neue Nische), fällt Coverage automatisch auf das Markdown-URL-Inventar der Wissensbasis zurück (Datei laut CLAUDE.md, Pfad in `skill.config.json` → `seoInventory.path`; Ergebnis dann meist `GAP_NEW` — für junge Marken erwartbar).
- **Voraussetzung Nutzung:** Ads- und GSC-MCP verbunden; `serpapi` in der `.mcp.json` geladen (Claude Code neu gestartet).

## Projekt-Anpassung (config-getrieben)

Der Skill ist **self-contained**; alle Projekt-Kopplungen laufen über `skill.config.json`:

1. **`skill.config.json`** ist die einzige Stelle mit projekt-/sprach-spezifischen Werten:
   MCP-Server-Namen, Sprache/Geo, `tierADomains`, `ugcHostPattern`, `txHintPattern`,
   `comparisonPattern`, `pageType`-Mapping (Taxonomie-Brücke), `seoInventory` (Pfad + Regex
   des URL-Inventars), `selfDomain`/`gscSite`, `stopwords`, `cpcFloorEur`. Die Platzhalter
   in eckigen Klammern ([WEBSITE_DOMAIN], [GSC_PROPERTY], [NISCHE], [WEBSITE_STRUKTUR_PFAD])
   ersetzt der `project-setup`-Skill beim Setup.
2. Fehlt die Datei, greifen neutrale DACH-Defaults aus `scripts/lib/config.mjs`
   (example.com) — für den Produktivbetrieb immer die Config füllen.
3. `tierADomains` und `ugcHostPattern` pro Nische erweitern (siehe `opportunity-scoring.md` §2).
   Für **nicht-deutsche** Nischen zusätzlich `references/intent-modifiers-de.json` durch eine
   sprachpassende Modifier-Datei ersetzen und in `skill.config.json` (`modifiersFile`) verweisen.
4. `.mcp.json` des Projekts mit den passenden Server-Namen bereitstellen (serpapi selbst ergänzen).

Die Skript-Dateien selbst bleiben **unverändert** — sie lesen alle Projektwerte aus der Config.

## Modi

- **Interaktiv (Default):** Confirmation-Gate nach jeder Phase. Niemals ohne Bestätigung
  zur nächsten Phase springen.
- **Headless (`AUTO=1` in der Umgebung ODER `claude -p`):** Gates werden automatisch
  bestätigt, alle Artefakte durchgeschrieben, am Ende der Report ausgegeben.
- **Resume:** Existiert ein Phasen-Artefakt mit identischem `run_id`, Phase überspringen
  (`FORCE=1` erzwingt Neuberechnung). SERP-Budget-Resume: ein erneuter `serp-fetch`-Lauf
  holt gecachte SERPs gratis aus `tmp/kw-cache/`, nur neue kosten Budget.

`<P>` = `.claude/skills/deep-keyword-gap-research/scripts` · `<D>` = `seo/keyword-gap/<niche-slug>`

---

## Phase 0 — Scope & Seeds (Gate)

Projekt-`CLAUDE.md` lesen (Marke, Domain, Taxonomie-Brücke). Dann mit dem User klären und
`<D>/00_scope.json` schreiben (Schema: `assets/scope-schema.json`):
Nische · Geschäftsziel · Geo (Default `["DE"]`) · 5–15 Seeds · 3–8 Wettbewerber-URLs ·
`customer_id` · Need-Keyword-Definition · `business_relevance`. `run_id` = aktueller
ISO-Zeitstempel (das Modell setzt ihn — Skripte dürfen kein Datum erzeugen). `niche_slug`
= `slugify(niche)`.

**Gate:** Scope vorlegen, bestätigen lassen.

## Phase 1 — Seed-Harvest (Multi-Source)

Reihenfolge nach Kosten/Yield (Details: `references/seed-sources-de.md`):

```bash
# Alphabet-Soup (frei, kein Key)
node <P>/suggest-harvest.mjs --scope <D>/00_scope.json --out <D>/01_suggest.json
```

- **Community-Mining (Modell, WebSearch):** `site:`-Queries auf die Community-Quellen der
  Nische — Basis `site:gutefrage.net <topic>` und Reddit-DE, plus die in Phase 0 ermittelten
  Fachforen (Beispiel Solaranlagen: `site:photovoltaikforum.com <topic>`) — nur Themen/Wording
  sammeln, NIE Texte.
- **Related/PAA:** kommen als Nebenprodukt aus Phase 3 (`bonus_seeds`, `paa_questions`) und
  können optional in einer zweiten Iteration zurückgespeist werden.

Alle Quellen + die Seeds zu `<D>/01_seeds.json` mergen (`dedupeKeywords`-Format; das Modell
fügt die WebSearch-Funde mit `source:"community"` hinzu). **Gate:** Quellen-Statistik + Stichprobe zeigen.

## Phase 2 — Metriken-Anreicherung (Keyword Planner, BYO-JSON)

1. **Modell zieht die Rohdaten** über den Ads-MCP (Skript kann Session-Tools nicht selbst rufen):
   - `customer_id` via `mcp__mcpwerk-ads__list_accounts` (falls nicht im `00_scope.json`).
   - Für die Seed-Batches und je Competitor-URL (`page_url`) `run_keyword_planner` mit
     `geo_target_ids:["2276"]`, `language_id:"1001"` aufrufen.
   - Ergebnisse nach `tmp/kw-planner-raw.json` schreiben:
     `{ "geo":"DE", "batches":[ {"source":"gkp","rows":[…]}, {"source":"competitor_gap","url":"…","rows":[…]} ] }`
2. **Skript verarbeitet deterministisch:**

```bash
node <P>/kw-enrich.mjs --raw tmp/kw-planner-raw.json --in <D>/01_seeds.json --scope <D>/00_scope.json --out <D>/02_metrics.json
```

Liefert Volumen (`≈`, gebucketet), Competition, CPC-Proxy und mergt neue GKP-Ideen
(`source:"gkp"`/`"competitor_gap"`). Saisonalität i. d. R. `null` (nur falls der Trend-Endpoint
liefert — sonst ehrliche Datenlücke). **Gate:** Top-20 nach Volumen + No-Data-Quote zeigen;
manuelles Entfernen von Brand-/Irrelevant-Keywords anbieten.

## Phase 3 — SERP-Analyse (Budget-begrenzt)

```bash
node <P>/serp-fetch.mjs --in <D>/02_metrics.json --scope <D>/00_scope.json --top 40 --out <D>/03_serp.json
```

SERP-Features, Organic-Top-10 + Content-Typ, **AIO-Detection**, Related/PAA-Bonus-Seeds.
Nur die `--top N` volumenstärksten Keywords werden ge-SERP-t (Budget-Schutz); Rest läuft
nur auf GKP+Suggest. Bei `budget_exhausted: true` → Checkpoint, Resume an anderem Tag.
**Gate:** verbrauchte Calls, AIO-Quote, auffällige UGC-SERPs zeigen.

## Phase 4 — Clustering & Coverage

1. **Clustering (Skript, reine Berechnung):**

```bash
node <P>/cluster-overlap.mjs --in <D>/03_serp.json --scope <D>/00_scope.json --out <D>/04_clusters.json
```

2. **GSC-Coverage (BYO-JSON):** Das **Modell** zieht die GSC-Daten für die Property
   [GSC_PROPERTY] (`mcp__mcpwerk-gsc__get_search_analytics`, Dimensionen
   `query` + `page`, ~90 Tage) und schreibt die Rows nach `tmp/gsc-raw.json`
   (`{ "rows":[…] }` oder flaches Array). Dann:

```bash
node <P>/coverage-gsc.mjs --in <D>/04_clusters.json --scope <D>/00_scope.json --gsc-raw tmp/gsc-raw.json --out <D>/04_clusters.json
```

Ohne `--gsc-raw` (oder leere GSC-Daten) fällt Coverage automatisch auf das Markdown-URL-Inventar
der Wissensbasis zurück (Pfad aus `skill.config.json` → `seoInventory.path`).

SERP-Overlap-Cluster (Default 30 %, teilt Methodik mit `seo-page-research/references/clustering-thresholds.md`) plus nischenweiter Eigen-Coverage-Abgleich (`COVERED/PARTIAL/GAP_WEAK/GAP_NEW`) und Kannibalisierung.

- **Abgleich gegen bestehende Content-Ownership (falls vorhanden):** Führt das Projekt eine
  Ownership-Map (z. B. `seo/content-ownership-map.md`), neue Gap-Cluster dagegen prüfen —
  bestehende Keyword-Cluster dürfen nicht neu kannibalisiert werden.
- **Manuelles Review-Gate (Pflicht):** Konsolidierungs-Empfehlungen sind Discovery-Signale, keine
  Auto-Aktion — vor Umsetzung prüfen. **Gate:** Cluster-Liste + Coverage-Statistik zeigen.

## Phase 5 — Gap-Scoring

```bash
node <P>/score.mjs --in <D>/04_clusters.json --scope <D>/00_scope.json --out <D>/05_gaps.json
```

Difficulty-Proxy (§2) · Commercial-Intent-Score→Seitentyp (§5) · AIO-Risk + adjustierte
Traffic-Projektion (§4) · SERP-Schwäche → Gap-Typ (§3) · Opportunity-Score + Bucket (§1/§6).
Rein deterministisch. **Optionale LLM-Verfeinerung:** für Keywords mit CIS-Rohsumme im
Graubereich kann das Modell die Intent-Faktoren mit einem Haiku-Aufruf nachschärfen (nicht
Pflicht). **Gate:** Quick-Wins + Need-Keyword-Zahl zeigen.

## Phase 6 — Report & Übergabe

Das Modell füllt `assets/report-template.md` aus `05_gaps.json` → `<D>/06_report.md`
(Disclaimer-Header ist Pflicht). Pro Top-Cluster ein `<D>/briefing-seed-<cluster-id>.json`
(Schema: `references/output-contract.md`). Je Top-Cluster die Nächster-Schritt-Zeile:
`→ /seo-page-research "<pillar_keyword>"  (Seed: <D>/briefing-seed-<id>.json)`.

**Abschluss-Gate:** Report-Pfad + Top-5-Need-Keywords + Quick-Win-Liste nennen.

---

## Error-Recovery

- **Keyword Planner nicht erreichbar:** `kw-enrich` flaggt den Batch und läuft weiter
  (Phase nicht abbrechen). Bei Total-Ausfall: User um CSV bitten ODER nur mit SERP-Overlap
  - Suggest weiter (kein Volumen, aber Clustering/Gap möglich).
- **SERP-Budget erschöpft (`SERP_BUDGET_EXHAUSTED`):** Checkpoint ist geschrieben; an einem
  anderen Tag erneut `serp-fetch` laufen lassen — Cache liefert die alten gratis.
- **Suggest-Soft-Block:** `suggest-harvest` macht 60 s Backoff + 1 Retry, überspringt sonst.
- **GSC leer/nicht erreichbar (kein `--gsc-raw`):** `coverage-gsc` fällt automatisch auf die
  Markdown-Inventar-Lexikal-Coverage zurück (Pfad aus `skill.config.json` →
  `seoInventory.path`; Modus im Output dokumentiert).

## Hard Stops

- Phase 2 liefert < 30 Kandidaten → Nische zu eng; breiter fassen.
- Phase 4: alle Top-Cluster `COVERED` → keine Lücke; bestehende Seiten optimieren statt neue.

## Reference-Files (bei Bedarf laden)

| File                                                     | Phase | Inhalt                                            |
| -------------------------------------------------------- | ----- | ------------------------------------------------- |
| `references/seed-sources-de.md`                          | 1     | 7-Quellen-Harvest + DACH-Community-Map            |
| `references/dach-normalization.md`                       | 1–4   | Umlaut/Komposita/Numerus/AT-CH/Geo-IDs            |
| `references/opportunity-scoring.md`                      | 5     | **alle** Formeln/Gewichte/Schwellen + Verworfenes |
| `references/serp-weakness-signals.md`                    | 5     | Schwäche-Signal-Katalog + Gap-Typen               |
| `references/aio-keyword-screening.md`                    | 3,5   | AIO-Risk + Traffic-Multiplikatoren + Quellen      |
| `references/output-contract.md`                          | alle  | Artefakt-Schemas + Übergabe-Vertrag               |
| `references/intent-modifiers-de.json`                    | 1,5   | DE-Fragewörter + kommerzielle Modifier            |
| `assets/report-template.md` · `assets/scope-schema.json` | 0,6   | Skelette                                          |

## Beispielaufruf

Beispiel-Kunde des Templates: Sonnenwerk Solar GmbH (sonnenwerk-solar.de, Solaranlagen).

```
User: "Mach eine Keyword-Gap-Analyse für die Nische Balkonkraftwerk, Ziel Deutschland."
→ Phase 0: Scope klären + 00_scope.json schreiben → Gate
→ Phasen 1–6 mit Gates; Headless mit AUTO=1 ohne Gates.
→ Ergebnis: seo/keyword-gap/balkonkraftwerk/06_report.md + briefing-seed-*.json
→ Nächster Schritt je Top-Cluster: /seo-page-research "<pillar_keyword>" (liest den Briefing-Seed)
```
