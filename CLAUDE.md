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

Folgende MCP-Server werden vom Repo verwendet (lokal zu installieren):
- `google-ads`
- `gsc`
- `google-tag-manager`
- `ga4-analytics`

**Wichtig:** Diese vier MCP-Server sind **keine öffentlich verfügbaren Pakete**. Es gibt aktuell keinen Marketplace-Eintrag und keine fertigen Installer. Sie müssen zuerst lokal installiert und mit OAuth-Credentials/API-Keys versorgt werden, bevor Skills wie `ga4-reports` funktionieren. Ohne Installation passiert nichts (kein Fehler, aber auch keine Tools).

Dieses Repo setzt **keine** MCP-Verbindungen auf – das macht der User pro Projekt, außerhalb des Repos.

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
