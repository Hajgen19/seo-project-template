# Keyword-Clustering: Thresholds, Methoden und Anti-Patterns

Diese Reference legt fest, wie der Skill in Phase 4 Keywords zu Clustern gruppiert, welche Thresholds zu wählen sind, und welche Anti-Patterns aktiv vermieden werden müssen.

## Kernprinzip: SERP-Overlap, nicht Semantik

**Warum SERP-Overlap die Primär-Methode ist**:

Semantische Ähnlichkeit (z.B. via Embeddings) gruppiert Keywords nach Wort-Verwandtschaft. Das produziert Mixed-Intent-Cluster wie:
- "wärmepumpe kosten" (Short fact / Commercial Investigation)
- "wärmepumpe definition" (Definition / Informational)
- "wärmepumpe kaufen" (Transactional)

Alle drei haben semantische Nähe ("wärmepumpe"), aber Google rankt für sie komplett unterschiedliche Page-Types. Eine einzelne Page kann sie nicht gleichzeitig bedienen.

**SERP-Overlap-Clustering** löst das: zwei Keywords gehören in einen Cluster, wenn ihre Top-10-SERPs sich stark überlappen. Wenn Google für beide Queries dieselben Pages relevant findet, kannst auch du beide Queries mit einer Page bedienen.

**Tool-Benchmark-Ergebnis** (Keyword Insights, Keyword Cupid, ContentGecko 2025-Tests): SERP-basiert scoring **70–89/100** in Cluster-Qualität — höchste Werte aller Methoden.

---

## Threshold-Defaults

### URL-Overlap-Threshold im Top-10

| Topic-Typ | Threshold | Begründung |
|---|---|---|
| Standard (Default) | **30 %** | 3 von 10 URLs identisch → wahrscheinlich gleiche Intent |
| Niche mit wenig Volume | 20 % | weniger Daten, mehr Toleranz |
| Hart umkämpfter SERP (>100k Volume) | 40 % | strikter, weil mehr Pages konkurrieren |
| Brand-dominierte SERPs | manuell prüfen | Brand-Pages verzerren Overlap |

**Beispiel**:
- "wärmepumpe altbau" Top-10: A, B, C, D, E, F, G, H, I, J
- "wärmepumpe bestandsbau" Top-10: A, B, C, K, L, M, N, O, P, Q
- Overlap: 3 URLs (A, B, C) = 30 % → Cluster zusammen
- "wärmepumpe altbau kosten" Top-10: A, X, Y, Z, ... — nur 1 URL Overlap (A) = 10 % → eigener Cluster (Short fact-Intent)

### Clustering-Algorithmus (Greedy)

1. **Sortiere Keywords nach Volume absteigend**
2. **Höchstes-Volume-Keyword** = Primary von Cluster 1
3. **Für jedes nächste Keyword**: prüfe Overlap zu allen existierenden Cluster-Primaries
   - Wenn Overlap ≥ Threshold zu einem Cluster: zum Cluster hinzufügen als Secondary/Supporting
   - Wenn nicht: neuer Cluster, dieses Keyword wird Primary
4. **Cluster-Validierung am Ende**: Pro Cluster 2–3 Sample-Keywords erneut SERPen → wenn nicht mehr Overlap im Top-3, Cluster splitten

---

## Cluster-Größen (Best Practice)

Pro Cluster = pro Seite:

| Rolle | Anzahl | Beschreibung |
|---|---|---|
| **Primary Keyword** | 1 | Höchstes Volume + bester Intent-Fit zum geplanten Page-Type. Wird Haupt-Anker (URL, H1, Meta-Title). |
| **Secondary Keywords** | 3–8 | Gleiche Intent, gleicher Page-Type, SERP-Overlap mit Primary. Gehen in H2-Headlines und Page-Intro. |
| **Supporting Terms** | 10–25 | Semantik, Entities, PAA-Questions, Long-Tail-Modifier. Gehen in H3-Sections, FAQ, Body-Text. |

**Gesamt-Cluster-Größe**: 14–34 Keywords. Mehr als 30 ist Warnsignal (siehe Anti-Patterns).

---

## Anti-Patterns

### Anti-Pattern 1: Mixed-Intent-Cluster

**Symptom**: Cluster enthält Keywords aus ≥ 2 unterschiedlichen Williams-Cook-Klassen.

**Beispiel**:
```
Cluster (FALSCH):
  - "wärmepumpe definition" (Definition)
  - "wärmepumpe vs gasheizung" (Comparison)
  - "wärmepumpe kaufen 2026" (Transactional)
```

**Erkennen**: In Phase 4 für jedes Cluster die Intent-Klassen-Verteilung prüfen. Wenn ≥ 2 Klassen mit mind. 2 Keywords vertreten → splitten.

**Fix**: Cluster splitten nach Intent-Klassen. Im Beispiel oben → 3 separate Cluster, 3 separate Pages.

### Anti-Pattern 2: Zu kleine Cluster (Thin Clusters)

**Symptom**: Cluster mit nur 1–2 Keywords.

**Problem**: Eine Page für 1–2 Long-Tail-Keywords mit niedrigem Volume rechnet sich nicht; oft Thin-Content-Risiko.

**Fix-Optionen**:
- **Option A**: Merge mit nächst-verwandtem Cluster (wenn Intent kompatibel) als zusätzliche Supporting-Terms
- **Option B**: Aufnehmen als Sub-Section innerhalb eines größeren Cluster-Pages
- **Option C**: Wenn Volume hoch und Intent eindeutig: trotzdem eigene Page (Northeast Medical Group-Case: eine Long-Tail-Frage → 250k Visits/Monat)

### Anti-Pattern 3: Zu große Cluster (Mega Clusters)

**Symptom**: Cluster mit > 30 Keywords.

**Diagnose**:
- **Wahrscheinlichkeit A**: Mixed-Intent-Cluster (häufigster Grund) → nach Intent splitten
- **Wahrscheinlichkeit B**: Topic ist Pillar-Page-Kandidat → Pillar + 3–7 Spoke-Pages aufbauen, jede mit eigenem Sub-Cluster
- **Wahrscheinlichkeit C**: Threshold zu locker → von 30 % auf 40 % erhöhen, erneut clustern

**Fix**: Nie eine Page für >30 Keywords versuchen. Pillar-Strategie oder Threshold-Adjustment.

### Anti-Pattern 4: Brand-Keywords in Generic-Clustern

**Symptom**: Cluster enthält Brand-Keywords ("buderus wärmepumpe") gemischt mit generischen ("wärmepumpe").

**Problem**: Brand-Keywords haben fundamental andere Intent (User kennt Brand schon → Service/PDP-Suche) als generic Top-Funnel-Keywords.

**Fix**: Brand-Keywords immer in eigenen Cluster, idealerweise auf Brand-/Service-Page mapppen.

### Anti-Pattern 5: Misspellings als eigene Cluster

**Symptom**: "wärmepumpe", "wärmepumpen", "waermepumpe" als 3 Cluster.

**Problem**: Google behandelt diese ohnehin als gleiche Query (siehe Featured Snippet ist identisch). 3 Cluster = 3 Pages, die kannibalisieren.

**Fix**: Misspellings/Plurals immer im selben Cluster als Supporting-Terms.

### Anti-Pattern 6: SERP-Overlap ohne Intent-Sanity-Check

**Symptom**: Zwei Keywords haben 30 % URL-Overlap, aber unterschiedliche Page-Types in den überlappenden URLs.

**Beispiel**:
- "beste wärmepumpe 2026" überlappt mit "wärmepumpe test" → beide rangen für stiftung-warentest.de
- Aber: stiftung-warentest.de bringt einen Test-Artikel, der für beide Queries die Best-Antwort ist (Mixed-Intent-Pattern)
- Eine eigene Listicle würde für beide Queries ranken können — also DOCH ein Cluster

**Fix**: Bei Borderline-Cases die Top-3-URLs MANUELL prüfen (Skill kann web_fetch nutzen). Wenn die Top-3-URLs den Page-Type haben, den DU bauen willst, ist es ein Cluster.

---

## Sonderfall: Question-Class-Cluster

Question-Class-Queries (Multi-Aspekt) erzeugen häufig Mega-Cluster, weil sie thematisch breit sind.

**Strategie**:
- Wenn das Cluster-Primary eine Question-Class-Query ist und das Cluster ≥ 20 Keywords hat:
  - Prüfen ob es eine **Pillar-Page** sein sollte (lange Form, 3000+ Wörter, viele H2-Sections, breite Coverage)
  - Alternativ: aus dem Mega-Cluster gezielt 2–3 Sub-Cluster ausgliedern für separate Long-Tail-Pages

**Beispiel**: "welche wärmepumpe für altbau" als Pillar-Page; Sub-Cluster:
- "luftwärmepumpe altbau" (eigene Spoke-Page, Comparison)
- "wärmepumpe altbau heizkörper" (eigene Spoke-Page, Question)
- "wärmepumpe altbau förderung" (eigene Spoke-Page, Question + Short fact)

---

## Cluster-Validierung am Ende

Bevor Phase 4 abgeschlossen wird, für jeden finalen Cluster:

1. **2–3 Sample-Keywords erneut SERPen** (idealerweise nicht das Primary, sondern Secondary/Supporting).
2. **Overlap-Check der Top-3 URLs**: Wenn dieselben Top-3 wie beim Primary auftauchen → Cluster ist valide.
3. **Wenn nicht**: Cluster splitten, das Sample-Keyword als neues Primary nehmen.

Diese Validierung kostet Playwright-Calls, aber verhindert die teurere Lektion ("Page rankt nicht, weil Cluster Mixed-Intent war").

---

## Output: Cluster-Export-Format

`seo/cluster-{slug}.csv` (Pfad-Konvention aus SKILL.md Phase 0):

```csv
cluster_id,role,keyword,volume,competition,top_of_page_bid,intent_class,trend_3m,saisonalitaet
1,primary,"wärmepumpe altbau",8100,medium,3.20-5.50,Question,stable,
1,secondary,"luftwärmepumpe altbau",1900,low,2.80-4.20,Comparison,stable,
1,secondary,"wärmepumpe altbau geeignet",720,low,1.90-3.40,Bool,stable,
1,supporting,"wärmepumpe altbau jaz",480,low,1.50-2.80,Short fact,stable,
1,supporting,"wärmepumpe altbau sanierung",1300,medium,2.40-4.10,Question,stable,
1,supporting,"wärmepumpe altbau kosten",2900,medium,2.80-5.20,Short fact,stable,
2,primary,"wärmepumpe förderung",27100,high,4.50-7.80,Short fact,peak-Q1,Q1 peak +180%
...
```

---

## Quellen

- Keyword Insights, "Keyword Clustering Tool – Group Keywords by SERP Similarity"
- Oncrawl, "Keyword clustering using Python and the SERP API"
- Eigene Methodik basierend auf Keyword Insights / Keyword Cupid / ContentGecko Benchmark-Tests 2025
