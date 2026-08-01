---
name: brand-meta-ctr
description: Erzeugt CTR-optimierte Meta-Title und Meta-Description im Hausstil des Projekts (Formel + Glyph-System ✓/►) fuer eine Seite und schreibt die gewaehlte Variante in deren seo.md. On-demand, z. B. nach article-create wenn die Default-Meta nicht ueberzeugt, oder zum Nachruesten bestehender Live-Seiten. Trigger: "Meta fuer [slug]", "Title/Description schaerfen", "Meta verbessern", "CTR-Meta", "CTR-Meta [KUNDENNAME]".
---

# brand-meta-ctr

Schreibt **Meta-Title** und **Meta-Description** für eine Seite des Projekts nach einer festen, CTR-orientierten Formel mit Glyph-System. Wird **on-demand** aufgerufen: nach `article-create`, wenn die automatisch erzeugte Meta nicht überzeugt, oder um bestehende Live-Seiten nachzurüsten (CTR-Hebel).

Formel und Glyph-System unten sind der **Default-Hausstil des Templates**. Der `project-setup`-Skill darf beide beim Kunden-Setup anpassen (andere Glyphen, angepasste Formel, kundenspezifische Ton-Tabelle). Die Zeichenlimits (Title ≤ 60, Description ≤ 155) bleiben unverändert.

## Abgrenzung zu den generischen Meta-Skills

Es gibt generische Plugin-Skills (`meta-tags-ctr`, `meta-tags-optimizer`, `meta-tags-bulk`). **Dieser Skill ist die Hausstil-Version des Projekts** und unterscheidet sich bewusst:

- Verbindliche Projekt-Stimme aus `wissensbasis/tone-of-voice.md` (sachlich, kein Werbesprech, echte Umlaute, korrekte Schreibweise von Marke, Personen- und Produktnamen laut Wissensbasis).
- Festes Glyph-System (✓ Feature, ► Payoff) und feste Formel.
- Schreibt direkt in die `artikel/content/<content-typ>/<slug>/seo.md`-Struktur des Projekts.
- Nutzt den GSC-MCP der Property `[GSC_PROPERTY]`.

Für reine Massen-Optimierung vieler URLs aus CSV ist `meta-tags-bulk` das richtige Werkzeug; für eine einzelne Seite dieses Projekts dieser Skill.

## Wann diesen Skill nutzen

- Nach `article-create`/`content-html-formatter`, wenn Title/Description noch generisch wirken.
- Für **Live-Seiten mit schwacher CTR** (aus GSC): viele Impressionen, kaum Klicks. Hier holt eine bessere Meta die meisten zusätzlichen Klicks, ohne dass die Position besser werden muss.

## Schritt 0: Kontext laden (Pflicht)

1. `CLAUDE.md` lesen (Marke, Domain, Content-Typen-Tabelle, Analytics-Anbindung).
2. `wissensbasis/tone-of-voice.md` lesen (Tonalität, Umlaut-Regeln, Em-Dash-/Bindestrich-Regeln, verbindliche Schreibweisen von Marke und Namen).
3. Die Seite selbst: `artikel/content/<content-typ>/<slug>/artikel.md` (Thema, H1, Kernfakten, Primärkeyword) + `seo.md` (Content-Typ, aktuelles Keyword-Mapping, aktuelle Meta). Der Artikel-Ordner wird über den Glob `artikel/content/*/<slug>/` gefunden, da der Content-Typ beim Aufruf evtl. nicht bekannt ist.

## Schritt 1: Daten ziehen (wenn GSC verbunden und Seite live)

Wenn die Seite bereits live ist und der GSC-MCP verbunden ist:

- `mcp__mcpwerk-gsc__get_search_by_page_query` für die Seiten-URL (Property `[GSC_PROPERTY]`, Format typischerweise `https://[WEBSITE_DOMAIN]/`): zeigt die **echten Queries**, **CTR** und **Position**.
- Die stärkste reale Query als **Keyword-Anker** im Title verwenden (nicht raten, was die Seite *sollte*, sondern womit sie *tatsächlich* gefunden wird).
- Schwache CTR (< ~1 % bei vielen Impressionen) markiert die Seite als lohnenden Kandidaten.

Hinweis zum MCP: Das Template konfiguriert den Server `mcpwerk-gsc` in der `.mcp.json`, daher der Tool-Präfix `mcp__mcpwerk-gsc__...`. Heißt der GSC-Server im Projekt anders (z. B. als claude.ai-Connector), nur den Präfix entsprechend anpassen; die Tool-Namen dahinter sind identisch.

Wenn die Seite noch nicht live ist: Primärkeyword aus `seo.md` Keyword-Mapping nehmen.

## Die Formel

### Meta-Title (≤ 60 Zeichen, sonst schneidet Google ab)

```
[Primärkeyword/Entität]  [ | oder : ]  [Nutzen/Rolle]
```

- **Primärkeyword/Entität ganz vorne** (zählt für Ranking und Klick).
- Trenner `|` oder `:` konsistent.
- **Standardmäßig OHNE Marke im Title.** Vorher live prüfen, ob Theme/CMS den Site-Namen **automatisch** an den Title anhängt: falls ja, niemals zusätzlich manuell setzen (Dopplung). Falls nein: Für eine junge oder wenig bekannte Marke bringt eine Marken-Endung (Beispiel Sonnenwerk Solar GmbH: „| Sonnenwerk") kaum CTR, kostet aber wertvolle Zeichen, die besser ins Keyword oder den Nutzen fließen. Marken-Endung deshalb **nur**, wenn bewusst gewollt UND Platz bleibt, und dann **konsistent über die ganze Site**, nicht mal mit, mal ohne.
- Echte Umlaute, Marke und Namen exakt in der Schreibweise aus CLAUDE.md/Wissensbasis.

Beispiel (Sonnenwerk Solar GmbH, sonnenwerk-solar.de):

```
Solaranlage mit Speicher: Kosten & Ertrag 2026        (46 Zeichen)
```

### Meta-Description (≤ 155 Zeichen)

```
[konkreter Hook mit Keyword]  [Glyph-Pivot]  [pointierter Nutzen/Payoff].
```

- Hook vorne, Keyword natürlich eingebaut.
- Schluss mit einer **Pointe/Nutzen**, nicht mit einem Werbe-Imperativ.
- **Kein** „Jetzt kaufen!", kein Generic-AI („in der heutigen Zeit …"). Echte Umlaute.

Beispiel (Sonnenwerk Solar GmbH):

```
Was eine Solaranlage mit Speicher wirklich kostet ✓ echte Ertragsdaten ► rechnet sich oft ab Jahr 9.        (100 Zeichen)
```

### Glyph-System (Blickanker in der SERP)

- **✓** = ein **konkretes Feature oder ein Beleg** („ja, hat es / stimmt"). Beispiel: `✓ 25 Jahre Leistungsgarantie`.
- **►** (oder **→**) = der **Pivot zum Nutzen/Payoff**. Beispiel: `► Unabhängiger vom Strompreis`.
- **Maximal zwei Glyphen** pro Description, jedes mit **klarer, eigener Rolle**. Mehr wirkt spammy.
- **★ meiden** (spammy/Risiko).
- **Wichtig:** Google **strippt** Sonderzeichen manchmal und schreibt Descriptions oft um. Glyphen sind ein **Bonus**, nie tragend. Die Worte müssen auch ohne sie funktionieren.

### Ton je Content-Typ

| Content-Typ | Description-Ton |
|---|---|
| **Ratgeber** | „Anleitung / so geht's / erklärt" + Beruhigung |
| **Beratung** | „ehrlicher Vergleich / lohnt sich? / Preise" |
| **Produktbeschreibung** | konkretes Angebot („ab … €"), Feature mit ✓, Nutzen mit ► |
| **Kollektionsseite** | „Auswahl / Übersicht" + Sortiments-Stärke |
| **Personen-/Profilseite** | narrativer Bogen (z. B. „Vom … bis zum erfahrenen … ► ein Berufsleben für …") |
| **Landingpage** | Kampagnen-Nutzen, klarer Payoff |

## Schritt 2: Zwei Varianten erzeugen

Immer **1–2 Varianten** je Title und Description liefern, mit **Zeichenanzahl** dahinter, damit der User vergleichen und wählen kann. Eine Variante kann sachlich-klar sein, eine etwas pointierter.

## Schritt 3: Auswahl in seo.md schreiben

Die vom User gewählte Variante in die `seo.md`-Sektion **Meta-Tags** eintragen (Title, Description, Länge). Alte Werte ersetzen.

## Schritt 4: Changelog

Eine Zeile in `changelog/YYYY-MM-DD.md`: welche Seite, alte vs. neue Meta, ggf. CTR-Ausgangswert aus GSC.

## QA-Checkliste

- [ ] Meta-Title ≤ 60 Zeichen, Primärkeyword/Entität vorne, **standardmäßig keine Marken-Endung** (nur bewusst gesetzt und site-weit konsistent, keine Dopplung mit Theme/CMS-Automatik)
- [ ] Meta-Description ≤ 155 Zeichen
- [ ] Maximal 2 Glyphen, jedes mit eigener Rolle (✓ Feature, ► Payoff)
- [ ] Kein Werbe-Imperativ, keine Generic-AI-Floskel
- [ ] Echte Umlaute (ä/ö/ü/ß), Marke und Namen exakt in der Schreibweise aus CLAUDE.md/Wissensbasis
- [ ] Description-Text funktioniert auch, falls Google die Glyphen strippt
- [ ] Bei Live-Seiten: Keyword-Anker stammt aus der echten GSC-Query, nicht geraten
- [ ] Mindestens 1 Alternativ-Variante zur Auswahl angeboten

## Hinweise (ehrlich)

- Der **Title leistet den Großteil der CTR-Arbeit**; die Description wird von Google häufig umgeschrieben. Aufwand entsprechend gewichten, Title zuerst.
- Eine bessere Meta hebt nur die **CTR der vorhandenen Impressionen**. Steht eine Seite auf Seite 2/3, ist die Ranking-Arbeit (Content, interne Links, Schema) der größere Hebel; Meta ergänzt, ersetzt sie nicht.
