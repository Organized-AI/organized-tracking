# Organized Tracking

A CLI-first, white-label conversion-tracking monorepo. The **CLI is the control plane** for all GTM / GA4 / server-side event work — deterministic, version-controlled, CI-gated. **MCP is an optional read/explore sidecar**, never the write path.

- **Machine:** supabowl (MacBook M1 Pro) · **Path:** `/Users/supabowl/organized-tracking`
- **Org:** github.com/organized-ai · **Storefront:** mart.organizedai.vip

## Plans

| Doc | What it covers |
|---|---|
| [docs/cli-plan.md](docs/cli-plan.md) | Canonical architecture — why CLI over MCP, privacy & data-handling, the 6 absorbed tools, packages, phases P0–P7 |
| [docs/product-plan.md](docs/product-plan.md) | $250 white-label product + distribution, licensing reality, commerce flow, GTM Autoresearch +$150 add-on |
| [docs/stape-registry.md](docs/stape-registry.md) | 169-template Stape capability registry, capability-gating, business presets |
| [docs/mart-catalog.md](docs/mart-catalog.md) | Full Organized Mart catalog (18 SKUs) consolidated on mart.organizedai.vip |

## Core principle

The CLI owns every write (`export → git → PR → publish`, gated on a green debug-agent run). No PII through a hosted LLM — the write path has no model at all; the read path uses a local LLM + redaction. Capable of every destination via the registry, but each install activates only the capabilities it declares.
