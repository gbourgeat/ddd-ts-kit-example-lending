# Reporting

## Purpose

Monthly figures per branch, portfolio at risk and the defaults list for the supervisor, exported as CSV. It reads only, fed by the events of the other contexts, and owns no rule.

## Classification

supporting

Figures for management and the supervisor are read from the events of other contexts and decide nothing.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Monthly report | For each branch, for a month: applications, approval rate, share of exceptions, portfolio at risk | Defaults list |
| Application count | The number and amount of applications brought in the month | Approval rate |
| Approval rate | The share of applications approved in the month; the owner defines the exact count (open question) | Refusal rate |
| Share of exceptions | The share of decisions that are exceptions; the owner defines the count (open question) | Exception (credit-application) |
| Outstanding amount | The capital still owed on loans, on a date | Balance (servicing) |
| Portfolio at risk | The share of the outstanding amount of loans 30 days, or 90 days, past due | Arrears |
| Defaults list | The loans in default, for the supervisor, as CSV | Default (servicing) |
| Supervisor | The banking supervisor, who receives the defaults list | Financial intelligence unit |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
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
- Downstream of `credit-application` (published-language).
- Downstream of `servicing` (published-language).
- Downstream of `branch-network` (published-language).
- Downstream of `identity` (conformist).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe reporting --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `credit-application` (published-language), `servicing` (published-language), `branch-network` (published-language), `identity` (conformist); downstreams: none.

### Projections

| Projection | Class | Applies |
|---|---|---|
| not read | not read |  |
| not read | `ApplicationCountProjection` |  |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `ApplicationCounts` | not bound |  |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `ApplicationCount` | `forSubmissionWithoutTenant` | `APPLICATION_COUNT` | none |
<!-- /ddd-ts-kit:reference -->
