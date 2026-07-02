# Track Lab × GTM Autoresearch — Integration Addendum

> **E0 status: ✅ complete (read-only ground-truth wiring done).** The scorer and loop output
> shapes were confirmed directly against source, every recorded `loop-results` run was catalogued,
> and the demo's S7 scenario is now honestly labeled an **illustrative composite** rather than a
> single "real first run." See the [E0 ground-truth note](#e0-ground-truth-note-what-is-actually-recorded)
> below for the real numbers and where they live.

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
- **Recorded runs exist, but "84.3% → 91.2%" is an illustrative composite — not one run.**
  The `84.3% → 91.2%, 5 rounds, 2 kept / 3 reverted` line (repeated in the repo README and in the
  S7 demo copy) does not correspond to any single recorded run. `84.3%` is the *start* of a Shopify
  run that made no progress (all 5 rounds `json_fail`); `91.2%` is the *final* of a *different*
  Shopify run that started at `87.6%`. The S7 demo keeps these numbers but is now labeled a
  composite. Real recorded runs (read-only) — use one of these if a genuine fixture is ever wanted:
  - `DOCUMENTATION/loops/gtm-autoresearch/loop-results/2026-04-08T184826.json` — BLADE `blade-web.json`,
    15 rounds, **62.2% → 73.5%** (pre-round-0 53.6%), 4 improved / 11 reverted
  - `content/gtm-templates/HRE/loop-results/2026-04-07T231552.json` — Shopify, 5 rounds,
    **87.6% → 91.2%**, 3 improved / 2 json_fail
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
PHASE E0 — Ground truth wiring (read-only, no new scoring logic)  ✅ COMPLETE
  • track-eval references evals/eval_gtm_signal_quality.ts and scripts/run-gtm-loop.ts
    directly — does NOT reimplement the 12-dimension scorer          [confirmed against source]
  • catalogued every recorded loop-results run; the demo's "84.3% → 91.2%" is kept but relabeled
    an ILLUSTRATIVE COMPOSITE (no single run matches it — see the E0 ground-truth note below).
    Real runs are recorded for a future genuine fixture; swapping one in is an E1/E2 decision.
  • no code changes inside gtm-autoresearch — organized-tracking only reads from it
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
  • public replay uses a frozen recorded run (see E0 note) — deterministic, zero live ad-platform
    keys; if S7 still shows the illustrative composite, swapping in a real run happens here
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

## E0 ground-truth note: what is actually recorded

E0 read the sibling repo directly (read-only, no commits). Findings:

**Scorer output shape** (`evals/eval_gtm_signal_quality.ts` — referenced, never reimplemented):

```ts
type IssueSeverity = "error" | "warning" | "info";
interface GtmIssue       { dimension: string; severity: IssueSeverity; entity: string; message: string }
interface DimensionScore { name: string; weight: number; score: number /* 0..1 */; issues: GtmIssue[] }
interface GtmSignalQualityResult { overallScore: number; dimensions: DimensionScore[]; issues: GtmIssue[] }
```

**Per-round frozen-log shape** (as `scripts/run-gtm-loop.ts` writes it to `loop-results/*.json`):

```ts
{ round, score, dimensions: { [name]: number /* 0..1 */ },
  issueCount, action: "improved" | "reverted" | "json_fail", mutationSummary }
```

**The "84.3% → 91.2%" headline is a composite, not a run.** Every recorded run on disk:

| File | Template | Rounds | Start → Final | Actions |
|---|---|---:|---|---|
| `DOCUMENTATION/loops/gtm-autoresearch/loop-results/2026-04-08T184826.json` | BLADE `blade-web.json` | 15 | 62.2% → 73.5% (pre-r0 53.6%) | 4 improved / 11 reverted |
| `content/gtm-templates/BLADE/loop-results/2026-04-29T143650.json` | BLADE `blade-web.json` | 30 | 53.6% → 77.3% | 6 improved / 24 reverted |
| `content/gtm-templates/HRE/loop-results/2026-04-08T180812.json` | BLADE `blade-web.json` | 15 | 64.7% → 76.8% | 7 improved / 8 reverted |
| `content/gtm-templates/HRE/loop-results/2026-04-07T231552.json` | Shopify ecom | 5 | **87.6% → 91.2%** | 3 improved / 2 json_fail |
| `content/gtm-templates/HRE/loop-results/2026-04-08T170125.json` | Shopify ecom | 4 | 90.7% → 95.7% | 3 improved / 1 reverted |
| `content/gtm-templates/HRE/loop-results/2026-04-08T171312.json` | Shopify ecom | 3 | 94.8% → 94.8% | 2 improved / 1 reverted |
| `content/gtm-templates/HRE/loop-results/2026-04-08T165750.json` | Shopify ecom | 3 | 95.3% → 95.3% | 1 improved / 2 reverted |
| `content/gtm-templates/HRE/loop-results/2026-04-08T170646.json` | Shopify ecom | 5 | **84.3% → 84.3%** | 5 json_fail (no progress) |

The demo's `84.3%` is the *start* of the last row (a run that never improved); `91.2%` is the
*final* of the Shopify row above it (which started at 87.6%). No single run is "84.3% → 91.2% in
5 rounds, 2 kept / 3 reverted." **Decision (this pass): keep the composite numbers for the demo
walkthrough but label them illustrative** in `track-lab-demo.html` (S7 `heroSub`) and here — rather
than swap in a real run and silently change the headline. If/when a genuine fixture is wanted, the
BLADE run (`…184826.json`, the designated log dir) or the 87.6% → 91.2% Shopify run are the honest
candidates, with the headline corrected to match.

> Note: the `gtm-autoresearch` README (`## Current gaps`) and its `DOCUMENTATION/track-lab-integration.md`
> repeat the same composite `84.3% → 91.2%` figure. Correcting those is gtm-autoresearch's call
> (E3, cross-repo) — E0 does not commit to that repo.

---

## What NOT to build here

- **Not re-specifying the SQLite correlation engine.** `DOCUMENTATION/schema-design-correlation-engine.md`
  already has its own implementation order (install `better-sqlite3` → `lib/db.ts` → dual-write in
  `run-gtm-loop.ts` → `scripts/query-results.ts`). That's gtm-autoresearch's roadmap, not Track Lab's.
- **Not reimplementing the 12-dimension scorer.** Track Lab reads its output; it never recomputes scores.
- **Not adding a TikTok scorer dimension.** TikTok stays at the partner layer (Stape `tiktok-tag`)
  until gtm-autoresearch's own scorer grows a 13th dimension — that's their call to make, not this addendum's.
