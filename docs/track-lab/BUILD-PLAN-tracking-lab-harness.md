# Organized AI Tracking Suite — Demo & Evaluation Harness (`track-lab`)

A public-facing **demo website + testing environment** that lets a measurement professional
drive the tracking suite against a realistic (but safe) account and watch the agent work in
real time: **prompt → tool call → CLI execute → tool result → token usage**, all streamed
live from Claude Code's native OpenTelemetry.

The demo is not a sizzle animation. It renders the *same* OTEL signals you'd ship to
Grafana/SigNoz/Datadog in production — which is exactly why an evaluator trusts it.

> Extends `BUILD-PLAN-tracking-suite.md`. The suite (Phases 0–6) builds the CLI + MCP sidecars +
> Stape partner integration. **This harness sits on top** as the shop window, the eval bench, and
> the paywall conversion surface.

Machine: supabowl (MacBook M1 Pro) · root `/Users/supabowl` · org `github.com/Organized-AI`
Monorepo: `Organized-AI/organized-tracking` (new packages + one app) · Cloudflare acct `691fe25d…`

---

## The three decisions that make the demo credible

1. **Real logs, not theater — native OTEL is the substrate.**
   `CLAUDE_CODE_ENABLE_TELEMETRY=1` emits three signals: **metrics** (tokens/cost/sessions),
   **events** (tool executions, permission decisions, API requests), **traces** (prompt →
   model call → tool call → execute). Every event carries a `prompt.id` UUID that stitches a
   full run together. `track-trace` normalizes this into one `AgentRun` schema the site renders.

2. **Sandbox-first — a stranger can use it without handing over live tokens.**
   The default mode is a **seeded demo account + recorded API cassettes** (VCR-style) with
   deliberately broken tracking (duplicate CAPI events, a mis-fired GTM tag, a consent gap, low
   EMQ). `track doctor` finds real defects *deterministically*. An evaluator who wants to go
   further can attach a **read-only** token — never a write token.

3. **The log is the pitch — transparency converts to a sale.**
   Watching the agent run `track doctor`, narrate every intended write, dry-run first, and stay
   paused-by-default is the demonstration of the CLI-owns-writes thesis. That's the moment a
   measurement pro decides it's worth $750.

---

## Feature map — the harness

```
                    ORGANIZED AI · TRACKING SUITE DEMO HARNESS
                              lab.organizedai.vip

  ┌──────────────────────────────────────────────────────────────────────────┐
  │  AGENT UNDER OBSERVATION                                                    │
  │  Claude Code (--dangerously-skip-permissions) driving track-cli / MCP      │
  │  runs a measurement scenario against the SANDBOX                           │
  └───────────────┬───────────────────────────────────────┬──────────────────┘
                  │ native OTEL (metrics·events·traces)     │ CLI writes (dry-run)
                  │ CLAUDE_CODE_ENABLE_TELEMETRY=1          │ + MCP reads
                  ▼                                         ▼
  ┌───────────────────────────────┐        ┌───────────────────────────────────┐
  │ 🟢 track-trace  (normalizer)   │        │ 🟢 track-fixtures (SANDBOX)         │
  │  OTLP collector → AgentRun     │        │  seeded demo account + VCR cassettes │
  │  schema:                       │        │  intentional defects:                │
  │   • prompt (prompt.id)         │        │   • dup CAPI events                  │
  │   • tool_use {name,input}      │◄──feeds─┤   • broken GTM tag                   │
  │   • execute {stdout,stderr}    │  ctx    │   • consent gap                      │
  │   • tool_result                │        │   • low Meta EMQ                     │
  │   • usage {in,out,cache_r/c}   │        │  TRACK_MODE=sandbox → no live creds  │
  │   • latency, cost, status      │        │  (optional: BYO read-only token)     │
  └───────────────┬───────────────┘        └───────────────────────────────────┘
                  │ AgentRun stream (live) + recorded sessions
                  ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 🟢 track-lab   (Cloudflare Worker + Pages · brutalist/cream brand)         │
  │                                                                            │
  │   INGEST (Worker)          STORE (KV/D1)         STREAM (SSE → browser)    │
  │   OTLP http/protobuf  ───►  runs + steps   ───►  live agent log viewer     │
  │                                                                            │
  │   LOG VIEWER PANELS:                                                        │
  │   ┌ prompt ─┐ ┌ tool timeline ─┐ ┌ execute stdout/stderr ─┐ ┌ token/$ ─┐  │
  │   │ what the│ │ meta→ gads→     │ │ track doctor output     │ │ in 1,240 │  │
  │   │ agent   │ │ stape→ doctor   │ │ dedup FAIL · EMQ 4.1    │ │ out 830  │  │
  │   │ was told│ │ (paused/dry-run)│ │ consent WARN            │ │ cache 90%│  │
  │   └─────────┘ └────────────────┘ └────────────────────────┘ └──────────┘  │
  └───────────────┬──────────────────────────────────────────┬───────────────┘
                  │                                            │
       PUBLIC (watch-only)                          GATED (interactive run)
       pre-recorded replay = sizzle                 🔒 GitPaywall → Skool $75/mo
                  │                                            │
                  ▼                                            ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  🟢 track-eval  (scenario bundle · doubles as gtm-autoresearch eval set)   │
  │   S1 audit CAPI dedup   S2 fix broken GTM tag   S3 offline conv upload      │
  │   S4 diagnose low EMQ    S5 consent-mode check   S6 funnel integrity        │
  │   each: task prompt + expected outcome + rubric (pass/fail + score)         │
  └──────────────────────────────────────────────────────────────────────────┘

  SHARED  ── track-brand (cream/brutalist tokens) ── FORK-PROVENANCE / attribution
            "Meta official tooling · server-side by Stape" surfaced inside every trace
```

---

## New packages (all in the monorepo)

| Package / app | Owner | Role |
|---|---|---|
| `packages/track-trace` | 🟢 Organized AI | OTLP collector config + normalizer → canonical `AgentRun` event schema |
| `packages/track-fixtures` | 🟢 Organized AI | Seeded demo account + VCR cassettes (Meta/Google/GTM/GA4 reads); sandbox mode |
| `packages/track-eval` | 🟢 Organized AI | Measurement scenario bundle + rubrics; shared with gtm-autoresearch eval bench |
| `apps/track-lab` | 🟢 Organized AI | Cloudflare Worker (ingest+SSE) + Pages frontend (live agent log viewer) |
| *(gate config)* | 🟢 Organized AI | GitPaywall rules → Skool $75/mo membership token → unlock interactive lab + repo |

---

## Phased implementation (order, not schedule)

```
PHASE D0 — Harness scaffolding + AgentRun trace schema
  • Organized Codebase agent templates (first step)
  • packages/track-trace: canonical AgentRun / AgentStep schema
      prompt · tool_use{name,input} · execute{stdout,stderr,exit} ·
      tool_result · usage{input,output,cache_read,cache_creation} · latency · cost · status
  • wire Claude Code native OTEL → local OTLP collector → normalizer (console exporter to verify)
  • correlation on prompt.id; redaction pass (strip tokens/PII before storage)
        │
PHASE D1 — Sandbox + fixtures (deterministic, zero live creds)
  • packages/track-fixtures: seeded demo account with 4 planted defects
      (dup CAPI · broken GTM tag · consent gap · low EMQ)
  • VCR cassettes for Meta/Google/GTM/GA4 reads; record-once, replay-forever
  • TRACK_MODE=sandbox flag on track-cli + track-doctor → runs against fixtures
  • optional BYO read-only token path (never a write token in the demo)
        │
PHASE D2 — Scenario / eval bundle
  • packages/track-eval: 6 measurement scenarios (S1–S6) a pro would recognize
  • each = task prompt + expected outcome + rubric (pass/fail + 0–100 score)
  • reuse gtm-debug-agent (tag firing/dataLayer) + data-audit (Meta/Stape) skills as scenario engines
  • this bundle IS the gtm-autoresearch eval set → ties to the EBI refactor plan
        │
PHASE D3 — track-lab website (Cloudflare Worker + Pages)
  • Worker ingest: OTLP http/protobuf endpoint → normalize → KV/D1 store
  • SSE stream: live AgentRun → browser; also replay recorded sessions
  • Frontend log viewer: prompt · tool timeline · execute stdout/stderr · token/cost meter
  • brand: cream/brutalist grid, Inter + JetBrains Mono, green=safe/gold=build/red=risk
        │
PHASE D4 — GitPaywall gate + Skool pricing ladder
  • PUBLIC replay ungated (top of funnel · sizzle reel)
  • INTERACTIVE run gated → GitPaywall → Skool $75/mo membership token
  • SKU ladder wired to suite Phase 6 (capability-declaring contract):
      now: $75/mo Skool access  →  $750 suite  →  $1500 suite
        │
PHASE D5 — Publish + evaluator handoff + attribution
  • deploy lab.organizedai.vip on Cloudflare (acct 691fe25d…, zone 446a0461…)
  • "Evaluator mode": scoped sandbox link a measurement pro can drive end-to-end
  • attribution surfaced in-trace: Meta official `meta ads` CLI + Stape server-side CAPI
```

---

## Pricing & gating ladder

```
          FREE                     $75 / month                 $750  →  $1500
   ┌────────────────┐        ┌────────────────────┐      ┌────────────────────┐
   │ PUBLIC REPLAY  │  ───►  │ SKOOL MEMBER        │ ───► │ FULL SUITE LICENSE │
   │ watch a real   │        │ (GitPaywall unlock) │      │ engine + recipe    │
   │ recorded run   │        │ • run sandbox live  │      │ packs · own creds  │
   │ no auth        │        │ • all 6 scenarios   │      │ • production writes │
   │ = sizzle reel  │        │ • repo read access  │      │ • capability contract│
   └────────────────┘        └────────────────────┘      └────────────────────┘
        top of funnel            conversion surface           the sale
```

- **Now:** GitPaywall restricts the interactive lab + repo to Skool members enrolled at $75/mo.
- **Then:** the same GitPaywall contract unlocks the $750 suite license (engine SKU + a vertical
  recipe pack), later $1500 (engine + all recipe packs / seats).
- The public replay is deliberately ungated — it does the top-of-funnel selling for free.

---

## What this reuses

🟢 **Owned / native**
- Claude Code native OTEL (metrics·events·traces) — the observability substrate, zero custom instrumentation
- `track-cli` + `track-doctor` (suite) — the thing being demonstrated
- `track-brand` tokens — cream/brutalist look across the lab
- GitPaywall — Organized AI's own gating layer

♻️ **Skills already in the environment**
- `gtm-debug-agent` → scenario engine for tag-firing / dataLayer / consent checks
- `data-audit` (Pipeboard Meta + Stape MCP) → scenario engine for Meta account audit
- `posthog-wizard` → deterministic prompting patterns for the normalizer + product analytics on the site
- `organizedai-vanity-deploy` / `slidev-cloudflare-deploy` → Cloudflare deploy of `lab.organizedai.vip`

🤝 **Partner surfaces (attributed, not forked)**
- Stape MCP + GTM MCP → sandbox reads for server-side container state
- Meta official tooling → surfaced in-trace so the evaluator sees the real architecture

---

## Open questions to lock before D3

1. **Trace store:** self-host OTLP collector on Cloudflare vs. route through Grafana Cloud / SigNoz /
   Langfuse for the durable backend, with `track-lab` reading from it. (Self-host keeps it inside the
   `organizedai.vip` estate; managed backend is faster to stand up.)
2. **Live agent runtime:** does the interactive lab spin up a real Claude Code session per evaluator
   (Agent SDK, needs `ANTHROPIC_API_KEY` + rate control), or replay a small pool of pre-baked live runs
   on demand? Pre-baked is cheaper and still "real logs"; live is more impressive but costs tokens per visitor.
3. **Evaluator token policy:** confirm BYO tokens are read-only-enforced at the CLI layer (sandbox mode
   blocks all write subcommands regardless of token scope).
