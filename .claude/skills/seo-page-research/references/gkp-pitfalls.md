# Google Keyword Planner: Schwächen und Cross-Validation-Strategien

Diese Reference legt fest, wie der Skill mit Google-Keyword-Planner-Daten umgeht. Kurz: **vertraue ihnen nicht blind**, sondern triangulier sie.

## Die zentrale Studie: Tim Soulo / Ahrefs (n=72.635)

**Studie**: "GSC vs. GKP: Comparing Search Volumes for 72k Keywords"
- **Datensatz**: 72.635 Keywords, für die Ahrefs Zugang zu echten GSC-Impression-Daten hatte
- **Vergleichsbasis**: GSC-Impressions (Ground Truth) vs. GKP-Volumes
- **Hauptfindung**: GKP überschätzt Volumes in **91,45 % der Fälle**

**Detailverteilung**:
- **45,22 %**: "roughly accurate" (≤50 % Abweichung)
- **54,28 %**: dramatisch verzerrt (>50 % Abweichung)
- **Median-Überschätzung**: GKP zeigt typisch das 2–3-fache der echten Impressions
- **Worst Cases**: 10–100× Überschätzung

**Warum überschätzt GKP**:
1. **Phrase-Konsolidierung**: GKP gruppiert Misspellings, Plurale, und enge Synonyme in einen Bucket
2. **Werbe-fokussierter Origin**: GKP ist ein PPC-Tool, optimiert für Werbe-Volumen-Forecasting, nicht für SEO-Realität
3. **Bucket-System**: Volumes werden in Schwellenwert-Buckets gerundet ("10–100", "1k–10k") — Präzision bewusst niedrig
4. **Account-Status-Abhängigkeit**: Accounts ohne aktive Kampagnen sehen breite Range-Volumes; aktive Accounts sehen genauere Zahlen

---

## Konsequenz für den Skill

### Regel 1: Volumes immer als "≈" markieren

Jeder Output-Volume-Wert im Skill bekommt:
- `≈` Prefix (z.B. "≈ 8.100")
- Quelle ("Quelle: Google Keyword Planner, Mai 2026")
- Range-Hinweis im Footer: "GKP-Volumes sind im Durchschnitt 2–3× überschätzt (Ahrefs-Studie 2021)"

### Regel 2: Bei kritischen Entscheidungen cross-validieren

**Kritisch** = Volume bestimmt:
- Investment-Entscheidung für eine neue Seite (Pillar vs. Spoke)
- Saisonalitäts-Planung
- ROI-Forecasting für den Kunden

**Wann cross-validieren**:
- Für die Top-10-Keywords im Cluster (Primary + Secondary)
- Nicht für Long-Tail-Supporting-Terms (zu viele, Aufwand nicht gerechtfertigt)

**Wie cross-validieren**:
- **Wenn Ahrefs MCP verfügbar**: Volume aus Ahrefs ziehen, vergleichen
- **Wenn Semrush MCP verfügbar**: Volume aus Semrush ziehen, vergleichen
- **Wenn GSC für die User-Domain verfügbar UND die Domain rankt schon mittelmäßig**: Eigene Impressions als Sanity-Check (Untergrenze des wahren Volumes)
- **Wenn keine andere Quelle**: AnswerThePublic, SISTRIX, oder zumindest Google Trends als Trend-Validierung

### Regel 3: Volume-Conflict-Flag bei >3× Abweichung

Wenn GKP und Cross-Source um Faktor 3 oder mehr abweichen:
- **Flag** im Output
- **Mittelwert** im Briefing-Output nutzen, NICHT GKP-Wert
- **Hinweis an User**: "Volume-Diskrepanz für '{keyword}': GKP ≈ X, Cross-Source ≈ Y. Wahres Volume vermutlich näher an Y."

---

## Welche GKP-Spalten nutzen, welche ignorieren

### Spalten, die der Skill NUTZT

| Spalte | Nutzung im Skill | Caveat |
|---|---|---|
| **Avg. monthly searches** | Größenordnung für Priorisierung | "≈" markieren |
| **Competition (Low/Medium/High)** | Grobe SEO-Schwierigkeits-Heuristik | Sehr grob; nicht mit Ahrefs KD gleichsetzen |
| **Top of page bid (low/high)** | Commercial-Intent-Proxy | Hoher Bid = starkes kommerzielles Interesse |
| **3-month change** | Kurzfristiger Trend | Saisonalitäts-Indikator |
| **YoY change** | Langfristiger Trend | Topic-Wachstum / Niedergang |
| **24-month trend chart** | Saisonalität | Peak-Identifikation |

### Spalten, die der Skill IGNORIERT

| Spalte | Warum ignoriert |
|---|---|
| **Impressions Forecasts** | Bekannt unzuverlässig (PPC-fokussiert) |
| **Ad Group Suggestions** | Nicht SEO-relevant |
| **Conversion estimates** | Werbe-spezifisch, irrelevant für Content-Planung |
| **CPC-only-Metriken** | Top-of-Page-Bid ist besserer Commercial-Indicator |

---

## Workflow für Phase 3 (Schritt-für-Schritt)

### Schritt 1: Seeds vorbereiten

- Alle Seed-Queries aus Phase 1
- Top-3 Competitor-URLs aus Phase 2 (für URL-basierte Expansion)
- Wichtigste PAA-Questions aus Phase 2

### Schritt 2: GKP-Discover-New-Keywords

```python
# Pseudocode für Keyword Planner MCP
results_seeds = keyword_planner.keyword_ideas(
    keywords=seed_queries,
    language='de',
    country='DE',
    network='GOOGLE_SEARCH'
)

results_urls = keyword_planner.keyword_ideas(
    urls=competitor_urls,
    language='de',
    country='DE',
    network='GOOGLE_SEARCH'
)
```

### Schritt 3: Merge + Dedupe

- Beide Result-Listen plus PAA-Questions zusammen
- Dedupe nach exact match (Lowercase, getrimmt)
- **NICHT** Plurale/Singular zusammenführen (für SERP-Overlap-Clustering später wichtig)

### Schritt 4: Search-Volume-and-Forecasts

```python
volumes = keyword_planner.historical_metrics(
    keywords=merged_list,
    language='de',
    country='DE'
)
```

### Schritt 5: Long-Tail-Highlight

Markiere Long-Tails:
- ≥ 4 Wörter im Keyword
- Question-Format-Keywords ("was", "wie", "warum", "ist")
- Spezifische Modifier ("2026", "in DACH", "für Altbau")

Diese sind häufig die **AI-Overview-Citation-Gewinner** (siehe `geo-best-practices.md`).

### Schritt 6: Saisonalität ermitteln

Für die Top-10 Cluster-Kandidaten:
- 24-Monats-Trend ziehen
- Peak-Faktor berechnen: `max(monatliches_volumen) / median(volumes)`
- Wenn Peak-Faktor ≥ 2: **Saisonalitäts-Flag** + Monat des Peaks
- Im Output: "Plan for {Peak-Monat}: Publish 4–6 Wochen vorher"

### Schritt 7: Cross-Validation (Top-10)

Pro Top-10-Kandidat:
- Volume aus alternativer Quelle (Ahrefs / Semrush / eigenes GSC) ziehen
- Bei Abweichung >3×: Volume-Conflict-Flag
- Mittelwert für nachfolgende Priorisierung verwenden

### Schritt 8: Relevance-Score berechnen

Für die finale Sortierung:

```
relevance_score = log(volume) × intent_fit × long_tail_bonus / (1 + competition_score)
```

- `volume`: ≈ GKP-Volume (oder Mittelwert nach Cross-Validation)
- `intent_fit`: 0.5–1.5 (wie gut passt die Intent zum geplanten Page-Type)
- `long_tail_bonus`: 1.0 für ≤ 3 Wörter, 1.3 für 4 Wörter, 1.5 für ≥ 5 Wörter (Long-Tails sind GEO-stärker)
- `competition_score`: 1 für Low, 2 für Medium, 3 für High

---

## Cross-Source-Fallback-Hierarchie

Wenn der User keinen Ahrefs/Semrush MCP hat:

1. **Eigene GSC-Daten** (wenn User-Domain rankt schon) — beste Validierung
2. **Google Trends** — keine absoluten Volumes, aber Trend-Validierung
3. **AnswerThePublic** — gut für Long-Tail-Existenz-Validierung
4. **SISTRIX** (kostenfreier Modus) — Trend + grobes Volume
5. **Bing Webmaster Tools** — überraschend gute Long-Tail-Daten

Wenn keine Cross-Validation möglich:
- GKP-Volume nutzen, ABER explizit kommunizieren: "Volume-Schätzung beruht ausschließlich auf GKP, der typisch 2–3× überschätzt. Reale Click-Erwartung entsprechend nach unten korrigieren."

---

## DACH-spezifische Besonderheiten

GKP-Daten für deutschsprachige Keywords sind bekanntermaßen unzuverlässiger als US-Daten:

1. **Kleinere absolute Volumes**: Bucket-Rundung schlägt stärker zu (z.B. "10–100" deckt schon 10× Range ab)
2. **Compound-Word-Problem**: "Wärmepumpenförderung" vs. "Wärmepumpe Förderung" werden manchmal als gleicher Bucket geführt, manchmal nicht
3. **Regionale Streuung**: DE-Volumes mischen DACH-weit, obwohl AT/CH andere Kaufpräferenzen haben
4. **Umlaute**: "Wärmepumpe" und "Waermepumpe" Buckets sind teils getrennt, teils nicht

**Konsequenz**: Für DACH-Topics ist Cross-Validation noch wichtiger. Empfehlung: immer mind. eine Alternative-Source heranziehen.

---

## Beispiel-Output mit korrekten Volume-Markierungen

`seo/cluster-{slug}.csv` (Pfad-Konvention aus SKILL.md Phase 0):

```csv
cluster_id,role,keyword,volume_gkp,volume_validated,validation_source,volume_conflict,competition,top_of_page_bid_eur,intent_class,long_tail,trend_3m,saisonalitaet
1,primary,"wärmepumpe altbau",~8100,~5400,ahrefs,flag,medium,3.20-5.50,Question,no,stable,
1,secondary,"luftwärmepumpe altbau",~1900,~1500,ahrefs,no,low,2.80-4.20,Comparison,no,stable,
1,secondary,"wärmepumpe altbau geeignet",~720,~600,ahrefs,no,low,1.90-3.40,Bool,yes,stable,
1,supporting,"wärmepumpe altbau heizkörper tausch",~210,n/a,n/a,n/a,low,1.50-2.20,Question,yes,stable,
...
```

---

## Quellen

- Tim Soulo / Ahrefs, "GSC vs. GKP: Comparing Search Volumes for 72k Keywords"
- BKA Content, "How Accurate Is Google Keyword Planner?"
- ncosentino/google-keyword-planner-mcp GitHub-Repo (für MCP-Implementierungsdetails)
- Eigene Praxiserfahrung aus DACH-Klienten-Recherchen
