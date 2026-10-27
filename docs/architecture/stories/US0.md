# US0 Walking skeleton and access

## Statement

A customer of a bank submits one application for one loan, and the bank records it. The submission
opens the application file, keeps the requested amount in whole cents, is refused to anyone without
the right to submit, and is published once to the other contexts. The relationship schema that decides
those rights (bank, branch, portfolio, customer, application, loan) is built with its derived relations
and the tuple store kept in the transaction of each change. This story is the thin path every later
story extends: one command, one route, one end-to-end scenario, one event.

## Questions asked and their answers

- Who may submit? A customer of the bank, identified: an applicant is a customer once identified
  (plan, "Decisions", 2026-10-26). Decided by the conductor, owner brief, to confirm.
- What does a refused caller get? The refusal of the rights decision, with its code, and no application
  is recorded. Decided by the conductor, owner brief.
- What does the submission carry at birth? The applicant, the requested amount in whole cents, the
  duration in months. The product catalogue and its limits are not in this story (US3). Decided by the
  conductor, owner brief, to confirm.
- Is the amount in cents a value object of the shared kernel? Yes, `Money` (row US0.06); no floating point
  in the ledger (owner brief, "Imposed choices"). Decided by the conductor, owner brief.
- Is the publication of the submission at most once? Yes, through the outbox of the transaction
  (`events/outbox-required`). Decided by the conductor, owner brief.

## Acceptance criteria

- AC1: a customer of the bank submits an application for one loan and gets back its identifier, with a
  `Location` to the application, and the application file is opened with the requested amount in whole cents.
- AC2: a caller without the right to submit an application is refused with the refusal's code, and no
  application is recorded.
- AC3: the submission is published once, as an integration event carrying the application identifier, in
  the same transaction that records it.

## Decisions taken while building

Provisional, taken by the conductor under the owner brief, recorded so that the owner can confirm or
change them. A decision that changes a locked acceptance scenario goes through the acceptance-judge.

- D1 (US0.01, `Submitted` shape). The birth event carries the applicant, the requested amount as
  `Money` in cents, and the duration in whole months. It is version 1 and not stored anywhere yet
  (no `stored-events.lock.json` is written), so its shape may change in place until
  `docs --stored-events` records it. Decided by the conductor, owner brief, to confirm.
- D2 (US0.04, the resource of the submission). The actor is the customer; the permission
  `application.submit` is checked on the customer named by the actor (`customer:<actor id>`), which the
  relationship schema derives from the `self` relation. No application exists before submission, so
  the TODO of the generated command that names an application does not apply. Decided by the conductor,
  owner brief.
- D3 (US0.04, the currency). Every amount of US0 is in euros: `Money` holds cents, the response adds
  `currency: 'EUR'`. Decided by the conductor, owner brief, to confirm.
- D4 (US0.04, the body). The locked AC1 scenario posts `productId` as well: it is accepted and not used
  yet, the product catalogue is US3. Decided by the conductor, owner brief, to confirm.
- D5 (US0.04, the refusals). A requested amount that is not a positive whole number of cents is refused
  as `InvalidAmount`; a duration that is not a positive whole number of months as `InvalidDuration`. The
  product limits (minimum and maximum amount and duration) are US3. Decided by the conductor, owner brief,
  to confirm.
- D6 (US0.04, acceptance to amend). The locked AC1 scenario does not give the customer its `self`
  relation before it submits, so it cannot pass as written: the arrangement `relate` of
  `customer:customer-1#self@user:customer-1` must come first. AC2 reads `GET /applications`, the list
  route of US6.18, which is not in US0: the refusal is observed through the events published instead
  (none for a refused submission). Both amend through the acceptance-judge before the lock is written
  again. Open, to be settled by the conductor when the row is closed.
