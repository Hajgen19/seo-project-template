---
name: article-create
description: Legt einen neuen Artikel/eine neue Seite in der projekt-typischen Pflicht-Struktur an. Garantiert die Pflicht-Ordnerstruktur unter artikel/content/<slug>/ mit den vier Pflichtdateien artikel.md, seo.md, <cms>.html (CMS-Dateiname laut projekt-eigener CLAUDE.md, z.B. wordpress.html, shopify.html, webflow.html) und artikel.docx. Nutze diesen Skill IMMER, wenn der User einen neuen Artikel, eine neue Seite, einen neuen Beitrag, eine neue Landingpage oder neuen Content fuer eine URL anlegen moechte. Trigger auch bei "neuer Artikel", "Artikel erstellen", "Seite anlegen", "Content fuer /url/", "Beitrag fuer [Thema]", "neue Leistungsseite", "Landingpage erstellen", "SEO-Artikel erstellen". Laeuft zusammen mit dem seo-content-writer-Skill, wenn der Inhalt SEO-optimiert sein soll: der seo-content-writer liefert den Text und die Meta-Tags, dieser Skill sorgt dafuer, dass alles in die richtige Struktur einsortiert wird. Vor jedem Schreibvorgang ist wissensbasis/tone-of-voice.md zu laden und der Voice-Block aus Abschnitt 16 als Stil-Vorgabe an alle Schreib-Skills mitzugeben; nach dem Schreibvorgang wird die Checkliste aus Abschnitt 15 angewandt. Ohne Voice-Vorbereitung kein Text.
---

# article-create

Legt einen neuen Artikel-Ordner unter `artikel/content/<slug>/` an und erzeugt die vier Pflichtdateien gemäß der Artikel-Ordnerkonvention aus der projekt-eigenen `CLAUDE.md`.

## Warum dieser Skill existiert

Jeder Artikel im Projekt muss in der gleichen Struktur abgelegt werden, damit:
- `artikel.docx` jederzeit aus `artikel.md` neu generierbar ist
- die CMS-fertige HTML-Datei aus `artikel.md` über den `content-html-formatter` ableitbar ist
- die SEO-Daten zentral in `seo.md` liegen und nicht im Text verstreut sind
- spätere Audits (Title-Bulk, Meta-Bulk, Redirect-Audit) auf einer einheitlichen Struktur laufen können

Ohne diesen Skill landen Artikel in chaotischen Unterordnern mit unterschiedlichen Dateinamen. Der Skill standardisiert das.

## Zusammenspiel mit anderen Skills

| Skill | Rolle |
|---|---|
| `seo-content-writer` | Liefert den SEO-optimierten Fließtext + Meta-Vorschläge. Output → `artikel.md` + `seo.md` |
| `meta-tags-ctr` / `meta-tags-optimizer` | Erzeugt CTR-optimierte Title/Description. Output → `seo.md` |
| `schema-markup-generator` | Erzeugt JSON-LD für FAQ/Service/LocalBusiness/Product. Output → `seo.md` |
| `content-html-formatter` | Erzeugt `<cms>.html` aus `artikel.md` und `wissensbasis/html-elemente.md` |
| `keyword-research`, `serp-analysis`, `competitor-analysis` | Liefern Recherche → `seo.md` (Keyword-Mapping, Konkurrenzanalyse) |

**Reihenfolge:** Wenn der User „SEO-Artikel" sagt, zuerst Recherche-Skills (sofern Daten fehlen), dann `seo-content-writer` für Text und Meta, dann diesen Skill für die Ablage. Wenn der User nur „leeren Artikel anlegen" sagt, nur diesen Skill ausführen und Templates befüllen.

**Voice-Pflicht:** Bei jedem Aufruf eines Schreib-Skills (`seo-content-writer`, `meta-tags-ctr`, `meta-tags-optimizer`, `schema-markup-generator`-FAQ-Antworten) wird der Voice-Block aus `wissensbasis/tone-of-voice.md` Abschnitt 16 als Stil-Vorgabe mitgegeben. Ohne Voice-Block driftet der Output in Generic-AI-Sprache, was vom Kunden in der Regel abgelehnt wird.

---

## Voraussetzungen

Der User liefert:
1. **URL oder Slug** der Seite (z.B. `/leistungen/produkt-x/` → Slug `produkt-x`)
2. **Content-Typ:** Portfolio-/Blog-Beitrag, Leistungsseite, Produktseite oder Landingpage (steuert Struktur in `artikel.md`)
3. **Optional:** Bestehender Text/Markdown, oder Inputs für `seo-content-writer`

Wenn etwas fehlt, **gezielt nachfragen** statt raten.

---

## Ablauf

### Schritt 0: Voice & CMS-Konfiguration laden (Pflicht vor jedem Schreibvorgang)

Vor jedem `artikel.md`-Schreibvorgang **muss** Folgendes geladen worden sein:

1. **`wissensbasis/tone-of-voice.md`** komplett lesen, falls nicht in den letzten Turns bereits geschehen.
   - Prägen: Voice-Prinzipien, Vokabular-Cluster, wiederkehrende Marken-Sätze, CTA-Pool, No-Gos.
   - Wenn ein Schreib-Skill aufgerufen wird: den **Schnell-Referenz-Block aus Abschnitt 16** der Voice-Datei wörtlich als Stil-Vorgabe an den Skill mitgeben.
   - Wenn `tone-of-voice.md` fehlt oder leer ist: STOP. Erst die Voice-Datei anlegen (siehe `project-setup`-Skill, Schritt 5g), dann weiter.

2. **`CLAUDE.md`** im Projekt-Root lesen, insbesondere:
   - **CMS-Dateiname** für den dritten Pflicht-File (z.B. `wordpress.html`, `shopify.html`, `webflow.html`, `cms.html`). Steht entweder in der „Über"-Sektion, in der „Quellenpfade"-Baumstruktur oder explizit als Zeile `**CMS-Dateiname:** <name>.html`.
   - **Domain & URL-Schema** für Canonical und interne Links (z.B. `https://www.beispielkunde.de`).
   - **Anrede & Tonalität** als Schnellinfo (Voice-Datei bleibt die ausführliche Referenz).
   - **Wissensbasis-Datei mit Seitenstruktur/URL-Liste** (z.B. `wissensbasis/<kurzform>-website-struktur.md` oder `wissensbasis/<kurzform>-seiten.md`) als Quelle für interne Verlinkung.

3. Wenn der CMS-Dateiname nicht eindeutig in CLAUDE.md steht: **Default `cms.html`** verwenden und in der finalen Zusammenfassung an den User vermerken („CMS-Dateiname war nicht in CLAUDE.md gesetzt, habe `cms.html` verwendet. Bitte einmal eintragen, falls anders gewünscht.").

### Schritt 1: Slug ermitteln

- URL → Slug: letztes Pfadsegment ohne Slashes (z.B. `https://www.beispielkunde.de/leistungen/produkt-x/` → `produkt-x`)
- Slug-Regeln: nur Kleinbuchstaben, Zahlen, Bindestriche. Keine Umlaute, keine Unterstriche, keine Leerzeichen.
- **Niemals** einen bestehenden Ordner unter `artikel/content/<slug>/` überschreiben. Wenn der Ordner schon existiert: STOP und User fragen, ob überschrieben oder verworfen werden soll.

### Schritt 2: Ordner anlegen

```
artikel/content/<slug>/
```

### Schritt 3: artikel.md anlegen

`artikel.md` enthält **ausschließlich den reinen Inhalt** (H1 + Fließtext + H2/H3 + interne Markdown-Links). KEINE Meta-Daten, KEIN Frontmatter, KEINE Tabellen mit Title/Description.

**Voice-Modus pro Content-Typ** (siehe `tone-of-voice.md`):
- **Portfolio-/Blog-Beitrag:** Erzähl-Modus – längere Absätze, Setting → Stimmung → Bedeutung, persönliche Anekdoten und konkrete Beobachtungen
- **Leistungs-/Produktseite:** Service-Modus – kurze Absätze, Sub-Heading + 2-4 Sätze, gleiches Vokabular wie Erzähl-Modus aber gestraffter
- **Landingpage:** Service-Modus mit klarerem CTA-Fokus

In allen Modi gleich: Anrede laut `tone-of-voice.md`, Perspektive laut `tone-of-voice.md`, Marken-Vokabular eingebunden, CTAs ausschließlich aus dem CTA-Pool.

**Template je Content-Typ:**

#### Portfolio-/Blog-Beitrag (500–1500 Wörter)

```markdown
# [Story-Titel mit Kontext, z.B. "Projekt X für Kunde Y"]

[Intro im Erzähl-Modus. Setting + Anlass + erste Stimmung
in 2-3 Sätzen. Persönlicher Hook entsprechend tone-of-voice.md.]

## [Sektion 1, z.B. "Die Ausgangslage" / "Die Location" / "Das Briefing"]

[Konkrete Beobachtungen, kein Werbesprech.]

## [Sektion 2, z.B. "Der Verlauf" / "Die Umsetzung"]

[Erzählerischer Verlauf mit Marken-Vokabular und persönlichen Anekdoten.]

## [Sektion 3, z.B. "Highlights" / "Besondere Momente"]

[Pointierte Highlights, wo das Marken-Vokabular am stärksten greift.]

[CTA aus dem Pool laut tone-of-voice.md Abschnitt 10]

## Häufige Fragen

### [Frage in Kund:innen-Stimme, oft umgangssprachlich]
[Antwort beginnt mit Bestätigung und endet mit Reassurance.]

### [Frage 2]
[Antwort]

[Optional: Schlusssatz aus tone-of-voice.md, z.B. "Noch Fragen?"]
```

#### Leistungs-/Produktseite (800–2000 Wörter)

```markdown
# [Hauptkeyword, mit ggf. lokalem oder Branchen-Bezug]

[Intro im Service-Modus. 3-5 Sätze. Anrede & Perspektive laut tone-of-voice.md.
Kern-Versprechen + Stilbeschreibung in einem Satz, nicht in fünf.]

[Optional: 1 interner Link auf Galerie/Portfolio/Referenzen mit warmem Ankertext]

---

## Was diese Leistung besonders macht

### [USP 1]
[2-4 Sätze. Ich-/Wir-Perspektive laut tone-of-voice.md, klarer Nutzen.]

### [USP 2]
[Mit Belegsatz: konkrete Zahl, Erfahrung, Garantie, persönliches Versprechen.]

### [USP 3]
[…]

[…weitere USPs, 6-8 insgesamt für ausreichende Tiefe]

---

## [Sub-Themen / Pakete / Varianten]

### [Variante 1]
[Text + interner Link auf Referenz/Beispiel.]

### [Variante 2]
[…]

[CTA aus dem Pool laut tone-of-voice.md Abschnitt 10]

---

## Ablauf

### [Schritt 1]
[Standard-Wording aus tone-of-voice.md, falls vorhanden.]

### [Schritt 2]
[…]

### [Schritt 3]
[…]

### [Schritt 4]
[Galerie-/Lieferungsphase: passwortgeschützte Lieferform, Daueranspruch.]

---

## Häufige Fragen

### [Frage 1, in Kund:innen-Stimme]
[Antwort beginnt mit Bestätigung, endet mit Reassurance.]

[…mind. 6 Fragen für FAQPage Schema]

[Optional: Schlusssatz aus tone-of-voice.md]
```

#### Landingpage (500–1500 Wörter)

```markdown
# [Kampagnen-Headline]

[Intro mit klarem CTA-Bezug. Service-Modus, kurze Sätze, Marken-Stimme.]

## [Hauptargument 1]
[Text mit Marken-Vokabular.]

## [Hauptargument 2]
[Text mit Belegsatz oder Anekdote.]

[CTA aus dem Pool laut tone-of-voice.md Abschnitt 10]
```

**Wichtig zu allen Templates:**
- Die Platzhalter in eckigen Klammern `[...]` dürfen nicht im finalen Text stehen bleiben.
- CTAs ausschließlich aus dem Pool in `tone-of-voice.md` Abschnitt 10. Niemals „Jetzt buchen!", „Angebot anfordern" o.ä., außer der Pool gibt sie explizit her.
- FAQ-Sektionen schließen mit dem in `tone-of-voice.md` definierten Schlusssatz, falls vorhanden.

### Schritt 4: seo.md anlegen

Vorlage aus `references/seo-template.md` lesen und in `artikel/content/<slug>/seo.md` ablegen. Alle Pflicht-Sektionen befüllen, soweit Daten vorhanden. Fehlende Werte als `[TODO]` markieren. Domain und URL aus `CLAUDE.md` übernehmen.

**Pflicht-Sektionen in seo.md:**
- URL & Canonical
- Meta-Tags (Title, Description, OG)
- H-Hierarchie
- Keyword-Mapping (Primär, Lokal/Branche, Informational)
- Interne Verlinkung (Tabelle Ankertext → Ziel-URL, gegen `wissensbasis/<kurzform>-website-struktur.md` validiert)
- JSON-LD (FAQPage / Service / LocalBusiness / Product, je nach Content-Typ)
- Bild Alt-Texte
- Umsetzungs-Checkliste
- Quellenangabe + Stand

### Schritt 5: <cms>.html anlegen

Der CMS-Dateiname stammt aus `CLAUDE.md` (siehe Schritt 0). Zwei Optionen:

**A) `wissensbasis/html-elemente.md` ist gefüllt:**
→ Skill `content-html-formatter` aufrufen mit `artikel.md` als Input. Output direkt nach `artikel/content/<slug>/<cms>.html` schreiben.

**B) `wissensbasis/html-elemente.md` ist noch unvollständig (TODO-Marker):**
→ `<cms>.html` als Platzhalter anlegen mit Inhalt:

```html
<!--
  TODO: <cms>.html wird via content-html-formatter aus artikel.md erzeugt,
  sobald wissensbasis/html-elemente.md mit echten CMS-HTML-Bausteinen gefüllt ist.
  Siehe CLAUDE.md > Projektspezifische Skills > content-html-formatter.
-->
```

Den Status klar in der finalen Zusammenfassung an den User kommunizieren.

### Schritt 6: artikel.docx erzeugen

`references/create-docx.py` ausführen mit den Argumenten `<slug>` und Projekt-Root. Das Skript:
- liest `artikel/content/<slug>/artikel.md`
- liest `artikel/content/<slug>/seo.md` (für die Deckblatt-Infos)
- liest projekt-spezifische Markenname/CTA-Konfiguration aus `CLAUDE.md`, falls vorhanden
- erzeugt `artikel/content/<slug>/artikel.docx` mit Deckblatt + Meta-Tabelle + Inhalt + interne-Links-Tabelle

**Markdown-Support im artikel.md** (alles wird in echte Word-Elemente übersetzt, nicht als roher Markdown-Text):

| Markdown | Word-Element |
|---|---|
| `# / ## / ### / ####` | Headings 1–4 |
| `**fett**` | Run mit `bold=True` |
| `*kursiv*` | Run mit `italic=True` |
| `[text](url)` | Fett+unterstrichen, blaue Schrift, URL in eckigen Klammern dahinter |
| Pipe-Tabellen mit `|---|---|`-Separator | Echte Word-Tabelle (Style `Light Grid Accent 1`), Header fett, Inline-Formatierung in den Zellen |
| `- item` und `1. item` | `List Bullet` / `List Number`-Absätze |
| `> zitat` | Kursiv-Absatz mit deutschen Anführungszeichen |
| All-Caps-Zeile oder `-Marken-CTA-` | `[BUTTON] …`-Hinweis (zusätzlich konfigurierbar via `**CTA-Pattern:**` in CLAUDE.md) |

Leere Markdown-Zeilen sind reine Block-Trenner – sie werden NICHT als leere Word-Absätze eingefügt. Spacings sind kompakt voreingestellt (Body `space_after=4 Pt`, Headings 12/4 bis 6/2 Pt).

Abhängigkeit: `pip install python-docx`.

### Schritt 7: Tagesdatei in changelog/ aktualisieren

Eine Zeile in `changelog/YYYY-MM-DD.md` (heutiges Datum) ergänzen, z.B.:

```markdown
## Artikel
- Neuer Artikel `artikel/content/<slug>/` angelegt (Content-Typ: …, Wörter: …)
```

Falls die Tagesdatei noch nicht existiert: anlegen mit `# YYYY-MM-DD – Kurztitel`.

### Schritt 8: Voice-Check

`wissensbasis/tone-of-voice.md` Abschnitt 15 (Checkliste) für `artikel.md` durchgehen. Stichproben:
- Klingt der Eröffnungssatz nach einem typischen Marken-Hook und nicht nach einem Werbeintro?
- Steht in jedem zweiten Absatz mindestens ein Wort aus dem Marken-Vokabular-Cluster?
- CTAs aus dem Pool und nicht aus generischer Performance-Sprache?
- Anekdoten oder Bilder aus dem Marken-Pool eingebaut, wo es passt?
- Em-Dash-Regel laut Voice-Datei eingehalten (Limit pro 1.000 Wörter)?
- Anrede & Perspektive konsistent zur Voice-Vorgabe?

Bei Drift: betroffene Absätze umschreiben oder als TODO im finalen Bericht markieren.

### Schritt 9: Verifikation

Vor Abschluss: QA-Checkliste durchgehen. Wenn ein Punkt fehlt, korrigieren oder als TODO im finalen Bericht an den User markieren.

---

## QA-Checkliste

### Ordner und Dateien

- [ ] `artikel/content/<slug>/` existiert
- [ ] `artikel.md` existiert und enthält H1 + Inhalt
- [ ] `seo.md` existiert und enthält alle Pflicht-Sektionen (auch wenn manche `[TODO]` sind)
- [ ] `<cms>.html` existiert (entweder echter HTML-Output oder Platzhalter mit TODO-Kommentar). Dateiname stimmt mit dem in `CLAUDE.md` festgelegten CMS-Dateinamen überein.
- [ ] `artikel.docx` existiert und ist > 0 Bytes
- [ ] Slug entspricht URL-Slug (Kleinbuchstaben, Bindestriche, keine Umlaute/Unterstriche)

### Inhalt

- [ ] `artikel.md` enthält **keine** Meta-Daten am Anfang (kein Frontmatter, keine Title/Description-Tabelle)
- [ ] H1 in `artikel.md` ist genau einmal vorhanden
- [ ] **Voice-Check:** Checkliste aus `wissensbasis/tone-of-voice.md` Abschnitt 15 angewandt (Anrede, Perspektive, Marken-Vokabular, CTA aus Pool, Anekdoten, Em-Dash-Regel, echte Umlaute, Markenname konsistent)
- [ ] Alle internen Links in `artikel.md` zeigen auf existierende Pfade aus `wissensbasis/<kurzform>-website-struktur.md` (oder analoger Datei laut CLAUDE.md)

### Changelog

- [ ] Eintrag in `changelog/YYYY-MM-DD.md` ergänzt

### Zusammenfassung an den User

Am Ende immer berichten:
- Welcher Ordner angelegt wurde (Pfad)
- Welche Dateien erzeugt wurden
- Welcher Content-Typ verwendet wurde
- Wortanzahl des `artikel.md`
- Status `<cms>.html` (echtes HTML oder TODO-Platzhalter)
- Status `artikel.docx` (Größe in KB)
- Offene TODOs (z.B. Meta-Description fehlt, Bilder noch nicht referenziert, FAQ-Schema noch leer)

---

## Wichtige Regeln

1. **Niemals außerhalb von `artikel/content/<slug>/` ablegen.** Auch nicht in `artikel/<slug>/` (alte Struktur), `seo/`, `tmp/` oder anderen Ordnern.
2. **Niemals andere Dateinamen verwenden.** Genau diese vier: `artikel.md`, `seo.md`, `<cms>.html` (CMS-Dateiname laut CLAUDE.md), `artikel.docx`. Keine Varianten wie `index.md`, `content.md`, `meta.md`, `final.docx`.
3. **Niemals Meta-Daten in `artikel.md`.** Die gehören ausschließlich in `seo.md`. Wenn der User Meta-Daten reinpasten will, sauber auf beide Dateien aufteilen.
4. **Slug ist URL-Slug.** Wenn die finale URL noch nicht klar ist, vorher mit dem User abstimmen, nicht raten.
5. **Bestehende Ordner nie still überschreiben.** Bei Konflikt nachfragen.
6. **Schreibregeln aus `CLAUDE.md` und Stimm-Spezifikation aus `wissensbasis/tone-of-voice.md`** gelten für alle erzeugten Inhalte: echte Umlaute, konsistenter Markenname, Anrede & Perspektive aus Voice-Datei, Marken-Vokabular, Em-Dash-Regel laut Voice, kein Werbesprech.
7. **CMS-Dateiname kommt aus `CLAUDE.md`.** Niemals raten oder hartkodieren. Wenn die Information fehlt, Default `cms.html` und User-Hinweis.

---

## Kombination mit anderen Skills

### „SEO-Artikel über X erstellen"

Empfohlene Reihenfolge:
1. `keyword-research` → liefert Keyword-Set (falls noch nicht vorhanden)
2. `competitor-analysis` → liefert Konkurrenz-Snapshot
3. `seo-content-writer` → schreibt `artikel.md`-Inhalt + Meta-Vorschläge (mit Voice-Block aus Abschnitt 16 der `tone-of-voice.md`)
4. `meta-tags-ctr` (optional) → optimiert Title/Description
5. `schema-markup-generator` → erzeugt JSON-LD
6. **`article-create`** → legt Ordner an, sortiert alle Outputs in `artikel.md` + `seo.md`, erzeugt `artikel.docx`

### „Leeren Artikel-Ordner anlegen"

Nur `article-create` ausführen, mit minimalen Templates und allen Inhalten als `[TODO]`.

### „Bestehende Seite extrahieren und in Struktur überführen"

1. Puppeteer/Selenium-Extraktion (manuell oder via tmp/-Skript)
2. **`article-create`** mit dem extrahierten Text als Input für `artikel.md`. Im `seo.md` IST-Stand und SEO-Probleme dokumentieren.
