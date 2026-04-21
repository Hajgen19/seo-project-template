# CLAUDE.md – Vorlage-Repo für SEO-Kundenprojekte

Dieses Verzeichnis ist **noch kein Kundenprojekt**, sondern der **Startpunkt eines frisch aus dem Vorlage-Repo gezogenen Projekts**. Es enthält bereits die komplette Skill-Infrastruktur, aber noch keine Kundendaten.

Diese CLAUDE.md wird beim ersten Durchlauf von `project-setup` durch die projektspezifische Variante ersetzt (Vorlage für die neue Fassung: `.claude/skills/project-setup/references/CLAUDE-referenz.md`).

## Workflow

1. **Vorlage-Repo klonen:** `git clone <repo-url> neuer-kunde/`
2. **In den Ordner wechseln** und Claude Code starten
3. **User-Prompt:** „Lege Projekt für [Kundenname] an" (oder vergleichbar) → triggert den `project-setup`-Skill
4. `project-setup` fragt die Kundendaten ab und arbeitet **in-place** in diesem Verzeichnis:
   - Legt Ordnerstruktur an (`wissensbasis/`, `artikel/content/`, `berichte/`, `seo/`, `changelog/`, `quelldateien/`, `tmp/`)
   - Erzeugt projektspezifische CLAUDE.md (ersetzt diese hier)
   - Generiert Wissensbasis aus der CSV
   - Parametrisiert `ga4-reports` (ersetzt `[PROPERTY_ID]`, `[WEBSITE_DOMAIN]`, `[PROJEKT_NAME]`, `[STAND_DATUM]` und Schlüsselereignisse in-place)
   - Erinnert daran, `wissensbasis/html-elemente.md` mit CMS-Snippets zu füllen
   - Läuft durch die QA-Checkliste
5. **Danach:** normaler Content-Workflow (Artikel schreiben, HTML formatieren, GA4-Reports ziehen).

## Skills im Vorlage-Repo

| Skill | Rolle |
|---|---|
| `project-setup` | Werkzeug – parametrisiert das Projekt. Bleibt nach Setup liegen (für spätere Nachpflege/QA). |
| `content-html-formatter` | Vorlage – bewusst generisch, liest Projektspezifisches aus `wissensbasis/html-elemente.md`. |
| `ga4-reports` | Vorlage – Property-ID/Domain werden beim Setup in-place ersetzt. |

Wird ein Skill im konkreten Projekt nicht gebraucht (z.B. kein GA4), kann der Skill-Ordner einfach gelöscht werden.

## MCP-Konfiguration

Die MCP-Server sind in `.claude/settings.local.json` aktiviert:
- `google-ads`
- `gsc`
- `google-tag-manager`
- `ga4-analytics`

Die tatsächlichen Server-Definitionen (Pfade, OAuth-Secrets etc.) werden auf User- oder Projekt-Ebene separat gepflegt. Dieses Repo setzt **keine** MCP-Verbindungen auf – das macht der User pro Projekt.

## Regeln für Änderungen am Vorlage-Repo

1. **Skills nicht divergieren lassen.** Wenn du an einem der Template-Skills etwas änderst, prüfe, ob die Änderung auch in die Referenz-CLAUDE.md oder den `project-setup`-Skill gehört.
2. **Platzhalter einheitlich halten.** Einmal `[PROPERTY_ID]`, immer `[PROPERTY_ID]` – nicht mal `{PROPERTY_ID}`, mal `<PROPERTY_ID>`.
3. **Keine Kundendaten committen.** Alle Beispiele sind entweder generisch (SWG in der Referenz-CLAUDE.md) oder als Platzhalter markiert.
4. **Deutsche Umlaute** in allen deutschsprachigen Texten: ä, ö, ü, Ä, Ö, Ü, ß. Ausnahme: YAML-Frontmatter in SKILL.md-Dateien.

## Struktur

```
./
├── .claude/
│   ├── settings.local.json          # MCP-Server aktiviert, Permissions leer
│   └── skills/
│       ├── project-setup/
│       │   ├── SKILL.md
│       │   └── references/
│       │       └── CLAUDE-referenz.md   # Ausgefüllte Beispiel-CLAUDE.md (SWG)
│       ├── content-html-formatter/
│       │   ├── SKILL.md
│       │   └── references/
│       │       └── wissensbasis-template.md
│       └── ga4-reports/
│           ├── SKILL.md
│           └── references/
│               └── api-mapping.md
└── CLAUDE.md                        # diese Datei – wird beim Setup ersetzt
```
