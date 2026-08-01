# Content-Briefing: {primary_keyword}

> **Hinweis**: Dieses Briefing wurde mit dem `seo-page-research` Skill generiert. Es basiert auf SERP-First-Recherche via SerpApi (Phase 2), strukturierter Quellen-Sichtung (Phase 2b), Keyword-Expansion via Google Keyword Planner (Phase 3) und SERP-Overlap-Clustering inkl. Cannibalization-Check (Phase 4). Alle GEO-Anforderungen folgen Princeton-Paper (Aggarwal et al., KDD 2024) + GEO-SFE 2026.

---

## 1. Strategische Übersicht

**Primary Keyword**: `{primary_keyword}`
**Intent-Klasse** (Williams-Cook): `{intent_class}`
**Page-Type**: `{page_type}`
**Domain**: `{user_domain}`
**Geplante URL**: `{planned_url}`
**Locale**: `{locale}`

### Geschäftsziel
{business_goal}

### Zielgruppe
{target_audience}

### Cluster-Übersicht
- **Primary Keyword**: `{primary_keyword}` (≈ {primary_volume} Suchen/Monat)
- **Secondary Keywords** ({n_secondary}):
  - `{secondary_1}` (≈ {vol_1})
  - `{secondary_2}` (≈ {vol_2})
  - ...
- **Supporting Terms** ({n_supporting}):
  - `{supporting_1}` (≈ {vol_supp_1})
  - ...

**Geschätztes Total-Cluster-Volumen**: ≈ {total_volume} Suchen/Monat

### Saisonalitäts-Hinweise
{saisonalitaet_block}

### Cross-Validation-Status
- GKP cross-validated mit: {validation_source}
- Volume-Conflicts: {n_conflicts}
- {volume_caveat}

---

## 2. SERP-Analyse-Zusammenfassung (Phase 2)

### SERP-Composition (Desktop / Mobile)

| Feature | Desktop | Mobile |
|---|---|---|
| AI Overview | {aio_desktop} | {aio_mobile} |
| Featured Snippet | {fs_desktop} | {fs_mobile} |
| PAA-Questions | {paa_count} | {paa_count} |
| Knowledge Panel | {kp_desktop} | {kp_mobile} |
| Shopping Pack | {shopping} | {shopping} |
| Video Carousel | {video} | {video} |
| Ads top / bottom | {ads_top} / {ads_bot} | {ads_top} / {ads_bot} |

### Top-10 Page-Type-Verteilung

| Page-Type | Count |
|---|---|
| {page_type_1} | {count_1} |
| {page_type_2} | {count_2} |
| ... |

**Dominanter Page-Type**: `{dominant_page_type}` ({count} von 10) → bestätigt Intent-Hypothese
**Mixed-Intent-Flag**: {mixed_intent_yes_no}

### Top-3 Konkurrenz-URLs

1. **{url_1}** — Page-Type: {pt_1}, ≈ {wc_1} Wörter
2. **{url_2}** — Page-Type: {pt_2}, ≈ {wc_2} Wörter
3. **{url_3}** — Page-Type: {pt_3}, ≈ {wc_3} Wörter

### Wichtigste PAA-Questions (für FAQ-Section)

1. {paa_question_1}
2. {paa_question_2}
3. {paa_question_3}
4. {paa_question_4}
5. {paa_question_5}
{...weitere}

---

## 3. Content-Outline

### Meta-Daten

- **Meta-Title** (max 60 chars): `{meta_title}`
- **Meta-Description** (max 155 chars): `{meta_description}`
- **URL-Slug**: `{url_slug}`

### H1

**`{h1_text}`**

### Direct-Answer-Paragraph (40–60 Wörter, direkt unter H1)

> {direct_answer_template}

*Beispiel-Pattern für Intent-Klasse `{intent_class}`*:
{intent_specific_lead_pattern}

### H2/H3-Struktur

```markdown
H1: {h1_text}

[Direct-Answer-Paragraph: 40-60 Wörter]

H2: {h2_1_as_question}
  [Antwort als extractable chunk, 40-80 Wörter, self-contained]
  H3: {h3_1_1}
    [Content]
  H3: {h3_1_2}
    [Content]

H2: {h2_2_as_question}
  H3: {h3_2_1}
  H3: {h3_2_2}

H2: {h2_3_as_question}
  H3: ...

H2: Häufige Fragen ({n_faq} FAQ-Items)
  [FAQ-Section, jede Antwort 40-80 Wörter]

H2: Fazit / Nächste Schritte

[EEAT-Block: Author + Methodology + Sources]
```

### Content-Pattern-Anforderungen (basierend auf Intent-Klasse `{intent_class}`)

{intent_specific_content_pattern}

### Wordcount

- **Median Top-10**: {median_wc} Wörter
- **Mindest-Wordcount für diese Page**: ≥ {target_wc} Wörter ({median_wc} × 1,2)
- **Empfohlene Range**: {target_wc}–{target_wc_max} Wörter

---

## 4. Pflicht-Sections für GEO-Optimierung

### ✅ AI-Overview-Optimization-Checklist

> Diese Liste ist verpflichtend. Jeder Punkt mit messbarem Citation-Lift basierend auf Princeton-Paper (Aggarwal et al., KDD 2024) und Follow-ups.

- [ ] **Direct-Answer-Paragraph** (40–60 Wörter) ganz oben | Princeton Fluency +20 %
- [ ] **Mind. 1 verifizierbare Statistik pro 150–200 Wörter** | Princeton Statistics +33 %
- [ ] **Alle Stats mit Quelle + Datum inline verlinkt** | Princeton Cite Sources +28 %
- [ ] **Mind. 1 Expert-Quotation mit Credentials** (oder Outreach-Plan) | Princeton Quotation +43 %
- [ ] **Authoritative Tone** (keine Hedge-Wörter ohne wissenschaftlichen Grund) | Princeton +8 %
- [ ] **H1 → H2 → H3-Hierarchie strikt eingehalten** | ConvertMate 68,7 %
- [ ] **H2-Headings als Fragen** (gespiegelt aus PAA) | GEO-SFE +17,3 %
- [ ] **Jede H2/H3-Section liefert extractable Chunk** (40–80 Wörter, self-contained)
- [ ] **FAQ-Section** mit 5–10 PAA-Fragen
- [ ] **FAQPage-Schema** implementiert | ConvertMate 61 %
- [ ] **EEAT-Block**: Author + Credentials + Methodology + Sources
- [ ] **"Last Updated"-Stempel** sichtbar oben auf der Page
- [ ] **3–5 Internal-Links** zu thematisch verwandten Pages auf User-Domain
- [ ] **Schema-Markup** gemäß Intent-Klasse: `{recommended_schema}`
- [ ] **Wordcount** ≥ {target_wc} Wörter

### Schema-Markup-Empfehlung

**Primary Schema** (für Intent-Klasse `{intent_class}`): `{primary_schema}`
**Zusatz-Schemas**: `{secondary_schemas}`

**Projekt-Schema-Regeln:** Ratgeber/Beratung → **Article + FAQPage** (prüfe, ob der `content-html-formatter` des Projekts FAQPage/Quotation automatisch erzeugt — dann kein manuelles JSON-LD). Produktseiten → **Product** (viele Shop-CMS erzeugen Produkt-Schema nativ; CMS laut CLAUDE.md prüfen). **Kein HowTo** (von Google seit 09/2023 deprecated), keine erfundenen Review-/AggregateRating-Markups.

Pflicht-Properties:
- `@type`, `headline`, `author`, `datePublished`, `dateModified`
- Für FAQPage: `mainEntity` mit allen FAQs
- Für Product (nur PDP): `offers`, `brand` (nur echte Werte)

---

## 5. Internal-Linking-Plan

| Anchor-Text | Ziel-URL | Kontext-Empfehlung |
|---|---|---|
| {anchor_1} | {target_url_1} | {context_1} |
| {anchor_2} | {target_url_2} | {context_2} |
| {anchor_3} | {target_url_3} | {context_3} |

---

## 6. EEAT-Anforderungen

### Author-Block (Pflicht am Anfang ODER Ende der Page)

```markdown
**Autor**: [Name]
**Credentials**: [z.B. "M.Sc. Energietechnik, 10 Jahre Erfahrung in Heizungsplanung"]
**LinkedIn**: [Profil-Link]
**Veröffentlicht**: {publish_date}
**Zuletzt aktualisiert**: {last_updated}
```

### Methodology-Section (Pflicht bei Empfehlungs-Content)

Kurzer Absatz (60–100 Wörter) zur Page-Methode: Wie wurde recherchiert? Welche Datenquellen? Wann wurde was geprüft?

### Sources-Liste (Pflicht am Ende)

Alle zitierten Quellen mit:
- Quellen-Name
- Datum
- Direkt-Link
- Kurze Charakterisierung (Studie / Government / Branchen-Verband / etc.)

---

## 7. Cannibalization-Status (aus Phase 4)

{cannibalization_summary}

**Empfehlung vor Page-Launch**: {cannibalization_recommendation}

---

## 8. Konkurrenz-Analyse: Was die Top-3 BESSER machen müssen

Damit diese Page in Top-3 ranken kann, muss sie inhaltlich/strukturell BESSER sein als die existierende Top-3. Konkrete Verbesserungen:

### vs. {top_1_url}

- {improvement_1_1}
- {improvement_1_2}

### vs. {top_2_url}

- {improvement_2_1}

### vs. {top_3_url}

- {improvement_3_1}

---

## 9. Quellen & Research-Basis (aus Phase 2b — Source Review)

> Basis: `seo/source-review-{slug}.md`. Steuert, welche Quellen `article-create` als Faktenbasis verwenden darf. Fehlt das Source-Review: hier „kein Source-Review durchgeführt" vermerken.

### Geprüfte Quellen (mit Rolle)

| Quelle / Domain | Seitentyp | Rolle | Kernaussage / Nutzung |
|---|---|---|---|
| {quelle_1} | {typ_1} | {Faktenbasis / SERP-Kontext / Pain-Point-Input} | {nutzung_1} |
| {quelle_2} | {typ_2} | {rolle_2} | {nutzung_2} |
| ... | | | |

### Foren-/Community-Pain-Points (Themeninput, NIE Faktenbasis)

- {pain_point_1}
- {pain_point_2}
- {pain_point_3}

### Content-Gaps gegenüber Wettbewerbern (Chance für die eigene Marke)

- {gap_1}
- {gap_2}

### Für article-create verbindlich

- **Als Faktenbasis erlaubt**: {liste_faktenbasis_quellen}
- **Nur Themeninput**: {liste_themeninput_quellen}
- **Datenlücken / nicht geprüft**: {datenluecken}

---

## 10. Nächste Schritte (Action-Plan)

1. [ ] **Cannibalization-Konflikte lösen** (falls High-Severity, siehe Phase 4 Report)
2. [ ] **Page-Outline an Texter übergeben** (dieses Briefing)
3. [ ] **Content erstellen** mit Pflicht-GEO-Anforderungen
4. [ ] **Schema-Markup implementieren**: `{recommended_schema}`
5. [ ] **EEAT-Block** mit Autor-Daten ergänzen
6. [ ] **Internal-Linking** umsetzen (siehe Plan oben)
7. [ ] **Indexierung beobachten** (GSC 1 Woche nach Launch)
8. [ ] **Ranking-Monitoring** für Primary + Secondary einrichten
9. [ ] **Saisonale Republikation** planen (falls Saisonalitäts-Flag)

---

## Anhang: Vollständige Keyword-Liste

Siehe `seo/cluster-{slug}.csv` für die vollständige Cluster-Tabelle.

## Anhang: SERP-Snapshots

Siehe `tmp/serp-snapshots/{slug}-*.json` für die Rohdaten aller SERP-Analysen (löschbar).

## Anhang: Cannibalization-Report

Siehe `seo/cannibalization-{slug}.md` für Details.

---

**Briefing erstellt**: {timestamp}
**Skill-Version**: seo-page-research v1.0
**Methodik**: SERP-First, Williams-Cook Intent-Taxonomy, Princeton GEO-Tactics, SERP-Overlap-Clustering
