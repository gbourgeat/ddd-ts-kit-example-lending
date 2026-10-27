# Credit scoring

## Purpose

Scores an applicant with the bank's versioned scoring model and says in words which factors pushed the score down. The model is versioned on its own cycle, owned by model risk.

## Classification

core

The scoring model is the bank's own judgement of credit risk, versioned and owned by model risk, and it shapes every credit decision.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Scoring model | The bank's versioned model that turns the inputs of an applicant into a score | Assessment |
| Model version | One published version of the scoring model; a score states its version | Model, in general |
| Input | A value the model uses for an applicant | Factor |
| Score | The number the model gives an applicant, for one version | Risk rating (customer) |
| Band | The range a score falls in; the best band is green | Risk rating |
| Green band | The best band of the model; the only band an advisor may decide with | Green score as a colour |
| Factor | An input that pushed the score down, stated in words a customer understands | Input |
| Published | A version of the scoring model made available for use by the credit decisions | Draft, the version being prepared |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `ScoringModel`
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
No permission declared.
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
- Upstream of `credit-application` (customer-supplier).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe credit-scoring --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: none; downstreams: `credit-application` (customer-supplier).

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `ScoringModelRepository` | external | `PrismaScoringModelRepository` |
<!-- /ddd-ts-kit:reference -->
