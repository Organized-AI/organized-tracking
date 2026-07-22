# Organized Tracking — Stape Capability Registry

**Premise:** the `stape-io` org is a 169-repo **server-side template library**. Rather
than vendor it all, `track-cli` treats it as a **registry** — a manifest mapping
*capability → template(s) + dependencies + params*. The product is maximally capable
(every destination available); each white-label install **activates only the
capabilities that business needs** via `track add <capability>`.

> Stape templates are Apache-2.0. The registry **fetches + version-pins from upstream**
> at `track add` time (caching locally) rather than redistributing the whole library —
> only the core spine (data-tag/data-client) is vendored. Keeps the product lean and
> the licensing clean.

---

## How capability-gating works

```
tracking.config.ts                track add meta-capi
  business: "shopify-store"   ->   resolve manifest -> fetch templates + deps
  capabilities:                    -> deploy via GWS CLI / GTM API -> record in config
    - ga4
    - meta-capi          one CLI, every capability available;
    - tiktok             a given install only pulls what it declares.
    - klaviyo
    - shopify-pack
```

**Dependency resolution** — e.g. `meta-capi` pulls not just `facebook-tag` but the glue
it needs: `user-data-extractor-variable`, `unique-event-id-variable`,
`consent-parser-variable`, `duplicate-transaction-checker-variable`. The registry
encodes these edges so `track add` deploys a *working* destination, not a bare tag.

---

## The registry — capability modules

### Core transport spine (always installed)
`data-tag` (web) · `data-client` (server) · `data-variable` · `unique-event-id-variable`

### Ad-platform destinations (server-side CAPI / Events API)
The "all businesses" surface — pick per business:
`facebook-tag` + `fb-tag` (web) + `facebook-leads-tag` (Meta) · `tiktok-tag` + `tiktok-web-tag` ·
`snapchat-tag` · `reddit-tag` · `twitter-tag` (X) · `linkedin-tag` · `microsoft-capi-tag` (Bing UET) ·
`amazon-tag` · `xandr-tag` · `outbrain-tag` · `line-yahoo-tag` · `signals-gateway-tag` (Stape first-party) ·
`openai-capi-tag` (server) + `openai-pixel-tag` (web) — **ChatGPT Ads, first-class**

> **`openai-capi` capability** — OpenAI's ChatGPT Ads conversion path, shipped by Stape
> April 2026. `track add openai-capi` deploys the server-side CAPI tag + web pixel and
> pulls the shared glue (`user-data-extractor`, `unique-event-id`, `consent-parser`,
> `duplicate-transaction-checker`) so it dedupes against the same event model as Meta/GA4.
> Included in the `saas` and `full` presets; available to any business via `track add`.

### Analytics destinations
`ga4-advanced-tag` · `matomo-advanced-tag` · `mixpanel-tag`

### Google conversion ecosystem
`gads-offline-conversion-tag` · `gads-conversion-adjustments-tag` · `gads-conversion-improver-tag` ·
`google-customer-match-tag` + `google-conversion-events-tag` (Data Manager API) ·
`google-customer-reviews-tag` · `merchant-center-variable`

### Affiliate / partner networks
`awin-tag` · `impact-tag` · `cj-tag` · `rakuten-tag` · `webgains-tag` · `affiliate-conversion-tag`

### CRM / ESP / marketing automation
`klaviyo-tag` + `klaviyo-identify-tag` + `klaviyo-lookup-variable` · `hubspot-tag` ·
`activecampaign-tag` · `mailchimp-tag` · `brevo-tag` · `sendgrid-tag` ·
`gohighlevel-tag` (GHL — relevant to RTT/Myosin work)

### E-commerce platform packs (preset container bundles by store type)
`shopify-gtm-container-templates` · `woocommerce-gtm-container-templates` ·
`magento-gtm-container-templates` · `bigcommerce-gtm-container-templates` ·
`custom-gtm-container-templates` — these are whole-container starting points, ideal as
white-label **business presets**.

### Platform server-side plugins (install on the host CMS)
`gtm-server-side-wordpress-plugin` · `gtm-server-side-magento-module`

### App / server SDKs (emit events directly, no GTM in the loop)
`stape-sgtm-nodejs` · `stape-sgtm-php` · `stape-sgtm-ios` · `stape-sgtm-android` · `stape-sgtm-flutter`

### Utility variables & transformations (the glue)
`user-data-extractor-variable` + `user-data-extractor-web-tag` · `consent-parser-variable` ·
`phone-number-formatter-variable` (+web) · `duplicate-transaction-checker-variable` ·
`universal-conversions-variable` · `advanced-lookup-table-variable` · `http-lookup-variable` ·
`object-builder-variable` · `object-property-extractor-variable` · `array-builder-variable` ·
`url-builder-variable` · `type-convertor-variable` · `timestamp-converter-variable` ·
`query-replacer-variable` · `weather-variable` · `channel-flow-tag` · `cookie-extender-tag` + `cookie-restore-tag`

### Storage / persistence writers
`supabase-writer-tag` (Supabase) · `spreadsheet-tag` + `spreadsheet-variable` (Sheets) ·
`stape-store-writer-tag` + `stape-store-restore-variable` · `firestore-request-delay-tag` +
`firestore-restore-variable` · `request-to-gcs-function`

### Notifications / monitoring
`slack-notification-tag` · `telegram-notification-tag` · `logger-tag` · `event-generator-tag` ·
`json-http-request-tag` + `json-response-tag`

### Dev / standards / CI (improve the build itself)
`google-tag-manager-apis-intellisense` (sandboxed-JS typedefs → author/lint templates) ·
`gtm-standards` (adopt as our lint/QA conventions) ·
`template-changes-shared-workflows` (CI patterns for template repos) ·
`stape-mcp-server` + `google-tag-manager-mcp-server` (read-only sidecars)

---

## White-label business presets (capability bundles)

Each preset is a named capability set the buyer picks at `track init --brand`:

| Preset | Pulls |
|---|---|
| `ecommerce-shopify` | shopify-pack · ga4 · meta-capi · tiktok · google-ads · klaviyo · dedup + user-data glue |
| `ecommerce-woo` | woocommerce-pack · ga4 · meta-capi · google-ads · mailchimp |
| `lead-gen-ghl` | ga4 · meta-capi · facebook-leads · gohighlevel · google-ads offline + customer-match |
| `affiliate` | core spine · awin · impact · cj · rakuten · affiliate-conversion |
| `saas` | ga4 · meta-capi · openai-capi · linkedin · mixpanel · hubspot · server SDK |
| `full` | the entire registry available on demand (agency mode) |

A business never carries tags it doesn't use — `track add` / `track remove` adjusts the
active set, and `track diff` shows exactly what's deployed vs declared.

---

## What this adds to the build

- New package **`track-registry`**: the manifest (capability → repos + deps + params + container target) and the `track add` / `track remove` / `track list` resolver.
- `track-presets` consumes the registry to compose the business bundles above.
- `track init --brand` takes a `--preset` so a buyer stands up a working, business-shaped tracking layer in one command — then extends with `track add` as needs grow.
