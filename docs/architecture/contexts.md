# Bounded contexts

Source: `discovery.md` (step 1). Fixed by the owner brief: banks are tenants, the identity is
the kit's preset, `CreditApplication`, `Loan` and due diligence are event-sourced, `servicing`
is its own service. Every other choice below is "conductor, owner brief".

| Context | Classification | Purpose (business terms) | Owns (timeline rows) | Owner |
|---|---|---|---|---|
| credit-application | core | Takes an application from a customer or a broker to a decision, then to an offer the borrower accepts or withdraws. Modules: `file`, `assessment`, `decision`, `offer`. | 16 to 20, 22 to 25, 26 to 32, 37 (rescheduling decision) | credit risk department |
| credit-scoring | core | Scores an applicant with the bank's versioned model and says in words which factors pushed the score down. | the score part of 22 | model risk |
| credit-policy | supporting | Holds the bank's reference data with dates of effect: products and their limits, rate grid, legal maximum rates, delegation table, residual income minimums, score thresholds. Nothing is decided here. | data of 16, 26, 29 | credit risk department, legal |
| customer-due-diligence | supporting | Knows each customer: identity, business and its beneficial owners, screening, risk rating, refresh dates. Event-sourced. | 7 to 15 | compliance |
| branch-network | supporting | Branches of a bank, its staff and their roles, the portfolio of each advisor, declared conflicts of interest. | 2 to 4 | branch management |
| brokerage | supporting | Brokers, their registration with the intermediaries register, and whether it is valid on a given day. | 5 to 6 | distribution |
| servicing | supporting | Runs the loan ledger from payout: schedule, instalments and direct debits, early repayment, arrears buckets, register declaration, default and handover to collections. Modules: `ledger`, `instalments`, `arrears`. Runs as its own service. | 33 to 42 | loan operations |
| financial-crime | supporting, restricted | Watches repayments, raises alerts, and files suspicious activity reports. Visible to compliance only. | 43 to 45 | compliance |
| reporting | supporting | Monthly figures per branch, portfolio at risk, defaults list. Reads only, fed by the events of the others. | 46 to 47 | management reporting |
| data-protection | supporting | Holds the retention schedule and the processing register, answers the copy of a customer's data, and asks each context to erase after retention. | 48, 49, 51 | data protection officer |
| identity | generic (kit preset `identity`) | Accounts, banks as tenants, members, invitations, access delegations. | 1, and the members of every row | platform |

Audit of every change, decision, access and grant (row 50) is the kit's cross-cutting audit,
not a context: see "Rejected cuts".

## Why these boundaries

- **credit-application / credit-policy**: a decision uses the delegation table and the rate
  grid; it never edits them. Their owners and their change dates differ (language: "delegation"
  here is a limit, not a delegated right; see `identity`).
- **credit-application / credit-scoring**: the model is versioned on its own cycle, owned by
  model risk. The assessment only records the version, the inputs and the score it got.
- **credit-application / servicing**: before payout the object is an application; from payout
  it is a loan, with a ledger and a schedule. Payout is the handover. Payout is gated in
  credit-application: the check of due diligence is a synchronous read (customer-supplier),
  because "no credit is disbursed" must hold at the instant of payout.
- **customer-due-diligence / branch-network**: "customer" is a person the bank knows and must
  refresh; "portfolio" is which advisor follows which customer. Two languages, two owners.
- **customer-due-diligence / credit-application**: the applicant is the one who applies; the
  customer is the one the bank knows. An applicant becomes a customer once identified.
- **servicing / financial-crime**: repayments are the facts watched; the alert and the report
  are a different language and a different visibility. Separating them lets the restriction
  hold by construction: nobody outside compliance can read this context.
- **brokerage / credit-application**: a broker is an outside intermediary, not staff; their
  registration is a precondition of bringing an application, checked on the day.
- **reporting**: reads only; no rule of its own, so it is not a domain context but a read
  model owner. Kept apart so that the reporting schedule does not touch the ledger.
- **data-protection**: retention applies to every context; the schedule is one language, the
  erasure is done by each context on its own data (event sourcing: shredded, not edited).
- **identity**: a preset of the kit. Its "delegation" is the granting of access; it is not the
  credit delegation table.

## Modules of the large contexts

Not contexts: one model, one language, one transaction.

- `credit-application`: `file` (the application file, documents, account consent), `assessment`
  (debt to income, residual income, register result, score recorded), `decision` (delegation,
  four eyes, exceptions, rescheduling), `offer` (rate, annual percentage rate, pre-contract
  sheet, acceptance, withdrawal).
- `servicing`: `ledger` (payout, instalments, payments, fees, early repayment, write-off),
  `instalments` (direct debits, rejected debits), `arrears` (buckets, register declaration,
  default, handover to collections).

## Rejected cuts

- **notifications** (mail, text messages): decides nothing, only sends. A port of the contexts
  that notify, behind an adapter.
- **documents**: the documents are part of the application file; the object store is an adapter.
- **external systems** (screening provider, register of repayment incidents, account information,
  payment provider, financial intelligence unit, electronic signature): no context. Each is
  wrapped by an anti-corruption layer in the context that uses it. The register is called by
  credit-application (assessment) and servicing (declaration).
- **access rights** (relationships bank, branch, portfolio, customer, application, loan): no
  context. The relationships come from branch-network (staff, portfolios), credit-application
  (applicant, co-borrower, broker) and identity (members); each context enforces its own rule.
- **audit** (row 50): the kit's cross-cutting audit, not a business context. Hot spot taken
  (conductor, owner brief, to confirm): entries of `financial-crime` go to a stream that only
  compliance can read, so that the audit search never shows a report exists.
- **pricing**: a module (`offer`) of credit-application, not a context. The rates are data
  of credit-policy; the annual percentage rate is the formula of the offer.
- **rescheduling**: not a context. It is a decision of credit-application, executed in servicing.
- **product catalogue**: data of credit-policy, not a context.

## Hot spots taken

- Advisor limit (15,000) of the delegation table: decided by `credit-policy`; the "green" band
  is a score of `credit-scoring` (conductor, owner brief).
- Due diligence overdue blocks payout only (not the application): the application may proceed
  (conductor, owner brief, to confirm).
