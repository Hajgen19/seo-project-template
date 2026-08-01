"""
prepare-media.py - Bereitet ein lokales Bild/Video web-fertig fuer den CMS-Upload auf.

Skaliert auf artikel-taugliche Breiten herunter (nie hoch), schneidet optional zu,
exportiert verlustarm als WebP (Bild) bzw. h264-MP4 (Video) nach
artikel/content/<content-typ>/<slug>/bilder/.

Bilder: Pillow (pip install pillow). Videos: ffmpeg (muss im PATH sein).

Theme-Masse (Textspalte + Ziel-Breiten) - Praezedenz:
  1. CLI: --width (explizite Ziel-Breite) bzw. --text-column (Anzeige-Spaltenbreite)
  2. Projekt-CLAUDE.md, optionale Sektion "Medien-Masse" / "Medien-Maße" (siehe unten)
  3. Neutrale Defaults: Textspalte 800 px; hero 1600, inline 1400, detail 900

Erwartete CLAUDE.md-Sektion (Werte an das Theme des Projekts anpassen):

    ## Medien-Masse

    - **Textspalte:** 800 px
    - **Ziel-Breite hero:** 1600 px
    - **Ziel-Breite inline:** 1400 px
    - **Ziel-Breite detail:** 900 px

Nutzung:
    python prepare-media.py <quelldatei> --slug <artikel-slug> [--content-type <typ>] [optionen]

Beispiele:
    # PFLICHT-Workflow fuer Artikel-Bilder: Qualitaets-Leiter statt einer einzelnen Datei.
    # Erzeugt mehrere WebP-Kandidaten (versch. Qualitaetsstufen) bei IDENTISCHEM Zuschnitt/
    # Skalierung - nur die Kompression variiert. Siehe SKILL.md Schritt 4c "Qualitaets-Gate".
    python prepare-media.py "quelldateien/bilder/foo.webp" --slug mein-artikel --content-type ratgeber --eignung inline --quality-ladder

    # Eigene Qualitaetsstufen statt Default-Leiter (--qualities ist ein SEPARATES Flag, damit
    # --quality-ladder ein reiner Ein/Aus-Schalter bleibt und nie versehentlich die Quelldatei
    # als Wert verschluckt, egal an welcher Position es im Aufruf steht):
    python prepare-media.py "quelldateien/bilder/foo.webp" --slug mein-artikel --content-type ratgeber --eignung inline --quality-ladder --qualities 20,30,40,50,60,70,80

    # Hero-Bild mit Crop (links,oben,breite,hoehe in Pixel des ORIGINALS) + Qualitaets-Leiter:
    python prepare-media.py "quelldateien/bilder/foo.webp" --slug mein-artikel --content-type ratgeber --eignung hero --crop 0,300,1536,1100 --quality-ladder

    # Crop auf Ziel-Seitenverhaeltnis (zentriert), z.B. 16:9 fuer Hero:
    python prepare-media.py "quelldateien/bilder/foo.webp" --slug mein-artikel --content-type ratgeber --eignung hero --aspect 16:9 --quality-ladder

    # Einzelne Datei bei fixer Qualitaet (Alt-Verhalten, ohne Gate - nur fuer Eilfaelle/Nicht-
    # Artikel-Bilder; fuer Artikel-Inhalte IMMER --quality-ladder verwenden):
    python prepare-media.py "quelldateien/bilder/foo.webp" --slug mein-artikel --content-type ratgeber --eignung inline

    # Video: auf inline-Breite skalieren + Zeitausschnitt 00:03 bis 00:09:
    python prepare-media.py "quelldateien/videos/montage.MP4" --slug mein-artikel --eignung inline --trim 3,9

Ausgabe:
    artikel/content/<typ>/<slug>/bilder/<name>-web-q<N>.webp   (Bild, Qualitaets-Leiter, mehrere Kandidaten)
    artikel/content/<typ>/<slug>/bilder/<name>-web.webp        (Bild, Einzel-Modus ODER nach Finalisierung
                                                                 eines Kandidaten aus der Leiter)
    artikel/content/<typ>/<slug>/bilder/<name>-web.mp4         (Video, h264)

Das Skript skaliert NUR herunter, niemals hoch (kein Qualitaetsverlust durch Upscaling).
Der Dateiname der Ausgabe ist der Upload-Name fuer das CMS; die finale CDN-URL traegst du
nach dem Upload manuell ein (DUMMY-Konvention, siehe SKILL.md Schritt 4d).

Qualitaets-Leiter-Workflow (PFLICHT fuer Artikel-Bilder, siehe content-html-formatter/SKILL.md
Schritt 4c "Qualitaets-Gate"):
  1. Dieses Skript mit --quality-ladder aufrufen -> erzeugt <name>-web-q<N>.webp je Stufe,
     druckt eine Tabelle (Qualitaet | Groesse in KB | Datei) UND die finalen Pixelmasse
     (identisch fuer alle Stufen, da nur die Kompression variiert, nicht Zuschnitt/Skalierung).
  2. Jeden Kandidaten mit dem Read-Tool ansehen (v.a. Farbverlaeufe und dunkle Flaechen auf
     Bild-Bloecke/Banding pruefen).
  3. Dem User eine Tabelle zeigen (Bild | Groesse je Stufe | Empfehlung) und auf Bestaetigung
     warten - NICHT eigenmaechtig eine Stufe final setzen.
  4. Nach Bestaetigung: gewaehlten Kandidaten nach <name>-web.webp umbenennen, uebrige
     Kandidaten-Dateien loeschen.
  5. Die gedruckten Pixelmasse 1:1 als width="<W>" height="<H>" im <img>-Tag verwenden
     (Artikelbild-Klasse und CDN-Basis-URL siehe wissensbasis/html-elemente.md, Sektion Bild).
"""

import argparse
import glob
import os
import re
import subprocess
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))

# Neutrale Defaults (Anzeige x ~1.75-2 fuer Retina; Annahme: Textspalte ~800 px).
# Projekt-Werte kommen aus CLAUDE.md -> "Medien-Masse" (siehe load_theme_widths) oder CLI.
DEFAULT_TEXT_COLUMN = 800
DEFAULT_PRESET_WIDTH = {
    "hero": 1600,     # Aufmacher ueber die volle Lesebreite
    "inline": 1400,   # Standardbild in der Textspalte (Retina-Reserve)
    "detail": 900,    # halbe Spalte / Detailaufnahme
    "small": 900,     # Alias zu detail
}
WEBP_QUALITY = 82  # Fallback fuer den Einzel-Modus (ohne --quality-ladder)
# Default-Qualitaets-Leiter fuer --quality-ladder ohne eigene Werte. Deckt die Spanne ab, die
# sich in der Praxis als sinnvoll gezeigt hat (texturreiche/"unruhige" Motive vertragen niedrige
# Werte gut, glatte Farbverlaeufe/Hochglanz-Flaechen brauchen eher die oberen Werte).
DEFAULT_LADDER = [25, 35, 45, 55, 65, 75, 85]


def load_theme_widths():
    """Liest optionale Theme-Masse aus der Projekt-CLAUDE.md, Sektion "Medien-Masse"
    (auch "Medien-Maße" geschrieben). Erwartete Zeilen innerhalb der Sektion:
        - **Textspalte:** 800 px
        - **Ziel-Breite hero:** 1600 px
        - **Ziel-Breite inline:** 1400 px
        - **Ziel-Breite detail:** 900 px
    Fehlt die Sektion oder einzelne Zeilen, gelten CLI-Werte bzw. die neutralen Defaults."""
    path = os.path.join(PROJECT_ROOT, "CLAUDE.md")
    cfg = {}
    if not os.path.isfile(path):
        return cfg
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return cfg
    section = re.search(
        r"^#{2,4}[^\n]*Medien-Ma\w*[^\n]*\n(.*?)(?=^#{2,4}\s|\Z)",
        text, re.M | re.S | re.I,
    )
    if not section:
        return cfg
    body = section.group(1)
    patterns = {
        "text_column": r"Textspalte[^\d\n]*?(\d{2,5})",
        "hero": r"Ziel-Breite\s+hero[^\d\n]*?(\d{2,5})",
        "inline": r"Ziel-Breite\s+inline[^\d\n]*?(\d{2,5})",
        "detail": r"Ziel-Breite\s+detail[^\d\n]*?(\d{2,5})",
    }
    for key, pat in patterns.items():
        m = re.search(pat, body, re.I)
        if m:
            cfg[key] = int(m.group(1))
    return cfg


def human(nbytes):
    for unit in ("B", "KB", "MB"):
        if nbytes < 1024:
            return f"{nbytes:.0f} {unit}"
        nbytes /= 1024
    return f"{nbytes:.1f} GB"


def out_dir_for(slug, content_type=None):
    # Typisierte Struktur artikel/content/<typ>/<slug>/bilder/. Typ-Segmente laut Projekt-
    # Konvention: ratgeber|beratung|produkte|kollektionen|profile|landingpages.
    # Reihenfolge: (1) expliziter content_type, (2) glob artikel/content/*/<slug>,
    # (3) flacher Alt-Pfad (Sicherheitsnetz).
    content_root = os.path.join(PROJECT_ROOT, "artikel", "content")
    if content_type:
        base = os.path.join(content_root, content_type, slug)
    else:
        hits = [h for h in glob.glob(os.path.join(content_root, "*", slug)) if os.path.isdir(h)]
        base = hits[0] if hits else os.path.join(content_root, slug)
    d = os.path.join(base, "bilder")
    os.makedirs(d, exist_ok=True)
    return d


def parse_crop(crop_str):
    parts = [int(x) for x in crop_str.split(",")]
    if len(parts) != 4:
        sys.exit("Fehler: --crop braucht 4 Werte: links,oben,breite,hoehe")
    return parts  # x, y, w, h


def parse_qualities(qualities_str):
    try:
        values = sorted({int(x) for x in qualities_str.split(",")})
    except ValueError:
        sys.exit(f"Fehler: --qualities erwartet eine Kommaliste von Zahlen, z.B. 20,30,40,50 (bekommen: '{qualities_str}').")
    if not values:
        sys.exit("Fehler: --qualities enthaelt keine Werte.")
    for v in values:
        if not (1 <= v <= 100):
            sys.exit(f"Fehler: --qualities-Wert {v} ausserhalb des gueltigen Bereichs 1-100.")
    return values


def parse_aspect(aspect_str):
    a, b = aspect_str.split(":")
    return float(a) / float(b)


def crop_to_aspect(img, target_ratio):
    """Zentrierter Crop auf das Ziel-Seitenverhaeltnis."""
    w, h = img.size
    cur = w / h
    if abs(cur - target_ratio) < 0.01:
        return img
    if cur > target_ratio:           # zu breit -> Seiten beschneiden
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    else:                            # zu hoch -> oben/unten beschneiden
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        return img.crop((0, top, w, top + new_h))


def build_image(src, target_w, crop=None, aspect=None):
    """Laedt, croppt und skaliert EINMAL. Das Ergebnis-Objekt wird sowohl vom Einzel-Modus
    als auch von der Qualitaets-Leiter wiederverwendet, damit alle Kandidaten exakt denselben
    Bildinhalt haben - nur die WebP-Kompression unterscheidet sich zwischen den Kandidaten."""
    from PIL import Image
    img = Image.open(src)
    orig_size = img.size
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    if crop:
        x, y, w, h = crop
        img = img.crop((x, y, x + w, y + h))
    if aspect:
        img = crop_to_aspect(img, aspect)
    # nur herunterskalieren
    if img.width > target_w:
        new_h = round(img.height * target_w / img.width)
        img = img.resize((target_w, new_h), Image.LANCZOS)
    return img, orig_size


def save_quality_ladder(img, out_dir, base, qualities):
    """Speichert denselben Bildinhalt bei mehreren Qualitaetsstufen. Gibt Liste
    (quality, path, bytes) zurueck fuer die Tabellen-Ausgabe."""
    results = []
    for q in qualities:
        path = os.path.join(out_dir, f"{base}-web-q{q}.webp")
        img.save(path, "WEBP", quality=q, method=6)
        results.append((q, path, os.path.getsize(path)))
    return results


def print_crop_warnings(fw, fh, eignung, text_column):
    """Hoehen-Regel-Checks (siehe content-html-formatter/SKILL.md, Schritt 4b). Betrifft
    Zuschnitt/Seitenverhaeltnis, nicht die WebP-Qualitaet - gilt daher unveraendert fuer
    Einzel-Modus UND Qualitaets-Leiter (beide haben denselben Bildinhalt)."""
    anzeige_h = round(text_column * fh / fw)
    ratio = fh / fw
    if fw < text_column and eignung in ("hero", "inline"):
        print(f"  WARNUNG Schaerfe: nur {fw}px breit -> wird in der {text_column}px-Spalte hochskaliert (unscharf). Groesseres Original waehlen.")
    if ratio > 1.0:
        print(f"  WARNUNG Hochformat: {fw}x{fh} ist hoeher als breit -> in {text_column}px-Spalte {anzeige_h}px hoch (ueberfuellt den Viewport). Quer zuschneiden (--crop / --aspect).")
    elif ratio > 0.8 and eignung == "inline":
        print(f"  HINWEIS Hoehe: Anzeige {anzeige_h}px hoch (>{round(text_column * 0.8)}px) -> flacher schneiden Richtung 4:3/3:2, sofern der Fokus erhalten bleibt.")
    else:
        print(f"  OK: Anzeige in {text_column}px-Spalte = {text_column}x{anzeige_h}px.")


def process_video(src, out_path, target_w, trim=None, crop=None):
    cmd = ["ffmpeg", "-y"]
    if trim:
        start, end = trim
        cmd += ["-ss", str(start), "-to", str(end)]
    cmd += ["-i", src]
    filters = []
    if crop:
        x, y, w, h = crop
        filters.append(f"crop={w}:{h}:{x}:{y}")
    # nur herunterskalieren, Breite = target_w, Hoehe proportional (-2 = gerade Zahl)
    filters.append(f"scale='min({target_w},iw)':-2")
    cmd += ["-vf", ",".join(filters)]
    cmd += ["-c:v", "libx264", "-crf", "23", "-preset", "slow",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            "-c:a", "aac", "-b:a", "128k", out_path]
    subprocess.run(cmd, check=True, capture_output=True)


def main():
    p = argparse.ArgumentParser(description="Bereitet Bild/Video web-fertig fuer den CMS-Upload auf.")
    p.add_argument("source", help="Pfad zur Quelldatei (Bild oder Video)")
    p.add_argument("--slug", required=True, help="Artikel-Slug -> Ausgabe nach artikel/content/<typ>/<slug>/bilder/")
    p.add_argument("--content-type", help="Typ-Ordner (ratgeber|beratung|produkte|kollektionen|profile|landingpages). Fehlt er, wird der Ordner per glob artikel/content/*/<slug> gefunden.")
    p.add_argument("--eignung", default="inline", choices=list(DEFAULT_PRESET_WIDTH.keys()),
                   help="hero | inline | detail | small (steuert Ziel-Breite)")
    p.add_argument("--width", type=int, help="Ziel-Breite px (ueberschreibt --eignung-Preset und CLAUDE.md)")
    p.add_argument("--text-column", type=int,
                   help="Anzeige-Spaltenbreite px fuer die Hoehen-/Schaerfe-Checks (ueberschreibt CLAUDE.md; Default 800)")
    p.add_argument("--crop", help="Raeumlicher Crop: links,oben,breite,hoehe (Pixel des Originals)")
    p.add_argument("--aspect", help="Zentrierter Crop auf Seitenverhaeltnis, z.B. 16:9 oder 4:3")
    p.add_argument("--trim", help="Nur Video: Zeitausschnitt start,end in Sekunden, z.B. 3,9")
    p.add_argument(
        "--quality-ladder",
        action="store_true",
        help=(
            "PFLICHT fuer Artikel-Bilder (siehe SKILL.md Schritt 4c): erzeugt mehrere WebP-"
            "Kandidaten statt einer Datei. Reiner Ein/Aus-Schalter (kein Wert) - eigene Stufen "
            "ueber das separate --qualities-Flag. Nur fuer Bilder, nicht Videos."
        ),
    )
    p.add_argument(
        "--qualities",
        default=",".join(map(str, DEFAULT_LADDER)),
        help=(
            f"Kommaliste eigener Qualitaetsstufen fuer --quality-ladder (Default: "
            f"{','.join(map(str, DEFAULT_LADDER))}). Ohne --quality-ladder wirkungslos."
        ),
    )
    args = p.parse_args()

    src = args.source if os.path.isabs(args.source) else os.path.join(PROJECT_ROOT, args.source)
    if not os.path.isfile(src):
        sys.exit(f"Fehler: Quelldatei nicht gefunden: {src}")

    ext = os.path.splitext(src)[1].lower()
    is_video = ext in (".mp4", ".mov", ".m4v", ".webm", ".avi")
    if is_video and args.quality_ladder:
        sys.exit("Fehler: --quality-ladder gilt nur fuer Bilder, nicht fuer Videos.")

    # Theme-Masse aufloesen: CLI > CLAUDE.md ("Medien-Masse") > neutrale Defaults.
    theme = load_theme_widths()
    presets = dict(DEFAULT_PRESET_WIDTH)
    for key in ("hero", "inline", "detail"):
        if key in theme:
            presets[key] = theme[key]
    presets["small"] = presets["detail"]
    text_column = args.text_column or theme.get("text_column", DEFAULT_TEXT_COLUMN)
    target_w = args.width or presets[args.eignung]
    if theme:
        print(f"Theme-Masse aus CLAUDE.md (Medien-Masse): {theme}")

    crop = parse_crop(args.crop) if args.crop else None
    aspect = parse_aspect(args.aspect) if args.aspect else None
    base = os.path.splitext(os.path.basename(src))[0]
    out_dir = out_dir_for(args.slug, args.content_type)

    if is_video:
        out_path = os.path.join(out_dir, f"{base}-web.mp4")
        trim = [float(x) for x in args.trim.split(",")] if args.trim else None
        process_video(src, out_path, target_w, trim=trim, crop=crop)
        size_after = os.path.getsize(out_path)
        print(f"Video gespeichert: {out_path}")
        print(f"  Ziel-Breite: {target_w}px | Dateigroesse: {human(size_after)}")
        if trim:
            print(f"  Zeitausschnitt: {trim[0]}s - {trim[1]}s")
        print(f"\nUpload-Name fuer das CMS: {os.path.basename(out_path)}")
        print("Nach Upload die echte CDN-URL im Artikel eintragen (DUMMY- entfernen).")
        return

    img, orig = build_image(src, target_w, crop=crop, aspect=aspect)
    fw, fh = img.size
    size_before = os.path.getsize(src)

    if args.quality_ladder:
        qualities = parse_qualities(args.qualities)
        results = save_quality_ladder(img, out_dir, base, qualities)
        print(f"Qualitaets-Kandidaten erzeugt in: {out_dir}")
        print(f"  Original: {orig[0]}x{orig[1]} ({human(size_before)})  ->  Ziel: {fw}x{fh} (identisch fuer alle Kandidaten)")
        print()
        print("  | Qualitaet | Groesse | Datei |")
        print("  |---|---|---|")
        for q, path, size in results:
            print(f"  | q{q} | {human(size)} | {os.path.basename(path)} |")
        print()
        print(f'  Masse fuer <img width/height>: width="{fw}" height="{fh}" (gilt fuer JEDEN Kandidaten, da Zuschnitt/Skalierung identisch sind - nur die Kompression unterscheidet sich)')
        print()
        print_crop_warnings(fw, fh, args.eignung, text_column)
        print()
        print("  NAECHSTER SCHRITT (Pflicht-Gate, siehe SKILL.md Schritt 4c):")
        print("  1. Kandidaten mit dem Read-Tool visuell pruefen (v.a. Farbverlaeufe/dunkle Flaechen auf Bild-Bloecke/Banding).")
        print("  2. Obige Tabelle + Einschaetzung dem User zeigen, Bestaetigung abwarten.")
        print(f"  3. Gewaehlten Kandidaten nach {base}-web.webp umbenennen, uebrige Kandidaten-Dateien loeschen.")
    else:
        out_path = os.path.join(out_dir, f"{base}-web.webp")
        img.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
        size_after = os.path.getsize(out_path)
        print(f"Bild gespeichert: {out_path}")
        print(f"  {orig[0]}x{orig[1]} ({human(size_before)})  ->  {fw}x{fh} ({human(size_after)})")
        print(f'  Masse fuer <img width/height>: width="{fw}" height="{fh}"')
        print()
        print_crop_warnings(fw, fh, args.eignung, text_column)
        print(f"\nUpload-Name fuer das CMS: {os.path.basename(out_path)}")
        print("Nach Upload die echte CDN-URL im Artikel eintragen (DUMMY- entfernen).")


if __name__ == "__main__":
    main()
