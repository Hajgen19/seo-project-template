# seo-page-research

State-of-the-art SEO-Keywordrecherche auf Seitenebene. Claude Code Skill mit phased Workflow.

## Was dieser Skill macht

Nimmt ein Topic als Input und produziert in 6 Phasen ein publikationsreifes Content-Briefing inkl. Outline. Methodik: SERP-First (Phase 2 nutzt **SerpApi** für echte SERP-Analyse, Playwright nur Fallback), eine eigene **Phase 2b „Quellen-Sichtung"** (Rollen Faktenbasis/SERP-Kontext/Pain-Point-Input), Williams-Cook 8-Klassen-Intent-Taxonomy, SERP-Overlap-Clustering, GSC-basierter Cannibalization-Check, und Princeton-Paper-konforme GEO-Optimierung.

## Voraussetzungen (Template-Setup)

- **Claude Code** (≥ aktuelle Version mit Skill-Support)
- **SerpApi MCP** — für SERP-Analyse (Phase 2) und SERP-Overlap-Clustering (Phase 4). Voraussetzung: serpapi-MCP in der `.mcp.json` des Projekts (eigener Account, URL mit persönlichem Key) — nicht im Template vorkonfiguriert.
- **Google Keyword Planner** über den `mcpwerk-ads`-Server in `.mcp.json` (`mcp__mcpwerk-ads__run_keyword_planner`) — Volume-Daten in Phase 3
- **Google Search Console** über den `mcpwerk-gsc`-Server in `.mcp.json` (`mcp__mcpwerk-gsc__*`) — Cannibalization-Check in Phase 4, Property `[GSC_PROPERTY]`
- **Playwright MCP** (`playwright` in `.mcp.json`, falls konfiguriert) — nur SERP-Fallback, falls SerpApi ausfällt
- **WebFetch/WebSearch** — Quellen-Sichtung (Phase 2b) und Foren-Mining (Phase 1), kostet kein SerpApi-Kontingent

Hinweis: Sind die Google-Server im Projekt anders benannt (z. B. als claude.ai-Connectoren), muss nur der Tool-Präfix angepasst werden — Parameter und Aufrufe bleiben identisch.

## Installation

In Claude Code:
```bash
# Falls als User-Skill (im User-Home)
cp -r seo-page-research/ ~/.claude/skills/

# Falls als Project-Skill (im Repo)
cp -r seo-page-research/ .claude/skills/
```

## Verwendung

Im Claude Code Chat (Beispiel mit dem fiktiven Beispiel-Kunden Sonnenwerk Solar GmbH):
```
Bitte starte eine Keywordrecherche für "Balkonkraftwerk anmelden" —
Domain: sonnenwerk-solar.de, Zielgruppe: Mieter und Eigenheimbesitzer DACH,
Geschäftsziel: Lead-Generierung für die Solaranlagen-Beratung.
```

Claude triggert automatisch den Skill und führt durch die 6 Phasen (Confirmation-Gate nach jeder Phase). Marke, Domain und Property liest der Skill in Phase 0 aus der Projekt-CLAUDE.md.

## Struktur

```
seo-page-research/
├── SKILL.md                              # Hauptdatei (lädt Claude beim Trigger)
├── README.md                             # Diese Datei
├── references/                           # Methodische Tiefen-Refs
│   ├── intent-classes.md                 # 8 Williams-Cook-Klassen + Patterns
│   ├── serp-feature-patterns.md          # SerpApi-Response-Keys + Interpretation (+ Playwright-Fallback)
│   ├── clustering-thresholds.md          # SERP-Overlap-Defaults + Anti-Patterns
│   ├── geo-best-practices.md             # Princeton-Findings + GEO-Pflicht
│   ├── cannibalization-patterns.md       # Konsolidieren-vs-Differenzieren-Logik
│   └── gkp-pitfalls.md                   # GKP-Schwächen + Cross-Validation
└── assets/                               # Output-Templates
    ├── briefing-template.md              # Vollständiges Briefing (Phase 5)
    ├── outline-template.md               # Kompakte Texter-Outline (Phase 5)
    ├── cluster-export-template.csv       # Keyword-Cluster-Sheet (Phase 4)
    ├── serp-snapshot-schema.json         # JSON-Schema für SERP-Rohdaten (Phase 2)
    └── cannibalization-report-template.md  # Cannibalization-Report (Phase 4)
```

## Methodische Basis

- **Williams-Cook Intent-Taxonomy**: 8 refined query semantic classes aus dem Late-2024 Google-API-Leak ($13.337 Bug-Bounty, dokumentiert in Search Engine Land)
- **Princeton GEO Paper** (Aggarwal et al., KDD 2024, arXiv:2311.09735): Empirisch validierte Citation-Lift-Tactics — Quotation +43 %, Statistics +33 %, Cite Sources +28 %
- **Ahrefs GKP-Studie** (n=72.635, 2021): GKP überschätzt Volumes in 91,45 % der Fälle — daher Pflicht-Cross-Validation
- **ConvertMate GEO Benchmark 2026**: 83 % der AI-Overview-Citations kommen von Pages außerhalb der organischen Top-10
- **Kevin Indig** (Growth Memo, März 2026, n=1.2M Citations): Pages >20k Zeichen werden 4,3× häufiger zitiert

## Hinweis

Die 6 Phasen laufen modellgesteuert (SERP-Analyse, Clustering und Intent-Klassifikation macht das Modell anhand der Reference-Files); eigene Auswertungs-Skripte bringt dieser Skill nicht mit. Bei Weitergabe: methodische Quellenangaben in den Reference-Files erhalten.
