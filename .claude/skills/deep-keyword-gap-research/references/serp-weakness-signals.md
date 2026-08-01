# SERP-Schwäche-Signale — der Kern der Lückenfindung

Ein „Need-Keyword" hat nachgewiesene Nachfrage **und** ein schwaches/themenverfehlendes
SERP-Angebot. Diese Datei definiert die Signale, die `scripts/score.mjs`
(`weaknessSignals()`) aus den SerpApi-Daten ableitet — **ohne** zusätzliche API-Calls.

## Qualifikations-Regel

**≥ 3 erfüllte Signale ⇒ „schwaches, schlagbares SERP"** (`weakness_count ≥ 3`). Eigene
Heuristik-Schwelle. Semrush nutzt ebenfalls eine „≥ 3 weak spots"-Logik, aber mit anderer
Signal-Liste — wir schreiben die Schwelle daher **nicht** Semrush oder ClearSERP zu (in
der Recherche-Verifikation wurde die Gleichsetzung beider Frameworks als Konfundierung
entlarvt). Justierbar über `scope.thresholds.weakness_min`.

## Implementierte Signale (aus SerpApi ableitbar, 0 Zusatzkosten)

| Signal-Key        | Bedingung                                                                   | Bedeutung                                            |
| ----------------- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `ugc_top5`        | ≥ 1 Forum/Reddit/Q&A in Top-5                                               | Google findet keinen besseren redaktionellen Treffer |
| `ugc_heavy`       | ≥ 3 UGC-Treffer in Top-10                                                   | starkes Lücken- **und** Demand-Signal (s. u.)        |
| `no_exact_match`  | kein Top-10-Title enthält die (gefoldete) Query                             | keine dedizierte Seite zum Thema                     |
| `thin_content`    | ≥ 30 % der Treffer ohne/sehr kurzes Snippet (< 50 Z.)                       | dünne Inhalte ranken                                 |
| `weak_domains`    | ≤ 20 % Tier-A-Domains in Top-10                                             | keine starken Marken → niedrige Difficulty           |
| `paa_demand`      | ≥ 3 PAA-Fragen                                                              | offene Fragen ohne klar autoritative Antwortseite    |
| `intent_mismatch` | kommerzielle Query, aber kein Shopping/Ads/Produkt in Top-10 (o. umgekehrt) | SERP verfehlt den Intent                             |

UGC-Hosts (Erkennung in `serp-fetch.mjs`): maßgeblich ist `ugcHostPattern` in
`skill.config.json` (Basis: reddit, gutefrage.net, quora, `forum.*`, wer-weiss-was) —
pro Nische um die Fachforen der Branche erweitern.

## Das UGC-Doppelsignal (wichtigstes Need-Keyword-Muster)

Forum/Reddit/Q&A in den Top-Plätzen zählt **zweifach**:

1. **Schwäche** — kein Publisher bedient die Query mit einer dedizierten Seite.
2. **Demand-Beweis** — echte Nutzer diskutieren das Thema aktiv.

Das ist die stärkste Kombination für eine neue Seite: belegte Nachfrage **plus** belegtes
Angebots-Vakuum. `gap_type` wird dann `untapped` (mit Volumen) bzw. `weak` (ohne Volumen).

## Tier-A-Domains (Difficulty-/`weak_domains`-Bezug)

**Maßgeblich ist `tierADomains` in `skill.config.json`** (plus `scope.tier_a_extra` pro
Lauf) — u. a. wikipedia, amazon, idealo, test.de/stiftung-warentest, große Verlags- und
Vergleichsportale. Diese Aufzählung ist nur illustrativ; bei Abweichung gilt die Config.
Anteil dieser Domains in Top-10 → `domainTierMix` im Difficulty-Proxy **und** invers das
`weak_domains`-Signal.

## Bewusst NICHT implementiert (bräuchte Extra-Daten/Tools — ehrlich ausweisen)

Der „16-Signal"-Katalog mancher Tools (ClearSERP u. a.) umfasst Signale, die ein reiner
SerpApi-Lauf **nicht** liefert. Wir behaupten sie nicht, sondern markieren sie als Lücke:

- **Domain-Score/Backlinks/DR** → bräuchte Ahrefs/Semrush. Ersatz: `weak_domains` +
  `domainTierMix` als Proxy.
- **Page-Speed/Core Web Vitals** → bräuchte PageSpeed-API (außerhalb Scope).
- **Keyword in H1–H6 / Content-Wortzahl** → bräuchte Volltext-Fetch jeder Top-10-Seite
  (teuer). Optional in einer späteren Phase via WebFetch nachrüstbar.

`titleMatchDensity` (in `score.mjs`) ersetzt den `allintitle:`-Operator bewusst: der hat
~80 % Fehlerquote (SERP-Sonar-Studie) — wir zählen exakte Title-Treffer in den real
gescrapten Top-10 statt Googles unzuverlässigen Count abzufragen.

## Gap-Typen (Ableitung in `score.mjs.gapType()`)

| `gap_type` | wann                                                                  |
| ---------- | --------------------------------------------------------------------- |
| `missing`  | `no_exact_match` gesetzt — kein passendes Dokument in Top-10          |
| `weak`     | UGC/schwache Domains dominieren, **kein** GKP-Volumen                 |
| `untapped` | UGC/schwache Domains dominieren, **mit** GKP-Volumen (bestes Need-KW) |
| `shared`   | Cluster-URL-Overlap mit anderem Keyword (gleiche Zielseite)           |
