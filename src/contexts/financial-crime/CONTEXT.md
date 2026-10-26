# Financial crime

## Purpose

Watches repayments, raises alerts, and files suspicious activity reports with the financial intelligence unit. Visible to compliance only: nobody else may learn that a report exists.

## Classification

supporting

Anti-money-laundering is a legal duty that supports the business; its restricted visibility is a rule of the context, not its class.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Alert | A flag on a repayment: an early repayment above 10,000 within a year of the payout, or a payment from a payer account that is not the borrower's | Possible match (screening) |
| Payer account | The bank account a payment came from | Account (identity): a person's login |
| Alert review | The compliance officer's review of an alert | Screening |
| Closed alert | An alert closed by compliance, with its reason | Filed report |
| Suspicious activity report | A report filed with the financial intelligence unit about an alert; known to compliance only | Alert |
| Filing | The act of filing a suspicious activity report | Declaration (servicing) |
| Financial intelligence unit | The public unit that receives suspicious activity reports | Supervisor (reporting) |

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
- Downstream of `servicing` (published-language).
- Downstream of `identity` (conformist).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe financial-crime --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `servicing` (published-language), `identity` (conformist); downstreams: none.
<!-- /ddd-ts-kit:reference -->
