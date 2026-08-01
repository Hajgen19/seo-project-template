# SEO Project Template

Vorlage-Repo für SEO-Kundenprojekte mit [Claude Code](https://claude.com/claude-code): **13 vorkonfigurierte Skills** (Setup, Keyword-Discovery, Seitenrecherche, Artikelproduktion, HTML-Formatierung, Meta-Optimierung, interne Verlinkung, GA4-Reporting), ein **automatisches Projektgedächtnis** (Kontext-Wächter-Hooks, Changelog, Handoff, Learnings-Datenbank) und **sofort nutzbare Google-Datenanbindung** über gehostete MCP-Server.

Ein Klon = ein Kundenprojekt. Der `project-setup`-Skill parametrisiert beim ersten Durchlauf alles auf den jeweiligen Kunden.

## Quick Start

```bash
git clone https://github.com/Hajgen19/seo-project-template neuer-kunde
cd neuer-kunde
# Remote vom Template lösen, damit Kundenarbeit nicht zurückfließt:
git remote remove origin
# Optional: eigenes Kunden-Repo anhängen
# git remote add origin <kunden-repo-url>

claude
```

Beim ersten Start fragt Claude Code zweierlei ab – beides ist gewollt:

1. **MCP-Server aktivieren?** Die committete [`.mcp.json`](.mcp.json) bringt vier gehostete Google-Marketing-Server mit (siehe unten). Zustimmen, wenn du GSC/GA4/Ads/GTM-Daten nutzen willst; ablehnen geht auch – alle Content-Skills funktionieren ohne.
2. **Projekt-Settings vertrauen?** [`.claude/settings.json`](.claude/settings.json) verdrahtet die zwei Projektgedächtnis-Hooks (unten erklärt, [Quellcode offen](.claude/hooks/)).

Dann genügt ein Prompt:

```
Lege Projekt für [Kundenname] an
```

`project-setup` fragt Kundendaten und Website-Crawl-CSV ab und baut das komplette Projektgerüst: Ordnerstruktur, projektspezifische CLAUDE.md, Wissensbasis inklusive verbindlicher Stimm-Referenz (`tone-of-voice.md`), parametrisierte Skills, Smoke-Test.

## Voraussetzungen

| Was | Wofür | Pflicht? |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) (CLI, Desktop oder IDE-Extension) | alles | ✓ |
| **Python 3.x** | Word-Export (`pip install python-docx`), Bild-Aufbereitung (`pip install pillow`), Projektgedächtnis-Hooks | ✓ |
| **Node.js ≥ 18** | nur `deep-keyword-gap-research` (deterministische Harvest-/Clustering-/Scoring-Skripte) | optional |
| **SerpApi-Account** (eigener Key) | nur `seo-page-research` + `deep-keyword-gap-research` (SERP-Daten) | optional |
| **ffmpeg** | nur Video-Aufbereitung in `prepare-media.py` | optional |

Für das Setup braucht `project-setup` außerdem eine **CSV mit gecrawltem Website-Content** – wie sie entsteht (Screaming-Frog-Export oder Claude-gestützt aus der Sitemap), beschreibt der Skill selbst im Abschnitt „CSV-Format".

Die Hooks rufen Python als `python` auf. Auf macOS/Linux-Systemen, die nur `python3` kennen: in `.claude/settings.json` an beiden Stellen `"command": "python"` durch `"command": "python3"` ersetzen.

## Google-Daten ohne Setup-Schmerz: mcpwerk

<a href="https://mcpwerk.com"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/mcpwerk-logo-dark.svg">
  <img src="docs/assets/mcpwerk-logo-light.svg" alt="mcpwerk – Google-Marketing-Daten, direkt in Claude" width="64" align="right">
</picture></a>

Die Datenanbindung läuft über die vier gehosteten [**mcpwerk**](https://mcpwerk.com)-Server – Google-Marketing-Daten direkt in Claude, **keine Installation, keine API-Keys, kein OAuth-Client-Gebastel**. Serverstandort Deutschland.

| Server | Daten | Tools |
|---|---|---|
| [`mcpwerk-gsc`](https://mcp.mcpwerk.com/gsc/mcp) | Google Search Console – Rankings, Queries, Indexierung, Sitemaps | 19 |
| [`mcpwerk-ga4`](https://mcp.mcpwerk.com/ga4/mcp) | Google Analytics 4 – Traffic, Conversions, Schlüsselereignisse | 18 |
| [`mcpwerk-ads`](https://mcp.mcpwerk.com/ads/mcp) | Google Ads – inkl. Keyword Planner (echte Suchvolumina) | 16 |
| [`mcpwerk-gtm`](https://mcp.mcpwerk.com/gtm/mcp) | Google Tag Manager – Tags, Trigger, Variablen | 18 |

Alle vier sind in der [`.mcp.json`](.mcp.json) vorkonfiguriert. Beim ersten Öffnen des Projekts fragt Claude Code per Dialog, ob sie aktiviert werden sollen (Opt-in); die Anmeldung am eigenen Google-Konto läuft danach einmalig per OAuth über `/mcp`. Die Skills `ga4-reports`, `seo-page-research`, `deep-keyword-gap-research` und `brand-meta-ctr` greifen direkt auf diese Server zu (Tool-Schema `mcp__mcpwerk-<kürzel>__<tool>`).

## Enthaltene Skills

### Setup & Struktur

| Skill | Zweck | Pflicht? |
|---|---|---|
| **[project-setup](.claude/skills/project-setup/SKILL.md)** | Parametrisiert neue Projekte: Ordnerstruktur, CLAUDE.md (inkl. CMS-Dateiname, CMS-Editor, Marke, Projektgedächtnis), Wissensbasis aus Website-Crawl, `tone-of-voice.md` aus Kundentexten, Platzhalter-Ersetzung in den datenabhängigen Skills. Bleibt nach dem Setup für Nachpflege im Projekt. | ✓ |
| **[article-create](.claude/skills/article-create/SKILL.md)** | Legt Artikel/Seiten in der Pflicht-Struktur `artikel/content/<content-typ>/<slug>/` an – vier Pflichtdateien: `artikel.md`, `seo.md`, `<cms>.html` (Dateiname laut CLAUDE.md), `artikel.docx` (automatischer Word-Export für Kunden-Reviews). Arbeitet Briefing-First, wenn `seo/briefing-<slug>.md` existiert. | ✓ |

### Content-Kette (Recherche → Text → CMS)

| Skill | Zweck | Pflicht? |
|---|---|---|
| **[deep-keyword-gap-research](.claude/skills/deep-keyword-gap-research/SKILL.md)** | Nischenweite Discovery: findet unterbediente „Need Keywords" (Nachfrage belegt, SERP-Angebot schwach) über echte Keyword-Planner-Daten + SERP-Analyse + Overlap-Clustering + transparentes Opportunity-Scoring. Deterministische Node-Skripte machen die Fleißarbeit. Output: priorisierte Cluster-Map + Briefing-Seeds. | optional |
| **[seo-page-research](.claude/skills/seo-page-research/SKILL.md)** | SERP-First-Recherche für EINE Seite in 6 Phasen (inkl. Quellen-Sichtung und GSC-Kannibalisierungs-Check). Output: publikationsreifes Briefing `seo/briefing-<slug>.md`, das `article-create` als verbindliche Quelle liest. | optional |
| **[content-html-formatter](.claude/skills/content-html-formatter/SKILL.md)** | CMS-agnostischer HTML-Formatter: liest die projektspezifischen HTML-Bausteine aus `wissensbasis/html-elemente.md` und verweigert Output, solange die Wissensbasis leer ist (kein erfundenes Fallback-HTML). Inklusive Medien-Workflow über `prepare-media.py` (Quality-Ladder mit Sichtprüfungs-Gate). | optional |
| **[brand-meta-ctr](.claude/skills/brand-meta-ctr/SKILL.md)** | CTR-optimierte Meta-Titles (≤60 Zeichen) und -Descriptions (≤155 Zeichen) im Kunden-Hausstil, bei Live-Seiten mit echter GSC-Query als Keyword-Anker. | optional |
| **[rueckverlinkung](.claude/skills/rueckverlinkung/SKILL.md)** | Nach dem Launch einer neuen Seite: scannt alle Bestandsseiten auf natürliche Textstellen für interne Links AUF die neue Seite. Vorschlags-Gate vor jedem Schreiben, max. 1 Link pro Quellseite, variierte Ankertexte. | optional |

### Daten & Reporting

| Skill | Zweck | Pflicht? |
|---|---|---|
| **[ga4-reports](.claude/skills/ga4-reports/SKILL.md)** | GA4-Reporting über `mcpwerk-ga4` mit voller Nachvollziehbarkeit: Verifikationsblock pro Abfrage, keine Interpretation ohne Datenbasis. | optional |

### Projektgedächtnis & Produktivität

| Skill | Zweck | Pflicht? |
|---|---|---|
| **[handoff](.claude/skills/handoff/SKILL.md)** | `/handoff` verdichtet die laufende Session zu einem Übergabedokument in `tmp/handoff/`, das die nächste Session automatisch einliest. | ✓ |
| **[knowledge-base-entry](.claude/skills/knowledge-base-entry/SKILL.md)** | Strukturierte Learnings-Datenbank (Symptom → Root Cause → Fix → Tags) mit Volltext-Suche. Entsteht beim jeweiligen Nutzer, ist gitignored und wandert nie ins Repo. | ✓ |
| **[grilling](.claude/skills/grilling/SKILL.md)** / **[grill-me](.claude/skills/grill-me/SKILL.md)** | Gnadenloses Frage-für-Frage-Interview zum Härten eines Plans oder Briefings, bevor gebaut wird. | optional |
| **[writing-great-skills](.claude/skills/writing-great-skills/SKILL.md)** | Referenz zum Schreiben eigener Skills (Invocation-Wahl, Informationshierarchie, Pruning, Failure-Modes). | optional |

Nicht benötigte **optionale** Skills können nach dem Setup gelöscht werden. `project-setup`, `article-create`, `handoff` und `knowledge-base-entry` bleiben immer im Projekt (der Kontext-Wächter setzt die letzten beiden voraus).

## Das Projektgedächtnis

Das eigentliche Alleinstellungsmerkmal des Templates: **Projektkontext überlebt Session-Grenzen.** Vier Ablagen mit klarer Arbeitsteilung:

| Ablage | Beantwortet | Lebensdauer | Im Repo? |
|---|---|---|---|
| `changelog/YYYY-MM-DD.md` | Was wurde wann getan? | permanent, append-only | ja |
| `tmp/handoff/` | Wo steht die Arbeit gerade? | eine Session-Grenze | nein (gitignored) |
| `docs/LEARNINGS.md` | Dieses Symptom gab es schon – was war die Ursache? | permanent, Nachschlagewerk | nein (gitignored) |
| `wissensbasis/` | Wer ist der Kunde, wie klingt er? | permanent | ja |

Verdrahtet ist das über zwei Hooks ([Quellcode](.claude/hooks/), reine Python-Standardbibliothek):

- **Kontext-Wächter** (Stop-Hook): misst nach jeder Antwort den *echten* Tokenverbrauch aus dem Session-Transcript. Ab **60 %** des Kontextfensters stößt er einmalig an: Übergabedokument schreiben, Changelog-Tagesdatei nachziehen, Learnings prüfen. Ab **85 %**: Übergabedokument aktualisieren. So ist der Arbeitsstand gesichert, *bevor* Claude Code den Kontext kompaktiert – und nach jeder Kompaktierung sind beide Stufen automatisch wieder scharf.
- **Sessionstart-Hook**: lädt beim Start (und nach `/clear` bzw. einer Kompaktierung) das jüngste Übergabedokument und den Schnell-Lookup-Index der Learnings-Datenbank in den frischen Kontext. Die neue Session weiß sofort, wo die letzte aufgehört hat und welche Probleme schon gelöst wurden.

Das Bezugsfenster ist konfigurierbar (`env.CLAUDE_CONTEXT_WINDOW` in `.claude/settings.json`, Default `200000`; bei 1M-Kontext `1000000` eintragen). Ein manueller Handoff geht jederzeit per `/handoff`.

## Projektkonventionen

Das Repo bringt etablierte Konventionen mit, die `project-setup` in jede neue Projekt-CLAUDE.md übernimmt:

- **Artikel-Ordner:** Je Seite ein Ordner unter `artikel/content/<content-typ>/<slug>/` (Typ-Segmente: `ratgeber`, `beratung`, `produkte`, `kollektionen`, `profile`, `landingpages`) mit den vier Pflichtdateien. Der **Slug** ist der durchgängige Anker über alle Skills der Content-Kette.
- **Taxonomie-Brücke:** übersetzt Such-Intent (SERP-Analyse) → Content-Typ → URL-Pfad → Ordner-Segment, damit Recherche-, Schreib- und Formatier-Skills denselben Typ erwarten.
- **Changelog:** Eine Tagesdatei pro Arbeitstag unter `changelog/YYYY-MM-DD.md`, keine zentrale CHANGELOG.md. Schreibende Skills tragen ihre Ergebnisse selbst ein; der Kontext-Wächter schließt die Lücken.
- **Wissensbasis:** `wissensbasis/*.md` als Single Source of Truth für Kundenkontext. Pflicht-Datei `tone-of-voice.md`: verbindliche Stimm-Referenz, gegen die jeder Text geprüft wird (verhindert Generic-AI-Drift).
- **Schreibregeln:** Deutsche Umlaute in aller Prosa, konsistente Markennamen-Schreibweise, sparsame Em-Dashes, keine Kausal-Spekulation in Reports.

Ein vollständig ausgefülltes Beispiel einer Projekt-CLAUDE.md (fiktiver Kunde „Sonnenwerk Solar GmbH") liegt unter [`CLAUDE-referenz.md`](.claude/skills/project-setup/references/CLAUDE-referenz.md).

## Struktur

```
./
├── .claude/
│   ├── hooks/                           # Kontext-Wächter + Sessionstart (Python)
│   ├── settings.json                    # Hook-Verdrahtung, CLAUDE_CONTEXT_WINDOW
│   └── skills/                          # die 13 Skills (siehe Tabellen oben)
├── docs/
│   └── assets/                          # mcpwerk-Logos für diese README
├── .gitignore                           # hält tmp/, Learnings-DB u.a. lokal
├── .mcp.json                            # 4 gehostete mcpwerk-Server (Opt-in)
├── CLAUDE.md                            # Arbeitsanweisung – wird beim Setup ersetzt
└── README.md                            # diese Datei – wird beim Setup ersetzt
```

Nach dem `project-setup`-Lauf kommen die Arbeitsordner hinzu (`wissensbasis/`, `artikel/content/`, `seo/`, `berichte/`, `changelog/`, `quelldateien/`, `tmp/`), und CLAUDE.md + README werden durch die projektspezifischen Fassungen ersetzt.

## Weiterentwicklung

Wenn du an einem Skill etwas änderst, das auch für zukünftige Projekte relevant ist: zurück ins Template-Repo einpflegen. Prüfe dabei, ob die Änderung auch in die [Referenz-CLAUDE.md](.claude/skills/project-setup/references/CLAUDE-referenz.md) oder den [`project-setup`](.claude/skills/project-setup/SKILL.md)-Skill gehört, damit die Skills nicht driften. Es gibt genau 7 Setup-Platzhalter (Whitelist in `project-setup`) – neue Platzhalter nur einführen, wenn Laufzeit-Lesen aus der CLAUDE.md nicht reicht.
