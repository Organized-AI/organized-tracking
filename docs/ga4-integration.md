<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->

# Organized Tracking — GA4 Integration

Same shape as [meta-ads-integration.md](meta-ads-integration.md) and
[gtm-container-builds.md](gtm-container-builds.md): deterministic writes behind
`track ga4 *`, reads through a sidecar, nothing model-mediated on the write path.

| Surface | Role | Side of the principle |
|---|---|---|
| **ga-cli** (sulimanbenhalim/ga-cli, MIT, pip) | `track ga4 *` executor — property/stream/conversion admin | Write path |
| **GA4 Admin API (direct)** | Fallback behind the `Ga4Client` interface (same hedge pattern as `GtmClient`) | Write path |
| **GA4 Data API + Google Analytics MCP** | Reports, realtime, funnel reads | Read path only |

## Writes — `track ga4 *`

The admin surface a tracking install actually needs, wrapped deterministically:

| `track` command | Underlying operation |
|---|---|
| `track ga4 property:get/list` | Admin API properties |
| `track ga4 stream:create/list` | Web/app data streams (yields the measurement ID GTM needs) |
| `track ga4 conversion:create/list` | Key events (conversions) |
| `track ga4 mp-secret:create` | Measurement Protocol API secret — what `data-client`/sGTM sends with |
| `track ga4 audience/dimension …` | Custom definitions, audiences as needed |

**Interlocks:** `track add ga4` ([stape-registry.md](stape-registry.md)) deploys the
`ga4-advanced-tag` into the sGTM container; the measurement ID and MP secret it needs
come from `track ga4 stream:create` / `mp-secret:create`. One config, both halves —
mirroring the Meta `dataset ↔ meta-capi` interlock.

**Consolidation option (flagged, not decided):** GWS CLI is discovery-driven, and the
GA4 Admin (`analyticsadmin`) and Data (`analyticsdata`) APIs publish discovery docs —
so `gws` could subsume ga-cli and collapse the Google write path to one peer-installed
tool + one GCP credential. Worth deciding when P5 starts; the `Ga4Client` interface
makes the swap cheap either way.

## Reads — Data API + MCP sidecar

- **GA4 Data API** (runReport, runRealtimeReport) backs `track doctor`'s event-health
  checks: is the `purchase` event arriving, do sGTM-sent events dedupe against
  web-sent ones, realtime validation after a publish.
- **Google Analytics MCP** (Google's official analytics MCP server) as the
  explore sidecar, same contract as every other sidecar: reads inform, changes ship
  as proposed `track ga4` commands through the git gate.
- Reads are aggregates; the standard local-LLM + redaction posture applies.
