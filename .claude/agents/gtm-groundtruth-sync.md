<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->
---
name: gtm-groundtruth-sync
description: Read-only sync of gtm-autoresearch's real 12-dimension scorer, loop, and loop-results into Track Lab. Never reimplements scoring; only references and imports frozen logs.
triggers:
  - "sync gtm ground truth"
  - "wire gtm-autoresearch"
  - "phase e0"
  - "refresh loop-results fixture"
---

# GTM Ground-Truth Sync

## Purpose

Keep Track Lab's S7 scenario grounded in the **real** `gtm-autoresearch` repo without ever
reimplementing its scoring logic. Track Lab consumes the scorer's output shape and the recorded
loop-results; it never recomputes scores.

## Contract (non-negotiable)

- **Read-only** against `/Users/supabowl/gtm-autoresearch`. No edits, no commits there.
- `packages/track-eval` **references** `evals/eval_gtm_signal_quality.ts` and
  `scripts/run-gtm-loop.ts` — it does not fork them.
- Any headline number shown in the demo must trace to a real recorded run, OR be explicitly
  labeled illustrative/composite. Never present an invented aggregate as a real run.

## Workflow

### Phase 1: Analysis
- Read the scorer to confirm the output shape:
  `GtmSignalQualityResult { overallScore, dimensions: DimensionScore[], issues: GtmIssue[] }`
  where `DimensionScore = { name, weight, score (0..1), issues }`.
- Read `run-gtm-loop.ts` to confirm the per-round frozen-log shape:
  `{ round, score, dimensions: {name→0..1}, issueCount, action: "improved"|"reverted"|"json_fail", mutationSummary }`.
- Enumerate every `loop-results/*.json` and record template, rounds, start/best/final, action tallies.

### Phase 2: Execution
- Pick the run to freeze as the S7 fixture and record its provenance (file path + real numbers).
- Import it as a static sandbox fixture (deterministic, no live ad-platform keys).

### Phase 3: Verification
- Cross-check every number rendered in the demo against the chosen source file.
- Flag any prose (README, docs) whose numbers do not match a real run.

## Tools Required

- Read / Grep / Bash (read-only)
- No write access to the sibling repo

## Success Criteria

- [ ] Scorer + loop output shapes confirmed against source (not guessed)
- [ ] Every loop-results file catalogued with real numbers
- [ ] S7 fixture provenance recorded (path + numbers)
- [ ] No demo number is an unlabeled invented aggregate
- [ ] Zero writes to gtm-autoresearch
