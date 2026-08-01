#!/usr/bin/env python3
"""Kontext-Wächter (Stop-Hook).

Misst nach jeder Antwort den tatsächlichen Kontextverbrauch der Session anhand
der Token-Zahlen im Transcript (JSONL) und stößt gestuft die Sicherung an:

  Stufe 1 (ab 60 %): Handoff schreiben + Changelog nachziehen + Learnings prüfen
  Stufe 2 (ab 85 %): Handoff aktualisieren

Mechanik: Der Hook gibt {"decision": "block", "reason": "<Auftrag>"} aus.
Claude erhält den Auftrag als Anweisung und arbeitet weiter; der eingebaute
Schleifenschutz (stop_hook_active) verhindert, dass der Folge-Stop erneut
blockt. Pro Session und Stufe feuert der Wächter genau einmal (Marker-Datei
unter tmp/handoff/).

Das Kontextfenster wird über die Umgebungsvariable CLAUDE_CONTEXT_WINDOW
konfiguriert (Default 200000, gesetzt in .claude/settings.json). Wer mit
1M-Kontext arbeitet, trägt dort 1000000 ein.

Der Hook darf niemals mit Exit-Code 2 enden (das würde den Stop blockieren,
ohne dass ein Auftrag ankommt) – deshalb ist main() komplett abgesichert und
jeder Fehlerpfad endet mit Exit 0.
"""

import datetime
import json
import os
import sys

WINDOW_DEFAULT = 200_000
STAGE1_PCT = 60.0
STAGE2_PCT = 85.0
TAIL_BYTES = 512 * 1024  # Transcripts können > 70 MB groß werden – nur das Ende lesen


def read_context_tokens(transcript_path):
    """Liefert den Kontextverbrauch der letzten Haupt-Antwort in Tokens (oder None).

    Liest die letzten TAIL_BYTES des Transcripts und sucht rückwärts die
    jüngste Assistant-Zeile mit usage-Block. input + cache_read + cache_creation
    ergeben zusammen die tatsächliche Kontextfüllung der letzten Anfrage.
    """
    with open(transcript_path, "rb") as f:
        f.seek(0, os.SEEK_END)
        size = f.tell()
        f.seek(max(0, size - TAIL_BYTES))
        chunk = f.read()
    lines = chunk.decode("utf-8", errors="replace").splitlines()
    if size > TAIL_BYTES and lines:
        lines = lines[1:]  # erste Zeile ist vermutlich angeschnitten
    for line in reversed(lines):
        if '"usage"' not in line:
            continue
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if obj.get("isSidechain"):
            continue  # Subagenten-Zeilen zählen nicht als Hauptkontext
        usage = (obj.get("message") or {}).get("usage") or {}
        if "input_tokens" not in usage:
            continue
        return (
            (usage.get("input_tokens") or 0)
            + (usage.get("cache_read_input_tokens") or 0)
            + (usage.get("cache_creation_input_tokens") or 0)
        )
    return None


def read_stdin_json():
    """stdin als Bytes lesen und BOM-tolerant dekodieren.

    Manche Zubringer-Shells (z. B. Windows PowerShell 5.1) stellen dem Payload
    ein UTF-8-BOM voran, an dem json.load(sys.stdin) scheitern würde.
    """
    raw = sys.stdin.buffer.read().decode("utf-8-sig", errors="replace")
    return json.loads(raw)


def load_state(state_file):
    """(stage, letzter_gemessener_prozentwert) aus der Marker-Datei."""
    try:
        with open(state_file, encoding="utf-8") as f:
            data = json.load(f)
        return int(data.get("stage", 0)), float(data.get("pct", 0.0))
    except (OSError, ValueError, TypeError):
        return 0, 0.0


def de_number(n):
    """120400 -> '120.400' (deutsche Tausendertrennung)."""
    return f"{n:,}".replace(",", ".")


def build_reason(stage, pct, tokens, window, handoff_file, today):
    kopf = (
        f"[Kontext-Wächter] Diese Session hat {pct:.0f} % des Kontextfensters erreicht "
        f"({de_number(tokens)} von {de_number(window)} Tokens)."
    )
    if stage == 1:
        return (
            f"{kopf} Sichere jetzt den Stand, bevor du weiterarbeitest:\n\n"
            f"1. HANDOFF: Schreibe ein Übergabedokument nach {handoff_file} "
            "(Ordner bei Bedarf anlegen, bestehende Datei überschreiben). Inhalt: woran gerade "
            "gearbeitet wird, welche Entscheidungen getroffen wurden, welche Wege verworfen "
            "wurden und warum, was als Nächstes ansteht. Bereits in Dateien festgehaltenes "
            "(Specs, Briefings, Commits) nur per Pfad referenzieren, nicht duplizieren. "
            "Sensible Daten (API-Keys, Zugangsdaten) auslassen.\n\n"
            f"2. CHANGELOG: Prüfe changelog/{today}.md und ergänze abgeschlossene Ergebnisse "
            "dieser Session, die dort noch fehlen. Nur Fakten im Perfekt, nichts Halbfertiges – "
            "der flüchtige Zustand gehört in den Handoff, nicht ins Changelog.\n\n"
            "3. LEARNINGS: Wurde in dieser Session ein technisches Problem gelöst, das die "
            "Learning-Kriterien der CLAUDE.md erfüllt (mehrere Anläufe, Ursache nicht aus der "
            "Fehlermeldung ablesbar, wiederholbar, Lösung nicht trivial)? Falls ja, schlage dem "
            "User einen Eintrag über den knowledge-base-entry-Skill vor. Falls nein, diesen "
            "Punkt kommentarlos überspringen.\n\n"
            "Danach beende deinen Turn normal."
        )
    return (
        f"{kopf} Die Kompaktierung rückt näher – bring das Übergabedokument auf den letzten "
        f"Stand:\n\n"
        f"AKTUALISIERE {handoff_file} so, dass es den JETZIGEN Stand vollständig wiedergibt "
        "(seit dem letzten Handoff Erledigtes, neue Entscheidungen, aktueller nächster Schritt). "
        "Die Datei komplett neu schreiben, nicht anhängen. Falls im heutigen Changelog-Eintrag "
        "inzwischen abgeschlossene Ergebnisse fehlen, ergänze sie ebenfalls.\n\n"
        "Danach beende deinen Turn normal."
    )


def main():
    payload = read_stdin_json()
    if payload.get("stop_hook_active"):
        return  # wir laufen gerade durch einen Block weiter – niemals erneut blocken
    transcript = payload.get("transcript_path")
    if not transcript or not os.path.isfile(transcript):
        return
    project = os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or "."
    try:
        window = int(os.environ.get("CLAUDE_CONTEXT_WINDOW") or WINDOW_DEFAULT)
    except ValueError:
        window = WINDOW_DEFAULT
    if window <= 0:
        window = WINDOW_DEFAULT

    tokens = read_context_tokens(transcript)
    if not tokens:
        return
    pct = tokens * 100.0 / window

    session = (payload.get("session_id") or "unbekannt")[:8]
    state_dir = os.path.join(project, "tmp", "handoff")
    state_file = os.path.join(state_dir, f".state-{session}.json")
    stage, last_pct = load_state(state_file)

    # Kompaktierung erkennen: Fällt der Verbrauch deutlich unter den beim
    # letzten Lauf gemessenen Stand, beginnt ein neuer Zyklus – Stufen wieder
    # freigeben. (Primär löscht session_start.py den Marker beim compact-Event;
    # dieser Fallback greift, falls der Hook dort nicht lief.)
    if stage > 0 and last_pct - pct > 25.0:
        stage = 0

    if pct >= STAGE2_PCT and stage < 2:
        new_stage = 2
    elif pct >= STAGE1_PCT and stage < 1:
        new_stage = 1
    else:
        new_stage = None

    # Marker bei JEDEM Lauf schreiben: pct dient dem nächsten Lauf als
    # Referenz für die Kompaktierungs-Erkennung und darf nicht veralten.
    os.makedirs(state_dir, exist_ok=True)
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump({"stage": new_stage or stage, "pct": round(pct, 1)}, f)
    if new_stage is None:
        return

    today = datetime.date.today().isoformat()
    handoff_file = f"tmp/handoff/handoff-{today}-{session}.md"
    reason = build_reason(new_stage, pct, tokens, window, handoff_file, today)
    # ensure_ascii (Default) hält die Ausgabe unabhängig vom Konsolen-Encoding
    print(json.dumps({"decision": "block", "reason": reason}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass  # ein kaputter Wächter darf die Session niemals stören
    sys.exit(0)
