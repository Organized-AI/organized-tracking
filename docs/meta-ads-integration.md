<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 Organized AI -->

# Organized Tracking — Meta Ads Integration (CLI + MCP)

**Premise:** Meta ships two official ads connectors — the **Meta Ads CLI** (a terminal
client for the Marketing API, `meta ads <resource> <action>`) and the **Meta Ads MCP
server** (remote-hosted at `https://mcp.facebook.com/ads`). Both slot into
organized-tracking under the core principle, and *on opposite sides of it*:

| Connector | Role in organized-tracking | Side of the principle |
|---|---|---|
| **Meta Ads CLI** (pip, peer-installed) | The **executor for every Meta write** behind `track meta *` — campaigns, ad sets, ads, creatives, catalogs, datasets (Pixels) | **Write path** (deterministic, no model) |
| **Meta Ads MCP** (remote, OAuth) | **Read/explore sidecar** — insights, diagnostics, signal quality, activity logs, benchmarks, Help Center search | **Read path only** |

The CLI is already in the licensing table ([product-plan.md](product-plan.md)):
peer-installed via pip at setup, governed by Meta's platform terms, never
redistributed. This doc specifies how both are wired.

---

## Where each sits

```
        READ / EXPLORE (sidecar)                 WRITE (control plane)
  ┌──────────────────────────────┐        ┌─────────────────────────────────┐
  │  Meta Ads MCP                │        │  track-cli  (track meta *)      │
  │  mcp.facebook.com/ads        │        │      │                          │
  │  · insights & trends         │        │      v  shells out to           │
  │  · dataset quality / EMQ     │        │  Meta Ads CLI (official, pip)   │
  │  · catalog diagnostics       │        │  meta ads <resource> <action>   │
  │  · activity logs             │        │  --no-input --force -o json     │
  │  · help-center search        │        │      │                          │
  │        │                     │        │      v                          │
  │        v                     │        │  Marketing API (system user     │
  │  local LLM + redaction       │        │  token, .env — no model here)   │
  └──────────────────────────────┘        └─────────────────────────────────┘
        informs the plan                   export → git → PR → publish,
        never mutates anything             gated on green debug-agent run
```

---

## Meta Ads CLI — the write executor

`track meta *` subcommands are thin, deterministic wrappers over the official CLI.
The wrapper adds the organized-tracking spine (config-as-code, git gating, event-model
dedup with the Stape `meta-capi` capability); the official CLI does the API work.

**Invocation contract** (what makes it safe to script):

- Always `--no-input --force` — no interactive prompts on the write path.
- Always `-o json` — parsed output, never scraped tables.
- Exit codes 0–5 mapped straight through to `track` exit codes.
- Auth: **system user access token** + ad account ID from `.env` (per-install,
  buyer-provided — consistent with white-label "bring your own credentials").

**Command mapping** (initial surface):

| `track` command | Meta Ads CLI call |
|---|---|
| `track meta campaign list/create/update/delete` | `meta ads campaign …` |
| `track meta adset …` (targeting, Pixel, conversion tracking) | `meta ads adset …` |
| `track meta ad …` / `track meta creative …` | `meta ads ad …` / `meta ads creative …` |
| `track meta catalog …` / `track meta product …` / `track meta product-set …` | `meta ads catalog / product / product-set …` |
| `track meta dataset create/connect/disconnect/assign-user` | `meta ads dataset …` |
| `track meta pixel:diagnostics` (read; used in track-lab S1) | `meta ads insights get …` + dataset reads |
| `track meta insights …` | `meta ads insights get --fields … --breakdowns …` |

**Interlock with the Stape registry:** `track add meta-capi`
([stape-registry.md](stape-registry.md)) deploys the server-side CAPI tag; the dataset
(Pixel) that tag sends to is created/connected via `track meta dataset …` → Meta Ads
CLI. One event model, both halves provisioned from the same config.

---

## Meta Ads MCP — the read sidecar, allowlisted

The hosted MCP server is **not read-only by default** — it exposes write tools
(`ads_create_campaign`, `ads_create_ad_set`, `ads_update_entity`,
`ads_activate_entity`, `ads_catalog_create*`, `ads_pixel_event_create`, the
experiment `*_create/update` tools, custom-audience writes, `ads_boost_ig_post`).
**Connecting it unfiltered would violate the core principle.** The integration
therefore ships an explicit tool **allowlist**; anything not listed is denied at the
client config level.

**Allowed (read/explore):**

- **Reporting & insights** — `ads_insights_*` (performance trend, anomaly signal, advertiser context, industry/auction benchmarks), `ads_get_ad_entities`, `ads_get_ad_preview`, `ads_library_search`
- **Signals & datasets** — `ads_get_datasets`, `ads_get_dataset_details/quality/stats` (EMQ and signal health — the S1 audit's read source), `ads_get_customconversions`, `ads_pixel_event_read`, `ads_pixel_parameter_read`
- **Catalog diagnostics** — `ads_catalog_get_*`, `ads_catalog_search_product`
- **Account/context reads** — `ads_get_ad_accounts`, `ads_get_ad_account_pages`, `ads_get_creatives`, `ads_get_ad_images/videos`, `ads_get_custom_audience*` (read forms), `ads_get_opportunity_score`, `ads_get_errors`, `ads_get_field_context`
- **Help & logs** — `ads_get_help_article`, `ads_account_get_activity_logs`, experiment `*_get/list` reads

**Denied (write/mutate):** every `ads_create_*`, `ads_update_*`, `ads_delete_*`,
`ads_activate_entity`, `ads_boost_ig_post`, `ads_pixel_*_create/update/delete`,
`ads_catalog_create/update/delete_*`, `ads_experiment_*_create/update`,
`ads_update_custom_audience_users`.

If a read surfaces a needed change, the output is a **proposed `track meta` command**
(config-as-code diff), which then travels the normal `export → git → PR → publish`
gate. The MCP session never holds a token that the write path depends on.

**PII note:** MCP reads flow through the standard read-path posture — local LLM +
redaction. Dataset/EMQ stats and insights are aggregates; custom-audience reads
return metadata, not user lists. Nothing user-level transits a hosted model.

---

## Track-lab tie-in

- **S1 (audit CAPI dedup)** and the demo's `track meta pixel:diagnostics` step
  ([track-lab](track-lab/BUILD-PLAN-tracking-lab-harness.md)) read via this pairing:
  MCP dataset-quality tools (or VCR cassettes of them) for EMQ/signal health, CLI
  insights for event counts.
- The demo fine print already states the contract: *"Reads via Meta official tooling +
  Stape partner MCP … Writes always via track-cli."* This doc is that fine print,
  specified.

## Licensing & distribution

Unchanged from [product-plan.md](product-plan.md): the Meta Ads CLI is
**peer-installed** (pip) at `init`, never bundled; the MCP server is remote-hosted by
Meta and merely configured (URL + OAuth), so nothing is redistributed. Buyer
credentials, Meta's terms, our allowlist config (Apache-2.0).
