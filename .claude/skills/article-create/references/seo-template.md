# SEO-Daten – [Seitenname]

## URL & Canonical

- **URL:** [https://www.<projekt-domain>/<slug>/]
- **Canonical:** [https://www.<projekt-domain>/<slug>/]
- **Sprache:** [de-DE | en-US | …]
- **Status:** [Entwurf | Bereit zum Einpflegen | Live]
- **Stand:** [YYYY-MM-DD]

---

## Meta-Tags

> **Voice-Hinweis:** Meta-Title und Meta-Description müssen ebenfalls im projekt-typischen Stil klingen
> (siehe `wissensbasis/tone-of-voice.md`). Anrede, Perspektive und CTA aus dem Pool dort.

| Feld | Wert | Zeichen |
|---|---|---|
| **Meta Title** | [TODO – max. 60 Zeichen, mit Hauptkeyword + Marke] | [n/60] |
| **Meta Description** | [TODO – 140–160 Zeichen, Anrede laut Voice, CTA am Ende aus Voice-Pool] | [n/160] |
| **OG Title** | [TODO – kann von Meta Title abweichen] | – |
| **OG Description** | [TODO] | – |
| **OG Image** | [TODO – konkretes Bild auswählen, idealerweise im Marken-Bildlook] | – |

---

## H-Hierarchie

```
H1: [Eine einzige H1 mit Hauptkeyword]
├── H2: [Sektion 1]
│   ├── H3: [Unterpunkt]
│   └── H3: [Unterpunkt]
├── H2: [Sektion 2]
└── H2: [Sektion 3]
```

---

## Keyword-Mapping

### Primäre Keywords

| Keyword | SV/Monat | Wettbewerb | Vorkommen im Text |
|---|---|---|---|
| [TODO] | – | – | – |

### Sekundäre / Lokale / Branchen-Keywords

| Keyword | SV/Monat |
|---|---|
| [TODO] | – |

### Informational Keywords (FAQ-Material)

| Keyword | SV/Monat | Einsatz |
|---|---|---|
| [TODO] | – | FAQ |

### Topic Cluster

| Cluster-Seite | Ziel-Keyword | Status |
|---|---|---|
| [TODO – verlinkte Cluster-Seiten oder Pillar Page] | – | – |

---

## Interne Verlinkung

Beim Einpflegen ins CMS als echte Verlinkungen setzen. Quelle für gültige Ziel-URLs ist `wissensbasis/<kurzform>-website-struktur.md` oder die analoge Datei laut `CLAUDE.md`.

| Ankertext | Ziel-URL |
|---|---|
| [TODO] | /[ziel-slug]/ |

---

## JSON-LD: Schema-Markup

> **Voice-Hinweis:** FAQPage-Antworten innerhalb des Schemas müssen exakt mit den Antworten in `artikel.md` übereinstimmen und damit auch im Marken-Stil verfasst sein (Bestätigung am Anfang, Reassurance am Ende, Marken-Vokabular).

[Je nach Content-Typ ein oder mehrere Schemas: FAQPage, Service, Product, LocalBusiness, BreadcrumbList. Im CMS-Code-Modul oder im Header der Seite einbauen.]

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "[FAQPage | Service | Product | LocalBusiness | …]",
  "...": "TODO – Schema komplett befüllen, JSON validieren"
}
</script>
```

---

## Bild Alt-Texte

| Bild-Position | Alt-Text |
|---|---|
| Hero/Header | [TODO – mit Hauptkeyword + ggf. Ortsbezug/Branche] |
| [Sektion] | [TODO] |

---

## GSC-Performance (vor Optimierung)

[Falls die Seite bereits live war, hier die letzten 90 Tage aus der GSC eintragen. Wenn neu: „Neue Seite, noch keine GSC-Daten."]

| Query | Impressions | Klicks | Position |
|---|---|---|---|
| [TODO] | – | – | – |

---

## Konkurrenzanalyse

[Optional, aber empfohlen für stark umkämpfte Keywords. Tabellen-Snapshot der Top-3-Konkurrenten.]

| Konkurrent | URL | Wörter | Schema | FAQ | Stärke |
|---|---|---|---|---|---|
| [TODO] | – | – | – | – | – |

---

## Umsetzungs-Checkliste

- [ ] **Voice-Check:** Checkliste aus `wissensbasis/tone-of-voice.md` Abschnitt 15 für `artikel.md`, Meta-Tags und FAQ-Schema-Antworten durchgegangen
- [ ] `artikel.md` ins CMS einpflegen
- [ ] Meta Title + Description aktualisieren
- [ ] OG Image setzen
- [ ] Interne Links als echte Verlinkungen setzen
- [ ] JSON-LD Schema als Code-Modul einbauen
- [ ] Alt-Texte für alle Bilder ergänzen
- [ ] FAQ als CMS-typisches Akkordeon/Toggle umsetzen
- [ ] Seite in der Vorschau prüfen (Desktop + Mobil)
- [ ] Veröffentlichen
- [ ] URL in Google Search Console zur Indexierung einreichen
- [ ] In 4 Wochen: GSC-Daten prüfen (Impressions, Klicks, Positionen)

---

*Quelle: [TODO – Keyword Planner, Konkurrenzanalyse, GSC-Daten der Property `<gsc-property>`, Stand YYYY-MM-DD]*
*Stand: [YYYY-MM-DD]*
