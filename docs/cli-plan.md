<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->

# Organized Tracking — CLI Plan (canonical architecture)

> **Provenance note:** the original `cli-plan.md` was referenced by README, CLAUDE.md,
> and AGENT-HANDOFF but never committed. This is a reconstruction from those
> references and the sibling plans, updated with the decisions locked since
> ([gtm-container-builds.md](gtm-container-builds.md),
> [meta-ads-integration.md](meta-ads-integration.md)).

**The thesis:** one deterministic CLI (`track`) is the control plane for all
GTM / GA4 / sGTM / ads-platform conversion-tracking work. Every write travels
`export → git → PR → publish`, gated on a green debug-agent run. MCP servers are
read/explore sidecars, never the write path.

---

## Why CLI over MCP

| | CLI (write path) | MCP (why not for writes) |
|---|---|---|
| **Determinism** | Same config in → same containers out; diffable, replayable | Model-mediated tool calls; non-deterministic sequencing |
| **Version control** | Config-as-code lives in git; PR review is the change gate | Mutations happen out-of-band, no artifact to review |
| **CI-gating** | Publish blocked until the debug-agent run is green | No natural place to interpose a gate |
| **Privacy** | No model on the write path at all | Every write transits a hosted LLM's context |
| **Auditability** | Exit codes, JSON logs, git history | Chat transcripts |

MCP still earns its seat — *reading*: insights, diagnostics, signal health,
workspace inspection. Reads inform; any needed change is emitted as a **proposed
`track` command** (a config diff) that travels the normal git gate.

## Privacy & data-handling

- **Write path: no model.** `track` is plain deterministic code calling official
  CLIs/APIs with the buyer's own credentials.
- **Read path: local LLM + redaction.** Exploratory reads (MCP sidecars, `track
  doctor`) pass through a redaction layer (strip tokens, hash PII) before any model
  sees them, and that model runs locally. No PII through a hosted LLM, ever.
- **Credentials:** buyer-provided per install (`.env` / ADC / system-user tokens);
  the demo lab uses sandbox fixtures and VCR cassettes, never live write tokens.

## The six absorbed tools

The product doesn't rebuild the ecosystem — it absorbs six existing tools behind one
command surface, each peer-installed or vendored per its license
([product-plan.md](product-plan.md) licensing table):

| # | Tool | Absorbed as | Path |
|---|---|---|---|
| 1 | **GWS CLI** (`@googleworkspace/cli`, Apache-2.0) | `track gtm *` write executor (discovery-driven GTM API v2) | peer-install (npm) |
| 2 | **ga-cli** (MIT) | `track ga4 *` executor | peer-install (pip) |
| 3 | **Meta Ads CLI** (Meta terms) | `track meta *` write executor | peer-install (pip) |
| 4 | **stape-io/data-tag** (Apache-2.0) | Web transport spine | vendored |
| 5 | **stape-io/data-client** (Apache-2.0) | Server transport spine | vendored |
| 6 | **Stape template library** (169 repos, Apache-2.0) | `track add <capability>` registry — fetch + version-pin, never redistribute | registry ([stape-registry.md](stape-registry.md)) |

Read sidecars alongside (not absorbed, configured): Meta Ads MCP (allowlisted),
Stape GTM MCP, Stape MCP, GA4 Data API reads.

## Packages (monorepo layout)

| Package | Role |
|---|---|
| `packages/track-cli` | The `track` command surface; wraps executors behind thin interfaces (`GtmClient`, `MetaClient`, `Ga4Client`, `StapeClient`) |
| `packages/track-registry` | Capability manifest + `track add/remove/list/diff` resolver |
| `packages/track-presets` | Business bundles (`ecommerce-shopify`, `lead-gen-ghl`, …) composed from the registry |
| `packages/track-doctor` | Read-only diagnostics: dedup, EMQ, consent, tag health |
| `packages/track-trace` | AgentRun/AgentStep envelope + OTLP normalizer (track-lab) |
| `packages/track-fixtures` | Sandbox account + VCR cassettes (track-lab D1) |
| `packages/track-eval` | Scenario bundle S1–S7 + rubrics (shared with gtm-autoresearch) |
| `packages/track-brand` | White-label tokens consumed by `init --brand` |
| `apps/track-lab` | Demo harness (Worker + Pages) — see [track-lab](track-lab/BUILD-PLAN-tracking-lab-harness.md) |

## Phases P0–P7 (order, not schedule)

```
P0  Scaffold monorepo + track-cli skeleton; GtmClient/MetaClient/Ga4Client/StapeClient
    interfaces; .env + exit-code conventions
P1  GTM writes: GWS CLI executor + direct GTM API fallback; export/diff/apply/publish
    (the git gate)                                  → gtm-container-builds.md
P2  Registry + presets: track add/remove/list/diff over the Stape manifest;
    vendored data-tag/data-client spine             → stape-registry.md
P3  Stape provisioning: track stape * over the Stape API (container create/domain/
    power-ups/CAPI Gateway)                         → stape-provisioning.md
P4  Meta: track meta * over Meta Ads CLI; dataset ↔ meta-capi interlock;
    MCP read allowlist                              → meta-ads-integration.md
P5  GA4: track ga4 * writes + Data API reads        → ga4-integration.md
P6  track-doctor + debug-agent gate: the green-run requirement wired into publish
P7  White-label productization: init --brand, EULA/NOTICE, GitPaywall fulfillment
                                                    → product-plan.md (PP0–PP5)
```

The track-lab demo phases (D0–D5) and product phases (PP0–PP5) run alongside;
gtm-autoresearch (E0–E3) plugs in as the generate layer in front of P1.
