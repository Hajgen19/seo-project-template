---
name: ga4-reports
description: >
  Zieht GA4-Daten über den MCP und präsentiert sie faktenbasiert mit voller Nachvollziehbarkeit.
  Nutze diesen Skill immer, wenn der Nutzer nach GA4-Daten, Website-Traffic, Seitenaufrufen,
  Sitzungen, Nutzerzahlen, Conversions, Schlüsselereignissen, Bounce Rate, Engagement,
  Kanalperformance, Landingpage-Daten, organischer Suche oder beliebigen Google Analytics 4
  Reporting-Aufgaben fragt. Auch bei explorativen Fragen wie "Welcher Kanal bringt die meisten
  Conversions?" oder "Wie performt Seite X?" soll dieser Skill getriggert werden. Trigger auch
  bei Erwähnungen von GA4, Google Analytics, Traffic-Analyse, Seitenperformance oder Webanalyse.
---

# GA4 Reports Skill

Dieser Skill zieht GA4-Daten über den GA4-Analytics MCP und gibt sie **ausschließlich faktenbasiert** aus. Der Kern: Keine Interpretation, keine Beschönigung, nur Daten mit voller Nachvollziehbarkeit.

## Warum das wichtig ist

Wenn ein Nutzer GA4-Daten anfragt, will er die exakten Zahlen – so wie sie in Google Analytics stehen. Jede Abweichung, jede Interpretation, jede Annahme untergräbt das Vertrauen. Der Nutzer muss die Zahlen in GA4 nachprüfen können und dieselben Werte sehen. Deshalb ist dieser Skill so aufgebaut, dass jeder Schritt transparent und verifizierbar ist.

## Property

- **Property-ID:** [PROPERTY_ID]
- **Website:** [WEBSITE_DOMAIN]

## Ablauf – Immer diese 4 Schritte

### Schritt 1: Anfrage verstehen

Lies die Anfrage des Nutzers und bestimme:
- Welcher GA4-Bericht passt? (Schlage in `references/api-mapping.md` nach)
- Welche Dimension(en) werden gebraucht?
- Welche Metrik(en) werden gebraucht?
- Welcher Zeitraum? (Falls nicht angegeben: nachfragen)
- Welche Filter? (z.B. bestimmte Landingpage, bestimmter Channel)

**Berichtswahl bei Kanal-/Traffic-Fragen:**
Die Wahl des richtigen Berichts ist entscheidend, weil verschiedene Berichte verschiedene Spalten im Dashboard anzeigen. Nur Metriken verwenden, die im jeweiligen Bericht als Standardspalte sichtbar sind – sonst kann der Nutzer die Zahlen in GA4 nicht nachprüfen.

| Nutzer fragt nach... | Richtiger Bericht | Dimension | Standard-Metriken |
|---|---|---|---|
| "Welcher Kanal bringt die meisten **Nutzer**?" | Akquisition → Nutzergewinnung | `firstUserDefaultChannelGroup` | `totalUsers`, `newUsers`, `eventCount`, `keyEvents` |
| "Wie viele **Sitzungen** pro Kanal?" | Akquisition → Neu generierter Traffic | `sessionDefaultChannelGroup` | `sessions`, `eventCount`, `keyEvents` |
| "Woher kommen die **neuen** Nutzer?" | Akquisition → Nutzergewinnung | `firstUserDefaultChannelGroup` | `totalUsers`, `newUsers`, `keyEvents` |

Wichtig: 
- Im **Traffic-Akquisitionsbericht** keine Nutzer-Metriken (`activeUsers`, `totalUsers`, `newUsers`) – dort nicht sichtbar.
- Im **Nutzergewinnungsbericht** keine `engagementRate` und `engagedSessions` – dort nicht als Standardspalte sichtbar.
- Nur Metriken verwenden, die als Standardspalte im jeweiligen Bericht sichtbar sind, damit der Nutzer die Zahlen in GA4 direkt nachprüfen kann.
- Bei berechneten Metriken (z.B. „Wiederkehrende Nutzer" = `totalUsers` - `newUsers`) die Rohwerte aus der API ziehen und selbst berechnen.

Für explorative Anfragen ("Welcher Channel bringt die meisten Schlüsselereignisse auf /beispiel-seite?"): Baue den API-Call selbst zusammen aus den verfügbaren Dimensionen und Metriken im Mapping.

Falls die Anfrage über die API nicht beantwortbar ist (Trichter-Analysen, Pfad-Analysen, Segmentüberlappung), sage das ehrlich und nenne den Pfad in der GA4-Oberfläche, wo der Nutzer die Analyse manuell durchführen kann.

### Schritt 2: Bestätigung (bei JEDER Anfrage)

Zeige dem Nutzer vor dem API-Call exakt, was gezogen wird. Nutze immer dieses Format:

```
Ich ziehe folgende Daten:
- **Bericht:** [GA4-Berichtsname, z.B. Engagement → Landingpage]
- **Dimension:** [API-Feldname + deutscher Name]
- **Metriken:** [API-Feldnamen + deutsche Namen]
- **Filter:** [falls vorhanden]
- **Zeitraum:** [TT.MM.JJJJ – TT.MM.JJJJ]
- **Property:** [PROPERTY_ID]

Einverstanden?
```

Warte auf die Bestätigung des Nutzers, bevor du den API-Call machst. Wenn der Nutzer korrigiert, passe an und bestätige erneut.

### Schritt 3: Daten ziehen

Führe den API-Call über `mcp__ga4-analytics__get_ga4_data` aus mit den bestätigten Parametern.

Beachte bei der Ausgabe:
- **Dezimalwerte** (Raten wie engagementRate, bounceRate): In Prozent umrechnen (0.72 → 72,0%)
- **Zeitwerte** (Sekunden): Lesbar machen (z.B. 185 Sek. → 3:05 Min.)
- **Fehlende Daten**: Als „keine Daten" ausgeben, nicht interpretieren oder auffüllen

### Schritt 4: Ausgabe (immer 3 Blöcke)

Gib die Ergebnisse immer in exakt diesem Format aus:

---

**Block 1 – Ergebnis**

Eine Datentabelle mit den angeforderten Werten. Keine zusätzlichen Spalten, die nicht angefragt wurden.

```
| [Dimension] | [Metrik 1] | [Metrik 2] | ... |
|---|---|---|---|
| [Wert] | [Wert] | [Wert] | ... |
```

**Block 2 – Verifikation**

So kann der Nutzer die Daten in GA4 nachprüfen:

```
### Verifikation
- **GA4-Pfad:** Berichte → [Berichtsname]
- **Dimension:** [deutscher Name] (`[API-Feldname]`)
- **Metriken:** [deutsche Namen] (`[API-Feldnamen]`)
- **Filter:** [falls gesetzt, sonst „keiner"]
- **Zeitraum:** [TT.MM.JJJJ – TT.MM.JJJJ]
- **Property:** [PROPERTY_ID]
```

**Block 3 – Datenhinweise** (nur wenn nötig)

Nur ausgeben, wenn es etwas zu klären gibt:
- Umrechnungen, die vorgenommen wurden (z.B. „Engagement-Rate: API liefert 0.72, angezeigt als 72,0%")
- API-Limitierungen (z.B. „Suchanfragen sind über die GA4 API nicht verfügbar")
- Fehlende Daten oder leere Ergebnisse
- **Benutzerdefinierte Abfragen:** Wenn die Abfrage Metriken aus verschiedenen Standardberichten kombiniert oder Metriken enthält, die in keinem einzelnen Standardbericht als Spalte sichtbar sind, weise darauf hin. Beispiel: „Diese Abfrage kombiniert Metriken, die in GA4 nicht in einem einzelnen Standardbericht zusammen angezeigt werden. Die einzelnen Werte lassen sich in folgenden Berichten nachprüfen: [Bericht A] für [Metrik X], [Bericht B] für [Metrik Y]."

---

## Was dieser Skill NICHT tut

Das ist genauso wichtig wie das, was er tut:

- **Keine Kausalitäten erfinden.** Sage nicht "die Conversions sind gestiegen, weil..." – es sei denn, der Nutzer fragt explizit nach einer Einschätzung und du machst klar, dass es eine Hypothese ist.
- **Keine Bewertungen.** Sage nicht "gute Performance" oder "die Zahlen sind leider schlecht". Zeige die Zahlen.
- **Keine Beschönigungen.** Wenn eine Seite 0 Schlüsselereignisse hat, dann steht da 0. Keine Formulierungen wie "noch Potenzial nach oben".
- **Keine Annahmen über fehlende Daten.** Wenn es keine Daten gibt, sage "keine Daten für diesen Zeitraum/Filter vorhanden".
- **Keine unaufgeforderten Vergleiche.** Zeige keinen Vorjahresvergleich, es sei denn der Nutzer fragt danach.
- **Kein Fazit, keine Zusammenfassung.** Die Tabelle spricht für sich.

## [PROJEKT_NAME] Schlüsselereignisse

Diese Schlüsselereignisse sind in der Property konfiguriert und können einzeln abgefragt werden. **Hinweis:** Die folgende Tabelle enthält Testwerte – beim Projektsetup durch die tatsächlich konfigurierten Schlüsselereignisse ersetzen.

| Schlüsselereignis | API-Metrik |
|---|---|
| beispiel_event_1 | `keyEvents:beispiel_event_1` |
| beispiel_event_2 | `keyEvents:beispiel_event_2` |
| form_submit | `keyEvents:form_submit` |
| purchase | `keyEvents:purchase` |

Wenn der Nutzer nach „Schlüsselereignissen" fragt, ohne zu spezifizieren welche, verwende die Gesamt-Metrik `keyEvents`. Wenn er nach einem bestimmten Ereignis fragt (z.B. "Käufe"), verwende die spezifische Metrik.

## API-Referenz

Für die korrekte Zuordnung von GA4-Dashboard-Spalten zu API-Feldnamen, lies `references/api-mapping.md`. Dieses Dokument enthält das vollständige Mapping für alle Standard-Berichte:
- Akquisition (Nutzergewinnung, Traffic)
- Engagement (Ereignisse, Seiten, Landingpages)
- Nutzer (Demografische Daten)
- Technologie (Browser, Geräte)
- Search Console (Organische Suche)
- Zeitdimensionen
- Berechnete Metriken
- Wichtige Unterscheidungen (activeUsers vs. totalUsers, landingPage vs. pagePath, etc.)

## Eingeschränkt oder nicht über die API möglich

Manche Analysen sind in der exakten Form nicht über die API machbar. Statt einfach abzulehnen: Erkläre ehrlich die Einschränkung, und biete dann eine alternative Abfrage an, die die eigentliche Frage des Nutzers trotzdem beantworten kann.

| Analyse | Einschränkung | Alternative über API |
|---|---|---|
| Pfad-Analyse (Seite A → B → C) | Sequentielle Seitenfolge nicht abfragbar | Frage: Was will der Nutzer eigentlich wissen? Z.B. „Auf welcher Landingpage starten Sitzungen, die zu Event X führen?" → `landingPage` + `keyEvents:eventname` |
| Trichter-Analyse (Funnel) | Schrittweise Conversion-Analyse nicht abfragbar | Einzelne Schritte separat abfragen: z.B. Seitenaufrufe Schritt 1 vs. Events Schritt 2 |
| Segmentüberlappung | Nur in GA4-Oberfläche | Einzelne Segmente separat abfragen und vergleichen |
| Kohortenanalyse (erweitert) | Nur Basis-Kohorten über API | `newVsReturning` Dimension für einfache Kohortenvergleiche |

**Ablauf bei eingeschränkten Anfragen:**
1. Erkläre, dass die exakte Analyse (z.B. sequentielle Pfadanalyse) nur in der GA4-Oberfläche möglich ist. Nenne den Pfad: z.B. GA4 → Erkunden → Pfadanalyse.
2. Frage nach, was der Nutzer eigentlich herausfinden möchte.
3. Biete eine alternative Abfrage an, die über die API machbar ist.
4. Wenn der Nutzer die Alternative möchte: Weiter mit Schritt 2 (Bestätigung).

## Beispiel

**Nutzer:** "Hat die Seite /test im März 2026 Schlüsselereignisse ausgelöst?"

**Schritt 2 – Bestätigung:**
```
Ich ziehe folgende Daten:
- **Bericht:** Engagement → Landingpage
- **Dimension:** Landingpage (`landingPage`)
- **Metriken:** Sitzungen (`sessions`), Schlüsselereignisse (`keyEvents`)
- **Filter:** landingPage enthält "/test"
- **Zeitraum:** 01.03.2026 – 31.03.2026
- **Property:** [PROPERTY_ID]

Einverstanden?
```

**Schritt 4 – Ausgabe nach Bestätigung:**

| Landingpage | Sitzungen | Schlüsselereignisse |
|---|---|---|
| /test | 142 | 3 |

### Verifikation
- **GA4-Pfad:** Berichte → Engagement → Landingpage
- **Dimension:** Landingpage (`landingPage`)
- **Metriken:** Sitzungen (`sessions`), Schlüsselereignisse (`keyEvents`)
- **Filter:** Landingpage enthält „/test"
- **Zeitraum:** 01.03.2026 – 31.03.2026
- **Property:** [PROPERTY_ID]
