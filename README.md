# sales-catalog

Public catalog for products explicitly marked for sale.

GitHub Pages: https://nobutakayamauchi.github.io/sales-catalog/

## Responsibility boundary

`sales-catalog` is **not** a product implementation repository.

- Product implementation and technical truth live in each Canonical Repository.
- This repository aggregates sellable products as a three-page public set:
  - Product Overview
  - Sales Landing Page
  - Affiliate Guide
- Affiliate registration, attribution, payment, seller management, commission settlement, payout, authentication, backend, marketplace logic, and product runtime do not belong here.

## Current catalog

WebAI Bridge is the first catalog product. Product and partner metadata live in `data/products.json`.

```text
sales-catalog/
├── index.html
├── products/
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

If catalog copy conflicts with the Canonical Repository, the Canonical Repository wins.

WebAI Bridge canonical repository:
https://github.com/nobutakayamauchi/WebAI-Bridge
