# Output-Contract — Artefakt-Schemas & Übergabe

Definiert die JSON-Struktur **jeder** Phase und den Übergabe-Vertrag an die nachgelagerten
Skills. Alle Skripte schreiben gegen dieses Schema; der Report (`06_report.md`) und das
`briefing-seed-<cluster>.json` werden daraus erzeugt.

## Ablage-Konvention

```
seo/keyword-gap/<nische-slug>/
  00_scope.json
  01_seeds.json
  02_metrics.json
  03_serp.json
  04_clusters.json
  05_gaps.json
  06_report.md
  briefing-seed-<cluster-id>.json   # je Top-Cluster eines, Phase 6
tmp/kw-cache/                        # API-Cache (gitignored)
tmp/serp-snapshots/<nische-slug>/    # SerpApi-Rohantworten (gitignored, Forensik)
tmp/kw-gap-state-<nische-slug>.json  # Checkpoint (welche Phase/Batch fertig)
```

`<nische-slug>` = `normalize-de.slugify(scope.niche)`. Outputs nach `seo/` (committet,
wie bei seo-page-research); Cache/Snapshots/State nach `tmp/` (gitignored).

## Resume-Regel (jede Phase idempotent)

Jede Phase prüft: existiert ihr Output-Artefakt **und** ist `scope.run_id` darin identisch?
→ überspringen (Log: „Phase N: Artefakt vorhanden, übersprungen"). `--force` (oder
`FORCE=1`) erzwingt Neuberechnung. `tmp/kw-gap-state-*.json` hält die zuletzt fertige
Phase + Batch-Index für SERP-Budget-Resumes über mehrere Tage.

---

## Kern-Datentyp: `KeywordGapEntry`

Jeder Keyword-Kandidat ist über alle Phasen hinweg dieses Objekt (Felder füllen sich
phasenweise auf; `null` = noch nicht erhoben / keine Daten — **nie `0` als Platzhalter**):

```jsonc
{
  "keyword": "balkonkraftwerk für südbalkon", // Anzeige-Variante (normalize-de.display)
  "fold_key": "balkonkraftwerk fuer suedbalkon", // Match-Key (intern)
  "variants": ["balkonkraftwerk für südbalkon", "..."], // gemergte Schreibvarianten
  "numerus_siblings": ["..."], // verwandte Singular/Plural (NICHT gemergt)
  "sources": ["gkp", "suggest", "paa"], // Herkunfts-Tags, s. u.

  "geo": "DE", // DE | AT | CH (getrennt erhoben)
  "volume_approx": 2900, // GKP, IMMER mit volume_flag
  "volume_flag": "bucket", // "exact" | "bucket" | null(=no-data)
  "competition": "MEDIUM", // LOW|MEDIUM|HIGH|null (GKP)
  "competition_index": 54, // 0–100 | null (GKP)
  "cpc_eur": 2.4, // Top-of-Page-Bid (Mitte low/high) | null
  "cpc_flag": "gkp", // "gkp" | "cluster_median" | "fallback" | null
  "seasonality": null, // IMMER null → GKP-Trend-Endpoint defekt (Datenlücke)

  "intent_class": "Question", // Williams-Cook (8 Klassen)
  "cis_score": 41, // 0–100 (opportunity-scoring §5) | null
  "page_type": "ratgeber", // Typen aus skill.config.json (pageType), z. B. ratgeber | beratung | produktbeschreibung | skip
  "page_type_cta": true, // Ratgeber-mit-CTA-Box (CIS 29–57)

  "serp_features": {
    "aio": true,
    "featured_snippet": false,
    "paa": 4,
    "shopping": false,
    "ads_top": 2,
    "local_pack": false,
    "video": false,
  },
  "aio_risk": "HOCH", // HOCH|MITTEL|NIEDRIG | null
  "aio_cited_self": false, // eigene Domain in AIO-Quellen?
  "ctr_multiplier": 0.28, // 0.28 | 0.62 | 1.0 (opportunity-scoring §4)
  "adjusted_traffic_approx": 812, // volume_approx × ctr_multiplier | null

  "weakness_signals": ["ugc_top10", "thin_content", "no_exact_match"], // serp-weakness-signals.md
  "weakness_count": 3,
  "difficulty_proxy": 0.27, // 0–1 (opportunity-scoring §2) | null
  "kd_tool": null, // externer KD-Wert NUR wenn Tool vorhanden, sonst null

  "current_rank": null, // eigene GSC-Position | null (= nicht rankend / GSC leer)
  "coverage_status": "GAP_NEW", // COVERED|PARTIAL|GAP_WEAK|GAP_NEW (Phase 4)
  "cannibalization": null, // {severity, urls[]} | null

  "cluster_id": 3,
  "gap_type": "untapped", // missing | weak | untapped | shared
  "opportunity_score": 71, // 0–100 (intern, nicht validiert)
  "priority_bucket": "quick-win", // quick-win | mid-term | authority-builder | skip
  "status": "open", // open | briefed | live
}
```

### Enums

- **`sources`**: `gkp` · `gkp_url` (Competitor-URL-Input) · `suggest` · `related_search` ·
  `paa` · `gsc_striking` · `competitor_gap` · `community`.
- **`gap_type`**: `missing` (kein passendes Ergebnis in Top-10) · `weak` (nur schwache/UGC-
  Treffer) · `untapped` (Demand belegt, keine dedizierte Seite) · `shared` (Cluster-URL-Overlap).
- **`coverage_status`**: `COVERED` (lexikalischer Match gegen das URL-Inventar aus
  `skill.config.json` → `seoInventory.path` (Markdown-Datei der Wissensbasis laut CLAUDE.md) —
  Pfad-Segmente + Zeilentext der Seite, nicht nur der URL-Slug — oder GSC-Rank ≤ 10) ·
  `PARTIAL` (Teil-Match: verwandte, nicht dedizierte Seite) ·
  `GAP_WEAK` (GSC-Signal, Position 11–30) · `GAP_NEW` (kein Signal, kein Match → Default, wenn GSC
  leer). Reihenfolge der Bearbeitung: GAP_WEAK vor GAP_NEW.
  **Grenze:** der Markdown-Inventar-Match ist lexikalisch (kein Synonym-/Embedding-Match) — bei
  einer jungen Domain mit wenig Inventar liefert vor allem der GSC-Pfad (`--gsc-raw`) das
  belastbare Signal; die Inventar-Coverage ist der Fallback.

---

## Phasen-Artefakte (Hüllen)

```jsonc
// 00_scope.json
{ "run_id": "<iso-stamp>", "niche": "...", "niche_slug": "...", "goal": "...",
  "geo": ["DE"], "language": "de", "seeds": ["..."], "competitors": ["https://..."],
  "customer_id": "1234567890", "need_keyword_def": "...", "serp_cap": 50, "weights": {…}, "thresholds": {…} }

// 01_seeds.json  { "run_id", "groups": [ <dedupeKeywords-Gruppe> ], "by_source": {gkp:N, suggest:N, …} }
// 02_metrics.json{ "run_id", "entries": [ <KeywordGapEntry, bis intent_class> ] }
// 03_serp.json   { "run_id", "entries": [ <… bis serp_features/aio> ], "serp_calls_used": N, "snapshots_dir": "..." }
// 04_clusters.json{ "run_id", "clusters": [ {id, primary, secondary[], supporting[], intent, page_type, coverage_status} ], "entries":[…] }
// 05_gaps.json   { "run_id", "entries": [ <vollständiger KeywordGapEntry> ], "cannibalization": [...] }
```

---

## Übergabe-Vertrag → `seo-page-research` / `content-cluster-plan`

Pro Top-Cluster schreibt Phase 6 ein **`briefing-seed-<cluster-id>.json`**. Dieses Schema ist
so gewählt, dass es entweder ein künftiger `content-cluster-plan` (Architektur-Ebene) 1:1
einliest **oder** direkt als Seed für `seo-page-research` (Einzelseite) dient — der
`pillar_keyword` wird dort das Phase-1-Topic:

```jsonc
{
  "cluster_id": 3,
  "pillar_keyword": "balkonkraftwerk südbalkon", // → seo-page-research Phase 1 Topic
  "secondary_keywords": ["balkonkraftwerk südseite ertrag", "..."],
  "supporting_terms": ["..."],
  "intent_class": "Question",
  "recommended_page_type": "ratgeber", // Taxonomie-Brücke → article-create-Template
  "page_type_cta": true,
  "competitor_urls": ["https://..."], // Top-Ranker → Phase-2b-Quellen-Sichtung
  "serp_features_present": { "aio": true, "paa": 4, "...": "..." },
  "aio_strategy_required": true, // aus aio_risk == HOCH
  "volume_approx": 2900,
  "volume_flag": "bucket",
  "cpc_eur": 2.4,
  "difficulty_proxy": 0.27,
  "opportunity_score": 71,
  "priority_bucket": "quick-win",
  "gap_rationale": "UGC in Top-5 + kein exakter Treffer; Demand via GKP+PAA belegt",
  "coverage_status": "GAP_NEW",
  "internal_link_targets": [], // aus URL-Inventar/Sitemap (Coverage), wenn vorhanden
  "data_gaps": ["seasonality: GKP-Trend defekt", "current_rank: GSC noch ohne Daten"],
}
```

**Nächster-Schritt-Zeile im Report** (pro Top-Cluster):
`→ /seo-page-research "<pillar_keyword>"  (Briefing-Seed: seo/keyword-gap/<slug>/briefing-seed-<id>.json)`

Die Naht ist **beidseitig**: `seo-page-research` (Phase 0, Schritt 4) prüft beim Start, ob ein
`briefing-seed-<id>.json` zum Topic existiert, und übernimmt dann `pillar_keyword` (= Topic),
`secondary_keywords`, `competitor_urls`, `recommended_page_type`, `serp_features_present` und
`data_gaps` als Vorbefüllung (die Volumina/SERP-Daten werden dort mit frischen Calls verifiziert,
nicht blind übernommen). Pflicht-Stopp: die Gap-Map muss freigegeben sein, bevor der
`seo-page-research`-Lauf startet.

Dieser Skill baut die nachgelagerten Schritte **nicht** nach — er liefert nur diese Map.
