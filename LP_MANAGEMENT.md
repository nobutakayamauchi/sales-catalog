# LP Management

This repository is the public sales-surface registry for sellable products.

The goal of this file is to stop landing-page copy, pricing, affiliate wording, and product positioning from drifting across scattered files.

## Source hierarchy

Use this order when information conflicts:

1. **Canonical product repository** — implementation state, supported features, security boundaries, runtime behavior.
2. **`data/products.json`** — catalog metadata such as public product name, current catalog price, URLs, partner status, and commission basis.
3. **`products/<product-id>/sales.html`** — customer-facing sales narrative and offer.
4. **`products/<product-id>/index.html`** — short product overview.
5. **`products/<product-id>/affiliate.html`** — partner-facing sales summary. It must not invent guarantees beyond the Sales LP or Canonical Repository.
6. Completion/support/operator pages — transactional or operational pages only. They must not become a second sales source of truth.

## Standard LP bundle

Each sellable product should use this bundle where applicable:

```text
products/<product-id>/
├── index.html          # Product Overview
├── sales.html          # Customer-facing canonical Sales LP
├── affiliate.html      # Partner guide, when partner sales are enabled
├── sales.css           # Product-specific LP presentation, if needed
└── *-complete.html     # Transaction completion pages, when needed
```

The product must also have one record in `data/products.json`.

## Change rule

A meaningful offer change is not complete until all affected surfaces are checked in the same change set.

Changes that normally require a cross-file check:

- price or pricing model;
- target customer / positioning;
- supported AI/provider/model;
- current vs planned feature wording;
- checkout URL;
- partner status or commission;
- support terms;
- hosting / BYOK / inference-payer policy;
- security or availability claims;
- product name or canonical repository.

For a price change, check at minimum:

```text
data/products.json
products/<product-id>/sales.html
products/<product-id>/index.html
products/<product-id>/affiliate.html
README.md
```

For a product capability change, check the Canonical Repository first. Do not promote a planned capability to a current capability only because it appears in marketing copy.

## Current WebAI Bridge positioning

Customer-facing message:

> AIを借りるのではなく、AIを配る場所を自分で持つ。

Current commercial boundary:

- current public edition: ChatGPT / OpenAI compatible edition;
- standard inference policy: BYOK;
- future provider editions may include high-demand providers such as Claude or Gemini after implementation and verification;
- unsupported providers can be discussed before purchase, but support is not guaranteed;
- creator/platform-funded self-hosted inference is not a general public offer;
- self-hosted inference may only be considered as an individually reviewed contract with explicit usage, budget, prohibited-use, suspension, and risk terms;
- customer-facing price should be revealed after the value proposition in the Sales LP rather than dominating the hero section.

## Time-sensitive platform claims

Claims about external platforms such as ChatGPT / GPTs, provider pricing, plan eligibility, API policy, or publishing availability can become stale.

When such a claim appears in an LP:

- include an explicit date when useful;
- link to an official source where practical;
- re-check the source before materially rewriting the LP;
- do not turn a provider risk into a guaranteed outcome (for example, avoid claiming that an account will definitely be permanently banned).

## Affiliate discipline

Affiliate copy is a summary, not an independent product specification.

Partners should be sent to `sales.html` for the customer-facing offer. Technical questions should resolve to `index.html` or the Canonical Repository. Affiliate pages must not independently promise provider support, hosted inference, delivery dates, or security guarantees.

## Why this exists

The catalog already centralizes public product pages. The remaining failure mode is semantic drift: one page says one price, another says another; one page calls a feature current while another calls it planned; one partner page over-promises something the runtime does not support.

Treat the LP bundle and `data/products.json` as one managed sales artifact, not as unrelated HTML files.
