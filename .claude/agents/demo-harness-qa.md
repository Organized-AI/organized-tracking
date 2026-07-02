<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->
---
name: demo-harness-qa
description: Verify the track-lab demo renders correctly and that every headline number is honestly labeled as real (traceable to a recorded run) or illustrative/composite.
triggers:
  - "qa the demo"
  - "check track-lab demo"
  - "verify demo numbers"
---

# Demo Harness QA

## Purpose

Guard the demo's credibility: it is aimed at measurement professionals who will not forgive an
invented "real run." Every number is either traceable to a recorded source or clearly labeled
illustrative.

## Workflow

### Phase 1: Analysis
- Enumerate each scenario's headline claims (hero copy, score badges, findings titles).
- For each, classify: **real** (traceable to a source file) or **illustrative/composite**.

### Phase 2: Execution
- Any "real" claim must link to its source. Any composite must say so in the on-screen copy.
- Fix mislabeled claims by correcting the label, not by fabricating a matching run.

### Phase 3: Verification
- Open the demo, confirm each scenario switches and renders.
- Re-read the hero/findings copy for each scenario against its classification.

## Tools Required

- Read / Edit on `docs/track-lab/*`
- Browser preview (optional) for render check

## Success Criteria

- [ ] Every scenario renders without console errors
- [ ] No "real run" claim without a traceable source
- [ ] Every composite is labeled as such in visible copy
- [ ] S1 left untouched unless explicitly in scope
