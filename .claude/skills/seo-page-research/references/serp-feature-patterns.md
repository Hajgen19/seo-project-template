# SERP Feature Patterns (SerpApi-first, Playwright-Fallback)

Diese Reference dokumentiert, wie SERP-Features in Google-DE-SERPs extrahiert werden, was sie bedeuten, und wie der Skill sie interpretiert.

**Primärweg ist SerpApi** (`mcp__serpapi__search`, `engine:"google"`). Die SerpApi-Antwort ist bereits strukturiertes JSON — keine Selektoren nötig. Der Playwright-Selektor-Teil weiter unten ist nur der **Fallback**, falls SerpApi ausfällt.

---

## Teil A — SerpApi-Response-Keys → Feature-Mapping (Primärweg)

Aufruf: `{ "params": { "q": "…", "engine": "google", "google_domain": "google.de", "gl": "de", "hl": "de", "num": 10 }, "mode": "complete" }`. Die Antwort ist groß (~100 KB) — mit jq/python auswerten, nie komplett in den Kontext laden.

| Feature | SerpApi-Antwort-Key | Bedeutung / Nutzung |
|---|---|---|
| **AI Overview (AIO)** | `ai_overview` (oft nicht vorhanden) | Fehlen = Datenpunkt „AIO: nein", kein Fehler. Enthält ggf. `references`/`sources` → AIO-Quell-URLs für GEO-Analyse. |
| **Featured Snippet** | `answer_box` / `featured_snippet` | Google hat „die Antwort" gewählt. Format (paragraph/list/table) → Intent-Indiz (siehe Teil B). |
| **People Also Ask (PAA)** | `related_questions` | Goldquelle für FAQ-/H2-Kandidaten. `.length` = PAA-Count. |
| **Related Searches** | `related_searches` | Bonus-Seeds für Phase 3 (Keyword-Expansion). |
| **Shopping / Products** | `shopping_results` / `immersive_products` | Transactional-Signal. |
| **Ads** | `ads` (`.length` = Top-Ads) | Kommerzielles Interesse; CPC-Proxy. |
| **Video** | `inline_videos` / `video_results` | How-To-/Visual-Topic. |
| **Local Pack** | `local_results` / `local_pack` | Local Intent. |
| **Knowledge Panel** | `knowledge_graph` | Entity von Google erkannt. |
| **Organic Top 10** | `organic_results[]` (je `position`, `link`, `title`, `snippet`, `date`) | Ranking-Basis + Page-Type-Heuristik (Teil B). |

**Mobile:** denselben Call mit `"device": "mobile"` — in DE weicht die Mobile-SERP oft ab (mehr AIO/andere Reihenfolge). Nur für die 2–3 wichtigsten Seeds, um Budget zu sparen.

Die **Interpretation** jedes Features (was es für Intent/Strategie bedeutet) steht in Teil B — sie gilt unabhängig davon, ob die Daten aus SerpApi oder Playwright kommen.

---

## Teil B — Feature-Interpretation (quellen-unabhängig)

> Die `page.locator(...)`-Code-Snippets in diesem Teil sind **Playwright-Fallback-Selektoren** — nur relevant, wenn SerpApi ausfällt. Die *Interpretation* der Features gilt für beide Wege.

### SERP-Composition: Welches Feature signalisiert welche Intent?

### AI Overview (AIO)

**Bedeutung**: Google hält die Query für gut beantwortbar mit generativen Antworten. Häufig bei Question-, Definition-, Reason-Klassen. AIO nimmt prominenteste Position oben ein, schiebt klassische Top-10 nach unten.

**Selektor (Stand Mai 2026)**:
```python
ai_overview = page.locator('[data-attrid*="AIO"], [aria-label*="AI"], div[jscontroller][data-mh]').first
```

**Volatil!** Häufig wechselnde Selektoren. Fallback: Text-Pattern-Matching auf "Übersicht mit KI" / "AI Overview" / "Generative AI" Headers.

**Forensik-Tipp**: Bei jedem Scrape den ganzen Page-HTML in `serp-snapshots/{slug}.html` ablegen. Wenn Selektoren brechen, kann der Skill den HTML-Snapshot via LLM-Analyse rückwirkend auswerten.

**Interpretation**:
- AIO präsent + Source-Liste sichtbar → Source-URLs extrahieren, diese Pages in Phase 5 als Content-Tiefe-Referenz nutzen
- AIO präsent + dominiert ATF → Briefing braucht GEO-Optimierung (Princeton-Tactics) zwingend
- AIO präsent, eigene Domain nicht zitiert → Optimization-Lücke

### Featured Snippet (Position 0)

**Bedeutung**: Google hat eine spezifische Page als "die richtige Antwort" gewählt. Strong Intent-Indicator: das Format des Snippets verrät die Intent-Klasse.

**Selektor**:
```python
featured_snippet = page.locator('[data-attrid="FeaturedSnippet"]').first
```

**Format-zu-Intent-Mapping**:
| Snippet-Format | Wahrscheinliche Intent |
|---|---|
| Paragraph (40-60 Wörter) | Definition oder Bool |
| Numerierte Liste | Instruction |
| Bullet-Liste | Reason oder Question |
| Tabelle | Comparison oder Short fact |
| Video | Instruction (How-To-Demo) |

**Interpretation**:
- Featured Snippet aus konkurrierender Domain → die Domain hat die Antwort definiert; deine Page muss inhaltlich tiefer/aktueller/präziser sein
- Featured Snippet aus eigener Domain → DON'T MESS WITH IT; nicht refactoren wenn nicht nötig
- Kein Featured Snippet → Opportunity, eine zu claimen (Direct-Answer-Paragraph oben in der Page)

### People Also Ask (PAA)

**Bedeutung**: Goldquelle für Long-Tail-Keywords und FAQ-Section.

**Selektor**:
```python
paa_questions = page.locator('[jsname="yEVEwb"]')
# Click auf erste Frage öffnet meist weitere Sub-Questions
```

**Tiefen-Strategie**:
- Level 1: alle initialen PAA-Fragen extrahieren (meist 4)
- Level 2: jede Frage anklicken, dann erscheinen 2–4 weitere Fragen → extrahieren
- Bei manchen Topics: Level 3 möglich (Click auf Level-2-Frage öffnet weitere)
- Skill-Default: bis Level 2, max 20 Fragen pro Seed

**Interpretation**:
- Viele PAA-Fragen (>10) → Topic ist breit, eine Pillar-Page mit FAQ-Section sinnvoll
- Wenige PAA-Fragen (<3) → Topic ist eng, Single-Long-Tail-Page reicht
- PAA-Fragen aus mehreren Intent-Klassen → Mixed-Intent-Flag

### Knowledge Panel

**Bedeutung**: Google hat eine Entity erkannt (Brand, Person, Place, Concept). Trustsignal: Google-Wissen ist verfügbar.

**Selektor**:
```python
knowledge_panel = page.locator('[data-attrid*="kp"], [data-md="50"]').first
```

**Interpretation**:
- Knowledge Panel für die Query → Topic ist als Entity in Google's Knowledge Graph. Schema.org-Markup für entsprechende Entity-Type lohnt sich.
- Brand-Knowledge-Panel → Wettbewerb ist Brand-dominiert; eigener Ranking-Versuch schwer, außer auf Long-Tail-Modifier
- "About this result"-Box (statt voller Knowledge Panel) → Topic ist neu/wenig autoritativ, gute Chance für eigene Autoritäts-Page

### Shopping Pack / Product Listing Ads (PLA)

**Bedeutung**: Klare Transactional Intent. Google's UI zeigt Produkte direkt.

**Selektor**:
```python
shopping = page.locator('div[data-ved] g-scrolling-carousel[data-attrid*="shopping"]')
```

**Interpretation**:
- Shopping Pack ATF → Top-Half der SERP für E-Commerce. Klassischer Organic-Click auf Top-3 reduziert. SEO-Strategie: Long-Tail mit weniger Shopping-Präsenz wählen, oder auf Shopping-Listing-Optimierung pivotieren.
- Shopping Pack bottom → Transactional, aber Long-Form-Content (Reviews, Guides) hat Chance

### Local Pack (Map + 3-Pack)

**Bedeutung**: Local Intent. Bei DACH-Queries häufig.

**Selektor**:
```python
local_pack = page.locator('[data-attrid="kc:/local:lu cluster"]')
```

**Interpretation**:
- Local Pack vorhanden + User-Domain ist lokal → Local SEO (GMB-Optimierung) ist Pflicht-Sub-Strategie
- Local Pack vorhanden + Domain national → Strategie auf Long-Tail ohne Local-Intent ausweichen ("[Service] online" statt "[Service] Berlin")

### Video Carousel

**Bedeutung**: Visuelle Lernpräferenz oder schwer textuell zu erklärendes Thema.

**Selektor**:
```python
video_carousel = page.locator('g-scrolling-carousel video, [data-attrid*="video"]')
```

**Interpretation**:
- Video Carousel ATF → How-To-Topic, YouTube dominiert. Eigene Page sollte Video einbetten oder YouTube-Channel ausbauen.
- Top-3-Videos aus eigenem Channel → Defensiv halten, nicht ersetzen

### Image Pack

**Bedeutung**: Visuelle Query (z.B. "wärmepumpe innen", "outdoor-einheit").

**Interpretation**:
- Image Pack vorhanden → Image-SEO wichtig (Alt-Texte, Filenames, Schema.org ImageObject)
- Bei Product-Pages: hochauflösende Produkt-Fotos pflicht

### Top Stories / News-Block

**Bedeutung**: Aktuelle News-Relevanz. Topic ist zeitkritisch.

**Interpretation**:
- News-Block für die Query → Topic ist newsworthy, Aktualität essentiell. "Last Updated"-Stempel zwingend.
- News-Block nicht vorhanden + Long-Tail-Query → Topic ist evergreen, weniger Aktualitätsdruck

### Ads (Top + Bottom)

**Bedeutung**: Kommerzielles Interesse.

**Selektor**:
```python
ads_top = page.locator('[data-text-ad="1"]:nth-of-type(-n+4)')  # Top-Ads
ads_bottom = page.locator('[data-text-ad="1"]:nth-of-type(n+5)')  # Bottom-Ads
```

**Interpretation**:
- ≥3 Ads top → starkes kommerzielles Interesse. Top-of-Page-Bid ist guter CPC-Proxy in Phase 3.
- 0 Ads → entweder reines Informational-Topic oder Topic mit zu wenig kommerziellem Wert für Werbetreibende

### Organic Top 10

**Selektor**:
```python
organic_results = page.locator('div.g, [data-snhf]')
```

**Pro Position extrahieren**:
- Position (1–10)
- Title (`h3` innerhalb des Result-Containers)
- URL (`a[href]` — vorsicht: Google-Redirect-URLs, Original via `href` Parameter `&url=...`)
- Snippet (`[data-sncf="1"]` oder `[data-snc="1"]`)
- Domain (extracted aus URL)
- **Page-Type-Heuristik** (siehe unten)

---

## Page-Type-Klassifikation aus SERP-Daten

Heuristik für die Top-10-Klassifikation pro Query:

### URL-Pattern-Heuristik

| Pattern in URL | Page-Type |
|---|---|
| `/blog/`, `/magazine/`, `/ratgeber/`, `/insights/`, `/article/` | Blog |
| `/products/`, `/produkte/`, `/p/`, `/shop/` | PDP |
| `/category/`, `/kategorie/`, `/c/`, `/collection/` | PLP |
| `/services/`, `/leistungen/`, `/loesungen/` | Service-Page |
| `/best-`, `/top-`, `/vergleich/` | Listicle / Comparison |
| `wikipedia.org` | Wikipedia |
| `youtube.com`, `youtu.be` | Video |
| `reddit.com`, `gutefrage.net`, `quora.com` | Forum |
| `/glossary/`, `/glossar/`, `/lexikon/` | Glossary / Definition |

### Title-Pattern-Heuristik

| Pattern im Title | Page-Type-Indiz |
|---|---|
| "Best [X]", "Top X [Y]", "Beste [X]" | Listicle |
| "[X] vs [Y]", "[X] oder [Y]" | Comparison |
| "How to [X]", "Wie [X]", "Anleitung" | How-To (Instruction) |
| "What is [X]", "Was ist [X]" | Definition |
| "Why [X]", "Warum [X]" | Reason |
| Brand-Name am Anfang | PDP / Service-Page |
| Zahl + Pluralform ("7 Tipps", "5 Gründe") | Listicle |

### Snippet-Pattern-Heuristik

- Preisangaben "ab X€", "X €" → PDP
- Reviews "★★★★", "Bewertung X/Y" → Review-Page / PDP
- "Schritt 1", "Step 1" → How-To
- "Folge uns auf" / "Newsletter" / "Buchen" → Service-Page

---

## Output: SERP-Snapshot JSON-Schema

Jeder Scrape resultiert in einer Datei `tmp/serp-snapshots/{seed-slug}-{device}.json`:

```json
{
  "query": "wärmepumpe altbau förderung",
  "locale": "de-DE",
  "device": "desktop",
  "timestamp": "2026-05-27T14:30:00+02:00",
  "snapshot_html_path": "tmp/serp-snapshots/waermepumpe-altbau-foerderung-desktop.html",
  "features": {
    "ai_overview": {
      "present": true,
      "text": "...",
      "sources": ["https://...", "https://..."]
    },
    "featured_snippet": {
      "present": true,
      "format": "list",
      "source_url": "https://...",
      "text": "..."
    },
    "people_also_ask": [
      {"question": "Wie hoch ist die BAFA-Förderung?", "answer_preview": "..."},
      ...
    ],
    "knowledge_panel": null,
    "shopping_pack": [],
    "local_pack": [],
    "video_carousel": [],
    "top_stories": []
  },
  "ads_count_top": 3,
  "ads_count_bottom": 2,
  "organic": [
    {
      "position": 1,
      "url": "https://www.bafa.de/...",
      "title": "BAFA - Bundesförderung für effiziente Gebäude",
      "snippet": "...",
      "domain": "bafa.de",
      "page_type_guess": "Service-Page",
      "estimated_word_count": null
    },
    ...
  ],
  "estimated_intent_class": "Question",
  "mixed_intent_flag": false,
  "dominant_page_type": "Service-Page",
  "dominant_page_type_count": 6
}
```

---

## Best Practices Playwright-Setup für Google.de

### Browser-Context-Config

```python
context = await browser.new_context(
    locale='de-DE',
    timezone_id='Europe/Berlin',
    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    viewport={'width': 1366, 'height': 768},  # gängige DE-Auflösung
    extra_http_headers={
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
    }
)
```

### Stealth-Init

```python
await context.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['de-DE', 'de', 'en'] });
""")
```

### URL-Pattern

```python
url = f"https://www.google.de/search?q={query}&hl=de&gl=de&pws=0&num=10"
```

`pws=0` deaktiviert Personalisierung. `num=10` für Top-10.

### Cookie-Banner-Handling

Google DE zeigt initial einen Consent-Banner. Selektoren wechseln, daher Multi-Versuch:

```python
for selector in [
    'button:has-text("Alle akzeptieren")',
    'button:has-text("Accept all")',
    'button[aria-label*="Alle akzeptieren"]',
    '#L2AGLb',  # häufig stabile ID
]:
    try:
        await page.click(selector, timeout=2000)
        break
    except:
        continue
```

### Anti-Detection-Maßnahmen

1. **Random delays** zwischen Aktionen (300–800ms)
2. **Scroll-Bewegungen** simulieren bevor PAA geklickt wird
3. **Maus-Bewegungen** zwischen den Aktionen (`page.mouse.move()`)
4. **Residential Proxies** wenn möglich (DE-IPs)
5. **Maximum 5 Queries pro Browser-Session**, dann neuer Context

---

## Mobile vs. Desktop: Was unterschiedlich ist

**Desktop**:
- Right-Sidebar mit Knowledge Panel / Ads häufig
- Mehr Pages above-the-fold sichtbar
- AI Overview meist kompakter dargestellt

**Mobile**:
- Single-Column-Layout
- AI Overview nimmt häufig den ganzen ATF ein
- PAA-Fragen früher in der SERP-Reihenfolge
- "Mehr Ergebnisse" / "Weitere Suchen"-Sections am Ende

**Empfehlung**: Beide scrapen. Für DACH-B2C-Topics ist Mobile dominant; für B2B häufig Desktop. Der Skill default: beide scrapen, im Output beide Composition-Reports zeigen.

---

## Quellen

- Roundproxies, "How to scrape Google Search Results in 2026"
- WebScraping.AI Selector-Doku, Stand 2025
- web-agent-master/google-search MCP-Pattern
- Eigene Beobachtungen Mai 2026
