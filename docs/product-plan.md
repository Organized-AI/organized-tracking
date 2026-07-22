# Organized Tracking — Product & Distribution Layer

**The offer:** the `organized-tracking` monorepo, sold as a **one-time $250
purchase** through **Organized Mart**, **white-labeled** so the buyer runs it under
their own brand for their own clients. **Optional add-on:** GTM Autoresearch at
**+$150** (see Add-ons).

**What $250 buys (decide + lock):** perpetual access to the repo snapshot at purchase
+ white-label rights for the buyer's own and client use. *Not* resale of the product
itself. Bundled OSS (GWS CLI · ga-cli MIT · data-tag/data-client Apache-2.0) ships under
its original licenses with notices retained.

**Storefront:** mart.organizedai.vip · **Pay:** Stripe (one-time) · **Access gate:**
GitPaywall (primary) · **Org:** github.com/organized-ai

---

## Licensing reality (why this is sellable)

| Component | License | Resale OK? | Obligation |
|---|---|---|---|
| GWS CLI (Google official, `@googleworkspace/cli`) | Apache-2.0 | peer-installed (npm) | Retain copyright + license text; governed by Google API terms |
| sulimanbenhalim/ga-cli | MIT | peer-installed (pip) | Retain copyright + license text |
| Meta Ads CLI (official) | Meta platform terms | peer-installed (pip) | Buyer installs; governed by Meta's terms |
| stape-io/data-tag | Apache-2.0 | vendored | Retain notices + ship `NOTICE` |
| stape-io/data-client | Apache-2.0 | vendored | Retain notices + ship `NOTICE` |
| **your layer** (cli wrap, events, destinations, presets, privacy arch) | **your EULA** | the product | the actual value sold |

**Peer-install, don't redistribute the CLIs.** The product *depends on* GWS CLI /
ga-cli / Meta Ads CLI (installed via npm/pip at setup) rather than bundling them — so
you never redistribute Meta's tool or anyone's binary, sidestepping the resale-license
question entirely. Only the Stape `.tpl` templates (Apache-2.0) are vendored, with
notices preserved. The buyer receives your commercial license to *your* code; every
dependency stays under its own terms.

---

## Commerce flow

```
   buyer -- $250 one-time -->  ORGANIZED MART  (mart.organizedai.vip)
                                   |  Stripe Checkout
                                   v
                            payment success --(webhook)
                                   |
                 +-----------------+------------------+
                 v                                    v
        GitPaywall / GitHub                   purchase event
        grant repo access                     -> organized-tracking
        (private template snapshot)             DOGFOOD: Stripe -> Data Client
                 |                              -> Meta CAPI / GA4
                 v
        buyer clones -->  npx <product> init --brand
                          white-label: own name / scope / GCP SA / GTM/GA4
                 |
                 v
        buyer's tracking layer, running for buyer's own clients
```

The product that does conversion tracking **tracks its own sale** — the Mart checkout
fires through organized-tracking itself. Functional proof + live analytics in one move.

---

## White-label: what makes it resellable

- **`brand.config.ts`** consumed at init: product name, CLI binary name, package scope (`@buyerorg/track-*`), docs title, accent tokens for any generated surfaces.
- **`npx <product> init --brand`** renames the CLI, rewrites package scopes, regenerates docs — one command, fully their brand.
- **Business presets at init (`--preset`)**: the buyer picks `ecommerce-shopify`, `lead-gen-ghl`, `affiliate`, `saas`, etc. — a capability bundle from `track-registry` — so they stand up a *working, business-shaped* tracking layer, then `track add`/`track remove` to fit their exact stack. Capable of every destination; carries only what they use.
- **Zero Organized-AI coupling on the consumer path.** Internal-only surfaces (vanity router, hub.organizedai.vip, your Mart) stay out of the sellable core. Buyer brings their own GCP service account, GTM/GA4, and Stripe.
- **EULA + LICENSE + NOTICE** in the repo root: your commercial terms up top, OSS notices preserved beneath.

---

## Add-ons (optional, priced separately from the $250 core)

### GTM Autoresearch — +$150
The existing **Organized-AI/gtm-autoresearch** pipeline, optioned as a paid upgrade
on top of the core. Where the core gives a buyer the *deterministic build + emit*
layer, Autoresearch gives them the *research + generate* layer in front of it:

- **Auto-researches the target stack** (platform, destinations, existing containers) and proposes a tracking plan — which capabilities to `track add`, which preset fits.
- **Generates GTM container configs** from that research, feeding straight into the core's `track apply` / registry rather than hand-building tags.
- **Fine-tuning flywheel** — each engagement's containers + outcomes feed the model, so proposals sharpen over time (the BiOptimizers / RTT / Teleios pipeline, productized).
- **Plugs into the core, doesn't replace it.** Output is still config-as-code through the same `export → git → PR → publish` gate; no LLM in the write path.

**Why it's a clean +$150 option, not bundled:** the $250 core is self-sufficient and
deterministic; Autoresearch is an intelligence layer some buyers want and others don't.
Separate SKU, separate Stripe price, gated to buyers who already own the core. Same
white-label rules apply (runs under the buyer's brand for their clients).

| SKU | Price | What it is |
|---|---|---|
| organized-tracking (core) | $250 one-time | the CLI-first monorepo, white-label |
| + GTM Autoresearch | +$150 one-time | research → container-config generation + fine-tuning flywheel |

---

## Phased implementation (order, not schedule)

> Builds on the tracking monorepo plan (P0–P7). These product phases (PP) assume that
> core exists or is being built in parallel.

### PP0 — White-label the core
- Add `brand.config.ts` schema + the `init --brand` rename/rescope flow.
- Audit and strip Organized-AI-specific references from the consumer path; gate internal surfaces behind an internal-only flag.
- Author **EULA**, drop in **LICENSE** and Apache **NOTICE** with all four OSS attributions.

### PP1 — Package the sellable artifact
- Stand up a **private GitHub template repo** = the snapshot a buyer receives; tag semantic-versioned releases.
- Buyer-facing **README / quickstart** + a "make it yours" guide (init → own SA → first container export → first publish).
- Strip secrets/fixtures; ship `.env.example` only.

### PP2 — Fulfillment (pay → access)
- **Stripe** one-time **$250** (Payment Link or Checkout), product + price object created via Stripe MCP.
- **Access grant — primary:** GitPaywall gates the template repo; purchase unlocks access (mirrors the Ad-Forge `gitpaywall.com/p/organized-ai` pattern).
- **Access grant — alt (more automated):** Stripe webhook → GitHub API auto-invite/collaborator grant, or a signed release-tarball delivery + license key.

### PP3 — Mart listing
- Product card at **mart.organizedai.vip** in the terminal-card style: name, $250 one-time, white-label + privacy bullets, "Buy" CTA → Stripe.
- Attach the **talk deck** (talk.organizedai.vip) as the sales asset; add a QR to the listing.

### PP4 — Dogfood the tracking
- Wire the Mart checkout's own `purchase` event through organized-tracking → Data Client → Meta CAPI + GA4. The proof *is* the product.

### PP5 — Support & updates loop + add-on
- Changelog + version pinning so buyers know what they own.
- **GTM Autoresearch (+$150)** stood up as a separate Stripe price + Mart card, gated to core owners — fulfillment mirrors the core (GitPaywall grant on the gtm-autoresearch repo snapshot).
- Optional **paid services kept separate from the $250 core**: done-for-you setup, a support window, or a "latest version" refresh — none bundled into the one-time price.

---

## Decisions to lock before listing

- **Resale rights:** buyer internal + client use only, or may they resell? (Recommend: no resell.)
- **Updates:** does $250 include future versions, or is it the snapshot at purchase? (Recommend: snapshot + free minor patches; major versions optional add-on.)
- **Seat scope:** single buyer/org, unlimited client containers? (Recommend: yes — that's the value.)
- **Fulfillment path:** GitPaywall (fast, in-use) vs Stripe-webhook→GitHub (more automated, more build).
