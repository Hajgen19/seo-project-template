# HTML-Elemente – Projekt-Wissensbasis

Diese Datei wird beim Projektsetup angelegt und vom Skill `content-html-formatter` gelesen. Sie muss **1:1 funktionierenden HTML-Code** aus dem tatsächlichen CMS des Projekts enthalten – extrahiert aus dem Frontend-Quelltext oder dem CMS-Backend, **nicht** aus Dokumentation oder Gedächtnis.

**Anleitung:** Kopiere diese Datei nach `wissensbasis/html-elemente.md` im Projekt-Root und fülle alle `[AUS_CMS_EXTRAHIEREN]`-Blöcke.

---

## 1. Technische Basis

- **CMS:** [z.B. WordPress, Shopify, TYPO3]
- **CSS-Framework:** [z.B. Bootstrap 4, Tailwind, eigenes Theme]
- **Shortcode-Plugin:** [z.B. Shortcodes Ultimate – oder „keines"]
- **Schriftart:** [Name + Schriftgewichte]

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

## 7. FAQ / Accordion

### CMS-Variante (Editor-Input)
```
[AUS_CMS_EXTRAHIEREN – z.B. Shortcode]
```

### Gerendertes HTML
```html
[AUS_CMS_EXTRAHIEREN]
```

### FAQPage Schema (JSON-LD)
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

## 8. Sektionen / Layout

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

## 9. Wiederverwendbare Bausteine

Liste der wiederverwendbaren HTML-Blöcke für das Projekt. Für jeden Baustein: Name, kurze Beschreibung, Einsatzempfehlung, vollständiger HTML-Code.

### Baustein 1: [Name]
- **Beschreibung:** [Was macht der Baustein?]
- **Einsatz:** [Wann sinnvoll? Wann nicht?]

```html
[AUS_CMS_EXTRAHIEREN]
```

### Baustein 2: [Name]
…

**Regel:** Nicht alle Bausteine auf eine Seite packen. Typischerweise 2–3 pro Ratgeber-Artikel.

## 10. Interne Link-Map

| Thema | URL |
|---|---|
| Startseite | / |
| [AUS_CMS_EXTRAHIEREN – wichtigste Zielseiten] | |

Regeln:
- Nur relative URLs für interne Links.
- Keine URLs außerhalb dieser Liste verwenden (außer der User gibt sie vor).

## 11. Preise / Kennzahlen

Nur ausfüllen, wenn CTAs, Tabellen oder Bausteine Preise enthalten. Niemals aus Trainingsdaten ergänzen.

- [Kennzahl]: [Wert] (Stand: [Datum])
- …

## 12. Tonalität und Schreibkonventionen

**Single Source of Truth:** Tonalität, Anrede, Markenname-Schreibweise und Sprachregeln stehen ausschließlich in der Projekt-`CLAUDE.md` unter der Sektion „Schreibregeln". Diese Sektion dient nur als Verweis, damit der `content-html-formatter`-Skill beim Lesen der Wissensbasis weiß, wo die verbindlichen Regeln liegen.

→ Siehe `CLAUDE.md` → **Schreibregeln**.

Falls beim Formatieren Unklarheit über einen konkreten Sprachfall auftritt (z.B. Markenbegriff-Variante in Überschriften vs. Fließtext), diese Entscheidung in `CLAUDE.md → Schreibregeln` ergänzen – **nicht hier**.
