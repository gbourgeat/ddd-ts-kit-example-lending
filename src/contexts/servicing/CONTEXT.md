# Servicing

## Purpose

Runs the loan ledger from payout: the schedule, instalments and direct debits, early repayments, arrears buckets, the register declaration, default and handover to collections. It runs as its own service and talks to the rest only through events.

## Classification

supporting

Running the loans day after day is necessary to the business, but the lending judgement is made upstream, so it serves the decisions taken there.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Loan | Money paid out, with its schedule, from payout until closed or written off | Application, Offer |
| Borrower | The person who owes the loan | Co-borrower: who shares it, both are borrowers of the loan |
| Payout | The release of a loan's money to the borrower; the ledger starts here | Payout authorisation (credit-application) |
| Schedule | The constant monthly instalments of a loan from its payout | Instalment |
| Instalment | One monthly amount due under the schedule | Payment |
| Instalment due | An instalment whose date has come | Unpaid instalment |
| Payment | Money received against an instalment | Instalment |
| Direct debit | The collection of an instalment from the payer account, through the payment provider | Payment |
| Rejected debit | A direct debit refused by the payer's bank; the instalment becomes unpaid | Unpaid instalment |
| Unpaid instalment | A due instalment that was not paid | Late fee |
| Movement | One entry of the loan ledger: payout, instalment, payment, fee, early repayment, rescheduling or write-off | Entry (application file) |
| Ledger | The loan's movements, never edited; an error is reversed by a movement of opposite effect | Application file |
| Balance | The amount still owed on a given date, past dates included | Outstanding amount (reporting) |
| Early repayment | A repayment, in part or in full, before the schedule ends; its fee is at most 1 percent when more than a year remains, 0.5 percent otherwise | Payment |
| Late fee | The fee for an unpaid instalment, capped by law | Early repayment fee |
| Arrears | The unpaid amount of a loan past its due dates | Default |
| Days past due | The days since the oldest unpaid instalment | Arrears |
| Arrears bucket | 1 to 30, 31 to 60, 61 to 90 or over 90 days past due | Default |
| Default | A loan 90 days past due, handed to collections | Arrears bucket |
| Collections | The handover of a defaulted loan, after 90 days | Default |
| Declaration | The report of a repayment incident to the repayment incident register, after two consecutive unpaid instalments; withdrawn when the arrears are paid | Repayment incident register (credit-application) |
| Write-off | The end of a loan whose amount is not recovered: a movement | Default |
| Rescheduling | The new schedule of a loan, executed after its approval in credit-application | Restructuring |
| Borrower notice | The mail or text message sent to a borrower at each arrears stage | Declaration |
| Daily run | The night computation of the instalments due, for each bank | Direct debit |
| Instalments | Direct debits and rejected debits. |  |
| Paid out | The loan has been paid to the borrower and its schedule has started | Paid off, the loan repaid in full |
| Erase personal data past retention | Destroy the key of the personal values of every loan closed ten years ago, so that the ledger can no longer be read | Delete a loan |
| Closed loan | A loan whose schedule has ended, paid in full or repaid early: its ledger is kept for ten years, then its personal data is erased | Loan |

## Modules

| Module | Purpose |
|---|---|
| `ledger` | Payout, instalments, payments, fees, early repayment and write-off. |
| `instalments` | Direct debits and rejected debits. |
| `arrears` | Buckets, register declaration, default and handover to collections. |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `Loan` (event-sourced)
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
- `servicing:loan.erase-past-retention`
- `servicing:loan.close`
<!-- /ddd-ts-kit:permissions -->

## Scheduled jobs

<!-- ddd-ts-kit:jobs -->
| Job | Schedule | Command |
|---|---|---|
| `ErasePersonalDataPastRetentionJob` | `` | `ErasePersonalDataPastRetention` |
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
- Downstream of `credit-policy` (published-language).
- Downstream of `identity` (conformist).
- Downstream of `data-protection` (customer-supplier).
- Downstream of `customer-due-diligence` (published-language).
- Upstream of `financial-crime` (published-language).
- Upstream of `reporting` (published-language).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe servicing --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `credit-application` (published-language), `credit-policy` (published-language), `identity` (conformist), `data-protection` (customer-supplier), `customer-due-diligence` (published-language); downstreams: `financial-crime` (published-language), `reporting` (published-language).

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `CloseLoan` | command | `loan.close` |
| `ErasePersonalDataPastRetention` | command | `loan.erase-past-retention` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/loans/:id/closure` | `closeLoan` | `LoansRoutes` | `Authenticated` | `CloseLoan` | `loan.close` | params: `CloseLoanParams`, body: `CloseLoanBody` | 204 | `UNAUTHORIZED`, `FORBIDDEN`, `ServicingCodes.UnknownLoan`, `ServicingCodes.LoanAlreadyClosed` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `BorrowerNotifier` | external | `SimulatedBorrowerNotifier` |
| `LoanRepository` | repository | `EventStoreLoanRepository` |
| `PaymentProvider` | external | `SimulatedPaymentProvider` |
| `PersonalDataErasure` | external | `RemotePersonalDataErasure` |
| `RepaymentIncidentRegister` | external | `SimulatedRepaymentIncidentRegister` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `InvalidBorrower` | `forName` | `INVALID_BORROWER` | none |
| `InvalidSchedule` | `forInvalidTerms` | `INVALID_SCHEDULE` | none |
| `LoanAlreadyClosed` | `forLoan` | `LOAN_ALREADY_CLOSED` | none |
| `UnknownLoan` | `forLoan` | `UNKNOWN_LOAN` | none |
<!-- /ddd-ts-kit:reference -->
