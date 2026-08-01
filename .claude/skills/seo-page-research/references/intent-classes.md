# Intent-Klassifikation: Die 8 Williams-Cook-Klassen

Diese Reference löst die klassische 4-Typen-Klassifikation (Informational/Navigational/Commercial/Transactional) ab. Hintergrund: Mark Williams-Cook (Candour) hat Ende 2024 über eine Google-API-Vulnerability ($13.337 Bug-Bounty) die internen "refined query semantic classes" rekonstruiert, mit denen Google Queries für Ranking-Zwecke klassifiziert. Die 8 Klassen wurden in Search Engine Land dokumentiert.

**Wichtig**: Das ist eine evidence-based Heuristik, kein offizielles Google-Schema. Aber die beste verfügbare Annäherung.

---

## Die 8 Klassen im Überblick

| Klasse | Kern-Frage | Beispiel-Query |
|---|---|---|
| Short fact | Ein Datenpunkt | "einwohner berlin" |
| Bool | Ja oder Nein | "ist wärmepumpe förderfähig" |
| Definition | Was ist X | "was ist eine luftwärmepumpe" |
| Instruction | Wie macht man X | "wärmepumpe installieren anleitung" |
| Reason | Warum X | "warum wärmepumpe sinnvoll" |
| Comparison | X vs Y | "luftwärmepumpe vs erdwärmepumpe" |
| Consequence | Was wenn X | "was passiert wenn wärmepumpe ausfällt" |
| Question | Mehrteilige Frage | "welche wärmepumpe für altbau" |

---

## Detail pro Klasse

### 1. Short fact

**Was sucht der User**: Einen einzelnen, verifizierbaren Datenpunkt.

**Trigger-Modifier**:
- "population of", "einwohner"
- "year", "jahr", "wann wurde"
- "how many", "wie viele"
- "price of", "preis", "kosten von" (wenn nicht in Vergleich/Kauf-Intent)
- "höhe der", "betrag", "wert von"

**SERP-Indikatoren**:
- Featured Snippet mit Zahl
- Knowledge Panel mit kurzem Fakt
- Wikipedia in Top 3

**Content-Pattern**:
- Zahl/Fakt im ersten Satz, fett markiert
- Quelle direkt darunter
- Kontext und Methodik in den folgenden Absätzen
- Tabelle mit verwandten Fakten (z.B. Werte über Zeit)

**Beispiel-Lead**:
> Die durchschnittliche Wärmepumpen-Förderung in Deutschland 2026 beträgt **bis zu 70 % der förderfähigen Kosten**, maximal 21.000 € pro Wohneinheit (Quelle: BAFA, Stand Mai 2026).

**FAQ-Section**: Eher kurz, mit verwandten Short-Fact-Fragen.

---

### 2. Bool (Yes/No-Query)

**Was sucht der User**: Eine binäre Entscheidung.

**Trigger-Modifier**:
- "ist [X]", "is [X]", "are [X]"
- "kann/darf ich", "can/should I"
- "geht das mit", "works with"
- "ist legal/sicher/möglich/sinnvoll"
- "lohnt sich [X]"

**SERP-Indikatoren**:
- Featured Snippet beginnt häufig mit "Ja" oder "Nein"
- PAA dominiert mit verwandten Bool-Fragen
- Forum-Threads (Reddit, Gutefrage) in Top 10

**Content-Pattern**:
- **Erster Satz: klares Yes/No fett markiert** (Aleyda Solis-Pattern für Featured-Snippet-Optimierung)
- Direkt danach: 1-Satz-Begründung
- "Wann ja, wann nein"-Tabelle oder Liste mit Bedingungen
- Ausnahmen und Edge Cases

**Beispiel-Lead**:
> **Ja, eine Wärmepumpe ist auch im Altbau förderfähig** — sofern sie eine Jahresarbeitszahl (JAZ) von mindestens 3,0 erreicht und das Gebäude die energetischen Mindestanforderungen erfüllt.

**FAQ-Section**: Pflicht. Mind. 5 weitere Bool-Fragen aus PAA.

---

### 3. Definition

**Was sucht der User**: Verstehen, was etwas ist.

**Trigger-Modifier**:
- "was ist", "what is"
- "definition", "bedeutung"
- "[X] erklärt", "[X] explained"
- "[X] einfach erklärt", "[X] for dummies"

**SERP-Indikatoren**:
- Wikipedia in Top 3
- Knowledge Panel
- Featured Snippet mit Definition-Box
- "Bedeutung" / "Definition" als Headline in Top-3-Results

**Content-Pattern**:
- **Definition-Box am Anfang**: 40–60 Wörter, eine präzise Definition (Princeton "Fluency Optimization")
- Etymologie / Herkunft (falls relevant)
- Konkretes Beispiel
- Abgrenzung zu verwandten Begriffen
- Anwendungskontexte

**Beispiel-Lead**:
> **Eine Luft-Wasser-Wärmepumpe** ist ein Heizsystem, das thermische Energie aus der Außenluft entzieht und auf einen höheren Temperaturpegel hebt, um damit Heizwasser und Brauchwasser zu erwärmen. Sie nutzt einen geschlossenen Kältekreislauf mit einem Kältemittel als Wärmeträger und arbeitet auch bei Außentemperaturen bis −20 °C.

**FAQ-Section**: "Wie funktioniert X?", "Wofür wird X eingesetzt?", "Unterschied zwischen X und Y?"

---

### 4. Instruction (How-To)

**Was sucht der User**: Eine Aufgabe ausführen.

**Trigger-Modifier**:
- "wie", "how to"
- "anleitung", "tutorial", "guide"
- "schritt für schritt", "step by step"
- "selber machen", "DIY"

**SERP-Indikatoren**:
- YouTube-Carousel in Top 10
- Featured Snippet mit numerierter Liste
- "Schritt 1 / Step 1" in Top-3-Titles
- Visual Carousel mit Bildern

**Content-Pattern**:
- **Total-Zeit** und **benötigte Tools/Materialien** in einem Box oben
- Numerierte Schritte mit:
  - Bild pro Schritt (mind. für Schritte 1, mittel, letzter)
  - Konkrete Aktion
  - Visuelles Ergebnis-Checkpoint
- "Häufige Fehler" als Warning-Box
- "Wann professionelle Hilfe holen" als Schlussabschnitt
- Kein HowTo-Schema (Google zeigt HowTo-Rich-Results seit 2023 nicht mehr an; stattdessen Article + ggf. FAQPage, siehe SKILL.md)

**Beispiel-Lead**:
> **In dieser Anleitung erfährst du in 7 Schritten, wie du den Förderantrag für deine Wärmepumpe bei der BAFA stellst.** Gesamtzeit: ca. 45 Minuten. Du benötigst: Personalausweis, Energieausweis des Gebäudes, Angebot vom Heizungsbauer, Steuer-ID.

**FAQ-Section**: Häufige Stolperfallen, Vorraussetzungen, Alternativen.

---

### 5. Reason

**Was sucht der User**: Eine Begründung / Ursache verstehen.

**Trigger-Modifier**:
- "warum", "why"
- "weshalb", "wieso"
- "grund für", "reason for"
- "ursache", "cause"

**SERP-Indikatoren**:
- Featured Snippet mit "Weil ..."
- Blog-Artikel mit "Gründe warum" / "X Reasons" in Top 10
- Listicles ("5 Gründe", "7 Reasons") dominieren

**Content-Pattern**:
- **Hauptgrund im ersten Absatz** (Direct Answer)
- Kausalkette als nummerierte/aufgezählte Liste:
  - Jeder Grund mit Erklärung
  - Studie/Statistik/Quelle pro Grund (Princeton "Cite Sources" +28 %)
- Gegenargumente / Counter-Reasons
- Implikationen ("Was bedeutet das für mich?")

**Beispiel-Lead**:
> Wärmepumpen sind 2026 die wirtschaftlich rationale Heizungswahl im Bestandsbau — und zwar aus drei Gründen, die zusammen den Break-Even gegenüber Gas innerhalb von 7–9 Jahren bringen: BAFA-Förderung bis 70 %, CO2-Preis-Anstieg auf 65 €/t, und stark gefallene Wärmepumpen-Hardware-Preise.

**FAQ-Section**: "Gilt das auch für [Edge Case]?", Gegenfragen.

---

### 6. Comparison

**Was sucht der User**: Zwischen Optionen wählen / Pros und Cons abwägen.

**Trigger-Modifier**:
- "vs", "versus", "gegen"
- "oder", "or"
- "best", "beste", "top"
- "vergleich", "comparison"
- "alternative zu", "alternatives to"
- "[X] besser als [Y]"

**SERP-Indikatoren**:
- Listicles dominieren ("Best X for Y", "Top 10")
- Vergleichstabellen in Featured Snippets
- Review-Sites in Top 10 (G2, Capterra, idealo, etc.)
- "Bestenliste 2026" Brand-Sites

**Content-Pattern**:
- **Vergleichstabelle früh** (vor dem Fold idealerweise)
- Bewertungskriterien explizit machen
- Pro/Kontra pro Option
- "Beste Wahl für ..." nach Use-Case
- Affiliate/Provider-Links nur wenn ehrliche Empfehlung
- **ItemList / Review / AggregateRating Schema**

**Beispiel-Lead**:
> Die kurze Antwort: **Luft-Wasser-Wärmepumpen** sind für 80 % der deutschen Bestandsbau-Situationen die beste Wahl — günstiger in der Anschaffung als Erdwärmepumpen, vielseitiger als Brauchwasser-Wärmepumpen, und mit BAFA-Förderung bis 70 % auch finanziell attraktiv. Hier ist der direkte Vergleich:

(direkt darunter: Tabelle mit Luft-Wasser / Erdwärme / Brauchwasser / Sole-Wasser, mit Kosten/JAZ/Einsatzgebiet)

**FAQ-Section**: "Welche für mein Haus?", "Was wenn [Edge Case]?"

---

### 7. Consequence

**Was sucht der User**: Folgen einer Handlung / eines Ereignisses verstehen.

**Trigger-Modifier**:
- "was passiert wenn", "what happens if"
- "folgen von", "consequences of"
- "auswirkungen", "effects of"
- "risiko", "risk"

**SERP-Indikatoren**:
- Forum-Threads häufig in Top 10 (echte Erfahrungen)
- "Folgen", "Risiken", "Auswirkungen" in Top-3-Titles
- Manchmal Government-Sites (Verbraucherzentrale, BMU)

**Content-Pattern**:
- **If-Then-Struktur**: Was-passiert-wenn-Liste mit Wahrscheinlichkeit und Schweregrad
- Visualisierung als Decision Tree oder Tabelle
- "Sofortmaßnahmen" / "Was tun"-Section
- Präventionsmöglichkeiten

**Beispiel-Lead**:
> Wenn eine Wärmepumpe im laufenden Betrieb ausfällt, sind die Konsequenzen abhängig vom Ausfalltyp: Bei einem **Sensorfehler** läuft die Anlage meist im Notbetrieb weiter (Komfortverlust, kein Sicherheitsrisiko). Bei einem **Verdichter-Defekt** fällt die Heizung komplett aus — und im Winter wird das innerhalb von 24–48 Stunden kritisch.

**FAQ-Section**: "Was tun bei [Symptom]?", "Wie vermeidet man [Folge]?"

---

### 8. Question (Multi-Aspekt)

**Was sucht der User**: Eine komplexe Frage mit mehreren Aspekten, oft entscheidungsrelevant.

**Trigger-Modifier**:
- "welche", "which"
- "was sollte ich", "should I"
- "was sind die besten Wege"
- "wie finde ich den richtigen"

**SERP-Indikatoren**:
- Mixed Content-Types in Top 10 (Blog + PDP + Forum + Video)
- Häufig **Mixed-Intent-SERP** — mehrere legitime Antwort-Formate
- AI Overviews besonders häufig

**Content-Pattern**:
- **Multi-Aspekt-Antwort**: nicht einer pauschalen Empfehlung, sondern nach Use-Case differenziert
- Decision-Tree oder Wenn-Dann-Logik
- Personas / Use-Cases als Sub-Sections
- Häufig die längste Content-Form (3000+ Wörter sinnvoll)
- **FAQ-Section umfangreich** (8–12 Fragen)

**Beispiel-Lead**:
> Die richtige Wärmepumpe für deinen Altbau hängt von vier Faktoren ab: dem Sanierungsstand, der verfügbaren Grundstücksfläche, deinem Budget und den Heizgewohnheiten. Hier ist die Entscheidungshilfe nach Szenario:

(direkt darunter: 4 Szenarien als H2-Sections, jeweils mit konkreter Empfehlung)

**FAQ-Section**: Pflicht, mind. 8–12 Fragen, alle aus PAA gezogen.

---

## Mixed-Intent-SERPs

Wenn die SERP-Analyse in Phase 2 zeigt, dass Top-10 **≥ 3 unterschiedliche Page-Types** enthält, ist die SERP Mixed-Intent. Das ist häufig bei Question-Class-Queries der Fall.

**Strategien**:

**Option A — Eine Page mit dominanter Intent**: Wenn ein Page-Type 5+ von 10 abdeckt, plane für diesen und akzeptiere, dass die anderen Slots von anderen Page-Types belegt bleiben. Beispiel: "wärmepumpe altbau" — wenn 6 von 10 Pillar-Guides sind, plane einen Pillar-Guide.

**Option B — Zwei separate Pages**: Bei wirklich gemischten Intents (z.B. 4 PDP + 4 Blog + 2 Video) kann es Sinn machen, **zwei Pages** zu bauen, jeweils für eine Intent optimiert. Beispiel: Eine Service-Page "Wärmepumpe Altbau Installation" für Transactional-Intent + eine Pillar-Guide "Wärmepumpe Altbau: Der vollständige Ratgeber" für Informational-Intent.

**Anti-Pattern**: Eine Seite, die "alles versucht". Mixed-Intent-Pages scoren in Mixed-Intent-SERPs trotzdem schlecht, weil sie keinem Intent klar genug folgen.

---

## Multi-Intent-Cluster (über mehrere Klassen)

Es gibt Themen, in denen ein User durchaus mehrere Intent-Klassen in einer Search-Session abdeckt. Beispiel "wärmepumpe":
- "was ist eine wärmepumpe" (Definition)
- "wie funktioniert eine wärmepumpe" (Instruction-light / Reason)
- "lohnt sich eine wärmepumpe" (Bool)
- "luftwärmepumpe vs erdwärmepumpe" (Comparison)
- "wärmepumpe kosten" (Short fact)

→ Das ist ein **Topical Cluster**, nicht eine Single-Page. Pillar-Page + 5 Spokes, eine pro Intent-Klasse. Wenn der Skill diese Konstellation erkennt: Hinweis an User, dass das eine Topical-Authority-Strategie ist, nicht eine Single-Page-Optimierung.

---

## Quick-Reference: Klasse → Schema-Markup

| Klasse | Primäres Schema | Sekundär |
|---|---|---|
| Short fact | QAPage | Article |
| Bool | FAQPage | QAPage |
| Definition | DefinedTerm | Article |
| Instruction | Article | VideoObject, FAQPage |
| Reason | Article | FAQPage |
| Comparison | ItemList + Review | AggregateRating |
| Consequence | FAQPage | Article |
| Question | FAQPage | Article |

---

## Quellen

- Williams-Cook-Leak: Search Engine Land, "Exploit reveals how and why Google ranks content"
- Aleyda Solis SERP-Analyzer-Methodik (SMX, SEO Week 2025)
- Princeton GEO Paper (Aggarwal et al., KDD 2024, arXiv:2311.09735)
- Eigene Beobachtungen aus DACH-SERPs (Mai 2026)
