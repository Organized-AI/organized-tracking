<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->

# Organized Tracking

A CLI-first, white-label conversion-tracking monorepo. The **CLI is the control plane** for all
GTM / GA4 / server-side event work — deterministic, version-controlled, CI-gated. **MCP is an
optional read/explore sidecar, never the write path.**

See [README.md](README.md) for the plan index and the core principle.

## Core principle (do not violate)

The CLI owns every write (`export → git → PR → publish`, gated on a green debug-agent run).
No PII through a hosted LLM — the write path has no model at all; the read path uses a local LLM
+ redaction. MCP servers are read/explore only.

## Project structure

```
.claude/                    # Claude Code configuration
├── agents/                 # Agent definitions (see below)
├── commands/               # Slash commands
├── hooks/                  # Pre/post hooks
└── settings.json           # Shared settings
AGENT-HANDOFF/              # Cross-session continuity — read HANDOFF.md first
docs/                       # Plans + the track-lab demo
├── cli-plan.md             # Canonical architecture
├── product-plan.md         # Product + distribution
├── stape-registry.md       # 169-template Stape capability registry
├── mart-catalog.md         # Organized Mart catalog
└── track-lab/              # Demo harness (Phases D0–D5) + gtm-autoresearch integration (E0–E3)
```

## Agents

| Agent | When to use |
|-------|-------------|
| `gtm-groundtruth-sync` | Read-only sync of gtm-autoresearch's real scorer/loop/loop-results into Track Lab. Never reimplements scoring. |
| `track-adapter-builder` | Build `track-trace` adapters (otel-adapter, gtm-round-adapter) that emit the shared AgentRun/AgentStep envelope. |
| `demo-harness-qa` | Verify the track-lab demo renders and that every headline number is honestly labeled (real vs. illustrative). |

## Sibling repos (read-only)

| Repo | Path | Contract |
|------|------|----------|
| `gtm-autoresearch` | `/Users/supabowl/gtm-autoresearch` | **Source of truth** for the 12-dimension scorer and the loop. Track Lab *reads* it; never forks, reimplements, or commits to it. |

## Licensing

Apache-2.0 throughout. New source/doc files carry an SPDX header
(`SPDX-License-Identifier: Apache-2.0`). See [LICENSE](LICENSE).
