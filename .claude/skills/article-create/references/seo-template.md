# SEO-Daten – [Seitenname]

## URL & Canonical

- **URL:** [TODO – volle URL; Domain aus `CLAUDE.md` > Über, Pfad-Präfix laut Taxonomie-Brücke, z.B. `https://www.sonnenwerk-solar.de/ratgeber/beispiel-slug/`]
- **Canonical:** [TODO – in der Regel identisch mit der URL]
- **Content-Typ:** [Ratgeber | Beratung | Produktbeschreibung | Kollektionsseite | Profilseite | Landingpage – laut Taxonomie-Brücke in `CLAUDE.md`; bestimmt Typ-Ordner und Pflicht-Elemente]
- **Sprache:** [de-DE | en-US | …]
- **Status:** [Entwurf | Bereit zum Einpflegen | Live]
- **Stand:** [YYYY-MM-DD]

---

## Meta-Tags

> **Voice-Hinweis:** Meta-Title und Meta-Description müssen ebenfalls im projekt-typischen Stil klingen
> (siehe `wissensbasis/tone-of-voice.md`). Anrede, Perspektive und CTA aus dem Pool dort.

| Feld | Wert | Zeichen |
|---|---|---|
| **Meta Title** | [TODO – max. 60 Zeichen, Hauptkeyword vorne; Marke nur laut Projektkonvention in `CLAUDE.md` (Default: ohne)] | [n/60] |
| **Meta Description** | [TODO – max. 155 Zeichen, Anrede laut Voice, CTA am Ende aus Voice-Pool] | [n/155] |
| **OG Title** | [TODO – kann von Meta Title abweichen] | – |
| **OG Description** | [TODO] | – |
| **OG Image** | [TODO – konkretes Bild auswählen, idealerweise im Marken-Bildlook] | – |
| **CMS-Auszug/Excerpt (optional)** | [TODO – nur falls das CMS ein separates Auszug-Feld führt; 150–230 Zeichen, erzählerischer als die Meta-Description] | [n] |

> **Auszug-Hinweis:** Manche CMS/Themes führen ein separates Auszug-Feld (z.B. Blog-Excerpt), das Listen-Teaser
> oder die Article-Schema-`description` speist. Ob und wie das Feld belegt wird, steht in der projekt-eigenen
> `CLAUDE.md` bzw. der Theme-Doku. Der Auszug darf länger und erzählerischer sein als die Meta-Description
> (konkreter Nutzen + Glaubwürdigkeits-Anker). Im Marken-Voice (siehe `wissensbasis/tone-of-voice.md`).

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

## Autor

Persistente Verknüpfung Artikel↔Autor. Wird vom `content-html-formatter` beim Rendern der Author-Card (CMS-Element laut `wissensbasis/html-elemente.md`) und vom Article-JSON-LD (`author`-Property) automatisch herangezogen. Die Werte werden aus `wissensbasis/autoren/<slug>.md` gelesen, hier wird nur der Slug referenziert.

| Feld | Wert |
|---|---|
| **Slug** | [TODO – z.B. `sandra-w`, muss als Datei `wissensbasis/autoren/<slug>.md` existieren] |
| **Display-Name** | [aus Autoren-Datei `display_name`, z.B. „Sandra W."] |
| **Voller Name** | [aus Autoren-Datei `full_name`, z.B. „Sandra Weber" – wird im Schema.org-Author und Methodology-Block verwendet] |
| **Rolle** | [aus Autoren-Datei `role`, z.B. „Gründerin Sonnenwerk Solar GmbH"] |
| **Profil-URL** | [aus Autoren-Datei `profile_url`, z.B. `/ueber-uns/`] |

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

## Bilder & Medien

Konkrete Dateien aus dem Medien-Katalog `wissensbasis/medien/` auswählen (per Tag-Suche zum Sektions-Thema), sofern das Projekt einen Katalog führt. Pro Bild den lokalen Namen + die CDN-URL eintragen. Wenn ein Bild noch nicht hochgeladen ist (Status `nur-lokal`), CDN-URL als `TODO` lassen — der `content-html-formatter` setzt dann einen TODO-Kommentar statt einer erfundenen URL. Vorsicht-Flags aus dem Katalog beachten (z.B. Motive, die laut Katalog nicht als typisches Produkt gezeigt werden sollen).

| Bild-Position | Lokal-Datei (Ordner laut Medien-Katalog) | CDN-URL | Alt-Text |
|---|---|---|---|
| Hero/Header | [TODO – Katalog-Eintrag] | [CDN-URL oder TODO] | [TODO – mit Hauptkeyword + ggf. Orts-/Branchenbezug] |
| [Sektion] | [TODO] | [TODO] | [TODO] |

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

*Quelle: [TODO – Keyword Planner, Konkurrenzanalyse, GSC-Daten der Property laut `CLAUDE.md` > Analytics-Anbindung, Stand YYYY-MM-DD]*
*Stand: [YYYY-MM-DD]*
