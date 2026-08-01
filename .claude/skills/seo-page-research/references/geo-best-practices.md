# GEO Best Practices: Wie Pages 2026 in AI Overviews und LLM-Antworten zitiert werden

Diese Reference dokumentiert die wissenschaftlich validierten Methoden, um eine Page für **Generative Engine Optimization (GEO)** zu optimieren — also für Citations in AI Overviews, ChatGPT-, Perplexity- und Claude-Antworten. Diese Optimierungen sind in Phase 5 des Skills **verpflichtend** im Briefing-Output.

## Kernstudien (Stand 2026)

### Princeton GEO Paper (Aggarwal et al., KDD 2024)
- **Titel**: "GEO: Generative Engine Optimization"
- **arXiv**: 2311.09735
- **Autoren**: Princeton + IIT Delhi + Georgia Tech + Allen Institute for AI
- **Methodik**: 10.000 Test-Queries, getestet gegen GPT-3.5-turbo
- **Metrik**: PAWC (Position-Adjusted Word Count) — Anteil der Antwort, der aus einer Source zitiert wird

### GEO-SFE 2026 (Univ. Tokyo / Tsukuba, Follow-up-Studie)
- **Finding**: +17,3 % Citation-Lift allein durch strukturelle Änderungen (Frage-Headings, extractable Chunks, Listen) — **ohne ein einziges Wort Content-Änderung**

### ConvertMate GEO Benchmark Study 2026
- **Methodik**: 12.500+ Queries, 8.000 Domains
- **Finding 1**: **83 % der AI-Overview-Citations kommen von Pages außerhalb der organischen Top-10**
- **Finding 2**: Saubere H1→H2→H3-Hierarchie korreliert mit 68,7 % der ChatGPT-Citations
- **Finding 3**: 61 % der zitierten Pages nutzen Schema-Markup

### Kevin Indig / Growth Memo (März 2026)
- **Methodik**: Analyse von 1,2 Mio. ChatGPT-Citations
- **Finding**: Pages > 20.000 Zeichen werden im Durchschnitt **10,18× zitiert** vs. **2,39× für Pages < 500 Zeichen** — Multiplier 4,3×
- **Sonderfall Finance-Vertical**: Peak liegt bei 5.000–10.000 Wörter-Pages (10,9 Citations/Page)

---

## Die 9 GEO-Tactics aus dem Princeton-Paper

Aggarwal et al. testeten 9 Interventionen auf 10.000 Queries. Hier die Top-Ranking-Lifts (PAWC vs. Baseline 19,5):

| Tactic | PAWC | Lift vs. Baseline | Im Skill verpflichtend? |
|---|---|---|---|
| **Quotation Addition** | 27,8 | **+43 %** | Wenn verfügbar |
| **Statistics Addition** | 25,9 | **+33 %** | **JA** |
| **Cite Sources** | 24,9 | **+28 %** | **JA** |
| Fluency Optimization | 23,3 | +20 % | **JA** |
| Easy-to-Understand | 22,4 | +15 % | **JA** |
| Technical Terms | 21,9 | +12 % | Je nach Audience |
| Authoritative | 21,1 | +8 % | **JA** |
| Unique Words | 20,7 | +6 % | Nein |
| Keyword Stuffing | 19,1 | −2 % | **NEIN — kontraproduktiv** |

**Kombi-Bonus**: Fluency + Statistics kombiniert: +5,5 pp on top.

---

## Konkrete Anwendung im Briefing

### Anforderung 1: Direct-Answer-First (Fluency Optimization)

**Was**: Der erste Absatz der Page beantwortet die Hauptquery präzise in 40–60 Wörtern.

**Warum**: Princeton "Fluency Optimization" +20 %. AI-Engines greifen primär den ersten substantiellen Absatz für die Antwort-Generierung.

**Beispiel** (für Bool-Query "ist eine wärmepumpe im altbau sinnvoll"):
> **Ja, eine Wärmepumpe ist auch im Altbau sinnvoll** — vorausgesetzt das Gebäude erreicht eine Jahresarbeitszahl (JAZ) von mindestens 3,0, was bei den meisten Bestandsbauten ab Baujahr 1980 mit moderaten Sanierungsmaßnahmen erreichbar ist. Eine aktuelle Studie des Fraunhofer ISE (März 2026, n=350 Bestandsbauten) bestätigt: in 78 % der untersuchten Altbauten erreichten Luft-Wasser-Wärmepumpen wirtschaftliche Effizienz.

→ Beachte: Direct Answer **+** Statistic **+** Source. Drei Tactics in einem Absatz.

### Anforderung 2: Fact-Density (Statistics Addition)

**Was**: Mind. 1 verifizierbare Statistik / benannte Quelle pro 150–200 Wörter.

**Warum**: Princeton "Statistics Addition" +33 %. Stärkster Einzel-Lift, wenn keine Quotation verfügbar.

**Format**:
- Konkrete Zahl + Quelle + Datum
- Bevorzugt aus offiziellen Quellen (Government, Studien, Industrie-Verbände)
- Niemals "viele Experten sagen" oder "Studien zeigen" ohne Beleg

**Beispiel**:
> Die durchschnittliche Wärmepumpen-Installation in Deutschland kostet 2026 **25.000–35.000 €** für Luft-Wasser-Systeme (Quelle: BWP Branchenstudie 2026, Stand März 2026). Mit BAFA-Förderung bis 70 % reduziert sich die Eigeninvestition auf 7.500–10.500 € (Stand Mai 2026, BAFA-Bekanntmachung).

### Anforderung 3: Cite Sources (Citation Pattern)

**Was**: Alle Stats und Behauptungen inline mit klickbaren Quellen-Links. "Last Updated"-Stempel prominent.

**Warum**: Princeton "Cite Sources" +28 %.

**Format**:
```markdown
> Laut [BAFA-Bekanntmachung Mai 2026](https://bafa.de/...) beträgt die maximale Förderhöhe...
```

**Pflicht im Briefing**: Sources-Section am Ende mit allen verwendeten Quellen, Datum, Direkt-Link.

### Anforderung 4: Expert Quotations (Quotation Addition)

**Was**: Direkte Zitate von benannten Experten mit Credentials.

**Warum**: Princeton "Quotation Addition" **+43 %** — stärkster Einzel-Lift, wenn verfügbar.

**Format**:
> "Wärmepumpen sind 2026 die wirtschaftlich rationale Standardlösung für 80 % der Bestandsbau-Situationen, vorausgesetzt der hydraulische Abgleich ist sauber durchgeführt", erklärt Prof. Dr. Andreas Wagner, KIT Karlsruhe, im Interview mit der Süddeutschen Zeitung (April 2026).

**Im Briefing**: Wenn verfügbar, mind. 1 Expert-Quote pro Page. Wenn nicht direkt verfügbar, im Briefing als "Outreach-Empfehlung" vermerken: "Quote von [Experte X] anfragen, würde +43 % Citation-Wahrscheinlichkeit bringen."

### Anforderung 5: Authoritative Tone (Authority Signaling)

**Was**: Präzise, faktische Sprache. Keine Hedge-Wörter wie "vielleicht", "möglicherweise", "anscheinend" außer wo wissenschaftlich angebracht.

**Anti-Pattern**:
- ❌ "Wärmepumpen sind vielleicht eine gute Option."
- ✅ "Wärmepumpen sind in 78 % der Bestandsbau-Situationen die wirtschaftlich optimale Wahl (BWP 2026)."

---

## Strukturelle Anforderungen (GEO-SFE 2026: +17,3 % ohne Inhaltsänderung)

### Heading-Struktur

**Pflicht**:
- **H1**: Primary Keyword + Nutzen, max 60 Zeichen
- **H2-Headings als Fragen**: gespiegelt aus PAA-Questions aus Phase 2
- **H3-Sub-Headings**: spezifische Sub-Aspekte
- **Hierarchie strikt einhalten**: niemals H2 → H4 ohne H3 dazwischen

**Beispiel**:
```
H1: Wärmepumpe im Altbau: Was sich 2026 wirklich lohnt
  H2: Ist eine Wärmepumpe im Altbau überhaupt möglich?
    H3: Bei welchem Sanierungsstand?
    H3: Bei welcher Heizflächenausstattung?
  H2: Wie hoch sind die Kosten 2026?
    H3: Hardware + Installation
    H3: Mit und ohne BAFA-Förderung
  H2: Welche Wärmepumpe für welchen Altbau?
    H3: Luft-Wasser für sanierte Bestandsbauten
    H3: Erdwärme für unsanierte und großflächige Bauten
```

### Extractable Chunks

**Was**: Jeder H2/H3-Abschnitt liefert eine self-contained Antwort von 40–80 Wörtern, die aus dem Kontext gezogen werden kann.

**Warum**: AI-Engines extrahieren Antworten chunk-by-chunk. Pages, deren Chunks self-contained sind, werden häufiger zitiert.

**Anti-Pattern**:
- ❌ "Wie bereits oben erwähnt, ist das bei Altbauten kompliziert..." (Referenz auf anderen Chunk)
- ✅ "Bei Bestandsbauten ab Baujahr 1980 erreichen Luft-Wasser-Wärmepumpen typischerweise JAZ-Werte von 3,2–3,8, ausreichend für Wirtschaftlichkeit und BAFA-Förderfähigkeit."

### Listen und Tabellen

**Warum**: GEO-SFE 2026 zeigt explizit, dass Listen und Tabellen 30–40 % häufiger als Chunks für AI-Antworten gewählt werden als Fließtext.

**Wo einsetzen**:
- **Comparison-Content**: Vergleichstabelle früh auf der Page
- **Instruction-Content**: numerierte Schritte
- **Reason-Content**: Bullet-Liste der Gründe
- **Definition-Content**: optional Bullet-Liste mit Schlüssel-Eigenschaften

### FAQ-Section

**Pflicht für die meisten Intent-Klassen** (siehe `intent-classes.md`).

**Anforderungen**:
- Mind. 5–10 Fragen aus echten PAA-Daten aus Phase 2
- Jede Antwort 40–80 Wörter (extractable Chunk)
- **FAQPage-Schema** verpflichtend
- Antworten beginnen direkt mit der Antwort, nicht "Diese Frage hängt davon ab..."

---

## Schema-Markup-Empfehlungen (Intent-Klasse → Schema)

| Intent-Klasse | Primäres Schema | Sekundär |
|---|---|---|
| Short fact | QAPage | Article |
| Bool | FAQPage | QAPage |
| Definition | DefinedTerm | Article |
| Instruction | Article | VideoObject, FAQPage |
| Reason | Article | FAQPage |
| Comparison | ItemList + Review | AggregateRating |
| Consequence | FAQPage | Article |
| Question | FAQPage | Article |
| Product-PDP | Product + AggregateRating | Offer |

**Allgemein immer**:
- `Article` mit `dateModified` (für "Last Updated"-Signal)
- `Author` mit `Person`-Schema und Credentials
- `BreadcrumbList`

**61 % der zitierten Pages nutzen Schema-Markup** (ConvertMate 2026) — das ist signifikant höher als der allgemeine Web-Durchschnitt.

---

## EEAT-Block (Pflicht)

Princeton + ConvertMate Studien zeigen E-E-A-T-Signale als starke Citation-Korrelaten.

**Im Briefing-Output verpflichtend**:

### Author-Block

```markdown
**Autor**: [Name]
**Credentials**: [z.B. "M.Sc. Energietechnik, 10 Jahre Erfahrung in Heizungsplanung"]
**LinkedIn**: [Profil-Link]
**Methodology**: Wie diese Page recherchiert wurde
```

### Methodology-Section

Für jede Page mit konkreten Empfehlungen: kurzer Absatz "Wie wir zu diesen Empfehlungen kommen" mit Methode, Datenquellen, Aktualität.

### Sources-Liste

Am Ende der Page: alle zitierten Quellen mit Datum und Direkt-Link.

### "Last Updated"-Stempel

Sichtbar oben auf der Page (nicht nur im Schema), Format "Zuletzt aktualisiert: [Datum]".

---

## Internal-Linking-Plan

**Warum**: Topical-Authority-Signal. Kevin Indig: "Pages with high topical authority gain traffic 57% faster".

**Anforderung im Briefing**:
- 3–5 outbound Links zu thematisch verwandten Pages auf der User-Domain
- Pro Link: Anker-Text + Ziel-URL + Kontext-Empfehlung
- Idealerweise: Verlinkung zu Pillar-Page (wenn vorhanden) als Topical-Anchor

---

## Wordcount-Empfehlung

**Formel**: Mindest-Wordcount = Median Top-10-Page-Length × 1,2

**Aber mit Vorbehalt**:
- Qualität schlägt Quantität (Princeton: Quotation/Statistics beat raw word count)
- Indig-Daten: 20k+ chars = 4,3× mehr Citations, ABER nur wenn Content wirklich trägt
- Finance-Vertical-Anomalie: 5k–10k Wörter ist Peak, nicht 20k+

**Im Briefing-Output**: Wordcount als Range (z.B. "2.500–3.500 Wörter, mind. so umfassend wie Top-3-Pages") + qualitative Anforderungen.

---

## AI-Overview-Optimization-Checkliste (für Briefing-Output)

```markdown
## ✅ AI-Overview-Optimization-Checklist

- [ ] Direct-Answer-Paragraph (40–60 Wörter) ganz oben ✅ Princeton +20 %
- [ ] Mind. 1 verifizierbare Statistik pro 150–200 Wörter ✅ Princeton +33 %
- [ ] Alle Stats mit Quelle + Datum inline verlinkt ✅ Princeton +28 %
- [ ] Mind. 1 Expert-Quotation mit Credentials (oder Outreach-Plan) ✅ Princeton +43 %
- [ ] Authoritative Tone (keine Hedge-Wörter) ✅ Princeton +8 %
- [ ] H1 → H2 → H3-Hierarchie strikt eingehalten ✅ ConvertMate 68,7 %
- [ ] H2-Headings als Fragen formuliert (gespiegelt aus PAA) ✅ GEO-SFE +17,3 %
- [ ] Jede H2/H3-Section liefert extractable Chunk (40–80 Wörter, self-contained)
- [ ] FAQ-Section mit 5–10 PAA-Fragen ✅
- [ ] FAQPage-Schema implementiert ✅ ConvertMate 61 %
- [ ] EEAT-Block: Author + Credentials + Methodology + Sources ✅
- [ ] "Last Updated"-Stempel sichtbar oben ✅
- [ ] 3–5 Internal-Links zu thematisch verwandten Pages ✅
- [ ] Schema-Markup gemäß Intent-Klasse (siehe Tabelle) ✅
- [ ] Wordcount ≥ Median Top-10 × 1,2
```

---

## Quellen

- Aggarwal et al., "GEO: Generative Engine Optimization", KDD 2024, arXiv:2311.09735
- GEO-SFE Follow-up 2026, Univ. of Tokyo / Tsukuba
- ConvertMate GEO Benchmark Study 2026 (12.500+ Queries)
- Foundation Marketing, März 2026
- Kevin Indig, Growth Memo "The science of how AI picks its sources", März 2026
- Frase.io, "Mastering AI Citations: The Ultimate GEO Playbook"
