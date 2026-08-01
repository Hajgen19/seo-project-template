---
name: content-html-formatter
description: >
  Nimmt einen Text entgegen und formatiert ihn als CMS-fertiges HTML nach den
  projektspezifischen HTML-Elementen, die in wissensbasis/html-elemente.md
  hinterlegt sind. Bereitet ausserdem Artikel-Bilder und -Videos web-fertig auf
  (references/prepare-media.py mit Qualitaets-Leiter und Qualitaets-Gate).
  Nutze diesen Skill immer, wenn der User einen Text, Artikel, Ratgeber oder
  Seiteninhalt als HTML formatieren moechte. Trigger auch bei: "HTML
  formatieren", "Content erstellen", "Artikel formatieren", "Blogtext
  formatieren", "Text in HTML umwandeln", "fuer die Website aufbereiten",
  "FAQ erstellen".
---

# Content HTML Formatter

Dieser Skill formatiert Fließtext zu CMS-fertigem HTML. Er enthält **keine** HTML-Elemente direkt. Alle projektspezifischen Bausteine (CSS-Klassen, Shortcodes, Farben, Buttons, Cards, Tabellen-Styles, wiederverwendbare Blöcke) stehen in der Wissensbasis `wissensbasis/html-elemente.md`. Dieses Prinzip ist der Kern des Skills: Was nicht in der Wissensbasis steht, wird nicht ausgegeben.

In der Content-Kette ist der Skill die letzte Stufe (`seo-page-research → article-create → content-html-formatter`, sofern diese Skills im Projekt aktiv sind). Input ist normalerweise eine `artikel/content/<content-typ>/<slug>/artikel.md`; die zugehörige `seo.md` liefert Content-Typ, Autor-Slug und Schema-Empfehlung. Der Output-Dateiname ist der **CMS-Dateiname** aus der Projekt-`CLAUDE.md`, Sektion „Über" (z.B. `wordpress.html`, `shopify.html`, `webflow.html`).

## Pre-Flight-Check (IMMER zuerst)

Bevor du auch nur einen HTML-Tag ausgibst:

1. **Lies `wissensbasis/html-elemente.md`** (relativ zum Projekt-Root).
2. Prüfe, ob die Datei existiert und ob die benötigten Element-Kategorien gefüllt sind.
3. **Wenn die Datei fehlt oder leer ist:** Brich ab und antworte dem User:

   ```
   Dieser Skill benötigt die projektspezifischen HTML-Elemente aus dem CMS.
   Bitte lege `wissensbasis/html-elemente.md` an und trage dort folgendes ein:

   - Überschriften (H1/H2/H3 – Klassen, Inline-Styles)
   - Buttons/CTAs (Primär, Sekundär – exakter HTML-Code)
   - Tabellen (Wrapper, Klassen, Header-Style)
   - Info-/Tipp-Boxen (Shortcode oder gestylter Container)
   - Zitat-Element (Experten-/Kundenzitat, inkl. Schema.org-Regelung)
   - FAQ/Accordion (Shortcode + HTML-Render + Schema.org-Regelung)
   - Inhaltsverzeichnis (ToC) mit Anker-Konvention
   - Bild/Artikelbild (CSS-Klasse, CDN-Basis-URL, DUMMY-Konvention)
   - Listen-Varianten (nummeriert, Checkliste, Punkt-Liste, Feature-Liste)
   - Author-Card und Article-Share (falls das Theme sie kennt)
   - Sektionen/Layout (Grid, Container, Hintergrund-Varianten)
   - Wiederverwendbare Bausteine (Preis-Cards, Hero, Produktkarte, Testimonial, …)
   - CMS-Basis (WordPress, Shopify, …), CSS-Framework, Shortcode-Plugin
   - Markenfarben, Schriftart
   - Interne Link-Map (URL-Tabelle der wichtigsten Zielseiten)
   - Aktuelle Preise/Kennzahlen (falls CTAs Preise enthalten)
   - Tonalität + Schreibkonventionen (Verweis auf CLAUDE.md → Schreibregeln)

   Eine Vorlage findest du in `references/wissensbasis-template.md` dieses Skills.
   ```

   **Biete keinen Fallback-HTML-Code an.** Ohne Wissensbasis kein Output – sonst produzierst du HTML, das im Ziel-CMS nicht funktioniert.

4. **Wenn einzelne Kategorien fehlen:** Benenne klar, welche Kategorie in der Wissensbasis ergänzt werden muss, und mache nur mit dem weiter, was vorhanden ist. Das gilt auch für Pflicht-Elemente eines Content-Typs: Ist die Kategorie nicht definiert, wird sie nicht erfunden, sondern als Lücke gemeldet.

## Laufzeit-Quellen

Der Skill liest bei jedem Lauf aus dem Projekt (nichts davon ist im Skill hartkodiert):

| Quelle | Liefert |
|---|---|
| `CLAUDE.md` (Projekt-Root) | Marke, Schreibregeln, CMS-Dateiname, CMS-Editor, Content-Typen-Tabelle bzw. Taxonomie-Brücke, optional Sektion „Medien-Maße" |
| `wissensbasis/html-elemente.md` | Alle HTML-Bausteine – die einzige Quelle für Markup |
| `wissensbasis/tone-of-voice.md` | Verbindliche Stimm-Referenz (falls vorhanden) |
| `seo.md` des Artikels | Content-Typ, Autor-Slug, Tabelle „Bilder & Medien" |
| `wissensbasis/autoren/<slug>.md` | Author-Card-Daten (falls die Wissensbasis eine Author-Card definiert) |
| Medien-Katalog (z.B. `wissensbasis/medien/`), falls vorhanden | Bild-/Video-Bestand, CDN-URLs, Eignung, Vorsicht-Flags |

## Schritt 1: Content-Typ ermitteln

Den Content-Typ in dieser Reihenfolge bestimmen (nicht sofort den User fragen):

1. **`seo.md` des Artikels** prüfen: Dort steht der Projekt-Content-Typ, wenn ein Recherche-Briefing zugrunde liegt; URL-Pfad und H-Hierarchie verraten ihn ebenfalls.
2. **URL-Pfad → Content-Typ** über die Content-Typen-Tabelle bzw. Taxonomie-Brücke der Projekt-`CLAUDE.md`.
3. **Nur wenn beides fehlt:** den User nach dem Content-Typ fragen.

Der Content-Typ bestimmt, welche Elemente Pflicht sind. Alle anderen Elemente bleiben verfügbar und dürfen eingesetzt werden, wenn sie inhaltlich passen.

### Pflicht, Empfohlen, Verfügbar

- **Pflicht** = Muss im Output enthalten sein, auch wenn der User es nicht explizit fordert (sofern die Kategorie in der Wissensbasis definiert ist, siehe Pre-Flight Punkt 4)
- **Empfohlen** = Einbauen, wenn der Inhalt es hergibt, aber kein Fehler, wenn es fehlt
- **Verfügbar** = Alle übrigen Elemente dürfen verwendet werden, wenn sie inhaltlich Sinn ergeben

Default-Tabelle (steht in der Projekt-`CLAUDE.md` eine eigene Content-Typen-Tabelle, gewinnt diese):

| Content-Typ | Ordner (`artikel/content/…`) | Pflicht | Empfohlen | Wörter |
|---|---|---|---|---|
| **Ratgeber** | `ratgeber` | ToC + Anker-IDs, Zitat, FAQ | Tabelle, Info-Box, CTA | 1500–3000 |
| **Beratung** | `beratung` | ToC + Anker-IDs, Zitat, FAQ | Vergleichstabelle, Info-Box | 1500–3000 |
| **Produktbeschreibung** | `produkte` | — | Info-Box, Tabelle | 300–800 |
| **Kollektions-/Kategorieseite** | `kollektionen` | — | Listen, Info-Box | 200–500 |
| **Personen-/Profilseite** | `profile` | Zitat | Info-Box | 500–1000 |
| **Landingpage** | `landingpages` | — | — | 500–1500 |

Bei Mixed-Intent (Flag aus der Recherche-Phase): den dominanten Intent für den Content-Typ nehmen, Nebenintents als FAQ-/Abschnitts-Material behandeln.

## Schritt 2: Elemente aus der Wissensbasis zuordnen

Mappe die Struktur-Signale aus dem Text auf die in der Wissensbasis definierten Element-Kategorien:

| Struktur-Signal im Text | Element-Kategorie aus Wissensbasis |
|---|---|
| Vergleich, Kostenübersicht, strukturierte Daten (3+ Spalten) | Tabelle |
| Häufige Fragen, „FAQ", Q&A | FAQ/Accordion (Schema.org-Regelung laut Wissensbasis) |
| „Tipp:", „Gut zu wissen:", Hinweis, Warnung | Info-/Tipp-Box |
| Aussage einer Person (Experte, Kunde, Team) | Zitat-Element |
| Längerer Artikel mit 3+ H2-Abschnitten | Inhaltsverzeichnis + Anker-IDs auf den Überschriften |
| Schritt-für-Schritt-Anleitung | Nummerierte Liste bzw. Schritt-Überschriften |
| Dos/Don'ts, Vermeidungsliste, Checkliste | Checklisten-Variante |
| Begriff/Name + Erklärung je Punkt (Key/Value) | Feature-/Definitionsliste |
| Handlungsaufforderung, „Kontakt", Kategorie-Verweis | CTA-Button |
| Verweis auf ein konkretes Produkt | Produktkarte/Produkt-CTA-Baustein, falls definiert; sonst CTA-Button |
| Thematischer Wechsel | Trennlinie |
| Artikel-Ende (Ratgeber/Beratung) | Author-Card, danach Article-Share (falls definiert) |

**Regeln:**

- **Kein Element erzwingen.** Nur einsetzen, wenn es inhaltlich passt.
- **Nur definierte Kategorien verwenden.** Fehlt eine Kategorie in der Wissensbasis, wird sie weggelassen und als Lücke gemeldet, nicht improvisiert.
- **Bausteine dosieren.** Für einen Ratgeber-Artikel reichen typischerweise 2–3 Zusatzbausteine neben den Pflicht-Elementen.

### Listen-Entscheidungslogik (falls die Wissensbasis mehrere Listen-Varianten definiert)

Damit die Wahl regelbasiert statt nach Tagesform fällt, pro Liste diese Fragen der Reihe nach durchgehen und die **erste passende** Variante nehmen:

1. **Echte Abfolge, bei der die Reihenfolge zwingend ist?** (Schritt 2 setzt Schritt 1 voraus.) → nummerierte Variante bzw. Schritt-Überschriften. Achtung: „so gehen Sie vor" oder „Tipps" allein ist kein sicheres Reihenfolge-Signal. Sind die Punkte parallele Maßnahmen ohne zwingende Ordnung, weiter zu Frage 3.
2. **Dos/Don'ts oder Warnungen?** → Checklisten- bzw. Vermeidungslisten-Variante.
3. **Hat jeder Punkt einen Begriff/Namen + eine Erklärung?** → Feature-/Definitionsliste. Wenn die Rohpunkte noch keinen Titel/Beschreibung-Split haben, den Punkt dafür kurz umformulieren.
4. **Sonst** (einfache, gleichrangige Aufzählung) → Standard-Listen-Variante der Wissensbasis.

Bei Zweifel zwischen zwei Varianten: die wählen, die die Funktion der Passage am ehrlichsten abbildet, und die Alternative im QA-Selbstcheck nennen. Ungestyltes Standard-`<ul>`/`<ol>` nur, wenn die Wissensbasis das ausdrücklich vorsieht oder keine Variante passt.

## Schritt 3: HTML erzeugen

- Verwende **ausschließlich** HTML-Snippets aus der Wissensbasis. Keine erfundenen Klassen, keine erfundenen Shortcodes, keine Abwandlungen der dokumentierten Markup-Struktur (nicht gestylte Varianten werden im Live-Theme unformatiert dargestellt).
- Befülle die Platzhalter in den Snippets mit dem Inhalt aus dem Artikel-Text.
- **Schema.org-Regelung pro Element beachten:** Die Wissensbasis legt je Element (FAQ, Zitat, Author-Card) fest, ob JSON-LD manuell mit ausgegeben wird oder das Theme es automatisch per JavaScript generiert. Bei automatischer Generierung: NUR das HTML ausgeben, keine `<script>`-Blöcke und kein manuelles JSON-LD (sonst doppeltes Schema).
- **ToC:** direkt nach der Einleitung, vor dem ersten H2. Die Anker-Links müssen auf `id`-Attribute der Ziel-Überschriften zeigen.
- **Author-Card:** Daten IMMER aus `wissensbasis/autoren/<slug>.md` übernehmen, niemals Display-Name, Initialen, Rolle oder Bio frei formulieren. Slug-Ermittlung in dieser Reihenfolge:
  1. `seo.md` des Artikels, Block `## Autor`, Feld **Slug** (Tabellen- oder Zeilenform; gewinnt immer).
  2. Fehlt der Slug in `seo.md`: User fragen.
  3. Existiert genau ein aktiver Autor in `wissensbasis/autoren/`: still diesen verwenden, im Schlussbericht vermerken und den Autor-Block in `seo.md` nachtragen.
  Hat der genannte Autor noch keine Datei: STOP, erst die Autoren-Datei anlegen (Schema siehe `wissensbasis/autoren/README.md`), dann weiter.
- **Article-Share** (falls definiert): ganz unten, direkt nach der Author-Card.
- Keine äußeren Wrapper um den Gesamt-Output.

## Schritt 4: Bilder und Videos (optional)

Dieser Schritt läuft nur, wenn der Artikel Medien bekommen soll und der volle Artikel-Kontext vorliegt. Ziel: lange Artikel mit passenden Motiven auflockern, ohne Textwüste und ohne bildschirmsprengende Bilder. Quelle der Originale: der Medien-Ordner des Projekts laut `CLAUDE.md` → Quellenpfade (z.B. `quelldateien/bilder/`), plus Medien-Katalog (z.B. `wissensbasis/medien/`), falls das Projekt einen führt.

### Schritt 4a: Kontext verstehen und auswählen

Den Artikel Sektion für Sektion (H2-Block) durchgehen und je Block fragen: Gibt es ein Motiv, das genau das zeigt, worum es in dieser Sektion geht?

**Platzierungs-Regel: Rhythmus mit Relevanz, kein Schema-F.**

- Es gilt NICHT „ein Bild pro H2". Bilder werden kontextuell gesetzt, nicht schematisch.
- 1 Hero/Aufmacher oben, direkt nach dem Intro, wenn ein gutes Motiv existiert.
- Rhythmus als grobe Orientierung: etwa ein Bild alle 2–3 H2-Blöcke bzw. alle ~400–600 Wörter, aber nur, wenn ein passendes Motiv existiert.
- Fast nie ein Bild: FAQ, Fazit/Zusammenfassung, Sektionen mit dominanter Vergleichs-/Preistabelle.
- Obergrenze: bei einem ~2.000-Wörter-Artikel insgesamt etwa 3–5 Bilder.

**Harte Auswahl-Kriterien (jedes Bild muss ALLE erfüllen):**

1. **100 % Kontextbezug.** Das Bild muss exakt das Thema der Sektion zeigen, nicht nur lose verwandt sein. Beschreibt der Text einen Arbeitsschritt, zeigt das Bild genau diesen Arbeitsschritt, nicht das fertige Ergebnis. Ein nur ungefähr passendes Motiv zählt nicht. Wenn kein Bild genau passt: weitersuchen oder kein Bild.
2. **Sichtprüfung ist PFLICHT.** Jedes Kandidatenbild mit dem Read-Tool ansehen, bevor es gewählt wird. Dem Dateinamen nicht vertrauen, er kann falsch benannt sein. Nur was du im Bild siehst, zählt.
3. **Schärfe/Auflösung.** Das Original muss breit genug sein, damit es in der Textspalte nicht hochskaliert (= unscharf) wird. Faustregel: Originalbreite mindestens ~1,5x der Textspalte für Inline-Bilder; Bilder schmaler als die Textspalte nicht inline verwenden.
4. **Herkunft und Rechte verifizieren.** Bei Produkt-/Referenzmotiven prüfen, ob das Motiv wirklich vom Kunden stammt bzw. verwendet werden darf. Bei Zweifel: nicht verwenden oder den Kunden bestätigen lassen.
5. **Mehrere Kandidaten vergleichen.** Gibt es mehrere passende Motive, 2–3 ansehen und das schärfste, am besten komponierte mit dem klarsten Kontextbezug wählen.
6. **Vorsicht-Flags** aus dem Medien-Katalog beachten, falls das Projekt einen führt.

Ein unpassendes, unscharfes oder zweifelhaftes Bild ist immer schlechter als gar keins. Im Schlussbericht vermerken, welche Sektionen ein Bild bekommen haben und welche bewusst nicht.

### Schritt 4b: Aufbereiten mit `references/prepare-media.py`

Das lokale Original ist oft zu groß oder im falschen Ausschnitt. Das Skript skaliert herunter (nie hoch), schneidet optional zu (`--crop`/`--aspect`) und exportiert verlustarm als WebP (Bild) bzw. h264-MP4 (Video) nach `artikel/content/<content-typ>/<slug>/bilder/` (Typ-Ordner per `--content-type` oder glob-Auto-Erkennung).

**Für Bilder in Artikeln ist `--quality-ladder` PFLICHT** (siehe Schritt 4c): Statt einer einzelnen Datei bei fixer Qualität erzeugt das Skript mehrere Kandidaten bei verschiedenen WebP-Qualitätsstufen. Zuschnitt und Skalierung sind identisch, nur die Kompression unterscheidet sich. Ausgabe-Dateinamen: `<name>-web-q<N>.webp`. `--quality-ladder` ist ein reiner Ein/Aus-Schalter ohne eigenen Wert; eigene Qualitätsstufen laufen über das separate `--qualities`-Flag. Der Einzel-Modus (ohne `--quality-ladder`, fixe Qualität q82) bleibt nur als Fallback für Nicht-Artikel-Zwecke.

```bash
# PFLICHT-Workflow: Inline-Bild + Qualitaets-Leiter (Default-Stufen 25,35,45,55,65,75,85):
python .claude/skills/content-html-formatter/references/prepare-media.py \
  "quelldateien/bilder/<datei>.webp" --slug <slug> --content-type <typ> --eignung inline --quality-ladder

# Eigene Qualitaetsstufen (--qualities ist ein SEPARATES Flag):
python ... --slug <slug> --content-type <typ> --eignung inline --quality-ladder --qualities 20,30,40,50,60,70,80

# Hero mit zentriertem Zuschnitt (Hochformat -> Querformat):
python ... --slug <slug> --content-type <typ> --eignung hero --aspect 16:9 --quality-ladder

# Praeziser Pixel-Crop (stoerenden Rand weg): links,oben,breite,hoehe
python ... --slug <slug> --content-type <typ> --eignung inline --crop 0,300,1536,1100 --quality-ladder

# Video auf inline-Breite + Zeitausschnitt 3s-9s (Videos: kein --quality-ladder):
python ... "quelldateien/videos/<datei>.MP4" --slug <slug> --content-type <typ> --eignung inline --trim 3,9
```

**Ziel-Breiten und Textspalte:** Das Skript liest die Theme-Maße aus der Projekt-`CLAUDE.md`, optionale Sektion „Medien-Maße". Erwartetes Format:

```markdown
## Medien-Maße

- **Textspalte:** 800 px
- **Ziel-Breite hero:** 1600 px
- **Ziel-Breite inline:** 1400 px
- **Ziel-Breite detail:** 900 px
```

Präzedenz: CLI-Parameter (`--width`, `--text-column`) > `CLAUDE.md` → „Medien-Maße" > neutrale Defaults (Textspalte 800 px; hero 1600, inline 1400, detail/small 900). Fehlt die Sektion, gelten die Defaults; beim Projektsetup die echten Theme-Werte eintragen (Textspalte = Anzeigebreite von Artikelbildern im Theme, Ziel-Breiten ≈ 1,75–2x davon für Retina).

| Eignung | Einsatz |
|---|---|
| `hero` | Aufmacher über die volle Lesebreite |
| `inline` | Standardbild in der Textspalte (Retina-Reserve) |
| `detail` / `small` | halbe Spalte, Detailaufnahme (Modifier-Klasse laut Wissensbasis) |

**Höhen-Regel (PFLICHT, sonst überfüllt das Bild den Bildschirm vertikal):**

Die Artikelbild-Klasse des Themes begrenzt üblicherweise nur die *Breite*. Die *Höhe* ergibt sich aus dem Seitenverhältnis: Ein Hochformat-Bild wird in der Textspalte höher als breit angezeigt und füllt beim Scrollen fast den ganzen Desktop-Viewport. Deshalb: **Inline-Bilder dürfen nicht höher als breit sein.** Bei Textspalten-Breite B gilt:

| Verhältnis | Anzeigehöhe | Bewertung |
|---|---|---|
| 16:9 / 3:2 | 0,56×B / 0,67×B | ideal (Hero + Inline) |
| 4:3 | 0,75×B | gut |
| 5:4 | 0,80×B | obere Grenze für Inline |
| 1:1 | 1,00×B | nur Ausnahme, wenn das Motiv es zwingend braucht |
| Hochformat | > B | **verboten**, immer zuschneiden |

- **Hero:** quer schneiden, Ziel 3:2 oder 16:9.
- **Inline:** Ziel 3:2 bis 4:3, harte Obergrenze 5:4.
- **Crop mit Fokus-Erhalt:** Beim Flacher-Schneiden den eigentlichen Fokus prominent behalten, nur Störendes oben und unten wegnehmen. Lieber etwas Breite opfern als den Fokus.
- Bei vertikalen Motiven, wo 4:3 den Inhalt abschneiden würde: so flach wie möglich (max. 5:4) und das im Schlussbericht vermerken.

Die Crop-Entscheidung fällt **nach Ansicht des Bildes** und **nach Ansicht des Crop-Ergebnisses**: Output erneut mit dem Read-Tool prüfen und nachjustieren, bis Fokus und Höhe stimmen. Mehrere Crop-Durchläufe sind normal. Das Skript druckt zu jedem Lauf Warnhinweise (Hochformat, zu geringe Breite) und die exakten Pixelmaße für die `width`/`height`-Attribute.

### Schritt 4c: Qualitäts-Gate (PFLICHT nach jedem `--quality-ladder`-Lauf)

Zuschnitt und Skalierung (Schritt 4b) stehen erst fest, wenn Fokus und Höhe passen. **Danach erst** die Qualitäts-Kandidaten prüfen, nie vorher (sonst muss die Leiter nach einem Crop-Nachjustieren neu laufen). Ablauf:

1. **Jeden erzeugten Kandidaten** (`<name>-web-q<N>.webp`) mit dem Read-Tool **ansehen**. Gezielt auf die Problemzonen achten, wo Überkompression zuerst sichtbar wird: glatte Farbverläufe (Banding/Streifen) und dunkle/schattige Flächen (Klötzchenbildung). Texturreiche Motive (Gras, Stein, Stoff) verzeihen niedrige Qualitätsstufen deutlich mehr als glatte Flächen (Hochglanz-Highlights, klare Verläufe). Das Motiv entscheidet, nicht ein fixer Zahlenwert.
2. **Tabelle + Empfehlung dem User zeigen**, exakt in dieser Form (eine Zeile pro Bild, falls mehrere gleichzeitig bearbeitet werden). Maße und Größe je Stufe stehen bereits in der Konsolenausgabe von `prepare-media.py`; dort nicht schätzen oder neu berechnen, sondern direkt übernehmen:

   | Bild | Maße | Qualität | Größe | Empfehlung/Hinweis |
   |---|---|---|---|---|
   | {kurzer Bildname} | {W}×{H} | q{empfohlener Wert} | {KB} | z.B. „ab q{X} sichtbares Banding im Verlauf, q{Y} mit Sicherheitsabstand gewählt" |

   Bei Bedarf zusätzlich kurz auflisten, welche anderen getesteten Stufen zur Wahl stehen (z.B. „q30 = 171 KB, q45 = 218 KB, q60 = 265 KB").
3. **Auf explizite Bestätigung warten.** Nicht eigenmächtig finalisieren. Der User kann: (a) die Empfehlung bestätigen, (b) eine andere Stufe wählen, (c) eine andere Zielgröße vorgeben (dann `--quality-ladder` mit angepassten `--qualities` erneut laufen lassen und neu vorlegen).
4. **Nach Bestätigung finalisieren:** gewählten Kandidaten nach `<name>-web.webp` umbenennen, alle übrigen `-web-q<N>.webp`-Kandidaten löschen. Die vom Skript gedruckten Maße (`width="…" height="…"`) für Schritt 4d notieren. Sie gelten unverändert für den finalisierten Kandidaten, da alle Kandidaten denselben Bildinhalt haben.

### Schritt 4d: Einbinden mit DUMMY-URL

Das finalisierte Bild wird mit der **Artikelbild-Klasse aus der Wissensbasis** (Sektion „Bild/Artikelbild") und einer DUMMY-URL eingebunden. Die CDN-Basis-URL kommt aus derselben Wissensbasis-Sektion. Format (so findet der User alle Platzhalter per Strg+F „DUMMY-"):

```html
<img class="[ARTIKELBILD-KLASSE]" src="[CDN-BASIS-URL]/DUMMY-beispiel-motiv-web.webp" alt="[Beschreibender Alt-Text aus seo.md]" width="[W]" height="[H]">
<!-- UPLOAD: artikel/content/<content-typ>/<slug>/bilder/beispiel-motiv-web.webp → nach CMS-Upload echte CDN-URL einsetzen, "DUMMY-" entfernen. width/height NICHT anfassen (Pixelmaße ändern sich beim Upload nicht). -->
```

**`width`/`height` sind PFLICHT** (Core Web Vitals: ohne sie reserviert der Browser keinen Platz und das Layout springt beim Laden, „Cumulative Layout Shift"). Die Werte müssen **exakt** den Pixelmaßen der finalen Web-Datei entsprechen, wie sie das Skript in Schritt 4b/4c ausgegeben hat. Niemals raten und niemals ein Preset blind übernehmen, falls zusätzlich zugeschnitten wurde. Der User lädt die Datei manuell ins CMS hoch und ersetzt nur die DUMMY-URL durch die echte; `width`/`height` bleiben unverändert.

- `alt`-Attribut immer beschreibend, aus der `seo.md`-Tabelle „Bilder & Medien".
- Kleinere Darstellung (halbe Spalte, Detail): Modifier-Klasse laut Wissensbasis.

### Schritt 4e: In seo.md dokumentieren

Jede gewählte Datei in der `seo.md`-Tabelle „Bilder & Medien" eintragen (Position, Lokal-Datei, CDN-URL = TODO, Alt-Text). So bleibt die Auswahl nachvollziehbar und der CDN-URL-Status sichtbar.

## Schritt 5: Output + QA-Selbstcheck

Gib den HTML-Code copy-paste-fertig für den HTML-Editor des CMS aus (CMS-Editor laut `CLAUDE.md` → „Über"). Keine Erklärungen im HTML, keine Kommentare im Code, außer den UPLOAD-Kommentaren der DUMMY-Konvention.

Vor der Ausgabe kurz selbst prüfen und dem User **transparent auflisten**:

- **Element-Report** (Stichpunkte, nicht das ganze HTML nochmal): pro Sektion eine Zeile „Abschnitt → gewähltes Element (+ kurze Begründung)". Besonders bei Listen, wo mehrere Varianten möglich gewesen wären, die Alternative nennen.
- **Pflicht-Elemente des Content-Typs vorhanden?** (z.B. Ratgeber: ToC + Anker-IDs, Zitat, FAQ.) Fehlende Pflicht-Kategorien der Wissensbasis als Lücke gemeldet?
- **Klassen exakt geschrieben?** Alle Klassen/Shortcodes buchstabengetreu aus der Wissensbasis, keine erfundenen oder veralteten Varianten.
- **Schema.org-Regelung eingehalten?** JSON-LD nur dort, wo die Wissensbasis es vorsieht; keine `<script>`-Blöcke, wenn das Theme Schema automatisch generiert.
- **Interne Links** nur aus der Link-Map der Wissensbasis, relative Pfade.
- **Technik:** kein äußerer Wrapper, echte Umlaute (ä/ö/ü/ß), jedes Artikelbild trägt `width`/`height` exakt gemäß Skript-Ausgabe, alle DUMMY-URLs per Strg+F „DUMMY-" auffindbar, UPLOAD-Kommentar je Bild vorhanden.
- **Welche Bausteine bewusst weggelassen wurden** (inkl. Sektionen ohne Bild).

Ziel des Reports: Der User sieht die Element-Wahl auf einen Blick und kann gezielt umentscheiden, statt das gerenderte Ergebnis Stück für Stück zu korrigieren.

## Regeln (projektübergreifend)

1. **Wissensbasis ist Wahrheit.** Alle Klassen, Shortcodes, Farben, Strukturen kommen aus `wissensbasis/html-elemente.md`. Nichts erfinden.
2. **Sprache:** Schreibe auf Deutsch. Deutsche Umlaute verwenden: ä, ö, ü, Ä, Ö, Ü, ß. Niemals ASCII-Transliterationen.
3. **Tonalität und Markenbegriffe** aus `CLAUDE.md` → Schreibregeln und `wissensbasis/tone-of-voice.md` übernehmen. Die Wissensbasis verweist dorthin, keine Duplikation.
4. **Interne Links** nur aus der Link-Map der Wissensbasis. Keine ausgedachten URLs.
5. **Preise und Kennzahlen** nur aus der Wissensbasis. Niemals aus Trainingsdaten, niemals schätzen.
6. **Bausteine dosieren.** Nicht jeden verfügbaren Baustein verwenden.
7. **Vorgaben des Users** (bestimmte Elemente einschließen/ausschließen) gehen vor automatische Platzierung.
8. **Bilder** nur über den Medien-Workflow (Schritt 4) einbinden, oder wenn der User eine fertige CDN-URL liefert. Nie ohne Sichtprüfung, nie ohne `width`/`height`.
9. **Kein Rohtext geliefert:** Wenn der User nur ein Thema nennt, nach dem Rohtext fragen oder klären, ob der Content geschrieben werden soll (dann zuerst `article-create` bzw. die Schreib-Skills).

## Wissensbasis-Struktur

Der Skill erwartet `wissensbasis/html-elemente.md` mit diesen Sektionen (Template siehe `references/wissensbasis-template.md`):

1. Technische Basis (CMS, CSS-Framework, Shortcode-Plugin, Schriftart)
2. Farbpalette
3. Überschriften
4. Buttons/CTAs
5. Tabellen
6. Info-/Tipp-Box
7. Zitat-Element (inkl. Schema.org-Regelung)
8. FAQ/Accordion (inkl. Schema.org-Regelung)
9. Inhaltsverzeichnis (ToC)
10. Bild/Artikelbild (inkl. CDN-Basis-URL und DUMMY-Konvention)
11. Listen-Varianten
12. Author-Card
13. Article-Share
14. Sektionen/Layout (Grid-System)
15. Wiederverwendbare Bausteine (Liste + HTML-Code je Baustein)
16. Interne Link-Map
17. Preise/Kennzahlen
18. Tonalität und Schreibkonventionen (Verweis auf CLAUDE.md)

Die Sektionen 7 und 9–13 sind optional: Sie werden nur gefüllt, wenn das Theme des Projekts die Elemente hergibt. Jede gefüllte Sektion muss funktionierenden HTML-Code enthalten, der 1:1 aus dem Ziel-CMS extrahiert wurde – nicht aus der Dokumentation, nicht aus dem Gedächtnis, sondern aus dem tatsächlichen Frontend-Quelltext oder dem CMS-Backend.
