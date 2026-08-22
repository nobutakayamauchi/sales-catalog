# sales-catalog

Public catalog for products explicitly marked for sale.

## Responsibility boundary

`sales-catalog` is **not** a product implementation repository.

- Product implementation and technical truth live in each Canonical Repository.
- This repository only aggregates sellable products as a two-page set:
  - Product Overview
  - Sales Landing Page
- Affiliate, payment, seller management, commission, payout, authentication, backend, marketplace logic, and product runtime do not belong here.

## V0

V0 publishes WebAI Bridge as the first catalog product and keeps product metadata in `data/products.json`.

```text
sales-catalog/
├── index.html
├── products/
│   └── webai-bridge/
│       ├── index.html
│       └── sales.html
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
