# Track Lab × GTM Autoresearch — Integration Addendum

Extends `BUILD-PLAN-tracking-lab-harness.md` (Phases D0–D5). This addendum wires the **real**
`Organized-AI/gtm-autoresearch` repo into the demo harness as its flagship scenario — the thing
the original suite plan called "the first consumer that ties [Meta/Google + Stape] together."

Everything below is grounded in what's actually in the repo (checked directly), not a re-guess:

- **Real loop, already running:** `score → build prompt → mutate via Claude → validate →
  keep/revert → repeat`, driven by `scripts/run-gtm-loop.ts` + `scripts/refresh-ads-snapshot.ts`
- **Real 12-dimension scorer** (`evals/eval_gtm_signal_quality.ts`): 8 structural dimensions
  (tag coverage, parameter completeness, dedup, consent, naming, variable hygiene, trigger
  quality, folder org) + 4 ads-driven dimensions (Meta Ads alignment, CAPI coverage, funnel
  integrity, Google Ads alignment)
- **Real first-run result, already recorded:** 5 rounds, **84.3% → 91.2%**, 2 changes kept /
  3 reverted — full dimension table lives in the repo README, raw logs under
  `DOCUMENTATION/loops/gtm-autoresearch/loop-results/`
- **Shopify is already native** — `content/gtm-templates/HRE/seed/shopify-ecom-web.json` and a
  funnel-integrity dimension scored against Shopify ecom norms. No separate Shopify MCP needed.
- **A correlation-engine schema is already designed** (not yet implemented) in
  `DOCUMENTATION/schema-design-correlation-engine.md`: `experiments → rounds →
  dimension_scores/issues/config_snapshots/config_deltas → ads_observations`, SQLite via
  `better-sqlite3`, dual-write into `run-gtm-loop.ts` planned as its own implementation step.
- **TikTok** is already covered at the partner layer via Stape's `tiktok-tag` server-side
  template (per the suite's ownership matrix) — not a scorer dimension yet, no action needed here.

---

## The two-layer story (why this is the flagship scenario)

Track Lab's existing scenarios (S1–S6) show **agent mechanics** — what Claude Code did: prompt,
tool call, execute, tool result, tokens. gtm-autoresearch adds a second layer Track Lab doesn't
have yet: **domain outcome** — what happened to the GTM config and the ad-platform metrics as a
result. Showing both together, for the same run, is the pitch a measurement professional can't
get from a generic agent demo.

```
   LAYER 1 — AGENT MECHANICS (Claude Code OTEL)        LAYER 2 — DOMAIN OUTCOME (gtm-autoresearch)
   prompt → tool_use → execute → tool_result → usage    round → score → dimension deltas →
                                                          config delta → keep/revert

              └──────────────────┬──────────────────────────────────┘
                                  ▼
                  ONE AgentRun envelope, ONE log viewer,
                  rendered side by side for the same run
```

---

## Feature map — the addition

```
                 TRACK LAB · S7 "NIGHTLY AUTORESEARCH LOOP" (flagship scenario)

  ┌──────────────────────────────────────────────────────────────────────────┐
  │  SOURCE OF TRUTH — gtm-autoresearch (NOT reimplemented, referenced)        │
  │   evals/eval_gtm_signal_quality.ts   ← the real 12-dimension scorer         │
  │   scripts/run-gtm-loop.ts            ← the real loop (score→mutate→...)   │
  │   DOCUMENTATION/loops/.../loop-results/  ← real first-run log (frozen)     │
  │   data/signals/*.json                ← frozen ads snapshot (sandbox mode) │
  └───────────────┬──────────────────────────────────────────────────────────┘
                  │ read-only, TRACK_MODE=sandbox (frozen snapshot, no live keys)
                  ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  track-trace  (extended — same package as D0, new adapter added)          │
  │                                                                            │
  │   otel-adapter (existing, D0)          gtm-round-adapter (NEW)             │
  │   Claude Code OTEL → AgentStep         loop-results JSON → AgentStep       │
  │   type: prompt|tool_use|execute|       type: 'round' → {roundNum, score,   │
  │         tool_result                          dimensionDeltas[], issues[],  │
  │                                               configDelta, action:         │
  │                                               keep|revert}                 │
  │                                                                            │
  │   BOTH adapters emit the SAME AgentRun/AgentStep envelope → no UI fork     │
  └───────────────┬──────────────────────────────────────────────────────────┘
                  ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  track-lab UI — S7 replay (same 4-panel layout as S1–S6)                  │
  │   TOOL TIMELINE → becomes ROUND TIMELINE: round 1…5, score badge each     │
  │   EXECUTE PANEL → same stdout style gtm-autoresearch already prints        │
  │   METER BAR      → adds SCORE 84.3% → 91.2% alongside tokens/cost/cache    │
  │   FINDINGS       → reuses the real "biggest levers" table from the README │
  │                     (consent 60%, funnel integrity 70%, Google Ads 80%)   │
  └──────────────────────────────────────────────────────────────────────────┘

  FUTURE (tracked in gtm-autoresearch's own roadmap, not re-specified here):
  once DOCUMENTATION/schema-design-correlation-engine.md ships → gtm-round-adapter
  swaps its data source from static loop-results JSON to live experiments.sqlite queries.
  No change needed on the Track Lab side when that happens — same envelope, new source.
```

---

## Phased implementation (continues from D0–D5; order, not schedule)

```
PHASE E0 — Ground truth wiring (read-only, no new scoring logic)
  • track-eval references evals/eval_gtm_signal_quality.ts and scripts/run-gtm-loop.ts
    directly — does NOT reimplement the 12-dimension scorer
  • import the real first-run log from DOCUMENTATION/loops/gtm-autoresearch/loop-results/
    as the frozen S7 sandbox fixture (real numbers, not invented ones)
  • no code changes inside gtm-autoresearch yet — organized-tracking only reads from it
        │
PHASE E1 — gtm-round-adapter (extends track-trace, package from D0)
  • new adapter maps a loop-results run into the shared AgentRun/AgentStep envelope
  • AgentStep.type extends to include 'round' — {roundNum, score, dimensionDeltas[],
    issuesFound[], configDelta, action: 'keep'|'revert'}
  • existing otel-adapter (S1–S6) untouched — this is additive, not a rewrite
        │
PHASE E2 — S7 scenario in the track-lab UI (same components as D3)
  • tool timeline panel renders as a round timeline for this scenario only
  • execute panel streams gtm-autoresearch's own log style (score→mutate→validate→keep/revert)
  • meter bar adds a SCORE stat; findings grid reuses the real "biggest levers" table
  • public replay uses the frozen first-run log — deterministic, zero live ad-platform keys
        │
PHASE E3 — Cross-repo cross-reference + attribution
  • DOCUMENTATION/track-lab-integration.md added to gtm-autoresearch, pointing back to the
    harness in organized-tracking (matches gtm-autoresearch's existing DOCUMENTATION/ convention)
  • organized-tracking's plan explicitly credits gtm-autoresearch as the source of truth —
    Track Lab consumes it, never forks or reimplements its scoring logic
  • when the correlation-engine SQLite schema ships (gtm-autoresearch's own roadmap item),
    gtm-round-adapter repoints from static JSON to live experiments.sqlite — no other change
```

---

## What NOT to build here

- **Not re-specifying the SQLite correlation engine.** `DOCUMENTATION/schema-design-correlation-engine.md`
  already has its own implementation order (install `better-sqlite3` → `lib/db.ts` → dual-write in
  `run-gtm-loop.ts` → `scripts/query-results.ts`). That's gtm-autoresearch's roadmap, not Track Lab's.
- **Not reimplementing the 12-dimension scorer.** Track Lab reads its output; it never recomputes scores.
- **Not adding a TikTok scorer dimension.** TikTok stays at the partner layer (Stape `tiktok-tag`)
  until gtm-autoresearch's own scorer grows a 13th dimension — that's their call to make, not this addendum's.
