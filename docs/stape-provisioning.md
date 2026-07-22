<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->

# Organized Tracking — Stape sGTM Provisioning

**The gap this closes:** [stape-registry.md](stape-registry.md) gets templates *into*
a server-side container; nothing specified how that container's **infrastructure**
comes to exist. This doc adds the provisioning layer: the **Stape API** as the write
executor behind `track stape *`, with `stape-mcp-server` as the read sidecar.

| Surface | Role | Side of the principle |
|---|---|---|
| **Stape API** (`api.stape.io`, buyer's API key) | Write executor — container lifecycle, domains, power-ups | Write path |
| **stape-mcp-server** | Read sidecar — container state, logs, config inspection | Read path only |

---

## What the Stape API covers (confirmed against Stape's docs)

Per Stape's API documentation, the API supports **sGTM container and CAPI Gateway
container**: create, edit, change plan, cancel/reactivate subscription, delete,
transfer — the full lifecycle `track stape *` needs.

**Command surface (initial):**

| `track` command | Stape API operation |
|---|---|
| `track stape container:create --plan --region` | Create sGTM container (returns tagging-server URL) |
| `track stape container:update / :delete / :transfer` | Edit, delete, transfer |
| `track stape plan:change` | Change plan (scale up/down) |
| `track stape domain:add` | Custom tracking domain (first-party cookies) |
| `track stape gateway:create` | CAPI Gateway container (no-GTM Meta path) |
| `track stape consent:check` (read; track-lab demo) | via stape-mcp-server / config reads |

**Auth:** buyer's own Stape account + API key from `.env` — same
bring-your-own-credentials posture as GCP and Meta. The white-label buyer's clients
run on the *buyer's* (or each client's own) Stape workspace, never Organized AI's.

## Where it sits in the flow

```
track init --preset ecommerce-shopify
   │
   ├─ 1. track stape container:create        (Stape API — the tagging server exists)
   ├─ 2. track stape domain:add              (first-party domain on the container)
   ├─ 3. track gtm container create/link     (GWS CLI — web + server GTM containers)
   ├─ 4. track add meta-capi ga4 …           (registry deploys templates into #3,
   │                                          pointed at #1's tagging-server URL)
   ├─ 5. track meta dataset create/connect   (Meta Ads CLI — the Pixel CAPI sends to)
   └─ 6. track publish                       (git-gated, green debug-agent run)
```

Provisioning (1–2) is idempotent and recorded in `tracking.config.ts` alongside the
capability set, so `track diff` covers infrastructure drift, not just tag drift.

## Boundaries

- **No LLM anywhere in this path** — plain API calls.
- `stape-mcp-server` reads (container state, request logs for `track doctor`) follow
  the standard read posture: local LLM + redaction; request logs are the PII-hot
  surface here, so redaction runs *before* any model sees a log line.
- Stape subscription billing belongs to the buyer — `track stape plan:change` mutates
  a paid subscription, so it prompts unless `--force` (the one deliberate exception
  to no-prompt defaults).
