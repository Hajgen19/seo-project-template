# SEO Project Template

Vorlage-Repo für neue SEO-Kundenprojekte mit [Claude Code](https://claude.com/claude-code). Enthält vier vorkonfigurierte Skills: zwei Pflicht-Skills (`project-setup`, `article-create`) und zwei optionale Vorlagen (`content-html-formatter`, `ga4-reports`), die beim ersten Durchlauf in-place an den jeweiligen Kunden parametrisiert werden.

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

| Skill | Zweck | Pflicht? |
|---|---|---|
| **[project-setup](.claude/skills/project-setup/SKILL.md)** | Parametrisiert neue Projekte: Ordnerstruktur, CLAUDE.md (inkl. CMS-Dateiname, CMS-Editor, Marke), Wissensbasis aus Website-Crawl, **`tone-of-voice.md`** aus Kundentexten, Platzhalter in den anderen Skills. Bleibt nach Setup für spätere Nachpflege im Projekt. | ✓ |
| **[article-create](.claude/skills/article-create/SKILL.md)** | Legt neue Artikel/Seiten in der Pflicht-Struktur unter `artikel/content/<slug>/` an (vier Pflichtdateien: `artikel.md`, `seo.md`, `<cms>.html`, `artikel.docx`). Generisch – liest CMS-Dateiname und CMS-Editor zur Laufzeit aus CLAUDE.md, Stimm-Vorgabe aus `wissensbasis/tone-of-voice.md`. Inklusive [seo-template.md](.claude/skills/article-create/references/seo-template.md) und [create-docx.py](.claude/skills/article-create/references/create-docx.py). | ✓ |
| **[content-html-formatter](.claude/skills/content-html-formatter/SKILL.md)** | CMS-agnostischer HTML-Formatter. Bewusst generisch – liest die projektspezifischen HTML-Bausteine aus `wissensbasis/html-elemente.md`. Verweigert Output, solange die Wissensbasis leer ist. Vorlage dafür: [wissensbasis-template.md](.claude/skills/content-html-formatter/references/wissensbasis-template.md). | optional |
| **[ga4-reports](.claude/skills/ga4-reports/SKILL.md)** | GA4-Reporting über MCP mit voller Nachvollziehbarkeit (Verifikationsblock pro Abfrage). Property-ID, Domain, Schlüsselereignisse werden beim Setup in-place gesetzt. Siehe auch [api-mapping.md](.claude/skills/ga4-reports/references/api-mapping.md). | optional |

Nicht benötigte optionale Skill-Ordner können nach dem Setup gelöscht werden. `project-setup` und `article-create` bleiben immer im Projekt.

## Voraussetzungen

- [Claude Code](https://claude.com/claude-code) CLI (oder Desktop/IDE-Extension)
- **Python 3.x** plus `pip install python-docx` – wird vom `article-create`-Skill für die automatische Word-Export-Generierung (`artikel.docx`) verwendet (siehe [`create-docx.py`](.claude/skills/article-create/references/create-docx.py))
- Lokal installierte und eingerichtete MCP-Server für `google-ads`, `gsc`, `google-tag-manager` und `ga4-analytics` (nur nötig, wenn der `ga4-reports`-Skill verwendet wird)

### Wichtiger Hinweis zu den MCP-Servern

Die vier im Repo aktivierten MCP-Server (`google-ads`, `gsc`, `google-tag-manager`, `ga4-analytics`) sind **keine öffentlich verfügbaren Pakete** – es gibt aktuell keinen offiziellen Marketplace-Eintrag und keine fertigen Installer-Befehle dafür. Sie müssen **zuerst lokal installiert und konfiguriert** werden, bevor die Skills nutzbar sind. Das umfasst pro Server:

- Quellcode beschaffen (eigenes Repo, Fork, oder Eigenentwicklung)
- Abhängigkeiten installieren (Python-venv, Node, je nach Implementierung)
- OAuth-Credentials bzw. API-Keys einrichten (`client_secrets.json`, Token-Files)
- MCP-Server-Eintrag auf User- oder Projekt-Ebene registrieren (siehe Claude-Code-Doku zu `.mcp.json` / `~/.claude.json`)

Ohne diese Installation triggern die Skills zwar, die MCP-Tool-Calls selbst scheitern aber. Erst danach funktionieren `ga4-reports` und alle anderen datenabhängigen Workflows.

Die **Aktivierung** dieser MCP-Server (nicht die Installation) ist in [`.claude/settings.json`](.claude/settings.json) bereits vorbereitet:

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

Das bedeutet: Sobald die Server lokal vorhanden sind, werden sie in diesem Projekt automatisch geladen. Sind sie nicht installiert, bleibt dieser Block wirkungslos (kein Fehler, aber auch keine MCP-Tools).

## Projektkonventionen

Das Repo bringt etablierte Konventionen mit, die [`project-setup`](.claude/skills/project-setup/SKILL.md) in jede neue Projekt-[`CLAUDE.md`](CLAUDE.md) übernimmt:

- **Artikel-Ordner:** Je Seite ein Ordner unter `artikel/content/<slug>/` mit `artikel.md`, `seo.md`, `<cms>.html`, `artikel.docx`. Angelegt durch den `article-create`-Skill, CMS-Dateiname kommt aus `CLAUDE.md > Über > **CMS-Dateiname:**`.
- **Changelog:** Eine Tagesdatei pro Arbeitstag unter `changelog/YYYY-MM-DD.md`, keine zentrale CHANGELOG.md
- **Wissensbasis:** `wissensbasis/*.md` mit Quellenangabe am Dateiende, Single Source of Truth für Kundenkontext. Pflicht-Datei: `wissensbasis/tone-of-voice.md` als Stimm-Referenz, gegen die jeder Text geprüft wird (verhindert Generic-AI-Drift).
- **Schreibregeln:** Deutsche Umlaute, konsistente Markenname-Schreibweise, keine Kausal-Spekulationen in Reports. Anrede/Em-Dash-Regel pro Kunde laut `tone-of-voice.md`.

Ein ausgefülltes Beispiel einer projektspezifischen CLAUDE.md (fiktiver Kunde „Sonnenwerk Solar GmbH") liegt unter [`.claude/skills/project-setup/references/CLAUDE-referenz.md`](.claude/skills/project-setup/references/CLAUDE-referenz.md).

## Struktur

```
./
├── .claude/
│   ├── settings.json                    # MCP-Server aktiviert
│   └── skills/
│       ├── project-setup/               # Setup-Werkzeug (Pflicht)
│       ├── article-create/              # Artikel-Pflichtstruktur (Pflicht)
│       ├── content-html-formatter/      # HTML-Formatter-Vorlage (optional)
│       └── ga4-reports/                 # GA4-Reporting-Vorlage (optional)
├── .gitignore
├── CLAUDE.md                            # wird beim Setup ersetzt
└── README.md                            # diese Datei
```

## Weiterentwicklung

Wenn du an einem Skill etwas änderst, das auch für zukünftige Projekte relevant ist: zurück ins Template-Repo einpflegen. Prüfe dabei, ob die Änderung auch in die Referenz-CLAUDE.md oder den `project-setup`-Skill gehört, damit die Skills nicht driften.
