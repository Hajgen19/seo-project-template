"""
create-docx.py – Erzeugt artikel.docx aus artikel.md (+ optional seo.md fuer das Deckblatt)

Generische Version: liest projektspezifische Werte aus CLAUDE.md / seo.md, statt sie hartzucodieren.

Nutzung: python create-docx.py <slug> [<projekt-root>]

Beispiel:
    python create-docx.py mein-artikel
    python create-docx.py mein-artikel "C:/Users/.../projekt-x"

Liest:
    artikel/content/<slug>/artikel.md
    artikel/content/<slug>/seo.md     (optional, fuer Meta-Daten auf dem Deckblatt)
    CLAUDE.md                         (optional, fuer Markenname, CMS-Hinweis, CTA-Pattern)

Schreibt:
    artikel/content/<slug>/artikel.docx

Konfiguration via CLAUDE.md (alle optional, sonst sinnvolle Defaults):
    Markenname:          aus erster H1 in CLAUDE.md (z.B. "# CLAUDE.md - Beispielkunde Projekt")
                         oder Pattern "**Marke:** <Name>"
    CMS-Editor-Hinweis:  Pattern "**CMS-Editor:** <Name>" (z.B. "Divi", "Liquid", "Webflow Designer"),
                         erscheint auf dem Deckblatt + in Hinweistexten. Default: "CMS-Editor".
    CTA-Pattern:         Pattern "**CTA-Pattern:** <regex>" – wird im Markdown gesucht und als
                         Button-Hinweis im DOCX gerendert. Default: keine CTA-Erkennung.

Markdown-Support:
    # / ## / ### / ####         Headings
    **fett** und *kursiv*       Inline-Formatierung
    [text](url)                 Links (fett+unterstrichen + URL in eckigen Klammern)
    | a | b | und |---|---|     Tabellen werden als echte Word-Tabellen gerendert
    - / 1.                       Listen
    > zitat                      Blockquote (kursiv)
    All-Caps / -text-            CTA-Button-Marker (zusaetzlich zu CTA-Pattern aus CLAUDE.md)

Abhaengigkeit:  pip install python-docx
"""

import os
import re
import sys
from datetime import date

try:
    from docx import Document
    from docx.shared import Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
except ImportError:
    print("Fehler: python-docx nicht installiert. Bitte ausfuehren: pip install python-docx")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Projekt-Konfiguration aus CLAUDE.md (optional)
# ---------------------------------------------------------------------------

def load_project_config(root):
    config = {
        "marke": os.path.basename(os.path.abspath(root)),
        "cms_editor": "CMS-Editor",
        "cta_pattern": None,
    }
    claude_path = os.path.join(root, "CLAUDE.md")
    if not os.path.exists(claude_path):
        return config

    with open(claude_path, "r", encoding="utf-8") as f:
        text = f.read()

    h1 = re.search(r"^#\s*CLAUDE\.md\s*[-–]\s*(.+?)(?:\s+Projekt)?\s*$", text, re.MULTILINE)
    if h1:
        config["marke"] = h1.group(1).strip()

    marke = re.search(r"\*\*Marke:\*\*\s*([^\n]+)", text)
    if marke:
        config["marke"] = marke.group(1).strip()

    cms = re.search(r"\*\*CMS-Editor:\*\*\s*([^\n]+)", text)
    if cms:
        config["cms_editor"] = cms.group(1).strip()

    cta = re.search(r"\*\*CTA-Pattern:\*\*\s*([^\n]+)", text)
    if cta:
        config["cta_pattern"] = cta.group(1).strip()

    return config


# ---------------------------------------------------------------------------
# seo.md Auslesehilfen
# ---------------------------------------------------------------------------

def parse_seo_meta(seo_path):
    meta = {"title": "", "description": "", "url": "", "stand": ""}
    if not os.path.exists(seo_path):
        return meta
    with open(seo_path, "r", encoding="utf-8") as f:
        content = f.read()
    patterns = {
        "title": r"\*\*Meta Title\*\*\s*\|\s*([^|\n]+)",
        "description": r"\*\*Meta Description\*\*\s*\|\s*([^|\n]+)",
        "url": r"\*\*URL:\*\*\s*([^\n]+)",
        "stand": r"\*\*Stand:\*\*\s*([^\n]+)",
    }
    for key, pattern in patterns.items():
        match = re.search(pattern, content)
        if match:
            meta[key] = match.group(1).strip()
    return meta


def parse_internal_links(seo_path):
    if not os.path.exists(seo_path):
        return []
    with open(seo_path, "r", encoding="utf-8") as f:
        content = f.read()
    section = re.search(
        r"##\s*Interne Verlinkung.*?\n\n(\|.*?\n)+",
        content,
        re.DOTALL,
    )
    if not section:
        return []
    rows = re.findall(r"\|\s*([^|\n]+?)\s*\|\s*([^|\n]+?)\s*\|", section.group(0))
    links = []
    for anker, ziel in rows:
        anker = anker.strip()
        ziel = ziel.strip()
        if not anker or not ziel:
            continue
        if anker.lower() in ("ankertext", "---", ":---"):
            continue
        if ziel.lower() in ("ziel-url", "---", ":---"):
            continue
        if "[TODO]" in anker or "[TODO]" in ziel:
            continue
        links.append((anker, ziel))
    return links


# ---------------------------------------------------------------------------
# Inline-Markdown (**bold**, *italic*, [text](url))
# ---------------------------------------------------------------------------

INLINE_RE = re.compile(
    r"(\*\*([^*\n]+)\*\*"
    r"|(?<!\*)\*([^*\n]+)\*(?!\*)"
    r"|\[([^\]]+)\]\(([^)\s]+)\))"
)


def render_inline(paragraph, text):
    pos = 0
    for m in INLINE_RE.finditer(text):
        if m.start() > pos:
            paragraph.add_run(text[pos:m.start()])
        bold_t, italic_t, link_t, link_url = m.group(2), m.group(3), m.group(4), m.group(5)
        if bold_t is not None:
            run = paragraph.add_run(bold_t)
            run.bold = True
        elif italic_t is not None:
            run = paragraph.add_run(italic_t)
            run.italic = True
        elif link_t is not None:
            run = paragraph.add_run(link_t)
            run.bold = True
            run.underline = True
            run.font.color.rgb = RGBColor(0, 102, 204)
            paragraph.add_run(f" [{link_url}]")
        pos = m.end()
    if pos < len(text):
        paragraph.add_run(text[pos:])


# ---------------------------------------------------------------------------
# Block-Parser: Tabellen, Listen, Absaetze
# ---------------------------------------------------------------------------

TABLE_SEP_RE = re.compile(r"^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$")
ORDERED_RE = re.compile(r"^(\d+)\.\s+(.*)$")


def split_table_row(raw):
    s = raw.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|"):
        s = s[:-1]
    return [c.strip() for c in s.split("|")]


def render_table(doc, raw_lines):
    if len(raw_lines) < 2:
        return
    header = split_table_row(raw_lines[0])
    data_rows = [split_table_row(r) for r in raw_lines[2:] if r.strip()]
    if not data_rows:
        data_rows = [[""] * len(header)]
    cols = len(header)
    for row in data_rows:
        while len(row) < cols:
            row.append("")
    table = doc.add_table(rows=1 + len(data_rows), cols=cols)
    try:
        table.style = "Light Grid Accent 1"
    except KeyError:
        pass
    for j, h in enumerate(header):
        cell = table.rows[0].cells[j]
        cell.text = ""
        run = cell.paragraphs[0].add_run(h)
        run.bold = True
    for i, row in enumerate(data_rows):
        for j, val in enumerate(row[:cols]):
            cell = table.rows[i + 1].cells[j]
            cell.text = ""
            render_inline(cell.paragraphs[0], val)


def render_list_item(doc, text, ordered):
    style = "List Number" if ordered else "List Bullet"
    try:
        p = doc.add_paragraph(style=style)
    except KeyError:
        bullet = "1. " if ordered else "• "
        p = doc.add_paragraph()
        p.add_run(bullet)
    render_inline(p, text)


def render_paragraph(doc, text):
    p = doc.add_paragraph()
    render_inline(p, text)


def render_blockquote(doc, text):
    p = doc.add_paragraph()
    p.add_run("„").italic = True
    pos = 0
    for m in INLINE_RE.finditer(text):
        if m.start() > pos:
            p.add_run(text[pos:m.start()]).italic = True
        bold_t, italic_t, link_t, link_url = m.group(2), m.group(3), m.group(4), m.group(5)
        if bold_t is not None:
            r = p.add_run(bold_t); r.bold = True; r.italic = True
        elif italic_t is not None:
            p.add_run(italic_t).italic = True
        elif link_t is not None:
            r = p.add_run(link_t)
            r.italic = True; r.underline = True
            r.font.color.rgb = RGBColor(0, 102, 204)
            p.add_run(f" [{link_url}]").italic = True
        pos = m.end()
    if pos < len(text):
        p.add_run(text[pos:]).italic = True
    p.add_run("“").italic = True


def render_cta(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(f"[BUTTON] {text.strip().strip('-').strip()}")
    run.bold = True
    run.font.size = Pt(12)


def is_cta(line, cta_pattern):
    s = line.strip()
    if not s:
        return False
    # All-Caps-Zeilen mit 1-6 Woertern sind oft CTA-Buttons
    if s.isupper() and 1 <= len(s.split()) <= 6:
        return True
    # Marken-CTA-Stil: "-Schreibt mir-", "-Get in Touch-"
    if re.match(r"^-[^-].*[^-]-$", s):
        return True
    # Projekt-spezifisches Pattern aus CLAUDE.md
    if cta_pattern:
        try:
            if re.search(cta_pattern, s):
                return True
        except re.error:
            pass
    return False


def render_blocks(doc, content, cta_pattern):
    lines = content.split("\n")
    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i].rstrip()
        if not raw.strip():
            i += 1
            continue
        if raw.strip() == "---":
            i += 1
            continue
        if raw.startswith("#### "):
            doc.add_heading(raw[5:].strip(), level=4)
            i += 1
            continue
        if raw.startswith("### "):
            doc.add_heading(raw[4:].strip(), level=3)
            i += 1
            continue
        if raw.startswith("## "):
            doc.add_heading(raw[3:].strip(), level=2)
            i += 1
            continue
        if raw.startswith("# "):
            doc.add_heading(raw[2:].strip(), level=1)
            i += 1
            continue
        if is_cta(raw, cta_pattern):
            render_cta(doc, raw)
            i += 1
            continue
        if raw.lstrip().startswith("|") and i + 1 < n and TABLE_SEP_RE.match(lines[i + 1].strip()):
            j = i
            tbl = []
            while j < n and lines[j].lstrip().startswith("|"):
                tbl.append(lines[j])
                j += 1
            render_table(doc, tbl)
            i = j
            continue
        stripped = raw.lstrip()
        if stripped.startswith("- ") or ORDERED_RE.match(stripped):
            j = i
            while j < n:
                cur = lines[j].rstrip()
                cs = cur.lstrip()
                if not cs:
                    k = j + 1
                    while k < n and not lines[k].strip():
                        k += 1
                    if k < n and (lines[k].lstrip().startswith("- ") or ORDERED_RE.match(lines[k].lstrip())):
                        j = k
                        continue
                    break
                if cs.startswith("- "):
                    render_list_item(doc, cs[2:], ordered=False)
                    j += 1
                    continue
                m = ORDERED_RE.match(cs)
                if m:
                    render_list_item(doc, m.group(2), ordered=True)
                    j += 1
                    continue
                break
            i = j
            continue
        if raw.startswith("> "):
            j = i
            quote_lines = []
            while j < n and lines[j].startswith("> "):
                quote_lines.append(lines[j][2:].rstrip())
                j += 1
            render_blockquote(doc, " ".join(quote_lines))
            i = j
            continue
        para = [raw.strip()]
        j = i + 1
        while j < n:
            nxt = lines[j].rstrip()
            if not nxt.strip():
                break
            ns = nxt.lstrip()
            if (ns.startswith("#") or ns.startswith("> ") or ns.startswith("- ")
                    or ORDERED_RE.match(ns) or ns.startswith("|") or nxt.strip() == "---"):
                break
            if is_cta(nxt, cta_pattern):
                break
            para.append(nxt.strip())
            j += 1
        render_paragraph(doc, " ".join(para))
        i = j


# ---------------------------------------------------------------------------
# Style-Setup (kompakte Spacings)
# ---------------------------------------------------------------------------

def setup_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)
    pf = normal.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(4)
    pf.line_spacing = 1.15

    for name, before, after in (
        ("Heading 1", 12, 4),
        ("Heading 2", 10, 3),
        ("Heading 3", 8, 2),
        ("Heading 4", 6, 2),
    ):
        try:
            s = doc.styles[name]
            s.paragraph_format.space_before = Pt(before)
            s.paragraph_format.space_after = Pt(after)
        except KeyError:
            pass

    for name in ("List Bullet", "List Number"):
        try:
            s = doc.styles[name]
            s.paragraph_format.space_before = Pt(0)
            s.paragraph_format.space_after = Pt(2)
        except KeyError:
            pass


# ---------------------------------------------------------------------------
# Hauptbau
# ---------------------------------------------------------------------------

def build_doc(slug, root):
    artikel_dir = os.path.join(root, "artikel", "content", slug)
    artikel_path = os.path.join(artikel_dir, "artikel.md")
    seo_path = os.path.join(artikel_dir, "seo.md")
    out_path = os.path.join(artikel_dir, "artikel.docx")

    if not os.path.exists(artikel_path):
        print(f"Fehler: {artikel_path} existiert nicht.")
        sys.exit(1)

    with open(artikel_path, "r", encoding="utf-8") as f:
        artikel_content = f.read()

    config = load_project_config(root)
    meta = parse_seo_meta(seo_path)
    links = parse_internal_links(seo_path)
    word_count = len(re.findall(r"\w+", artikel_content))

    doc = Document()
    setup_styles(doc)

    # Deckblatt
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(config["marke"])
    run.bold = True
    run.font.size = Pt(28)
    run.font.color.rgb = RGBColor(51, 51, 51)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(slug.replace("-", " ").title())
    run.font.size = Pt(22)
    run.font.color.rgb = RGBColor(100, 100, 100)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Seitentext + SEO-Daten")
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(130, 130, 130)

    deck_lines = [
        f"Seite: /{slug}/",
        f"Erstellt: {date.today().isoformat()}",
        f"Wörter: {word_count:,}".replace(",", "."),
    ]
    for line in deck_lines:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run(line).font.size = Pt(11)

    doc.add_page_break()

    if any(meta.values()):
        doc.add_heading("Meta-Tags", level=1)
        meta_intro = doc.add_paragraph(
            f"Diese Werte im {config['cms_editor']} unter Seiteneinstellungen oder im SEO-Plugin eintragen."
        )
        meta_intro.runs[0].italic = True

        meta_rows = [
            ("Meta Title", meta.get("title", "")),
            ("Meta Description", meta.get("description", "")),
            ("URL", meta.get("url", "")),
            ("Stand", meta.get("stand", "")),
        ]
        meta_rows = [(k, v) for k, v in meta_rows if v]
        if meta_rows:
            table = doc.add_table(rows=len(meta_rows) + 1, cols=2)
            try:
                table.style = "Light Grid Accent 1"
            except KeyError:
                pass
            hdr = table.rows[0].cells
            hdr[0].text = ""
            hdr[1].text = ""
            hdr[0].paragraphs[0].add_run("Feld").bold = True
            hdr[1].paragraphs[0].add_run("Wert").bold = True
            for i, (k, v) in enumerate(meta_rows):
                table.rows[i + 1].cells[0].text = k
                table.rows[i + 1].cells[1].text = v

    if links:
        doc.add_heading("Interne Links", level=1)
        link_intro = doc.add_paragraph(
            f"Beim Einpflegen ins CMS ({config['cms_editor']}) als echte Verlinkungen setzen."
        )
        link_intro.runs[0].italic = True
        table = doc.add_table(rows=len(links) + 1, cols=2)
        try:
            table.style = "Light Grid Accent 1"
        except KeyError:
            pass
        hdr = table.rows[0].cells
        hdr[0].text = ""
        hdr[1].text = ""
        hdr[0].paragraphs[0].add_run("Ankertext").bold = True
        hdr[1].paragraphs[0].add_run("Ziel-URL").bold = True
        for i, (anker, ziel) in enumerate(links):
            table.rows[i + 1].cells[0].text = anker
            table.rows[i + 1].cells[1].text = ziel

    doc.add_page_break()

    doc.add_heading("Seitentext", level=1)
    hint = doc.add_paragraph(
        f"Hinweise: Fett+unterstrichen = interner Link. [BUTTON] = CTA-Modul im {config['cms_editor']}."
    )
    hint.runs[0].italic = True

    render_blocks(doc, artikel_content, config["cta_pattern"])

    doc.save(out_path)
    print(f"Gespeichert: {out_path}  ({word_count} Woerter, Marke: {config['marke']})")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    slug = sys.argv[1]
    root = sys.argv[2] if len(sys.argv) >= 3 else os.getcwd()
    build_doc(slug, root)


if __name__ == "__main__":
    main()
