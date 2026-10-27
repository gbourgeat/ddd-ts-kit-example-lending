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
