# Cannibalization-Patterns: Konsolidieren, Differenzieren oder Erlauben

Diese Reference legt fest, wie der Skill in Phase 4 Cannibalization-Konflikte bewertet und welche Recommendation pro Konflikt-Typ ausgegeben wird.

## Was ist Keyword-Cannibalization?

Cannibalization tritt auf, wenn **mehrere Pages der eigenen Domain** für dasselbe Keyword (oder ein eng verwandtes) ranken wollen. Folgen:
- Ranking-Signale (Backlinks, Engagement, Authority) verteilen sich statt zu konsolidieren
- Google rankt eine der Pages — meist nicht die strategisch gewünschte
- Click-Through-Rate sinkt, weil keine Page volle Autorität entwickelt

**Cases, die das belegen** (siehe Tiefenrecherche):
- Backlinko: +466 % Klicks in 8 Wochen nach 301-Konsolidierung zweier Artikel
- Zerodown: 413 → 85 Pages konsolidiert, dramatische Sichtbarkeits-Steigerung
- Smashdigital Medical-Case: "best device" + "device reviews" konsolidiert → ranking für beide auf einer Page

---

## Detektions-Methoden

### Methode A: GSC-API (Primary, wenn verfügbar)

**Voraussetzung**: User-Domain in Google Search Console verifiziert, GSC MCP oder API-Zugang vorhanden.

**Query**:
```python
gsc.searchanalytics().query(
    siteUrl='sc-domain:example.de',
    body={
        'startDate': '2025-11-27',
        'endDate': '2026-05-27',  # 180 Tage
        'dimensions': ['query', 'page'],  # WICHTIG: beide zusammen
        'rowLimit': 10000,
        'dimensionFilterGroups': [{
            'filters': [{
                'dimension': 'query',
                'operator': 'contains',
                'expression': '{primary_keyword}'
            }]
        }]
    }
)
```

**Output-Verarbeitung**:
Für jede Query: Liste aller URLs, die dafür Impressions haben. Wenn ≥ 2 URLs derselben Query → potentieller Konflikt.

### Methode B: site:-Search (Fallback)

**Wenn GSC nicht verfügbar**: via Playwright die SERP von `site:{user_domain} "{primary_keyword}"` und `site:{user_domain} {secondary_keyword}` abfragen.

**Output**: Liste interner URLs, die Google für die jeweilige Query als relevant einstuft.

**Beschränkung**: Keine Impression/Click-Daten. Nur Indizierungs-Signal.

---

## Severity-Scoring

Für jeden detektierten Konflikt zwischen URL A und URL B für Query Q:

### High Severity

**Bedingung**: `|Position A − Position B| < 3` UND `Impressions B / Impressions A > 0,5`

**Was das bedeutet**: Beide URLs ranken nah beieinander, beide bekommen substantiellen Traffic. Sie konkurrieren aktiv.

**Beispiel**:
- URL A: Position 4, 2.500 Impressions/Monat
- URL B: Position 6, 1.400 Impressions/Monat
- Position-Diff: 2 (< 3) ✓
- Impr-Ratio: 0,56 (> 0,5) ✓
- → **HIGH**

### Medium Severity

**Bedingung**: `|Position A − Position B| < 5` UND beide unter Position 10

**Was das bedeutet**: Beide URLs sind in Reichweite zu ranken, aber keine ist klar dominant.

**Beispiel**:
- URL A: Position 7, 1.200 Impressions/Monat
- URL B: Position 11, 300 Impressions/Monat
- Position-Diff: 4 (< 5) ✓
- Beide unter Position 10? Nein — URL B ist Position 11
- → **MEDIUM** (weiche Bedingung; eigentlich grenzwertig)

Strikte Auslegung: `Medium` nur wenn beide auf Page 1 (Positionen 1-10).

### Low Severity

**Bedingung**: `|Position A − Position B| ≥ 10` ODER eine URL hat 0 Klicks

**Was das bedeutet**: Klare Dominanz einer URL, andere ist faktisch irrelevant.

**Beispiel**:
- URL A: Position 3, 4.000 Impressions, 380 Klicks
- URL B: Position 24, 8 Impressions, 0 Klicks
- → **LOW** (URL B ist faktisch nicht im Wettbewerb)

---

## Recommendation pro Severity + Intent-Kombination

### Matrix

| Severity | Intent A vs B | Recommendation |
|---|---|---|
| **High** | identisch | **Konsolidieren** (301 von schwächerer auf stärkere URL) |
| **High** | ähnlich (gleiche Klasse, andere Aspekte) | **Differenzieren** (Titles/H1s schärfen, Content-Fokus klar trennen) |
| **High** | unterschiedlich (verschiedene Klassen) | **Erlauben** (legitim, beide Pages bedienen unterschiedliche Use-Cases) |
| Medium | identisch | **Konsolidieren oder Differenzieren** (case-by-case; wenn Traffic-Differenz klar → konsolidieren) |
| Medium | ähnlich | **Differenzieren** (schärfen, monitoren) |
| Medium | unterschiedlich | **Erlauben + Monitor** |
| Low | beliebig | **Erlauben oder Ignore** (schwache URL wird ohnehin nicht ranken) |

---

## Konsolidierungs-Workflow

Wenn die Recommendation "Konsolidieren" ist, generiert der Skill folgenden Plan:

### Schritt 1: Bestimme die "Master-URL"

Kriterien (in dieser Priorität):
1. Mehr Klicks in den letzten 180 Tagen
2. Mehr Backlinks (wenn Ahrefs/Semrush MCP verfügbar)
3. Bessere URL-Struktur (kürzer, sprechender)
4. Höhere Position im Ranking
5. Älteres Publish-Datum (mehr Authority akkumuliert)

### Schritt 2: Content-Merge-Plan

- Best Sections aus der schwächeren URL identifizieren
- In die Master-URL integrieren (als zusätzliche H2-Sections)
- Update "Last Modified"-Datum

### Schritt 3: 301-Redirect

- Von schwächerer URL auf Master-URL
- **Permanent halten** (min. 12 Monate, idealerweise dauerhaft)
- Internal Links auf die schwächere URL alle umschreiben

### Schritt 4: Monitoring

- Master-URL in GSC für die Konflikt-Queries beobachten
- Erwartung (typisch): nach 2–4 Wochen Sprung von Position 15 → 3–5 (mehrere Cases dokumentieren das Pattern)

**Output im Cannibalization-Report**: Konsolidierungs-Plan als Actionable Steps mit erwarteten Effekten.

---

## Differenzierungs-Workflow

Wenn die Recommendation "Differenzieren" ist:

### Schritt 1: Intent-Klärung pro URL

Pro URL: Welche Williams-Cook-Klasse ist die primäre? Welcher Page-Type?

**Beispiel-Konstellation**:
- URL A "/wärmepumpe-altbau/" — aktuell Mixed (Definition + Comparison + Service)
- URL B "/wärmepumpe-altbau-foerderung/" — aktuell Mixed (Short fact + Bool)

### Schritt 2: Klare Intent-Trennung

- URL A → Pillar/Guide-Page für **Question/Comparison-Intent**: "Welche Wärmepumpe für welchen Altbau?"
- URL B → Short-fact-Page für **Force-spezifische Förder-Fragen**: "Wärmepumpe Altbau: BAFA-Förderung 2026 (Höhe, Voraussetzungen, Antrag)"

### Schritt 3: Title/H1/Meta-Description neu schreiben

- Pro URL: Title schärfen so dass die jeweilige Intent klar ist
- Meta-Description: explizit benennen, was der User auf dieser Page findet

### Schritt 4: Cross-Linking

- URL A linkt im "Förderung"-Abschnitt zu URL B als deep-dive
- URL B linkt im Intro zu URL A als Pillar-Kontext

### Schritt 5: Content-Anpassung

- URL A: Förder-Sections kürzen, auf URL B verweisen
- URL B: andere Themen rausnehmen, Fokus auf Förderung

---

## Sonderfälle

### Sonderfall 1: Konflikt zwischen geplanter NEUER Seite und bestehender alter Seite

**Häufiger Fall im Skill**: User plant neue Seite, Phase 4 zeigt: bestehende Seite rankt schon für die geplanten Keywords.

**Entscheidung**:
- Wenn die bestehende Seite gut performt (Position ≤ 10, steigender Trend): **abbrechen** und stattdessen die bestehende Seite optimieren
- Wenn die bestehende Seite schlecht performt (Position > 20, fallender Trend) und veraltet ist: **die neue Seite bauen und die alte 301en**
- Wenn die bestehende Seite mittel performt (Position 11–20, stabil): **die neue Seite mit klarer Intent-Differenzierung bauen**, beide laufen lassen

**Im Skill**: Diese Logik im Cannibalization-Report explizit als Fork-Decision dem User vorlegen, nicht still entscheiden.

### Sonderfall 2: PLP + Blog-Post zum gleichen Term

**Beispiel**: "/produkte/wärmepumpen/" (PLP) und "/blog/wärmepumpe-leitfaden/" (Blog)

**Diagnose**: Verschiedene Intents (Transactional + Informational). Normalerweise legitim — Google rankt häufig beide für dieselbe Query, weil Mixed-Intent.

**Aber**: Wenn beide für dieselbe Query untereinander ranken (z.B. Position 6 + Position 8), splittet sich der Click-Traffic, beide verlieren Click-Share.

**Recommendation**: Wenn Cannibalization-Severity High → Title/H1 schärfen, sodass jeweils klar wird, was der User auf welcher Page bekommt. "Wärmepumpen kaufen | [Brand]" (PLP) vs. "Wärmepumpe 2026: Vollständiger Ratgeber" (Blog).

### Sonderfall 3: Kategorie-Page kannibalisiert Sub-Kategorie-Page

**Beispiel**: "/wärmepumpen/" (Top-Kategorie) und "/wärmepumpen/luft-wasser/" (Sub-Kategorie)

**Häufiges Problem in Shopify und WooCommerce**: Top-Kategorie rankt für spezifische Sub-Term, weil sie mehr interne Links hat.

**Fix**:
- Top-Kategorie: ausschließlich auf den breitesten Term optimieren ("wärmepumpen")
- Sub-Kategorie: Title/H1 explizit auf den spezifischeren Term ("luft-wasser wärmepumpen")
- Internal-Linking-Audit: Top-Kategorie linkt prominent auf Sub-Kategorien

---

## Cannibalization-Report-Template-Output

`seo/cannibalization-{slug}.md` (Pfad-Konvention aus SKILL.md Phase 0):

```markdown
# Cannibalization-Report: {Topic}

**Erstellt**: {Datum}
**Domain**: {user_domain}
**Geplante neue Seite**: {primary_keyword} (Cluster X aus Phase 4)
**Datenquelle**: GSC API (180 Tage) / site:-Search

## Übersicht

- {N} Konflikte detektiert
  - High Severity: {n_high}
  - Medium Severity: {n_medium}
  - Low Severity: {n_low}

## High-Severity-Konflikte

### Konflikt 1: Query "{query}"

**URLs**:
- URL A: {url_a} — Position {pos_a}, {impr_a} Impressions/Monat, {clicks_a} Klicks
- URL B: {url_b} — Position {pos_b}, {impr_b} Impressions/Monat, {clicks_b} Klicks

**Severity**: HIGH
**Intent A**: {intent_klasse_a}
**Intent B**: {intent_klasse_b}
**Recommendation**: {konsolidieren|differenzieren|erlauben}

**Action-Plan**:
{steps}

[Wiederholung pro Konflikt]

## Medium-Severity-Konflikte

[Analog]

## Low-Severity-Konflikte (zur Kenntnis)

[Knapp gelistet]

## Abschluss-Empfehlung

[Eine der drei Optionen]:

1. **Konflikte erst lösen, dann neue Seite bauen**: Empfehlung wenn ≥ 1 High-Severity-Konflikt mit identischer Intent ungelöst.
2. **Neue Seite mit klarer Intent-Differenzierung bauen**: Empfehlung wenn Konflikte differenziert werden können.
3. **Neue Seite bauen, alte 301en**: Empfehlung wenn alte Seite schlecht performt und veraltet ist.

## Monitoring-Setup

Nach Implementation der Empfehlungen:
- {N} GSC-Queries zur Beobachtung markieren
- Wöchentlicher Check der Cluster-Performance
- Erwartete Effekte: {z.B. "Position 15 → 3-5 in 2-4 Wochen für High-Severity-Konsolidierungen"}
```

---

## Quellen

- AdvancedGSC, "How to Find Keyword Cannibalization in Google Search Console"
- Semrush, "Keyword Cannibalization: How to Find, Fix, and Prevent It"
- Backlinko-Case: +466 % nach Konsolidierung
- Zerodown-Case: 413 → 85 Pages
- Eigene Praxisbeobachtungen aus Agentur-Audits
