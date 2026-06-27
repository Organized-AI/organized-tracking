# Organized Mart — Full Catalog on `mart.organizedai.vip`

**Canonical storefront:** `https://mart.organizedai.vip`
**Per-product:** `https://mart.organizedai.vip/<slug>` · **Quote JSON:** `https://mart.organizedai.vip/quote.json?offer=<slug>`
**Catalog:** `https://mart.organizedai.vip/catalog.json` · **A2A:** `https://mart.organizedai.vip/.well-known/agent.json` · **ACP:** `https://mart.organizedai.vip/.well-known/agentic-commerce.json`

> **Migration rule:** every endpoint currently under `organizedai.vip/mart` or
> `organizedai.vip/organized-mart/…` must be rebased to the **`mart` subdomain**.
> No path forms. This is the consolidation: all 18 SKUs live on `mart.organizedai.vip`.

---

## Existing SKUs (migrated from organizedai.vip/mart → subdomain)

| Slug | Name | Price | Checkout |
|---|---|---|---|
| hosted-hermes | Hosted Hermes | $500/mo | Stripe live |
| organized-harness-rsi | Organized Harness × RSI Loop | $98 | quote-ready |
| autoresearch-linear | Autoresearch → Linear Pipeline | $97 | quote-ready |
| harness-engineering | Harness Engineering Blueprint | $89 | quote-ready |
| organized-brain | Organized Brain Starter | $79 | quote-ready |
| agent-runtime-map | Agent Runtime Map | $95 | quote-ready |
| world-model-os | Org Model OS Starter | $99 | quote-ready |
| brian-marketing-team | AI Marketing Team Desk | $69 | quote-ready |
| stripe-agentic-commerce | Stripe Agentic Commerce Kit | $59 | quote-ready |
| source-surface-pack | Source Surface Pack | $49 | quote-ready |
| agent-budget-policy | Agent Budget Policy | $39 | quote-ready |
| morning-ops-brief | Morning Ops Brief | $29 | quote-ready |

**Bundles**

| Slug | Name | Price | Components |
|---|---|---|---|
| builder-starter | Builder Starter | $69 | morning-ops-brief · agent-budget-policy · source-surface-pack |
| operator-growth | Operator Growth | $89 | stripe-agentic-commerce · brian-marketing-team · organized-brain |
| systems-cmo | Systems CMO | $99 | harness-engineering · agent-runtime-map · organized-harness-rsi |
| gtm-autoresearch-monthly | GTM Autoresearch Monthly | $99 / GTM container / mo | autoresearch-linear · stripe-agentic-commerce · agent-budget-policy |

> Existing offers keep their **quote.json / ACP buyer-approval** flow — just rebased to
> the subdomain. Don't convert them to direct payment links unless you decide to.

---

## New SKUs (this build — create Stripe products + LIVE payment links)

### organized-tracking — $250 one-time
```
slug:      organized-tracking
url:       https://mart.organizedai.vip/organized-tracking
badge:     white-label
tagline:   Conversion tracking as code. CLI-first, white-label.
bullets:
  - GTM / GA4 / sGTM as deterministic CLI — export · diff · publish
  - Meta CAPI · GA4 · Google Ads EC · TikTok · OpenAI out of the box
  - 169-template registry — tap only what each business needs
  - init --brand --preset → ship tracking for your own clients
cta:       Buy · $250  -> {{STRIPE_LINK_ORGANIZED_TRACKING}}
checkout:  Stripe live (one-time $250)
```

### gtm-autoresearch — $150 one-time (add-on, requires core)
```
slug:      gtm-autoresearch
url:       https://mart.organizedai.vip/gtm-autoresearch
badge:     add-on · requires core
tagline:   Research → generate. Auto-builds the GTM containers organized-tracking deploys.
bullets:
  - Auto-researches the stack + proposes the tracking plan
  - Generates GTM container configs that feed track apply / the registry
  - Fine-tuning flywheel — proposals sharpen per engagement
  - Output still goes through export → git → PR → publish (no LLM in the write path)
cta:       Add · $150  -> {{STRIPE_LINK_GTM_AUTORESEARCH}}
checkout:  Stripe live (one-time $150)
note:      distinct from "GTM Autoresearch Monthly" ($99/container/mo) — keep both slugs.
```

---

## Stripe objects to create (live mode)

| Product | Price (unit_amount) | Type | Payment link var |
|---|---|---|---|
| Organized Tracking | 25000 USD | one-time | STRIPE_LINK_ORGANIZED_TRACKING |
| GTM Autoresearch | 15000 USD | one-time | STRIPE_LINK_GTM_AUTORESEARCH |

Generated links get written back into `catalog.json` as the `checkout_url` for those two
slugs; the card CTAs read from there.
