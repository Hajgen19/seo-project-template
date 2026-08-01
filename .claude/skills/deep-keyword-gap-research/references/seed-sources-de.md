# Seed-Quellen — 7-Quellen-Harvest (Phase 1)

Mehr Quellen als GKP allein, geordnet **nach Kosten/Yield**: kostenlose zuerst, API-Budget
zuletzt. Jeder Kandidat trägt ein `source`-Tag (siehe Output-Contract). Ziel: orthogonale
Keyword-Sets, die GKP systematisch nicht erfasst.

| #   | Quelle                              | `source`-Tag      | Werkzeug                                              | Kosten              | Caveat                                                                                                                                                                                                                     |
| --- | ----------------------------------- | ----------------- | ----------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Related Searches                    | `related_search`  | aus Phase-3-SERP-Snapshots (`bonus_seeds`)            | 0 (Nebenprodukt)    | erst nach erstem SERP-Lauf verfügbar → iterativ                                                                                                                                                                            |
| 2   | People-Also-Ask                     | `paa`             | SerpApi `related_questions` aus Standard-Call         | 0 (im SERP-Call)    | **best-effort**: dedizierte Rekursion (`google_related_questions` + `next_page_token`) ist laut SerpApi-Doku „difficult to extract reliably" (GitHub #617/#1865) → Fehler als erwartet behandeln, nicht als Pipeline-Bruch |
| 3   | Google-Autocomplete „Alphabet-Soup" | `suggest`         | `suggest-harvest.mjs`                                 | 0 (freier Endpoint) | 2 s/Call, Soft-Block-Erkennung; Cap pro Seed                                                                                                                                                                               |
| 4   | GSC Striking-Distance               | `gsc_striking`    | `coverage-gsc.mjs` (Position 4–20, CTR < 3 %)         | 0 (GSC-API)         | liefert nur bei indexierter Domain mit Suchtraffic Signale — bei jungen Domains zunächst leer                                                                                                                              |
| 5   | GKP-Ideen                           | `gkp` / `gkp_url` | `kw-enrich.mjs`                                       | API (1 QPS/CID)     | `page_url` nur zusammen mit `keywords`; ~25 Ideen/Call                                                                                                                                                                     |
| 6   | Competitor-Gap                      | `competitor_gap`  | GKP-Ideen je Competitor-URL **minus** eigene Coverage | API                 | echte Lücke = was Wettbewerber haben und wir nicht                                                                                                                                                                         |
| 7   | DACH-Community-Mining               | `community`       | WebSearch `site:…` (Modell, nicht Skript)             | 0                   | nur Themen/Wording, NIE Texte (Urheberrecht); Foren = Pain-Point-Input, nie Faktenbasis                                                                                                                                    |

## Alphabet-Soup-Details (`suggest-harvest.mjs`)

- Endpoint: `https://www.google.com/complete/search?client=firefox&hl=de&gl=de&q=…` →
  JSON `[query, [suggestions…]]`, Suggestions in Index `[1]`. Kein Key/Login (verifiziert).
- Expansion pro Seed: `seed + a–z`, `Fragewort + seed`, optional `seed + Modifier`
  (`--modifiers`). Cap `--max-per-seed` (Default 60). `--depth 2` expandiert die häufigsten
  Funde erneut (begrenzt).
- Geo: DE `gl=de` · AT `gl=at` · CH `gl=ch&hl=de` (+ `ß→ss`). Soft-Block (HTML statt JSON)
  → 60 s Backoff + 1 Retry, dann überspringen (kein Abbruch).

## DACH-Community-Map (Schritt 7, Reihenfolge nach Ergiebigkeit)

Die Foren-Auswahl ist nischenabhängig und wird in Phase 0 mit dem Scope festgelegt.
Schmerz-Indikator-Strings für die `site:`-Queries: `funktioniert nicht`, `empfehlt ihr`,
`Erfahrung mit`, `welches ist besser`, `lohnt sich`, `Problem mit`.

1. `site:gutefrage.net` (allgemeine Kauf- und Alltagsfragen — Basis für jede Nische)
2. Themenspezifische Fachforen der Nische — in Phase 0 ermitteln.
   Beispiel Solaranlagen (Sonnenwerk Solar GmbH): `site:photovoltaikforum.com`
3. Reddit-DE: `site:reddit.com/r/de` + themenspezifische Subreddits
4. YouTube nur Titel/Description (kein Transcript-Pflichtteil)

⚠️ Foren liefern **Themen, Fragen, Nutzer-Wording** — niemals zitierte Fakten oder
Direktzitate. Sie ergänzen die Seeds, ersetzen nie die SERP-/GKP-Validierung der Phasen 2–3.

## Merge & Dedup

Alle Quellen landen in `dedupeKeywords()` (`normalize-de.mjs`): Schreibvarianten mergen,
Singular/Plural getrennt halten (querverlinkt), `source`-Tags pro Gruppe sammeln. Ein
Keyword aus mehreren Quellen ist ein **Stärke-Signal** (mehrfach belegte Nachfrage).
