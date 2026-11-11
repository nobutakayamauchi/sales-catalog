# sales-catalog

Public catalog of products for sale, products requiring pre-purchase consultation, and development-stage integration inquiries.

GitHub Pages: https://nobutakayamauchi.github.io/sales-catalog/

## Responsibility boundary

`sales-catalog` is **not** a product implementation repository.

- Product implementation and technical truth live in each Canonical Repository or published source-of-truth page.
- This repository aggregates sellable products as public product pages:
  - Product Overview
  - Sales Landing Page
  - Affiliate Guide when partner sales are enabled
- Affiliate registration, attribution, payment, seller management, commission settlement, payout, authentication, backend, marketplace logic, and product runtime do not belong here.

## LP management

Public sales surfaces are managed as one bundle rather than as unrelated HTML files.

See [`LP_MANAGEMENT.md`](LP_MANAGEMENT.md) for source hierarchy, cross-file sync rules, pricing updates, provider/support wording, and affiliate discipline.

`data/products.json` is the catalog metadata registry. Each `products/<product-id>/` directory owns the public LP bundle for that product.

## Current catalog

- AXIS — ¥10,000 / success fee 50%. One agreed business problem, an implementation specification, and an implementation estimate. Implementation itself is a separate engagement.
- BridgePatch — ¥50,000–¥90,000 / success fee 50%. One agreed workflow improvement, with deliverables and acceptance conditions agreed before work.
- WebAI Bridge — ¥98,000 / success fee 50%. Pre-purchase consultation: confirm delivery version, deliverables, license scope/duration, hosting responsibilities/costs, support and cancellation terms. Historical real-world evidence does not establish current-release acceptance.
- Invoice Payment Ops — consultation only. Previous reference prices are ¥5,000 basic setup and up to ¥30,000 for additional work. The prototype is in unmerged PR #1, not a released main-branch bundle.
- Sales Distribution Network (SDN) — consultation only, price by inquiry. V1 development targets a single-product referral/settlement flow; real commercial-chain acceptance remains open.
- AI CM Render — ¥19,800 initial price, planned future price ¥29,800. Still-image pan/zoom, transitions, subtitles, BGM/SE and 15-second vertical MP4 delivery. Materials and commercial terms must be confirmed before purchase.

Catalog statuses: `for_sale`, `consultation_required`, and `consultation_only` are displayed with distinct labels. Direct payment CTAs for WebAI Bridge, Invoice Payment Ops, and AI CM Render currently lead to email consultation. Existing Stripe payment-link settings have not been changed; product-specific disclosures and fulfillment terms must be confirmed before direct checkout is restored.

Product and partner metadata live in `data/products.json`. Commission becomes eligible after confirmed receipt; unconfirmed, refunded, or charged-back sales do not become confirmed commission.

```text
sales-catalog/
├── index.html
├── LP_MANAGEMENT.md
├── products/
│   ├── axis/
│   │   ├── index.html
│   │   ├── sales.html
│   │   └── affiliate.html
│   ├── bridgepatch/
│   │   ├── index.html
│   │   ├── sales.html
│   │   └── affiliate.html
│   ├── webai-bridge/
│   │   ├── index.html
│   │   ├── sales.html
│   │   └── affiliate.html
│   └── sdn/
│       └── index.html
├── data/
│   └── products.json
└── assets/
    ├── css/catalog.css
    └── js/catalog.js
```

## Source of truth

If catalog copy conflicts with a Canonical Repository or published source-of-truth page, that source wins.

- AXIS / BridgePatch: `nobutakayamauchi/limit-development`
- WebAI Bridge: `nobutakayamauchi/WebAI-Bridge`
- SDN: `nobutakayamauchi/Sales-Distribution-Network` (V1 development status and evidence)
