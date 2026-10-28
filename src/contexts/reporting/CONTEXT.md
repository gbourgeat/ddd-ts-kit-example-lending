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
| Decision | A decider's ruling on a credit application: an approval, an approval with conditions or a refusal. | Exception (credit-application) |
| Loan principal | the amount paid out to a loan, kept to share the portfolio at risk of a branch |  |
| Branch | the branch of the bank a loan was paid out on, the unit of the reports |  |

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
- `reporting:report.portfolio-at-risk`
- `reporting:report.defaults`
- `reporting:report.monthly`
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

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `DefaultedLoans` | query | `report.defaults` |
| `DefaultsList` | query | `report.defaults` |
| `MonthlyReport` | query | `report.monthly` |
| `PortfolioAtRiskPerBranch` | query | `report.portfolio-at-risk` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/reports/defaulted-loans` | `defaultedLoans` | `ReportsRoutes` | `Authenticated` | `DefaultedLoans` | `report.defaults` |  | 200: `DefaultedLoansAnswer` | `UNAUTHORIZED`, `FORBIDDEN` |
| GET | `/reports/defaults` | `defaultsList` | `ReportsRoutes` | `Authenticated` | `DefaultsList` | `report.defaults` |  | 200: `DefaultsListAnswer` | `UNAUTHORIZED`, `FORBIDDEN` |
| GET | `/reports/monthly` | `monthlyReport` | `ReportsRoutes` | `Authenticated` | `MonthlyReport` | `report.monthly` | query | 200: `page of MonthlyReportLine` | `UNAUTHORIZED`, `FORBIDDEN` |
| GET | `/reports/portfolio-at-risk` | `portfolioAtRiskPerBranch` | `ReportsRoutes` | `Authenticated` | `PortfolioAtRiskPerBranch` | `report.portfolio-at-risk` |  | 200: `PortfolioAtRiskPerBranchAnswer` | `UNAUTHORIZED`, `FORBIDDEN` |

### Projections

| Projection | Class | Applies |
|---|---|---|
| not read | not read |  |
| not read | `ApplicationCountProjection` |  |
| not read | `DecisionProjection` |  |
| not read | `DefaultedLoanProjection` |  |
| not read | `LoanPrincipalProjection` |  |
| not read | `PortfolioAtRiskProjection` |  |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `ApplicationCounts` | not bound |  |
| `DecisionCounts` | not bound |  |
| `DefaultedLoan` | not bound |  |
| `DefaultedLoansReader` | repository | `PrismaDefaultedLoansReader` |
| `DefaultsListReader` | repository | `DefaultsListFromDefaultedLoansReader` |
| `LoanPrincipal` | not bound |  |
| `MonthlyReportReader` | repository | `PrismaMonthlyReportReader` |
| `PortfolioAtRisk` | not bound |  |
| `PortfolioAtRiskPerBranchReader` | repository | `PrismaPortfolioAtRiskPerBranchReader` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `ApplicationCount` | `forSubmissionWithoutTenant` | `APPLICATION_COUNT` | none |
<!-- /ddd-ts-kit:reference -->
