// rate-limit.mjs — Rate-Limiting, Backoff und Lauf-Budgets.
// Belegt: GKP-API ~1 QPS/Customer-ID (RESOURCE_EXHAUSTED bei Ueberschreitung).
// SerpApi Free = 250 Suchen/Monat → konservatives Lauf-Cap statt Stundenfenster.

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Token-Bucket (z. B. GKP: capacity 1, refill 1/s) ──
export class TokenBucket {
  constructor(capacity = 1, refillPerSec = 1) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillPerSec = refillPerSec;
    this.last = Date.now();
  }
  async take() {
    for (;;) {
      const now = Date.now();
      this.tokens = Math.min(
        this.capacity,
        this.tokens + ((now - this.last) / 1000) * this.refillPerSec,
      );
      this.last = now;
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      await sleep(Math.ceil(((1 - this.tokens) / this.refillPerSec) * 1000));
    }
  }
}

// ── Exponentielles Backoff mit Retry ──
// fn() darf werfen; bei Fehler 10s/20s/40s … bis maxRetries, dann re-throw.
export async function withBackoff(fn, { maxRetries = 3, baseMs = 10000, label = "call" } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxRetries) break;
      const wait = baseMs * Math.pow(2, attempt);
      process.stderr.write(
        `[rate-limit] ${label} fehlgeschlagen (Versuch ${attempt + 1}/${maxRetries + 1}), warte ${wait / 1000}s: ${err.message || err}\n`,
      );
      await sleep(wait);
    }
  }
  throw lastErr;
}

// ── SERP-Lauf-Budget ──
// Free-Plan-Schutz: hartes Cap an SerpApi-Calls pro Lauf. Default 50,
// ueberschreibbar via env SERP_RUN_CAP. Wirft, sobald das Cap erreicht ist —
// der Aufrufer faengt das und schreibt einen Checkpoint (resumebar).
export class SerpBudget {
  constructor(cap = Number(process.env.SERP_RUN_CAP) || 50) {
    this.cap = cap;
    this.used = 0;
  }
  get remaining() {
    return Math.max(0, this.cap - this.used);
  }
  spend(label = "") {
    if (this.used >= this.cap) {
      const e = new Error(
        `SERP_BUDGET_EXHAUSTED: Lauf-Cap ${this.cap} erreicht${label ? " bei " + label : ""}. Checkpoint schreiben und spaeter fortsetzen.`,
      );
      e.code = "SERP_BUDGET_EXHAUSTED";
      throw e;
    }
    this.used += 1;
    return this.remaining;
  }
}
