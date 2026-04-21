# GA4 API Mapping – Dashboard zu API

Vollständige Zuordnung zwischen den deutschen Spaltenbezeichnungen in der GA4-Oberfläche und den API-Feldnamen.
Property: [WEBSITE_DOMAIN] (ID: [PROPERTY_ID])
Stand: [STAND_DATUM]

---

## Hinweise zur Nutzung

- **GA4-Pfad** = Menüpfad in der GA4-Oberfläche (links in der Navigation)
- **GA4-Spalte** = Spaltenüberschrift in der Tabelle, wie sie im Dashboard angezeigt wird (deutsch)
- **API-Feld** = Exakter Feldname für den API-Call
- **⚠️ Unsicher** = Deutsche Bezeichnung kann je nach GA4-Version/Einstellung abweichen – hier bitte gegenprüfen
- **Berechnete Metriken** = GA4 zeigt sie als fertige Zahl, die API liefert Rohwerte, aus denen man rechnen muss

---

## 1. Akquisition → Bericht zur Nutzergewinnung

**GA4-Pfad:** Berichte → Akquisition → Bericht zur Nutzergewinnung

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Erste Nutzerinteraktion – Standardchannelgruppe | `firstUserDefaultChannelGroup` | Dimension | Werte: Direct, Organic Search, Paid Search, Referral, etc. |
| Nutzer insgesamt | `totalUsers` | Metrik | **Standardspalte** |
| Neue Nutzer | `newUsers` | Metrik | **Standardspalte** |
| Wiederkehrende Nutzer | – | Berechnet | **Standardspalte** – `totalUsers` - `newUsers` (nicht direkt in API) |
| Durchschnittliche Interaktionsdauer pro aktivem Nutzer | – | Berechnet | **Standardspalte** – `userEngagementDuration` ÷ `activeUsers` (Sekunden) |
| Sitzungen mit Interaktionen pro aktivem Nutzer | – | Berechnet | **Standardspalte** – `engagedSessions` ÷ `activeUsers` |
| Ereignisanzahl | `eventCount` | Metrik | **Standardspalte** |
| Schlüsselereignisse | `keyEvents` | Metrik | **Standardspalte** |
| Nutzer – Schlüsselereignisrate | `userKeyEventRate` | Metrik | **Standardspalte** – API liefert Dezimalzahl |
| Engagement-Rate | `engagementRate` | Metrik | ⚠️ Keine Standardspalte – muss manuell hinzugefügt werden |
| Sitzungen mit Interaktionen | `engagedSessions` | Metrik | ⚠️ Keine Standardspalte – muss manuell hinzugefügt werden |

---

## 2. Akquisition → Neu generierter Traffic

**GA4-Pfad:** Berichte → Akquisition → Neu generierter Traffic

**Hinweis:** Dieser Bericht zeigt **keine** „Aktive Nutzer"-Spalte als Standard. Wenn der Nutzer nach Nutzern pro Kanal fragt, stattdessen den Nutzergewinnungsbericht (Abschnitt 1) verwenden.

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Sitzung – Standardchannelgruppe | `sessionDefaultChannelGroup` | Dimension | Evtl. inzwischen „Sitzung – primäre Channelgruppe" (`sessionPrimaryChannelGroup`) – siehe Fußnote ¹ |
| Sitzungen | `sessions` | Metrik | **Standard-Metrik dieses Berichts** |
| Sitzungen mit Interaktionen | `engagedSessions` | Metrik | |
| Engagement-Rate | `engagementRate` | Metrik | Dezimalzahl |
| Ø Interaktionsdauer pro Sitzung | `averageSessionDuration` | Metrik | Sekunden |
| Ereignisse pro Sitzung | – | Berechnet | `eventCount` ÷ `sessions` |
| Ereignisanzahl | `eventCount` | Metrik | |
| Schlüsselereignisse | `keyEvents` | Metrik | |
| Sitzung-Schlüsselereignisrate | `sessionKeyEventRate` | Metrik | Dezimalzahl |
| Gesamtumsatz | `totalRevenue` | Metrik | |

**Nicht in diesem Bericht:** `activeUsers`, `totalUsers`, `newUsers` – diese sind nur im Nutzergewinnungsbericht (Abschnitt 1) sichtbar.

---

## 3. Engagement → Ereignisse

**GA4-Pfad:** Berichte → Engagement → Ereignisse

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Ereignisname | `eventName` | Dimension | |
| Ereignisanzahl | `eventCount` | Metrik | |
| Nutzer insgesamt | `totalUsers` | Metrik | |
| Ereignisanzahl pro Nutzer | `eventCountPerUser` | Metrik | |
| Gesamtumsatz | `totalRevenue` | Metrik | |

### Schlüsselereignisse einzeln abfragen

Für [PROJEKT_NAME] sind folgende Schlüsselereignisse konfiguriert. **Hinweis:** Testwerte – beim Projektsetup durch die tatsächlich konfigurierten Schlüsselereignisse ersetzen.

| Schlüsselereignis | Metrik (Anzahl) | Metrik (Session-Rate) | Metrik (User-Rate) |
|---|---|---|---|
| beispiel_event_1 | `keyEvents:beispiel_event_1` | `sessionKeyEventRate:beispiel_event_1` | `userKeyEventRate:beispiel_event_1` |
| beispiel_event_2 | `keyEvents:beispiel_event_2` | `sessionKeyEventRate:beispiel_event_2` | `userKeyEventRate:beispiel_event_2` |
| form_submit | `keyEvents:form_submit` | `sessionKeyEventRate:form_submit` | `userKeyEventRate:form_submit` |
| purchase | `keyEvents:purchase` | `sessionKeyEventRate:purchase` | `userKeyEventRate:purchase` |

---

## 4. Engagement → Seiten und Bildschirme

**GA4-Pfad:** Berichte → Engagement → Seiten und Bildschirme

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Seitenpfad und Bildschirmklasse | `unifiedPagePathScreen` | Dimension | Kombiniert Web-Pfade und App-Screens – siehe Fußnote ² |
| Seitentitel und Bildschirmklasse | `unifiedScreenName` | Dimension | Alternative Primärdimension im Dashboard |
| Aufrufe | `screenPageViews` | Metrik | |
| Aktive Nutzer | `activeUsers` | Metrik | |
| Aufrufe pro Nutzer | `screenPageViewsPerUser` | Metrik | |
| Ø Interaktionsdauer pro Nutzer | – | Berechnet | `userEngagementDuration` ÷ `activeUsers` (Sekunden) |
| Ereignisanzahl | `eventCount` | Metrik | |
| Schlüsselereignisse | `keyEvents` | Metrik | |
| Gesamtumsatz | `totalRevenue` | Metrik | |

---

## 5. Engagement → Landingpage

**GA4-Pfad:** Berichte → Engagement → Landingpage

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Landingpage | `landingPage` | Dimension | Nur der Pfad, ohne Query-String |
| Sitzungen | `sessions` | Metrik | |
| Aktive Nutzer | `activeUsers` | Metrik | |
| Neue Nutzer | `newUsers` | Metrik | |
| Ø Interaktionsdauer pro Sitzung | `averageSessionDuration` | Metrik | Sekunden |
| Schlüsselereignisse | `keyEvents` | Metrik | |
| Gesamtumsatz | `totalRevenue` | Metrik | |
| Sitzung-Schlüsselereignisrate | `sessionKeyEventRate` | Metrik | Dezimalzahl |

**Achtung:** `landingPage` ≠ `pagePath`. Die Landingpage ist die Einstiegsseite der Sitzung. `pagePath` ist jede aufgerufene Seite.

---

## 6. Nutzer → Nutzerattribute → Demografische Daten

**GA4-Pfad:** Berichte → Nutzer → Nutzerattribute → Demografische Daten

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Land | `country` | Dimension | |
| Stadt | `city` | Dimension | Alternative Primärdimension |
| Region | `region` | Dimension | Heißt „Region" (nicht „Bundesland") – Werte z.B. „Bavaria", „North Rhine-Westphalia" |
| Geschlecht | `userGender` | Dimension | Erfordert aktivierte Google Signale |
| Alter | `userAgeBracket` | Dimension | Erfordert aktivierte Google Signale |
| Aktive Nutzer | `activeUsers` | Metrik | |
| Neue Nutzer | `newUsers` | Metrik | |
| Sitzungen mit Interaktionen | `engagedSessions` | Metrik | |
| Engagement-Rate | `engagementRate` | Metrik | Dezimalzahl |
| Ereignisanzahl | `eventCount` | Metrik | |
| Schlüsselereignisse | `keyEvents` | Metrik | |
| Gesamtumsatz | `totalRevenue` | Metrik | |

---

## 7. Technologie → Technologie-Details

**GA4-Pfad:** Berichte → Technologie → Technologie-Details

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Browser | `browser` | Dimension | |
| Gerätekategorie | `deviceCategory` | Dimension | Desktop, Mobile, Tablet |
| Betriebssystem | `operatingSystem` | Dimension | |
| Bildschirmauflösung | `screenResolution` | Dimension | |
| Plattform | `platform` | Dimension | web, iOS, Android |
| Aktive Nutzer | `activeUsers` | Metrik | |
| Neue Nutzer | `newUsers` | Metrik | |
| Sitzungen mit Interaktionen | `engagedSessions` | Metrik | |
| Engagement-Rate | `engagementRate` | Metrik | Dezimalzahl |
| Ereignisanzahl | `eventCount` | Metrik | |
| Schlüsselereignisse | `keyEvents` | Metrik | |
| Gesamtumsatz | `totalRevenue` | Metrik | |

---

## 8. Search Console → Zugriffe über die organische Suche

**GA4-Pfad:** Berichte → Search Console → Zugriffe über die organische Suche

| GA4-Spalte (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Landingpage + Abfragestring | `landingPagePlusQueryString` | Dimension | Erfordert aktive Search-Console-Verknüpfung |
| Klicks über organische Google Suche | `organicGoogleSearchClicks` | Metrik | |
| Impressionen über organische Google Suche | `organicGoogleSearchImpressions` | Metrik | |
| Klickrate über organische Google Suche | `organicGoogleSearchClickThroughRate` | Metrik | Dezimalzahl |
| Durchschnittliche Position über organische Google Suche | `organicGoogleSearchAveragePosition` | Metrik | Voller Name im Dashboard, bei schmalen Spalten mit „…" abgekürzt |
| Aktive Nutzer | `activeUsers` | Metrik | |
| Sitzungen mit Interaktionen | `engagedSessions` | Metrik | |
| Engagement-Rate | `engagementRate` | Metrik | Dezimalzahl |
| Ereignisanzahl | `eventCount` | Metrik | |
| Schlüsselereignisse | `keyEvents` | Metrik | |

**Einschränkung:** Suchanfragen (Keywords) sind über die GA4 API NICHT verfügbar. Dafür muss die Google Search Console API (GSC MCP) genutzt werden.

---

## 9. Nutzer → Übersicht (Nutzerkennzahlen)

**GA4-Pfad:** Berichte → Nutzer → Übersicht (Kacheln/Cards)

| GA4-Anzeige (Dashboard) | API-Feld | Typ | Hinweise |
|---|---|---|---|
| Aktive Nutzer | `activeUsers` | Metrik | Standardmetrik in GA4 |
| Nutzer insgesamt | `totalUsers` | Metrik | Alle Nutzer mit mind. 1 Event |
| Neue Nutzer | `newUsers` | Metrik | first_open oder first_visit |
| Neu/wiederkehrend | `newVsReturning` | Dimension | Werte: `new` oder `returning` |
| Aktive Nutzer in 1 Tag | `active1DayUsers` | Metrik | = activeUsers |
| Aktive Nutzer in 7 Tagen | `active7DayUsers` | Metrik | |
| Aktive Nutzer in 28 Tagen | `active28DayUsers` | Metrik | |
| Nutzerbindung (DAU/MAU) | `dauPerMau` | Metrik | Dezimalzahl |
| Nutzerbindung (DAU/WAU) | `dauPerWau` | Metrik | Dezimalzahl |
| Nutzerbindung (WAU/MAU) | `wauPerMau` | Metrik | Dezimalzahl |
| Sitzungen pro Nutzer | `sessionsPerUser` | Metrik | |
| Interaktionsdauer | `userEngagementDuration` | Metrik | Sekunden (Gesamtsumme) |

---

## Zeitdimensionen

Für zeitbasierte Auswertungen (Verläufe, Trends):

| Zeitraum | API-Feld | Format | Beispiel |
|---|---|---|---|
| Datum | `date` | JJJJMMTT | 20260301 |
| Monat | `month` | MM | 03 |
| Jahr | `year` | JJJJ | 2026 |
| Jahr + Monat | `yearMonth` | JJJJMM | 202603 |
| Wochentag | `dayOfWeekName` | Text | Monday |
| Stunde | `hour` | HH | 14 |
| Kalenderwoche (ISO) | `isoWeek` | WW | 13 |

---

## Berechnete Metriken (nicht direkt in der API)

GA4 zeigt diese Werte im Dashboard als fertige Spalte an. Die API liefert die Rohwerte, aus denen man selbst rechnen muss:

| GA4-Spalte | Formel | Rohwerte aus API |
|---|---|---|
| Absprungrate | `bounceRate` | Direkt als API-Metrik verfügbar. Im Dashboard nicht standardmäßig sichtbar – muss manuell als Spalte hinzugefügt werden |
| Ø Interaktionsdauer pro Nutzer | `userEngagementDuration` ÷ `activeUsers` | Ergebnis in Sekunden |
| Ø Interaktionsdauer pro Sitzung | `averageSessionDuration` | Direkt verfügbar (Sekunden) |
| Ereignisse pro Sitzung | `eventCount` ÷ `sessions` | Oder: `eventsPerSession` direkt |
| Sitzungen mit Interaktionen pro Nutzer | `engagedSessions` ÷ `activeUsers` | |
| Aufrufe pro Nutzer | `screenPageViewsPerUser` | Direkt verfügbar |
| Conversion Rate (Käufe) | `ecommercePurchases` ÷ `totalUsers` | |

**Hinweis zur Absprungrate:** In der deutschen GA4-Oberfläche heißt sie „Absprungrate" (nicht „Bounce Rate"). Sie ist das Gegenstück zur Engagement-Rate: `bounceRate` = 1 - `engagementRate`. Sie muss im Dashboard manuell über das Stiftsymbol (Bericht anpassen) als Spalte hinzugefügt werden.

---

## Wichtige Unterscheidungen

### activeUsers vs. totalUsers
- **activeUsers** = Standard in GA4-Berichten. Nutzer, die die Seite besucht haben.
- **totalUsers** = Alle Nutzer mit mindestens einem Event (auch im Hintergrund).
- **Im Dashboard** zeigt GA4 meist `activeUsers` als „Nutzer".

### Session-Scope vs. User-Scope
- `sessionDefaultChannelGroup` = Kanal **dieser Sitzung** (Traffic-Akquisition)
- `firstUserDefaultChannelGroup` = Kanal des **allerersten Besuchs** (Nutzergewinnung)
- **Verwechslungsgefahr:** Im Dashboard ist der Unterschied nur am Berichtsnamen erkennbar.

### landingPage vs. pagePath
- `landingPage` = Erste Seite der Sitzung (Einstiegsseite)
- `pagePath` = Jede aufgerufene Seite (auch Folgeseiten)
- **Schlüsselereignisse** werden der Landingpage zugeordnet, nicht der Seite, auf der das Event ausgelöst wurde.

### primaryChannelGroup vs. defaultChannelGroup
- `sessionDefaultChannelGroup` = Etablierte Standard-Dimension, API-Feld für den Traffic-Akquisitionsbericht
- `sessionPrimaryChannelGroup` = Neueres Feld (ca. 2024), berücksichtigt benutzerdefinierte Channelgruppen
- Beide liefern für Standard-Setups dieselben Werte

---

## Fußnoten – Verbleibende Unsicherheiten

Zwei Zuordnungen konnten nicht zu 100% verifiziert werden. Bei Gelegenheit einmal im GA4-Dashboard (Property [PROPERTY_ID]) prüfen:

**¹ Channelgruppe:** Google hat Ende 2024 begonnen, „primäre Channelgruppe" einzuführen. Möglicherweise steht im Traffic-Akquisitionsbericht inzwischen „Sitzung – primäre Channelgruppe" statt „Sitzung – Standardchannelgruppe". Falls ja, ist das API-Feld `sessionPrimaryChannelGroup` statt `sessionDefaultChannelGroup`. Für Standard-Setups liefern beide dieselben Werte.

**² Seiten-Dimension:** Die Standard-Dimension im „Seiten und Bildschirme"-Bericht ist `unifiedPagePathScreen`. Alternativ könnte GA4 auch `pagePath` oder `pagePathPlusQueryString` verwenden. Prüfbar durch: Berichte → Engagement → Seiten und Bildschirme → Spaltenüberschrift der ersten Spalte ablesen.
