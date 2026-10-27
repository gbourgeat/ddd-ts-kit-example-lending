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
| Raised | an alert is raised on a repayment that needs a compliance review |  |
| Filed | a suspicious activity report is filed with the financial intelligence unit |  |
| Rule | a condition under which a repayment raises an alert: an early repayment above the threshold within a year of the payout, or a payer account not the borrower's |  |
| Closure reason | the reason a compliance officer gives for closing an alert, required |  |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `Alert`
- `SuspiciousActivityReport`
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
- `financial-crime:alert.raise`
- `financial-crime:alert.close`
- `financial-crime:report.file`
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

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `CloseAlert` | command | `alert.close` |
| `FileSuspiciousActivityReport` | command | `report.file` |
| `RaiseAlert` | command | `alert.raise` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/alerts/:id/closure` | `closeAlert` | `AlertsRoutes` | `Authenticated` | `CloseAlert` | `alert.close` | params: `CloseAlertParams`, body: `CloseAlertBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `FinancialCrimeCodes.AlertAlreadyClosed`, `FinancialCrimeCodes.UnknownAlert`, `FinancialCrimeCodes.ClosureReasonMissing` |
| POST | `/alerts/:id/reports` | `fileSuspiciousActivityReport` | `AlertsRoutes` | `Authenticated` | `FileSuspiciousActivityReport` | `report.file` | params: `FileSuspiciousActivityReportParams` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `AlertRepository` | repository | `PrismaAlertRepository` |
| `FinancialIntelligenceUnit` | external | `RemoteFinancialIntelligenceUnit`, `SimulatedFinancialIntelligenceUnit` |
| `SuspiciousActivityReportRepository` | repository | `PrismaSuspiciousActivityReportRepository` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `AlertAlreadyClosed` | `forAlert` | `ALERT_ALREADY_CLOSED` | none |
| `ClosureReasonMissing` | `forAlert` | `CLOSURE_REASON_MISSING` | none |
| `UnknownAlert` | `forAlert` | `UNKNOWN_ALERT` | none |
<!-- /ddd-ts-kit:reference -->
