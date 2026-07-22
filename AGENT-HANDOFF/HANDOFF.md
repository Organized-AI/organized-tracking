<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->

# Agent Handoff Document

## Project: Organized Tracking

### Quick context

CLI-first, white-label conversion-tracking monorepo. The CLI owns every write; MCP is a read-only
sidecar. The `docs/track-lab/` demo harness is the shop window; its flagship **S7** scenario wires
in the real `gtm-autoresearch` loop as source of truth.

### Key files to read

1. [CLAUDE.md](../CLAUDE.md) — project overview + the core principle
2. [README.md](../README.md) — plan index
3. [docs/track-lab/gtm-autoresearch-integration.md](../docs/track-lab/gtm-autoresearch-integration.md) — E0–E3 integration plan
4. [docs/cli-plan.md](../docs/cli-plan.md) — canonical architecture

### Current state

| Component | Status |
|-----------|--------|
| Organized Codebase agent templates | ✅ Applied (this session) |
| E0 — ground-truth wiring (read-only) | ✅ Complete (this session) |
| E1 — gtm-round-adapter | ⏳ Pending |
| E2 — S7 scenario in track-lab UI | ⏳ Pending (demo HTML exists as a mock) |
| E3 — cross-repo cross-reference | ⏳ Pending |
| Meta Ads CLI + MCP integration plan | ✅ Complete (`docs/meta-ads-integration.md`) — CLI = write executor, MCP = allowlisted read sidecar |

### Ground-truth findings (E0)

- Real scorer output shape confirmed in `gtm-autoresearch/evals/eval_gtm_signal_quality.ts`
  and loop shape in `scripts/run-gtm-loop.ts`. Track Lab references, never reimplements.
- The "84.3% → 91.2%" headline is **not** a single recorded run — it is a composite (84.3% is the
  start of a failed Shopify run that made no progress; 91.2% is the final of a *different* Shopify
  run that started at 87.6%). It is now labeled illustrative in the demo and the integration doc.
- Real recorded runs on disk (read-only, for when a real fixture is wanted):
  - `DOCUMENTATION/loops/gtm-autoresearch/loop-results/2026-04-08T184826.json` — BLADE `blade-web.json`,
    15 rounds, 62.2% → 73.5% (pre-round-0 53.6%), 4 improved / 11 reverted (the designated log dir).
  - `content/gtm-templates/HRE/loop-results/2026-04-07T231552.json` — Shopify, 5 rounds,
    87.6% → 91.2%, 3 improved / 2 json_fail.

### Known issues

- The S7 `steps` array is an illustrative composite, not a real recorded log. If a real fixture is
  ever desired, use the BLADE or Shopify run above and correct the headline accordingly.

### Next steps

1. E1 — build `gtm-round-adapter` mapping a loop-results run into the shared envelope.
2. E2 — render S7 from the adapter instead of hand-authored `steps`.
3. E3 — add `DOCUMENTATION/track-lab-integration.md` cross-reference (in gtm-autoresearch, their call).

### Important notes

- **Read-only** against `/Users/supabowl/gtm-autoresearch`. Never commit there.
- Apache-2.0 SPDX header on every new source/doc file.
