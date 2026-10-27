# Architecture plan

Next: 7 build - the owner decides the open lines of `## For the owner` on branch `wave2-slices` (merge it by pull request, never push from here), then the blocked rows US4.03, US13.04 and US14.06 of `slices.md`

The `Next:` line above is read by tools at the start of every session: keep it on one line,
`Next: <step number> <skill> - <first thing to do>`, and `Next: done` at the end.

## Needs

Stated by the product owner, verbatim from `docs/architecture/needs.md`:

Written by the product owner, 2026-10-26.

We operate a lending platform for regional banks and credit unions. Each bank subscribes on its
own: its data, its staff, its customers and its loans are never visible to another bank. A bank
lends to individuals (personal loans, car loans) and to small businesses (term loans). We are
regulated: consumer credit law, anti-money laundering law, banking supervision and data
protection all apply, and an examiner from the supervisor must be able to rebuild any decision
we took, years later, from what we kept.

## Banks, branches and staff

A bank has branches. Its staff are advisors (each belongs to a branch and holds a portfolio of
customers), credit analysts and risk managers in the risk department, members of the credit
committee, compliance officers, branch managers and internal auditors. A bank also works with
brokers: outside intermediaries who bring applications. A broker must hold a registration
number with the intermediaries register that is valid on the day the application is brought;
a broker whose registration lapsed can no longer bring one.

Staff declare their conflicts of interest: a member of staff never prepares nor decides an
application of a customer they declared a link with (a relative, an associate), nor their own.

## Customers and due diligence

A customer is a person or a small business. Before any credit, the bank knows its customer:
identity documents and proof of address for a person; for a business, its registration, its
directors and its beneficial owners (anyone holding more than 25 percent), each of them known
as a person. Every person is screened against the sanctions lists and the lists of politically
exposed persons through an outside screening provider. A possible match is reviewed by a
compliance officer, who confirms or dismisses it with a reason; a confirmed sanctions match
ends the relationship.

Each customer gets a risk rating, low, medium or high, from the country, the activity, the
screening and the product. A high risk customer needs the approval of a compliance officer
before any credit is granted. Due diligence is refreshed every year for high risk, every three
years for medium and every five years for low; a customer whose refresh is overdue can apply
but no credit is disbursed to them until it is done.

## Applications

A customer applies for a product of the bank's catalogue: each product has its minimum and
maximum amount and duration, its fees and whether borrower insurance is mandatory. An
application names its borrower, possibly a co-borrower, possibly a guarantor, the amount, the
duration and the purpose. The applicant gives documents (payslips, tax notices, bank
statements, the accounts of a business), stored as files; the bank may instead read the income
and the expenses from the applicant's bank accounts through an account information provider,
with the applicant's consent, which expires after 90 days.

The application file is the record of everything that happened to the application, in order:
who entered or changed which information, which document arrived, what each check returned,
who looked at it, what was proposed and what was decided, with the reasons. Nothing in it is
ever edited; a mistake is corrected by a later entry that says what it corrects and why. We must
be able to show, for any decision, exactly what the decider had in front of them when they
decided.

## Assessment

Every application is assessed before any decision:

- the debt to income ratio: all monthly repayments of the household, the new one included,
  divided by its net monthly income, at most 35 percent;
- the residual income: what the household keeps each month after its repayments and fixed
  charges, at least a minimum set by the bank per adult and per child;
- the national register of repayment incidents, consulted through its provider: a borrower or
  co-borrower listed there is refused for consumer credit;
- the internal score, from the scoring model of the bank. The model is versioned; the
  assessment records the version, the inputs and the score, and the main factors that pushed the
  score down, in words a customer understands.

The assessment proposes approve or refuse. A refusal is never decided by the machine alone: a
person reviews every proposed refusal, and an applicant may ask for a human review of any
decision, give their point of view and contest it.

## Decision

Who may decide depends on the amount and on the risk, the bank's delegation rules:

| Decider | Up to |
|---|---|
| advisor | 15,000 for a personal or car loan with a green score |
| credit analyst | 75,000 |
| risk manager | 250,000 |
| credit committee | above, and every exception to the policy |

An exception (a ratio above 35 percent, a residual income below the minimum, a score below the
threshold of the product) needs a written justification and the decision of the level above the
one the amount alone would need, at least a risk manager. The person who prepared an
application never decides it. A decision is approve, approve with conditions (a lower amount, a
guarantor, a longer duration) or refuse with its reasons.

## Price and offer

The nominal rate comes from the bank's rate grid by product, risk class and duration. The
annual percentage rate of charge includes the interest, the fees and the mandatory insurance,
computed by the actuarial formula of the consumer credit directive. It must stay strictly below
the legal maximum rate for the category of the loan; the maximum rates are published every
quarter, and the one in force on the day of the offer applies. An offer above it is never
issued.

Before the offer, the borrower receives the standard pre-contractual information sheet. The
offer is valid 15 days. The borrower accepts it by electronic signature. A consumer may
withdraw within 14 calendar days of signing, without giving a reason; no funds are paid out
before the 8th day after signing. A withdrawal after the payout obliges the borrower to repay
the capital and the interest accrued until the repayment.

## Loans

Once paid out, a loan has its schedule of constant monthly instalments. The loan ledger records
every movement: the payout, each instalment due, each payment received, fees, early
repayments, reschedulings, write-offs. Nothing in it is ever edited; an error is reversed by an
entry of opposite effect. We must be able to give the balance, the arrears and the schedule of a
loan as they stood on any past date.

Instalments are collected by direct debit through the payment provider; a rejected debit makes
the instalment unpaid. Late fees are capped by the law. A borrower may repay early, in part or
in full; the early repayment fee is at most 1 percent of the amount repaid when more than a
year remains, 0.5 percent otherwise. A borrower in difficulty may obtain a rescheduling, decided
under the same delegation rules as a credit.

## Arrears and collections

A loan in arrears moves through 1 to 30, 31 to 60, 61 to 90 and over 90 days past due. Two
consecutive unpaid instalments of a consumer loan are declared to the national register of
repayment incidents, and the declaration is withdrawn when the arrears are paid. At 90 days a
loan is in default and handed to collections. The borrower is notified at each stage by mail and
text message.

## Money laundering

Repayments are watched: an early repayment of more than 10,000 within a year of the payout, or a
payment from an account that is not the borrower's, raises an alert. A compliance officer
reviews the alert and either closes it with a reason or files a suspicious activity report with
the financial intelligence unit. Nobody outside compliance may ever learn that a report exists
or was considered, neither the customer nor the advisor nor the branch: not by a screen, not by
an error message, not by a search, not by the audit trail.

## Who sees what

An advisor sees the customers of their portfolio and the applications and loans of those
customers; a branch manager sees everything of their branch; credit analysts and risk managers
see the applications that reach their level and the loans of the bank; the credit committee
sees what is put before it; compliance sees due diligence, alerts and reports; internal auditors
read everything except the content of a suspicious activity report. A broker sees only the
applications they brought, and never the result of the register or the score. A customer sees
their own applications and loans, through the customer portal of the API; a co-borrower sees the
application they are part of.

## Reports

Each month the bank needs, per branch: the number and amount of applications, the approval
rate, the share of exceptions, and the portfolio at risk (the share of the outstanding amount 30
days and 90 days past due); and the list of loans in default for the supervisor. Exported as
CSV.

## Retention and personal data

Due diligence records are kept five years after the end of the relationship, a loan ten years
after it is closed, a refused application six months. After that, the personal data are erased.
A customer may ask for a copy of all we keep about them. A scoring model processes personal data
at scale and decides on access to credit: the processing has its impact assessment.

## Running

The servicing of loans (the instalments due each day, the debits, the arrears) must keep running
when the rest of the platform is down for maintenance: it runs as its own service and talks to
the rest only through events. Each night it computes the instalments due for each bank.

Every change, every decision, every access of a member of staff to a customer file and every
grant of a right is audited.

## Steps

| # | Step | Artefact | Status |
|---|---|---|---|
| 1 | Discover the domain | `docs/architecture/discovery.md` | done |
| 2 | Find the bounded contexts | `docs/architecture/contexts.md` | done |
| 3 | Write the glossaries | `docs/architecture/glossary.md`, then each `CONTEXT.md` | done (CONTEXT.md files at bootstrap) |
| 4 | Draw the context map | `docs/architecture/context-map.md`, then `docs/context-map.md` | done (`docs/context-map.md` at bootstrap) |
| 5 | Choose the stack and bootstrap | `ddd-ts-kit.config.json`, the project | done (every gate green except `docs:check`, whose contracts the sandbox refuses to write: see `## For the owner`) |
| 6 | Plan the slices | `docs/architecture/slices.md` | done (167 rows in 16 stories, `plan-waves` green; the contracts of step 5 still wait on the owner, see `## For the owner`) |
| 7 | Build | code, one commit per slice | in progress: wave 2 on `wave2-slices` (rows done: US1.06, US1.10, US1.11, US2.03, US2.05, US3.06 to US3.10, US11.04; blocked: US4.03, US13.04, US14.06, see `## For the owner`) |

Status is `todo`, `in progress`, `done` or `skipped` (with the reason under Decisions).

## Decisions

- **CI: light pull requests, heavy nights** (owner, 2026-10-27). A pull request runs typecheck, lint, check,
  dead code, unit specs of the affected contexts, build with contract drift, and security. Integration, end-to-end,
  the Docker image and mutation run on `main` and every night at 01:00 UTC, two hours before the night of
  ddd-ts-kit, since both repositories share the concurrent jobs of the account. The mutation reading of a pull
  request is dropped. `gate` accepts a job skipped by its condition.
- **Branch protection without a required human approval** (owner, 2026-10-27). The project has one human
  owner, who cannot approve their own pull request; the review of each pull request is the
  `architecture-reviewer` agent, the story verifier and the owner's merge. A bank would require one approval
  by a second person (`.github/branch-protection.md`).

One line each: `<date> <what was decided>: <why> (<who decided>)`. A decision that constrains
the code later becomes a record in `docs/adr/` once the project exists.

- 2026-10-26 Stack imposed by the owner brief (`docs/architecture/owner-brief.md`, "Imposed choices"): `ddd-ts-kit@0.94.1 init` with the regulated profile, not `@latest` (owner brief)
- 2026-10-26 Session launched with steps 1 to 4 to run unattended; steps 5 to 7 left for a later session (owner, launch arguments)
- 2026-10-26 Step 1 closing check passed: every need is a command and a domain event (`discovery.md`) (decided by the conductor, owner brief)
- 2026-10-26 Advisor limit of 15,000 applies only in the best band of the scoring model, until the band is defined: most protective reading of an undefined "green" (conductor, owner brief, to confirm)
- 2026-10-26 Decision amount is the amount of the loan requested, co-borrower total not added (conductor, owner brief, to confirm)
- 2026-10-26 Consent to read accounts is per application, not per bank (conductor, owner brief, to confirm)
- 2026-10-26 Customer relationship is established before any credit; an applicant is a customer once identified (conductor, owner brief)
- 2026-10-27 Identification of a person: an identity document (passport, national identity card or residence permit) with its number, issuing country and expiry date, valid on the day of identification, and a proof of address dated within three months; refused when the document is expired or the proof of address older than three months, the reason named (conductor, owner brief, to confirm)
- 2026-10-27 Appointment of a member of staff to a branch: the appointment names the branch, which must be opened (an opened branch can take its staff, the glossary); an appointment to a branch not opened is refused with the reason named. The member of staff holds the branch of the appointment. The published StaffMemberAppointed v1 keeps its payload: a field that consumers need is a new version, not a change of v1 (conductor, owner brief, to confirm)
- 2026-10-27 The shape of servicing.loan.paid-out version 1 is final: the Loan is born paid out and no other event of it is stored yet; it is recorded in stored-events.lock.json, and any later change is a new version with its upcaster (conductor, owner brief, to confirm)
- 2026-10-27 Net income must be positive for the debt to income ratio; a zero or negative net income is refused with INVALID_NET_INCOME (conductor, owner brief, to confirm)
- 2026-10-27 Opening an organisation (a bank, a tenant) is reserved to the platform operator: a signed-in person with no relation to it is refused with 403 (conductor, owner brief, to confirm)
- 2026-10-26 Eleven contexts, two cores (`credit-application`, `credit-scoring`), `financial-crime` restricted to compliance, `identity` as kit preset; access rights, external systems, notifications and audit are not contexts (`contexts.md`) (conductor, owner brief)
- 2026-10-26 Payout gated in `credit-application` by a synchronous read of due diligence, so that no credit is disbursed at the instant of payout (conductor, owner brief, to confirm)
- 2026-10-26 Audit entries of `financial-crime` go to a stream readable by compliance only (conductor, owner brief, to confirm)
- 2026-10-26 Step 2 closing check passed: one language and one owner per context, the cores named, each boundary argued (decided by the conductor, owner brief)
- 2026-10-26 One word per concept across contexts: the tenant is "Bank", a staff member is not a "member", the customer's class is "risk rating", a loan movement is not an "entry" (conductor, owner brief, to confirm)
- 2026-10-26 Identity section copied from the kit's preset word for word; per-context CONTEXT.md files written at bootstrap, not now (conductor, owner brief)
- 2026-10-26 Step 3 closing check passed: every definition is one a domain expert would sign, shared words have a row per context (decided by the conductor, owner brief)
- 2026-10-26 Servicing and financial-crime and reporting collaborate by integration events only; financial-crime has no outbound arrow (`context-map.md`) (conductor, owner brief)
- 2026-10-26 Payout gate reads due diligence synchronously (customer-supplier); broker registration is a projection, accepted tension (conductor, owner brief, to confirm)
- 2026-10-26 Identity is a conformist upstream of every context that acts on people, as the kit's preset (conductor, owner brief)
- 2026-10-26 Step 4 closing check passed: every arrow has a pattern, a contract and a reason; topological order shows no cycle (decided by the conductor, owner brief)
- 2026-10-27 Step 5 stack: the imposed `ddd-ts-kit@0.94.1 init` of `owner-brief.md` ("Imposed choices"), run as written with `--package-manager npm`, nothing inferred (owner brief)
- 2026-10-27 Step 5 not closed: `init` stopped at the masked `.claude/hooks` with 143 of 166 files written, nothing committed; `@ddd-ts-kit/kernel@0.94.1` tarball 404 on the registry, so `npm install` fails (conductor, owner brief). Both in `docs/tooling/frictions.md`
- 2026-10-27 Step 5 `npm install` run with `--ignore-scripts`: the native build of `@confluentinc/kafka-javascript` needs github.com, zlib.net and curl.se, refused by the sandbox; the kafka client is not built here, the tests use fakes (conductor, owner brief, to confirm)
- 2026-10-27 Step 5 `prisma generate` and `migrate diff` run with `PRISMA_SCHEMA_ENGINE_BINARY` pointing to the schema engine in `~/.cache/prisma`: the sandbox refuses writes there (conductor, owner brief)
- 2026-10-27 Step 5 bare project committed (`chore: bootstrap the project`), after the owner's two lint fixes; `npm run format` applied to the one blank line the owner's `boundaryOf` edit left, no other change (conductor, owner brief)
- 2026-10-27 Step 5 contexts generated from `contexts.md` in the order of `context-map.md`: identity with `--preset identity` as written, the other ten with their glossary terms, their purpose and their upstreams as in the context map; modules `file`, `assessment`, `decision`, `offer` (credit-application) and `ledger`, `instalments`, `arrears` (servicing) (conductor, owner brief)
- 2026-10-27 Step 5 module names that are already a term of their context (`Assessment`, `Decision`, `Offer`, `Ledger`, `Arrears`) keep the context's glossary meaning: the generator skips them (conductor, owner brief)
- 2026-10-27 Step 5 "Classification" sentence of each context written from `contexts.md`, with no word of the other classifications in it (conductor, owner brief, to confirm)
- 2026-10-27 Step 5 the draft `docs/architecture/glossary.md` and `docs/architecture/context-map.md` deleted: their content lives in the `CONTEXT.md` files, the config and `docs/context-map.md` (conductor, owner brief, the skill's rule)
- 2026-10-27 Step 5 commits: one per context in topological order, identity first; one `chore` for the wiring the generators wrote in a single run (config, composition root, permissions, persistence schema, architecture tests, docs), not split per context; one `docs(architecture)` for the deletion (conductor, owner brief)
- 2026-10-27 Step 5 marked done as the owner asked; its own check (a green `verify`) waits on the owner's regeneration of the contracts, which the sandbox refuses (owner, launch arguments)
- 2026-10-27 Step 6 closing check passed: every need of `needs.md` and every close line of the owner brief reached by a row (coverage table of `slices.md`); `plan-waves` exits 0, 25 waves, every row has one owner (decided by the conductor, owner brief)
- 2026-10-27 Step 6 stories: sixteen stories `US0` to `US15`, one table each; `US8` (offer, withdrawal and payout) is the story of close line 14, its acceptance locked before its first row (conductor, owner brief)
- 2026-10-27 Step 6 jobs run per bank, the tenant loop of the kit; no `--global` job: the owner's checks say "each by a scheduled job per bank" (conductor, owner brief)
- 2026-10-27 Step 6 "payment from an account that is not the borrower's": a payer account not on the file as the borrower's raises the alert, the most protective reading until the matching is defined (conductor, owner brief, to confirm)
- 2026-10-27 Step 6 approval rate: applications approved (with or without conditions) over applications decided; share of exceptions: exceptions over applications decided; provisional until the owner defines them (conductor, owner brief, to confirm)
- 2026-10-27 Step 6 rescheduling: decided like a credit (same table, same four eyes), keeps the rate and the amount, changes only the schedule; the owner's rules of change stay open (conductor, owner brief, to confirm)
- 2026-10-27 Step 6 rejected direct debit: no retry; the instalment stays unpaid and enters the arrears buckets; the retry is open with the owner (conductor, owner brief, to confirm)
- 2026-10-27 Step 6 conflicts and staff roles reach credit-application by integration events into projections, checked at the decision: a conflicted person never decides (conductor, owner brief, to confirm)
- 2026-10-27 Step 6 amounts in cents live in the shared kernel (row US0.06); if the kernel refuses the generator, a friction (conductor, owner brief)
- 2026-10-27 Step 7 wave 1 built on `wave1-skeletons` from `main`, not on the trunk; the conductor's rows of wave 1 outside US0 (PR #6): 27. The two identity rows of wave 1 (US1.01, US14.05) are worker rows, left to `worker-scope identity` (conductor, owner brief)
- 2026-10-27 Step 7 skeleton states hold primitives; amounts are integer cents until the Money value object of US0.06 lands on the trunk (PR #6) (conductor, owner brief, to confirm)
- 2026-10-27 Step 7 reference rows (rate grid, legal maximum rate, delegation table, residual income minimum) carry their date of effect (conductor, owner brief, to confirm)
- 2026-10-27 Step 7 a retention period records no fact: the periods are the bank's configuration (conductor, owner brief, to confirm)
- 2026-10-27 Step 7 external ports: the port and its in-memory fake are committed; the remote adapter has its method and refuses every call until a transport exists, and no provider is chosen (the owner brief forbids a real provider) (conductor, owner brief, to confirm)
- 2026-10-27 Step 7 audit: a command declares its changed fields as it arrives, by default an entry carries identifiers and codes only (conductor, owner brief)
- 2026-10-27 Step 7 batches: the five credit-policy skeletons in one commit (shared context file and Prisma schema), the coverage specs in one `test` commit, the generator's Prisma and behaviour files in the commit of their generator (conductor, owner brief)
- 2026-10-27 Step 6 `--module` on every generator command of a row of `credit-application` and `servicing` (the generator refuses an aggregate, a port, a domain event or a value object without it; its usage lines do not show the flag, kit issue #354); `service servicing` takes none, it hosts the whole context (owner)
- 2026-10-27 Step 7 wave 2 built on `wave2-slices` from `main` (not pushed). Contracts of the trunk first (US1.10, US1.11, US2.03), then one worker per context, three at a time (credit-policy, branch-network, customer-due-diligence, then financial-crime, data-protection) (conductor, owner brief)
- 2026-10-27 Customer repository (event-sourced) generated on the trunk: no row of the plan generated it (conductor, owner brief)
- 2026-10-27 Stored shape of `customer-due-diligence.customer.business-registered` recorded as version 1 by `docs --stored-events` once the shape was final (conductor, owner brief, to confirm)
- 2026-10-27 BusinessRegistered records legal name, registration number, country and date; a second registration is refused as BUSINESS_ALREADY_REGISTERED (conductor, owner brief, to confirm)
- 2026-10-27 Product fee is one fixed arrangement fee in whole cents, insurance a boolean, bounds and threshold validated, inverted bounds refused (conductor, owner brief, to confirm)
- 2026-10-27 Legal maximum rate in basis points per category with a date of effect; delegation table levels as Json in cents, one date of effect per table; residual income minimum per adult and per child in cents (conductor, owner brief, to confirm)
- 2026-10-27 Alert threshold 10,000 euros in cents, and a payment from an account not on the borrower file raises an alert (conductor, owner brief, to confirm)
- 2026-10-27 US14.06 (audit e2e per command) left todo: its per-command specs cover the commands of US2 to US12, most not built (conductor)
- 2026-10-27 US4.03 left todo: the intermediaries register port has only its fake and a remote adapter that refuses calls (conductor, owner brief)
- 2026-10-27 US13.04 left todo: the kit refuses the command name EraseExpiredPersonalData (technical word "data"); the worker work stays uncommitted in its worktree (conductor)
- 2026-10-27 Moved to ddd-ts-kit 0.95.0: Prisma schema one file per context; identity declared the control plane of the tenants (`contexts.identity.tenancy`, deviation on ADR-0001), its seven suppressions removed, `check` prints `0 suppressions`; `--module` dropped from the `e2e` of US0.04, the one planned command of a kind that now refuses it (owner)

- 2026-10-27 US0 AC2 stays `pending(...)` until US6.18 builds the list of applications: US0 merges with AC2 pending, and the story closes when US6.18 is done (owner)
- 2026-10-27 US0 AC2 under Jest: the status of the list is to be checked by Jest's `expect(listed.status).toBe(200)`, because `pending(...)` refuses the node:assert failure of `expectStatus` (kit issue #436). The acceptance-judge refused this change of the locked scenario (`test/acceptance/verdicts/us0-a4fb82d0b747fa98.md`), so the lock keeps `expectStatus` and AC2 stays pending as above; the change is not applied (owner, the judge's verdict)
- 2026-10-27 Owner, run of wave 4: the PostgreSQL 18 of the project at 127.0.0.1:55440 is the database of `DATABASE_URL`; the first migration `initial-schema` is generated once it answers (owner)
- 2026-10-27 Owner, run of wave 4: US2.04 writes version 2 of the birth event of Customer with its upcaster, recorded by `docs --stored-events`, and declares the personal fields of the birth (owner)
- 2026-10-27 Owner, run of wave 4: the birth recorded at version 1 has no identity facts; its upcast gives them as not recorded, so that event alone does not identify the customer (conductor, owner brief, to confirm: most protective reading of the open choice)
- 2026-10-27 Owner, run of wave 4: the APR worked examples of `docs/architecture/apr-worked-examples.md` are the reference of US8.04; the monthly fee joins the repayment stream of the APR, the instalment does not include it (owner, the examples; checked by the conductor, all five round to the stated rate)
- 2026-10-27 Owner, run of wave 4: the decisions marked "to confirm" of this plan are confirmed as written (owner)
- 2026-10-27 Wave 4, US1.08: an appointed member of staff gets an empty portfolio (the appointment carries no role, and an empty portfolio grants no customer); a customer joins it by US1.13. Customers of a portfolio are the only access the advisor gets, so the empty one is the non-granting reading (conductor, owner brief, to confirm)
- 2026-10-27 Wave 4, US1.09 stays blocked: the declarer of a conflict of interest is a member of staff, but no link ties an account (the actor) to a StaffMember; without it the "never their own" rule cannot be checked. The link between identity and branch-network is the owner's to state (conductor, owner brief: not decidable from the brief)
- 2026-10-27 Wave 4, US1.13 stays blocked: the published `customer-due-diligence.customer.identified` on wave4 is version 1 with the customer id only, and no event says which advisor brought the customer; "joins the advisor's portfolio" needs that field (a published version 2 of customer-due-diligence, the owner's to state which advisor) (conductor, owner brief: not decidable from the brief)
- 2026-10-27 Wave 4, US4.03: the intermediaries register runs on its fake adapter, the runtime adapter of the run: the owner brief forbids a real provider, and no provider is chosen; the remote adapter keeps refusing calls (conductor, owner brief, to confirm)
- 2026-10-27 Wave 4, US2.06 stays blocked: the directors and beneficial owners are data the registration does not carry; their source and their stored shape (version 2 of the registration) are the owner's to state (conductor, owner brief: not decidable from the brief)
- 2026-10-27 US0 trace of the submission (`test/e2e/submit-application.e2e.spec.ts`): the expected tree completes the comment's description, under `unit-of-work before-commit` the domain event, its handler `CreditApplicationSubmittedPublisher` and the outbox append; a spec of the slice, not a locked scenario (owner)
- 2026-10-27 The amend verdicts of US0 (AC1: the customer related as `self` first; AC3: the recorder method `received()`, then the identifier read in `payload.creditApplicationId`) are validated; "in the same transaction that records it" of AC3 is asserted by no scenario, so row US0.07 proves it (owner)

## For the owner

- Migrations of the wave 2 rows: no database here; `npm run db:generate working-<what>` for the product, legal maximum rate, delegation table, residual income minimum and alert columns; the schema commits are on the trunk.
- Names to decide: `EraseExpiredPersonalData` (US13.04) is refused as a technical name; rename it in `slices.md` (the glossary terms "erase", "expired", "personal" are missing). Then the row returns to todo for its worker.
- Permissions granted to no role yet: `branch.open`, `product.define`, `rate-grid.publish`, `legal-maximum-rate.publish`, `delegation-table.set`, `residual-income-minimum.set`, `business.register`, `alert.raise`. Decide who holds each (`src/platform/auth/roles/`).
- Open business questions of wave 2: the credit committee ceiling and per-level limits (credit-policy), the day of effect of each delegation row, the reason stored on an alert.
- The rest of the wave 2 decisions are conductor, owner brief, to confirm: confirm or change the entries above under `## Decisions`.
- `npm run docs:generate` outside the sandbox: it writes `openapi/openapi.yaml`, `docs/integration/event-catalog.md` and the clients, which are read-only here (`EROFS`, see `docs/tooling/frictions.md`). Then `npm run docs:check` ends with `The generated documentation is up to date.`, and `npm run verify` is green. Commit the regenerated contracts as `docs(api): regenerate the contracts`.
- `npm run hooks:install` outside the sandbox: `.git/hooks` is read-only here, so no hook is installed (pre-commit and commit message checks run only after it).
- `git push` (refused by the settings: yours).
- Not run, yours when you want to see it run: `npm run infra:up`, then `npm run dev`; the API documentation is on `/docs`.
- Names the kit refuses, both from the design of `slices.md`: `ScoringModel` (credit-scoring, US5.01: the word "model" is a technical word) and `CopyOfData` (data-protection, US13.02: ends with "Data"). Rename them in `slices.md` (the glossary terms are "Scoring model" and "Copy of data"), or allow the names with `--allow-name`. Both rows stay `todo` until then.
- A real provider or a sandbox for each external port (owner brief: no real provider). Partial rows, the port and fake committed: US2.02 screening, US4.02 intermediaries register, US6.01 national register of incidents, US6.02 account information, US8.02 electronic signature, US9.03 payment provider, US10.01 mail and text messages, US10.02 register (servicing), US11.03 financial intelligence unit. The remote adapters refuse calls. The translators of US6.01, US6.02, US9.03 and US10.02 are generated with their markers: no sample format exists. Choose the fake as the runtime adapter (the owner brief's reading) or give the format of each provider.
- `npm run docs:check` is red on one line: `customer-due-diligence.customer.identified version 1 unrecorded in stored-events.lock.json`. Run `npx ddd-ts-kit docs --stored-events` once the birth shape of Customer is final; the identification slices (US2.04) may add a field, which would need version 2 with its upcaster (`event-sourcing/upcaster-required`). Everything before the last gate of `npm run verify` is green in the worktree.
- Migrations: `npx ddd-ts-kit prisma-generate --name <what-it-does>` (`npm run db:generate`) was not run: it needs a database and creates `prisma/migrations`, which the project does not have. The tables of the wave 1 skeletons are in `prisma/schema.prisma` only.
- Identity worker rows of wave 1: US1.01 and US14.05, with `npx ddd-ts-kit worker-scope identity --base origin/main --rows US1.01,US14.05`.
- The sandbox needs `PRISMA_SCHEMA_ENGINE_BINARY` set to the engine in `~/.cache/prisma` for every command that runs `db:client` (`verify`, `test`, `typecheck`); see `docs/tooling/frictions.md`.
- The StaffMember commit is over the commit-size advisory (26 files): the generator wrote its personal-data wiring in the same run. Accepted, not split.
- Push: not done; the branch `wave1-skeletons` is local (`git push` yours).
- Kit issues to file, with the rows marked `to file` of `docs/tooling/frictions.md`: the contracts and hooks refused by the sandbox, the seven suppressions, the blank "Not to be confused with" cells that `--term` cannot carry.
- The migration writing the table of the relationships, `authorization.relation_tuples` (model `RelationTuple`, the new schema `authorization`): none is in the repo, to be written and applied by the owner (US0.03).
- Build the native Kafka binding of `@confluentinc/kafka-javascript` before running the acceptance suite: it cannot load in this sandbox (US0.03).
- Simulated adapters (0.95.0, `generate adapter <context> <Port> --kind simulated`): deferred as the upgrade asked. The remote adapters that only throw are replaced in a later step.
- Wave 4, database: 127.0.0.1:55440 refuses connections from this session (nothing listens, Docker not reachable), so `npm run db:generate -- initial-schema` cannot run and no working migration can be generated. The e2e specs run in process (PGlite) and do not need it. The owner starts the PostgreSQL, then the conductor generates `initial-schema` on its own branch, and the owed working migrations follow (see the run report).
- Wave 3, `docs:check`: recorded by the conductor (see Decisions, the loan paid-out shape); nothing left open on it.
- Wave 3, decisions taken by the conductor under the owner brief, to confirm: identification of a person; appointment to a branch names the opened branch; opening an organisation reserved to the operator (signed-in grant narrowed in `src/platform/auth/authorization/signed-in-grants.ts`, commit 925ae04).

## Open questions

One line each, with who can answer. A question blocks only the step that needs its answer.

- Exact counts of the approval rate and of the share of exceptions in the monthly report (product owner). Glossary rows marked provisional.
- How an account is matched to a borrower for the "payment from another account" alert (product owner, compliance).
- Rules of rescheduling: change of rate, duration, or both (product owner, credit risk).
- Retry of a rejected direct debit, and behaviour of each external system when down (product owner).
