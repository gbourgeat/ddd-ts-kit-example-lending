# Context map (draft)

Source: `contexts.md` (step 2) and `glossary.md` (step 3). Patterns decided by the conductor
under `owner-brief.md` ("conductor, owner brief"), to be confirmed by the owner. Not written
at the project root yet: the bootstrap turns each row into `contexts.<downstream>.upstreams`
of `ddd-ts-kit.config.json` and writes the generated map to `docs/context-map.md` (step 5).

| Downstream | Upstream | Pattern | What crosses (contract) | Why this pattern |
|---|---|---|---|---|
| credit-application | credit-policy | published-language | events `credit-policy.product.published`, `credit-policy.rate-grid.published`, `credit-policy.delegation-table.published`, `credit-policy.legal-maximum-rate.published`, each with its dates of effect; local projection in credit-application | the policy team publishes for many readers; the decision never edits the data |
| credit-application | credit-scoring | customer-supplier | query `score-applicant` (inputs in; score, band, model version, factors out), answered in the same call | the assessment must record the version and the score at one instant; scoring plans its contract to the application's needs |
| credit-application | customer-due-diligence | customer-supplier | query `due-diligence-status` (up to date, overdue, sanctions match) for the payout gate; events `customer-due-diligence.risk-rating.set`, `customer-due-diligence.refresh.overdue` in a local projection | "no credit is disbursed" must hold at payout; due diligence serves the application's gate |
| credit-application | brokerage | published-language | events `brokerage.broker.registered`, `brokerage.registration.lapsed`, `brokerage.registration.renewed`, with the registration number and its dates | brokerage publishes its registrations; the application checks its local projection on the day |
| credit-application | branch-network | published-language | events `branch-network.staff-member.appointed`, `branch-network.customer.assigned`, `branch-network.conflict.declared`, and the conflicts lifted | the exclusion of a conflicted staff member and the advisor's portfolio are facts of branch management |
| credit-application | identity | conformist | the account id (subject), the bank id (tenant), the membership role | the kit's preset: the application uses its ids as they are |
| credit-scoring | — | — | no upstream: its inputs are passed by credit-application in the call | — |
| credit-policy | — | — | no upstream: the bank's own reference data | — |
| customer-due-diligence | identity | conformist | the account id of the staff member who acts, the bank id | the kit's preset |
| customer-due-diligence | data-protection | customer-supplier | events `data-protection.retention.ended`, query `data-protection.copy-of-data` | the data protection officer's needs are planned into each context's work (erasure, copy) |
| branch-network | customer-due-diligence | published-language | events `customer-due-diligence.customer.identified` (customer id, kind person or business) | branch management refers to customers by the id due diligence publishes |
| branch-network | identity | conformist | the account id of each staff member, the bank id | the kit's preset |
| brokerage | identity | conformist | the account id of a broker who has one, the bank id | the kit's preset (to confirm: a broker may have no account) |
| servicing | credit-application | published-language | events `credit-application.payout.authorised` (application id, approved amount in cents, rate, duration, insurance), `credit-application.offer.withdrawn`, `credit-application.rescheduling.approved` (loan id, new terms) | the handover from an application to a loan is one fact, published once |
| servicing | credit-policy | published-language | events `credit-policy.fee-caps.published` (early repayment and late fee caps, with dates of effect) | legal data of the bank, read by the ledger |
| servicing | identity | conformist | the account id of a staff member, the bank id | the kit's preset |
| servicing | data-protection | customer-supplier | events `data-protection.retention.ended` (erasure of the loan's personal data after ten years) | the erasure is planned into the ledger's work; the ledger keeps its movements, personal data are destroyed |
| financial-crime | servicing | published-language | events `servicing.payment.received` (loan id, amount in cents, payer account, date), `servicing.early-repayment.made`, `servicing.loan.paid-out` (date) | alerts need the facts of repayments; servicing publishes them without knowing who watches |
| financial-crime | identity | conformist | the account id of a compliance officer, the bank id | the kit's preset; only compliance accounts may read the context |
| reporting | credit-application | published-language | events `credit-application.application.submitted`, `credit-application.application.decided`, `credit-application.exception.decided` | the monthly figures are counts of facts; reporting reads, owns nothing |
| reporting | servicing | published-language | events `servicing.loan.paid-out`, `servicing.instalment.unpaid`, `servicing.loan.defaulted`, `servicing.movement.posted` | the portfolio at risk is fed by the ledger's events, rebuilt from zero |
| reporting | branch-network | published-language | events `branch-network.branch.opened`, `branch-network.staff-member.appointed` | a figure is counted per branch |
| reporting | identity | conformist | the bank id | the kit's preset |
| data-protection | identity | conformist | the bank id, the account id of the data protection officer | the kit's preset |

External systems (screening provider, repayment incident register, account information,
payment provider, financial intelligence unit, electronic signature, mail and text messages,
object store, supervisor) are not contexts and have no row. Each is an anti-corruption layer
(`infrastructure/anti-corruption/`) in the context that calls it: screening in
customer-due-diligence; the register in credit-application and servicing; the account
information in credit-application; the payment provider and notices in servicing; the
financial intelligence unit in financial-crime; the signature in credit-application; the
object store in credit-application; the supervisor's list is an export of reporting.

## Reading guide

1. The main flow: due diligence and brokerage and branch management feed the application; the
   application's policy gate reads due diligence; a decision becomes a payout authorisation;
   servicing creates the loan and publishes its repayments.
2. Financial crime is a leaf: it reads servicing's facts and publishes nothing, and nothing
   publishes to it but servicing. Compliance's secret is structurally out of every other path.
3. Reporting is a leaf too: it reads events of four contexts and writes nothing back.

## Cycle check

No cycle. Topological order: identity, data-protection, credit-policy, credit-scoring,
brokerage, customer-due-diligence, branch-network, credit-application, servicing,
financial-crime, reporting. Every arrow goes from an earlier to a later context.

## Debated boundaries and tensions

- **Payout gate is synchronous, the rest eventual.** The due diligence check at payout is a
  query: if due diligence is down, payout waits (fails safe). Signal to watch: a payout delayed
  by due diligence more than a day.
- **Broker registration is a projection.** A broker whose registration lapses this morning may
  still bring an application until the event arrives. Known tension, accepted by the conductor
  under the owner brief. Signal: an application brought after its registration lapsed, found by
  reporting; then make the check synchronous.
- **Credit-scoring is a separate context.** Its only consumer is the application, and the
  answer must come in the same call. Signal to merge: a scoring change that always comes with
  an application change.
- **Erasure of event-sourced aggregates.** Erasure destroys the personal data of the events,
  not the events; the ledger's amounts stay. Signal: an examiner who needs a personal name from
  a loan older than ten years.
- **Identity conformist everywhere.** The kit's preset is not ours to change; contexts
  conform to its ids. A cost, accepted for the preset.
- **Financial-crime has no outbound arrow.** Nothing tells servicing or the branch that a report
  exists; the cost is that servicing cannot react to a suspicious borrower, by design.
