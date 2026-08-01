# Content-Outline: {primary_keyword}

> Kompakt-Outline zur direkten Übergabe an den Texter. Vollständiges Briefing in `seo/briefing-{slug}.md`.

---

## Meta

- **Meta-Title** (max 60 chars): {meta_title}
- **Meta-Description** (max 155 chars): {meta_description}
- **URL-Slug**: /{url_slug}/
- **Wordcount-Range**: {target_wc}–{target_wc_max} Wörter
- **Primary Keyword**: `{primary_keyword}` — muss in H1, Intro, ≥ 2 H2s, Meta-Title
- **Intent-Klasse**: {intent_class}
- **Schema**: {primary_schema}

---

## Struktur

### H1
**{h1_text}**

### Intro (Direct-Answer-Paragraph, 40–60 Wörter)

```
{direct_answer_template_filled}
```

**Anforderungen**:
- Beantwortet die Hauptquery im ersten Satz
- Enthält Primary Keyword
- Enthält mind. 1 verifizierbare Statistik + Quelle
- Kein "In diesem Artikel..." / "Heute werden wir..." (Floskel-Verbot)

---

### H2: {h2_1_question}

**Chunk-Anforderung**: 40–80 Wörter, self-contained Antwort.

**Inhalt**:
- {content_brief_1}
- {content_brief_2}

**Pflicht-Elemente**:
- Mind. 1 Statistik mit Quelle
- {optional: Tabelle / Liste / Visualisierung}

#### H3: {h3_1_1}
{content_brief}

#### H3: {h3_1_2}
{content_brief}

---

### H2: {h2_2_question}

**Chunk-Anforderung**: 40–80 Wörter.

**Inhalt**:
- {content_brief}

**Pflicht-Elemente**:
- {pflicht_elemente_2}

#### H3: {h3_2_1}
{content_brief}

#### H3: {h3_2_2}
{content_brief}

---

### H2: {h2_3_question}

[Weitere H2-Sections analog]

---

### H2: Häufige Fragen

> FAQPage-Schema implementieren. Jede Antwort 40–80 Wörter, beginnt direkt mit der Antwort (nicht "Das kommt darauf an...").

**FAQ-Item 1**: {paa_question_1}
> Antwort-Pattern: {answer_pattern_1}

**FAQ-Item 2**: {paa_question_2}
> Antwort-Pattern: {answer_pattern_2}

**FAQ-Item 3**: {paa_question_3}
> Antwort-Pattern: {answer_pattern_3}

**FAQ-Item 4**: {paa_question_4}
> Antwort-Pattern: {answer_pattern_4}

**FAQ-Item 5**: {paa_question_5}
> Antwort-Pattern: {answer_pattern_5}

{...weitere FAQs}

---

### H2: Fazit / Nächste Schritte

**Inhalt**:
- Kernaussage in 1–2 Sätzen wiederholen (zur Verstärkung des Direct-Answer-Patterns)
- Konkrete Action-Items für den Leser
- CTA passend zum Geschäftsziel: {cta_recommendation}

---

## EEAT-Block (am Seitenende)

```markdown
**Autor**: [Name einsetzen]
**Credentials**: [Credentials einsetzen]
**LinkedIn**: [Link einsetzen]
**Veröffentlicht**: {publish_date}
**Zuletzt aktualisiert**: {last_updated}

### Methodologie

[60–100 Wörter: Wie diese Page recherchiert wurde]

### Quellen

1. [Quelle 1: Name, Datum, Link]
2. [Quelle 2: Name, Datum, Link]
...
```

---

## Internal-Links (Pflicht: 3–5)

| Anker-Text | Ziel-URL | An welcher Stelle einbauen |
|---|---|---|
| {anchor_1} | {target_1} | {place_1} |
| {anchor_2} | {target_2} | {place_2} |
| {anchor_3} | {target_3} | {place_3} |

---

## Visuelle Anforderungen

Bild-/Video-Kandidaten aus dem Medien-Katalog `wissensbasis/medien/` vorschlagen (falls das Projekt einen führt; Tag-Suche zum Thema). Pro Vorschlag den lokalen Dateinamen nennen, damit `article-create` ihn in `seo.md` übernehmen kann. Vorsicht-Flags des Katalogs beachten.

- [ ] Hero-Image / Lead-Visual → Kandidat aus Katalog: {medien_kandidat_hero}
- [ ] Inline-Bilder kontextuell (Relevanz vor Rhythmus, kein „Bild pro H2", ~3–5 total bei 2.000 Wörtern) → {medien_kandidaten}
- [ ] Optional: Video-Embed wenn Intent = Instruction → {video_kandidat}

**Alt-Text-Pattern**: alle Bilder mit beschreibendem Alt-Text + Primary/Secondary-Keyword wo natürlich passend.

---

## Pflicht-Checks vor Publish

- [ ] Wordcount ≥ {target_wc}
- [ ] Primary Keyword in H1, Intro, ≥ 2 H2s, Meta-Title
- [ ] Mind. 1 Statistik pro 150–200 Wörter, alle mit Quelle
- [ ] Mind. 1 Expert-Quote (oder Outreach-Plan dokumentiert)
- [ ] FAQPage-Schema valid
- [ ] {primary_schema}-Schema valid
- [ ] EEAT-Block vollständig
- [ ] 3–5 Internal-Links eingebaut
- [ ] "Last Updated"-Stempel sichtbar
- [ ] Mobile-Layout geprüft
- [ ] AI-Overview-Checkliste aus Briefing durchgegangen
