# HTML-Elemente – Projekt-Wissensbasis

Diese Datei wird beim Projektsetup angelegt und vom Skill `content-html-formatter` gelesen. Sie muss **1:1 funktionierenden HTML-Code** aus dem tatsächlichen CMS des Projekts enthalten – extrahiert aus dem Frontend-Quelltext oder dem CMS-Backend, **nicht** aus Dokumentation oder Gedächtnis.

**Anleitung:** Kopiere diese Datei nach `wissensbasis/html-elemente.md` im Projekt-Root und fülle alle `[AUS_CMS_EXTRAHIEREN]`-Blöcke. Sektionen, die das Theme nicht hergibt (z.B. Author-Card, Article-Share), bleiben leer mit dem Vermerk „nicht vorhanden" – der Skill lässt die Kategorie dann weg, statt sie zu erfinden.

---

## 1. Technische Basis

- **CMS:** [z.B. WordPress, Shopify, TYPO3]
- **CSS-Framework:** [z.B. Bootstrap 4, Tailwind, eigenes Theme]
- **Shortcode-Plugin:** [z.B. Shortcodes Ultimate – oder „keines"]
- **Schriftart:** [Name + Schriftgewichte]
- **Schema.org-Erzeugung:** [Wie entsteht strukturiertes Markup? z.B. „Theme-JS generiert FAQPage/Quotation automatisch aus dem Markup – KEIN manuelles JSON-LD ausgeben" ODER „JSON-LD wird manuell je Seite eingefügt"]

## 2. Farbpalette

| Rolle | Hex |
|---|---|
| Primärfarbe | `[#XXXXXX]` |
| Sekundärfarbe | `[#XXXXXX]` |
| Akzentfarbe | `[#XXXXXX]` |
| Hintergrund hell | `[#XXXXXX]` |
| Textfarbe | `[#XXXXXX]` |

## 3. Überschriften

```html
[AUS_CMS_EXTRAHIEREN – H1, H2-Varianten (Standard/zentriert/in Markenfarbe), H3]
```

## 4. Buttons / CTAs

### Primary-Button
```html
[AUS_CMS_EXTRAHIEREN]
```

### Sekundär-Button
```html
[AUS_CMS_EXTRAHIEREN]
```

### Warning-/Auffällig-Button (falls vorhanden)
```html
[AUS_CMS_EXTRAHIEREN]
```

### Button-Übersicht

| Typ | Klasse/Shortcode | Farbe | Verwendung |
|---|---|---|---|
| [AUS_CMS_EXTRAHIEREN] | | | |

Regeln:
- [z.B. maximal 2–3 CTA-Buttons pro Seite, nie direkt hintereinander]
- [Falls es einen Produktkarten-Baustein gibt (Sektion 15): Produktlinks über die Produktkarte, nicht über den Button]

## 5. Tabellen

```html
[AUS_CMS_EXTRAHIEREN – vollständiges Beispiel inkl. Wrapper/Responsive-Klasse]
```

Regeln für Tabellen:
- [z.B. erste Spalte `<strong>`, immer mit `<thead>`, responsive Wrapper]

## 6. Info-/Tipp-Box

```html
[AUS_CMS_EXTRAHIEREN – als Shortcode oder gestylter Container]
```

## 7. Zitat-Element (optional)

Für Aussagen von Expertinnen/Experten, Kundenstimmen oder Team-Zitate. Falls das Theme kein eigenes Zitat-Element hat: Sektion leer lassen und „nicht vorhanden" vermerken.

```html
[AUS_CMS_EXTRAHIEREN – Blockquote/Zitat-Container inkl. cite-Konvention (Name, Rolle)]
```

- **cite-Format:** [z.B. „- Name, Berufsbezeichnung" – exakt so dokumentieren, wie das Theme es erwartet]
- **Schema.org:** [„automatisch per Theme-JS (Quotation/Person) – kein JSON-LD ausgeben" ODER „manuelles JSON-LD nötig, Vorlage hier einfügen"]

## 8. FAQ / Accordion

### CMS-Variante (Editor-Input)
```
[AUS_CMS_EXTRAHIEREN – z.B. Shortcode]
```

### Gerendertes HTML
```html
[AUS_CMS_EXTRAHIEREN]
```

### Schema.org-Regelung

[Eine der beiden Varianten dokumentieren:]

- **Variante A – automatisch:** Das Theme generiert das FAQPage-JSON-LD per JavaScript aus dem FAQ-Markup. Dann gilt: NUR das HTML ausgeben, KEINE `<script>`-Blöcke, KEIN manuelles JSON-LD (sonst doppeltes Schema).
- **Variante B – manuell:** JSON-LD wird mit ausgegeben. Vorlage:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Frage]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Antwort]"
      }
    }
  ]
}
</script>
```

## 9. Inhaltsverzeichnis / ToC (optional)

Für längere Ratgeber-/Beratungsartikel mit 3+ Abschnitten. Verlinkt auf Anker-IDs im Content.

```html
[AUS_CMS_EXTRAHIEREN – exakte ToC-Struktur des Themes]
```

Regeln:
- Die Anker-Links müssen auf `id`-Attribute der Ziel-Überschriften zeigen, z.B. `<h2 id="abschnitt-1">Titel</h2>`.
- Platzierung: direkt nach der Einleitung, vor dem ersten `<h2>`.
- **Nur die hier dokumentierte Markup-Struktur ist im Theme gestylt.** Alternative/erweiterte Markups werden unformatiert dargestellt – nicht improvisieren.

## 10. Bild / Artikelbild

Artikelbilder werden per CDN-URL eingebunden und tragen die Artikelbild-Klasse des Themes (begrenzt die Anzeige auf die Textspalte – ohne sie läuft das Bild über den ganzen Bildschirm).

- **Artikelbild-Klasse:** `[AUS_CMS_EXTRAHIEREN]`
- **Modifier für kleine Darstellung** (halbe Spalte/Detail, falls vorhanden): `[AUS_CMS_EXTRAHIEREN]`
- **CDN-Basis-URL:** `[AUS_CMS_EXTRAHIEREN – z.B. https://cdn.example-cms.com/files]`

```html
<img class="[ARTIKELBILD-KLASSE]" src="[CDN-BASIS-URL]/DATEINAME-web.webp" alt="[Beschreibender Alt-Text]" width="[W]" height="[H]">
```

Regeln:
- **`width`/`height` sind PFLICHT** (Core Web Vitals: verhindert Layout-Sprünge beim Laden). Werte = exakte Pixelmaße der finalen Web-Datei, wie sie `prepare-media.py` ausgibt. Niemals raten.
- **DUMMY-Konvention:** Solange die echte CDN-URL fehlt, `DUMMY-` vor den Dateinamen setzen und einen `<!-- UPLOAD: … -->`-Kommentar mit dem lokalen Pfad ergänzen (Details siehe `content-html-formatter/SKILL.md`, Schritt 4d). Der User findet alle offenen Uploads per Strg+F „DUMMY-".
- `alt`-Attribut immer beschreibend, aus der `seo.md`-Tabelle „Bilder & Medien".

## 11. Listen-Varianten (optional)

Gestylte Listentypen des Themes. Nur die Varianten dokumentieren, die es wirklich gibt; die Auswahl-Logik (Abfolge / Dos-Don'ts / Begriff+Erklärung / einfache Aufzählung) steht in `content-html-formatter/SKILL.md`, Schritt 2.

### Nummerierte Schritte (für Anleitungen mit zwingender Reihenfolge)
```html
[AUS_CMS_EXTRAHIEREN]
```

### Checkliste / Vermeidungsliste (für Dos/Don'ts, Warnungen)
```html
[AUS_CMS_EXTRAHIEREN – falls es getrennte Häkchen-/Kreuz-Varianten gibt, beide dokumentieren]
```

### Standard-Aufzählung (gestylte Punkt-Liste)
```html
[AUS_CMS_EXTRAHIEREN]
```

### Feature-/Definitionsliste (Begriff + Erklärung je Punkt, z.B. Produktdetails)
```html
[AUS_CMS_EXTRAHIEREN – z.B. <strong>Titel</strong> + <span>Beschreibung</span> je <li>]
```

### Nummerierte Überschriften/Schritte (falls das Theme H3-Schritte mit Counter stylt)
```html
[AUS_CMS_EXTRAHIEREN – inkl. Counter-Reset-Konvention, falls nötig]
```

## 12. Author-Card (optional)

Autoren-Block am Ende eines Artikels (besonders Ratgeber). Die **Inhalte** (Display-Name, Initialen, Rolle, Bio) kommen IMMER aus `wissensbasis/autoren/<slug>.md` – jede Autoren-Datei liefert ein copy-paste-fertiges Snippet. Hier steht nur die Markup-Struktur des Themes:

```html
[AUS_CMS_EXTRAHIEREN – Author-Card-Container des Themes]
```

- **Schema.org:** [z.B. „Article.author wird aus dem full_name der Autoren-Datei befüllt" – Regelung dokumentieren]
- Verfügbare Autoren: `wissensbasis/autoren/README.md`.

## 13. Article-Share (optional)

Social-Share-Block am Artikelende, direkt nach der Author-Card.

```html
[AUS_CMS_EXTRAHIEREN – z.B. ein leerer Container, den das Theme automatisch rendert]
```

## 14. Sektionen / Layout

### Standard-Sektion
```html
[AUS_CMS_EXTRAHIEREN]
```

### Sektion mit Hintergrundfarbe
```html
[AUS_CMS_EXTRAHIEREN]
```

### Grid-System

| Klasse | Breakpoint | Breite |
|---|---|---|
| [AUS_CMS_EXTRAHIEREN] | | |

## 15. Wiederverwendbare Bausteine

Liste der wiederverwendbaren HTML-Blöcke für das Projekt (z.B. Preis-Card, Hero, Testimonial, Produktkarte/Produkt-CTA). Für jeden Baustein: Name, kurze Beschreibung, Einsatzempfehlung, vollständiger HTML-Code.

### Baustein 1: [Name]
- **Beschreibung:** [Was macht der Baustein?]
- **Einsatz:** [Wann sinnvoll? Wann nicht? Bei Produktkarten z.B.: max. 1 Banner + 1–2 Inline-Karten pro Artikel, nur bei natürlicher inhaltlicher Brücke zum Produkt]

```html
[AUS_CMS_EXTRAHIEREN]
```

### Baustein 2: [Name]
…

**Regel:** Nicht alle Bausteine auf eine Seite packen. Typischerweise 2–3 pro Ratgeber-Artikel.

## 16. Interne Link-Map

| Thema | URL |
|---|---|
| Startseite | / |
| [AUS_CMS_EXTRAHIEREN – wichtigste Zielseiten] | |

Regeln:
- Nur relative URLs für interne Links.
- Keine URLs außerhalb dieser Liste verwenden (außer der User gibt sie vor).

## 17. Preise / Kennzahlen

Nur ausfüllen, wenn CTAs, Tabellen oder Bausteine Preise enthalten. Niemals aus Trainingsdaten ergänzen.

- [Kennzahl]: [Wert] (Stand: [Datum])
- …

## 18. Tonalität und Schreibkonventionen

**Single Source of Truth:** Tonalität, Anrede, Markenname-Schreibweise und Sprachregeln stehen ausschließlich in der Projekt-`CLAUDE.md` unter der Sektion „Schreibregeln" sowie in `wissensbasis/tone-of-voice.md`. Diese Sektion dient nur als Verweis, damit der `content-html-formatter`-Skill beim Lesen der Wissensbasis weiß, wo die verbindlichen Regeln liegen.

→ Siehe `CLAUDE.md` → **Schreibregeln** und `wissensbasis/tone-of-voice.md`.

Falls beim Formatieren Unklarheit über einen konkreten Sprachfall auftritt (z.B. Markenbegriff-Variante in Überschriften vs. Fließtext), diese Entscheidung in `CLAUDE.md` → Schreibregeln ergänzen – **nicht hier**.
