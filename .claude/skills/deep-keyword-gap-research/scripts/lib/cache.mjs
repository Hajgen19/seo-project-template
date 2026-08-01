// cache.mjs — Dependency-freier JSON-Datei-Cache mit typisierten TTLs.
// Bewusst KEIN SQLite (kein better-sqlite3 im Repo; node:sqlite ist experimental):
// ein File pro Cache-Key unter tmp/kw-cache/ (gitignored). Erfuellt denselben
// Zweck — teure API-Antworten (GKP, SerpApi, Suggest) nicht mehrfach holen.
//
// TTL-Stufen begruendet: GKP-Metriken werden monatlich aktualisiert → 28 Tage.
// Suggest aendert sich langsam → 7 Tage. SERPs fuer transaktionale Queries
// volatil → 6 h; informationale stabiler → 48 h.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export const TTL = {
  GKP: 28 * 24 * 3600,
  SUGGEST: 7 * 24 * 3600,
  SERP_INFO: 48 * 3600,
  SERP_TX: 6 * 3600,
};

const CACHE_DIR = resolve(process.cwd(), "tmp", "kw-cache");

function ensureDir() {
  mkdirSync(CACHE_DIR, { recursive: true });
}

// Stabiler Cache-Key aus beliebigen Teilen (Query + Locale + Engine …).
export function cacheKey(...parts) {
  const raw = parts.map((p) => (typeof p === "object" ? JSON.stringify(p) : String(p))).join("|");
  return createHash("sha1").update(raw).digest("hex").slice(0, 24);
}

function fileFor(key) {
  return resolve(CACHE_DIR, key + ".json");
}

// Liefert payload oder null (fehlend ODER abgelaufen).
export function cacheGet(key) {
  const f = fileFor(key);
  if (!existsSync(f)) return null;
  try {
    const rec = JSON.parse(readFileSync(f, "utf8"));
    if (typeof rec.expires_at === "number" && rec.expires_at < Date.now()) return null;
    return rec.payload;
  } catch {
    return null;
  }
}

export function cacheSet(key, payload, ttlSeconds) {
  ensureDir();
  const rec = {
    key,
    payload,
    fetched_at: Date.now(),
    expires_at: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  };
  writeFileSync(fileFor(key), JSON.stringify(rec));
  return payload;
}

// Convenience: aus Cache lesen, sonst fn() ausfuehren und cachen.
export async function cached(key, ttlSeconds, fn) {
  const hit = cacheGet(key);
  if (hit !== null) return { value: hit, fromCache: true };
  const value = await fn();
  cacheSet(key, value, ttlSeconds);
  return { value, fromCache: false };
}
