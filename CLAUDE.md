# CLAUDE.md – Vorlage-Repo für SEO-Kundenprojekte

Dieses Verzeichnis ist **noch kein Kundenprojekt**, sondern der **Startpunkt eines frisch aus dem Vorlage-Repo gezogenen Projekts**. Es enthält bereits die komplette Skill-, Hook- und MCP-Infrastruktur, aber noch keine Kundendaten.

Diese CLAUDE.md wird beim ersten Durchlauf von [`project-setup`](.claude/skills/project-setup/SKILL.md) durch die projektspezifische Variante ersetzt (Vorlage für die neue Fassung: [`CLAUDE-referenz.md`](.claude/skills/project-setup/references/CLAUDE-referenz.md)).

## Workflow

1. **Vorlage-Repo klonen:** `git clone <repo-url> neuer-kunde/`
2. **In den Ordner wechseln** und Claude Code starten. Beim ersten Öffnen fragt Claude Code, ob die MCP-Server aus der [`.mcp.json`](.mcp.json) aktiviert werden sollen (Opt-in, siehe „MCP-Konfiguration").
3. **User-Prompt:** „Lege Projekt für [Kundenname] an" (oder vergleichbar) → triggert den [`project-setup`](.claude/skills/project-setup/SKILL.md)-Skill
4. `project-setup` fragt die Kundendaten ab (inkl. **CMS-Dateiname** und **CMS-Editor**) und arbeitet **in-place** in diesem Verzeichnis:
   - Legt Ordnerstruktur an (`wissensbasis/`, `artikel/content/`, `berichte/`, `seo/`, `changelog/`, `quelldateien/`, `tmp/`)
   - Erzeugt projektspezifische CLAUDE.md (ersetzt diese hier) – inkl. Pflichtzeilen `**Marke:**`, `**CMS-Dateiname:**`, `**CMS-Editor:**` sowie der Sektionen „Projektgedächtnis" und „MCP-Konfiguration"
   - Ersetzt die Vorlage-README durch eine schlanke Projekt-README
   - Generiert Wissensbasis aus der CSV (Unternehmen, Leistungen, Website-Struktur, Design), legt `wissensbasis/website-struktur.md` an
   - Erstellt **`wissensbasis/tone-of-voice.md`** aus den persönlichsten Kundentexten – verbindliche Stimm-Referenz für alle späteren Schreibvorgänge
   - Parametrisiert die datenabhängigen Skills in-place (7-Platzhalter-Whitelist, siehe `project-setup` Schritt „Skill-Vorlagen parametrisieren")
   - Erinnert daran, `wissensbasis/html-elemente.md` mit CMS-Snippets zu füllen
   - Smoke-Test mit `article-create` (vier Pflichtdateien, korrekter CMS-Dateiname, DOCX-Deckblatt)
   - Läuft durch die QA-Checkliste
5. **Danach:** normaler Content-Workflow entlang der Kette

```
deep-keyword-gap-research  →  seo-page-research      →  article-create           →  content-html-formatter
Nischen-Gap-Map               Recherche + Briefing      4 Pflichtdateien             <cms>.html (CMS-fertig)
seo/keyword-gap/<nische>/     seo/briefing-<slug>.md    artikel/content/<typ>/<slug>/
```

Die Recherche-Stufen sind optional: `article-create` funktioniert auch ohne Briefing (Templates + [TODO]-Marker). Nach dem Launch einer Seite zieht `rueckverlinkung` die Bestandsverlinkung nach; `brand-meta-ctr` schärft Meta-Tags on demand.

## Skills im Vorlage-Repo

| Skill | Rolle | Parametrisierung |
|---|---|---|
| [`project-setup`](.claude/skills/project-setup/SKILL.md) | **Werkzeug** – parametrisiert das Projekt, bleibt danach für Nachpflege/QA liegen. | – |
| [`article-create`](.claude/skills/article-create/SKILL.md) | **Pflicht.** Artikel in der Vier-Dateien-Struktur unter `artikel/content/<content-typ>/<slug>/`. Briefing-First, Autoren aus `wissensbasis/autoren/`. | keine – liest alles zur Laufzeit aus CLAUDE.md/Wissensbasis |
| [`content-html-formatter`](.claude/skills/content-html-formatter/SKILL.md) | Vorlage – CMS-agnostisch, Bausteine aus `wissensbasis/html-elemente.md`, Medien via `prepare-media.py` (Quality-Ladder). Verweigert Output bei leerer Wissensbasis. | keine – Laufzeit |
| [`ga4-reports`](.claude/skills/ga4-reports/SKILL.md) | Vorlage – faktenbasiertes GA4-Reporting über `mcpwerk-ga4`. | `[PROPERTY_ID]`, `[WEBSITE_DOMAIN]`, `[KUNDENNAME]`, `[STAND_DATUM]` |
| [`seo-page-research`](.claude/skills/seo-page-research/SKILL.md) | Vorlage – 6-Phasen-Recherche (SERP-First) für EINE Seite, Output `seo/briefing-<slug>.md`. Braucht SerpApi (eigener Key). | `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]` |
| [`deep-keyword-gap-research`](.claude/skills/deep-keyword-gap-research/SKILL.md) | Vorlage – nischenweite Need-Keyword-Discovery (7 Phasen, Node-Skripte), Output `seo/keyword-gap/<nische>/`. Braucht SerpApi. | `[KUNDENNAME]`, `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]`, `[NISCHE]`, `[WEBSITE_STRUKTUR_PFAD]` |
| [`brand-meta-ctr`](.claude/skills/brand-meta-ctr/SKILL.md) | Vorlage – CTR-Meta-Tags im Kunden-Hausstil (Glyph-System als Default). | `[KUNDENNAME]`, `[GSC_PROPERTY]`, `[WEBSITE_DOMAIN]` |
| [`rueckverlinkung`](.claude/skills/rueckverlinkung/SKILL.md) | Vorlage – rückwirkende interne Verlinkung auf eine neue Zielseite, mit Vorschlags-Gate. | `[KUNDENNAME]` |
| [`handoff`](.claude/skills/handoff/SKILL.md) | **Pflicht** – manuelle Session-Übergabe nach `tmp/handoff/` (Teil des Projektgedächtnisses). | – |
| [`knowledge-base-entry`](.claude/skills/knowledge-base-entry/SKILL.md) | **Pflicht** – strukturierte Learnings-Datenbank; der Kontext-Wächter verweist auf diesen Skill. | – |
| [`grilling`](.claude/skills/grilling/SKILL.md) / [`grill-me`](.claude/skills/grill-me/SKILL.md) | Optional – gnadenloses Interview zum Härten von Plänen/Briefings. | – |
| [`writing-great-skills`](.claude/skills/writing-great-skills/SKILL.md) | Optional – Referenz zum Schreiben eigener Skills. | – |

Nicht benötigte **optionale** Skills können nach dem Setup gelöscht werden. `project-setup`, `article-create`, `handoff` und `knowledge-base-entry` bleiben in jedem Projekt.

## Python-Abhängigkeit

**Python 3.x** ist Voraussetzung – dreifach genutzt: `create-docx.py` (`pip install python-docx`, Word-Export pro Artikel), `prepare-media.py` (`pip install pillow`, Bild-Aufbereitung), und die beiden Hooks in `.claude/hooks/`. Ohne Python schlägt der DOCX-Schritt in `article-create` fehl und das Projektgedächtnis-Sicherheitsnetz bleibt aus (nicht blockierende Warnung, Session läuft normal).

## MCP-Konfiguration

Die Google-Datenanbindung läuft über die vier gehosteten [mcpwerk](https://mcpwerk.com)-Server, vorkonfiguriert in der committeten [`.mcp.json`](.mcp.json):

| Server | URL | Daten |
|---|---|---|
| `mcpwerk-gsc` | `https://mcp.mcpwerk.com/gsc/mcp` | Google Search Console |
| `mcpwerk-ga4` | `https://mcp.mcpwerk.com/ga4/mcp` | Google Analytics 4 |
| `mcpwerk-ads` | `https://mcp.mcpwerk.com/ads/mcp` | Google Ads (inkl. Keyword Planner) |
| `mcpwerk-gtm` | `https://mcp.mcpwerk.com/gtm/mcp` | Google Tag Manager |

Keine lokale Installation, keine API-Keys: Beim ersten Öffnen des Projekts fragt Claude Code, ob die Server aus der `.mcp.json` aktiviert werden sollen (Opt-in). Die Anmeldung beim jeweiligen Google-Konto läuft danach per OAuth über `/mcp`. Wer die Server nicht nutzen will, lehnt den Dialog einfach ab – alle Content-Skills funktionieren auch ohne.

MCP-Tool-Namen in den Skills folgen dem Schema `mcp__<servername>__<tool>`, z. B. `mcp__mcpwerk-ga4__get_ga4_data`. Wer stattdessen eigene MCP-Server oder claude.ai-Connectoren nutzt, muss die Server- bzw. Präfix-Namen in den betroffenen Skills anpassen.

**SerpApi** (für `seo-page-research` und `deep-keyword-gap-research`) ist bewusst NICHT vorkonfiguriert – jeder Nutzer braucht einen eigenen Account und trägt den serpapi-Server mit seiner persönlichen Key-URL selbst in die `.mcp.json` ein.

## Projektgedächtnis

Das Template hält Projektwissen auf vier Ebenen fest. Jede beantwortet eine andere Frage:

| Ablage | Beantwortet | Lebensdauer | Im Repo? |
|---|---|---|---|
| `changelog/YYYY-MM-DD.md` | Was wurde wann getan? | permanent, append-only | ja |
| `tmp/handoff/` | Wo steht die Arbeit gerade? | eine Session-Grenze | nein (gitignored) |
| `docs/LEARNINGS.md` | Dieses Symptom gab es schon – was war die Ursache? | permanent, wird nachgeschlagen | nein (gitignored) |
| `wissensbasis/` | Wer ist der Kunde, wie klingt er? | permanent | ja (im Kundenprojekt) |

Faustregel bei der Zuordnung: **Interessiert es in einem Jahr noch jemanden → Changelog. Interessiert es nur die nächste Session → Handoff. Ist es ein gelöstes technisches Problem → Learnings.**

### Kontext-Wächter (automatisch)

Zwei Hooks in [`.claude/settings.json`](.claude/settings.json) verdrahten das Gedächtnis mit dem Session-Lebenszyklus:

- **Stop-Hook** ([`context_guard.py`](.claude/hooks/context_guard.py)): Misst nach jeder Antwort den Kontextverbrauch anhand der echten Token-Zahlen aus dem Transcript. Ab **60 %** stößt er einmalig an: Handoff schreiben, Changelog nachziehen, Learnings prüfen. Ab **85 %** einmalig: Handoff aktualisieren. Nach einer Kompaktierung sind beide Stufen wieder frei (neuer Zyklus). Das Bezugsfenster steht in `settings.json` unter `env.CLAUDE_CONTEXT_WINDOW` (Default `200000`; bei 1M-Kontext auf `1000000` setzen).
- **SessionStart-Hook** ([`session_start.py`](.claude/hooks/session_start.py)): Lädt beim Start (und nach `/clear` bzw. einer Kompaktierung) das jüngste Übergabedokument aus `tmp/handoff/` – nach einer Kompaktierung bevorzugt das der eigenen Session – und den Schnell-Lookup-Index der Wissensdatenbank in den Kontext.

Beide Hooks setzen **Python 3.x** voraus (ohnehin Template-Voraussetzung wegen `python-docx`) und rufen es als `python` auf. Auf macOS/Linux-Systemen, die nur `python3` kennen: in `.claude/settings.json` an beiden Stellen `"command": "python"` durch `"command": "python3"` ersetzen. Fehlt Python ganz, zeigt Claude Code eine nicht blockierende Warnung und die Session läuft normal weiter, nur ohne Sicherheitsnetz. Ein manueller Handoff geht jederzeit über den `/handoff`-Skill.

### Learning-Kriterien

Ein technisches Problem gehört als Eintrag in `docs/LEARNINGS.md` (über den `knowledge-base-entry`-Skill), wenn **alle vier** zutreffen:

1. Die Lösung brauchte mehr als einen Anlauf.
2. Die Ursache war nicht aus der Fehlermeldung ablesbar.
3. Das Problem ist wiederholbar (liegt am Werkzeug, an der Umgebung oder am CMS – nicht an einer einmaligen Konstellation).
4. Die Lösung ist nicht trivial ableitbar.

Leitfrage: *Würde ich beim nächsten Mal wieder genauso lange suchen?* Nicht hinein gehören: Tippfehler, einmalige Eigenheiten eines Kundendatensatzes, alles was bereits dokumentiert ist. Die Datei ist gitignored – Learnings bleiben beim jeweiligen Nutzer und wandern nie ins Repo.

## Regeln für Änderungen am Vorlage-Repo

1. **Skills nicht divergieren lassen.** Wenn du an einem der Template-Skills etwas änderst, prüfe, ob die Änderung auch in die [Referenz-CLAUDE.md](.claude/skills/project-setup/references/CLAUDE-referenz.md) oder den [`project-setup`](.claude/skills/project-setup/SKILL.md)-Skill gehört.
2. **Platzhalter einheitlich halten.** Es gibt genau **7 Setup-Platzhalter** (Whitelist in `project-setup`): `[KUNDENNAME]`, `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]`, `[PROPERTY_ID]`, `[STAND_DATUM]`, `[NISCHE]`, `[WEBSITE_STRUKTUR_PFAD]` – immer eckige Klammern, gleiche Bedeutung = gleicher Name. Alle anderen Eckklammer-Marker (`[TODO]`, `[AUS_CMS_EXTRAHIEREN]`, `[slug]`, …) sind Laufzeit-/Ausfüll-Lücken und werden beim Setup NICHT ersetzt.
3. **Keine Kundendaten committen.** Alle Beispiele sind entweder generisch oder nutzen den fiktiven Beispiel-Kunden „Sonnenwerk Solar GmbH" (SWG, sonnenwerk-solar.de) aus der Referenz-CLAUDE.md.
4. **Deutsche Umlaute** in allen deutschsprachigen Texten: ä, ö, ü, Ä, Ö, Ü, ß. Ausnahmen: YAML-Frontmatter in SKILL.md-Dateien, URL-Slugs, sowie Code-Dateien (Python-/JS-Quelltexte dürfen in Kommentaren und Konsolen-Ausgaben ASCII-Transliteration behalten).

## Struktur

```
./
├── .claude/
│   ├── hooks/
│   │   ├── context_guard.py             # Stop-Hook: Kontext-Wächter (60/85 %)
│   │   └── session_start.py             # SessionStart-Hook: Handoff + Learnings-Index
│   ├── settings.json                    # Hook-Verdrahtung + CLAUDE_CONTEXT_WINDOW
│   └── skills/
│       ├── project-setup/               # Setup-Werkzeug (bleibt)
│       │   └── references/CLAUDE-referenz.md
│       ├── article-create/              # Pflicht: Vier-Dateien-Artikelstruktur
│       │   └── references/              #   seo-template.md, create-docx.py
│       ├── content-html-formatter/      # Vorlage: CMS-HTML aus Wissensbasis
│       │   └── references/              #   wissensbasis-template.md, prepare-media.py
│       ├── ga4-reports/                 # Vorlage: GA4-Reporting (mcpwerk-ga4)
│       ├── seo-page-research/           # Vorlage: 6-Phasen-Seitenrecherche
│       ├── deep-keyword-gap-research/   # Vorlage: Nischen-Gap-Discovery (Node-Skripte)
│       ├── brand-meta-ctr/              # Vorlage: Meta-Tags im Hausstil
│       ├── rueckverlinkung/             # Vorlage: interne Links auf neue Zielseite
│       ├── handoff/                     # Pflicht: Session-Übergabe (tmp/handoff/)
│       ├── knowledge-base-entry/        # Pflicht: Learnings-Datenbank
│       ├── grilling/  grill-me/         # Optional: Plan-Interview
│       └── writing-great-skills/        # Optional: Skill-Autoren-Referenz
├── docs/
│   └── assets/                          # mcpwerk-Logos (für die README)
├── .gitignore
├── .mcp.json                            # 4 gehostete mcpwerk-Server (Opt-in)
├── CLAUDE.md                            # diese Datei – wird beim Setup ersetzt
└── README.md                            # wird beim Setup durch Projekt-README ersetzt
```
