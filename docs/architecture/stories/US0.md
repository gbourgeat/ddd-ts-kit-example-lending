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
- D7 (US0.01 and US0.04, the shape of `Submitted`). Version 1 is final for US0 and recorded in
  `stored-events.lock.json` (`docs --stored-events`); a change of it needs version 2 and its upcaster.
  Conductor, owner brief, to confirm.
- D8 (US0.05, the payload). The public payload carries the application id, the applicant (an opaque id,
  no personal data), the amount in cents and the duration in months. Conductor, owner brief, to confirm.

## Report

Status at the close of this session: every row of US0 is committed on `us0-walking-skeleton`, the story
is not closed.

Commits (branch `us0-walking-skeleton`, base `main`): `81be091` story, design review and acceptance;
`04b6836` US0.01; `91689ec` US0.02; `07c6eee` the derived keys named after the permission ids; `040978a`
US0.03; `c1fa4d3` US0.06; `0ee1798` decisions; `b689e92` US0.04; `81e0dc2` AC1 amended; `9625081` US0.05;
`d5b7ea7` the stored lock and the builder used.

What blocks the close, each for the owner or the environment, none for the code:
1. The e2e suites (`test/acceptance/us0.acceptance.spec.ts`, `test/e2e/submit-application.e2e.spec.ts`)
   fail to load `@confluentinc/kafka-javascript`: its native binding is not built in this sandbox.
   `npm rebuild @confluentinc/kafka-javascript` outside the sandbox, then `npm run test:e2e`. So AC1 and
   AC3 are unproven here, and AC3's `pending(...)` stays until its scenario runs and passes.
2. AC2 stays pending: its locked form lists the applications (`GET /applications`), the route of US6.18.
   The acceptance-judge refused the replacement (verdict `us0-e0a3fa4974adb251.md`). It closes when
   US6.18 is built, or when the owner accepts a client-visible proof of "no application recorded".
3. `npm run check:arch` reports `tree/closed` on the harness's folder inside the `credit-application` context (a
   `.claude` folder, `tree/documented-paths` warning): the harness wrote `.cc-writes` there (untracked, not in git). Not deleted here, since it is the harness's
   folder: the owner removes it, or the harness stops writing into the context.
4. `npm run verify`: typecheck, lint, format, unit coverage (86 suites, 408 tests) and depcruise pass; deadcode
   and `docs --check` pass after the commit `d5b7ea7`. Not run in full: the e2e gate stops it (item 1), and
   the contracts `openapi/`, `clients/` and the SDK are written outside the sandbox by the owner
   (`docs/tooling/frictions.md`, the rows of step 5).
5. Markers left in credit-application, each for a later row, none of US0: repository lookups and
   snapshots (US6.18 and after), the fake's lookups, the contract's `mutate` case (no second intention in
   US0), the e2e publish `it.todo` (covered by AC3). `story-check US0` counts them as its own while the
   story is open.
6. The migration of `authorization.relation_tuples` and the `authorization` schema are for the owner
   (`## For the owner` in `docs/architecture/plan.md`).

Decisions: D1 to D8 above, provisional under the owner brief.

### Update: acceptance run, after the AC3 amendment

- Rows: all six done, committed (`4c98f21` is the AC3 amendment).
- Acceptance run (`test/acceptance`, with the built Kafka binding copied from the main checkout and the
  in-process object store of `b9f038e`): AC1 passes, AC3 passes (`#US0.05 AC3`, unwrapped in `4c98f21`),
  AC2 fails.
- AC2 is the blocker, and US0 cannot fix it, for two reasons:
  1. Its locked form lists the applications with `GET /applications`, which answers 404: that route is
     US6.18, not built. The acceptance-judge refused a replacement (verdict for AC2, fingerprint
     e0a3fa4974adb251).
  2. Even the assertion failure of its `expectStatus` is refused by `pending(...)`: the kit's pending
     accepts an error named `AssertionError`, and Node's `assert` names its errors
     `AssertionError [ERR_ASSERTION]`, so the expected failure reads as a broken scenario. Kit defect,
     logged in `docs/tooling/frictions.md`.
- What closes the story: build US6.18 (`ListApplications`), or the owner accepts a client-visible proof
  of "no application recorded" through an amendment the judge accepts; and the kit's pending check
  accepts Node's assertion name. Until then the acceptance gate `written` lists AC2 and the story is not
  closed.
- The AC3 verdict (fingerprint d918241d34ce01e4) is not committed: the guard refuses a command naming
  the verdict folder. The owner adds it with the lock.
- Decision D9 (the harness). The e2e object store gets in-process S3 values, like the broker and Redis
  (`b9f038e`); no file is read or written by US0. Conductor, owner brief, to confirm.
- Decision D10 (the built Kafka binding). Copied from the main checkout into the worktree's
  `node_modules` (same lock entry), so the e2e suites load; not a code change. Conductor, owner brief.

### Update: owner decisions at the close of the session

- AC2 stays `pending(...)` until US6.18 builds the list of applications (`GET /applications`). US0 is merged with
  AC2 pending; **the story closes when US6.18 is done**: the AC2 scenario then loses its wrapper and passes.
  Owner, `plan.md` Decisions.
- AC2 under Jest (kit issue #436): the change to `expect(listed.status).toBe(200)` was given to the acceptance-judge
  and refused (verdict `us0-a4fb82d0b747fa98.md` in the verdicts folder): the locked scenario keeps `expectStatus`,
  so the change is not applied and the lock is not written again. The friction is in `docs/tooling/frictions.md`.
  Owner, `plan.md` Decisions.
- The trace of the submission (`test/e2e/submit-application.e2e.spec.ts`, "is one trace") now expects the domain
  event, its handler `CreditApplicationSubmittedPublisher` and the outbox append under `unit-of-work before-commit`.
  The spec passes. Owner, `plan.md` Decisions.

### Close status: blocked by US6.18, stopped here

Status: **not closed**. Every row of US0 is done and committed on `us0-walking-skeleton`; the acceptance is written
and locked (`npx ddd-ts-kit acceptance US0 --gate written` → `gate written: 1 left`).

What blocks the close:
1. AC2 (`#US0.04 #US0.02 #US0.03`) stays `pending(...)` until US6.18 builds `GET /applications` (owner decision 1).
   Its locked body lists the applications, a route answering 404 today. The change to Jest's `expect` (kit issue
   #436) was refused by the acceptance-judge (verdict `us0-a4fb82d0b747fa98.md`), so the lock is unchanged and AC2
   is not re-locked. The story closes when US6.18 is done: AC2 then loses its wrapper and passes.
2. Consequence: `npm run verify` stops at `test:e2e` with `Tests: 1 failed, 1 todo, 7 passed, 9 total`, the failure
   being AC2's `expectStatus` (404 against 200) refused by `pending(...)`, kit issue #436. The gates after it pass
   when run alone: `check:arch` `0 errors, 0 warnings, 7 suppressions in 426 files`, `depcruise`, `deadcode`,
   `docs:check`.
3. Still open for the owner, unchanged: the seven suppressions of the identity preset (`docs/architecture/plan.md`,
   "For the owner"), the migration of `authorization.relation_tuples`, the contracts regenerated outside the sandbox.

Decisions taken so far, all in this file and in `plan.md` `## Decisions`: D1 to D10 above (conductor, owner brief,
to confirm where marked); owner decisions 1 to 3 (AC2 pending until US6.18; the AC2 change to Jest's `expect`, refused
by the judge and not applied; the trace tree of the submission, done, `ea3ce0c`).
