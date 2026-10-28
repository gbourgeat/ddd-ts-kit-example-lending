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
| Label | The name given to a published version of the scoring model, for example 2026.1 | Name of the model |
| Applicant | The person whose inputs the scoring model scores, for one model version |  |
| Compute | The act of scoring an applicant with a model version, as an operator | Score |

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
- `credit-scoring:scoring-model.publish`
- `credit-scoring:score.compute`
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

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `PublishScoringModelVersion` | command | `scoring-model.publish` |
| `ScoreApplicant` | query | `score.compute` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/scores` | `scoreApplicant` | `ScoresRoutes` | `Authenticated` | `ScoreApplicant` | `score.compute` | body: `ScoreApplicantBody` | 200: `ScoreApplicantAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditScoringCodes.UnknownModelVersion` |
| POST | `/scoring-models` | `publishScoringModelVersion` | `ScoringModelsRoutes` | `Authenticated` | `PublishScoringModelVersion` | `scoring-model.publish` | body: `PublishScoringModelVersionBody` | 201: `PublishedScoringModelVersion` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditScoringCodes.ScoringModelLabelRequired` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `ScoringModelRepository` | repository | `PrismaScoringModelRepository` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `InvalidApplicantInput` | `forInput` | `INVALID_APPLICANT_INPUT` | none |
| `InvalidFactor` | `forWords` | `INVALID_FACTOR` | none |
| `InvalidFactor` | `forHarm` | `INVALID_FACTOR` | none |
| `InvalidScore` | `forValue` | `INVALID_SCORE` | none |
| `ScoringModelLabelRequired` | `forLabel` | `SCORING_MODEL_LABEL_REQUIRED` | none |
| `UnknownModelVersion` | `forLabel` | `UNKNOWN_MODEL_VERSION` | none |
<!-- /ddd-ts-kit:reference -->
