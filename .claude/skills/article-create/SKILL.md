---
name: article-create
description: Legt einen neuen Artikel/eine neue Seite in der projekt-typischen Pflicht-Struktur an. Garantiert die Pflicht-Ordnerstruktur unter artikel/content/<content-typ>/<slug>/ mit den vier Pflichtdateien artikel.md, seo.md, <cms>.html (CMS-Dateiname laut projekt-eigener CLAUDE.md, z.B. wordpress.html, shopify.html, webflow.html) und artikel.docx. Nutze diesen Skill IMMER, wenn der User einen neuen Artikel, eine neue Seite, einen neuen Beitrag, eine neue Landingpage oder neuen Content fuer eine URL anlegen moechte. Trigger auch bei "neuer Artikel", "Artikel erstellen", "Seite anlegen", "Content fuer /url/", "Beitrag fuer [Thema]", "neue Leistungsseite", "Landingpage erstellen", "SEO-Artikel erstellen". Laeuft zusammen mit dem seo-content-writer-Skill, wenn der Inhalt SEO-optimiert sein soll: der seo-content-writer liefert den Text und die Meta-Tags, dieser Skill sorgt dafuer, dass alles in die richtige Struktur einsortiert wird. Vor jedem Schreibvorgang ist wissensbasis/tone-of-voice.md zu laden und der Voice-Block aus Abschnitt 16 als Stil-Vorgabe an alle Schreib-Skills mitzugeben; nach dem Schreibvorgang wird die Checkliste aus Abschnitt 15 angewandt. Ohne Voice-Vorbereitung kein Text.
---

# article-create

Legt einen neuen Artikel-Ordner unter `artikel/content/<content-typ>/<slug>/` an und erzeugt die vier Pflichtdateien gemäß der Artikel-Ordnerkonvention aus der projekt-eigenen `CLAUDE.md`.

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
| `seo-page-research` | **Vorgelagerter Recherche-Skill (6 Phasen: 1, 2, 2b, 3, 4, 5).** Liefert das verbindliche Briefing `seo/briefing-<slug>.md` + `seo/cluster-<slug>.csv` + `seo/cannibalization-<slug>.md`. Ist die primäre Input-Quelle für diesen Skill (sofern im Projekt vorhanden). |
| `seo-content-writer` * | Liefert den SEO-optimierten Fließtext + Meta-Vorschläge. Output → `artikel.md` + `seo.md` |
| `meta-tags-ctr` */ `meta-tags-optimizer` * | Erzeugt CTR-optimierte Title/Description. Output → `seo.md`. Im Template bevorzugt: `brand-meta-ctr` (Hausstil-Version) |
| `schema-markup-generator` * | Erzeugt JSON-LD für FAQ/Service/LocalBusiness/Product. Output → `seo.md` |
| `content-html-formatter` | Erzeugt `<cms>.html` aus `artikel.md` und `wissensbasis/html-elemente.md` |
| `keyword-research` *, `serp-analysis` *, `competitor-analysis` * | Generische Einzel-Recherche-Skills (Fallback, wenn kein `seo-page-research`-Briefing vorliegt) → `seo.md` |

\* **Optionale Plugin-Skills** (z.B. aus dem `seo-geo-claude-skills`-Plugin) – nicht Teil dieses Templates. Sind sie nicht installiert, schreibt dieser Skill die Inhalte selbst nach den Templates unten und den Regeln der `tone-of-voice.md`; die Struktur-Garantie dieses Skills hängt an keinem Plugin.

**Durchgängiger Workflow (Standardfall):**

```
seo-page-research  →  article-create  →  content-html-formatter
(Briefing in seo/)    (4 Pflichtdateien)   (<cms>.html)
```

**Reihenfolge:**
- **Wenn ein Briefing `seo/briefing-<slug>.md` existiert** (Normalfall nach `seo-page-research`): Dieses Briefing ist die **verbindliche Quelle**. Siehe Schritt 0 Punkt 5 „Briefing-First".
- **Wenn der User „SEO-Artikel" ohne vorheriges Briefing sagt:** zuerst `seo-page-research` empfehlen/ausführen, sonst die generischen Recherche-Skills, dann `seo-content-writer`, dann diesen Skill.
- **Wenn der User „leeren Artikel anlegen" sagt:** nur diesen Skill, Templates mit `[TODO]` befüllen.

**Voice-Pflicht:** Bei jedem Aufruf eines Schreib-Skills (`seo-content-writer`, `meta-tags-ctr`, `meta-tags-optimizer`, `schema-markup-generator`-FAQ-Antworten) wird der Voice-Block aus `wissensbasis/tone-of-voice.md` Abschnitt 16 als Stil-Vorgabe mitgegeben. Ohne Voice-Block driftet der Output in Generic-AI-Sprache, was vom Kunden in der Regel abgelehnt wird.

---

## Voraussetzungen

Der User liefert:
1. **URL oder Slug** der Seite (z.B. `/leistungen/produkt-x/` → Slug `produkt-x`)
2. **Content-Typ** laut Content-Typ→Ordner-Tabelle in der projekt-eigenen `CLAUDE.md` (z.B. Ratgeber, Beratung, Produktbeschreibung, Kollektionsseite, Profilseite, Landingpage). Er steuert die Struktur in `artikel.md` **und** das Ordner-Segment `<content-typ>` unter `artikel/content/`.
3. **Autor-Slug** (Pfad: `wissensbasis/autoren/<slug>.md`). Wenn der User keinen Autor nennt:
   - Bei nur einem aktiven Autor im Verzeichnis: still diesen verwenden und im finalen Bericht vermerken
   - Bei mehreren aktiven Autoren: gezielt nachfragen, wer dieses Stück verantwortet
   - Bei keinem passenden Eintrag: STOP, erst eine neue Autoren-Datei nach dem Schema in `wissensbasis/autoren/README.md` anlegen, dann weiter
4. **Optional:** Bestehender Text/Markdown, oder Inputs für `seo-content-writer`

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
   - **Domain & URL-Schema** für Canonical und interne Links (z.B. `https://www.sonnenwerk-solar.de`).
   - **Anrede & Tonalität** als Schnellinfo (Voice-Datei bleibt die ausführliche Referenz).
   - **Wissensbasis-Datei mit Seitenstruktur/URL-Liste** (z.B. `wissensbasis/website-struktur.md` oder `wissensbasis/<kurzform>-seiten.md`) als Quelle für interne Verlinkung.

3. Wenn der CMS-Dateiname nicht eindeutig in CLAUDE.md steht: **Default `cms.html`** verwenden und in der finalen Zusammenfassung an den User vermerken („CMS-Dateiname war nicht in CLAUDE.md gesetzt, habe `cms.html` verwendet. Bitte einmal eintragen, falls anders gewünscht.").

4. **Autor-Datei laden:** `wissensbasis/autoren/<slug>.md` für den gewählten Autor lesen. Daraus für die spätere `seo.md` und `<cms>.html` übernehmen:
   - `full_name` für Schema.org-Author + Quellen + Methodology
   - `display_name`, `role`, `avatar_initials`, Bio-Kurz für die Author-Card (CMS-Element laut `wissensbasis/html-elemente.md`) im CMS-HTML
   - `profile_url` für Author-Card-Link und Schema.org Person.url
   Wenn die Datei fehlt, obwohl das Projekt Autoren-Attribution nutzt: STOP und User bitten, die Autoren-Datei nach `wissensbasis/autoren/README.md`-Schema anzulegen. Projekte ohne `wissensbasis/autoren/` überspringen diesen Schritt komplett (kein Autor-Block, keine Author-Card).

5. **Briefing-First (Pflicht-Check):** Prüfen, ob ein Briefing des `seo-page-research`-Skills existiert. Suchpfad: `seo/briefing-<slug>.md` (Slug aus URL/Topic ableiten). Auch `seo/cluster-<slug>.csv` und `seo/cannibalization-<slug>.md` mitnehmen, falls vorhanden.
   - **Wenn ein Briefing existiert:** Es ist die **verbindliche Quelle**. Die H1/H2/H3-Outline, Meta-Title, Meta-Description, Keyword-Mapping, Internal-Linking-Plan, Schema-Empfehlung, Wordcount-Range und der Projekt-Content-Typ werden daraus übernommen — sie überschreiben die generischen `artikel.md`-Templates und die `[TODO]`-Felder im `seo-template.md`. Mapping siehe Schritt 4 „Briefing → seo.md/artikel.md".
     - **Briefing-First ⇒ Subfolder-First:** Der im Briefing genannte **Projekt-Content-Typ** bestimmt das Ordner-Segment `<content-typ>` (via Content-Typ→Ordner-Tabelle in `CLAUDE.md`). Er hat Vorrang vor einer abweichenden User-Angabe.
     - **Achtung:** Die Briefing-Dateisuche bleibt rein **SLUG-basiert** (`seo/briefing-<slug>.md`). Der Content-Typ steckt NICHT im Dateinamen in `seo/`.
   - **Wenn kein Briefing existiert:** dem User `seo-page-research` für eine saubere Recherche empfehlen. Wenn der User ohne Briefing fortfahren will, mit den Templates + `[TODO]` arbeiten und das im Schlussbericht vermerken.
   - **Slug-Konsistenz:** Der Artikel-Ordner `artikel/content/<content-typ>/<slug>/` MUSS denselben Slug tragen wie das Briefing, damit die Verknüpfung über alle Skills hält.
   - **Recherche-Artefakte umziehen (nach Schritt 2):** Sobald der Artikel-Ordner existiert, die seitenbezogenen Recherche-Dateien aus `seo/` dorthin **verschieben** (nicht kopieren): `seo/briefing-<slug>.md`, `seo/cluster-<slug>.csv`, `seo/cannibalization-<slug>.md`, `seo/source-review-<slug>.md` → `artikel/content/<content-typ>/<slug>/`. Grund: `seo/` ist laut CLAUDE.md nur für projektweite, NICHT seitenbezogene SEO-Arbeit (Contentplan etc.). Die Recherche-Artefakte gehören zum Artikel. In `seo/` landen sie nur, weil der Artikel-Ordner zum Recherchezeitpunkt (seo-page-research) noch nicht existierte.

### Schritt 1: Slug UND Content-Typ-Segment ermitteln

- URL → Slug: letztes Pfadsegment ohne Slashes (z.B. `https://www.sonnenwerk-solar.de/leistungen/photovoltaik-wartung/` → `photovoltaik-wartung`)
- Slug-Regeln: nur Kleinbuchstaben, Zahlen, Bindestriche. Keine Umlaute, keine Unterstriche, keine Leerzeichen.
- **Neben dem Slug wird auch das `<content-typ>`-Ordnersegment abgeleitet.** Quelle in dieser Reihenfolge: (1) Briefing (Projekt-Content-Typ, Briefing-First ⇒ Subfolder-First, siehe Schritt 0 Punkt 5), (2) explizite User-Angabe, (3) URL-Präfix via die **Taxonomie-Brücke in `CLAUDE.md`** (dort stehen die projekt-typischen Pfad-Präfixe, z.B. `/ratgeber/` oder `/blog/` → Ratgeber). Das konkrete Segment ergibt sich aus der **Content-Typ→Ordner-Tabelle in `CLAUDE.md`** (z.B. Ratgeber → `ratgeber/`, Beratung → `beratung/`, Produktbeschreibung → `produkte/`, Kollektionsseite → `kollektionen/`, Profilseite → `profile/`, Landingpage → `landingpages/`). Segment-Regeln: kleingeschrieben, umlautfrei.
- **Niemals** einen bestehenden Ordner unter `artikel/content/<content-typ>/<slug>/` überschreiben. Wenn der Ordner schon existiert: STOP und User fragen, ob überschrieben oder verworfen werden soll.

### Schritt 2: Ordner anlegen

Ordner inkl. Zwischenordner anlegen (`mkdir -p`-Semantik, legt das `<content-typ>`-Zwischensegment mit an, falls es noch nicht existiert):

```
artikel/content/<content-typ>/<slug>/
```

Der Overwrite-Check aus Schritt 1 bezieht sich auf den vollständigen Pfad `<content-typ>/<slug>`.

### Schritt 3: artikel.md anlegen

`artikel.md` enthält **ausschließlich den reinen Inhalt** (H1 + Fließtext + H2/H3 + interne Markdown-Links). KEINE Meta-Daten, KEIN Frontmatter, KEINE Tabellen mit Title/Description.

**Voice-Modus pro Content-Typ** (siehe `tone-of-voice.md`):
- **Portfolio-/Blog-Beitrag:** Erzähl-Modus – längere Absätze, Setting → Stimmung → Bedeutung, persönliche Anekdoten und konkrete Beobachtungen
- **Leistungs-/Produktseite:** Service-Modus – kurze Absätze, Sub-Heading + 2-4 Sätze, gleiches Vokabular wie Erzähl-Modus aber gestraffter
- **Landingpage:** Service-Modus mit klarerem CTA-Fokus

In allen Modi gleich: Anrede laut `tone-of-voice.md`, Perspektive laut `tone-of-voice.md`, Marken-Vokabular eingebunden, CTAs ausschließlich aus dem CTA-Pool.

**Template je Content-Typ** – Zuordnung zur Sechser-Taxonomie: **Ratgeber/Beratung** → Template „Portfolio-/Blog-Beitrag" (Wortzahl dann laut Content-Typen-Tabelle der CLAUDE.md, z.B. Ratgeber 1500–3000); **Produktbeschreibung/Kollektionsseite/Profilseite** → Template „Leistungs-/Produktseite" (Wortzahl laut Tabelle, z.B. Produktbeschreibung 300–800); **Landingpage** → Template „Landingpage". Die Wortzahl-Angaben der Projekt-CLAUDE.md haben immer Vorrang vor den Template-Überschriften.

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

Vorlage aus `references/seo-template.md` lesen und in `artikel/content/<content-typ>/<slug>/seo.md` ablegen. Alle Pflicht-Sektionen befüllen, soweit Daten vorhanden. Fehlende Werte als `[TODO]` markieren. Domain und URL aus `CLAUDE.md` übernehmen.

**Mapping „Briefing → seo.md / artikel.md"** (wenn `seo/briefing-<slug>.md` aus `seo-page-research` existiert, siehe Schritt 0 Punkt 5):

| Briefing-Sektion | Ziel |
|---|---|
| 1. Strategische Übersicht → Cluster (Primary/Secondary/Supporting) | `seo.md` Keyword-Mapping |
| 2. SERP-Analyse → Top-3-Konkurrenz, SERP-Composition | `seo.md` Konkurrenzanalyse + GSC-Performance |
| 3. Content-Outline → Meta-Title, Meta-Description, URL-Slug | `seo.md` Meta-Tags + URL & Canonical |
| 3. Content-Outline → H1 + H2/H3-Struktur | `artikel.md` Überschriften-Gerüst **und** `seo.md` H-Hierarchie |
| 3. Content-Outline → Direct-Answer-Paragraph | `artikel.md` erster Absatz unter H1 |
| 4. GEO-Pflicht → AI-Overview-Checkliste | `artikel.md` Schreibvorgaben + QA (GEO-Block, siehe QA-Checkliste) |
| 4. GEO-Pflicht → Schema-Empfehlung | `seo.md` JSON-LD |
| 5. Internal-Linking-Plan | `seo.md` Interne Verlinkung + echte Links in `artikel.md` |
| 6. EEAT → Autor | `seo.md` Autor-Block (Slug aus `wissensbasis/autoren/`) |
| 7. Cannibalization-Status | `seo.md` Umsetzungs-Checkliste (Konflikte vor Go-Live lösen) |
| 8. Konkurrenz besser machen | Schreib-Leitplanken für `artikel.md` (Tiefe, Tabelle, FAQ) |
| 9. Quellen & Research-Basis (Phase 2b) | `artikel.md` Faktenbasis (nur Faktenbasis-Quellen verwenden) |
| 10. Action-Plan | `seo.md` Umsetzungs-Checkliste |

Die im Briefing genannten FAQ-/PAA-Fragen werden in `artikel.md` als FAQ-Sektion umgesetzt (wortgleich, wo Phase-2-PAA verifiziert sind) und später vom `content-html-formatter` als FAQ-Element (laut `wissensbasis/html-elemente.md`) mit FAQPage-Schema gerendert.

**Pflicht-Sektionen in seo.md:**
- URL & Canonical
- Meta-Tags (Title, Description, OG)
- H-Hierarchie
- Keyword-Mapping (Primär, Lokal/Branche, Informational)
- Interne Verlinkung (Tabelle Ankertext → Ziel-URL, gegen `wissensbasis/website-struktur.md` validiert)
- JSON-LD (FAQPage / Service / LocalBusiness / Product / Article, je nach Content-Typ)
- **Autor-Block:** Slug + `full_name` + `display_name` + `role` + `profile_url` aus `wissensbasis/autoren/<slug>.md` übernehmen. Im Article-JSON-LD wird `full_name` als `author.name` und `profile_url` als `author.url` gesetzt.
- Bilder & Medien (inkl. Alt-Texte)
- Umsetzungs-Checkliste
- Quellenangabe + Stand

### Schritt 5: <cms>.html anlegen

Der CMS-Dateiname stammt aus `CLAUDE.md` (siehe Schritt 0). Zwei Optionen:

**A) `wissensbasis/html-elemente.md` ist gefüllt:**
→ Skill `content-html-formatter` aufrufen mit `artikel.md` als Input. Output direkt nach `artikel/content/<content-typ>/<slug>/<cms>.html` schreiben. Der Formatter übernimmt dabei auch die **Bild-/Video-Auswahl** (Kontext-basiert aus `wissensbasis/medien/`, sofern das Projekt einen Medien-Katalog führt), die **Aufbereitung** via `prepare-media.py` (Aufruf mit `--content-type <content-typ>`; skaliert/zugeschnitten nach `artikel/content/<content-typ>/<slug>/bilder/`) und bindet die Medien mit der Artikel-Bildklasse aus `wissensbasis/html-elemente.md` + DUMMY-URL ein. Die Auswahl wird in `seo.md` („Bilder & Medien") dokumentiert.

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

`references/create-docx.py` ausführen mit den Argumenten `<slug>`, Projekt-Root und dem Flag `--typ <content-typ>` (damit das Skript den typisierten Ordnerpfad findet). Das Skript:
- liest `artikel/content/<content-typ>/<slug>/artikel.md`
- liest `artikel/content/<content-typ>/<slug>/seo.md` (für die Deckblatt-Infos)
- liest projekt-spezifische Markenname/CTA-Konfiguration aus `CLAUDE.md`, falls vorhanden
- erzeugt `artikel/content/<content-typ>/<slug>/artikel.docx` mit Deckblatt + Meta-Tabelle + Inhalt + interne-Links-Tabelle

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
- Neuer Artikel `artikel/content/<content-typ>/<slug>/` angelegt (Content-Typ: …, Wörter: …)
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

- [ ] `artikel/content/<content-typ>/<slug>/` existiert (inkl. korrektem `<content-typ>`-Zwischensegment)
- [ ] `artikel.md` existiert und enthält H1 + Inhalt
- [ ] `seo.md` existiert und enthält alle Pflicht-Sektionen (auch wenn manche `[TODO]` sind)
- [ ] `<cms>.html` existiert (entweder echter HTML-Output oder Platzhalter mit TODO-Kommentar). Dateiname stimmt mit dem in `CLAUDE.md` festgelegten CMS-Dateinamen überein.
- [ ] `artikel.docx` existiert und ist > 0 Bytes
- [ ] Slug entspricht URL-Slug (Kleinbuchstaben, Bindestriche, keine Umlaute/Unterstriche)
- [ ] **Recherche-Artefakte umgezogen:** Falls ein `seo-page-research`-Briefing zugrunde lag, liegen `briefing-<slug>.md`, `cluster-<slug>.csv`, `cannibalization-<slug>.md`, `source-review-<slug>.md` jetzt im Artikel-Ordner `artikel/content/<content-typ>/<slug>/` (nicht mehr in `seo/`). `seo/` enthält nur noch projektweite Dateien.

### Inhalt

- [ ] `artikel.md` enthält **keine** Meta-Daten am Anfang (kein Frontmatter, keine Title/Description-Tabelle)
- [ ] H1 in `artikel.md` ist genau einmal vorhanden
- [ ] **Voice-Check:** Checkliste aus `wissensbasis/tone-of-voice.md` Abschnitt 15 angewandt (Anrede, Perspektive, Marken-Vokabular, CTA aus Pool, Anekdoten, Em-Dash-Regel, echte Umlaute, Markenname konsistent)
- [ ] Alle internen Links in `artikel.md` zeigen auf existierende Pfade aus `wissensbasis/website-struktur.md` (oder analoger Datei laut CLAUDE.md)

### GEO-Check (Pflicht, wenn ein `seo-page-research`-Briefing existiert)

Die „AI-Overview-Optimization-Checklist" aus dem Briefing (`seo/briefing-<slug>.md`, Abschnitt 4) gegen `artikel.md` durchgehen:

- [ ] **Direct-Answer-Paragraph** (40–60 Wörter) direkt unter H1
- [ ] **H2/H3 als Fragen**, gespiegelt aus den Phase-2-PAA des Briefings
- [ ] **Verifizierte PAA wortgleich** als FAQ-Fragen übernommen (soweit Phase 2 sie geliefert hat)
- [ ] **Fact-Density:** mind. 1 belegbare Statistik / benannte Quelle pro 150–200 Wörter
- [ ] **Quellen mit Datum** inline genannt
- [ ] **Mind. 1 Experten-Zitat** mit Credentials (für das Experten-Zitat-Element laut `wissensbasis/html-elemente.md`)
- [ ] **Wordcount** in der Briefing-Range
- [ ] **Schema-Empfehlung** aus Briefing in `seo.md` übernommen
- [ ] **Cannibalization-Hinweise** aus `seo/cannibalization-<slug>.md` beachtet (z.B. kein Buy-CTA-Hero, wenn er mit einer bestehenden Produktseite kollidiert)

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

1. **Niemals außerhalb von `artikel/content/<content-typ>/<slug>/` ablegen.** Das flache `artikel/content/<slug>/` (ohne `<content-typ>`-Zwischensegment) ist die **alte Struktur** und wird nur noch als tolerierter Rückwärts-Fall bei bestehenden Artikeln akzeptiert, für Neuanlagen NICHT mehr verwendet. Ebenfalls nicht in `artikel/<slug>/` (alte Struktur), `seo/`, `tmp/` oder anderen Ordnern ablegen.
2. **Niemals andere Dateinamen verwenden.** Genau diese vier: `artikel.md`, `seo.md`, `<cms>.html` (CMS-Dateiname laut CLAUDE.md), `artikel.docx`. Keine Varianten wie `index.md`, `content.md`, `meta.md`, `final.docx`.
3. **Niemals Meta-Daten in `artikel.md`.** Die gehören ausschließlich in `seo.md`. Wenn der User Meta-Daten reinpasten will, sauber auf beide Dateien aufteilen.
4. **Slug ist URL-Slug.** Wenn die finale URL noch nicht klar ist, vorher mit dem User abstimmen, nicht raten.
5. **Bestehende Ordner nie still überschreiben.** Bei Konflikt nachfragen.
6. **Schreibregeln aus `CLAUDE.md` und Stimm-Spezifikation aus `wissensbasis/tone-of-voice.md`** gelten für alle erzeugten Inhalte: echte Umlaute, konsistenter Markenname, Anrede & Perspektive aus Voice-Datei, Marken-Vokabular, Em-Dash-Regel laut Voice, kein Werbesprech.
7. **CMS-Dateiname kommt aus `CLAUDE.md`.** Niemals raten oder hartkodieren. Wenn die Information fehlt, Default `cms.html` und User-Hinweis.

---

## Kombination mit anderen Skills

### „SEO-Artikel über X erstellen" (Standard-Workflow)

Empfohlene Reihenfolge:
1. **`seo-page-research`** → 6-Phasen-Recherche (Phasen 1, 2, 2b, 3, 4, 5), erzeugt `seo/briefing-<slug>.md` + `seo/cluster-<slug>.csv` + `seo/cannibalization-<slug>.md` + `seo/source-review-<slug>.md`
2. **`article-create`** (dieser Skill) → liest das Briefing (Schritt 0 Punkt 5), legt `artikel/content/<content-typ>/<slug>/` mit den vier Pflichtdateien an, mappt Briefing → `seo.md`/`artikel.md` (Schritt 4)
3. **`content-html-formatter`** → erzeugt `<cms>.html` aus `artikel.md` (wird in Schritt 5 dieses Skills aufgerufen)

Optional dazwischen, wenn ein Detail fehlt:
- `brand-meta-ctr` (bzw. Plugin-Skill `meta-tags-ctr`) → schärft Title/Description, falls das Briefing dort schwach ist
- `schema-markup-generator` (Plugin, falls installiert) → ergänzt JSON-LD über die Briefing-Empfehlung hinaus

Wenn **kein** Briefing existiert (Schnellfall ohne vorherige Recherche): Text + Meta über den `seo-content-writer`-Plugin-Skill, falls installiert – sonst schreibt dieser Skill selbst nach Template + `tone-of-voice.md`. Vorher dem User `seo-page-research` empfehlen.

### „Leeren Artikel-Ordner anlegen"

Nur `article-create` ausführen, mit minimalen Templates und allen Inhalten als `[TODO]`.

### „Bestehende Seite extrahieren und in Struktur überführen"

1. Seiteninhalt per WebFetch holen (bei JS-lastigen Seiten: manuell aus dem Browser kopieren)
2. **`article-create`** mit dem extrahierten Text als Input für `artikel.md`. Im `seo.md` IST-Stand und SEO-Probleme dokumentieren.
