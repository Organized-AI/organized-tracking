<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->
---
name: track-adapter-builder
description: Build track-trace adapters (otel-adapter, gtm-round-adapter) that normalize different sources into the shared AgentRun/AgentStep envelope so the log viewer never forks per source.
triggers:
  - "build track adapter"
  - "gtm-round-adapter"
  - "otel adapter"
  - "phase e1"
---

# Track Adapter Builder

## Purpose

Map heterogeneous sources into **one** `AgentRun` / `AgentStep` envelope so every Track Lab
scenario (S1–S7) replays through the same 4-panel viewer with no UI fork.

## Design invariants

- Both adapters emit the **same** envelope. Adding a source is additive — never a rewrite of an
  existing adapter.
- `otel-adapter` (S1–S6) maps Claude Code OTEL → `AgentStep{ type: prompt|tool_use|execute|tool_result }`.
- `gtm-round-adapter` (S7) maps a `loop-results` run → `AgentStep{ type: 'round', roundNum, score,
  dimensionDeltas[], issuesFound[], configDelta, action: 'keep'|'revert' }`.
- The round adapter's data source is swappable: static loop-results JSON today, live
  `experiments.sqlite` once gtm-autoresearch's correlation engine ships — no envelope change.

## Workflow

### Phase 1: Analysis
- Confirm the current `AgentRun`/`AgentStep` type from `packages/track-trace`.
- Confirm the source shape (OTEL spans, or the frozen loop-results JSON).

### Phase 2: Execution
- Implement the pure mapping function `source → AgentStep[]`. No side effects, no network.
- Preserve real values verbatim; do not synthesize numbers the source does not contain.

### Phase 3: Verification
- Snapshot-test the mapping against a fixture.
- Confirm the existing otel-adapter output is byte-identical (no regression).

## Tools Required

- Read / Edit / Write within `packages/track-trace`
- Test runner

## Success Criteria

- [ ] New adapter emits the shared envelope; no UI fork
- [ ] Existing adapters unchanged
- [ ] Mapping is pure and deterministic
- [ ] Apache-2.0 SPDX header on every new file
