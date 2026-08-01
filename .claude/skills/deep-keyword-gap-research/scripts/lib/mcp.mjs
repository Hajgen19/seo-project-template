// mcp.mjs — Importierbarer Wrapper um die eingebettete lib/mcp-call.mjs.
// Ueber diesen headless-Pfad (.mcp.json) laeuft im Standard-Workflow NUR `serpapi`:
// der Server wird per JSON-RPC direkt angesprochen, unabhaengig davon, ob das Modell die
// Session-MCP-Tools geladen hat. So laeuft die Fleissarbeit auch unter `claude -p`.
// Keyword Planner (mcpwerk-ads) und GSC (mcpwerk-gsc) laufen im Standard-Workflow als
// BYO-JSON ueber das Modell (kw-enrich.mjs --raw / coverage-gsc.mjs --gsc-raw); der
// direkte Pfad ueber die .mcp.json ist dort nur Fallback (Server-Namen aus skill.config.json).
//
// Aufruf: const { ok, data, raw, error } = await mcpCall("serpapi", "search", {...});
//         const tools = await mcpList("serpapi");

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Eingebettete Kopie im selben lib/-Ordner → Skill ist self-contained (kein Hard-Link auf
// einen Geschwister-Skill; portabel in jedes Projekt kopierbar).
const MCP_CALL = resolve(__dirname, "mcp-call.mjs");

function run(args) {
  return new Promise((resolveP) => {
    const child = spawn(process.execPath, [MCP_CALL, ...args], {
      cwd: process.cwd(), // mcp-call.mjs liest .mcp.json aus dem CWD (= Projekt-Root)
      windowsHide: true,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => resolveP({ code: -1, out, err: String(e.message || e) }));
    child.on("close", (code) => resolveP({ code, out, err }));
  });
}

function parseMaybeJson(text) {
  const t = (text || "").trim();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    // mcp-call.mjs gibt mehrere text-Bloecke zeilenweise aus → versuche jede Zeile,
    // sonst gib den Rohtext zurueck (Aufrufer entscheidet).
    const lines = t
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const l of lines) {
      try {
        return JSON.parse(l);
      } catch {}
    }
    return t;
  }
}

// Ruft ein MCP-Tool auf. argsObj wird als @tempfile uebergeben (kein Shell-Escaping).
// Gibt { ok, data, raw, error }. ok=false bei Prozess-/RPC-Fehler — der Aufrufer
// behandelt das (Phase markieren, weiterlaufen), statt abzubrechen.
export async function mcpCall(server, tool, argsObj = {}) {
  const dir = mkdtempSync(resolve(tmpdir(), "kwgap-"));
  const argFile = resolve(dir, "args.json");
  try {
    writeFileSync(argFile, JSON.stringify(argsObj));
    const { code, out, err } = await run([server, "call", tool, "@" + argFile]);
    const data = parseMaybeJson(out);
    if (code !== 0) {
      return { ok: false, data, raw: out, error: (err || "").trim() || `exit ${code}` };
    }
    return { ok: true, data, raw: out, error: null };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function mcpList(server) {
  const { code, out, err } = await run([server, "list"]);
  if (code !== 0) return { ok: false, tools: [], error: (err || "").trim() || `exit ${code}` };
  return { ok: true, tools: parseMaybeJson(out) || [], error: null };
}

// Prueft, ob ein Remote-Server ueberhaupt erreichbar ist (fuer Graceful-Degradation,
// z. B. GSC noch ohne Daten / nicht freigeschaltet).
export async function mcpReachable(server) {
  const r = await mcpList(server);
  return r.ok && Array.isArray(r.tools) && r.tools.length > 0;
}
