# Credit policy

## Purpose

Holds the bank's reference data with dates of effect: products and their limits, rate grid, legal maximum rates, delegation table, residual income minimums and score thresholds. Nothing is decided here.

## Classification

supporting

It holds the bank's reference data and decides nothing, so it supports the decisions without being one of them.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Product | A loan product of the catalogue: personal loan, car loan or term loan, with its minimum and maximum amount and duration, its fees, and whether borrower insurance is mandatory | Application |
| Catalogue | The products the bank offers, each with its dates of effect | Product |
| Rate grid | The nominal rate of each product by risk rating and duration, with dates of effect | Annual percentage rate |
| Legal maximum rate | The highest annual rate for a category of loan, published each quarter; the one in force on the day of the offer applies | Rate grid |
| Delegation table | Which decider may decide by amount and by risk, with the exceptions | Delegation (identity): the granting of access |
| Delegation limit | The amount up to which a level may decide: advisor 15,000 with a green score, credit analyst 75,000, risk manager 250,000, credit committee above | Score threshold |
| Residual income minimum | The least amount a household keeps each month, per adult and per child | Residual income (assessment) |
| Score threshold | The lowest score a product accepts without an exception | Score |
| Dates of effect | The day from which a value applies | Publication date |
| Risk rating | Low, medium or high: the customer's class, which the rate grid is organised by | Score |
| Defined | a product is put in the catalogue with its threshold |  |
| Published | a value of the bank is published with the day from which it applies |  |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `DelegationTable`
- `LegalMaximumRate`
- `Product`
- `RateGrid`
- `ResidualIncomeMinimum`
<!-- /ddd-ts-kit:aggregates -->

## Published events

<!-- ddd-ts-kit:events -->
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
No personal data declared.
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
- `credit-policy:rate-grid.publish`
<!-- /ddd-ts-kit:permissions -->

## Scheduled jobs

<!-- ddd-ts-kit:jobs -->
No scheduled job.
<!-- /ddd-ts-kit:jobs -->

## Background jobs

<!-- ddd-ts-kit:background-jobs -->
No background job.
<!-- /ddd-ts-kit:background-jobs -->

## State machines

<!-- ddd-ts-kit:state-machines -->
No state machine.
<!-- /ddd-ts-kit:state-machines -->

## Process managers

<!-- ddd-ts-kit:processes -->
No process manager.
<!-- /ddd-ts-kit:processes -->

## Relationships

<!-- ddd-ts-kit:relationships -->
- Upstream of `credit-application` (published-language).
- Upstream of `servicing` (published-language).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe credit-policy --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: none; downstreams: `credit-application` (published-language), `servicing` (published-language).

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `PublishRateGrid` | command | `rate-grid.publish` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/rate-grids` | `publishRateGrid` | `RateGridsRoutes` | `Authenticated` | `PublishRateGrid` | `rate-grid.publish` | body: `PublishRateGridBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `DelegationTableRepository` | external | `PrismaDelegationTableRepository` |
| `LegalMaximumRateRepository` | external | `PrismaLegalMaximumRateRepository` |
| `ProductRepository` | external | `PrismaProductRepository` |
| `RateGridRepository` | repository | `PrismaRateGridRepository` |
| `ResidualIncomeMinimumRepository` | external | `PrismaResidualIncomeMinimumRepository` |
<!-- /ddd-ts-kit:reference -->
