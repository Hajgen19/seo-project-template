---
name: project-setup
description: Legt ein neues Kundenprojekt mit vollstaendiger Ordnerstruktur, Wissensbasis, CLAUDE.md mit allen Konventionen und optional projektspezifischen Skills an. Nutze diesen Skill immer, wenn der User ein neues Projekt aufsetzen, ein Projekt anlegen, eine neue Kundenstruktur erstellen oder ein Projektverzeichnis initialisieren moechte. Trigger auch bei "Setup fuer [Kundenname]", "neues Projekt", "Projektordner anlegen", "Kunde einrichten" oder "Projekt starten fuer [Name]".
---

# Projekt-Setup-Skill

Erstellt ein vollständiges Kundenprojekt-Verzeichnis mit Ordnerstruktur, CLAUDE.md (inkl. aller Konventionen), Wissensbasis aus gecrawltem Website-Content, erster Changelog-Datei, schlanker Projekt-README und in-place parametrisierten Projekt-Skills.

## Warum dieser Skill existiert

Jedes neue Kundenprojekt braucht die gleiche Grundstruktur: einheitliche Ordner, eine CLAUDE.md mit Projektkontext **und allen etablierten Konventionen** (Artikel-Ordner, Content-Typen, Changelog, Projektgedächtnis, Tools, projektspezifische Skills), eine Wissensbasis aus dem Website-Content und Design-Richtlinien. Ohne diesen Skill müsste das jedes Mal manuell aufgebaut werden – fehleranfällig und zeitaufwendig. Der Skill standardisiert das und sorgt dafür, dass ab der ersten Minute produktiv und einheitlich gearbeitet werden kann.

**Arbeitsweise:** Dieser Skill läuft **in-place** im aktuellen Projektverzeichnis. Alle Skill-Vorlagen liegen bereits unter `.claude/skills/`, weil das gesamte Projektverzeichnis aus einem Vorlage-Repo von GitHub gezogen wurde. Es wird **nichts kopiert** – die Skills werden nur in-place parametrisiert (Platzhalter ersetzt, Wissensbasis befüllt). Das Vorlage-Repo bringt 13 Skills mit:

| Skill | Rolle | Parametrisierung (Schritt 6) |
|---|---|---|
| `project-setup` | Werkzeug – bleibt nach dem Setup für Nachpflege und QA | keine |
| `article-create` | **Pflicht.** Legt die Artikel-Pflichtstruktur an | keine – liest CLAUDE.md + Wissensbasis zur Laufzeit |
| `handoff` | **Pflicht.** Teil des Projektgedächtnisses, schreibt Übergabedokumente nach `tmp/handoff/` | keine |
| `knowledge-base-entry` | **Pflicht.** Pflegt `docs/LEARNINGS.md`; der Kontext-Wächter-Hook verweist auf ihn | keine |
| `content-html-formatter` | optional – CMS-fertiges HTML | keine – liest `wissensbasis/html-elemente.md` zur Laufzeit |
| `ga4-reports` | optional – GA4-Reporting | `[PROPERTY_ID]`, `[WEBSITE_DOMAIN]`, `[KUNDENNAME]`, `[STAND_DATUM]` |
| `seo-page-research` | optional – Seiten-Recherche + Briefing | `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]` |
| `deep-keyword-gap-research` | optional – nischenweite Gap-Recherche | `[KUNDENNAME]`, `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]`, `[NISCHE]`, `[WEBSITE_STRUKTUR_PFAD]` |
| `brand-meta-ctr` | optional – Meta-Tags im Hausstil | `[KUNDENNAME]`, `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]` |
| `rueckverlinkung` | optional – rückwirkende interne Verlinkung | `[KUNDENNAME]` |
| `grilling` / `grill-me` | optional – Interview/Stresstest von Plänen | keine |
| `writing-great-skills` | optional – Referenz für Skill-Autoren | keine |

Die vier Pflicht-Skills (`project-setup`, `article-create`, `handoff`, `knowledge-base-entry`) werden **niemals gelöscht**. `handoff` und `knowledge-base-entry` sind mit den Projektgedächtnis-Hooks verdrahtet (siehe Schritt 3, Sektion „Projektgedächtnis") und gehören deshalb auf keine Lösch-Liste. Optionale Skills, die das Projekt nicht braucht, kann der User nach dem Setup löschen.

**Content-Pipeline (Verzahnung):** `deep-keyword-gap-research` (optionale Discovery-Stufe, liefert pro Top-Cluster einen Briefing-Seed) → `seo-page-research` (Recherche → Briefing) → `article-create` (4 Pflichtdateien, Briefing als Quelle) → `content-html-formatter` (CMS-HTML + Medien). Nach dem Launch zieht `rueckverlinkung` die Bestandsverlinkung nach, `brand-meta-ctr` schärft Meta-Tags on demand, `ga4-reports` steht quer dazu für die Performance-Messung. Die Kette ist über CLAUDE.md verbunden (Workflow-Diagramm, Content-Typen, Taxonomie-Brücke, Quellenpfade) – der Slug bleibt über alle Stufen identisch.

---

## Voraussetzungen

Der User liefert:
1. **Kundenname** (z.B. "Energiehaus Deutschland", Kurzform z.B. "EHDE")
2. **CSV-Datei** mit gecrawltem Website-Content
3. **CMS / Plattform** (z.B. WordPress, Shopify, Webflow) – relevant für projektspezifische Skills
4. **Analytics-Anbindung** – GA4 Property-ID und GSC-Property (falls vorhanden)
5. **Nische/Branche** – füllt `[NISCHE]`, wenn `deep-keyword-gap-research` genutzt wird

Technische Voraussetzung: **Python 3.x** (`python --version` muss laufen) – für `create-docx.py` (article-create) und die beiden Projektgedächtnis-Hooks in `.claude/hooks/`.

### CSV-Format (immer gleich)

| Spalte | Beschreibung |
|---|---|
| `url` | Vollständige URL der Seite |
| `title` | Title-Tag |
| `h1` | H1-Überschrift |
| `meta_description` | Meta-Description |
| `canonical` | Canonical-URL |
| `content` | Seiteninhalt als Fließtext |
| `method` | Crawl-Methode |
| `word_count` | Wortanzahl |

**So entsteht die CSV** (falls der User keine mitbringt): Es gibt kein Spezial-Tool-Erfordernis – zwei gängige Wege:

1. **Screaming Frog SEO Spider** (Free-Tier reicht bis 500 URLs): Crawl der Domain, Export „Internal – HTML"; die Spalten `url`, `title`, `h1`, `meta_description`, `canonical` liefert der Export direkt, `content`/`word_count` über „Custom Extraction" (Body-Text) oder leer lassen – dann zieht Schritt 5 die Inhalte der wichtigsten Seiten per WebFetch nach.
2. **Claude-gestützt ohne Crawler:** Der User liefert nur eine URL-Liste (z.B. aus der Sitemap `[WEBSITE_DOMAIN]/sitemap.xml`); dieses Setup holt Titel + Inhalte der wichtigsten 10–30 Seiten selbst per WebFetch und baut die CSV daraus. Bei großen Sites vorher priorisieren (Startseite, Leistungs-/Produktseiten, Über-uns, Top-Blogposts).

Fehlende `content`-Spalten sind kein Blocker – sie kosten nur Tiefe in der Wissensbasis-Generierung (Schritt 5).

---

## Ablauf

### Schritt 1: Informationen sammeln

Der Skill läuft im aktuellen Projektverzeichnis – der User hat dieses Verzeichnis bereits aus dem Vorlage-Repo gezogen. Du arbeitest also direkt hier, es wird kein neuer Ordner an anderer Stelle angelegt.

Frage den User nach:
- **Kundenname** (vollständig + Kurzform für Dateinamen)
- **Pfad zur CSV-Datei** (oder der User gibt sie direkt an)
- **Website-URL / Domain** (nackte Domain ohne Protokoll – füllt `[WEBSITE_DOMAIN]`; die URL zusätzlich für die Design-Extraktion)
- **Branche / Zielgruppe / Nische** (kurze Beschreibung, z.B. "Energieversorger für Hausverwaltungen" – füllt `[NISCHE]`)
- **CMS / Plattform** (WordPress, Shopify, Webflow, TYPO3, anderes)
- **CMS-Editor** (z.B. „Divi" / „Gutenberg" / „Elementor" bei WordPress; „Liquid" bei Shopify; „Webflow Designer"; „TYPO3 Backend"). Wird in CLAUDE.md > Über als Pflichtzeile eingetragen und vom `create-docx.py` für Hinweistexte gelesen.
- **CMS-Dateiname** für die Pflicht-HTML-Datei pro Artikel (Default-Mapping: WordPress → `wordpress.html`, Shopify → `shopify.html`, Webflow → `webflow.html`, TYPO3 → `typo3.html`, sonst `cms.html`). Wird in CLAUDE.md > Über als Pflichtzeile eingetragen und vom `article-create`-Skill gelesen.
- **Analytics-Anbindung:** GA4 Property-ID (füllt `[PROPERTY_ID]`) und GSC-Property (füllt `[GSC_PROPERTY]`, Format `https://…/` oder `sc-domain:…`)
- **Welche optionalen Skills gebraucht werden** (siehe Tabelle oben) – nicht benötigte Skill-Ordner kann der User nach dem Setup löschen
- **Medien-/Theme-Maße (optional):** Kennt der Kunde die Pixel-Maße seines Themes (Textspalte, Hero-, Inline-, Detail-Breite)? Wenn ja → CLAUDE.md-Sektion „Medien-Maße" mit den echten Werten füllen. Wenn nein → neutrale Defaults 800/1600/1400/900 px eintragen und als Default kennzeichnen.

**MCP:** Frage NICHT nach Verbindungs-Konfiguration oder Credentials. Die vier mcpwerk-Server (GSC, GA4, Ads, GTM) kommen aus der committeten `.mcp.json`; Claude Code fragt beim ersten Öffnen des Projekts per **Opt-in-Dialog**, ob sie aktiviert werden sollen, die Anmeldung läuft danach per OAuth über `/mcp`. Erkläre dem User diesen Ablauf. Einzige aktive Nachfrage: Wenn `seo-page-research` oder `deep-keyword-gap-research` genutzt werden sollen, braucht der User einen **eigenen SerpApi-Key** und muss selbst einen `serpapi`-Eintrag in `.mcp.json` ergänzen – SerpApi ist im Template bewusst nicht vorkonfiguriert.

### Schritt 2: Ordnerstruktur anlegen

Lege **fehlende** Ordner im aktuellen Projektverzeichnis an. Bereits existierende Ordner (`.claude/`, `.git/`, `docs/`) bleiben unverändert; du arbeitest in-place. Die zu erzeugende Soll-Struktur:

```
[Projektname]/
├── artikel/content/       # Seiten-Entwürfe, typisiert: artikel/content/<content-typ>/<slug>/
├── berichte/              # Reports, Audits, Präsentationen
├── seo/                   # Übergreifende SEO-Arbeit (NICHT seitenbezogen);
│                          # deep-keyword-gap-research schreibt nach seo/keyword-gap/<nische>/
├── wissensbasis/          # Referenz-Dateien (nur lesen)
├── quelldateien/          # Rohdaten vom Kunden
├── docs/                  # docs/LEARNINGS.md entsteht hier über knowledge-base-entry (gitignored)
├── tmp/                   # Temporär, Skripte (gitignored); tmp/handoff/ = Übergabedokumente des handoff-Skills
├── changelog/             # Pro Tag eine Datei YYYY-MM-DD.md
├── .claude/               # bereits vorhanden: skills/, hooks/ (context_guard.py, session_start.py), settings.json
├── .mcp.json              # bereits vorhanden: vier mcpwerk-Server (Opt-in beim ersten Öffnen)
└── CLAUDE.md              # bereits vorhanden, wird in Schritt 3 überschrieben
```

### Schritt 3: CLAUDE.md erstellen

Verwende dieses Template und ersetze die Platzhalter. **Alle Sektionen sind verpflichtend**, außer den mit `[OPTIONAL]` markierten – sie machen das Projekt „gut verzahnt". Ein vollständig ausgefülltes Beispiel mit Erklärung der Verzahnungs-Logik findest du in `references/CLAUDE-referenz.md`. Lies die Referenz, wenn du unsicher bist, wie tief eine Sektion gefüllt werden muss:

```markdown
# CLAUDE.md – [Kundenname] Projekt

## Über [Kundenname]
- **[Kundenname]** ([Kurzform]) – [Branche/Beschreibung]
- Website: [WEBSITE_DOMAIN]
- Zielgruppen: [aus CSV-Analyse ableiten]
- Leistungen: [aus CSV-Analyse ableiten]
- **Marke:** [Markenname] (erscheint auf dem Deckblatt jedes artikel.docx)
- **CMS-Dateiname:** [wordpress.html | shopify.html | webflow.html | typo3.html | cms.html] (wird von article-create und content-html-formatter gelesen)
- **CMS-Editor:** [Divi | Liquid | Webflow Designer | TYPO3 Backend | …] (wird von create-docx.py fuer Hinweistexte gelesen)

## Analytics-Anbindung
- **GA4 Property-ID:** [PROPERTY_ID]
- **GSC Property:** [GSC_PROPERTY]
- **Standard-Zeitraum für Reports:** letzte 28 Tage (vergleichbar mit GSC-Standard)
- **Schlüsselereignisse (GA4):** [event_1], [event_2], … [oder: TODO – beim ersten GA4-Request mit dem User abstimmen]

## MCP-Konfiguration

Die Google-Datenanbindung läuft über die vier gehosteten mcpwerk-Server aus der committeten `.mcp.json` – keine lokale Installation, keine API-Keys:

| Server | URL | Daten |
|---|---|---|
| `mcpwerk-gsc` | `https://mcp.mcpwerk.com/gsc/mcp` | Google Search Console |
| `mcpwerk-ga4` | `https://mcp.mcpwerk.com/ga4/mcp` | Google Analytics 4 |
| `mcpwerk-ads` | `https://mcp.mcpwerk.com/ads/mcp` | Google Ads (inkl. Keyword Planner) |
| `mcpwerk-gtm` | `https://mcp.mcpwerk.com/gtm/mcp` | Google Tag Manager |

- Beim ersten Öffnen des Projekts fragt Claude Code per **Opt-in-Dialog**, ob die Server aktiviert werden sollen; die Anmeldung beim Google-Konto läuft danach per OAuth über `/mcp`.
- Tool-Namen folgen dem Schema `mcp__mcpwerk-<kuerzel>__…` (z.B. `mcp__mcpwerk-ga4__get_ga4_data`).
- **Kunden-Properties:** GA4 `[PROPERTY_ID]`, GSC `[GSC_PROPERTY]` (Schlüsselereignisse siehe „Analytics-Anbindung").
- **SerpApi ist NICHT vorkonfiguriert** – eigener Key des Nutzers, als `serpapi`-Eintrag in `.mcp.json` ergänzen. Nötig für `seo-page-research` und `deep-keyword-gap-research`.

## Schreibregeln
- **Tone of Voice:** `wissensbasis/tone-of-voice.md` ist die verbindliche Stimm-Referenz. Vor jedem neuen Text lesen, danach Checkliste durchgehen. Texte müssen klingen wie aus dieser Datei abgeleitet.
- **Deutsche Umlaute:** In aller deutschsprachiger Prosa echte Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. NIEMALS ASCII-Transliterationen (ae/oe/ue/ss). Ausnahmen: YAML-Frontmatter in SKILL.md-Dateien, URL-Slugs und Code-Dateien (Python-/JS-Quelltexte dürfen in Kommentaren und Konsolen-Ausgaben ASCII behalten).
- **"[Kundenname]"** oder **"[Kurzform]"** – Schreibweise konsistent halten
- **Anrede & Perspektive** entsprechend `wissensbasis/tone-of-voice.md` (kann pro Kunde Du/Sie/Ihr sein)
- **Em-Dash „–":** Nur erlauben, wenn der Kunde ihn in seinen Original-Texten selbst nutzt. Sonst weglassen (KI-Erkennungsmerkmal). Geviertstrich „—" grundsätzlich nicht verwenden. Konkrete Regel pro Kunde steht in der Voice-Datei.
- Fachbegriffe erklären (nicht voraussetzen)

## Quellenpfade

[Projektname]/
├── wissensbasis/                # Referenz-Dateien (nur lesen)
│   ├── [kurzform]-unternehmen.md
│   ├── [kurzform]-leistungen.md
│   ├── website-struktur.md      # URL-Inventar (fester Name – [WEBSITE_STRUKTUR_PFAD] zeigt hierher)
│   ├── tone-of-voice.md         # Verbindliche Stimm-Referenz – Pflicht-Lektüre vor jedem Text
│   ├── design.md
│   ├── html-elemente.md         # Pflicht, wenn content-html-formatter genutzt wird (CMS-Bausteine aus dem echten Frontend)
│   ├── autoren/                 # OPTIONAL: Author-Card- und Schema.org-Author-Daten pro Autor (E-E-A-T)
│   │   ├── README.md            #   – Schema-Doku + Liste aktiver Autoren
│   │   └── [autor-slug].md      #   – ein Eintrag pro Autor
│   └── medien/                  # OPTIONAL: Bild-/Video-Katalog: lokaler Name ↔ CDN-URL, Tags, Eignung, Vorsicht-Flags
│       ├── README.md            #   – Schema, Upload-/CDN-Workflow, Auswahlregeln
│       ├── bilder-katalog.md
│       └── videos-katalog.md
├── quelldateien/                # Rohdaten vom Kunden
├── artikel/content/<typ>/<slug>/  # Seiten-Entwürfe, gruppiert nach Content-Typ (siehe Artikel-Ordnerkonvention)
├── berichte/                    # Reports, Audits, Präsentationen
├── seo/                         # Projektweite SEO-Arbeit (NICHT seitenbezogen – das gehört in
│   │                            # artikel/content/<typ>/<slug>/seo.md; Recherche-Artefakte aus
│   │                            # seo-page-research liegen hier nur temporär, bis article-create
│   │                            # sie in den Artikel-Ordner verschiebt)
│   └── keyword-gap/<nische>/    # Output von deep-keyword-gap-research (06_report.md, briefing-seed-<id>.json)
├── docs/                        # LEARNINGS.md (gitignored, gepflegt über knowledge-base-entry)
├── tmp/                         # Temporär, Skripte (gitignored); tmp/handoff/ = Session-Übergaben
├── changelog/                   # Pro Tag eine Datei YYYY-MM-DD.md (siehe "Changelog-Konvention")
├── .claude/skills/              # Projekt-Skills (siehe "Projektspezifische Skills"; project-setup bleibt als Setup-Werkzeug)
├── [csv-dateiname]              # Gecrawlter Website-Content
└── CLAUDE.md

## Artikel-Ordnerkonvention

Jeder neue Artikel/jede neue Seite bekommt einen eigenen Ordner unter `artikel/content/<content-typ>/<slug>/` und enthält **verpflichtend** folgende vier Dateien (immer angelegt durch den `article-create`-Skill). Der **Content-Typ** (aus `seo.md`/Briefing) bestimmt den **Typ-Unterordner**; der **Blattordner bleibt = URL-Slug**.

**Content-Typ → Ordner-Segment (verbindlich):**

| Content-Typ | Ordner-Segment |
|---|---|
| Ratgeber | `ratgeber` |
| Beratung | `beratung` |
| Produktbeschreibung | `produkte` |
| Kollektionsseite | `kollektionen` |
| Profilseite | `profile` |
| Landingpage | `landingpages` |

\`\`\`
artikel/content/<content-typ>/<slug>/
├── artikel.md       # Reiner Artikeltext (H1 + Fließtext), OHNE Meta-Daten, OHNE Bilder
├── seo.md           # Seitenbezogene SEO-Daten: Meta-Title, Meta-Description, URL, Canonical,
│                    # Keyword-Mapping, H-Hierarchie, JSON-LD, interne Verlinkung, Bilder & Medien,
│                    # Autor, SEO-Checkliste (NICHT zu verwechseln mit dem projektweiten seo/-Ordner)
├── <cms>.html       # CMS-fertiges HTML, Dateiname laut CLAUDE.md > Über > CMS-Dateiname.
│                    # Erzeugt durch content-html-formatter.
├── artikel.docx     # Word-Export für Kunden-Review (erzeugt durch references/create-docx.py)
├── bilder/          # OPTIONAL: web-fertig aufbereitete Bilder/Videos (prepare-media.py), bereit zum CMS-Upload
└── (Recherche)      # OPTIONAL: briefing-<slug>.md, source-review-<slug>.md, cluster-<slug>.csv,
                     # cannibalization-<slug>.md – aus seo-page-research, von article-create hierher verschoben
\`\`\`

Regeln:
- **artikel.md** enthält KEINE SEO-Meta-Daten im Kopf und KEINE Bilder – Meta gehört in `seo.md`, Bilder kommen erst in `<cms>.html`.
- **seo.md** ist die zentrale Referenz für alle SEO-Elemente der Seite (inkl. Tabelle „Bilder & Medien" und Autor-Block, falls genutzt).
- **<cms>.html** wird aus `artikel.md` abgeleitet über den `content-html-formatter`-Skill. Der Dateiname kommt aus CLAUDE.md > Über > CMS-Dateiname.
- **artikel.docx** wird bei jeder Artikelerstellung UND nach jeder inhaltlichen Änderung neu generiert.
- **bilder/** entsteht nur, wenn der Artikel Medien bekommt (web-fertige Dateien aus `prepare-media.py`; Ziel-Breiten laut Sektion „Medien-Maße").
- **Recherche-Artefakte** liegen beim Artikel, sobald er existiert (von `article-create` aus `seo/` verschoben). `seo/` bleibt dadurch frei von seitenbezogenen Dateien.
- **Ordner-Struktur:** `<content-typ>` = festes Segment aus der Tabelle oben; **Blatt-Ordner-Slug = URL-Slug** (Kleinbuchstaben, Bindestriche, keine Umlaute, keine Unterstriche). Der Slug muss innerhalb seines Typ-Ordners eindeutig sein.

## Durchgängiger Content-Workflow

Die Content-Skills bilden eine feste Kette. Der Slug bleibt über alle Stufen identisch. `deep-keyword-gap-research` ist die (optionale) Discovery-Stufe DAVOR: sie liefert pro Top-Cluster einen Briefing-Seed, den `seo-page-research` beim Start liest.

\`\`\`
deep-keyword-gap-research  →  seo-page-research      →  article-create               →  content-html-formatter
Nischen-Gap-Map (optional)    Recherche + Briefing      4 Pflichtdateien                 <cms>.html (CMS-fertig)
seo/keyword-gap/<nische>/     seo/briefing-<slug>.md    artikel/content/<typ>/<slug>/
└ briefing-seed-<id>.json ─→  seo/source-review-…
\`\`\`

- **Übergabe 0 (gap → research, optional):** `seo-page-research` sucht in Phase 0 `seo/keyword-gap/<nische>/briefing-seed-<id>.json` und übernimmt `pillar_keyword` (= Topic), `secondary_keywords`, `competitor_urls`, `recommended_page_type` als Vorbefüllung (SERP-/Volumen-Daten werden trotzdem frisch verifiziert). Fehlt der Seed: regulär mit Topic starten.
- **Übergabe 1 (research → create):** `article-create` sucht `seo/briefing-<slug>.md` und nimmt es als verbindliche Quelle. Recherche-Artefakte werden nach `artikel/content/<typ>/<slug>/` verschoben.
- **Übergabe 2 (create → formatter):** `article-create` ruft `content-html-formatter` mit `artikel.md` auf; Content-Typ + Autor kommen aus `seo.md`.
- **Nach dem Launch:** `rueckverlinkung` setzt interne Links aus dem Bestand auf die neue Seite; `brand-meta-ctr` schärft Meta-Tags on demand; `ga4-reports` misst die Performance.
- **Verknüpfungs-Anker:** der **Slug** (Blatt-Ordnername unter dem Typ-Segment, Dateiname-Suffix der Recherche-Artefakte in `seo/`, Identifier in `seo.md`). Das **Typ-Segment** ist die zusätzliche Elternebene, abgeleitet aus dem Content-Typ in `seo.md`/Briefing.

## Content-Typen (Kurzreferenz)

[Pro Kunde füllen: welche der sechs Typen genutzt werden, unter welchen URL-Pfaden, mit welchen Pflicht-Elementen und Wortumfängen. Nicht genutzte Typen weglassen – die Ordner-Segmente aus der Tabelle oben bleiben trotzdem verbindlich.]

| Content-Typ | Ordner (`artikel/content/…`) | URL-Pfad | Pflicht | Empfohlen | Wörter |
|---|---|---|---|---|---|
| **Ratgeber** | `ratgeber` | [z.B. /blog/ratgeber/] | [ToC, FAQ, Experten-Zitat] | [Tabelle, Info-Box, CTA] | [1500–3000] |
| **Beratung** | `beratung` | [z.B. /blog/beratung/] | [ToC, Vergleichstabelle, FAQ] | [Info-Box] | [1500–3000] |
| **Produktbeschreibung** | `produkte` | [z.B. /produkte/ oder /leistungen/] | — | [Info-Box, Tabelle] | [300–800] |
| **Kollektionsseite** | `kollektionen` | [z.B. /kategorien/] | — | [Listen, Info-Box] | [200–500] |
| **Profilseite** | `profile` | [z.B. /team/ oder /ueber-uns/] | [Zitat] | [Info-Box] | [500–1000] |
| **Landingpage** | `landingpages` | [z.B. /lp/ oder /aktion/] | — | — | [500–1500] |

### Taxonomie-Brücke (verbindlich für alle Content-Skills)

`seo-page-research` denkt in Williams-Cook-Intent + Page-Type, `article-create` und `content-html-formatter` in den Content-Typen oben. Diese Tabelle übersetzt, damit alle Skills denselben Typ erwarten. `seo-page-research` trägt den Projekt-Content-Typ ins Briefing, die anderen lesen ihn dort.

| Intent-Klasse (Williams-Cook) | SERP-Page-Type | → Projekt-Content-Typ | Ordner (`artikel/content/…`) |
|---|---|---|---|
| Comparison | Listicle / Vergleich | **Beratung** | `beratung` |
| Reason / Definition / Instruction / Question | Blog / Guide | **Ratgeber** | `ratgeber` |
| Short fact / Bool (transaktional) | PDP | **Produktbeschreibung** | `produkte` |
| (Kategorie-Browsing) | PLP / Category | **Kollektionsseite** | `kollektionen` |
| (Personen-/Marken-Entity) | About / Profile | **Profilseite** | `profile` |
| (Kampagne) | Landing | **Landingpage** | `landingpages` |

Bei Mixed-Intent-SERP: den dominanten Intent für den Content-Typ nehmen, die Nebenintents als FAQ-/Abschnitt-Material behandeln.

## Changelog-Konvention

Änderungen am Projekt werden **pro Tag** in einer eigenen Datei im Ordner `changelog/` dokumentiert:

- **Dateiname:** `YYYY-MM-DD.md` (aktuelles Datum des Arbeitstags)
- **Neuer Tag = neue Datei** – bestehende Tagesdateien werden nicht rückwirkend verändert
- **Am selben Tag:** weitere Änderungen werden an die bestehende Tagesdatei angehängt
- **Überschrift H1:** `# YYYY-MM-DD – Kurztitel des Tages`
- Inhalt kurz, thematisch gruppiert (z.B. **Artikel**, **Wissensbasis**, **Skills**, **Konventionen**, **Reports**)
- Keine zentrale `CHANGELOG.md` – alle Einträge liegen ausschließlich im `changelog/`-Ordner

## Projektgedächtnis

Das Projekt hält Wissen auf vier Ebenen fest. Jede beantwortet eine andere Frage:

| Ablage | Beantwortet | Lebensdauer | Im Repo? |
|---|---|---|---|
| `changelog/YYYY-MM-DD.md` | Was wurde wann getan? | permanent, append-only | ja |
| `tmp/handoff/` | Wo steht die Arbeit gerade? | eine Session-Grenze | nein (gitignored) |
| `docs/LEARNINGS.md` | Dieses Symptom gab es schon – was war die Ursache? | permanent, wird nachgeschlagen | nein (gitignored, alle Datei-Varianten in .gitignore) |
| `wissensbasis/` | Wer ist der Kunde, wie klingt er? | permanent | ja |

Faustregel: **Interessiert es in einem Jahr noch jemanden → Changelog. Interessiert es nur die nächste Session → Handoff. Ist es ein gelöstes technisches Problem → Learnings.**

### Kontext-Wächter (automatisch)

Zwei Hooks in `.claude/settings.json` verdrahten das Gedächtnis mit dem Session-Lebenszyklus:

- **Stop-Hook** (`.claude/hooks/context_guard.py`): misst nach jeder Antwort den Kontextverbrauch. Ab **60 %** stößt er an: Handoff schreiben, Changelog nachziehen, Learnings prüfen. Ab **85 %**: Handoff aktualisieren. Jede Stufe feuert nur einmal pro Stufe und Kompaktierungszyklus. Bezugsfenster: `env.CLAUDE_CONTEXT_WINDOW` in `.claude/settings.json` (Default `200000`; bei 1M-Kontext auf `1000000` setzen).
- **SessionStart-Hook** (`.claude/hooks/session_start.py`, Matcher `startup|clear|compact`): lädt beim Start, nach `/clear` und nach einer Kompaktierung das jüngste Übergabedokument aus `tmp/handoff/` und den Schnell-Lookup aus `docs/LEARNINGS.md` in den Kontext.

Beide Hooks rufen `python` auf. Auf macOS/Linux-Systemen, die nur `python3` kennen: in `.claude/settings.json` an beiden Stellen den Befehl anpassen. Fehlt Python, läuft die Session ohne Sicherheitsnetz weiter; ein manueller Handoff geht jederzeit über den `handoff`-Skill.

### Learning-Kriterien

Ein technisches Problem gehört als Eintrag in `docs/LEARNINGS.md` (über den `knowledge-base-entry`-Skill), wenn **alle vier** zutreffen:

1. Die Lösung brauchte mehr als einen Anlauf.
2. Die Ursache war nicht aus der Fehlermeldung ablesbar.
3. Das Problem ist wiederholbar (liegt am Werkzeug, an der Umgebung oder am CMS).
4. Die Lösung ist nicht trivial ableitbar.

Leitfrage: *Würde ich beim nächsten Mal wieder genauso lange suchen?* Nicht hinein gehören: Tippfehler, einmalige Eigenheiten eines Kundendatensatzes, bereits Dokumentiertes.

## Medien-Maße

[OPTIONAL – nur einfügen, wenn Artikel Medien bekommen. prepare-media.py liest diese Werte.]

| Maß | Wert (px) |
|---|---|
| Textspalte | [800] |
| Hero | [1600] |
| Inline | [1400] |
| Detail | [900] |

[Wenn der Kunde die Theme-Maße nicht kennt: neutrale Defaults 800/1600/1400/900 eintragen und als „Default, nicht Theme-verifiziert" kennzeichnen.]

## Tools
[Nur Sektion einfügen, wenn projektweite Tools installiert werden. Beispiele:]
- **python-docx** – Auto-Generierung von `artikel.docx` über `.claude/skills/article-create/references/create-docx.py` (liest `artikel.md` + `seo.md`). Voraussetzung: `pip install python-docx`.
- **Pillow + prepare-media.py** – [nur wenn content-html-formatter mit Medien genutzt wird] Bild-/Video-Aufbereitung über `.claude/skills/content-html-formatter/references/prepare-media.py`: skaliert herunter (nie hoch), schneidet zu, exportiert verlustarm nach `artikel/content/<typ>/<slug>/bilder/`. Ziel-Breiten laut Sektion „Medien-Maße". Voraussetzung: `pip install pillow` (+ ffmpeg für Videos).
- **WebFetch** – Standardweg, um einzelne Website-Seiten für die Wissensbasis-Generierung zu lesen (kein Zusatz-Setup nötig). Für JS-lastige Seiten, die WebFetch nicht rendern kann: Inhalte manuell aus dem Browser kopieren oder die betroffene Seite in der CSV mitliefern.

## Projektspezifische Skills
- **article-create** (`.claude/skills/article-create/`) – **Pflicht-Skill.** Legt neue Artikel/Seiten in der Pflicht-Struktur unter `artikel/content/<content-typ>/<slug>/` an (Typ-Ordner aus dem Content-Typ), erzeugt die vier Pflichtdateien. Liest CLAUDE.md (CMS-Dateiname, CMS-Editor, Marke), `wissensbasis/tone-of-voice.md`, optional `wissensbasis/autoren/<slug>.md` und ein vorhandenes `seo/briefing-<slug>.md` (Briefing-First) zur Laufzeit.
- **handoff** (`.claude/skills/handoff/`) – **Pflicht-Skill.** Schreibt Session-Übergabedokumente nach `tmp/handoff/` (siehe „Projektgedächtnis").
- **knowledge-base-entry** (`.claude/skills/knowledge-base-entry/`) – **Pflicht-Skill.** Pflegt `docs/LEARNINGS.md` format-erhaltend (siehe „Projektgedächtnis", Learning-Kriterien).
[Optional – nur auflisten, was in Schritt 6 aktiv gehalten wurde:]
- **deep-keyword-gap-research** (`.claude/skills/deep-keyword-gap-research/`) – Nischenweite Discovery-/Gap-Recherche (7 Phasen, die Ebene VOR seo-page-research). Output nach `seo/keyword-gap/<nische>/` inkl. Briefing-Seeds. Projekt-Spezifik in `skill.config.json`.
- **seo-page-research** (`.claude/skills/seo-page-research/`) – Vorgelagerter Recherche-Skill (6 Phasen, SERP-First, SerpApi; Phase 2b Quellen-Sichtung). Liefert `seo/briefing-<slug>.md`, `seo/source-review-<slug>.md`, `seo/cluster-<slug>.csv`, `seo/cannibalization-<slug>.md`. Liest CLAUDE.md (Domain, Properties, Taxonomie-Brücke) und die Wissensbasis (`website-struktur.md`, `tone-of-voice.md`).
- **content-html-formatter** (`.claude/skills/content-html-formatter/`) – Formatiert Texte als CMS-fertiges HTML. Liest die projektspezifischen HTML-Bausteine aus `wissensbasis/html-elemente.md`; Medien aus `wissensbasis/medien/` (Aufbereitung via `prepare-media.py`); Autor aus `wissensbasis/autoren/`.
- **ga4-reports** (`.claude/skills/ga4-reports/`) – Zieht GA4-Daten über den MCP und präsentiert sie faktenbasiert. Property-ID und Domain sind im SKILL.md gesetzt.
- **brand-meta-ctr** (`.claude/skills/brand-meta-ctr/`) – On-demand-Skill für Meta-Title (≤60 Zeichen) und Meta-Description (≤155 Zeichen) im Hausstil; zieht bei Live-Seiten die echte GSC-Query als Keyword-Anker, schreibt die gewählte Variante in `seo.md`.
- **rueckverlinkung** (`.claude/skills/rueckverlinkung/`) – On-demand-Skill für rückwirkende interne Verlinkung nach dem Launch einer neuen Seite. Scannt Bestandsseiten (`ratgeber`, `beratung`, `produkte`, `kollektionen`; Profilseiten ausgeschlossen), Vorschlags-Gate vor jedem Schreiben, max. 1 Link pro alter Seite.

## Datenquellen
- **[csv-dateiname]** – [Anzahl] gecrawlte URLs von [WEBSITE_DOMAIN] (Spalten: url, title, h1, meta_description, canonical, content, method, word_count)
```

### Schritt 4: Erste Changelog-Datei erstellen

Lege den Ordner `changelog/` an und erstelle darin die Datei `[Datum].md` (Format `YYYY-MM-DD.md`):

```markdown
# [Datum] – Projekt-Setup

- Projektstruktur angelegt
- Wissensbasis erstellt aus gecrawltem Website-Content ([Anzahl] URLs)
- Dateien: [kurzform]-unternehmen.md, [kurzform]-leistungen.md, website-struktur.md, tone-of-voice.md, design.md
- tone-of-voice.md aus [Anzahl] der persönlichsten Kundentexte extrahiert, Em-Dash-Regel: [erlaubt sparsam | nicht verwenden]
- Datenquelle: [csv-dateiname]
- Skills parametrisiert: [Liste der aktiv gehaltenen Skills], README ersetzt
```

Keine zentrale CHANGELOG.md und keine MEMORY.md anlegen.

### Schritt 5: CSV analysieren und Wissensbasis generieren

Dies ist der wichtigste Schritt. Lies die CSV-Datei und erstelle daraus die Wissensbasis-Dateien. Die Qualität dieser Dateien bestimmt, wie gut alle zukünftigen Arbeiten im Projekt funktionieren.

#### 5a: CSV einlesen und verstehen

- Unique URLs zählen
- URLs nach Seitentyp kategorisieren (Startseite, Unternehmensseiten, Produktseiten, Blog, etc.)
- Inhalte der wichtigsten Seiten lesen (Startseite, Über-uns, Leistungsseiten)

#### 5b: [kurzform]-unternehmen.md

Extrahiere aus den Seiteninhalten:
- Wer ist das Unternehmen?
- Kernbotschaft / Alleinstellungsmerkmal
- Standort(e)
- Gründung / Geschichte (falls erwähnt)
- Muttergesellschaft / Konzernzugehörigkeit (falls vorhanden)
- Team / Ansprechpartner (falls vorhanden)
- Zielgruppen

Wichtig: Nur belegbare Informationen aus dem Content. Nichts erfinden.

#### 5c: [kurzform]-leistungen.md

Extrahiere aus den Produkt-/Leistungsseiten:
- Alle Produkte und Services mit Beschreibung
- Preise (falls erwähnt)
- Besonderheiten / USPs pro Produkt
- Zielgruppen pro Produkt (falls unterschiedlich)

Strukturiere nach Produktkategorien, nicht nach URL-Struktur.

#### 5d: website-struktur.md (fester Dateiname)

Das URL-Inventar heißt in jedem Projekt **`wissensbasis/website-struktur.md`** – ohne Kurzform-Präfix. Der feste Name ist verbindlich, weil `[WEBSITE_STRUKTUR_PFAD]` (deep-keyword-gap-research, Coverage-Inventar) und die Internal-Linking-Phase von `seo-page-research` darauf zeigen.

Analysiere alle URLs:
- URL-Kategorisierung nach Seitentyp (mit Tabellen)
- URL-Muster (z.B. /blog/[slug], /produkte/[kategorie])
- Navigationsstruktur (als Baumdarstellung rekonstruiert)
- Seitentyp-Statistik
- Besonderheiten (fehlende Blog-Struktur, Duplikate, Thin Content)

#### 5e: design.md

Versuche die Design-Richtlinien von der Website abzuleiten (WebFetch auf Startseite + eine Innenseite):
- **Farben:** Primär, Sekundär, Akzente, Text-/Hintergrundfarben
- **Logo:** Beschreibung, Platzierung, Farben
- **Typografie:** Schriftarten (Fallback für Präsentationen: Montserrat + Lato)
- **Farbzuordnung für Präsentationen:** Titelfolie-BG, Akzente, KPI-Cards, Tabellen-Header, positive/negative Werte
- **Buttons/CTAs:** Stil, Farben, Form

#### 5f: HTML-Elemente-Wissensbasis (Pflicht, wenn content-html-formatter genutzt wird)

Der Skill `content-html-formatter` funktioniert nur mit einer gefüllten `wissensbasis/html-elemente.md`. Lege die Datei wie folgt an:

1. **Vorlage kopieren** (beide Pfade relativ zum Projektverzeichnis):
   `.claude/skills/content-html-formatter/references/wissensbasis-template.md` → `wissensbasis/html-elemente.md`

2. **Mit dem User die CMS-Bausteine extrahieren.** Die Vorlage enthält `[AUS_CMS_EXTRAHIEREN]`-Blöcke für: Überschriften, Buttons/CTAs, Tabellen, Info-Boxen, FAQ/Accordion, Bild-Einbindung, Sektionen/Layout, wiederverwendbare Bausteine, Farbpalette, Link-Map, Tonalität.

3. **HTML muss 1:1 aus dem echten Frontend oder CMS-Backend stammen** – nicht aus Dokumentation oder Gedächtnis. Wenn der User den HTML-Code noch nicht extrahiert hat: konkrete Liste der benötigten Snippets an den User zurückgeben und abwarten.

4. **Solange die Datei unvollständig ist:** In der CLAUDE.md unter „Projektspezifische Skills" vermerken, dass `content-html-formatter` erst nach Vervollständigung nutzbar ist.

#### 5g: tone-of-voice.md (Pflicht)

Diese Datei ist verbindlich für jedes Projekt. Sie ist die Stimm-Referenz, gegen die jeder spätere Text geprüft wird. Ohne tone-of-voice.md driften alle generierten Texte in Generic-AI-Sprache, was bei den meisten Kunden auffällt und abgelehnt wird.

**Vorgehen:**

1. **Quellauswahl.** Die persönlichsten Seiten aus der CSV nehmen. In dieser Reihenfolge priorisieren:
   - Startseite (Hero, USPs)
   - Über-uns / Über-mich (zentrale Selbstdarstellung)
   - Leistungs-/Produktseiten (Service-Tonfall)
   - 4-6 Blog- oder Portfolio-Beiträge (erzählerischer Tonfall)
   - Kontaktseite, FAQ-Seiten

   Mindestens 10, idealerweise 15 Seiten.

2. **Text extrahieren.** CSV-Auszug der `content`-Spalte für die Ziel-URLs in `tmp/<kurzform>-texte-extract.txt` schreiben. Skript-Schnipsel (anpassbar):

   ```python
   import csv
   csv.field_size_limit(2147483647)
   target_urls = [...]
   with open('<csv>', encoding='utf-8') as f:
       for row in csv.DictReader(f):
           if row['url'] in target_urls:
               print('===URL:', row['url'])
               print(row['content'])
               print('===ENDE===')
   ```

3. **Mustererkennung.** Die Originaltexte lesen und auf folgende Muster prüfen:
   - **Anrede:** Du, Sie, Ihr? Mischformen?
   - **Perspektive:** Ich, Wir, unpersönlich?
   - **Wiederkehrende Phrasen** (Sätze, die auf mehreren Seiten fast wörtlich vorkommen, sind Markenzeichen)
   - **Vokabular-Cluster** (welche Adjektive, Verben, Substantive tauchen ungewöhnlich oft auf?)
   - **Satzbau-Eigenheiten** (kurz/lang, Drei-Listen, „&" statt „und", Em-Dash, Doppelpunkt-Pointen)
   - **Stilbrüche** (umgangssprachliche Einschübe, Selbst-Ironie, Aphorismen, eingestreute Anekdoten)
   - **CTA-Stil** (formal vs. spielerisch, Englisch erlaubt?)
   - **FAQ-Antwort-Eröffnung** (immer „Ja"/„Absolut" oder neutral?)
   - **Persönliche Bilder/Anekdoten,** die der Kunde immer wieder einstreut (Hobbys, Orte, Rituale, Familie)
   - **Aphorismen/Zitate,** die der Kunde verwendet
   - **No-Gos:** Welche Werbe- oder Buzzwords kommen NIE vor?
   - **Schreibmodi:** Schreibt der Kunde auf Service-Seiten anders als in Blog-Posts?

4. **Datei schreiben.** `wissensbasis/tone-of-voice.md` mit folgenden 16 Pflicht-Abschnitten anlegen:

   1. Kern-Identität (Selbstporträt mit Original-Zitat)
   2. Voice-Prinzipien (5-7 Top-Level-Regeln)
   3. Anrede-Regeln im Detail
   4. Tonalität (Wie es sich anfühlen muss / Klingt wie / Klingt nicht wie)
   5. Vokabular-Cluster
   6. Wiederkehrende Sätze (mit Original-Zitaten)
   7. Satzbau & Rhythmus
   8. Schreibmodi (Erzähl-/Service-Modus)
   9. Strukturmuster
   10. CTA-Pool
   11. FAQ-Stil
   12. Persönliche Bilder & Anekdoten
   13. No-Gos
   14. Vorher/Nachher-Beispiele (Generisch → Kunde)
   15. Checkliste vor Veröffentlichung (15-20 Punkte)
   16. Schnell-Referenz für andere Skills

5. **Belegen statt behaupten.** Jede Stilregel muss mit einem Original-Zitat aus den Kundentexten belegt sein. Wer keine Zitate liefern kann, hat die Stimme nicht extrahiert sondern erfunden.

6. **Em-Dash-Regel pro Kunde festlegen.** In den Originaltexten zählen, wie oft „–" pro 1.000 Wörter vorkommt. Wenn der Kunde es selbst nutzt: in der Voice-Datei freigeben (mit Limit). Wenn nicht: weiterhin verbieten.

7. **Quellangabe + Stand** ans Ende der Datei.

#### 5h: Weitere Wissensbasis-Dateien (optional)

Wenn das Projekt weitere Referenzen braucht, lege zusätzliche Dateien an und ergänze sie im CLAUDE.md-Baum. Beispiele:
- **`markenrichtlinien.md`** wenn der Kunde ein detailliertes Brand Book hat
- **`redaktionsplan.md`** wenn es eine feste Content-Pipeline gibt

#### 5i: autoren/ (optional – wenn der Kunde Artikel mit Autoren-Attribution hat)

Wenn Blog-/Ratgeber-Artikel einen sichtbaren Autor + Author-Card und Schema.org-`author` bekommen (E-E-A-T-Signal), lege `wissensbasis/autoren/` an. So liest `content-html-formatter` die Author-Card-Daten zentral, statt sie pro Artikel frei zu formulieren (Drift-Gefahr).

1. **`wissensbasis/autoren/README.md`** mit dem Schema: pro Autor eine Datei `<slug>.md` mit YAML-Frontmatter (`slug`, `display_name`, `full_name`, `role`, `avatar_initials`, `profile_url`) + Markdown-Sektionen (copy-paste-fertiges Author-Card-/CMS-Snippet, Bio-Kurz, Rolle & Expertise, Schema.org-Person, verbindliche Schreibregeln Display-Name vs. voller Name).
2. **Pro Autor eine `<slug>.md`** aus den Team-/Über-uns-Infos der CSV ableiten. Mindestens den/die Haupt-Autor(en).
3. Verknüpfung: In jeder `seo.md` steht der Autor-Slug; `content-html-formatter` und das Article-JSON-LD ziehen die Daten aus der Autoren-Datei.

#### 5j: medien/ (optional – wenn der Kunde einen Bild-/Videobestand hat)

Wenn lokale Bilder/Videos in Artikel eingebunden werden, lege `wissensbasis/medien/` an, damit Motive nicht geraten werden und der Upload-/CDN-Workflow nachvollziehbar ist.

1. **`wissensbasis/medien/README.md`** mit Schema (pro Datei: lokaler Name · CDN-URL oder TODO · Status · Motiv · Tags · Eignung Hero/Inline/Detail · Alt-Text · Vorsicht-Flag), dem **CDN-Workflow** des Kunden-CMS (lokaler Dateiname ist oft NICHT der CDN-Name; URL erst nach Upload erfassbar) und projektspezifischen Auswahl-Vorsichtsregeln.
2. **`bilder-katalog.md` / `videos-katalog.md`** als Gerüst; verifizierte Live-Mappings (bereits hochgeladene Bilder mit CDN-URL) eintragen.
3. **Wichtig:** Vor Verwendung jedes Bild ansehen (Read-Tool) – Dateinamen sind oft unzuverlässig; bei Produkt-/Fremd-Motiven Kunden-Bestätigung einholen. Die Sektion „Medien-Maße" in CLAUDE.md hinterlegen (Schritt 1), damit `prepare-media.py` korrekt dimensioniert.

### Schritt 6: Skill-Vorlagen in-place parametrisieren

Alle Skills liegen bereits unter `.claude/skills/` – sie kamen mit dem Vorlage-Repo. Nichts wird kopiert. In diesem Schritt werden nur noch die **Platzhalter direkt in den bestehenden Dateien** ersetzt. Bei den optionalen Skills den User vorab fragen, welche überhaupt gebraucht werden; nicht benötigte Skill-Ordner kann er löschen (niemals die vier Pflicht-Skills).

#### Platzhalter-Whitelist (exakt diese 7, sonst nichts)

`project-setup` ersetzt beim Setup **ausschließlich** die folgenden sieben Platzhalter. Ersetzt wird **jedes Vorkommen** in den gelisteten Dateien – auch in Frontmatter- und Doku-Zeilen, die den Mechanismus beschreiben (z.B. der `_doc`-String in `skill.config.json`); nach dem Setup stehen dort die realen Werte. Pfade relativ zu `.claude/skills/`:

| Platzhalter | Bedeutung | Dateien |
|---|---|---|
| `[KUNDENNAME]` | Marken-/Kundenname | `ga4-reports/SKILL.md` + `ga4-reports/references/api-mapping.md`; `rueckverlinkung/SKILL.md` (Frontmatter); `brand-meta-ctr/SKILL.md` (Frontmatter); `deep-keyword-gap-research/SKILL.md` (Frontmatter) |
| `[WEBSITE_DOMAIN]` | nackte Domain ohne Protokoll (z.B. `sonnenwerk-solar.de`) | `ga4-reports/SKILL.md` + `ga4-reports/references/api-mapping.md`; `seo-page-research/SKILL.md`; `brand-meta-ctr/SKILL.md`; `deep-keyword-gap-research/SKILL.md` + `deep-keyword-gap-research/skill.config.json` (→ `selfDomain`) |
| `[GSC_PROPERTY]` | Search-Console-Property, `https://…/` oder `sc-domain:…` | `seo-page-research/SKILL.md` + `seo-page-research/README.md`; `brand-meta-ctr/SKILL.md`; `deep-keyword-gap-research/SKILL.md` + `deep-keyword-gap-research/skill.config.json` (→ `gscSite`) |
| `[PROPERTY_ID]` | GA4 Property-ID (numerisch) | `ga4-reports/SKILL.md` + `ga4-reports/references/api-mapping.md` |
| `[STAND_DATUM]` | Datum der Mapping-Verifikation `JJJJ-MM-TT` | `ga4-reports/references/api-mapping.md` |
| `[NISCHE]` | Branche/Nische | `deep-keyword-gap-research/skill.config.json` (→ `projectNiche`) + `deep-keyword-gap-research/SKILL.md` |
| `[WEBSITE_STRUKTUR_PFAD]` | Pfad zur URL-Inventar-Datei, Standard `wissensbasis/website-struktur.md` | `deep-keyword-gap-research/skill.config.json` (→ `seoInventory.path`) + `deep-keyword-gap-research/SKILL.md` |

Dieselben Platzhalter-Namen kommen auch im CLAUDE.md-Template (Schritt 3) vor und werden dort mit denselben Werten gefüllt.

**Ausdrücklich NICHT ersetzen:** `[TODO]`, `[AUS_CMS_EXTRAHIEREN]`, `[CDN-BASIS-URL]`, `[ARTIKELBILD-KLASSE]`, `[BUTTON]`, `[YYYY-MM-DD]`, `[TT.MM.JJJJ]`, `[slug]`, `[Berichtsname]`, `[Wert]`, `[n/60]`, `[n/155]` und alle anderen Eckklammer-Marker in den Skills. Das sind **Laufzeit-/Ausfüll-Lücken**, die erst bei der späteren Arbeit gefüllt werden – nicht beim Setup. Grundregel: Strukturen, Regeln und Abläufe der Skills bleiben unverändert, sonst driften die Skills über Projekte hinweg auseinander.

#### 6a: article-create (Pflicht, immer aktiv)

Der `article-create`-Skill ist generisch geschrieben und liest alle projektspezifischen Werte zur Laufzeit aus `CLAUDE.md` (CMS-Dateiname, CMS-Editor, Marke, Domain, Content-Typen-Tabelle) und `wissensbasis/tone-of-voice.md` (Anrede, Vokabular, CTA-Pool). **Keine Platzhalter im Skill selbst.**

Stattdessen sicherstellen, dass folgende Werte in der Projekt-CLAUDE.md (Schritt 3) gesetzt sind:

| In CLAUDE.md > Über | Beispielwert |
|---|---|
| `**CMS-Dateiname:** wordpress.html` | (oder shopify.html, webflow.html, typo3.html, cms.html) |
| `**CMS-Editor:** Divi` | (oder Liquid, Webflow Designer, TYPO3 Backend, …) |
| `**Marke:** <Markenname>` | Erscheint auf dem Deckblatt jedes artikel.docx (Default: erste H1 in CLAUDE.md) |

Optional in CLAUDE.md > Über: `**CTA-Pattern:** <regex>` – zusätzliches Regex zur CTA-Erkennung im DOCX-Renderer.

**Verifikation:** Nach dem Setup einen Smoke-Test laufen lassen – `article-create` für einen Test-Slug aufrufen, prüfen, dass alle vier Pflichtdateien im richtigen Typ-Ordner (`artikel/content/<content-typ>/<slug>/`) mit korrektem CMS-Dateinamen und Marken-DOCX-Deckblatt erscheinen. Test-Ordner anschließend löschen.

#### 6b: handoff + knowledge-base-entry (Pflicht, immer aktiv)

Beide Skills sind generisch und brauchen **keine Parametrisierung**. Sie sind Teil des Projektgedächtnisses (Schritt 3, Sektion „Projektgedächtnis"): `handoff` schreibt Übergabedokumente nach `tmp/handoff/`, `knowledge-base-entry` pflegt `docs/LEARNINGS.md`. Der Kontext-Wächter-Hook (`context_guard.py`) verweist zur Laufzeit auf beide – deshalb dürfen sie **niemals gelöscht** und nicht als „löschbar" kommuniziert werden. Prüfen: beide Ordner vorhanden, `.claude/hooks/` + `.claude/settings.json` unverändert.

#### 6c: seo-page-research (Keyword-Recherche auf Seitenebene)

Vorgelagerter Recherche-Skill (6 Phasen, SERP-First): SERP-Analyse über **SerpApi** (Playwright nur Fallback), eigene Phase 2b „Quellen-Sichtung". Output in den projektweiten `seo/`-Ordner: `briefing-<slug>.md`, `source-review-<slug>.md`, `cluster-<slug>.csv`, `cannibalization-<slug>.md` (Roh-Snapshots nach `tmp/serp-snapshots/`). `article-create` verschiebt die Artefakte später in den Artikel-Ordner.

1. **Platzhalter ersetzen** laut Whitelist-Tabelle: `[WEBSITE_DOMAIN]` und `[GSC_PROPERTY]` in `SKILL.md`, `[GSC_PROPERTY]` zusätzlich in `README.md`.
2. **Voraussetzungen prüfen:** `serpapi`-Eintrag in `.mcp.json` (eigener Key des Users, siehe Schritt 1) sowie die mcpwerk-Server `mcpwerk-ads` (Keyword-Volumina) und `mcpwerk-gsc` (Kannibalisierung) aus der committeten `.mcp.json`.
3. **CLAUDE.md-Verzahnung:** Die Sektionen „Content-Typen + Taxonomie-Brücke" und „Durchgängiger Content-Workflow" (Schritt 3) müssen gefüllt sein – daraus zieht der Skill den Projekt-Content-Typ pro Cluster. Internal-Linking liest `wissensbasis/website-struktur.md`.
4. **Wenn nicht gebraucht:** Ordner löschen und in CLAUDE.md nicht auflisten.

#### 6d: deep-keyword-gap-research (nischenweite Discovery)

Discovery-/Gap-Skill (7 Phasen, die Ebene VOR seo-page-research): findet unterbediente „Need Keywords" und bündelt sie zu einer priorisierten Cluster-Map. Deterministische Skripte übernehmen Harvest, Clustering und Scoring. Output nach `seo/keyword-gap/<nische>/` (u.a. `06_report.md` + pro Top-Cluster ein `briefing-seed-<id>.json` als Übergabe an `seo-page-research`).

1. **Platzhalter ersetzen** laut Whitelist-Tabelle: in `SKILL.md` (`[KUNDENNAME]`, `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]`, `[NISCHE]`, `[WEBSITE_STRUKTUR_PFAD]`) und in `skill.config.json` (`selfDomain`, `gscSite`, `projectNiche`, `seoInventory.path`).
2. **`[WEBSITE_STRUKTUR_PFAD]`** bekommt den Standard-Wert `wissensbasis/website-struktur.md` (Schritt 5d) – das Coverage-Inventar des Skills.
3. **Voraussetzungen prüfen:** wie 6c (`serpapi` mit eigenem Key, `mcpwerk-ads`, `mcpwerk-gsc`); weitere technische Voraussetzungen dokumentiert der Skill selbst.
4. **Wenn nicht gebraucht:** Ordner löschen und in CLAUDE.md nicht auflisten.

#### 6e: content-html-formatter (wenn ein CMS genutzt wird)

1. **Nichts im SKILL.md selbst ändern** – der Skill ist bewusst generisch und liest alles Projektspezifische aus `wissensbasis/html-elemente.md`. **Keine Platzhalter.**
2. **Wissensbasis vorbereiten:** siehe Schritt 5f. Der Skill verweigert den Output, solange `wissensbasis/html-elemente.md` nicht existiert oder leer ist.
3. **Medien-Anbindung (falls der Kunde Bild-/Videobestand hat):** `wissensbasis/medien/` anlegen (Schritt 5j), Autoren-Daten in `wissensbasis/autoren/` (Schritt 5i). Für `references/prepare-media.py` muss die CLAUDE.md-Sektion „Medien-Maße" gesetzt sein, sonst nutzt das Script die neutralen Defaults 800/1600/1400/900 px.
4. **Wenn nicht gebraucht:** Ordner löschen und in CLAUDE.md nicht auflisten.

#### 6f: ga4-reports (wenn GA4 angebunden ist)

1. **Platzhalter ersetzen** laut Whitelist-Tabelle (Edit-Tool, in-place): `[PROPERTY_ID]`, `[WEBSITE_DOMAIN]`, `[KUNDENNAME]`, `[STAND_DATUM]` in `SKILL.md` und `references/api-mapping.md`.
2. **Schlüsselereignisse-Tabelle aktualisieren:** In `SKILL.md` unter „[KUNDENNAME] Schlüsselereignisse" und in `references/api-mapping.md` die Beispiel-Events (`beispiel_event_1`, `beispiel_event_2`, …) durch die tatsächlich konfigurierten Schlüsselereignisse der GA4-Property ersetzen. Wenn noch nicht bekannt: Tabelle als `TODO – beim ersten GA4-Request mit dem User abstimmen` markieren.
3. **Wenn das Projekt kein GA4 hat:** Ordner löschen und in CLAUDE.md nicht auflisten.

#### 6g: brand-meta-ctr (Meta-Tags im Hausstil)

On-demand-Skill für CTR-optimierte Meta-Title (≤60 Zeichen) und Meta-Description (≤155 Zeichen) nach fester Formel + Glyph-System; schreibt die gewählte Variante in die `seo.md` der Seite. Bei Live-Seiten zieht er die echte GSC-Query als Keyword-Anker.

1. **Platzhalter ersetzen** laut Whitelist-Tabelle: `[KUNDENNAME]` (Frontmatter-Trigger), `[WEBSITE_DOMAIN]`, `[GSC_PROPERTY]` in `SKILL.md`.
2. **Voraussetzung:** `mcpwerk-gsc` aus der committeten `.mcp.json` (für den GSC-Abgleich bei Live-Seiten).
3. **Wenn nicht gebraucht:** Ordner löschen und in CLAUDE.md nicht auflisten.

#### 6h: rueckverlinkung (rückwirkende interne Verlinkung)

On-demand-Skill: Nach dem Launch einer neuen Seite scannt er die Bestandsseiten (`ratgeber`, `beratung`, `produkte`, `kollektionen`; Profilseiten ausgeschlossen) auf natürliche Linkstellen AUF die neue Seite. Vorschlags-Gate vor jedem Schreiben, max. 1 Link pro alter Seite, variierte Ankertexte.

1. **Platzhalter ersetzen** laut Whitelist-Tabelle: `[KUNDENNAME]` im Frontmatter von `SKILL.md`.
2. **Wenn nicht gebraucht:** Ordner löschen und in CLAUDE.md nicht auflisten.

#### 6i: grilling, grill-me, writing-great-skills (Werkzeuge)

Generisch, keine Platzhalter, werden nicht in der Projekt-CLAUDE.md gelistet. `grilling`/`grill-me` für Interviews und Plan-Stresstests, `writing-great-skills` als Referenz beim Schreiben eigener Skills. Wenn das Projekt sie nicht braucht, kann der User die Ordner löschen.

#### 6j: project-setup selbst

Der `project-setup`-Skill bleibt nach dem Setup im Projekt liegen. Das ist gewollt – er kann später erneut aufgerufen werden, etwa um eine fehlende Wissensbasis-Sektion nachzuziehen oder die QA-Checkliste zu prüfen. In CLAUDE.md unter „Projektspezifische Skills" wird er **nicht** aufgelistet, weil er kein Content-Produktiv-Skill ist.

#### 6k: Weitere Skills

Wenn das Projekt weitere wiederkehrende Workflows hat (Newsletter-Erstellung, Produktbeschreibungen, Briefings), können neue Skills direkt unter `.claude/skills/` angelegt werden. Wenn diese generisch genug sind, um auch in anderen Projekten nützlich zu sein: zurück ins Vorlage-Repo einpflegen, damit sie bei zukünftigen Setups automatisch mitkommen. Nach Anlage: In CLAUDE.md Sektion „Projektspezifische Skills" ergänzen.

#### Verifikations-Grep (NUR auf die Whitelist)

Nach der Parametrisierung prüfen, dass keiner der sieben Whitelist-Platzhalter mehr übrig ist – **nur** diese sieben Namen greppen, keine anderen Eckklammer-Marker:

```
grep -rnE "\[(KUNDENNAME|WEBSITE_DOMAIN|GSC_PROPERTY|PROPERTY_ID|STAND_DATUM|NISCHE|WEBSITE_STRUKTUR_PFAD)\]" CLAUDE.md .claude/skills/ | grep -v "skills/project-setup/"
```

Erwartung: **keine Treffer.** (`project-setup` ist ausgenommen, weil dieses Dokument die Platzhalter-Namen als Doku enthält. Gelöschte Skill-Ordner entfallen von selbst.) Treffer bedeuten: Ersetzung unvollständig – nacharbeiten. Alle anderen Eckklammer-Marker (`[TODO]`, `[AUS_CMS_EXTRAHIEREN]`, `[slug]`, …) bleiben bewusst stehen und sind KEIN Fehler.

### Schritt 7: README ersetzen

Die `README.md` im Projekt-Root ist die Doku-/Werbe-README des Vorlage-Repos (Feature-Liste, mcpwerk-Erklärung, Quick Start). In einem Kundenprojekt ist sie fehl am Platz. Ersetze sie durch eine schlanke Projekt-README: **5–15 Zeilen, kein Marketing**, mit genau diesen Inhalten – Kundenname, Zweck, Kurzstruktur, Verweis auf CLAUDE.md als verbindliche Arbeitsgrundlage, MCP-Hinweis:

```markdown
# [Kundenname] – SEO-Content-Projekt

SEO-/Content-Projekt für [Kundenname] ([WEBSITE_DOMAIN]), aufgesetzt aus dem SEO-Projekt-Template.

**Verbindliche Arbeitsgrundlage ist die [CLAUDE.md](CLAUDE.md)** – dort stehen alle Konventionen, Quellenpfade und Skills.

Struktur (Kurzfassung):
- `artikel/content/<typ>/<slug>/` – Seiten-Entwürfe (vier Pflichtdateien pro Seite)
- `wissensbasis/` – Kundenwissen, Tone of Voice, Design (nur lesen)
- `seo/` – projektweite Recherchen · `berichte/` – Reports · `changelog/` – Tagesprotokolle

MCP: Die Google-Anbindung (GSC/GA4/Ads/GTM) kommt aus der committeten `.mcp.json` (mcpwerk-Server; Opt-in-Dialog beim ersten Öffnen, Anmeldung per OAuth über `/mcp`).
```

Falls die Template-README Bild-Assets referenziert (z.B. unter `docs/assets/`), können diese mit entfernt werden – `docs/` selbst bleibt bestehen (dort entsteht `LEARNINGS.md`).

### Schritt 8: Abschluss

Zeige dem User eine Zusammenfassung:
- Welche Ordner angelegt wurden
- Welche Dateien erstellt wurden (inkl. neue CLAUDE.md und README)
- Wie viele URLs analysiert wurden
- Welche Seitentypen gefunden wurden
- Welche Skills aktiv gehalten und parametrisiert wurden, welche gelöscht werden können
- Status der MCP-Anbindung (Opt-in erklärt? SerpApi-Key nötig/vorhanden?)
- Hinweise auf Auffälligkeiten (z.B. viele Thin-Content-Seiten, fehlende Meta-Descriptions)

Führe zum Schluss die **QA-Checkliste** aus (siehe unten).

---

## Wichtige Regeln

1. **Nur belegbare Informationen.** Die Wissensbasis basiert ausschließlich auf dem Content aus der CSV. Keine externen Recherchen, keine Annahmen.

2. **Deutsche Umlaute.** In aller deutschsprachiger Prosa echte Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. NIEMALS ASCII-Transliterationen (ae/oe/ue/ss). Ausnahmen: YAML-Frontmatter in SKILL.md-Dateien (Encoding-Sicherheit), URL-Slugs/Dateinamen und Code-Dateien – Python-/JS-Quelltexte dürfen in Kommentaren und Konsolen-Ausgaben ASCII-Transliteration behalten.

3. **Quellenangabe.** Jede Wissensbasis-Datei endet mit Quelle und Stand:
   ```
   *Quelle: [csv-dateiname] ([Anzahl] URLs)*
   *Stand: [Datum]*
   ```

4. **MCP über die committete `.mcp.json`.** Die Verbindungen (vier mcpwerk-Server: GSC, GA4, Ads, GTM) kommen aus der `.mcp.json` des Vorlage-Repos – project-setup richtet keine Verbindungen ein und fragt keine Credentials ab. Der Skill trägt nur die **Kunden-Properties** (GA4 Property-ID, GSC-Property, Domain) in CLAUDE.md und die betroffenen Skills ein und **erklärt dem User den Opt-in**: Aktivierungs-Dialog beim ersten Öffnen, OAuth über `/mcp`. Ausnahme SerpApi: nicht vorkonfiguriert, eigener Key des Users, selbst als `serpapi`-Eintrag in `.mcp.json` ergänzen (nötig für `seo-page-research` und `deep-keyword-gap-research`).

5. **Pflicht-Skills nie löschen.** `project-setup`, `article-create`, `handoff` und `knowledge-base-entry` bleiben in jedem Projekt. Nur die optionalen Skill-Ordner dürfen (nach Rückfrage) gelöscht werden.

---

## QA-Checkliste

Bevor du das Setup abschließt, prüfe die folgenden Punkte.

### CLAUDE.md

- [ ] `# CLAUDE.md – [Kundenname] Projekt` als H1
- [ ] `## Über [Kundenname]` – Firma, Branche, Website, Zielgruppen, Leistungen + Pflichtzeilen `**Marke:**`, `**CMS-Dateiname:**`, `**CMS-Editor:**`
- [ ] `## Analytics-Anbindung` – GA4 Property-ID, GSC-Property, Schlüsselereignisse (oder TODO)
- [ ] `## MCP-Konfiguration` – mcpwerk-Tabelle, Opt-in-Hinweis, Kunden-Properties, SerpApi-Hinweis
- [ ] `## Schreibregeln` – Umlaut-Regel (inkl. der drei Ausnahmen), Namenskonvention, Em-Dash-Regel, Ton
- [ ] `## Quellenpfade` – kompletter Ordnerbaum mit Kommentaren (inkl. `docs/`, `tmp/handoff/`, `seo/keyword-gap/`)
- [ ] `## Artikel-Ordnerkonvention` – typisierte Struktur `artikel/content/<content-typ>/<slug>/`, Content-Typ→Ordner-Segment-Tabelle (Profilseite → `profile`), 4 Pflichtdateien
- [ ] `## Durchgängiger Content-Workflow` – Kette deep-keyword-gap-research → seo-page-research → article-create → content-html-formatter (soweit aktiv)
- [ ] `## Content-Typen (Kurzreferenz)` + Taxonomie-Brücke – kundenspezifisch gefüllt (wenn Recherche-Skills aktiv)
- [ ] `## Changelog-Konvention` – Tagesdateien in `changelog/`
- [ ] `## Projektgedächtnis` – vier Ebenen, Kontext-Wächter (beide Hooks, Schwellen 60/85 %, `CLAUDE_CONTEXT_WINDOW`), Learning-Kriterien
- [ ] `## Medien-Maße` – gefüllt (Theme-Werte oder Defaults 800/1600/1400/900), falls Medien genutzt werden
- [ ] `## Tools` – nur wenn projektweite Tools installiert
- [ ] `## Projektspezifische Skills` – Pflicht-Skills (article-create, handoff, knowledge-base-entry) + aktive optionale Skills
- [ ] `## Datenquellen` – CSV-Datei dokumentiert

### Wissensbasis

- [ ] `wissensbasis/[kurzform]-unternehmen.md` vorhanden und mit Quellenangabe
- [ ] `wissensbasis/[kurzform]-leistungen.md` vorhanden und mit Quellenangabe
- [ ] `wissensbasis/website-struktur.md` vorhanden (fester Name, ohne Kurzform-Präfix – `[WEBSITE_STRUKTUR_PFAD]` zeigt darauf) und mit Quellenangabe
- [ ] `wissensbasis/tone-of-voice.md` vorhanden, alle 16 Pflicht-Abschnitte ausgefüllt, jede Stilregel mit Original-Zitat belegt, Em-Dash-Regel pro Kunde entschieden
- [ ] `wissensbasis/design.md` vorhanden
- [ ] Falls `content-html-formatter` aktiv bleibt: `wissensbasis/html-elemente.md` existiert – entweder gefüllt oder mit klarer TODO-Liste an den User
- [ ] Falls der Kunde Autoren-Attribution nutzt: `wissensbasis/autoren/` mit README + mind. einem Autor-Eintrag
- [ ] Falls der Kunde einen Bildbestand hat: `wissensbasis/medien/` mit README + Katalog-Gerüst, Sektion „Medien-Maße" in CLAUDE.md gefüllt

### Skills & Platzhalter

- [ ] **`article-create` liegt unter `.claude/skills/article-create/` (Pflicht-Skill, niemals löschen)**
- [ ] **`handoff` und `knowledge-base-entry` liegen unter `.claude/skills/` (Pflicht-Skills, niemals löschen – der Kontext-Wächter verweist auf sie)**
- [ ] Smoke-Test article-create für Test-Slug erfolgreich (vier Pflichtdateien im richtigen Typ-Ordner, korrekter CMS-Dateiname, DOCX-Deckblatt zeigt Marke); Test-Ordner danach gelöscht
- [ ] Nicht genutzte optionale Skill-Ordner gelöscht und nicht in CLAUDE.md gelistet
- [ ] **Verifikations-Grep auf die 7 Whitelist-Platzhalter ist leer** (Befehl aus Schritt 6; project-setup ausgenommen)
- [ ] Schlüsselereignis-Tabellen in ga4-reports aktualisiert oder als TODO markiert
- [ ] Laufzeit-Marker (`[TODO]`, `[AUS_CMS_EXTRAHIEREN]`, `[slug]`, …) unangetastet – sie sind KEIN Setup-Fehler

### Infrastruktur & Projektgedächtnis

- [ ] `python --version` läuft (Voraussetzung für create-docx.py und beide Hooks); auf Systemen mit nur `python3`: beide Stellen in `.claude/settings.json` angepasst
- [ ] `.claude/settings.json` vorhanden, `env.CLAUDE_CONTEXT_WINDOW` passend gesetzt (Default `200000`; bei 1M-Kontext `1000000`)
- [ ] `.mcp.json`-Opt-in-Dialog dem User erklärt (mcpwerk-Server aktiviert oder bewusst abgelehnt); SerpApi-Key geklärt, falls Recherche-Skills aktiv
- [ ] **README ersetzt** – schlanke Projekt-README (5–15 Zeilen), keine Template-Werbung mehr
- [ ] Erste Changelog-Datei in `changelog/` angelegt

Wenn ein Punkt fehlt und kein triftiger Grund dagegen spricht: ergänzen.
