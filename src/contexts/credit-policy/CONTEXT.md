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
| Arrangement | The one-off fee charged to the borrower when a loan is granted, held as a whole amount in cents |  |
| Fee | The amount a product charges the borrower beyond the interest |  |
| Bounds | The minimum and the maximum a product accepts, on the amount or on the duration |  |
| Amount | The sum lent to the borrower, held as a whole amount in cents |  |
| Duration | The length of a loan, held as a whole number of months |  |
| Inverted | A minimum set above its maximum |  |
| Terms | The conditions a product is sold with: its amounts, durations, arrangement fee, insurance and score threshold |  |
| Schedule | the order of the legal maximum rates of one category by their dates of effect |  |
| Set | a delegation table is set when it is recorded with the day it takes effect |  |
| List | the read of the products of the catalogue, by an applicant |  |
| Search | a read of the products of the catalogue, one page at a time, asked by an applicant |  |

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
- `credit-policy.delegation-table.published` (version 1)
- `credit-policy.delegation-table.published` (version 2)
- `credit-policy.legal-maximum-rate.published` (version 1)
- `credit-policy.legal-maximum-rate.published` (version 2)
- `credit-policy.product.defined` (version 1)
- `credit-policy.rate-grid.published` (version 1)
- `credit-policy.rate-grid.published` (version 2)
- `credit-policy.residual-income-minimum.published` (version 1)
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
No personal data declared.
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
- `credit-policy:rate-grid.publish`
- `credit-policy:product.define`
- `credit-policy:legal-maximum-rate.publish`
- `credit-policy:delegation-table.set`
- `credit-policy:residual-income-minimum.set`
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
| `DefineProduct` | command | `product.define` |
| `PublishLegalMaximumRate` | command | `legal-maximum-rate.publish` |
| `PublishRateGrid` | command | `rate-grid.publish` |
| `SearchProductCatalogue` | query | `public` |
| `SetDelegationTable` | command | `delegation-table.set` |
| `SetResidualIncomeMinimum` | command | `residual-income-minimum.set` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| PUT | `/delegation-table` | `setDelegationTable` | `DelegationTableRoutes` | `Authenticated` | `SetDelegationTable` | `delegation-table.set` | body: `SetDelegationTableBody` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditPolicyCodes.InvalidDelegationTable` |
| POST | `/legal-maximum-rates` | `publishLegalMaximumRate` | `LegalMaximumRatesRoutes` | `Authenticated` | `PublishLegalMaximumRate` | `legal-maximum-rate.publish` | body: `PublishLegalMaximumRateBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditPolicyCodes.InvalidLegalMaximumRate` |
| POST | `/products` | `defineProduct` | `ProductsRoutes` | `Authenticated` | `DefineProduct` | `product.define` | body: `DefineProductBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditPolicyCodes.ProductBoundsInverted`, `CreditPolicyCodes.InvalidArrangementFee`, `CreditPolicyCodes.InvalidScoreThreshold` |
| POST | `/rate-grids` | `publishRateGrid` | `RateGridsRoutes` | `Authenticated` | `PublishRateGrid` | `rate-grid.publish` | body: `PublishRateGridBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN` |
| PUT | `/residual-income-minimums` | `setResidualIncomeMinimum` | `ResidualIncomeMinimumsRoutes` | `Authenticated` | `SetResidualIncomeMinimum` | `residual-income-minimum.set` | body: `SetResidualIncomeMinimumBody` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditPolicyCodes.InvalidResidualIncomeMinimum` |

### Publishers

| Event | Versions | Publisher |
|---|---|---|
| `credit-policy.delegation-table.published` | 1, 2 | `DelegationTablePublishedPublisher` |
| `credit-policy.legal-maximum-rate.published` | 1, 2 | `LegalMaximumRatePublishedPublisher` |
| `credit-policy.product.defined` | 1 | `ProductDefinedPublisher` |
| `credit-policy.rate-grid.published` | 1, 2 | `RateGridPublishedPublisher` |
| `credit-policy.residual-income-minimum.published` | 1 | `ResidualIncomeMinimumPublishedPublisher` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `DelegationTableRepository` | repository | `PrismaDelegationTableRepository` |
| `LegalMaximumRateRepository` | repository | `PrismaLegalMaximumRateRepository` |
| `ProductRepository` | repository | `PrismaProductRepository` |
| `RateGridRepository` | repository | `PrismaRateGridRepository` |
| `ResidualIncomeMinimumRepository` | repository | `PrismaResidualIncomeMinimumRepository` |
| `SearchProductCatalogueReader` | repository | `PrismaSearchProductCatalogueReader` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `InvalidArrangementFee` | `forCents` | `INVALID_ARRANGEMENT_FEE` | `cents` |
| `InvalidDelegationTable` | `forLimit` | `INVALID_DELEGATION_TABLE` | `level`, `amountCents` |
| `InvalidDelegationTable` | `forLevels` | `INVALID_DELEGATION_TABLE` | `levels` |
| `InvalidLegalMaximumRate` | `forBasisPoints` | `INVALID_LEGAL_MAXIMUM_RATE` | `basisPoints` |
| `InvalidLegalMaximumRate` | `forCategory` | `INVALID_LEGAL_MAXIMUM_RATE` | `category` |
| `InvalidLegalMaximumRate` | `forBeforeLatest` | `INVALID_LEGAL_MAXIMUM_RATE` | `effectiveFrom`, `latestEffectiveFrom` |
| `InvalidResidualIncomeMinimum` | `forCents` | `INVALID_RESIDUAL_INCOME_MINIMUM` | `cents` |
| `InvalidScoreThreshold` | `forScore` | `INVALID_SCORE_THRESHOLD` | `score` |
| `ProductBoundsInverted` | `onAmount` | `PRODUCT_BOUNDS_INVERTED` | `minimum`, `maximum` |
| `ProductBoundsInverted` | `onDuration` | `PRODUCT_BOUNDS_INVERTED` | `minimum`, `maximum` |
<!-- /ddd-ts-kit:reference -->
