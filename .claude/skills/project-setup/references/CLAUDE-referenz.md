# Referenz-CLAUDE.md

Diese Datei ist ein **ausgefülltes Beispiel** einer gut verzahnten CLAUDE.md. Sie dient dem project-setup-Skill als Vorbild – sowohl was Struktur als auch Detailtiefe angeht. Das fiktive Projekt „Sonnenwerk Solar GmbH" (SWG) ist so gewählt, dass jede Sektion inhaltlich gefüllt werden muss.

Beim echten Projektsetup:
- Struktur 1:1 übernehmen
- Inhalte durch die Werte des Kunden ersetzen
- Sektionen weglassen, die nicht anwendbar sind (z.B. „Tools", „Projektspezifische Skills")

---

# CLAUDE.md – Sonnenwerk Solar GmbH Projekt

## Über Sonnenwerk Solar GmbH

- **Sonnenwerk Solar GmbH** (SWG) – Photovoltaik-Fachbetrieb für Eigenheimbesitzer und kleine Gewerbekunden in Norddeutschland
- Website: sonnenwerk-solar.de
- Standort: Hamburg, Projektgebiet: Schleswig-Holstein, Niedersachsen, Bremen
- Zielgruppen: Eigenheimbesitzer (Neubau + Bestand), kleine Gewerbebetriebe, Genossenschaften
- Leistungen: PV-Anlagenplanung, Installation, Stromspeicher, Wallbox-Integration, Wartung, Förderberatung
- Konzernzugehörigkeit: unabhängig, eigentümergeführt seit 2011

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

## Schreibregeln

- **Deutsche Umlaute:** In ALLEN deutschsprachigen Ausgaben echte Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. NIEMALS ASCII-Transliterationen (ae/oe/ue/ss). Ausnahme: YAML-Frontmatter in SKILL.md und URL-Slugs.
- **Anrede:** Siezen (Sie/Ihr/Ihnen). Nie duzen.
- **Schreibweise „Sonnenwerk Solar GmbH"** oder Kurzform **„SWG"** – konsistent halten. Nicht „Sonnenwerk" allein (Verwechslung mit Konkurrenz).
- **Tonalität:** sachlich-informativ, lösungsorientiert. Kein Werbesprech („die beste Anlage der Welt"), keine Superlative ohne Beleg.
- **Fachbegriffe erklären:** kWp, Einspeisevergütung, Eigenverbrauchsquote, Wechselrichter – beim ersten Vorkommen kurz definieren.
- **Zahlen und Preise:** nur aus `wissensbasis/swg-leistungen.md` übernehmen, niemals schätzen oder aus Trainingsdaten ergänzen.

## Quellenpfade

```
Projekte/SWG/
├── wissensbasis/                # Referenz-Dateien (nur lesen)
│   ├── swg-unternehmen.md       # Firma, Historie, Standort, Team, Zielgruppen
│   ├── swg-leistungen.md        # Produkte, Pakete, Preise, USPs
│   ├── swg-website-struktur.md  # URL-Kategorisierung, Navigation, Seitentypen
│   ├── design.md                # Farben, Typografie, Logo, CTA-Stil (für Präsentationen)
│   └── html-elemente.md         # CMS-HTML-Bausteine (WordPress) – Pflicht für content-html-formatter
├── quelldateien/                # Rohdaten vom Kunden (Briefings, Bilder, Korrekturen)
├── artikel/content/             # Seiten-Entwürfe (siehe Artikel-Ordnerkonvention)
├── berichte/                    # Reports, Audits, Präsentationen für Kunden-Reviews
├── seo/                         # Projektweite SEO-Arbeit: Keyword-Recherchen, SERP-Analysen,
│                                # Content-Pläne (NICHT seitenbezogen – das gehört in
│                                # artikel/content/<slug>/seo.md)
├── tmp/                         # Temporär, Skripte (löschbar, nicht versionieren)
├── changelog/                   # Pro Arbeitstag eine Datei YYYY-MM-DD.md
├── .claude/skills/              # Projekt-Skills (aus Vorlage-Repo, in-place parametrisiert):
│   ├── content-html-formatter/  #   – formatiert Texte als WordPress-HTML
│   ├── ga4-reports/             #   – zieht GA4-Daten, Property 384502917
│   └── project-setup/           #   – Setup-Werkzeug, bleibt für spätere Nachpflege
├── swg-crawl-2026-04.csv        # Crawl-Datenquelle (417 URLs, Stand 04.04.2026)
└── CLAUDE.md
```

## Artikel-Ordnerkonvention

Jeder neue Artikel/jede neue Seite bekommt einen eigenen Ordner unter `artikel/content/<slug>/` und enthält **verpflichtend** folgende vier Dateien:

```
artikel/content/<slug>/
├── artikel.md       # Reiner Artikeltext (H1 + Fließtext), OHNE Meta-Daten
├── seo.md           # Seitenbezogene SEO-Daten: Meta-Title, Meta-Description, URL,
│                    # Canonical, Keyword-Mapping, H-Hierarchie, JSON-LD, interne
│                    # Verlinkung, SEO-Checkliste
├── wordpress.html   # CMS-fertiges HTML – erzeugt durch content-html-formatter aus
│                    # artikel.md + wissensbasis/html-elemente.md
└── artikel.docx     # Word-Export für Kunden-Review
```

Regeln:
- **artikel.md** enthält KEINE SEO-Meta-Daten im Kopf – die gehören ausschließlich in `seo.md`.
- **seo.md** ist die zentrale Referenz für alle SEO-Elemente der Seite.
- **wordpress.html** wird aus `artikel.md` abgeleitet über den `content-html-formatter`-Skill. Verweigert der Skill den Output (leere html-elemente.md), zuerst die Wissensbasis füllen.
- **artikel.docx** wird bei jeder Artikelerstellung UND nach jeder inhaltlichen Änderung neu generiert.
- Ordner-Slug = URL-Slug.

## Changelog-Konvention

Änderungen am Projekt werden **pro Tag** in einer eigenen Datei im Ordner `changelog/` dokumentiert:

- **Dateiname:** `YYYY-MM-DD.md` (aktuelles Datum des Arbeitstags)
- **Neuer Tag = neue Datei** – bestehende Tagesdateien werden nicht rückwirkend verändert
- **Am selben Tag:** weitere Änderungen werden an die bestehende Tagesdatei angehängt
- **Überschrift H1:** `# YYYY-MM-DD – Kurztitel des Tages`
- Inhalt kurz, thematisch gruppiert (z.B. **Artikel**, **Wissensbasis**, **Skills**, **Konventionen**, **Reports**)
- Keine zentrale `CHANGELOG.md` – alle Einträge liegen ausschließlich im `changelog/`-Ordner

## Tools

- **Puppeteer** – installiert in `tmp/node_modules/` für das vollständige Rendern von Website-Seiten (JS-Content, Shortcodes). Scripte: `tmp/fetch-page.js`, `tmp/extract-content.js`.
- **docx-Generator** – Node-Script in `tmp/create-docx.js` für Word-Export aus `artikel.md`.

## Projektspezifische Skills

- **content-html-formatter** (`.claude/skills/content-html-formatter/`) – Formatiert Texte als WordPress-fertiges HTML. Liest die SWG-Bausteine aus `wissensbasis/html-elemente.md`. Verweigert den Output, solange die Wissensbasis leer ist.
- **ga4-reports** (`.claude/skills/ga4-reports/`) – Zieht GA4-Daten über den MCP und präsentiert sie faktenbasiert. Property-ID `384502917` und Domain `sonnenwerk-solar.de` sind im SKILL.md gesetzt. Schlüsselereignisse: siehe Sektion „Analytics-Anbindung" oben.

## Datenquellen

- **swg-crawl-2026-04.csv** – 417 gecrawlte URLs von sonnenwerk-solar.de (Stand 04.04.2026). Spalten: url, title, h1, meta_description, canonical, content, method, word_count.
- **Kunden-Briefings** – `quelldateien/briefings/` (PDF-Exporte aus E-Mail-Korrespondenz).
- **Preisliste 2026** – `quelldateien/preisliste-2026.pdf` (Original-PDF), extrahiert nach `wissensbasis/swg-leistungen.md`.

---

## Verzahnungs-Logik (warum die Sektionen so aufgebaut sind)

Damit der project-setup-Skill versteht, **warum** die CLAUDE.md so strukturiert ist:

| Sektion | Verzahnt mit |
|---|---|
| Über [Kundenname] | Basis für Ton, Zielgruppen-Ansprache in artikel.md und wordpress.html |
| Analytics-Anbindung | ga4-reports-Skill – Property-ID hier ist Single Source of Truth, im Skill nur referenziert |
| Schreibregeln | content-html-formatter + jede Artikel-Erstellung – Umlaute, Anrede, Markenname |
| Quellenpfade | Alle Skills nutzen diese Pfade zum Lesen/Schreiben. html-elemente.md wird vom content-html-formatter gelesen. |
| Artikel-Ordnerkonvention | Jede Content-Arbeit legt genau diese 4 Dateien an. wordpress.html-Erzeugung triggert content-html-formatter. |
| Changelog-Konvention | Bei jeder Änderung pflegen – keine zentrale CHANGELOG.md, stattdessen Tagesdateien. |
| Tools | Nur wenn projektweite Skripte/Binaries installiert – sonst Sektion weglassen. |
| Projektspezifische Skills | Listet welche Template-Skills im Projekt aktiv sind (nach Parametrisierung). Property-ID/Domain sind dort schon gesetzt – hier nur Verweis. |
| Datenquellen | Transparenz, woher welche Aussage im Projekt stammt. Jede Wissensbasis-Datei endet mit Quellenangabe. |
