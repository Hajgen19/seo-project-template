# Keyword-Gap-Report: {{niche}} ({{geo}})

> **Datenbasis & Vorbehalte (Markenregel — nicht entfernen):**
> Volumina sind **GKP-Schätzungen** (`≈`, Bucket-gerundet, im Schnitt 2–3× überschätzt).
> KD/Difficulty ist ein **SERP-Komposition-Proxy** (kein Backlink-Tool), 0–1.
> `Opportunity-Score` ist ein **interner, nicht validierter** Relativ-Rang dieses Laufs.
> AIO-Multiplikatoren sind Heuristik (Seer-Daten, Single-Source). `n/a` = keine Daten
> (nie als 0 interpretieren). Saisonalität: **Datenlücke** (GKP-Trend-Endpoint defekt).
> `current_rank`/Kannibalisierung: {{coverage_mode}} — GSC greift erst nach Launch.
>
> Lauf: `{{run_id}}` · SerpApi-Calls: {{serp_calls_used}}{{budget_note}} · Stand: {{datum}}

## Zusammenfassung

- Kandidaten gesamt: **{{total}}** · Need-Keywords (≥3 Schwäche-Signale): **{{needKeywords}}**
- Cluster: **{{clusters}}** · Quick-Wins: **{{quickWins}}** · Mid-Term: **{{midTerm}}** · Authority: **{{authority}}**
- AIO-HOCH (Citation-Strategie nötig): **{{aioHigh}}**
- Coverage: {{gap_new}} GAP_NEW · {{covered}} COVERED · {{cannibalization}} Kannibalisierungs-Konflikte

{{executive_2_3_saetze}}

## Priorisierungs-Tabelle (nach Opportunity-Score)

| #   | Keyword | Intent | Vol ≈ | adj. Traffic | CPC € | Diff | AIO | Gap | Seitentyp | Bucket | OPP | Aktion |
| --- | ------- | ------ | ----- | ------------ | ----- | ---- | --- | --- | --------- | ------ | --- | ------ |

{{#each entries}}
| {{i}} | {{keyword}} | {{intent_class}} | {{volume_approx}} | {{adjusted_traffic_approx}} | {{cpc_eur}} ({{cpc_flag}}) | {{difficulty_proxy}} | {{aio_risk}} | {{gap_type}} | {{page_type}}{{cta}} | {{priority_bucket}} | {{opportunity_score}} | {{aktion}} |
{{/each}}

`Aktion` ∈ {Neue Seite · Content-Update · Snippet-Optimierung · Schema ergänzen · Interne Verlinkung stärken}.

## Quick-Win-Liste (sofort umsetzbar)

Kriterium: `Difficulty ≤ 0.30` UND `Vol ≥ 100` UND nicht bereits top-rankend. Sortiert nach
`volume_approx × (1 − difficulty_proxy)`.

{{#each quickwins}}

1. **{{keyword}}** — Vol ≈ {{volume_approx}}, Diff {{difficulty_proxy}}, {{gap_rationale}}
   → `/seo-page-research "{{pillar_keyword}}"` (Seed: `seo/keyword-gap/{{niche_slug}}/briefing-seed-{{cluster_id}}.json`)
   {{/each}}

## Cluster-/Themen-Map

Pro Cluster eine Zielseite. Verhältnis-Ziel: ~5 Quick-Wins je 1 Authority-Builder.

{{#each clusters}}

### Cluster {{id}}: {{primary}} ({{intent}}, → {{recommended_page_type}})

- **Sekundär:** {{secondary}}
- **Gap-Begründung:** {{gap_rationale}}
- **SERP-Features:** {{serp_features}}{{aio_note}}
- **Coverage:** {{coverage_status}}{{cannibal_note}}
- **Übergabe:** `seo/keyword-gap/{{niche_slug}}/briefing-seed-{{id}}.json`
  {{/each}}

## Need-Keyword-Analyse (qualitativ)

{{je_top_need_keyword: warum-Lücke, Nutzer-Wording aus Community, empfohlener Winkel}}

## Datenlücken & nächste Schritte

- {{datenluecken_liste}}
- Nächster Schritt je Top-Cluster: Briefing-Seed an `seo-page-research` übergeben (Zeilen oben).
- Nach Launch: GSC-Lauf wiederholen für `current_rank`/Striking-Distance/Kannibalisierung.
- Quartalsweise: AIO-Multiplikatoren gegen SerpApi-Sample kalibrieren (aio-keyword-screening.md).
