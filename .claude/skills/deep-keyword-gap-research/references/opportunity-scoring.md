# Opportunity-Scoring — Formeln, Gewichte, Schwellen (Single Source of Truth)

Dieses Dokument definiert **jede** Zahl, die `scripts/score.mjs` rechnet. Wer Gewichte
oder Schwellen ändern will, ändert sie hier **und** im `WEIGHTS`/`THRESHOLDS`-Block von
`score.mjs` (die Datei zitiert dieses Dokument).

## Markenregel-Disziplin (vor allen Zahlen lesen)

Projektregel (CLAUDE.md, belegbare Fakten): **keine erfundenen Metriken.** Für das Scoring heißt das eine
dreistufige Ehrlichkeit, die im Output **sichtbar** bleibt:

1. **Harte Fakten** (extern belegt, adversarial bestätigt) — dürfen als Tatsache stehen.
2. **Kalibrierbare Heuristik** (extern belegt, aber Single-Source/Anbieterdaten) — werden
   als `(Heuristik, Quelle X)` annotiert und sind über `WEIGHTS`/`THRESHOLDS` justierbar.
   Sie taugen zur **relativen Priorisierung**, nicht als absolute Wahrheit.
3. **Verworfen** (Folklore ohne tragfähigen Beleg) — fliegen raus oder gelten nur als
   schwaches Zusatzsignal mit explizitem Disclaimer. Liste unten.

Jeder Zahlenwert im Report trägt eine Quell-Annotation. Nie `0` für „unbekannt" —
immer `n/a`. Der Report-Header trägt den Pauschal-Disclaimer aus `assets/report-template.md`.

---

## 1. Opportunity-Score (finale Priorisierung)

```
OpportunityScore = w1·norm(Volumen)
                 + w2·norm(CPC)              // kommerzieller Wert
                 + w3·SERP_Schwaeche         // 0–1, aus §3
                 + w4·Business_Relevanz      // 0–1, aus Scope (§5)
                 − w5·Difficulty_Proxy       // 0–1, aus §2
                 − w6·AIO_Penalty            // 0–1, aus §4
```

`WEIGHTS` (Defaults, justierbar):

| Gewicht | Default | Bedeutung                                 |
| ------- | ------- | ----------------------------------------- |
| w1      | 0.30    | Nachfrage (Volumen)                       |
| w2      | 0.15    | kommerzieller Wert (CPC-Proxy)            |
| w3      | 0.25    | SERP-Schwäche (= die eigentliche „Lücke") |
| w4      | 0.15    | Geschäfts-Relevanz zur Nische             |
| w5      | 0.10    | Schwierigkeit (Abzug)                     |
| w6      | 0.05    | AIO-Zero-Click-Risiko (Abzug)             |

Normalisierung: `norm(x)` = Min-Max über das **aktuelle Kandidaten-Set** (nicht global),
Volumen vorher `log10(1+x)` (Long-Tail nicht erdrücken). Ergebnis 0–1, ×100 für die Anzeige.
Ergebnis ist ein **relativer Rang innerhalb des Laufs**, kein absoluter Wert → im Output
als `Score: NN (intern, nicht validiert)`.

---

## 2. Difficulty-Proxy (ohne Backlink-/DR-Tool)

Rein aus der SERP-Komposition (SerpApi, Phase 3) — **kein** Ahrefs/Semrush nötig.
Begründung der Werkzeugwahl: Ahrefs-KD ist im Kern ein Backlink-Zähler, Semrush-KD eine
Multi-Faktor-Formel — **kein** Tool gibt eine freie SERP-only-Formel heraus (adversarial
bestätigt, dass „KD = nur Backlinks" eine Übergeneralisierung ist; deshalb bauen wir einen
eigenen, transparenten Proxy statt einen Tool-Wert zu imitieren).

```
Difficulty_Proxy (0–1) = clamp01(
    0.40 · domainTierMix        // Anteil starker Marken in Top-10
  + 0.25 · serpFeatureDensity   // FS + PAA + Shopping + Video belegen ATF
  + 0.20 · titleMatchDensity    // Anteil Top-10 mit exaktem Query im Title (PAT-Proxy)
  − 0.10 · freshnessGap         // Median-Alter Top-10 > 18 Monate → leichter (Abzug)
  − 0.05 · thinContentShare )   // Anteil Treffer ohne/dünnem Snippet → leichter
```

- **domainTierMix**: Anteil der Top-10-Domains in einer Tier-A-Liste starker Marken
  (Wikipedia, Amazon, idealo, Stiftung Warentest, große Verlags-/Vergleichsportale …).
  Projektweite Basisliste = `skill.config.json` → `tierADomains`. **Pro Lauf erweiterbar via
  `scope.tier_a_extra`** (Array von Domains) — Pflicht bei **vertikalen Nischen mit eigenen
  Spezial-Shops**: die Mainstream-Basisliste kennt diese nicht und der Proxy würde die
  Marktführer sonst fälschlich als `weak_domains` werten → massive Difficulty-UNTERschätzung
  (in einem früheren Lauf einer vertikalen Nische erzeugte das 33 Phantom-„Quick-Wins").
  Vorgehen: nach Phase 3 die häufigsten Top-5-Domains der SERPs ansehen und die etablierten
  (Vertikal-Shops, Test-Magazine, große Marktplätze) in `scope.tier_a_extra` aufnehmen, dann
  (neu) scoren. Gegenprobe nicht übertreiben — zu viele Tier-A-Domains ÜBERschätzen die Difficulty.
- **titleMatchDensity** ersetzt den `allintitle:`-Operator bewusst: der hat ~80 % Fehlerquote
  (SERP-Sonar-Studie) → wir zählen exakte Title-Treffer in den real gescrapten Top-10
  (PAT = Page-Allintitle-Proxy), statt Googles unzuverlässigen Count abzufragen.
- **freshnessGap**: nur wenn SerpApi `date`/`publication_date` liefert; sonst 0 (Datenlücke).

---

## 3. SERP-Schwäche-Signale (die „Lücke")

`SERP_Schwaeche` = Anteil erfüllter Signale aus dem Katalog in
`references/serp-weakness-signals.md`. **Heuristik-Schwelle: ≥ 3 Signale ⇒ „schwaches,
schlagbares SERP".** (Eigene Taxonomie. Semrush nutzt ebenfalls eine „≥ 3 weak spots"-Regel,
aber mit anderer Signal-Liste — wir schreiben die Schwelle NICHT Semrush/ClearSERP zu.)

Doppelsignal **UGC/Forum in Top-10**: zählt (a) als Schwäche **und** (b) als
**Demand-Beweis ohne dedizierte Seite** — das stärkste Need-Keyword-Signal überhaupt.

---

## 4. AIO-Screening (Keyword-Ebene, vor der Priorisierung)

Das ist das wichtigste Delta zum seitenweisen Baseline: AIO-Risiko wird **vor** der
Auswahl bewertet, nicht erst beim Schreiben. Details + Quellen in
`references/aio-keyword-screening.md`.

**AIO-Risk-Score** (Heuristik, justierbar):

```
AIO_RISK = intentWeight + lengthWeight + cpcWeight
  intentWeight: Informational/Question/Bool = 3 · Definition/Reason = 2 · Comparison/Instruction = 1 · Transactional/Navigational = 0
  lengthWeight: ≥ 4 Woerter = +2 · 1–3 Woerter = −1
  cpcWeight:    CPC < 0,50 € = +2 · 0,50–2,00 € = +1 · 2,01–5,00 € = 0 (neutral) · > 5,00 € = −2
```

≥ 5 = HOCH · 3–4 = MITTEL · < 3 = NIEDRIG.

**Wichtig — kein Auto-Ausschluss:** AIO-HOCH heißt „Zero-Click-Risiko + Citation-Strategie
nötig", nicht „skippen". Grund: messbarer CTR-Anstieg bei AIO-Queries Anfang 2026
(Over-Avoidance-Risiko). HOCH ⇒ Keyword bekommt Vermerk _„Citation-Strategie verpflichtend"_.

**AIO-adjustierte Traffic-Projektion** (statt naiver GKP-CTR-Kurve):

```
adjusted_traffic = volumen × ctr_multiplier
  AIO vorhanden + eigene Domain NICHT zitiert = 0.28
  AIO vorhanden + zitiert                      = 0.62
  kein AIO                                      = 1.00
```

Quelle: Seer Interactive (53 Brands, 5,47 Mio. Queries, Jan 2025–Feb 2026) — adversarial
bestätigt, **aber Single-Source** ⇒ Heuristik, Annotation `(Seer-Daten)`, im Report mit
Over-Avoidance-Disclaimer. `AIO_Penalty` für §1 = `1 − ctr_multiplier`.

---

## 5. Commercial-Intent-Score (CIS) → Projekt-Seitentyp (Taxonomie-Brücke)

Ergänzt die qualitativen Williams-Cook-Klassen um einen **automatisierbaren** Zahlenwert,
der den Seitentyp vorschlägt. 5 Faktoren, 0–700 Rohpunkte, normiert `/7` → 0–100.
Quelle der Faktor-Struktur: dominate.online (adversarial bestätigt als einzige öffentlich
vollständig operationalisierte Rubrik) ⇒ **Heuristik**, justierbar.

| Faktor                    | Punkte           | Quelle im Skript                                                   |
| ------------------------- | ---------------- | ------------------------------------------------------------------ |
| A Purchase-Modifier       | 0/50/120/200     | `intent-modifiers-de.json` → `commercialModifiers` (foldKey-Match) |
| B Solution-Specificity    | 0–200 (4 Stufen) | Heuristik aus Token-Spezifität + Long-Tail                         |
| C Urgency                 | 0/30/60/100      | `intent-modifiers-de.json` → `urgencyTerms`                        |
| D SERP-Commercial-Signals | 0–100            | `adsSignal()`, s. u.                                               |
| E Fit & Constraints       | 0/30/60/100      | aus Scope (Business-Relevanz)                                      |

**Faktor D — `adsSignal()` (stärkster automatischer Commercial-Proxy):**

```
adsCount ≥ 4 → 100 · adsCount ≥ 2 → 70 · adsCount = 1 → 40
hasShoppingAds → 80 · hasLocalPack → 60 · sonst 0   (Maximum gewinnt)
```

**Seitentyp-Mapping (CIS normiert 0–100) → Taxonomie-Brücke der CLAUDE.md:**

| CIS                                         | Seitentyp (Projekt)                                                             | URL-Muster                |
| ------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| 0–28                                        | Ratgeber                                                                          | `/blogs/ratgeber/<slug>`  |
| 29–57                                       | Ratgeber **+ Produkt-CTA**                                                       | `/blogs/ratgeber/<slug>`  |
| 58–78                                       | Beratung (Vergleich)                                                              | `/blogs/beratung/<slug>`  |
| 79–100                                      | Produktbeschreibung (PDP)                                                         | `/products/<slug>`        |
| Local-Pack dominiert (D=60 als Hauptsignal) | skip-Hinweis, falls das Projekt kein lokales Business ist (`pageType.localSkipType`) |                           |

Die konkreten Typen/Schwellen kommen aus `skill.config.json` (`pageType`) und der
Taxonomie-Brücke in der Projekt-CLAUDE.md — obige Tabelle ist die Standard-Belegung des Templates.

**Hybrid-Pipeline (Kostenschonung):** Faktor A + D sind voll programmatisch → ~75 % der
Keywords ohne LLM. Nur bei CIS-Rohsumme im Graubereich **50–150** einen Haiku-Aufruf für
die Urteils-Faktoren B/C/E. Keine Pseudo-Genauigkeit behaupten (LLM-Intent-Klassifikation
hat eine reale Decke — selbst Menschen sind sich oft uneinig).

---

## 6. Priorisierungs-Buckets (DACH-Schwellen, justierbar)

| Bucket                | Bedingung                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **Quick-Win**         | `Difficulty_Proxy ≤ 0.30` UND `volumen ≥ 100` UND (`current_rank` 6–20 ODER `null`)       |
| **Mid-Term**          | `Difficulty_Proxy 0.31–0.60` UND `volumen ≥ 200` UND `gap_type ∈ {missing, untapped}`     |
| **Authority-Builder** | `Difficulty_Proxy > 0.30` UND `volumen ≥ 1000` UND `intent ∈ {commercial, transactional}` |
| **Skip**              | `volumen < 100` ODER (`Difficulty_Proxy > 0.60` UND `volumen < 1000`)                     |

Tiebreaker: `cpc_eur DESC`. Zielmischung im Report: ~5 Quick-Wins je 1 Authority-Builder.
`volumen` ist immer das GKP-`≈` (Bucket-gerundet) — Buckets sind damit selbst
direktional, nicht exakt.

---

## 7. Bewusst NICHT als harte Schwelle verwendet (adversarial verworfen)

| Folklore                                         | Warum draußen / nur mit Vorbehalt                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KGR** `allintitle/Volumen < 0,25`              | `allintitle:` ~80 % Fehlerquote; ignoriert Intent/E-E-A-T. → ersetzt durch `titleMatchDensity` (§2). KGR nur als optionales Zusatzsignal, nie als Filter, und nur bei Volumen < 250. |
| **„Information Gain"-Score**                     | Patent WO2020081082 existiert, aber Google bestätigt es nie als Ranking-Signal. → höchstens Proxy mit Disclaimer „nicht offiziell bestätigt", kein Scoring-Input.                    |
| **GSC-Anonymisierungsrate „46,77 %"**            | nicht unabhängig verifizierbar, Scheinpräzision. → gestrichen.                                                                                                                       |
| **Feste AIO-CTR-/Trigger-Prozente als Wahrheit** | belegt, aber Single-Source/Anbieter. → nur als annotierte Heuristik + Quartals-Kalibrierung.                                                                                         |

Quartals-Kalibrierung (Betreiber-Aufgabe, nicht automatisiert): die §4-Multiplikatoren und
§4-Trigger-Gewichte gelegentlich gegen ein kleines SerpApi-Sample des eigenen Portfolios
gegenchecken — das AIO-Feld bewegt sich schnell.
