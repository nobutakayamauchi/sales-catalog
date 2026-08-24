# LLM Cost Router — Launch Checklist

Status: `LAUNCH_READY / NOT PUBLICLY LISTED`

The sales assets and live Stripe Payment Links are prepared in advance so the product can be released immediately after the runtime/research release gate passes.

## Already prepared

- Sales LP: `products/llm-cost-router/sales.html`
- Product overview: `products/llm-cost-router/index.html`
- Affiliate guide: `products/llm-cost-router/affiliate.html`
- Personal live Stripe Payment Link: ¥10,000 / max 10 completed sessions
- Business live Stripe Payment Link: ¥49,800 / max 5 completed sessions
- Affiliate self-service commission policy: 50% of confirmed receipt
- Product metadata exists in `data/products.json`

## Current safety lock

`data/products.json` uses:

```json
"status": "launch_ready"
```

The catalog renderer only lists `status === "for_sale"`, so this product is not shown in the public catalog before release approval.

## Release gate

Before launch, verify:

1. The distributable standard runtime is actually ready.
2. The current benchmark claims used on the LP are still accurate.
3. No stronger generalized savings claim is published without reproducible evidence.
4. License wording still matches Personal / Business policy.
5. Stripe links open with the intended live prices and capacities.

## Launch action

When the release gate passes:

```text
launch_ready
→ for_sale
→ merge this launch PR to main
→ verify GitHub Pages
→ publish announcement / affiliate recruitment
```

The intended launch operation is therefore a metadata flip plus merge, not a new LP/payment build.

## Future product pattern

For later products, prepare the same four things before the implementation is fully released:

```text
Product Runtime
+ Sales LP
+ Stripe Offer
+ Catalog Metadata (launch_ready)
```

When the runtime reaches its release gate, flip the metadata to `for_sale` and merge. This keeps product creation and sales preparation parallel while preventing unfinished products from appearing in the live catalog.
