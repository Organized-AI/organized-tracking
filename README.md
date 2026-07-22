# Organized Tracking

A CLI-first, white-label conversion-tracking monorepo. The **CLI is the control plane** for all GTM / GA4 / server-side event work — deterministic, version-controlled, CI-gated. **MCP is an optional read/explore sidecar**, never the write path.

- **Machine:** supabowl (MacBook M1 Pro) · **Path:** `/Users/supabowl/organized-tracking`
- **Org:** github.com/organized-ai · **Storefront:** mart.organizedai.vip

## Plans

| Doc | What it covers |
|---|---|
| [docs/cli-plan.md](docs/cli-plan.md) | Canonical architecture — why CLI over MCP, privacy & data-handling, the 6 absorbed tools, packages, phases P0–P7 (reconstructed) |
| [docs/product-plan.md](docs/product-plan.md) | $250 white-label product + distribution, licensing reality, commerce flow, GTM Autoresearch +$150 add-on |
| [docs/stape-registry.md](docs/stape-registry.md) | 169-template Stape capability registry, capability-gating, business presets |
| [docs/mart-catalog.md](docs/mart-catalog.md) | Full Organized Mart catalog (18 SKUs) consolidated on mart.organizedai.vip |
| [docs/meta-ads-integration.md](docs/meta-ads-integration.md) | Meta Ads CLI as the write executor behind `track meta *`; Meta Ads MCP as the allowlisted read/explore sidecar |
| [docs/gtm-container-builds.md](docs/gtm-container-builds.md) | GTM build stack: GWS CLI as write executor, direct GTM API v2 as fallback/spine, Stape GTM MCP as read sidecar (replaces owntag/gtm-cli) |
| [docs/stape-provisioning.md](docs/stape-provisioning.md) | sGTM infrastructure: Stape API as write executor for container lifecycle / domains / CAPI Gateway; stape-mcp-server as read sidecar |
| [docs/ga4-integration.md](docs/ga4-integration.md) | GA4: ga-cli + Admin API writes behind `track ga4 *`; Data API + Analytics MCP reads; measurement-ID/MP-secret interlock with the registry |

## Core principle

The CLI owns every write (`export → git → PR → publish`, gated on a green debug-agent run). No PII through a hosted LLM — the write path has no model at all; the read path uses a local LLM + redaction. Capable of every destination via the registry, but each install activates only the capabilities it declares.
