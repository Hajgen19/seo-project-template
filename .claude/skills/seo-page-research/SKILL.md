---
name: seo-page-research
description: |
  Run a state-of-the-art, SERP-first SEO keyword research for a single page,
  ending with a publication-ready content brief and outline. Use this skill
  whenever the user mentions keyword research, content brief, SEO outline,
  topic research, search intent analysis, SERP analysis, keyword clustering,
  cannibalization check, or wants to plan a new page or blog post for SEO.
  Triggers include "research keywords for", "build a brief for", "plan a
  page about", "analyze SERPs for", "find keywords around", or any German
  variants ("Keywordrecherche", "Briefing fuer", "SEO-Brief", "Recherche zu",
  "neue Seite ueber"). Works in phases with explicit user-confirmation
  between phases. Do NOT use for: site-wide keyword audits, link-building
  research, technical SEO audits, or PPC keyword research.
allowed-tools:
  - mcp__serpapi__search
  - mcp__mcpwerk-ads__run_keyword_planner
  - mcp__mcpwerk-ads__list_accounts
  - mcp__mcpwerk-gsc__get_search_by_page_query
  - mcp__mcpwerk-gsc__get_search_analytics
  - mcp__mcpwerk-gsc__list_properties
  - mcp__playwright__*
  - WebFetch
  - WebSearch
  - Read
  - Write
  - Bash
---

# SEO Page Research — SERP-First Keyword Research für eine einzelne Seite

Dieser Skill führt eine systematische Keywordrecherche auf Seitenebene durch und endet mit einem publikationsreifen Content-Briefing inklusive Outline. Er arbeitet **phased mit User-Confirmation-Gates** zwischen jeder Phase, damit du an jedem Übergang validieren oder korrigieren kannst.

## Kernprinzip: SERP-First, nicht Tool-First

Die SERP ist der Wahrheits-Datensatz, nicht der Keyword Planner. Google Keyword Planner überschätzt Volumes in 91,45 % der Fälle (Ahrefs-Studie, n=72k); die SERP zeigt dir empirisch, was Google für eine Query als richtige Antwort wertet. Dieser Skill validiert jede Keyword-Entscheidung gegen die echte SERP.

## Werkzeuge & MCP-Zugang (Projekt-Setup)

Die Datenquellen laufen über MCP-Tools in der Session. Sind sie nicht sofort geladen, per **ToolSearch** nachladen, dann aufrufen:

| Aufgabe | Tool | Server |
|---|---|---|
| SERP-Daten (Phase 2/4) | `mcp__serpapi__search` | `serpapi` (in `.mcp.json`) |
| Keyword-Volumina (Phase 3) | `mcp__mcpwerk-ads__run_keyword_planner` (+ `list_accounts`) | `mcpwerk-ads` (in `.mcp.json`) |
| Kannibalisierung (Phase 4) | `mcp__mcpwerk-gsc__get_search_by_page_query` (+ `get_search_analytics`, `list_properties`) | `mcpwerk-gsc` (in `.mcp.json`) |
| Quellen-Sichtung (Phase 2b) | `WebFetch` / `WebSearch` | — (kostenlos, kein SerpApi-Kontingent) |
| SERP-Fallback | `mcp__playwright__*` | `playwright` (falls im Projekt konfiguriert) |

**Wichtig:**

- **Keyword Planner + GSC** laufen über die im Template vorkonfigurierten, gehosteten mcpwerk-Server in `.mcp.json` (`https://mcp.mcpwerk.com/<kuerzel>/mcp`). Sind die Server im Projekt anders benannt (z. B. als claude.ai-Connectoren), muss nur der Tool-Präfix angepasst werden — Parameter und Aufrufe bleiben identisch.
- **SerpApi ist NICHT vorkonfiguriert.** Voraussetzung: serpapi-MCP in der `.mcp.json` des Projekts (eigener Account, URL mit persönlichem Key).
- **GSC-Property:** `[GSC_PROPERTY]` (typischerweise `https://[WEBSITE_DOMAIN]/` oder `sc-domain:[WEBSITE_DOMAIN]`; per `list_properties` verifizieren).

## Phasen-Übersicht

| Phase | Ziel | Hauptwerkzeug |
|---|---|---|
| 1. Intent-Discovery | Topic → präzise Seed-Queries + Intent-Hypothesen | Dialog + WebSearch (Foren) |
| 2. SERP-Analyse | Echte SERP-Daten als Entscheidungsbasis | SerpApi |
| 2b. Quellen-Sichtung | Top-Seiten/Foren strukturiert lesen + Rollen zuweisen | WebFetch (kostenlos) |
| 3. Keyword-Expansion | Vollständige Liste mit Volumes | Keyword Planner (mcpwerk-ads) |
| 4. Clustering & Cannibalization | Saubere Cluster ohne interne Konkurrenz | SerpApi + GSC (mcpwerk-gsc) |
| 5. Briefing & Outline | Publikationsreifes Dokument | Markdown-Templates |

**Wichtig**: Zwischen jeder Phase gibt es einen Confirmation-Gate. Niemals von Phase N zu Phase N+1 ohne explizite User-Bestätigung springen.

---

## Phase 0: Projekt-Kontext laden (Pflicht, vor Phase 1)

Dieser Skill läuft innerhalb eines Kundenprojekts mit eigener `CLAUDE.md`. Vor Phase 1 **immer** lesen, damit die Recherche projekt-konform ist und die Outputs am richtigen Ort landen:

1. **`CLAUDE.md` im Projekt-Root** für:
   - **Marke + Domain** (Abschnitt „Über") → ersetzt generische Beispiel-Domains. Kein manuelles Nachfragen nötig, wenn es in CLAUDE.md steht.
   - **GA4-/GSC-Property** (GSC `[GSC_PROPERTY]` für den Cannibalization-Check in Phase 4).
   - **Output-Ordner-Konvention** (siehe Output-Pfade unten).
   - **Content-Typen-Tabelle + Taxonomie-Brücke** (mappt Williams-Cook-Intent/Page-Type auf den projekt-eigenen Content-Typ, den `article-create` und `content-html-formatter` erwarten).
2. **Website-Struktur-Datei in `wissensbasis/`** (URL-Map; Dateiname laut CLAUDE.md > Quellenpfade) → verbindliche Quelle für den Internal-Linking-Plan in Phase 5. Niemals interne Link-Ziele erfinden, immer gegen diese Datei validieren.
3. **`wissensbasis/tone-of-voice.md`** → wird in Phase 5 gebraucht, sobald Text entsteht (Meta-Title, Meta-Description, Direct-Answer, H1). Früh laden.
4. **Briefing-Seed-Check (Eingang aus `deep-keyword-gap-research`, falls vorhanden)** — prüfe, ob für das Topic ein Gap-Map-Seed existiert: `seo/keyword-gap/<nische>/briefing-seed-<id>.json`. Wenn ja, ist das die **bevorzugte Eingangsquelle** — übernimm daraus und überspringe die entsprechenden Phase-1-Fragen:
   - `pillar_keyword` → Topic (Phase 1)
   - `secondary_keywords` / `supporting_terms` → Seed-Kandidaten (Phase 1/3)
   - `recommended_page_type` → Page-Type-Hypothese (Taxonomie-Brücke)
   - `competitor_urls` → Quellen-Sichtung Phase 2b + Keyword-Planner-URL-Input Phase 3
   - `serp_features_present` / `aio_strategy_required` → Phase 2 (AIO bereits vor-erhoben)
   - `volume_approx` / `cpc_eur` / `difficulty_proxy` → Vorab-Kontext (in Phase 3 mit frischen Keyword-Planner-Daten verifizieren, nicht blind übernehmen)
   - `data_gaps` → ins Briefing übernehmen

   Der Seed ist **Vorbefüllung, kein Ersatz** für die SERP-Validierung der Phasen 2–4. Existiert kein Seed: regulär mit User-Input starten (Topic frei erfragen).

**Output-Pfade (verbindlich, NICHT in den Skill-eigenen `assets/`-Ordner schreiben — `assets/` enthält nur Lese-Templates):**

Alle Recherche-Endprodukte gehören in den projektweiten `seo/`-Ordner laut CLAUDE.md (projektweite SEO-Arbeit, die noch nicht seitenbezogen ist, weil der `artikel/content/<content-typ>/<slug>/`-Ordner erst von `article-create` angelegt wird):

| Artefakt | Pfad |
|---|---|
| Source-Review (Phase 2b) | `seo/source-review-{slug}.md` |
| Cluster-Export (Phase 4) | `seo/cluster-{slug}.csv` |
| Cannibalization-Report (Phase 4) | `seo/cannibalization-{slug}.md` |
| Briefing (Phase 5) | `seo/briefing-{slug}.md` |
| SERP-Roh-Snapshots (Phase 2, Forensik, löschbar) | `tmp/serp-snapshots/{seed-slug}.json` (SerpApi-Rohantwort) |

`{slug}` = URL-Slug der geplanten Seite (Kleinbuchstaben, Bindestriche, keine Umlaute) — identisch mit dem späteren Blatt-Ordner `<slug>` unter `artikel/content/<content-typ>/<slug>/`, damit die Verknüpfung über alle Skills hält. Der Slug bleibt der Blatt-Ordner; das vorangestellte `<content-typ>`-Segment ergänzt `article-create` aus dem Projekt-Content-Typ der Seite (z. B. ratgeber, beratung, produkte, kollektionen, profile, landingpages).

**`seo/` ist nur die Zwischenablage:** Briefing/Source-Review/Cluster/Cannibalization landen hier, weil der Artikel-Ordner zum Recherchezeitpunkt noch nicht existiert. Sobald `article-create` den Ordner `artikel/content/<content-typ>/<slug>/` anlegt (Slug als Blatt-Ordner, `<content-typ>` aus dem Projekt-Content-Typ davor), **verschiebt es diese Dateien dorthin** (sie sind seitenbezogen und gehören laut CLAUDE.md zum Artikel, nicht in das projektweite `seo/`). Danach enthält `seo/` nur noch projektweite Dateien wie den Contentplan.

---

## Phase 1: Intent-Discovery

### Goal
Das User-Topic in präzise Search-Queries übersetzen und eine erste Intent-Hypothese aufstellen.

### Actions

1. **Sammle Input vom User** (in einem Block, nicht in 5 Einzelfragen) — **ODER** übernimm die Felder aus dem Briefing-Seed (Phase 0, Schritt 4), falls vorhanden, und frage nur noch fehlende Punkte nach:
   - Topic / grobe Idee für die Seite
   - Zielgruppe (Ausgangspunkt: Zielgruppen-Definition aus CLAUDE.md > Über — z. B. Kaufinteressenten, Bestandskunden, Informationssuchende)
   - Geschäftsziel der Seite (Sale, Awareness, Information/Beratung)
   - Locale (Default: `de-DE`, `gl=DE`)
   - Existiert die Seite schon? (Wenn ja: URL der bestehenden Seite)

   Die Domain steht in CLAUDE.md (> Über) und muss nicht erfragt werden.

2. **Foren-Schmerzpunkt-Mining (optional, aber empfohlen — vor der Seed-Bildung):**
   - 2–3 WebSearch-Abfragen gegen themennahe Communities. Passende Communities aus der Projekt-Nische wählen (Nische laut CLAUDE.md > Über), z. B.:
     `site:gutefrage.net <topic>`, `site:reddit.com <topic>`, plus branchennahe Foren
     (für den fiktiven Beispiel-Kunden Sonnenwerk Solar GmbH etwa `photovoltaikforum.com`
     oder `haustechnikdialog.de`).
   - Sammle daraus: echte Nutzer-Schmerzpunkte, wiederkehrende Fragen, Nutzer-Wording
     (Material für Phase-5-FAQ/H2-Kandidaten).
   - ⚠️ Regeln: nur **Themen und Wording** entnehmen, NIE Texte (Urheberrecht). Foren-Funde
     sind EIN Input im Mix — sie ergänzen die Seeds, ersetzen nicht die SERP-/Keyword-Validierung.

3. **Generiere 3–5 Seed-Queries** aus Topic + Foren-Funden. Long-Tail-bewusst, als ausgewogener Mix (Beispiele aus der Nische des fiktiven Beispiel-Kunden Sonnenwerk Solar GmbH):
   - Ein Head-Term (z. B. "Balkonkraftwerk")
   - Zwei bis drei spezifischere Long-Tails (z. B. "balkonkraftwerk anmelden", "balkonkraftwerk mieter erfahrung")
   - Ein Question-Type-Seed (z. B. "lohnt sich ein balkonkraftwerk") — bevorzugt aus einem echten Foren-Schmerzpunkt, wenn Schritt 2 einen starken liefert

4. **Stelle pro Seed eine Intent-Hypothese** auf, basierend auf den **8 Williams-Cook-Klassen** (siehe `references/intent-classes.md`):
   - Short fact / Bool / Definition / Instruction / Reason / Comparison / Consequence / Question
   - Mappe direkt auf einen Content-Pattern (Tabelle, FAQ, How-To, Definition-Box, etc.)

5. **Hypothesiere den Page-Type** und mappe ihn über die Taxonomie-Brücke in CLAUDE.md auf den Projekt-Content-Typ (Ratgeber / Beratung / Produktbeschreibung / Kollektionsseite / Personen-/Profilseite / Landingpage).

### Exit Gate

Präsentiere dem User:

```
Phase 1 abgeschlossen.

Topic: {topic}
Zielgruppe: {zielgruppe}
Domain: {domain aus CLAUDE.md}

Foren-Schmerzpunkte (Schritt 2):
- {schmerzpunkt_1}
- {schmerzpunkt_2}
{… oder: "keine verwertbaren Funde" — auch das dokumentieren}

Seed-Queries mit Intent-Hypothesen:
1. "{seed_1}" → {intent_klasse} → {content_pattern}
2. "{seed_2}" → {intent_klasse} → {content_pattern}
...

Geplanter Page-Type / Content-Typ: {page_type} / {projekt_content_typ}

Bereit für die SERP-Analyse (Phase 2)?
Oder willst du an den Seeds, der Intent-Hypothese oder dem Content-Typ noch etwas ändern?
```

**Warte auf explizite Bestätigung.** Erst dann zu Phase 2.

---

## Phase 2: SERP-Analyse

### Goal
Für alle Seeds die echte SERP über SerpApi ziehen und als strukturierten Datensatz auswerten. Die SERP entscheidet, welche Intent-Hypothesen tragen und welche fallen.

### Actions

1. **PFLICHT-Primärweg: SerpApi** (`mcp__serpapi__search`; Server `serpapi` in `.mcp.json`). Playwright-Scraping ist NUR noch Fallback bei echtem SerpApi-Ausfall — Google blockt Scrapes von Residential-IPs ohnehin per reCAPTCHA.

2. **Für jeden Seed EIN SerpApi-Call**, DE-localized:
   - Aufruf-Schema:
     ```json
     { "params": { "q": "{query}", "engine": "google", "google_domain": "google.de",
                   "gl": "de", "hl": "de", "num": 10 }, "mode": "complete" }
     ```
   - **Server-Eigenheiten:**
     - `engine: "google"` verwenden, NICHT das Default `google_light` — nur `google` liefert
       PAA/AIO/Shopping-Features.
     - Die Antwort ist groß (~100 KB). Mit jq/python auswerten, nie komplett in den Kontext ziehen.
     - Relevante Antwort-Keys: `organic_results`, `related_questions` (= PAA), `ai_overview`,
       `ads`, `related_searches`, `immersive_products`/`shopping_results`, `inline_videos`.
     - `ai_overview` fehlt oft (Google spielt AIO nur bei manchen Queries aus) — Fehlen ist ein
       Datenpunkt („AIO: nein"), kein Fehler.
   - **Call-Budget:** sparsam bleiben (SerpApi-Kontingent). Phase 2 ≈ 1 Call/Seed (bis ~5 Seeds),
     optional **Desktop und Mobile** (`device: "mobile"`) nur für die 2–3 wichtigsten Seeds
     (Mobile-SERP weicht in DE oft ab — mehr AIO/andere Reihenfolge), plus bis zu ~3 Folge-Calls
     für die stärksten PAA-Fragen (deren SERP entscheidet, ob sie eigene H2-/FAQ-Kandidaten sind).
   - **Speichere die Roh-Antwort** als `tmp/serp-snapshots/{seed-slug}.json` (Forensik, löschbar).

3. **Extrahiere strukturiert** aus der SerpApi-Antwort:
   - SERP-Composition: AI Overview, Featured Snippet, PAA, Knowledge Panel, Shopping/PLA, Local Pack, Video, News, Top Stories
   - Ads-Count (top/bottom)
   - Organic Top 10 (Position, URL, Title, Snippet, Domain, Page-Type-Heuristik)
   - PAA-Questions (`related_questions`)
   - AI-Overview-Source-Liste (wenn vorhanden)

4. **Page-Type-Klassifikation der Top-10** pro Query (heuristisch):
   - URL-Pattern (`/blog/`, `/products/`, `/collections/`, `/pages/`)
   - Title-Pattern ("Vergleich", "vs", "So geht's", "Was ist", Brand-Names)
   - Snippet-Pattern (Preise, Reviews, Listen-Indikatoren)

5. **Intent-Verifikation**:
   - Dominierender Page-Type in Top-10 (mind. 5/10) = bestätigte Intent
   - Wenn Top-10 ≥ 3 unterschiedliche Page-Types zeigt → **Mixed-Intent-SERP-Flag**
   - Vergleiche mit Phase-1-Hypothese: passt sie? wenn nein, welche Klasse passt besser?

6. **SERP-Anatomie-Output** pro Seed:
   - "Click-Share-Realität": wenn AIO+Ads >50% der ATF einnehmen, klassisch organischer Traffic eingeschränkt
   - Top-3-Domains und ihre Autorität (heuristisch: Marke vs. Ratgeber-Portal vs. Marktplatz)
   - Content-Tiefe der Top-3: Wortzahl, H2/H3-Count, Tabellen/FAQ vorhanden (Quick-Check; volle Content-Analyse in Phase 2b)

### Exit Gate

```
Phase 2 abgeschlossen.

SERP-Analyse für {N} Seeds:

Seed 1: "{seed_1}"
  → SERP-Composition: AIO {ja/nein}, Featured Snippet {ja/nein}, PAA {X Fragen}
  → Ads: {N} top / {M} bottom
  → Dominanter Page-Type: {page_type} ({X}/10)
  → Intent (verifiziert): {intent_klasse}
  → Mixed-Intent-Flag: {ja/nein}

[Wiederholung pro Seed]

Wichtigste PAA-Questions (für Phase 5 Outline):
1. {paa_1}
2. {paa_2}
...

Bereit für die Quellen-Sichtung (Phase 2b)?
Oder willst du:
- Seeds nachschärfen (zurück zu Phase 1)
- Weitere Seeds hinzufügen (z.B. die starken PAA-Questions)
- Eine bestimmte SERP genauer ansehen
```

**Warte auf Bestätigung.**

---

## Phase 2b: Quellen-Sichtung (Source Review)

### Goal
Die SERP sagt, WER rankt — diese Phase liest, WAS dort steht. Strukturierte Sichtung der prägenden Quellen als Faktenbasis fürs Briefing, plus Content-Gap-Analyse und saubere Quellen-Rollen-Zuweisung. Ohne diese Phase bleibt das Briefing ein Keyword-Dokument; mit ihr wird es ein Content-Dokument (man muss kennen, was schon dasteht, um darüber hinauszugehen).

### Actions

1. **Quellen-Auswahl aus den Phase-2-SERPs** (Werkzeug: **WebFetch** — kostet KEIN SerpApi-Kontingent):
   - **Top 5 organische Ratgeber-/Herstellerseiten** (über alle Seeds)
   - **2–3 Shop-/Produktseiten**, NUR wenn sie die SERP prägen
   - **2–4 Foren-/Community-Treffer** (aus Phase-1-Mining + Phase-2-SERPs)
   - **YouTube**: nur Titel/Description auswerten (Transcript nur, falls trivial verfügbar)
   - **PDFs** (Hersteller-Anleitungen): nur bei technischer Relevanz

2. **Pro Quelle erfassen** (stichpunktartig, keine Essays):
   - URL · Seitentyp · Titel/H1
   - relevante H2-/Themenstruktur
   - wichtigste Aussagen (paraphrasiert)
   - behandelte Nutzerfragen
   - erkennbare Schwächen/Gaps
   - **Rolle** (Pflichtfeld): `Faktenbasis` | `SERP-Kontext` | `Pain-Point-Input`

3. **Rollen-Regeln (hart):**
   - `Faktenbasis` nur für seriöse Quellen (Hersteller-Doku, Fachquellen, Behörden, Materialkunde).
     NUR diese darf `article-create` für Faktenaussagen verwenden.
   - **Foren/Communities sind NIE Faktenbasis** — immer `Pain-Point-Input` (Nutzerfragen,
     Unsicherheiten, Fehlannahmen, FAQ-Ideen, Nutzer-Wording). Keine ungeprüften Foren-Behauptungen
     als Fakten, keine Direktzitate (Urheberrecht). Foren-URL flüchtig? → SERP-Query statt URL dokumentieren.
   - Shop-/Produktseiten sind i. d. R. `SERP-Kontext` (zeigen Kaufnähe der SERP), keine Faktenbasis.

4. **Content-Gaps gegenüber der eigenen Marke ableiten:** Was beantworten die Quellen NICHT oder
   schlecht (Tiefe, Praxis-Bezug, Ehrlichkeit über Grenzen)? → wird in Briefing §9
   (Konkurrenz-Analyse) konkret. Eigene Stärken einspielen: USPs und Alleinstellungsmerkmale
   aus CLAUDE.md > Über bzw. der `wissensbasis/` (z. B. Expertise, Herkunft, benannte Fachleute).

5. **Output schreiben: `seo/source-review-{slug}.md`** (PFLICHT) mit:
   - Liste geprüfte externe Quellen (je mit Erfassung aus Schritt 2)
   - Liste geprüfte Foren-/Community-Treffer
   - Content-Gaps gegenüber der eigenen Marke
   - Datenlücken / bewusst nicht geprüfte Punkte
   - klare Kennzeichnung: welche Quellen dürfen als Faktenbasis in den Artikel, welche sind nur Themeninput

### Exit Gate

```
Phase 2b abgeschlossen — seo/source-review-{slug}.md geschrieben.

Gesichtet: {N} Ratgeber/Hersteller · {N} Shops · {N} Foren-Threads · {N} Sonstige
Faktenbasis-tauglich: {Liste der Domains}
Nur Themeninput: {Liste}
Wichtigste Content-Gaps: {1-3 Stichpunkte}
Datenlücken: {z. B. PDF nicht abrufbar, YouTube ohne Transcript}

Bereit für Keyword-Expansion (Phase 3)?
```

**Warte auf Bestätigung.**

---

## Phase 3: Keyword-Expansion

### Goal
Aus Seeds + PAA + Competitor-URLs eine vollständige Keyword-Liste mit Volumes.

### Actions

1. **Keyword Planner (`mcp__mcpwerk-ads__run_keyword_planner`)**:
   - **Zuerst `customer_id` ermitteln:** `mcp__mcpwerk-ads__list_accounts`
     (10-stellig, ohne Bindestriche). Manager-Konto funktioniert.
   - **Ideen generieren:**
     - Input A: alle 3–5 Seeds aus Phase 1+2 (Feld `keywords`)
     - Input B: Top-Competitor-URL aus Phase 2 (Feld `page_url` — akzeptiert wird `page_url`
       zusammen mit `keywords`)
     - Region: `geo_target_ids: ["2276"]` (Deutschland), `language_id: "1001"` (Deutsch) — sind
       bereits die Defaults; nur bei AT/CH abweichen (`2040` / `2756`).
     - `page_size` hochsetzen (z. B. 100) für mehr Ideen.
   - Erwartung: 50–500 Keyword-Ideen inkl. Volumen, Competition, CPC-Bandbreite. Mehrere Calls
     mit unterschiedlichen Seed-Gruppen (Head-Terms, Question-Seeds, Competitor-URL) und mergen.
   - **Saisonalität:** über `start_year`/`start_month` … `end_year`/`end_month` erhebbar, falls der
     Endpoint liefert. Kommt nichts Belastbares → als Datenlücke im Briefing dokumentieren, nicht raten.

2. **Merge + Dedupe**:
   - Alle Ideen aus A + B + die PAA-Questions aus Phase 2
   - Synonyme und Plural-Singular-Varianten als separate Einträge belassen (für Cluster-Validierung in Phase 4 wichtig)

3. **Volume-Markierung im Output**:
   - **Pflicht**: alle Keyword-Planner-Volumes als "≈" kennzeichnen (siehe `references/gkp-pitfalls.md` — Ahrefs-Studie: 91,45 % Überschätzung)
   - Bei verfügbarem Zweit-Tool (Ahrefs/Semrush o. ä.): Cross-Validation für die Top-10-Kandidaten
   - Bei >3× Abweichung zwischen Keyword Planner und Cross-Source: **Volume-Conflict-Flag** im Output

4. **Long-Tail-Highlight**:
   - Markiere Long-Tails (≥4 Wörter) und Question-Keywords explizit — diese sind häufig die AI-Overview-Citation-Gewinner (Princeton GEO-Paper).

### Exit Gate

```
Phase 3 abgeschlossen.

{N} Keyword-Kandidaten generiert (50–500 erwartet).

Top-20 nach Relevanz-Score (Volume × Intent-Fit × Long-Tail-Bonus):

| # | Keyword | Volume (≈) | Competition | CPC (≈) | Intent-Klasse |
|---|---|---|---|---|---|
| 1 | {keyword} | {volume} | {comp} | {cpc} | {intent} |
...

Volume-Conflicts (Keyword Planner vs. Cross-Source ≥ 3× Abweichung): {N}
No-Data-Quote (Long-Tails ohne Planner-Volumen): {N}

Bereit für Clustering + Cannibalization-Check (Phase 4)?
Oder willst du:
- Keywords manuell entfernen (Brand-Konkurrenz, irrelevante Modifier, etc.)
- Zusätzliche Keywords manuell hinzufügen
```

**Warte auf Bestätigung.**

---

## Phase 4: Clustering & Cannibalization

### Goal
Aus der Keyword-Liste saubere Cluster bauen (jeder Cluster = eine Seite). Pro Cluster: klare Intent + Content-Typ. Prüfen, ob die geplante Seite mit bestehenden eigenen Seiten kannibalisiert.

### Actions

1. **Lade `references/clustering-thresholds.md`** für Threshold-Defaults und Anti-Patterns.

2. **SERP-Overlap-Clustering**:
   - Top-10-URLs je Keyword via SerpApi (gleiches Aufruf-Schema wie Phase 2). Call-Budget: pro
     Cluster-Kandidat die 2–3 volumenstärksten Keywords abfragen. Phase-2-Snapshots wiederverwenden,
     wo vorhanden. NICHT jedes Long-Tail einzeln.
   - Threshold-Default: **30 % URL-Overlap** im Top-10 → gleicher Cluster
   - Bei Niches mit wenig Volume: Threshold auf 20 % senken; bei hart umkämpften SERPs auf 40 % anheben
   - Algorithmus: greedy clustering, höchstes-Volume-Keyword ist Primary, Rest wird zugewiesen wenn Overlap-Threshold erreicht

3. **Pro Cluster konsolidieren**:
   - **1 Primary Keyword** (höchstes Volume + bester Intent-Fit zum geplanten Content-Typ)
   - **3–8 Secondary Keywords** (gleiche Intent, gleicher Content-Typ)
   - **10–25 Supporting Terms** (Semantik, Entities, PAA-Questions, Long-Tail-Modifier)

4. **Anti-Pattern-Check** (siehe `references/clustering-thresholds.md`):
   - Mixed-Intent-Cluster splitten (z. B. "balkonkraftwerk kaufen" + "was ist einspeisevergütung" → 2 Cluster)
   - Zu kleine Cluster (< 3 Keywords) → mergen oder als Long-Tail-Single-Target führen
   - Zu große Cluster (> 30 Keywords) → wahrscheinlich Mixed-Intent oder Pillar-Kandidat

5. **Cluster-Validierung**:
   - Für jeden finalen Cluster: 2–3 Sample-Keywords erneut SERPen. Gleiche Top-3-URLs → valide, sonst splitten.

6. **Cannibalization-Check** (lade `references/cannibalization-patterns.md`):
   - **Methode A — GSC (bevorzugt)** via `mcp__mcpwerk-gsc__get_search_by_page_query`
     bzw. `get_search_analytics` (Property `[GSC_PROPERTY]`, per `list_properties` verifizieren):
     - Für jeden Cluster die konkurrierenden eigenen URLs + deren Position/Impressionen/Klicks ziehen.
     - Falls das Projekt eine Content-Ownership-Map führt (z. B. `seo/content-ownership-map.md`),
       neue Seiten IMMER gegen diese prüfen.
   - **Methode B — site:-Search** (Fallback, wenn GSC leer/nicht erreichbar):
     - `site:[WEBSITE_DOMAIN] {primary_keyword}` via SerpApi (1 Call), Top-Treffer als konkurrierende eigene URLs.
   - **Severity-Scoring** pro Konflikt:
     - **High**: |Position A − Position B| < 3 UND (Impressions B / Impressions A) > 0,5
     - **Medium**: |Position A − Position B| < 5 UND beide unter Position 10
     - **Low**: |Position A − Position B| ≥ 10 ODER eine URL hat 0 Klicks
   - **Recommendation pro Konflikt**:
     - High + gleiche Intent → **Konsolidieren** (301 von schwächerer URL auf stärkere; Content mergen)
     - Medium + ähnliche Intent → **Differenzieren** (Titles/H1s schärfen, Ownership-Map aktualisieren)
     - High + unterschiedliche Intent → **Erlauben** (zwei legitime Pages für zwei Intents)

7. **Output-Files** (Pfad-Konvention aus Phase 0):
   - `seo/cluster-{slug}.csv` (alle Cluster, Keywords, Volumes, Intent)
   - `seo/cannibalization-{slug}.md` (Konflikte + Recommendations; Abgleich mit der Content-Ownership-Map, falls vorhanden)

### Exit Gate

```
Phase 4 abgeschlossen.

Clustering-Ergebnis:
{N} valide Cluster identifiziert
- Cluster 1: "{primary}" ({M} Keywords, Intent: {klasse}, Content-Typ: {type})
...

Cannibalization-Risks (inkl. Abgleich mit der Content-Ownership-Map, falls vorhanden):
- High Severity: {N}
- Medium Severity: {M}
- Low Severity: {L}

[Wenn High-Severity-Konflikte]:
⚠️ ACHTUNG: {N} High-Severity-Cannibalization-Konflikte mit gleicher Intent gefunden.
Empfehlung: Diese Konflikte VOR dem Schreiben der neuen Seite lösen (siehe Report).

Welcher Cluster soll ins Briefing (Phase 5)?
1. {cluster_1_primary} — {volume_summe}, {intent}
...

Bereit für Phase 5?
```

**Warte auf Cluster-Auswahl + Bestätigung.**

### Abbruch-Bedingung

Wenn der gewählte Cluster eine **High-Severity-Cannibalization mit identischer Intent** hat: explizit warnen und vorschlagen, erst die Konsolidierung der bestehenden Seiten zu machen, statt eine neue zu bauen.

---

## Phase 5: Briefing & Outline

### Goal
Ein publikationsreifes Content-Briefing inklusive H1/H2/H3-Outline, das `article-create` direkt umsetzen kann.

### Actions

1. **Lade `references/geo-best-practices.md`** für die verpflichtenden GEO-Sections.

2. **Lade `assets/briefing-template.md`** als Output-Skelett.

2a. **Lade `seo/source-review-{slug}.md`** (aus Phase 2b) und übernimm daraus die Briefing-Pflichtabschnitte (Template §9 „Quellen & Research-Basis"): Geprüfte Quellen mit Rolle · Foren-/Community-Pain-Points · Content-Gaps gegenüber Wettbewerbern · Datenlücken · **Quellen, die article-create als Faktenbasis verwenden darf** · Quellen, die nur Themeninput sind. Fehlt das Source-Review: Abschnitt mit „kein Source-Review durchgeführt" ehrlich kennzeichnen.

2b. **Lade `wissensbasis/tone-of-voice.md`** (aus Phase 0). Jeder Text im Briefing, der später 1:1 auf der Seite landet — **Meta-Title, Meta-Description, H1, Direct-Answer-Paragraph, FAQ-Antwort-Patterns** — muss im Projekt-Stil formuliert sein (Anrede, Perspektive, Umlaut- und Zeichensetzungsregeln sowie Namens-Schreibweisen laut `wissensbasis/tone-of-voice.md`). Ein voice-konformes Briefing erspart `article-create` die Neuformulierung.

3. **Content-Typ aus SERP-Dominanz übernehmen** (aus Phase 2, über die Taxonomie-Brücke in CLAUDE.md). Bewusste Abweichung nur, wenn explizit begründet. Der Content-Typ steuert die Pflicht-Elemente in `content-html-formatter`.

4. **Intent-Klasse → Content-Pattern** (aus `references/intent-classes.md`):
   - Bool → Yes/No-Lead-Sentence
   - Definition → Definition-Box (40–60 Wörter)
   - Instruction → nummerierte Schritte (CMS-Baustein laut `wissensbasis/html-elemente.md`)
   - Comparison → Vergleichstabelle früh
   - Reason → Kausalkette als Liste
   - Question → Multi-Aspekt-Antwort + FAQ
   - Consequence → If-Then-Struktur
   - Short fact → Zahl im ersten Satz

5. **Outline aufbauen**:
   - **H1**: Primary Keyword vorne, max 60 Zeichen, Search-Intent klar erkennbar
   - **Direct-Answer-Paragraph**: 40–60 Wörter, beantwortet die Hauptquery direkt
   - **H2/H3 als Fragen**: gespiegelt aus PAA + SERP-Top-3-Headings
   - **Content-Sections** entsprechend Intent-Klasse (siehe oben)
   - **FAQ-Section**: 5–10 Top-PAA-Questions aus Phase 2 (Antworten auf den Seiten-Kontext zuschneiden — siehe Duplicate-Content-Regeln in CLAUDE.md)
   - **Internal-Links-Plan**: 3–5 Links zu thematisch verwandten eigenen Seiten (gegen die Website-Struktur-Datei in `wissensbasis/` validiert; falls das Projekt eine Content-Ownership-Map führt, auch gegen diese). Produkt-/CTA-Links nach der jeweiligen Projekt-Regel in CLAUDE.md umsetzen, falls dort definiert.

6. **GEO-Anforderungen verpflichtend**:
   - **Direct-Answer-First** (40–60 Wörter, ganz oben)
   - **Fact-Density**: mind. 1 verifizierbare Aussage / benannte Quelle pro 150–200 Wörter
   - **Cite Sources** mit Datum inline, wo sinnvoll
   - **Experten-Zitat** (benannte Fachleute/Gründer des Projekts, siehe `wissensbasis/`) — starker E-E-A-T-Hebel und Pflicht für Ratgeber/Beratung
   - **Listen + Vergleichstabellen** für extractable Chunks
   - **FAQPage-Schema** für FAQ-Section
   - **EEAT-Block**: Author-Card (aus `wissensbasis/autoren/`), Expertise-/Herkunfts-Bezug der Marke

7. **Schema-Markup-Empfehlung (Projekt-Regeln):**
   - **Ratgeber / Beratung** → **Article + FAQPage** (+ BreadcrumbList; prüfe, ob der
     `content-html-formatter` des Projekts FAQPage/Quotation automatisch erzeugt — dann kein
     manuelles JSON-LD).
   - **Produktbeschreibung (PDP)** → **Product** ist erlaubt und sinnvoll (viele Shop-CMS
     erzeugen Produkt-Schema nativ; CMS laut CLAUDE.md prüfen, nur ergänzen wenn nötig).
   - **Personen-/Profilseite** → Article/Person-Bezug, Experten-Zitat.
   - **NIEMALS HowTo** (von Google seit 09/2023 deprecated). Keine erfundenen Review-/AggregateRating-
     Markups ohne echte Bewertungen.

8. **Wordcount-Empfehlung**:
   - Orientierung: Median Top-10 × 1,2. Aber: Qualität > Quantität. Content-Typ-Range aus CLAUDE.md beachten (z. B. Ratgeber/Beratung 1500–3000, Produktbeschreibung 300–800).

9. **Meta-Title + Meta-Description**:
   - Title: Primary Keyword vorne, max 60 Zeichen; Brand-Suffix mit dem Markennamen nur, wenn die Projektkonvention in CLAUDE.md es vorsieht.
   - Description: Primary Keyword + Nutzen, max 155 Zeichen, kein Werbe-Imperativ.
   - Feinschliff optional über einen projekteigenen Meta-CTR-Skill, falls im Projekt vorhanden.

10. **AI-Overview-Optimization-Checkliste** am Ende des Briefings.

11. **Output**: `seo/briefing-{slug}.md` — publikationsreif. Als Skelett dient `assets/briefing-template.md`.

### Exit Gate

```
Phase 5 abgeschlossen.

Briefing erstellt: seo/briefing-{slug}.md
Source-Review: seo/source-review-{slug}.md
Cluster-Export: seo/cluster-{slug}.csv
Cannibalization-Report: seo/cannibalization-{slug}.md

Zusammenfassung:
- Primary Keyword: {primary}
- Intent-Klasse: {klasse}
- Content-Typ: {projekt_content_typ}
- Geplante H1: {h1}
- Outline: {N} H2-Sections, {M} FAQ-Questions
- Wordcount-Ziel: {wordcount}
- Schema: {schema_typ}

Nächster Schritt im Workflow: den Artikel mit dem `article-create`-Skill anlegen.
article-create liest seo/briefing-{slug}.md als verbindliche Quelle für H-Hierarchie,
Meta-Tags, Keyword-Mapping und Internal-Links und legt die vier Pflichtdateien unter
artikel/content/{content-typ}/{slug}/ an ({slug} = Blatt-Ordner, {content-typ} aus dem Projekt-Content-Typ davor).

Möchtest du:
- Jetzt direkt article-create für slug "{slug}" starten (empfohlen)
- Anpassungen am Briefing (welcher Bereich?)
- Ein anderes Cluster aus Phase 4 ins Briefing nehmen
- Den Skill beenden
```

### Übergabe-Vertrag an article-create

Damit die Kette hält, garantiert dieser Skill, dass das Briefing folgende Felder enthält, die `article-create` direkt weiterverwendet:

| Briefing-Feld | Ziel in article-create |
|---|---|
| `{slug}` (= URL-Slug) | Blatt-Ordnername in `artikel/content/{content-typ}/{slug}/` ({content-typ} aus Projekt-Content-Typ davor) |
| Meta-Title / Meta-Description | `seo.md` Meta-Tags |
| H1 + H2/H3-Outline | `artikel.md` Struktur + `seo.md` H-Hierarchie |
| Primary/Secondary/Supporting Keywords | `seo.md` Keyword-Mapping |
| Internal-Linking-Plan | `seo.md` Interne Verlinkung + Links in `artikel.md` |
| Quellen & Research-Basis (Phase 2b) | Faktenbasis für `artikel.md` (nur `Faktenbasis`-Quellen) |
| Schema-Empfehlung | `seo.md` JSON-LD |
| GEO-Checkliste | `article-create` QA (GEO-Block) |
| Projekt-Content-Typ (aus Taxonomie-Brücke) | steuert `artikel.md`-Template + `content-html-formatter` |

---

## Error Recovery

### Keyword Planner nicht erreichbar (Phase 3)

Wenn der Keyword Planner (mcpwerk-ads-MCP) einen Auth- oder Quota-Error zurückgibt:

```
Der Keyword Planner ist nicht erreichbar ({error_message}).

Möchtest du:
(a) Eigene Volumes als CSV liefern (ich nutze dann diese statt MCP)
(b) Mit SERP-Overlap allein weitermachen (kein Volume, aber Clustering möglich)
(c) Phase abbrechen und später wiederkommen
```

Hinweis: Der `mcpwerk-ads`-Server muss in `.mcp.json` konfiguriert und authentifiziert sein. Ist er es nicht, per ToolSearch prüfen, ob die Tools verfügbar sind; sonst (a)/(b).

### SerpApi ausgefallen (Phase 2/4) — Playwright-Fallback

Primärweg ist SerpApi. Nur wenn SerpApi wirklich ausfällt, per Playwright scrapen:

1. `mcp__playwright__browser_navigate` auf `https://www.google.de/search?q={query}&hl=de&gl=de&pws=0`, dann `browser_snapshot`. Cookie-Banner wegklicken.
2. Google blockt Residential-IPs oft per reCAPTCHA. Bei Block:

```
SERP für "{query}" nicht abrufbar (SerpApi aus, Playwright geblockt).

Möchtest du:
(a) Mir die Top-10-URLs für diese Query manuell liefern
(b) Diese Query überspringen und mit den anderen Seeds weitermachen
(c) Phase abbrechen
```

### GSC nicht verfügbar (Phase 4)

Wenn der `mcpwerk-gsc`-Server nicht erreichbar ist:
- Automatischer Fallback auf Methode B (`site:[WEBSITE_DOMAIN] …` via SerpApi)
- Im Cannibalization-Report explizit dokumentieren: "Analyse basiert auf site:-Search, nicht auf GSC-Impressions. Empfehlung: Nach Page-Launch in GSC monitoren."

---

## Hard Stops (Skill bricht ab und empfiehlt Alternative)

**Bedingung 1**: Phase 3 liefert < 30 Keyword-Kandidaten
→ "Topic ist zu eng für eine Single-Page-Recherche. Empfehlung: Topic breiter fassen oder Pillar-Page-Strategie."

**Bedingung 2**: Domain hat 0 ranking Keywords für das Topic-Cluster (Phase 4, GSC leer + kein Match)
→ Bei jungen Domains erwartbar — kein Abbruch, aber im Briefing als „noch keine Topical Authority, Cluster-Aufbau nötig" vermerken.

**Bedingung 3**: Mehrere High-Severity-Cannibalization-Konflikte ungelöst
→ "Konsolidierung bestehender Seiten muss vor dem Bau neuer passieren. Empfehlung: Cannibalization-Report (und die Content-Ownership-Map, falls vorhanden) durchgehen, dann zurückkommen."

---

## Reference-Files

Lade diese **bei Bedarf** in der jeweiligen Phase:

| File | Phase | Inhalt |
|---|---|---|
| `references/intent-classes.md` | 1, 2, 5 | 8 Williams-Cook-Klassen + Modifier + Content-Patterns |
| `references/serp-feature-patterns.md` | 2 | SerpApi-Response-Keys + SERP-Feature-Interpretation (+ Playwright-Fallback) |
| `references/clustering-thresholds.md` | 4 | SERP-Overlap-Defaults + Anti-Patterns |
| `references/geo-best-practices.md` | 5 | Princeton-Findings + GEO-Anforderungen |
| `references/cannibalization-patterns.md` | 4 | Konsolidieren-vs-Differenzieren-Logik |
| `references/gkp-pitfalls.md` | 3 | Keyword-Planner-Schwächen + Cross-Validation-Strategien |

## Asset-Templates

| File | Phase | Zweck |
|---|---|---|
| `assets/briefing-template.md` | 5 | Briefing-Output-Skelett (inkl. §9 Quellen & Research-Basis) |
| `assets/outline-template.md` | 5 | H1/H2/H3-Outline-Skelett |
| `assets/cluster-export-template.csv` | 4 | Cluster-Export-Spaltenstruktur |
| `assets/serp-snapshot-schema.json` | 2 | JSON-Schema für SERP-Rohdaten (SerpApi) |
| `assets/cannibalization-report-template.md` | 4 | Cannibalization-Report-Skelett |
