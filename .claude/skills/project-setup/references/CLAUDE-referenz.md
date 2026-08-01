# Referenz-CLAUDE.md

Diese Datei ist ein **ausgefülltes Beispiel** einer gut verzahnten CLAUDE.md. Sie dient dem project-setup-Skill als Vorbild – sowohl was Struktur als auch Detailtiefe angeht. Das fiktive Projekt „Sonnenwerk Solar GmbH" (SWG) ist so gewählt, dass jede Sektion inhaltlich gefüllt werden muss; im Beispiel sind alle optionalen Skills aktiv.

Beim echten Projektsetup:
- Struktur 1:1 übernehmen
- Inhalte durch die Werte des Kunden ersetzen
- Optionale Sektionen weglassen, die nicht anwendbar sind (z.B. „Medien-Maße" ohne Bildbestand, „Tools" ohne Installationen); die Pflicht-Sektionen inkl. „Projektgedächtnis" und „MCP-Konfiguration" bleiben immer

---

# CLAUDE.md – Sonnenwerk Solar GmbH Projekt

## Über Sonnenwerk Solar GmbH

- **Sonnenwerk Solar GmbH** (SWG) – Photovoltaik-Fachbetrieb für Eigenheimbesitzer und kleine Gewerbekunden in Norddeutschland
- Website: sonnenwerk-solar.de
- Standort: Hamburg, Projektgebiet: Schleswig-Holstein, Niedersachsen, Bremen
- Zielgruppen: Eigenheimbesitzer (Neubau + Bestand), kleine Gewerbebetriebe, Genossenschaften
- Leistungen: PV-Anlagenplanung, Installation, Stromspeicher, Wallbox-Integration, Wartung, Förderberatung
- Konzernzugehörigkeit: unabhängig, eigentümergeführt seit 2011
- **Marke:** Sonnenwerk Solar
- **CMS-Dateiname:** wordpress.html
- **CMS-Editor:** Divi

## Analytics-Anbindung

- **GA4 Property-ID:** 384502917
- **GA4 Property-Name:** sonnenwerk-solar.de – GA4
- **GSC Property:** sc-domain:sonnenwerk-solar.de
- **Standard-Zeitraum für Reports:** letzte 28 Tage (vergleichbar mit GSC-Standard)
- **Schlüsselereignisse (GA4):**
  - `kontaktanfrage` (Formular-Abschluss)
  - `beratungstermin` (Termin-Buchung)
  - `call` (Klick auf Telefonnummer)
  - `foerderung_download` (PDF-Download Förderübersicht)

## MCP-Konfiguration

Die Google-Datenanbindung läuft über die vier gehosteten mcpwerk-Server aus der committeten `.mcp.json` – keine lokale Installation, keine API-Keys:

| Server | URL | Daten |
|---|---|---|
| `mcpwerk-gsc` | `https://mcp.mcpwerk.com/gsc/mcp` | Google Search Console |
| `mcpwerk-ga4` | `https://mcp.mcpwerk.com/ga4/mcp` | Google Analytics 4 |
| `mcpwerk-ads` | `https://mcp.mcpwerk.com/ads/mcp` | Google Ads (inkl. Keyword Planner) |
| `mcpwerk-gtm` | `https://mcp.mcpwerk.com/gtm/mcp` | Google Tag Manager |

- Beim ersten Öffnen des Projekts fragt Claude Code per **Opt-in-Dialog**, ob die Server aktiviert werden sollen; die Anmeldung beim Google-Konto läuft danach per OAuth über `/mcp`.
- Tool-Namen folgen dem Schema `mcp__mcpwerk-<kuerzel>__…` (z.B. `mcp__mcpwerk-ga4__get_ga4_data`, `mcp__mcpwerk-gsc__get_search_analytics`).
- **Kunden-Properties:** GA4 `384502917`, GSC `sc-domain:sonnenwerk-solar.de` (Schlüsselereignisse siehe „Analytics-Anbindung").
- **SerpApi ist NICHT Teil des Templates** – der `serpapi`-Eintrag in `.mcp.json` wurde beim Setup mit dem eigenen Key des Beraters ergänzt (nötig für `seo-page-research` und `deep-keyword-gap-research`).

## Schreibregeln

- **Tone of Voice:** `wissensbasis/tone-of-voice.md` ist die verbindliche Stimm-Referenz. Vor jedem Text lesen, danach Checkliste durchgehen. Texte müssen klingen wie aus dieser Datei abgeleitet. Generic-AI-Sprache wird vom Kunden abgelehnt.
- **Deutsche Umlaute:** In aller deutschsprachiger Prosa echte Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. NIEMALS ASCII-Transliterationen (ae/oe/ue/ss). Ausnahmen: YAML-Frontmatter in SKILL.md-Dateien, URL-Slugs und Code-Dateien (Python-/JS-Quelltexte dürfen in Kommentaren und Konsolen-Ausgaben ASCII behalten).
- **Anrede:** Siezen (Sie/Ihr/Ihnen). Nie duzen.
- **Schreibweise „Sonnenwerk Solar GmbH"** oder Kurzform **„SWG"** – konsistent halten. Nicht „Sonnenwerk" allein (Verwechslung mit Konkurrenz).
- **Em-Dash „–":** Der SWG-Geschäftsführer nutzt ihn in Originaltexten nicht (geprüft beim Voice-Setup). Daher in neuen Texten nicht verwenden. Geviertstrich „—" generell nicht.
- **Tonalität:** sachlich-informativ, lösungsorientiert. Kein Werbesprech („die beste Anlage der Welt"), keine Superlative ohne Beleg. Vollständige Voice-Spezifikation in `wissensbasis/tone-of-voice.md`.
- **Fachbegriffe erklären:** kWp, Einspeisevergütung, Eigenverbrauchsquote, Wechselrichter – beim ersten Vorkommen kurz definieren.
- **Zahlen und Preise:** nur aus `wissensbasis/swg-leistungen.md` übernehmen, niemals schätzen oder aus Trainingsdaten ergänzen.

## Quellenpfade

```
Projekte/SWG/
├── wissensbasis/                # Referenz-Dateien (nur lesen)
│   ├── swg-unternehmen.md       # Firma, Historie, Standort, Team, Zielgruppen
│   ├── swg-leistungen.md        # Produkte, Pakete, Preise, USPs
│   ├── website-struktur.md      # URL-Inventar (fester Name – Coverage-Quelle für deep-keyword-gap-research
│   │                            # und Internal-Linking-Basis für seo-page-research)
│   ├── tone-of-voice.md         # Verbindliche Stimm-Referenz – Pflicht-Lektüre vor jedem Text
│   ├── design.md                # Farben, Typografie, Logo, CTA-Stil (für Präsentationen)
│   ├── html-elemente.md         # CMS-HTML-Bausteine (WordPress/Divi) – Pflicht für content-html-formatter
│   ├── autoren/                 # Author-Card- und Schema.org-Author-Daten pro Autor
│   │   ├── README.md            #   – Schema-Doku + Liste aktiver Autoren
│   │   └── jan-bergmann.md      #   – Jan Bergmann (SWG-Geschäftsführer, Fachautor PV)
│   └── medien/                  # Bild-/Video-Katalog: lokaler Name ↔ CDN-URL, Tags, Eignung, Vorsicht-Flags
│       ├── README.md            #   – Schema, Upload-/CDN-Workflow, Auswahlregeln
│       ├── bilder-katalog.md
│       └── videos-katalog.md
├── quelldateien/                # Rohdaten vom Kunden (Briefings, Bilder, Korrekturen)
├── artikel/content/<typ>/<slug>/  # Seiten-Entwürfe, gruppiert nach Content-Typ (siehe Artikel-Ordnerkonvention)
├── berichte/                    # Reports, Audits, Präsentationen für Kunden-Reviews
├── seo/                         # Projektweite SEO-Arbeit (NICHT seitenbezogen – das gehört in
│   │                            # artikel/content/<typ>/<slug>/seo.md; Recherche-Artefakte aus
│   │                            # seo-page-research liegen hier nur temporär, bis article-create
│   │                            # sie in den Artikel-Ordner verschiebt)
│   └── keyword-gap/photovoltaik-eigenheime/  # Output deep-keyword-gap-research (06_report.md, briefing-seeds)
├── docs/                        # LEARNINGS.md (gitignored, gepflegt über knowledge-base-entry)
├── tmp/                         # Temporär, Skripte (gitignored); tmp/handoff/ = Session-Übergaben
├── changelog/                   # Pro Arbeitstag eine Datei YYYY-MM-DD.md
├── .claude/skills/              # Projekt-Skills (aus Vorlage-Repo, in-place parametrisiert):
│   ├── deep-keyword-gap-research/  # – nischenweite Gap-Recherche (Discovery-Stufe)
│   ├── seo-page-research/       #   – 6-Phasen-Keyword-Recherche, liefert Briefing
│   ├── article-create/          #   – Pflicht-Skill: legt Artikel-Pflichtstruktur an
│   ├── content-html-formatter/  #   – formatiert Texte als WordPress-HTML
│   ├── ga4-reports/             #   – zieht GA4-Daten, Property 384502917
│   ├── brand-meta-ctr/          #   – Meta-Tags im SWG-Hausstil
│   ├── rueckverlinkung/         #   – rückwirkende interne Verlinkung
│   ├── handoff/                 #   – Pflicht-Skill: Session-Übergaben (Projektgedächtnis)
│   ├── knowledge-base-entry/    #   – Pflicht-Skill: Learnings-Datenbank (Projektgedächtnis)
│   └── project-setup/           #   – Setup-Werkzeug, bleibt für spätere Nachpflege
├── swg-crawl-2026-04.csv        # Crawl-Datenquelle (417 URLs, Stand 04.04.2026)
└── CLAUDE.md
```

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

```
artikel/content/<content-typ>/<slug>/
├── artikel.md       # Reiner Artikeltext (H1 + Fließtext), OHNE Meta-Daten, OHNE Bilder
├── seo.md           # Seitenbezogene SEO-Daten: Meta-Title, Meta-Description, URL,
│                    # Canonical, Keyword-Mapping, H-Hierarchie, JSON-LD, interne
│                    # Verlinkung, Bilder & Medien, Autor, SEO-Checkliste
├── wordpress.html   # CMS-fertiges HTML – erzeugt durch content-html-formatter aus
│                    # artikel.md + wissensbasis/html-elemente.md
├── artikel.docx     # Word-Export für Kunden-Review
├── bilder/          # OPTIONAL: web-fertig aufbereitete Bilder/Videos (prepare-media.py)
└── (Recherche)      # OPTIONAL: briefing-<slug>.md, source-review-<slug>.md, cluster-<slug>.csv,
                     # cannibalization-<slug>.md – aus seo-page-research, von article-create hierher verschoben
```

Regeln:
- **artikel.md** enthält KEINE SEO-Meta-Daten im Kopf und KEINE Bilder – Meta gehört in `seo.md`, Bilder kommen erst in `wordpress.html`.
- **seo.md** ist die zentrale Referenz für alle SEO-Elemente der Seite (inkl. „Bilder & Medien" und Autor-Block).
- **wordpress.html** wird aus `artikel.md` abgeleitet über den `content-html-formatter`-Skill. Verweigert der Skill den Output (leere html-elemente.md), zuerst die Wissensbasis füllen.
- **artikel.docx** wird bei jeder Artikelerstellung UND nach jeder inhaltlichen Änderung neu generiert.
- **bilder/** entsteht nur, wenn der Artikel Medien bekommt (Ziel-Breiten laut „Medien-Maße"). Recherche-Artefakte liegen beim Artikel, sobald er existiert (von `article-create` aus `seo/` verschoben).
- **Ordner-Struktur:** `<content-typ>` = festes Segment aus der Tabelle oben; **Blatt-Ordner-Slug = URL-Slug** (Kleinbuchstaben, Bindestriche, keine Umlaute, keine Unterstriche), eindeutig innerhalb seines Typ-Ordners.

## Durchgängiger Content-Workflow

Die Content-Skills bilden eine feste Kette. Der Slug bleibt über alle Stufen identisch. `deep-keyword-gap-research` ist die (optionale) Discovery-Stufe DAVOR: sie liefert pro Top-Cluster einen Briefing-Seed, den `seo-page-research` beim Start liest.

```
deep-keyword-gap-research  →  seo-page-research      →  article-create               →  content-html-formatter
Nischen-Gap-Map               Recherche + Briefing      4 Pflichtdateien                 wordpress.html (CMS-fertig)
seo/keyword-gap/…/            seo/briefing-<slug>.md    artikel/content/<typ>/<slug>/
└ briefing-seed-<id>.json ─→  seo/source-review-…
```

- **Übergabe 0 (gap → research, optional):** `seo-page-research` sucht in Phase 0 `seo/keyword-gap/photovoltaik-eigenheime/briefing-seed-<id>.json` und übernimmt `pillar_keyword`, `secondary_keywords`, `competitor_urls`, `recommended_page_type` als Vorbefüllung (SERP-/Volumen-Daten werden frisch verifiziert). Fehlt der Seed: regulär mit Topic starten.
- **Übergabe 1 (research → create):** `article-create` liest `seo/briefing-<slug>.md` als verbindliche Quelle und verschiebt die Recherche-Artefakte in den Artikel-Ordner.
- **Übergabe 2 (create → formatter):** `article-create` ruft `content-html-formatter` mit `artikel.md` auf; Content-Typ + Autor kommen aus `seo.md`.
- **Nach dem Launch:** `rueckverlinkung` setzt interne Links aus dem Bestand auf die neue Seite; `brand-meta-ctr` schärft Meta-Tags on demand; `ga4-reports` misst die Performance.
- **Verknüpfungs-Anker:** der **Slug** (Blatt-Ordnername unter dem Typ-Segment, Dateiname-Suffix in `seo/`, Identifier in `seo.md`). Das **Typ-Segment** ist die Elternebene aus dem Content-Typ.

## Content-Typen (Kurzreferenz)

SWG nutzt fünf der sechs Typen; Kollektionsseiten entfallen (kein Shop) – das Ordner-Segment `kollektionen` bleibt trotzdem reserviert.

| Content-Typ | Ordner (`artikel/content/…`) | URL-Pfad | Pflicht | Empfohlen | Wörter |
|---|---|---|---|---|---|
| **Ratgeber** | `ratgeber` | `/blog/ratgeber/` | ToC + Anker-IDs, FAQ | Tabelle, Info-Box, CTA | 1500–3000 |
| **Beratung** | `beratung` | `/blog/beratung/` | ToC, Vergleichstabelle, FAQ | Info-Box | 1200–2500 |
| **Produktbeschreibung** | `produkte` | `/leistungen/` | — | Info-Box, Tabelle, CTA | 600–1500 |
| **Profilseite** | `profile` | `/ueber-uns/` | Zitat | Info-Box | 500–1000 |
| **Landingpage** | `landingpages` | `/aktion/` | — | — | 500–1500 |

### Taxonomie-Brücke (verbindlich für alle Content-Skills)

`seo-page-research` denkt in Williams-Cook-Intent + Page-Type, `article-create` und `content-html-formatter` in den Content-Typen oben. Diese Tabelle übersetzt, damit alle Skills denselben Typ erwarten. `seo-page-research` trägt den Projekt-Content-Typ ins Briefing, die anderen lesen ihn dort.

| Intent-Klasse (Williams-Cook) | SERP-Page-Type | → Projekt-Content-Typ | Ordner (`artikel/content/…`) |
|---|---|---|---|
| Comparison | Listicle / Vergleich | **Beratung** | `beratung` |
| Reason / Definition / Instruction / Question | Blog / Guide | **Ratgeber** | `ratgeber` |
| Short fact / Bool (transaktional) | PDP / Leistungs-Anfrage | **Produktbeschreibung** | `produkte` |
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

Wird von `prepare-media.py` gelesen. Werte aus dem Divi-Theme von sonnenwerk-solar.de (verifiziert beim Setup, Content-Container 1200 px):

| Maß | Wert (px) |
|---|---|
| Textspalte | 760 |
| Hero | 1520 |
| Inline | 1400 |
| Detail | 900 |

## Tools

- **python-docx** – Auto-Generierung von `artikel.docx` über `.claude/skills/article-create/references/create-docx.py` (liest `artikel.md` + `seo.md`). Voraussetzung: `pip install python-docx`. Unterstützt im `artikel.md`: Headings H1–H4, **fett**, *kursiv*, `[text](url)`-Links, Pipe-Tabellen, Listen (`-` und `1.`), Blockquotes – alles wird in echte Word-Elemente übersetzt.
- **Pillow + prepare-media.py** – Bild-/Video-Aufbereitung über `.claude/skills/content-html-formatter/references/prepare-media.py`: skaliert herunter (nie hoch), schneidet zu, exportiert verlustarm nach `artikel/content/<typ>/<slug>/bilder/`. Ziel-Breiten laut „Medien-Maße". Voraussetzung: `pip install pillow` (+ ffmpeg für Videos).
- **WebFetch** – liest Website-Seiten für Wissensbasis-Pflege und Quellen-Checks (kein Zusatz-Setup nötig).

## Projektspezifische Skills

- **deep-keyword-gap-research** (`.claude/skills/deep-keyword-gap-research/`) – Nischenweite Discovery-/Gap-Recherche (7 Phasen, die Ebene VOR seo-page-research). Findet unterbediente „Need Keywords" und bündelt sie zur priorisierten Cluster-Map. Output nach `seo/keyword-gap/photovoltaik-eigenheime/` (u.a. `06_report.md` + Briefing-Seeds). Projekt-Spezifik in `skill.config.json` (selfDomain `sonnenwerk-solar.de`, gscSite `sc-domain:sonnenwerk-solar.de`, projectNiche „Photovoltaik für Eigenheime", seoInventory `wissensbasis/website-struktur.md`).
- **seo-page-research** (`.claude/skills/seo-page-research/`) – Vorgelagerter Recherche-Skill (6 Phasen, SERP-First, SerpApi; Phase 2b Quellen-Sichtung). Liefert `seo/briefing-<slug>.md`, `seo/source-review-<slug>.md`, `seo/cluster-<slug>.csv`, `seo/cannibalization-<slug>.md`. Liest CLAUDE.md (Domain, Properties, Taxonomie-Brücke), `wissensbasis/website-struktur.md` (Internal-Linking) und `wissensbasis/tone-of-voice.md`.
- **article-create** (`.claude/skills/article-create/`) – **Pflicht-Skill.** Legt neue Artikel/Seiten in der Pflicht-Struktur unter `artikel/content/<content-typ>/<slug>/` an, erzeugt die vier Pflichtdateien (`artikel.md`, `seo.md`, `wordpress.html`, `artikel.docx`). Liest CLAUDE.md (Über > CMS-Dateiname, CMS-Editor, Marke), `wissensbasis/tone-of-voice.md`, `wissensbasis/autoren/<slug>.md` und ein vorhandenes `seo/briefing-<slug>.md` (Briefing-First) zur Laufzeit. Keine Parametrisierung nötig.
- **content-html-formatter** (`.claude/skills/content-html-formatter/`) – Formatiert Texte als WordPress-fertiges HTML. Liest die SWG-Bausteine aus `wissensbasis/html-elemente.md`, Medien aus `wissensbasis/medien/` (Aufbereitung via `prepare-media.py`), Autor aus `wissensbasis/autoren/`. Verweigert den Output, solange die Wissensbasis leer ist.
- **ga4-reports** (`.claude/skills/ga4-reports/`) – Zieht GA4-Daten über den MCP und präsentiert sie faktenbasiert. Property-ID `384502917` und Domain `sonnenwerk-solar.de` sind im SKILL.md gesetzt. Schlüsselereignisse: siehe Sektion „Analytics-Anbindung" oben.
- **brand-meta-ctr** (`.claude/skills/brand-meta-ctr/`) – On-demand-Skill für Meta-Title (≤60 Zeichen) und Meta-Description (≤155 Zeichen) im SWG-Hausstil. Zieht bei Live-Seiten die echte GSC-Query der Property `sc-domain:sonnenwerk-solar.de` als Keyword-Anker, schreibt die gewählte Variante in die `seo.md` der Seite.
- **rueckverlinkung** (`.claude/skills/rueckverlinkung/`) – On-demand-Skill für rückwirkende interne Verlinkung nach dem Launch einer neuen Seite. Scannt Bestandsseiten (`ratgeber`, `beratung`, `produkte`; Profilseiten ausgeschlossen), Vorschlags-Gate vor jedem Schreiben, max. 1 Link pro alter Seite, variierte Ankertexte, relative Links.
- **handoff** (`.claude/skills/handoff/`) – **Pflicht-Skill.** Schreibt Session-Übergabedokumente nach `tmp/handoff/` (siehe „Projektgedächtnis").
- **knowledge-base-entry** (`.claude/skills/knowledge-base-entry/`) – **Pflicht-Skill.** Pflegt `docs/LEARNINGS.md` format-erhaltend (siehe „Projektgedächtnis", Learning-Kriterien).

## Datenquellen

- **swg-crawl-2026-04.csv** – 417 gecrawlte URLs von sonnenwerk-solar.de (Stand 04.04.2026). Spalten: url, title, h1, meta_description, canonical, content, method, word_count.
- **Kunden-Briefings** – `quelldateien/briefings/` (PDF-Exporte aus E-Mail-Korrespondenz).
- **Preisliste 2026** – `quelldateien/preisliste-2026.pdf` (Original-PDF), extrahiert nach `wissensbasis/swg-leistungen.md`.

---

## Verzahnungs-Logik (warum die Sektionen so aufgebaut sind)

Damit der project-setup-Skill versteht, **warum** die CLAUDE.md so strukturiert ist:

| Sektion | Verzahnt mit |
|---|---|
| Über [Kundenname] | Basis für Ton, Zielgruppen-Ansprache. Enthält **Marke**, **CMS-Dateiname** und **CMS-Editor**, die von article-create und create-docx.py zur Laufzeit gelesen werden. |
| Analytics-Anbindung | ga4-reports-Skill – Property-ID hier ist Single Source of Truth, im Skill nur referenziert. GSC-Property speist seo-page-research, deep-keyword-gap-research und brand-meta-ctr. |
| MCP-Konfiguration | Alle datenabhängigen Skills. Server kommen aus der committeten `.mcp.json` (Opt-in), die Kunden-Properties stehen hier. SerpApi-Hinweis verhindert stille Fehlläufe der Recherche-Skills. |
| Schreibregeln | content-html-formatter + jede Artikel-Erstellung – Umlaute, Anrede, Markenname, Verweis auf tone-of-voice.md |
| tone-of-voice.md | Jeder Schreib-Skill liest sie vor dem Schreiben und prüft den Output gegen die Checkliste. Stimm-Drift ist der häufigste Qualitätsmangel und wird hier verhindert. |
| Quellenpfade | Alle Skills nutzen diese Pfade zum Lesen/Schreiben. `website-struktur.md` (fester Name) ist Coverage-Inventar von deep-keyword-gap-research und Internal-Linking-Basis von seo-page-research. |
| wissensbasis/autoren/ | content-html-formatter (Author-Card) + article-create + Article-JSON-LD ziehen die Autor-Daten zentral hierher, statt sie pro Artikel zu wiederholen. |
| wissensbasis/medien/ | content-html-formatter wählt Motive kontextbasiert daraus und bereitet sie via prepare-media.py auf. CDN-URL erst nach Upload. |
| Artikel-Ordnerkonvention | article-create legt die 4 Pflichtdateien im Typ-Ordner an; die Content-Typ→Segment-Tabelle ist die verbindliche Ablage-Logik, rueckverlinkung scannt entlang dieser Ordner. |
| Durchgängiger Content-Workflow | Verbindet deep-keyword-gap-research → seo-page-research → article-create → content-html-formatter über den Slug. Briefing-Seed- und Briefing-First-Übergaben. |
| Content-Typen + Taxonomie-Brücke | seo-page-research trägt den Content-Typ ins Briefing; article-create + content-html-formatter erwarten denselben Typ (Pflicht-Elemente, Wortumfang, Typ-Ordner). |
| Changelog-Konvention | Bei jeder Änderung pflegen – keine zentrale CHANGELOG.md, stattdessen Tagesdateien. Ebene 1 des Projektgedächtnisses. |
| Projektgedächtnis | handoff- und knowledge-base-entry-Skill + die beiden Hooks in `.claude/settings.json`. Der Kontext-Wächter stößt Handoff/Changelog/Learnings automatisch an. |
| Medien-Maße | prepare-media.py dimensioniert Artikel-Medien nach diesen Werten; ohne Sektion greifen die neutralen Defaults 800/1600/1400/900 px. |
| Tools | Nur wenn projektweite Skripte/Binaries installiert – sonst Sektion weglassen. |
| Projektspezifische Skills | Listet Pflicht-Skills und aktive optionale Skills (nach Parametrisierung). Property-ID/Domain sind dort schon gesetzt – hier nur Verweis. |
| Datenquellen | Transparenz, woher welche Aussage im Projekt stammt. Jede Wissensbasis-Datei endet mit Quellenangabe. |
