# sales-catalog

Public catalog for products explicitly marked for sale.

GitHub Pages: https://nobutakayamauchi.github.io/sales-catalog/

## Responsibility boundary

`sales-catalog` is **not** a product implementation repository.

- Product implementation and technical truth live in each Canonical Repository or published source-of-truth page.
- This repository aggregates sellable products as public product pages:
  - Product Overview
  - Sales Landing Page
  - Affiliate Guide when partner sales are enabled
- Affiliate registration, attribution, payment, seller management, commission settlement, payout, authentication, backend, marketplace logic, and product runtime do not belong here.

## Current catalog

- AXIS — ¥10,000 / success fee 50%. Turns a concrete pain point into an implementation-ready specification and estimate.
- BridgePatch — ¥50,000–¥90,000 / success fee 50%. Reviews the existing workflow/tools, reuses and connects what already works, and builds only the missing piece.
- WebAI Bridge — ¥98,000 / success fee 50%. Web distribution and access-control foundation for AI products.

Product and partner metadata live in `data/products.json`. Commission becomes eligible after confirmed receipt; unconfirmed, refunded, or charged-back sales do not become confirmed commission.

```text
sales-catalog/
├── index.html
├── products/
│   ├── axis/
│   │   ├── index.html
│   │   ├── sales.html
│   │   └── affiliate.html
│   ├── bridgepatch/
│   │   ├── index.html
│   │   ├── sales.html
│   │   └── affiliate.html
│   └── webai-bridge/
│       ├── index.html
│       ├── sales.html
│       └── affiliate.html
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
