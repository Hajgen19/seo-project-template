#!/usr/bin/env node
// Direkter JSON-RPC-Client für die Remote-MCP-Server aus .mcp.json (mcp-remote-Ersatz).
// Zweck: Skills können den Server auch dann nutzen, wenn er in der laufenden Session
// nicht als MCP-Tool geladen ist (z. B. Session älter als .mcp.json).
//
// Aufrufe (aus dem Projekt-Root):
//   node .claude/skills/deep-keyword-gap-research/scripts/lib/mcp-call.mjs serpapi list
//   node .claude/skills/deep-keyword-gap-research/scripts/lib/mcp-call.mjs serpapi call <tool> '<json-args>'
//   node .claude/skills/deep-keyword-gap-research/scripts/lib/mcp-call.mjs serpapi call <tool> @args.json
//
// <server> = Key aus .mcp.json → mcpServers (z. B. serpapi, mcpwerk-ads, mcpwerk-gsc).
// Im Standard-Workflow dieses Skills wird hier nur `serpapi` gebraucht — Ads/GSC laufen
// als BYO-JSON über das Modell (Session-MCP-Tools), nicht über diesen Pfad.
// Token/URL werden zur Laufzeit aus der lokalen (gitignorten) .mcp.json gelesen.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const [serverName, command, toolName, rawArgs] = process.argv.slice(2);
if (!serverName || !command) {
  console.error("Usage: mcp-call.mjs <server> list | <server> call <tool> '<json>'|@file.json");
  process.exit(1);
}

const mcpConfig = JSON.parse(readFileSync(resolve(process.cwd(), ".mcp.json"), "utf8"));
const entry = mcpConfig.mcpServers?.[serverName];
if (!entry) {
  console.error(
    `Server "${serverName}" nicht in .mcp.json gefunden. Vorhanden: ${Object.keys(mcpConfig.mcpServers || {}).join(", ")}`,
  );
  process.exit(1);
}
// Zwei .mcp.json-Formate unterstuetzen:
// 1) natives Claude-Code-HTTP-Format: { "type": "http", "url": "...", "headers": {...} }
// 2) mcp-remote-Proxy-Format: { "command": "...", "args": ["mcp-remote", "https://...", "--header", "Authorization: ..."] }
const args = entry.args || [];
const url = entry.url || args.find((a) => /^https?:\/\//.test(a));
const headerIdx = args.indexOf("--header");
const authHeader =
  headerIdx >= 0 ? args[headerIdx + 1] : entry.headers?.Authorization || entry.headers?.authorization || null;
if (!url) {
  console.error(`Server "${serverName}" ist kein Remote-Server (keine URL in "url" oder "args").`);
  process.exit(1);
}

let sessionId = null;
let nextId = 1;

async function rpc(method, params, isNotification = false) {
  const body = { jsonrpc: "2.0", method, ...(params !== undefined ? { params } : {}) };
  if (!isNotification) body.id = nextId++;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(authHeader ? { authorization: authHeader.replace(/^Authorization:\s*/i, "") } : {}),
      ...(sessionId ? { "mcp-session-id": sessionId } : {}),
    },
    body: JSON.stringify(body),
  });
  sessionId = res.headers.get("mcp-session-id") || sessionId;
  if (isNotification) return null;
  if (!res.ok)
    throw new Error(`HTTP ${res.status} bei ${method}: ${(await res.text()).slice(0, 500)}`);
  const text = await res.text();
  let payload = null;
  if ((res.headers.get("content-type") || "").includes("text/event-stream")) {
    for (const line of text.split("\n")) {
      if (!line.startsWith("data:")) continue;
      try {
        const msg = JSON.parse(line.slice(5).trim());
        if (msg.id !== undefined) payload = msg; // letzte Antwort mit id gewinnt
      } catch {}
    }
  } else {
    payload = JSON.parse(text);
  }
  if (payload?.error) throw new Error(`RPC-Fehler bei ${method}: ${JSON.stringify(payload.error)}`);
  return payload?.result;
}

await rpc("initialize", {
  protocolVersion: "2025-03-26",
  capabilities: {},
  clientInfo: { name: "kw-gap-skill", version: "1.0.0" },
});
await rpc("notifications/initialized", undefined, true);

if (command === "list") {
  const result = await rpc("tools/list", {});
  console.log(
    JSON.stringify(
      (result?.tools || []).map((t) => ({
        name: t.name,
        description: (t.description || "").slice(0, 200),
        input: t.inputSchema?.properties ? Object.keys(t.inputSchema.properties) : [],
      })),
      null,
      2,
    ),
  );
} else if (command === "call") {
  if (!toolName) {
    console.error("call braucht <tool>");
    process.exit(1);
  }
  let toolArgs = {};
  if (rawArgs) {
    toolArgs = JSON.parse(
      rawArgs.startsWith("@") ? readFileSync(rawArgs.slice(1), "utf8") : rawArgs,
    );
  }
  const result = await rpc("tools/call", { name: toolName, arguments: toolArgs });
  // MCP-Tool-Ergebnis: content[] mit text-Blöcken → direkt ausgeben
  for (const block of result?.content || []) {
    console.log(block.type === "text" ? block.text : JSON.stringify(block));
  }
  if (result?.isError) process.exit(2);
} else {
  console.error(`Unbekanntes Kommando "${command}" (list|call)`);
  process.exit(1);
}
