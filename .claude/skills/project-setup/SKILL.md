---
name: project-setup
description: Legt ein neues Kundenprojekt mit vollstaendiger Ordnerstruktur, Wissensbasis, CLAUDE.md mit allen Konventionen und optional projektspezifischen Skills an. Nutze diesen Skill immer, wenn der User ein neues Projekt aufsetzen, ein Projekt anlegen, eine neue Kundenstruktur erstellen oder ein Projektverzeichnis initialisieren moechte. Trigger auch bei "Setup fuer [Kundenname]", "neues Projekt", "Projektordner anlegen", "Kunde einrichten" oder "Projekt starten fuer [Name]".
---

# Projekt-Setup-Skill

Erstellt ein vollständiges Kundenprojekt-Verzeichnis mit Ordnerstruktur, CLAUDE.md (inkl. aller Konventionen), Wissensbasis aus gecrawltem Website-Content, erster Changelog-Datei und optional projektspezifischen Skills.

## Warum dieser Skill existiert

Jedes neue Kundenprojekt braucht die gleiche Grundstruktur: einheitliche Ordner, eine CLAUDE.md mit Projektkontext **und allen etablierten Konventionen** (Artikel-Ordner, Changelog, Tools, projektspezifische Skills), eine Wissensbasis aus dem Website-Content und Design-Richtlinien. Ohne diesen Skill müsste das jedes Mal manuell aufgebaut werden – fehleranfällig und zeitaufwendig. Der Skill standardisiert das und sorgt dafür, dass ab der ersten Minute produktiv und einheitlich gearbeitet werden kann.

**Arbeitsweise:** Dieser Skill läuft **in-place** im aktuellen Projektverzeichnis. Die Skill-Vorlagen `article-create`, `content-html-formatter` und `ga4-reports` liegen bereits unter `.claude/skills/`, weil das gesamte Projektverzeichnis aus einem Vorlage-Repo von GitHub gezogen wurde. Es wird **nichts kopiert** – die Skills werden nur in-place parametrisiert (Platzhalter ersetzt, Wissensbasis befüllt). `article-create` ist ein **Pflicht-Skill** und bleibt in jedem Projekt aktiv; es liest CLAUDE.md und tone-of-voice.md zur Laufzeit und braucht keine Parametrisierung.

---

## Voraussetzungen

Der User liefert:
1. **Kundenname** (z.B. "Energiehaus Deutschland", Kurzform z.B. "EHDE")
2. **CSV-Datei** mit gecrawltem Website-Content
3. **CMS / Plattform** (z.B. WordPress, Shopify, Webflow) – relevant für projektspezifische Skills
4. **Analytics-Anbindung** (ja/nein) – z.B. GA4, GSC – relevant für Reports-Skill

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

---

## Ablauf

### Schritt 1: Informationen sammeln

Der Skill läuft im aktuellen Projektverzeichnis – der User hat dieses Verzeichnis bereits aus dem Vorlage-Repo gezogen. Du arbeitest also direkt hier, es wird kein neuer Ordner an anderer Stelle angelegt.

Frage den User nach:
- **Kundenname** (vollständig + Kurzform für Dateinamen)
- **Pfad zur CSV-Datei** (oder der User gibt sie direkt an)
- **Website-URL** (für Design-Extraktion)
- **Branche / Zielgruppe** (kurze Beschreibung, z.B. "Energieversorger für Hausverwaltungen")
- **CMS / Plattform** (WordPress, Shopify, Webflow, TYPO3, anderes)
- **CMS-Editor** (z.B. „Divi" / „Gutenberg" / „Elementor" bei WordPress; „Liquid" bei Shopify; „Webflow Designer"; „TYPO3 Backend"). Wird in CLAUDE.md > Über als Pflichtzeile eingetragen und vom `create-docx.py` für Hinweistexte gelesen.
- **CMS-Dateiname** für die Pflicht-HTML-Datei pro Artikel (Default-Mapping: WordPress → `wordpress.html`, Shopify → `shopify.html`, Webflow → `webflow.html`, TYPO3 → `typo3.html`, sonst `cms.html`). Wird in CLAUDE.md > Über als Pflichtzeile eingetragen und vom `article-create`-Skill gelesen.
- **Analytics-Anbindung** (GA4 Property-ID, GSC Property, weitere MCPs?)

Frage NICHT nach MCP-Verbindungs-Konfiguration (Pfade zu credentials.json, OAuth-Secrets etc.) – die trägt der User selbst ein.

### Schritt 2: Ordnerstruktur anlegen

Lege **fehlende** Ordner im aktuellen Projektverzeichnis an. Bereits existierende Ordner (`.claude/`, `.git/`) bleiben unverändert; du arbeitest in-place. Die zu erzeugende Soll-Struktur:

```
[Projektname]/
├── artikel/content/       # Seiten-Entwürfe und Content (siehe "Artikel-Ordnerkonvention")
├── berichte/              # Reports, Audits, Präsentationen
├── seo/                   # Übergreifende SEO-Arbeit (NICHT seitenbezogen)
├── wissensbasis/          # Referenz-Dateien (nur lesen)
├── quelldateien/          # Rohdaten vom Kunden
├── tmp/                   # Temporär, Skripte (löschbar)
├── changelog/             # Pro Tag eine Datei YYYY-MM-DD.md
├── .claude/skills/        # bereits aus dem Vorlage-Repo vorhanden
└── CLAUDE.md              # bereits vorhanden, wird in Schritt 3 überschrieben
```

### Schritt 3: CLAUDE.md erstellen

Verwende dieses Template und ersetze die Platzhalter. **Alle Sektionen sind verpflichtend** – sie machen das Projekt „gut verzahnt". Ein vollständig ausgefülltes Beispiel mit Erklärung der Verzahnungs-Logik findest du in `references/CLAUDE-referenz.md`. Lies die Referenz, wenn du unsicher bist, wie tief eine Sektion gefüllt werden muss:

```markdown
# CLAUDE.md – [Kundenname] Projekt

## Über [Kundenname]
- **[Kundenname]** ([Kurzform]) – [Branche/Beschreibung]
- Website: [domain]
- Zielgruppen: [aus CSV-Analyse ableiten]
- Leistungen: [aus CSV-Analyse ableiten]
- **CMS-Dateiname:** [wordpress.html | shopify.html | webflow.html | typo3.html | cms.html] (wird von article-create und content-html-formatter gelesen)
- **CMS-Editor:** [Divi | Liquid | Webflow Designer | TYPO3 Backend | …] (wird von create-docx.py fuer Hinweistexte gelesen)

## Schreibregeln
- **Tone of Voice:** `wissensbasis/tone-of-voice.md` ist die verbindliche Stimm-Referenz. Vor jedem neuen Text lesen, danach Checkliste durchgehen. Texte müssen klingen wie aus dieser Datei abgeleitet.
- **Deutsche Umlaute:** In ALLEN deutschsprachigen Ausgaben immer echte Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. NIEMALS ASCII-Transliterationen.
- **"[Kundenname]"** oder **"[Kurzform]"** – Schreibweise konsistent halten
- **Anrede & Perspektive** entsprechend `wissensbasis/tone-of-voice.md` (kann pro Kunde Du/Sie/Ihr sein)
- **Em-Dash „–":** Nur erlauben, wenn der Kunde ihn in seinen Original-Texten selbst nutzt. Sonst weglassen (KI-Erkennungsmerkmal). Geviertstrich „—" grundsätzlich nicht verwenden. Konkrete Regel pro Kunde steht in der Voice-Datei.
- Fachbegriffe erklären (nicht voraussetzen)

## Quellenpfade

[Projektname]/
├── wissensbasis/          # Referenz-Dateien (nur lesen)
│   ├── [kurzform]-unternehmen.md
│   ├── [kurzform]-leistungen.md
│   ├── [kurzform]-website-struktur.md
│   ├── tone-of-voice.md         # Verbindliche Stimm-Referenz – Pflicht-Lektüre vor jedem Text
│   ├── design.md
│   └── html-elemente.md         # Pflicht, wenn content-html-formatter genutzt wird (CMS-Bausteine aus dem echten Frontend)
├── quelldateien/          # Rohdaten vom Kunden
├── artikel/content/       # Seiten-Entwürfe und Content (siehe "Artikel-Ordnerkonvention")
├── berichte/              # Reports, Audits, Präsentationen
├── seo/                   # Übergreifende SEO-Arbeit: Keyword-Recherchen, SERP-Analysen, Content-Pläne (NICHT seitenbezogen – das gehört in artikel/content/<slug>/seo.md)
├── tmp/                   # Temporär, Skripte (löschbar)
├── changelog/             # Pro Tag eine Datei YYYY-MM-DD.md (siehe "Changelog-Konvention")
├── .claude/skills/        # Projektspezifische Skills (optional)
├── [csv-dateiname]        # Gecrawlter Website-Content
└── CLAUDE.md

## Artikel-Ordnerkonvention

Jeder neue Artikel/jede neue Seite bekommt einen eigenen Ordner unter `artikel/content/<slug>/` und enthält **verpflichtend** folgende vier Dateien (immer angelegt durch den `article-create`-Skill):

\`\`\`
artikel/content/<slug>/
├── artikel.md       # Reiner Artikeltext (H1 + Fließtext, OHNE Meta-Daten)
├── seo.md           # Seitenbezogene SEO-Daten: Meta-Title, Meta-Description, URL, Canonical, Keyword-Mapping, H-Hierarchie, JSON-LD, interne Verlinkung, SEO-Checkliste (NICHT zu verwechseln mit dem projektweiten seo/-Ordner)
├── <cms>.html       # CMS-fertiges HTML, Dateiname laut CLAUDE.md > Über > CMS-Dateiname (z.B. wordpress.html, shopify.html). Erzeugt durch content-html-formatter.
└── artikel.docx     # Word-Export für Kunden-Review (erzeugt durch references/create-docx.py)
\`\`\`

Regeln:
- **artikel.md** enthält KEINE SEO-Meta-Daten im Kopf – die gehören ausschließlich in `seo.md`.
- **seo.md** ist die zentrale Referenz für alle SEO-Elemente der Seite.
- **<cms>.html** wird aus `artikel.md` abgeleitet über den `content-html-formatter`-Skill. Der Dateiname kommt aus CLAUDE.md > Über > CMS-Dateiname.
- **artikel.docx** wird bei jeder Artikelerstellung UND nach inhaltlichen Änderungen neu generiert.
- Ordner-Slug = URL-Slug.

## Changelog-Konvention

Änderungen am Projekt werden **pro Tag** in einer eigenen Datei im Ordner `changelog/` dokumentiert:

- **Dateiname:** `YYYY-MM-DD.md` (aktuelles Datum des Arbeitstags)
- **Neuer Tag = neue Datei** – bestehende Tagesdateien werden nicht verändert
- **Am selben Tag:** weitere Änderungen werden an die bestehende Tagesdatei angehängt
- **Überschrift H1:** `# YYYY-MM-DD – Kurztitel des Tages`
- Inhalt kurz, thematisch gruppiert (z.B. **Artikel**, **Wissensbasis**, **Skills**, **Konventionen**)
- Keine zentrale `CHANGELOG.md` – alle Einträge liegen ausschließlich im `changelog/`-Ordner

## Tools
[Nur Sektion einfügen, wenn projektweite Tools installiert werden. Beispiele:]
- **Puppeteer** – optional installiert in `tmp/node_modules/` zum vollständigen Rendern von Website-Seiten. Scripte: `tmp/fetch-page.js`, `tmp/extract-content.js`.

## Projektspezifische Skills
- **article-create** (`.claude/skills/article-create/`) – **Pflicht-Skill in jedem Projekt.** Legt neue Artikel/Seiten in der Pflicht-Ordnerstruktur unter `artikel/content/<slug>/` an, erzeugt die vier Pflichtdateien (`artikel.md`, `seo.md`, `<cms>.html`, `artikel.docx`). Liest CLAUDE.md (für CMS-Dateiname und URL-Schema) und `wissensbasis/tone-of-voice.md` (für Stimm-Vorgabe) zur Laufzeit. Keine Parametrisierung nötig.
[Optional – nur einfügen, wenn in Schritt 6 weitere Skills im Projekt aktiv gehalten und parametrisiert wurden:]
- **content-html-formatter** (`.claude/skills/content-html-formatter/`) – Formatiert Texte als CMS-fertiges HTML. Liest die projektspezifischen HTML-Bausteine aus `wissensbasis/html-elemente.md`.
- **ga4-reports** (`.claude/skills/ga4-reports/`) – Zieht GA4-Daten über den MCP und präsentiert sie faktenbasiert. Property-ID und Domain sind im SKILL.md gesetzt.

## Datenquellen
- **[csv-dateiname]** – [Anzahl] gecrawlte URLs von [domain] (Spalten: url, title, h1, meta_description, canonical, content, method, word_count)
```

### Schritt 4: Erste Changelog-Datei erstellen

Lege den Ordner `changelog/` an und erstelle darin die Datei `[Datum].md` (Format `YYYY-MM-DD.md`):

```markdown
# [Datum] – Projekt-Setup

- Projektstruktur angelegt
- Wissensbasis erstellt aus gecrawltem Website-Content ([Anzahl] URLs)
- Dateien: [kurzform]-unternehmen.md, [kurzform]-leistungen.md, [kurzform]-website-struktur.md, tone-of-voice.md, design.md
- tone-of-voice.md aus [Anzahl] der persönlichsten Kundentexte extrahiert, Em-Dash-Regel: [erlaubt sparsam | nicht verwenden]
- Datenquelle: [csv-dateiname]
- [Falls Template-Skills im Projekt aktiv:] Skills: content-html-formatter, ga4-reports
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

#### 5d: [kurzform]-website-struktur.md

Analysiere alle URLs:
- URL-Kategorisierung nach Seitentyp (mit Tabellen)
- URL-Muster (z.B. /blog/[slug], /produkte/[kategorie])
- Navigationsstruktur (als Baumdarstellung rekonstruiert)
- Seitentyp-Statistik
- Besonderheiten (fehlende Blog-Struktur, Duplikate, Thin Content)

#### 5e: design.md

Versuche die Design-Richtlinien von der Website abzuleiten (WebFetch / Puppeteer):
- **Farben:** Primär, Sekundär, Akzente, Text-/Hintergrundfarben
- **Logo:** Beschreibung, Platzierung, Farben
- **Typografie:** Schriftarten (Fallback für Präsentationen: Montserrat + Lato)
- **Farbzuordnung für Präsentationen:** Titelfolie-BG, Akzente, KPI-Cards, Tabellen-Header, positive/negative Werte
- **Buttons/CTAs:** Stil, Farben, Form

#### 5f: HTML-Elemente-Wissensbasis (Pflicht, wenn content-html-formatter genutzt wird)

Der Skill `content-html-formatter` funktioniert nur mit einer gefüllten `wissensbasis/html-elemente.md`. Lege die Datei wie folgt an:

1. **Vorlage ins Projekt-Root kopieren** (beide Pfade relativ zum aktuellen Projektverzeichnis):
   `.claude/skills/content-html-formatter/references/wissensbasis-template.md` → `wissensbasis/html-elemente.md`

2. **Mit dem User die CMS-Bausteine extrahieren.** Die Vorlage enthält `[AUS_CMS_EXTRAHIEREN]`-Blöcke für: Überschriften, Buttons/CTAs, Tabellen, Info-Boxen, FAQ/Accordion, Sektionen/Layout, wiederverwendbare Bausteine, Farbpalette, Link-Map, Preise/Kennzahlen, Tonalität.

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

### Schritt 6: Skill-Vorlagen in-place parametrisieren

Die Skills `article-create`, `content-html-formatter` und `ga4-reports` liegen bereits unter `.claude/skills/` – sie kamen mit dem Vorlage-Repo. Nichts wird kopiert. In diesem Schritt werden nur noch die **Platzhalter direkt in den bestehenden Dateien** ersetzt. `article-create` ist Pflicht und bleibt immer aktiv. Bei den anderen den User vorab fragen, welche überhaupt gebraucht werden; nicht benötigte Skill-Ordner kann er später einfach löschen.

**Grundregel:** Nur an den mit `[PLATZHALTER]` markierten Stellen ändern. Strukturen, Regeln und Abläufe bleiben unverändert – sonst driften die Skills über Projekte hinweg auseinander.

#### 6a: article-create (Pflicht, immer aktiv)

Der `article-create`-Skill ist generisch geschrieben und liest alle projektspezifischen Werte zur Laufzeit aus `CLAUDE.md` (CMS-Dateiname, CMS-Editor, Domain) und `wissensbasis/tone-of-voice.md` (Anrede, Vokabular, CTA-Pool). Keine Parametrisierung im Skill selbst.

Stattdessen sicherstellen, dass folgende Werte in der Projekt-CLAUDE.md (Schritt 3) gesetzt sind:

| In CLAUDE.md > Über | Beispielwert |
|---|---|
| `**CMS-Dateiname:** wordpress.html` | (oder shopify.html, webflow.html, typo3.html, cms.html) |
| `**CMS-Editor:** Divi` | (oder Liquid, Webflow Designer, TYPO3 Backend, …) |

Optional in CLAUDE.md > Über (steuert die docx-Generierung):

| Eintrag | Wirkung |
|---|---|
| `**Marke:** <Markenname>` | Erscheint auf dem Deckblatt jedes artikel.docx (Default: erste H1 in CLAUDE.md) |
| `**CTA-Pattern:** <regex>` | Zusätzliches Regex zur CTA-Erkennung im DOCX-Renderer (Default: All-Caps und Bindestrich-Marker werden automatisch erkannt) |

**Verifikation:** Nach dem Setup einen Smoke-Test laufen lassen – `article-create` für einen Test-Slug aufrufen, prüfen, dass alle vier Pflichtdateien mit korrektem CMS-Dateinamen und Marken-DOCX-Deckblatt erscheinen. Test-Ordner anschließend löschen.

#### 6b: content-html-formatter (wenn ein CMS genutzt wird)

1. **Nichts im SKILL.md selbst ändern** – der Skill ist bewusst generisch und liest alles Projektspezifische aus `wissensbasis/html-elemente.md`.
2. **Wissensbasis vorbereiten:** siehe Schritt 5f. Der Skill verweigert den Output, solange `wissensbasis/html-elemente.md` nicht existiert oder leer ist.
3. **Wenn das Projekt dieses CMS-Formatieren nicht braucht:** Ordner `.claude/skills/content-html-formatter/` löschen und in CLAUDE.md unter „Projektspezifische Skills" nicht auflisten.

#### 6c: ga4-reports (wenn GA4 angebunden ist)

1. **Platzhalter in `.claude/skills/ga4-reports/SKILL.md` und `.claude/skills/ga4-reports/references/api-mapping.md` ersetzen** (Edit-Tool, in-place):

   | Platzhalter | Ersetzen durch |
   |---|---|
   | `[PROPERTY_ID]` | GA4 Property-ID des Kunden (z.B. `321308963`) |
   | `[WEBSITE_DOMAIN]` | Haupt-Domain (z.B. `beispielkunde.de`) |
   | `[PROJEKT_NAME]` | Kurzform des Kunden (z.B. `EHDE`) |
   | `[STAND_DATUM]` | Heutiges Datum der Anpassung (`YYYY-MM-DD`) |

2. **Schlüsselereignisse-Tabelle aktualisieren:**
   In `SKILL.md` unter „[PROJEKT_NAME] Schlüsselereignisse" und in `references/api-mapping.md` unter „Schlüsselereignisse einzeln abfragen" die Beispiel-Events (`beispiel_event_1`, `beispiel_event_2`, …) durch die tatsächlich konfigurierten Schlüsselereignisse der GA4-Property ersetzen. Wenn diese noch nicht bekannt sind: Tabelle als `TODO – beim ersten GA4-Request mit dem User abstimmen` markieren.

3. **Verifikation:** Nach der Parametrisierung dürfen im `ga4-reports`-Ordner keine `[PLATZHALTER]` mehr vorkommen (außer im Vorlagen-Hinweis zur Schlüsselereignis-Tabelle, falls noch offen). Per Grep prüfen.

4. **Wenn das Projekt kein GA4 hat:** Ordner `.claude/skills/ga4-reports/` löschen und in CLAUDE.md unter „Projektspezifische Skills" nicht auflisten.

#### 6d: project-setup selbst

Der `project-setup`-Skill bleibt nach dem Setup im Projekt liegen. Das ist gewollt – er kann später erneut aufgerufen werden, etwa um eine fehlende Wissensbasis-Sektion nachzuziehen oder die QA-Checkliste zu prüfen. In CLAUDE.md unter „Projektspezifische Skills" wird er **nicht** aufgelistet, weil er kein Content-Produktiv-Skill ist.

#### 6e: Weitere Skills

Wenn das Projekt weitere wiederkehrende Workflows hat (Newsletter-Erstellung, Produktbeschreibungen, Briefings), können neue Skills direkt unter `.claude/skills/` angelegt werden. Wenn diese generisch genug sind, um auch in anderen Projekten nützlich zu sein: zurück ins Vorlage-Repo einpflegen, damit sie bei zukünftigen Setups automatisch mitkommen.

Nach Anlage: In CLAUDE.md Sektion „Projektspezifische Skills" ergänzen.

### Schritt 7: Abschluss

Zeige dem User eine Zusammenfassung:
- Welche Ordner angelegt wurden
- Welche Dateien erstellt wurden
- Wie viele URLs analysiert wurden
- Welche Seitentypen gefunden wurden
- Welche projektspezifischen Skills angelegt wurden
- Hinweise auf Auffälligkeiten (z.B. viele Thin-Content-Seiten, fehlende Meta-Descriptions)

Führe zum Schluss die **QA-Checkliste** aus (siehe unten).

---

## Wichtige Regeln

1. **Nur belegbare Informationen.** Die Wissensbasis basiert ausschließlich auf dem Content aus der CSV. Keine externen Recherchen, keine Annahmen.

2. **Deutsche Umlaute.** In allen generierten Dateien echte Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. NIEMALS ASCII-Transliterationen (ae/oe/ue). Ausnahme: YAML-Frontmatter in SKILL.md-Dateien (zur Encoding-Sicherheit) und Dateinamen (URL-Slugs).

3. **Quellenangabe.** Jede Wissensbasis-Datei endet mit Quelle und Stand:
   ```
   *Quelle: [csv-dateiname] ([Anzahl] URLs)*
   *Stand: [Datum]*
   ```

4. **Keine MCP-Konfiguration.** Der Skill richtet keine MCP-Verbindungen ein (GA4, GSC, Sheets, GTM). Das macht der User selbst. Der `ga4-reports`-Skill dokumentiert nur, welche MCPs erwartet werden.

5. **Projektspezifische Skills:** Der `.claude/skills/`-Ordner wird angelegt, wenn in Schritt 6 Skills erzeugt wurden. Er ist NICHT verpflichtend, aber empfohlen, wenn das Projekt wiederkehrende Workflows hat.

---

## QA-Checkliste

Bevor du das Setup abschließt, prüfe die folgenden Punkte.

### CLAUDE.md

- [ ] `# CLAUDE.md – [Kundenname] Projekt` als H1
- [ ] `## Über [Kundenname]` – Firma, Branche, Website, Zielgruppen, Leistungen
- [ ] `## Schreibregeln` – Umlaut-Regel (echte ä/ö/ü), Namenskonvention, Ton
- [ ] `## Quellenpfade` – kompletter Ordnerbaum mit Kommentaren
- [ ] `## Artikel-Ordnerkonvention` – 4 Pflichtdateien pro Artikel
- [ ] `## Changelog-Konvention` – Tagesdateien in `changelog/`
- [ ] `## Tools` – nur wenn projektweite Tools installiert
- [ ] `## Projektspezifische Skills` – nur wenn Skills in Schritt 6 aktiv gehalten wurden
- [ ] `## Datenquellen` – CSV-Datei dokumentiert

### Wissensbasis

- [ ] `wissensbasis/[kurzform]-unternehmen.md` vorhanden und mit Quellenangabe
- [ ] `wissensbasis/[kurzform]-leistungen.md` vorhanden und mit Quellenangabe
- [ ] `wissensbasis/[kurzform]-website-struktur.md` vorhanden und mit Quellenangabe
- [ ] `wissensbasis/tone-of-voice.md` vorhanden, alle 16 Pflicht-Abschnitte ausgefüllt, jede Stilregel mit Original-Zitat belegt, Em-Dash-Regel pro Kunde entschieden
- [ ] `wissensbasis/design.md` vorhanden
- [ ] Falls `content-html-formatter` aktiv bleibt: `wissensbasis/html-elemente.md` existiert – entweder gefüllt oder mit klarer TODO-Liste an den User, welche HTML-Snippets noch aus dem CMS extrahiert werden müssen

### Projektspezifische Skills

- [ ] **`article-create` liegt unter `.claude/skills/article-create/` (Pflicht-Skill, niemals löschen)**
- [ ] CLAUDE.md > Über enthält `**CMS-Dateiname:** <name>.html` und `**CMS-Editor:** <name>` – beides wird von article-create und create-docx.py gelesen
- [ ] Smoke-Test article-create für Test-Slug erfolgreich (vier Pflichtdateien angelegt, korrekter CMS-Dateiname, DOCX-Deckblatt zeigt Marke)
- [ ] Test-Slug-Ordner nach Smoke-Test wieder gelöscht
- [ ] Genutzte sonstige Skills liegen unter `.claude/skills/`, nicht genutzte Skill-Ordner wurden gelöscht
- [ ] Im `ga4-reports`-Skill sind alle `[PROPERTY_ID]`, `[WEBSITE_DOMAIN]`, `[PROJEKT_NAME]`, `[STAND_DATUM]` ersetzt (per Grep prüfen)
- [ ] Schlüsselereignis-Tabellen aktualisiert oder als TODO markiert
- [ ] Im `content-html-formatter`-Skill sind **keine** Platzhalter zu ersetzen (bewusst generisch)

Wenn ein Punkt fehlt und kein triftiger Grund dagegen spricht: ergänzen.
