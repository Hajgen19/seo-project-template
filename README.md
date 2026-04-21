# SEO Project Template

Vorlage-Repo für neue SEO-Kundenprojekte mit [Claude Code](https://claude.com/claude-code). Enthält drei vorkonfigurierte Skills, die beim ersten Durchlauf in-place an den jeweiligen Kunden parametrisiert werden.

## Quick Start

```bash
git clone https://github.com/Hajgen19/seo-project-template neuer-kunde
cd neuer-kunde
# Remote vom Template lösen, damit Kundenarbeit nicht zurückfließt:
git remote remove origin
# Optional: eigenes Kunden-Repo anhängen
# git remote add origin <kunden-repo-url>

# Claude Code starten und folgendes fragen:
# "Lege Projekt für [Kundenname] an"
```

`project-setup` triggert daraufhin, fragt Kundendaten + CSV ab und baut das Projektgerüst auf.

## Enthaltene Skills

| Skill | Zweck |
|---|---|
| **project-setup** | Parametrisiert neue Projekte: Ordnerstruktur, CLAUDE.md, Wissensbasis aus Website-Crawl, Platzhalter in den anderen Skills. Bleibt nach Setup für spätere Nachpflege im Projekt. |
| **content-html-formatter** | CMS-agnostischer HTML-Formatter. Bewusst generisch – liest die projektspezifischen HTML-Bausteine aus `wissensbasis/html-elemente.md`. Verweigert Output, solange die Wissensbasis leer ist. |
| **ga4-reports** | GA4-Reporting über MCP mit voller Nachvollziehbarkeit (Verifikationsblock pro Abfrage). Property-ID, Domain, Schlüsselereignisse werden beim Setup in-place gesetzt. |

Nicht benötigte Skill-Ordner nach dem Setup einfach löschen.

## Voraussetzungen

- [Claude Code](https://claude.com/claude-code) CLI (oder Desktop/IDE-Extension)
- Für `ga4-reports`: [Google Analytics MCP](https://github.com/google-analytics/google-analytics-mcp) eingerichtet
- Für `google-ads`, `gsc`, `google-tag-manager`: entsprechende MCP-Server auf User- oder Projekt-Ebene konfiguriert

Die MCP-Aktivierung (nicht die Server-Konfiguration selbst) ist in `.claude/settings.json` bereits gesetzt:

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "google-ads",
    "gsc",
    "google-tag-manager",
    "ga4-analytics"
  ]
}
```

## Projektkonventionen

Das Repo bringt etablierte Konventionen mit, die `project-setup` in jede neue Projekt-`CLAUDE.md` übernimmt:

- **Artikel-Ordner:** Je Seite ein Ordner unter `artikel/content/<slug>/` mit `artikel.md`, `seo.md`, `<cms>.html`, `artikel.docx`
- **Changelog:** Eine Tagesdatei pro Arbeitstag unter `changelog/YYYY-MM-DD.md`, keine zentrale CHANGELOG.md
- **Wissensbasis:** `wissensbasis/*.md` mit Quellenangabe am Dateiende, Single Source of Truth für Kundenkontext
- **Schreibregeln:** Deutsche Umlaute, konsistente Markenname-Schreibweise, keine Kausal-Spekulationen in Reports

Ein ausgefülltes Beispiel einer projektspezifischen CLAUDE.md (fiktiver Kunde „Sonnenwerk Solar GmbH") liegt unter `.claude/skills/project-setup/references/CLAUDE-referenz.md`.

## Struktur

```
./
├── .claude/
│   ├── settings.json                    # MCP-Server aktiviert
│   └── skills/
│       ├── project-setup/               # Setup-Werkzeug
│       ├── content-html-formatter/      # HTML-Formatter-Vorlage
│       └── ga4-reports/                 # GA4-Reporting-Vorlage
├── .gitignore
├── CLAUDE.md                            # wird beim Setup ersetzt
└── README.md                            # diese Datei
```

## Weiterentwicklung

Wenn du an einem Skill etwas änderst, das auch für zukünftige Projekte relevant ist: zurück ins Template-Repo einpflegen. Prüfe dabei, ob die Änderung auch in die Referenz-CLAUDE.md oder den `project-setup`-Skill gehört, damit die Skills nicht driften.
