// normalize-de.mjs — Deutsche Keyword-Normalisierung & Dedup.
// Single Source of Truth fuer alle DACH-Sprachregeln des Skills.
// Belegt: Umlaut/ss als GETRENNTE GKP-Buckets (teils ~38x Volumenunterschied,
// Bsp. "mödling" 5.400 vs "moedling" 140). Regel daher: normalisiert MATCHEN,
// aber Original-Schreibweise als Anzeige behalten und Volumina je Variante
// getrennt abfragen. Quelle: david-asen-marketing.de, transperfectdigital.com.

// ── Folding fuer den Match-Key (NICHT fuer die Anzeige) ──
// ä→ae etc. + lowercase + Whitespace-Kollaps. Zwei Keywords mit gleichem
// foldKey gelten als Schreibvarianten DESSELBEN Suchbedarfs.
export function foldKey(s) {
  return String(s)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Schweiz-Normalisierung: ß → ss (linguistische Pflichtregel, kein Encoding) ──
// Vor GKP-/SerpApi-Abfragen mit gl=ch anzuwenden, sonst CH-Volumen unterschaetzt.
export function chNormalize(s) {
  return String(s).replace(/ß/g, "ss");
}

// ── Slug fuer Datei-/Pfadnamen (Umlaute aufgeloest, nur a-z0-9-) ──
export function slugify(s) {
  return foldKey(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Levenshtein-Distanz (fuer das Komposita-Gate) ──
export function levenshtein(a, b) {
  a = String(a);
  b = String(b);
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

// ── Komposita-Gate ──
// Entscheidet, ob zwei Keywords mit GLEICHEM foldKey wirklich dieselbe Variante
// sind (mergen) ODER ein eigenstaendiges Kompositum (getrennt halten).
//   - "kfz versicherung" vs "kfz-versicherung"  → merge (nur Trennzeichen)
//   - "auto versicherung" vs "autoversicherung" → merge (Leerzeichen-kollabiert gleich)
//   - "wärmepumpe förderung" vs "wärmepumpenförderung" → GETRENNT
//     (Fugen-"n", Levenshtein > 2 nach Whitespace-Strip → eigenes Keyword)
// Annahme: a und b haben bereits denselben Token-Set-Bezug (gleiche foldKey-Basis
// ODER Aufruf aus dem Dedup-Loop). Gibt true = "ist blosse Schreibvariante".
export function isSpellingVariant(a, b) {
  const fa = foldKey(a);
  const fb = foldKey(b);
  if (fa === fb) return true; // identisch nach Folding (z. B. Umlaut vs ae)
  const sa = fa.replace(/[\s-]/g, "");
  const sb = fb.replace(/[\s-]/g, "");
  // NUR mergen bei reiner Trenn-/Leerzeichen-Differenz (sa === sb):
  //   "auto versicherung" == "autoversicherung"  → merge.
  // Ein Fugenelement aendert die Buchstabenfolge:
  //   "waermepumpefoerderung" != "waermepumpenfoerderung" (Fugen-"n")
  //   → eigenstaendiges Kompositum, GETRENNT halten.
  // Bewusst KEINE Levenshtein-Toleranz: das Risiko, echte Komposita zu
  // verschmelzen, wiegt schwerer als der Nutzen, Tippvarianten zu mergen
  // (Konservativ-Prinzip wie beim Numerus). levenshtein() bleibt exportiert
  // fuer das SERP-Overlap-/Difficulty-Scoring.
  return sa === sb;
}

// ── Numerus-Heuristik (Singular ↔ Plural NICHT automatisch mergen) ──
// John Mueller (Google, 2020): Singular/Plural koennen unterschiedlichen Intent
// signalisieren (Plural → Listen-/Tabellen-Erwartung). Deshalb: als getrennte
// Kandidaten fuehren, aber als verwandt FLAGGEN. Quelle: dataloft.ch, seo-suedwest.de.
// Reine Heuristik (kein Stemmer) — bewusst konservativ, nur klare DE-Endungen.
export function numerusRelation(a, b) {
  const fa = foldKey(a);
  const fb = foldKey(b);
  if (fa === fb) return "same";
  const tokensA = fa.split(" ");
  const tokensB = fb.split(" ");
  if (tokensA.length !== tokensB.length) return "unrelated";
  let diff = 0;
  let pluralish = false;
  for (let i = 0; i < tokensA.length; i++) {
    if (tokensA[i] === tokensB[i]) continue;
    diff++;
    const [s, l] = [tokensA[i], tokensB[i]].sort((x, y) => x.length - y.length);
    // Plural-Endungen im Deutschen: -e, -en, -n, -s, -er (heuristisch)
    if (
      l.startsWith(s) &&
      /(e|en|n|s|er)$/.test(l.slice(s.length === l.length ? 0 : 0)) &&
      l.length > s.length
    ) {
      pluralish = true;
    }
  }
  if (diff === 1 && pluralish) return "numerus-variant";
  return "unrelated";
}

// ── Dedup eines Keyword-Sets ──
// Input: Array von { keyword, source, volume?, ...rest } (volume optional).
// Output: Array von Gruppen:
//   { display, foldKey, variants:[...alle Originale], sources:Set→Array,
//     numerusSiblings:[] (verwandte aber getrennte Numerus-Varianten) }
// Mergt nur echte Schreibvarianten (isSpellingVariant). Singular/Plural bleiben
// getrennte Gruppen, werden aber als numerusSiblings querverlinkt.
export function dedupeKeywords(items) {
  const groups = [];
  for (const it of items) {
    const kw = (it.keyword ?? it).toString();
    let g = groups.find((gr) => gr.variants.some((v) => isSpellingVariant(v.keyword, kw)));
    if (!g) {
      g = { display: kw, foldKey: foldKey(kw), variants: [], sources: new Set() };
      groups.push(g);
    }
    g.variants.push({ keyword: kw, source: it.source, volume: it.volume ?? null });
    if (it.source) g.sources.add(it.source);
  }
  // Anzeige-Variante = hoechstes bekanntes Volumen, sonst erste; sources→Array.
  for (const g of groups) {
    const withVol = g.variants.filter((v) => typeof v.volume === "number");
    g.display = (withVol.sort((a, b) => b.volume - a.volume)[0] || g.variants[0]).keyword;
    g.sources = [...g.sources];
  }
  // Numerus-Geschwister querverlinken (über Gruppen hinweg, nicht mergen).
  for (const g of groups) {
    g.numerusSiblings = groups
      .filter((o) => o !== g && numerusRelation(g.display, o.display) === "numerus-variant")
      .map((o) => o.display);
  }
  return groups;
}
