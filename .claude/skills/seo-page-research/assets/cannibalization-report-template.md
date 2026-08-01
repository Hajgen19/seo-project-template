# Cannibalization-Report: {topic_title}

**Erstellt**: {timestamp}
**Domain**: {user_domain}
**Geplante neue Seite**: {primary_keyword} (Cluster {cluster_id} aus Phase 4)
**Datenquelle**: {data_source}
**Methode**: {methodology}

---

## Executive Summary

- **{n_conflicts} Konflikte** insgesamt detektiert
- **{n_high} High-Severity** (Sofortmaßnahme empfohlen)
- **{n_medium} Medium-Severity** (Differenzierung empfohlen)
- **{n_low} Low-Severity** (Monitor, kein Eingriff nötig)

**Abschluss-Empfehlung**: {overall_recommendation}

---

## High-Severity-Konflikte

> Diese Konflikte sollten VOR dem Bau der neuen Seite gelöst werden. Sonst riskiert man, eine weitere kannibalisierende URL hinzuzufügen.

### Konflikt 1: Query `{conflict_1_query}`

**Konkurrierende URLs**:
| URL | Position | Impressions/Monat | Klicks/Monat | Intent | Page-Type |
|---|---|---|---|---|---|
| {url_a_1} | {pos_a_1} | {impr_a_1} | {clicks_a_1} | {intent_a_1} | {page_type_a_1} |
| {url_b_1} | {pos_b_1} | {impr_b_1} | {clicks_b_1} | {intent_b_1} | {page_type_b_1} |

**Severity**: HIGH
- Position-Differenz: {pos_diff_1} (< 3)
- Impression-Ratio: {impr_ratio_1} (> 0,5)

**Intent-Vergleich**: {intent_comparison_1}

**Recommendation**: {recommendation_1}

**Action-Plan**:
{action_plan_1}

**Erwarteter Effekt**: {expected_effect_1}

---

### Konflikt 2: Query `{conflict_2_query}`

[Analoge Struktur]

---

## Medium-Severity-Konflikte

> Diese können bestehen bleiben, aber sollten differenziert werden, damit beide Seiten zu unterschiedlichen Intents klar positioniert sind.

### Konflikt M1: Query `{conflict_m1_query}`

**Konkurrierende URLs**:
| URL | Position | Impressions/Monat | Klicks/Monat |
|---|---|---|---|
| {url_a_m1} | {pos_a_m1} | {impr_a_m1} | {clicks_a_m1} |
| {url_b_m1} | {pos_b_m1} | {impr_b_m1} | {clicks_b_m1} |

**Recommendation**: Differenzieren
**Concrete Steps**:
- {step_1}
- {step_2}

[Wiederholung pro Medium-Konflikt]

---

## Low-Severity-Konflikte (zur Kenntnis)

> Faktisch keine echte Konkurrenz; eine URL dominiert klar.

| Query | Dominante URL (Position) | Schwache URL (Position) | Action |
|---|---|---|---|
| {q_l1} | {url_dom_l1} ({pos_dom_l1}) | {url_weak_l1} ({pos_weak_l1}) | Ignore / Monitor |
| {q_l2} | {url_dom_l2} ({pos_dom_l2}) | {url_weak_l2} ({pos_weak_l2}) | Ignore / Monitor |
| ... |

---

## Fork-Decision: Bau der neuen Seite?

Basierend auf den detektierten Konflikten gibt es drei Pfade:

### Pfad A: Erst konsolidieren, dann neu bauen

**Wann empfohlen**: {n_high_unresolved} High-Severity-Konflikte mit identischer Intent gefunden.

**Vorgehen**:
1. Konsolidierungs-Plan aus High-Severity-Konflikten umsetzen (siehe oben)
2. 2–4 Wochen warten und Performance-Stabilisierung beobachten
3. Dann erst die neue Seite bauen

**Risiko bei Nicht-Beachtung**: Die neue Seite kannibalisiert zusätzlich; alle drei Seiten ranken schlechter als eine konsolidierte.

### Pfad B: Neu bauen mit klarer Intent-Differenzierung

**Wann empfohlen**: Konflikte sind differenzierbar (unterschiedliche Intent-Klassen oder Page-Types).

**Vorgehen**:
1. Neue Seite mit klar abgegrenztem Title/H1/Meta-Description
2. Bestehende konkurrierende Seiten auf ihre eigene Intent fokussieren (Differenzierung-Maßnahmen)
3. Cross-Linking zwischen den Seiten

### Pfad C: Alte Seite 301en, neu bauen

**Wann empfohlen**: Bestehende konkurrierende Seite performt schlecht (Position > 20, fallender Trend) UND ist inhaltlich veraltet.

**Vorgehen**:
1. Neue Seite bauen
2. Alte Seite 301-redirecten auf neue
3. Internal-Links zur alten Seite alle aktualisieren

---

## Konkrete Empfehlung für diesen Topic

> Basierend auf der oben dargestellten Konflikt-Analyse:

**Empfohlener Pfad**: {recommended_path}

**Begründung**: {recommendation_rationale}

---

## Monitoring-Setup (nach Implementation)

### GSC-Queries zur Beobachtung

| Query | Aktuelle Top-URL | Ziel-Position | Check-Frequenz |
|---|---|---|---|
| {query_1} | {url_1} | Top 5 | Wöchentlich |
| {query_2} | {url_2} | Top 3 | Wöchentlich |
| ... |

### Erwartete Effekte

**Bei Konsolidierung (High-Severity)**:
- Master-URL: Position-Sprung in 2–4 Wochen typisch von Position 15 → 3–5
- Konsolidierte URL: Index-Verschwinden in 1–2 Wochen
- Traffic auf Master-URL: +200–400 % über 8–12 Wochen

**Bei Differenzierung (Medium-Severity)**:
- Beide URLs stabilisieren auf eigener Intent
- Click-Share-Anstieg, weil keine internen Splits mehr
- Effekt langsamer (8–12 Wochen)

---

## Quellen für die Methodik dieses Reports

- AdvancedGSC: "How to Find Keyword Cannibalization in Google Search Console"
- Semrush: "Keyword Cannibalization: How to Find, Fix, and Prevent It"
- Backlinko-Case: +466 % nach Konsolidierung (8 Wochen)
- Eigene Praxiserfahrung

---

**Report erstellt mit**: seo-page-research Skill, Phase 4
**Cluster-Referenz**: {cluster_csv_path}
