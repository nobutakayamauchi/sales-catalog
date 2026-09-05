# AGENTS.md

## Repository role
`sales-catalog` is the public aggregation and sales-surface repository for products explicitly marked for sale. It is not a product implementation/runtime repository.

## Load order
1. Read `README.md`.
2. Read `LP_MANAGEMENT.md` before changing product copy, pricing, support wording, or affiliate surfaces.
3. Read `data/products.json` for catalog metadata.
4. For any capability claim, verify the canonical product repository instead of inferring implementation truth from sales copy.

## Source of truth
- Public catalog metadata and LP bundles are canonical here.
- Technical/product truth is canonical in each product implementation repository.
- When sales copy conflicts with implementation, the implementation repository wins and this repository must be corrected.

## Context budget
- Work one product bundle at a time.
- Do not load every LP or every product repo unless the task explicitly requires catalog-wide consistency checking.
- Follow only the canonical implementation source relevant to the claim being edited.

## Human gates
Publishing, pricing changes, legal/commercial claims, affiliate commission changes, checkout links, deletion, visibility changes, or external actions require explicit human approval.

## Stop conditions
Stop when price, terms, refund conditions, availability, or product capabilities cannot be verified from the current canonical source. Never invent sales facts.