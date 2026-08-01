# AI-Overview-Screening auf Keyword-Ebene

Das wichtigste Delta zum seitenweisen Baseline: AIO-Risiko wird **vor** der Priorisierung
bewertet, nicht erst beim Schreiben (die Seiten-Ebene bleibt bei den GEO-Best-Practices des
Projekts). Implementiert in `scripts/score.mjs` (`aioRisk()`), Detection in `serp-fetch.mjs`.

## Markenregel-Status dieser Zahlen

**Alle Prozente/Multiplikatoren hier sind belegte, aber Single-Source-/Anbieter-Daten ⇒
kalibrierbare Heuristik, kein Fakt.** Im Output mit Quelle annotiert, im Report mit
Disclaimer. Quartalsweise gegen ein kleines SerpApi-Sample des eigenen Portfolios
gegenchecken (das AIO-Feld bewegt sich schnell — Betreiber-Aufgabe, nicht automatisiert).

## AIO-Risk-Score (Heuristik)

```
AIO_RISK = intentWeight + lengthWeight + cpcWeight
  intentWeight: Informational/Question = 3 · (Definition/Reason-nah) = 2 · Commercial = 1 · Transactional = 0
  lengthWeight: ≥ 4 Wörter = +2 · 1–3 Wörter = −1
  cpcWeight:    CPC < 0,50 € = +2 · 0,50–2,00 € = +1 · 2,01–5,00 € = 0 (neutral) · > 5,00 € = −2
```

**≥ 5 = HOCH · 3–4 = MITTEL · < 3 = NIEDRIG.**

Belegte Muster hinter den Gewichten (Semrush AI-Overviews-Studie / ZipTie, mehrfach
unabhängig zitiert — in der Verifikation als gestützt eingestuft):

- AIO-Trigger-Rate nach Query-Länge: 1 Wort ~9,5 % → 4+ Wörter ~60,9 %.
- Comparison-Queries triggern AIOs in ~95 % der Fälle (deshalb zählen Vergleichs-Keywords
  trotz `intentWeight=1` über die Länge schnell nach oben).
- CPC < 0,50 $ ~60,7 % AIO-Rate vs. CPC > 10 $ ~17 % → hoher CPC = AIO-sicherer.
- Intent-Drift 2025: informationaler AIO-Anteil fiel 91,3 % → 57,1 %; transaktional stieg
  1,98 % → 13,94 % — AIO dringt aktiv in kommerzielles Terrain vor.

## Kein Auto-Ausschluss — AIO-HOCH ≠ skip

AIO-HOCH heißt **„Zero-Click-Risiko, Citation-Strategie verpflichtend"**, nicht „verwerfen".
Grund: messbarer CTR-Anstieg bei AIO-Queries Anfang 2026 (Seer: 1,3 % → 2,4 %, +85 % über
Jan–Feb 2026) → **Over-Avoidance-Risiko**. Wer AIO-Keywords pauschal meidet, verschenkt
Recovery-Potenzial. `aio_strategy_required: true` wird im Briefing-Seed gesetzt.

## AIO-adjustierte Traffic-Projektion (statt naiver CTR-Kurve)

```
adjusted_traffic = volume_approx × ctr_multiplier
  AIO vorhanden + eigene Domain NICHT zitiert = 0.28
  AIO vorhanden + zitiert                      = 0.62
  kein AIO                                      = 1.00
```

Quelle: Seer Interactive (53 Brands, 5,47 Mio. Queries, 2,43 Mrd. Impressions, Jan 2025–
Feb 2026) — adversarial bestätigt, aber **Single-Source** ⇒ Heuristik. `AIO_Penalty` im
Opportunity-Score = `1 − ctr_multiplier`. Im Report **immer** das adjustierte Potenzial
zeigen, nie den Rohwert (sonst systematische Überschätzung informationaler Keywords).

## SerpApi-Detection (in `serp-fetch.mjs`)

```js
const aio = data.ai_overview || null;
const hasAIO = !!aio;
const aioSources = aio ? (aio.references || aio.sources || []).map((x) => x.link) : [];
const aioCitedSelf = aioSources.some((s) => domainOf(s) === selfDomain);
```

- AIO ist in DE seit Anfang 2025 aktiv (`gl=de&hl=de` setzen).
- Fehlt der `ai_overview`-Key → `aio_proxy` über `featured_snippet` (schwaches Ersatzsignal;
  FS- und AIO-Quellen überlappen erfahrungsgemäß stark). Fehlen ist ein Datenpunkt
  („AIO: nein"), kein Fehler.

## AIO-sichere Keyword-Kategorien (positive Filter-Liste, DACH)

Niedrige AIO-Rate ⇒ sauberes klickbares Feld — bevorzugen, wenn sonst gleichwertig:

- **Transaktional mit Kauf-Modifier** (~20–25 % AIO vs. 60 %+ informational).
- **Hoher CPC > 5 €** (~17 % AIO).
- **Shopping-/Produktnahe Queries**, lokale Queries („in [Stadt]", „in der Nähe") — sehr niedrig.

Beispiel (Sonnenwerk Solar GmbH, Solaranlagen): „balkonkraftwerk kaufen" (transaktional)
ist AIO-sicherer als „wie funktioniert ein balkonkraftwerk" (informational) — bei sonst
gleichem Score Vorzug.
