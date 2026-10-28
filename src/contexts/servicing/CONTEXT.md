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
| Early repayment | A repayment of capital, in part or in full, before the schedule ends; its fee is 1 percent of the capital repaid when more than a year (12 months) of the schedule remains, 0.5 percent otherwise, in integer cents rounded down; the capital repaid cannot exceed the outstanding capital, and repaying all of it closes the loan | Payment |
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
| Record | Write the payout of a loan and its schedule into the ledger, the loan being then paid out |  |
| Authorised | The payout of an application approved and signed by the borrower, as credit-application announces it |  |
| Scheduled | The loan has its schedule: the constant monthly instalments computed from its amount, duration and rate at its payout |  |
| Borrower identified | The customer whose name the loan records is known to customer-due-diligence |  |
| Loan read | The view of a loan the borrower's application reaches: its status, amount, duration and instalments, never its personal data |  |
| Loan schedule | The amount, rate, duration and instalments of a loan, computed at its payout from the signed offer |  |
| Compute | Work out each night which instalments of the schedule of a loan have fallen due |  |
| Due date | The day an instalment falls due: its number of calendar months after the payout, on the payout day or the last day of a shorter month, in UTC |  |
| Noted | The ledger records that an instalment fell due, once, with its number, its due date and its amount |  |
| Repay | Pay back capital of a loan, in part or in full, before its schedule ends: an early repayment |  |
| Write off | Record that the outstanding capital of a loan is not recovered: the loan ends, and the write-off can be reversed |  |
| High | Above the outstanding capital of the loan: a repayment too high is refused |  |
| Reverse | Undo a write-off by a movement of opposite effect: the outstanding capital is open again |  |
| Outstanding capital | The capital still owed by a loan: its principal, less the capital repaid by the instalments noted due, the early repayments and the write-off |  |
| Decision | The approval of a rescheduling by credit-application, executed by the ledger as a new schedule |  |
| Withdrawn | The borrower withdrew an application whose loan was already paid out: the loan is repaid, capital and interest accrued |  |
| Withdrawal | The borrower's withdrawal of an application after its payout, which repays the loan |  |
| Simple | Without compounding: each day's interest is on the principal only |  |
| Interest | Interest accrued from the payout to a withdrawal, simple and daily: principal times the annual rate, times the whole days elapsed, over 365 days, in whole cents rounded down |  |

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
- `servicing.loan.paid-out` (version 1)
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
No personal data declared.
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
- `servicing:loan.erase-past-retention`
- `servicing:loan.close`
- `servicing:loan.record-payout`
- `servicing:loan.read`
- `servicing:loan.compute-due`
- `servicing:loan.repay-early`
- `servicing:loan.write-off`
- `servicing:loan.reschedule`
- `servicing:loan.record-repayment`
<!-- /ddd-ts-kit:permissions -->

## Scheduled jobs

<!-- ddd-ts-kit:jobs -->
| Job | Schedule | Command |
|---|---|---|
| `ErasePersonalDataPastRetentionJob` | `` | `ErasePersonalDataPastRetention` |
| `ComputeDueInstalmentsJob` | `` | `ComputeDueInstalments` |
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
| `ComputeDueInstalments` | command | `loan.compute-due` |
| `ErasePersonalDataPastRetention` | command | `loan.erase-past-retention` |
| `ReadLoan` | query | `loan.read` |
| `RecordPayout` | command | `loan.record-payout` |
| `RecordWithdrawalRepayment` | command | `loan.record-repayment` |
| `RepayEarly` | command | `loan.repay-early` |
| `RescheduleLoan` | command | `loan.reschedule` |
| `ReverseWriteOff` | command | `loan.write-off` |
| `WriteOffLoan` | command | `loan.write-off` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/loans/:id` | `readLoan` | `LoansRoutes` | `Authenticated` | `ReadLoan` | `loan.read` | params: `ReadLoanParams` | 200: `ReadLoanAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `ServicingCodes.UnknownLoan` |
| POST | `/loans/:id/closure` | `closeLoan` | `LoansRoutes` | `Authenticated` | `CloseLoan` | `loan.close` | params: `CloseLoanParams`, body: `CloseLoanBody` | 204 | `UNAUTHORIZED`, `FORBIDDEN`, `ServicingCodes.UnknownLoan`, `ServicingCodes.LoanAlreadyClosed` |
| POST | `/loans/:id/early-repayments` | `repayEarly` | `LoansRoutes` | `Authenticated` | `RepayEarly` | `loan.repay-early` | params: `RepayEarlyParams`, body: `RepayEarlyBody` | 204 | `UNAUTHORIZED`, `FORBIDDEN`, `ServicingCodes.UnknownLoan`, `ServicingCodes.LoanAlreadyClosed`, `ServicingCodes.InvalidRepayment`, `ServicingCodes.EarlyRepaymentTooHigh` |
| POST | `/loans/:id/write-off` | `writeOffLoan` | `LoansRoutes` | `Authenticated` | `WriteOffLoan` | `loan.write-off` | params: `WriteOffLoanParams`, body: `WriteOffLoanBody` | 204 | `UNAUTHORIZED`, `FORBIDDEN`, `ServicingCodes.UnknownLoan`, `ServicingCodes.LoanAlreadyClosed` |
| POST | `/loans/:id/write-off-reversal` | `reverseWriteOff` | `LoansRoutes` | `Authenticated` | `ReverseWriteOff` | `loan.write-off` | params: `ReverseWriteOffParams`, body: `ReverseWriteOffBody` | 204 | `UNAUTHORIZED`, `FORBIDDEN`, `ServicingCodes.UnknownLoan`, `ServicingCodes.LoanNotWrittenOff` |

### Consumed events

| Event | Version | From | Handler | Consumer |
|---|---|---|---|---|
| `credit-application.credit-application.payout-authorised` | 1 | `credit-application` | `RecordPayoutOnPayoutAuthorisedIntegrationHandler` | `servicing.record-payout-on-payout-authorised` |
| `credit-application.credit-application.reschedule-decided` | 1 | `credit-application` | `RescheduleOnDecisionIntegrationHandler` | `servicing.reschedule-on-decision` |
| `credit-application.credit-application.withdrawn` | 1 | `credit-application` | `RepayWithdrawnLoanIntegrationHandler` | `servicing.repay-withdrawn-loan` |

### Publishers

| Event | Versions | Publisher |
|---|---|---|
| `servicing.loan.paid-out` | 1 | `LoanPaidOutPublisher` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `BorrowerIdentity` | gateway | `RemoteBorrowerIdentity` |
| `BorrowerNotifier` | external | `SimulatedBorrowerNotifier` |
| `LoanRepository` | repository | `EventStoreLoanRepository` |
| `PaymentProvider` | external | `SimulatedPaymentProvider` |
| `PersonalDataErasure` | external | `RemotePersonalDataErasure` |
| `ReadLoanReader` | repository | `EventStoreReadLoanReader` |
| `RepaymentIncidentRegister` | external | `SimulatedRepaymentIncidentRegister` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `BorrowerNotIdentified` | `forCustomer` | `BORROWER_NOT_IDENTIFIED` | none |
| `EarlyRepaymentTooHigh` | `forRepayment` | `EARLY_REPAYMENT_TOO_HIGH` | none |
| `InvalidBorrower` | `forName` | `INVALID_BORROWER` | none |
| `InvalidRepayment` | `forAmount` | `INVALID_REPAYMENT` | none |
| `InvalidSchedule` | `forInvalidTerms` | `INVALID_SCHEDULE` | none |
| `LoanAlreadyClosed` | `forLoan` | `LOAN_ALREADY_CLOSED` | none |
| `LoanNotWrittenOff` | `forLoan` | `LOAN_NOT_WRITTEN_OFF` | none |
| `UnknownLoan` | `forLoan` | `UNKNOWN_LOAN` | none |

### Gateways

| Gateway | Upstream | Adapters |
|---|---|---|
| `BorrowerIdentity` | `customer-due-diligence` | `RemoteBorrowerIdentity` |
<!-- /ddd-ts-kit:reference -->
