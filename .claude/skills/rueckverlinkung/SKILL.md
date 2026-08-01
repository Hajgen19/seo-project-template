---
name: rueckverlinkung
description: Rueckwirkende interne Verlinkung fuer [KUNDENNAME]. Nach dem Launch einer neuen Seite prueft dieser Skill alle BESTEHENDEN Seiten darauf, wo eine natuerlich klingende Verlinkung AUF die neue Seite passt, und fuegt sie nach Bestaetigung ein. Verwenden, wenn der User sagt "Rueckverlinkung", "rueckwirkende Verlinkung", "verlinke die neue Seite von den alten Seiten", "interne Links auf die neue Seite setzen", "interne Verlinkung nachziehen", "Bestandsseiten sollen auf X verlinken", "Backlinks intern" oder direkt nach article-create/Launch einer Seite die Bestandsverlinkung nachziehen will. NICHT fuer sitewide Link-Audits oder generelle Linkstruktur-Optimierung (dafuer internal-linking-optimizer, falls vorhanden); dieser Skill verlinkt gezielt EINE Zielseite aus dem Bestand heraus.
---

# rueckverlinkung

Schließt die Lücke der Content-Kette: `seo-page-research`/`article-create` planen die **ausgehenden** Links einer neuen Seite. Dieser Skill zieht die **eingehenden** nach. Er scannt den Bestand, findet je alter Seite die beste natürliche Textstelle für einen Link auf die Zielseite, zeigt alle Vorschläge an einem Gate und fügt sie erst nach Bestätigung ein.

**Notation:** `<cms>.html` steht in diesem Skill für die CMS-fertige HTML-Datei jeder Seite. Der tatsächliche Dateiname steht in der Projekt-`CLAUDE.md` unter „Über > CMS-Dateiname" (z.B. `wordpress.html`, `shopify.html`, `webflow.html`). Analog meint „CMS-Backend" den Editor laut `CLAUDE.md` > „CMS-Editor".

**Warum das wichtig ist:** Interne Links sind ein belegter Traffic-Hebel (SearchPilot-A/B-Tests: +5 bis 7 % organisch) und bauen Topical Authority auf. Eine neue Seite ohne eingehende interne Links hängt im Site-Graph in der Luft. Die `<cms>.html`-Dateien im Projekt spiegeln in der Regel den Live-Stand; der User überträgt Änderungen per Copy-Paste ins CMS-Backend. Verbindliche Quelle für Live-Inhalte bleibt laut CLAUDE.md aber das CMS-Backend selbst (siehe Übertragungs-Hinweis in Schritt 5).

## Feste Regeln (verbindliche Defaults)

1. **Gate-Pflicht:** Vorschläge IMMER erst als Tabelle zeigen, auf Bestätigung warten, dann schreiben. Nie direkt einfügen.
2. **Maximal 1 neuer Link pro alter Seite.** Nur die beste Stelle bekommt ihn. Gibt es keine natürliche Stelle, bekommt die Seite KEINEN Link. Ein erzwungener Link ist schlechter als keiner.
3. **Drei Dateien synchron:** Jede bestätigte Einfügung landet in `<cms>.html` (Copy-Paste-Quelle für den User), `artikel.md` (Textquelle, gleiche Stelle als Markdown-Link) und `seo.md` (Interne-Verlinkung-Tabelle) der ALTEN Seite.
4. **Scope:** Kandidaten sind Seiten unter `artikel/content/ratgeber/`, `artikel/content/beratung/`, `artikel/content/produkte/` und `artikel/content/kollektionen/`. Zusätzlich flache Alt-Ordner direkt unter `artikel/content/<slug>/` mitprüfen, falls vorhanden (tolerierte Alt-Struktur). **Personen-/Profilseiten (`profile/`) sind als Quellseiten ausgeschlossen (konfigurierbarer Default):** Profilseiten werden in vielen Projekten bewusst minimal gehalten und sollen die vorgestellte Person nicht mit Querverweisen überlagern. Behandelt das Projekt Profilseiten wie regulären Content, kann der User sie explizit in den Scope aufnehmen. Landingpages nur auf expliziten User-Wunsch.

## Ablauf

### Schritt 0: Kontext laden (Pflicht)

1. **`CLAUDE.md`** (Domain, CMS-Dateiname, CMS-Editor, URL-Muster, Duplicate-Content-Regeln, Changelog-Konvention).
2. **Zielseite:** Ordner über Glob `artikel/content/*/<slug>/` finden (plus Alt-Struktur-Fallback `artikel/content/<slug>/`). Aus deren `seo.md`: finale URL aus „URL & Canonical", Keyword-Mapping (Primär + Sekundär als Anker-Kandidaten-Pool), H-Hierarchie (welche Fragen beantwortet die Seite). Aus deren `artikel.md`: Thema und Kernaussagen.
   - **URL-Pfad ableiten (wichtig):** Aus der absoluten Canonical den **Pfad-Teil** extrahieren (Beispiel Sonnenwerk Solar: `https://sonnenwerk-solar.de/beratung/<slug>` → `/beratung/<slug>`). Alle Bestandslinks in den `<cms>.html` sind **relativ**; neue Links werden ebenfalls relativ (Pfad-Form) eingefügt, und alle Prüfungen laufen gegen den Pfad, nie gegen die volle Canonical.
   - **HARD STOP:** Zielseiten-Ordner nicht gefunden, `seo.md` fehlt oder das URL-Feld ist leer/`[TODO]` → STOPPEN und den User nach Ordnerpfad bzw. finaler URL fragen. Niemals mit einer konstruierten URL weiterarbeiten.
3. **`seo/content-ownership-map.md`** (falls im Projekt vorhanden): Ankertext-Regel (Exakt-, Teil- und Synonym-Anker mischen, nie mehrfach identisch) und Cluster-Zuständigkeiten. Fehlt die Datei, gilt die Ankertext-Regel aus diesem Skill trotzdem; die Ownership-Prüfung (Schritt 2, letzter Punkt) entfällt dann.
4. **`wissensbasis/tone-of-voice.md`** Abschnitt 16 (Schnell-Referenz), falls neue Satzteile formuliert werden.

**Live-Check:** Wenn die Zielseite noch nicht veröffentlicht ist, führen die neuen Links auf der Live-Site ins Leere (404). In diesem Fall trotzdem arbeiten, aber im Gate UND im Schlussbericht deutlich warnen: „Zielseite zuerst veröffentlichen, dann die geänderten Bestandsseiten übertragen."

### Schritt 1: Kandidaten-Seiten sammeln

Alle `<cms>.html` unter den Scope-Ordnern auflisten, Zielseite selbst ausschließen. Pro Kandidat vorab:

- **Platzhalter-Check:** Ist die `<cms>.html` nur ein TODO-Platzhalter (legitimer Zustand aus `article-create`, wenn der Formatter noch nicht lief)? → Seite überspringen, im Bericht als „übersprungen (Platzhalter)" führen.
- **Bereits-verlinkt-Check:** Grep auf den **URL-Pfad** der Zielseite (nicht die Canonical, siehe Schritt 0.2). Treffer → überspringen und im Bericht als „bereits verlinkt" führen. Kein Doppel-Link.

### Schritt 2: Textstellen finden (Kernarbeit)

Jede verbleibende Kandidaten-`<cms>.html` **vollständig lesen** (nicht nur per Keyword-Grep scannen) und Sektion für Sektion fragen: **Berührt diese Passage das Thema der Zielseite so konkret, dass ein Link dem Leser hier wirklich weiterhilft?**

Harte Kriterien für eine gültige Stelle:

- **Echter Kontextbezug:** Der umgebende Satz behandelt das Thema der Zielseite bereits oder reißt es an. Kein Link-Shoehorning in themenfremde Absätze. Findet sich keine solche Stelle: Seite ohne Vorschlag lassen (Regel 2).
- **Nur Fließtext und Listen-Inhalte.** NIE in: Überschriften, ToC, Zitat-Elemente, CTA-Karten/CTA-Buttons, Author-Card, Share-Elemente, `alt`-Attribute (welche Sonder-Elemente das Projekt hat, steht in `wissensbasis/html-elemente.md`). FAQ-Antworten sind erlaubt (sie sind Fließtext), aber sparsam: Generiert das Projekt FAQ-Schema automatisch, erscheint der Link auch dort.
- **Einfüge-Modus, in dieser Rangfolge:** (a) Anker auf eine BESTEHENDE Formulierung setzen (beste Option, null Textänderung); (b) bestehenden Satz minimal erweitern; (c) EIN kurzer neuer Satz in der Projekt-Voice (letzte Option; Anrede- und Stil-Regeln aus `wissensbasis/tone-of-voice.md` beachten, keine Werbe-Imperative). Nie ganze Absätze umbauen.
- **Ankertext natürlich und variiert:** Über alle Vorschläge des Laufs hinweg Exakt-, Teil- und Synonym-Anker mischen (Ownership-Map-Regel). Nie zweimal derselbe Ankertext. Der Anker beschreibt, was den Leser auf der Zielseite erwartet (Beispiel Sonnenwerk Solar: „worauf Sie beim Kauf achten sollten", „unser Vergleich von monokristallinen und polykristallinen Modulen"), kein nacktes „hier klicken".
- **Link-Form nach Zieltyp:** Zielseite ist Artikel/Ratgeber/Beratung → normaler relativer Textlink. Zielseite ist eine Produktseite → dieser Skill ist das falsche Werkzeug für neue Produkt-CTA-Karten (das regelt `content-html-formatter`, Element „Produkt-CTA", sofern das Projekt es definiert); auf Produktseiten höchstens einen Textlink-Anker setzen, wenn die Quellseite das Produkt ohnehin schon im Fließtext erwähnt.
- **Duplicate-Content-Regel:** Neu formulierte Satzteile dürfen keine wortgleichen Passagen (über 2 Sätze) von der Zielseite übernehmen.
- **Ownership-Grenzen respektieren (nur falls `seo/content-ownership-map.md` existiert):** Wenn Quell- und Zielseite laut Map verwandte Query-Familien besitzen, den Link genau an der Übergabestelle setzen (kurz anreißen, dann zum Besitzer verlinken), nicht als Konkurrenz-Signal mitten im eigenen Besitz-Thema.

### Schritt 3: GATE, Vorschläge zeigen (Pflicht, nie überspringen)

Dem User exakt diese Tabelle zeigen und auf Bestätigung warten:

| # | Alte Seite | Sektion | Einfüge-Modus | Satz NACHHER (Anker fett) | Ankertext |
|---|---|---|---|---|---|

Plus je Vorschlag den unveränderten VORHER-Satz, wenn Text angepasst wird. Zusätzlich auflisten: Seiten ohne Vorschlag (mit Ein-Zeilen-Begründung: „kein natürlicher Kontext" / „bereits verlinkt" / „übersprungen (Platzhalter)"). Der User kann einzelne Vorschläge bestätigen, abwählen oder umformulieren lassen. **Erst nach expliziter Bestätigung weiter.**

**Leerfall:** Ergibt der Lauf 0 Vorschläge, entfällt das Gate. Direkt den Schlussbericht mit Begründungen je Seite ausgeben (Schritt 5) und den Changelog-Eintrag schreiben (Schritt 6); die Schritte 4a bis 4e entfallen.

### Schritt 4: Einfügen (nur bestätigte Vorschläge)

Pro bestätigtem Vorschlag, in dieser Reihenfolge:

a. **`<cms>.html`** der alten Seite: Link an der Stelle einfügen (Edit, exakter String-Match, relative Pfad-URL).
b. **`artikel.md`** der alten Seite: dieselbe Stelle als `[anker](/pfad)`-Markdown-Link spiegeln. Wenn die Stelle in `artikel.md` nicht existiert (Datei-Drift): im Bericht vermerken statt raten.
c. **`seo.md`** der alten Seite: Zeile in der Tabelle „Interne Verlinkung" ergänzen, dabei **das Format der vorhandenen Tabelle übernehmen** (der Bestand hat teils 2 Spalten `| Ankertext | Ziel-URL |`, teils 3 Spalten mit zusätzlicher Funktion-Spalte; bei 3 Spalten die Funktion kurz befüllen, z.B. „Rückverlinkung auf neue Beratung-Seite"). Fehlt die Tabelle ganz: nach dem Schema aus `article-create/references/seo-template.md` anlegen und im Bericht vermerken.
d. **`seo.md` der ZIELSEITE:** unter „Interne Verlinkung" einen kurzen Block „Eingehende Links (rueckverlinkung, YYYY-MM-DD)" mit den Quellseiten führen (anlegen, falls noch nicht vorhanden).
e. **`artikel.docx` der alten Seite neu erzeugen:** `python .claude/skills/article-create/references/create-docx.py <slug> --typ <typ>` aus dem Projekt-Root ausführen (alternativ Projekt-Root als zweites Argument mitgeben). Damit bleibt die Pflichtdatei laut CLAUDE.md-Konvention synchron.

### Schritt 5: Schlussbericht (Copy-Paste-Anleitung)

Am Ende IMMER berichten:

- Tabelle: **welche `<cms>.html`-Dateien geändert wurden** (voller Pfad) + Sektion + eingefügter Satz → „Diese N Dateien jetzt ins CMS-Backend übertragen."
- **Übertragungs-Hinweis (Pflicht):** Das CMS-Backend ist laut CLAUDE.md die verbindliche Quelle für Live-Inhalte. Vor dem Übertragen prüfen, ob die Live-Version zwischenzeitlich vom lokalen Stand abweicht; im Zweifel nur den geänderten Absatz einpflegen statt die ganze Datei zu ersetzen.
- Seiten ohne Link (mit Begründung), bereits verlinkte und übersprungene Seiten.
- Falls Zielseite noch nicht live: Warnung „zuerst Zielseite veröffentlichen".
- Falls das Projekt eine Ownership-Map führt und Quell- oder Zielseite zu einem dort gelisteten Cluster gehört: Hinweis, den Verlinkungs-Plan dort zu ergänzen.

### Schritt 6: Changelog

Eintrag in `changelog/YYYY-MM-DD.md` (Tagesdatei-Konvention): Zielseite, Anzahl eingefügter Links, geänderte Quellseiten.

## QA-Checkliste vor dem Gate

- [ ] URL-Pfad aus der Canonical der Zielseiten-`seo.md` abgeleitet (relativ, nicht konstruiert, nicht absolut)?
- [ ] Jede Kandidaten-Seite vollständig gelesen, nicht nur per Keyword-Grep gescannt?
- [ ] Max. 1 Vorschlag pro Seite, nur bei echtem Kontextbezug?
- [ ] Alle Ankertexte unterschiedlich und natürlich formuliert (Exakt/Teil/Synonym gemischt)?
- [ ] Keine verbotenen Einfügeorte (Überschrift, Zitat, CTA-Karte, Author-Card, ToC, alt-Text)?
- [ ] Profilseiten (`profile/`) nicht angefasst (außer der User hat sie explizit in den Scope genommen)?
- [ ] Neue Satzteile voice-konform (Anrede- und Stil-Regeln laut `wissensbasis/tone-of-voice.md`, keine Werbe-Imperative)?
- [ ] Bereits-verlinkt-Check (auf Pfad-Form) und Platzhalter-Check je Seite gelaufen?

## Abgrenzung

- **Vorwärts-Verlinkung** (neue Seite → Bestand) macht `seo-page-research`/`article-create`, nicht dieser Skill.
- **Produkt-CTA-Karten** setzt `content-html-formatter`; dieser Skill setzt nur Textlinks.
- **Sitewide Link-Audits / Linkstruktur-Optimierung** sind nicht sein Job; er verlinkt gezielt EINE Zielseite aus dem Bestand heraus.
- **Konsolidierung/Kannibalisierung** bewertet `seo-page-research` Phase 4; dieser Skill verlinkt nur, er entscheidet keine Seiten-Zuständigkeiten um.
