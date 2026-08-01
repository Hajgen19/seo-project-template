# DACH-Normalisierung & Sprachregeln

Begründet die Logik in `scripts/lib/normalize-de.mjs`. Kernprinzip: **für das Matching
normalisieren, aber die Original-Schreibweise als Anzeige behalten** — und Schein-Merges
echter Komposita/Numerus-Varianten vermeiden.

## 1. Umlaut/ß — getrennte Buckets, normalisiert matchen

`foldKey()`: lowercase + `ä→ae, ö→oe, ü→ue, ß→ss` + Whitespace-Kollaps → der Match-Key.

**Belegt:** GKP führt ä/ö/ü/ß und ae/oe/ue/ss als **getrennte Buckets** mit teils massivem
Volumenunterschied — Beispiel „mödling" 5.400/Monat vs. „moedling" 140 (~38×). Google-Suche
behandelt beide funktional gleich, GKP nicht. Quelle: david-asen-marketing.de
(adversarial bestätigt).

**Regel:** Über `foldKey` als dieselbe Variante erkennen (mergen), aber: (a) Original als
`display` behalten, (b) bei GKP idealerweise **beide** Schreibweisen abfragen und Volumina
addieren, (c) für die Anzeige die volumenstärkere/nutzernahe (Umlaut-)Form.

## 2. Komposita-Gate — Fugenelemente NICHT verschmelzen

`isSpellingVariant(a,b)` mergt **nur** bei reiner Trenn-/Leerzeichen-Differenz (nach
`foldKey` + Strip von Leer-/Bindestrichen identisch):

- „kfz versicherung" = „kfz-versicherung" = „kfzversicherung" → **merge**.
- „auto versicherung" = „autoversicherung" → **merge**.
- „wärmepumpe förderung" ≠ „wärmepumpenförderung" → **GETRENNT** (Fugen-„n" ändert die
  Buchstabenfolge; das sind zwei eigenständige Keywords mit eigenem Ranking-Potenzial).

**Bewusst keine Levenshtein-Toleranz** beim Merge: das Risiko, echte Komposita zu
verschmelzen, wiegt schwerer als der Nutzen, Tippvarianten zu mergen (Konservativ-Prinzip).
`levenshtein()` bleibt für das Difficulty-/Overlap-Scoring exportiert.

## 3. Numerus — Singular ≠ Plural trennen

`numerusRelation()` erkennt Singular/Plural-Paare (DE-Endungen `-e/-en/-n/-s/-er`), **mergt
sie aber NICHT** — sie werden als `numerus_siblings` querverlinkt. Begründung: John Mueller
(Google, 2020) — Singular/Plural können unterschiedlichen Intent signalisieren (Plural →
Listen-/Tabellen-Erwartung). Quelle: dataloft.ch, seo-suedwest.de (adversarial bestätigt).

## 4. Geo-Targeting & AT/CH-Divergenzen

| Land | Google-Ads `location_id` | Sprache   | Besonderheit                                                                                                                  |
| ---- | ------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| DE   | 2276                     | 1001 (de) | —                                                                                                                             |
| AT   | 2040                     | 1001 (de) | ~1/10 DE-Volumen; eigene Begriffe (Sackerl, Semmel)                                                                           |
| CH   | 2756                     | 1001 (de) | **kein ß → immer ss** (`chNormalize`); nur ~5,6 Mio. DE-Sprecher von 9 Mio. → `gl=ch` mischt DE/FR/IT, überschätzt DE-Volumen |

**Regel:** Jedes Land in **getrennten** GKP-/SERP-Läufen erheben (nicht aggregieren),
`geo` pro Entry führen. CH-Seeds vor der Abfrage durch `chNormalize` (ß→ss). Lexikalische
DACH-Divergenzen (z. B. „Velo" CH vs. „Fahrrad" DE/AT) brauchen ggf. eigene Seeds — im
Scope-Dialog erfragen, wenn AT/CH im Scope. Quelle: advancedwebranking.com/blog/seo-strategy-dach-markets.

## 5. Slugging

`slugify()` für Pfad-/Dateinamen: `foldKey` + nur `a-z0-9-`, gekappt auf 80 Zeichen. Damit
ist `<nische-slug>` reproduzierbar und Umlaut-frei (Windows-/Git-sicher).

## Verworfen / mit Vorbehalt

Die in der Recherche genannte „~38×"-Zahl ist ein **Einzelbeispiel**, kein allgemeiner
Faktor — sie illustriert nur, dass die Buckets getrennt sind. Im Output keine pauschalen
Volumen-Verhältnisse zwischen Schreibweisen behaupten; immer je Variante real abfragen.
