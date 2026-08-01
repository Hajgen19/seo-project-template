# CLAUDE.md – Vorlage-Repo für SEO-Kundenprojekte

Dieses Verzeichnis ist **noch kein Kundenprojekt**, sondern der **Startpunkt eines frisch aus dem Vorlage-Repo gezogenen Projekts**. Es enthält bereits die komplette Skill-Infrastruktur, aber noch keine Kundendaten.

Diese CLAUDE.md wird beim ersten Durchlauf von [`project-setup`](.claude/skills/project-setup/SKILL.md) durch die projektspezifische Variante ersetzt (Vorlage für die neue Fassung: [`CLAUDE-referenz.md`](.claude/skills/project-setup/references/CLAUDE-referenz.md)).

## Workflow

1. **Vorlage-Repo klonen:** `git clone <repo-url> neuer-kunde/`
2. **In den Ordner wechseln** und Claude Code starten
3. **User-Prompt:** „Lege Projekt für [Kundenname] an" (oder vergleichbar) → triggert den [`project-setup`](.claude/skills/project-setup/SKILL.md)-Skill
4. `project-setup` fragt die Kundendaten ab (inkl. **CMS-Dateiname** und **CMS-Editor**) und arbeitet **in-place** in diesem Verzeichnis:
   - Legt Ordnerstruktur an (`wissensbasis/`, `artikel/content/`, `berichte/`, `seo/`, `changelog/`, `quelldateien/`, `tmp/`)
   - Erzeugt projektspezifische CLAUDE.md (ersetzt diese hier) – inkl. Pflichtzeilen `**Marke:**`, `**CMS-Dateiname:**`, `**CMS-Editor:**` in der „Über"-Sektion
   - Generiert Wissensbasis aus der CSV (Unternehmen, Leistungen, Website-Struktur, Design)
   - Erstellt **`wissensbasis/tone-of-voice.md`** aus den persönlichsten Kundentexten – verbindliche Stimm-Referenz für alle späteren Schreibvorgänge
   - Parametrisiert `ga4-reports` (ersetzt `[PROPERTY_ID]`, `[WEBSITE_DOMAIN]`, `[PROJEKT_NAME]`, `[STAND_DATUM]` und Schlüsselereignisse in-place)
   - Erinnert daran, `wissensbasis/html-elemente.md` mit CMS-Snippets zu füllen
   - Smoke-Test mit `article-create` (vier Pflichtdateien, korrekter CMS-Dateiname, DOCX-Deckblatt)
   - Läuft durch die QA-Checkliste
5. **Danach:** normaler Content-Workflow (Artikel über `article-create` anlegen, HTML formatieren, GA4-Reports ziehen).

## Skills im Vorlage-Repo

| Skill | Rolle |
|---|---|
| [`project-setup`](.claude/skills/project-setup/SKILL.md) | Werkzeug – parametrisiert das Projekt. Bleibt nach Setup liegen (für spätere Nachpflege/QA). |
| [`article-create`](.claude/skills/article-create/SKILL.md) | **Pflicht-Skill.** Legt neue Artikel/Seiten in der vier-Dateien-Pflichtstruktur an (`artikel.md`, `seo.md`, `<cms>.html`, `artikel.docx`). Liest CLAUDE.md (CMS-Dateiname, CMS-Editor) und `wissensbasis/tone-of-voice.md` zur Laufzeit. Keine Parametrisierung nötig. |
| [`content-html-formatter`](.claude/skills/content-html-formatter/SKILL.md) | Vorlage – bewusst generisch, liest Projektspezifisches aus `wissensbasis/html-elemente.md`. |
| [`ga4-reports`](.claude/skills/ga4-reports/SKILL.md) | Vorlage – Property-ID/Domain werden beim Setup in-place ersetzt. |

`article-create` und `project-setup` bleiben in jedem Projekt aktiv. Die anderen können bei Bedarf gelöscht werden (z.B. kein GA4 → `ga4-reports/` entfernen).

## Python-Abhängigkeit für article-create

Der `article-create`-Skill ruft `references/create-docx.py` auf, um pro Artikel automatisch eine `artikel.docx` zu erzeugen. Voraussetzung: **Python 3.x** und `pip install python-docx`. Ohne diese Abhängigkeit schlägt Schritt 6 in `article-create` (DOCX-Erzeugung) fehl. Der Skill weist in dem Fall im Bericht auf die fehlende Abhängigkeit hin.

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

- **Stop-Hook** ([`context_guard.py`](.claude/hooks/context_guard.py)): Misst nach jeder Antwort den Kontextverbrauch anhand der echten Token-Zahlen aus dem Transcript. Ab **60 %** stößt er einmalig an: Handoff schreiben, Changelog nachziehen, Learnings prüfen. Ab **85 %** einmalig: Handoff aktualisieren. Das Bezugsfenster steht in `settings.json` unter `env.CLAUDE_CONTEXT_WINDOW` (Default `200000`; bei 1M-Kontext auf `1000000` setzen).
- **SessionStart-Hook** ([`session_start.py`](.claude/hooks/session_start.py)): Lädt beim Start (und nach `/clear` bzw. einer Kompaktierung) das jüngste Übergabedokument aus `tmp/handoff/` und den Schnell-Lookup-Index aus `docs/LEARNINGS.md` in den Kontext.

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
2. **Platzhalter einheitlich halten.** Einmal `[PROPERTY_ID]`, immer `[PROPERTY_ID]` – nicht mal `{PROPERTY_ID}`, mal `<PROPERTY_ID>`.
3. **Keine Kundendaten committen.** Alle Beispiele sind entweder generisch (SWG in der Referenz-CLAUDE.md) oder als Platzhalter markiert.
4. **Deutsche Umlaute** in allen deutschsprachigen Texten: ä, ö, ü, Ä, Ö, Ü, ß. Ausnahme: YAML-Frontmatter in SKILL.md-Dateien.

## Struktur

```
./
├── .claude/
│   └── skills/
│       ├── project-setup/
│       │   ├── SKILL.md
│       │   └── references/
│       │       └── CLAUDE-referenz.md   # Ausgefüllte Beispiel-CLAUDE.md (SWG)
│       ├── article-create/          # Pflicht-Skill, generisch
│       │   ├── SKILL.md
│       │   └── references/
│       │       ├── seo-template.md
│       │       └── create-docx.py
│       ├── content-html-formatter/
│       │   ├── SKILL.md
│       │   └── references/
│       │       └── wissensbasis-template.md
│       └── ga4-reports/
│           ├── SKILL.md
│           └── references/
│               └── api-mapping.md
├── .gitignore
├── CLAUDE.md                        # diese Datei – wird beim Setup ersetzt
└── README.md
```
