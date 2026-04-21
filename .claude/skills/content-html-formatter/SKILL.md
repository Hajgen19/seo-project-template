---
name: content-html-formatter
description: >
  Nimmt einen Text entgegen und formatiert ihn als CMS-fertiges HTML nach den
  projektspezifischen HTML-Elementen, die in `wissensbasis/html-elemente.md`
  hinterlegt sind. Nutze diesen Skill immer, wenn der User einen Text, Artikel,
  Ratgeber oder Seiteninhalt als HTML formatieren möchte. Trigger auch bei:
  "formatiere für WordPress", "HTML formatieren", "Content erstellen", "Artikel
  formatieren", "Text in HTML umwandeln", "für die Website aufbereiten".
---

# Content HTML Formatter

Dieser Skill formatiert Fließtext zu CMS-fertigem HTML. Er enthält **keine** HTML-Elemente direkt – die projektspezifischen Bausteine (CSS-Klassen, Shortcodes, Farben, Buttons, Cards, Tabellen-Styles, wiederverwendbare Blöcke usw.) stehen in der projektspezifischen Wissensbasis.

## Pre-Flight-Check (IMMER zuerst)

Bevor du auch nur einen HTML-Tag ausgibst:

1. **Lies `wissensbasis/html-elemente.md`** (relativ zum Projekt-Root).
2. Prüfe, ob die Datei existiert und ob die benötigten Element-Kategorien gefüllt sind.
3. **Wenn die Datei fehlt oder leer ist:** Brich ab und antworte dem User:

   ```
   Dieser Skill benötigt die projektspezifischen HTML-Elemente aus dem CMS.
   Bitte lege `wissensbasis/html-elemente.md` an und trage dort folgendes ein:

   - Überschriften (H1/H2/H3 – Klassen, Inline-Styles)
   - Buttons/CTAs (Primär, Sekundär, Warning – exakter HTML-Code)
   - Tabellen (Wrapper, Klassen, Header-Style)
   - Info-/Tipp-Boxen (Shortcode oder gestylter Container)
   - FAQ/Accordion (Shortcode + HTML-Render + Schema.org)
   - Sektionen/Layout (Grid, Container, Hintergrund-Varianten)
   - Wiederverwendbare Bausteine (Preis-Cards, Hero, Testimonial, Hotline, …)
   - CMS-Basis (WordPress, Shopify, …), CSS-Framework, Shortcode-Plugin
   - Markenfarben, Schriftart
   - Interne Link-Map (URL-Tabelle der wichtigsten Zielseiten)
   - Aktuelle Preise/Kennzahlen (falls CTAs Preise enthalten)
   - Tonalität + Schreibkonventionen (Siezen, Markenbegriffe, Umlaute, …)

   Eine Vorlage findest du in `references/wissensbasis-template.md` dieses Skills.
   ```

   **Biete keinen Fallback-HTML-Code an.** Ohne Wissensbasis kein Output – sonst produzierst du HTML, das im Ziel-CMS nicht funktioniert.

4. **Wenn einzelne Kategorien fehlen:** Benenne klar, welche Kategorie in der Wissensbasis ergänzt werden muss, und mache nur mit dem weiter, was vorhanden ist.

## Ablauf

### Schritt 1: Text und Intent verstehen

- Lies den gelieferten Text.
- Identifiziere Struktur-Elemente im Text (Überschriften, Listen, Vergleiche, FAQ, CTA-Kandidaten, Hinweise/Tipps).
- Frage beim User nach, falls unklar: Ziel-URL, Tonalität, gewünschte Bausteine, CTA-Ziel.

### Schritt 2: Elemente aus der Wissensbasis zuordnen

Mappe die Struktur-Signale aus dem Text auf die in der Wissensbasis definierten HTML-Elemente:

| Struktur-Signal im Text | HTML-Element aus Wissensbasis |
|---|---|
| Vergleich, Kostenübersicht, strukturierte Daten | Tabellen-HTML |
| Häufige Fragen, "FAQ", Q&A | FAQ-/Accordion-Block + Schema.org |
| "Tipp:", "Gut zu wissen:", Hinweis | Info-/Tipp-Box |
| Handlungsaufforderung, "Bestellen", "Kontakt" | Primary-Button / Warning-Button |
| Thematischer Wechsel | Trennlinie |
| Angebots-Darstellung | Preis-Card-Baustein |

**Regel:** Kein Element erzwingen. Nur einsetzen, wenn es inhaltlich passt.

### Schritt 3: HTML erzeugen

- Verwende **ausschließlich** HTML-Snippets aus der Wissensbasis. Keine erfundenen Klassen, keine erfundenen Shortcodes.
- Befülle die Platzhalter in den Snippets mit dem Inhalt aus dem User-Text.
- Für FAQ-Blöcke zusätzlich das Schema.org-JSON-LD aus der Wissensbasis ausgeben.
- Keine äußeren Wrapper um den Gesamt-Output.

### Schritt 4: Output + Verifikation

Gib den HTML-Code aus, direkt copy-paste-fertig für den HTML-Editor des CMS. Nenne darunter kurz:
- Welche Elemente aus der Wissensbasis verwendet wurden.
- Welche interne Links gesetzt wurden (aus der Link-Map der Wissensbasis).
- Ob Bausteine bewusst weggelassen wurden.

## Regeln (projektübergreifend)

1. **Wissensbasis ist Wahrheit.** Alle Klassen, Shortcodes, Farben, Strukturen kommen aus `wissensbasis/html-elemente.md`. Nichts erfinden.
2. **Sprache:** Schreibe auf Deutsch. Deutsche Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. Niemals ASCII-Transliterationen.
3. **Tonalität und Markenbegriffe** aus `CLAUDE.md → Schreibregeln` übernehmen (Siezen ja/nein, Konsistenz bei Produktnamen, …). Die Wissensbasis verweist dorthin – keine Duplikation.
4. **Interne Links** nur aus der Link-Map der Wissensbasis. Keine ausgedachten URLs.
5. **Preise und Kennzahlen** nur aus der Wissensbasis. Niemals aus Trainingsdaten, niemals schätzen.
6. **Bausteine dosieren.** Für einen Ratgeber-Artikel reichen typischerweise 2–3 Bausteine. Nicht jeden verfügbaren Baustein verwenden.
7. **Vorgaben des Users** (bestimmte Elemente einschließen/ausschließen) gehen vor automatische Platzierung.
8. **Bilder** nur einbinden, wenn der User eine URL oder einen Dateinamen liefert.
9. **Output ist copy-paste-fertig** – keine Erklärungen im HTML, keine Kommentare im Code, es sei denn der User fragt danach.

## Wissensbasis-Struktur

Der Skill erwartet `wissensbasis/html-elemente.md` mit diesen Sektionen (Template siehe `references/wissensbasis-template.md`):

1. Technische Basis (CMS, CSS-Framework, Shortcode-Plugin, Schriftart)
2. Farbpalette
3. Überschriften
4. Buttons/CTAs
5. Tabellen
6. Info-/Tipp-Box
7. FAQ/Accordion (inkl. Schema.org-Vorlage)
8. Sektionen/Layout (Grid-System)
9. Wiederverwendbare Bausteine (Liste + HTML-Code je Baustein)
10. Interne Link-Map
11. Preise/Kennzahlen
12. Tonalität und Schreibkonventionen

Jede Sektion muss funktionierenden HTML-Code enthalten, der 1:1 aus dem Ziel-CMS extrahiert wurde – nicht aus der Dokumentation, nicht aus dem Gedächtnis, sondern aus dem tatsächlichen Frontend-Quelltext oder dem CMS-Backend.
