<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->

# Organized Tracking — GTM Container Builds (decided stack)

**Decision:** GTM container builds run on three surfaces, each on its proper side of
the core principle. This **replaces the earlier implicit choice of `owntag/gtm-cli`**
(single-maintainer MIT project) everywhere it appeared.

| Surface | Role | Side of the principle |
|---|---|---|
| **GWS CLI** (`gws`, Google official, open-source) | Primary **write executor** behind `track gtm *` | Write path |
| **GTM API v2 (direct)** | Fallback + spine for anything `gws` handles awkwardly; the interface `track gtm` is written against | Write path |
| **Stape GTM MCP server** (`google-tag-manager-mcp-server`) | **Read/explore sidecar** — workspace + version inspection | Read path only |

---

## GWS CLI — the write executor

`gws` (github.com/googleworkspace/cli) ships no static command list — it reads
**Google's API Discovery Service at runtime** and builds its command surface
dynamically. Tag Manager API v2 publishes a discovery document, so the full GTM
surface (accounts, containers, workspaces, tags, triggers, variables, templates,
versions, publish) is reachable as `gws tagmanager …` commands with JSON output.

Why it wins over the alternatives considered:

- **Official Google tooling** — same posture as Meta Ads CLI on the Meta side
  ([meta-ads-integration.md](meta-ads-integration.md)): the platform owner's client,
  peer-installed, never redistributed.
- **Discovery-driven** — new GTM API surface appears without waiting on a wrapper
  release; no single-maintainer abandonment risk (the gtm-cli concern).
- **One credential story** — the buyer's own GCP OAuth/service account, consistent
  with white-label "bring your own credentials."

`track gtm *` wraps it deterministically: JSON in/out, no interactive prompts, the
buyer's GCP identity from `.env` / ADC.

> **Version pin:** `gws` (`@googleworkspace/cli`, Apache-2.0, npm) is pre-1.0
> (v0.22.x as of 2026-07) and documents possible breaking changes before v1.0 —
> `track init` pins an exact version, and the `GtmClient` interface below is the
> hedge against surface churn.

## GTM API v2 direct — the fallback and the interface

`track-cli` codes against a thin internal `GtmClient` interface. The default
implementation shells out to `gws`; a direct GTM API v2 (REST) implementation backs
it for:

- batch/bulk operations and rate-limit-aware retries,
- custom-template (`.tpl`) installs from the Stape registry
  ([stape-registry.md](stape-registry.md) — "deploy via GWS CLI / GTM API"),
- the publish gate itself (`export → git → PR → publish` requires exact control of
  workspace → version → publish sequencing, gated on a green debug-agent run).

Isolating the executor behind the interface means either half can carry the load if
the other misbehaves — the lock-in risk that motivated dropping gtm-cli.

## Stape GTM MCP — the read sidecar

`stape-io/google-tag-manager-mcp-server` (already listed in the registry's dev/CI
section as a read-only sidecar) exposes workspace and version inspection tools. Same
contract as the Meta Ads MCP allowlist: **reads inform; writes travel as proposed
`track gtm` commands** through the normal git-gated pipeline. It never holds the
write credential.

---

## Doc/reference updates carried by this decision

- [product-plan.md](product-plan.md) licensing table: `owntag/gtm-cli` row replaced by
  GWS CLI (Google official, open-source, peer-installed).
- [stape-registry.md](stape-registry.md): capability deploys now read
  "deploy via GWS CLI / GTM API".
- The forthcoming `cli-plan.md` reconstruction should treat this doc as the locked
  container-build decision.
