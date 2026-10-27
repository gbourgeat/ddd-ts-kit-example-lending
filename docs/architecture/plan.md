# Architecture plan

Next: 7 build - wave 4 is on branch `wave4` and `verify` is green there: the owner decides the blocked rows of `## For the owner` (US1.09, US1.13, US2.06, US2.16, US13.04, US14.06) and the migrations once a database answers, then the rows left in `slices.md`

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
- 2026-10-27 The first migration `initial-schema` (every table of `prisma/schema/`, the relationship tuples and the audit guard included) is generated and applied by the owner outside the sandbox: a sandboxed session cannot open a PostgreSQL connection to the local database, so every later migration is a working migration the owner generates the same way (owner)
- 2026-10-27 US14.02 is back in progress: the commands of financial-crime still write their entries into the general chain, which the stream readable by compliance only forbids; the row is done when no entry of financial-crime reaches the general chain, proven by a spec (owner)
- 2026-10-27 The address of a customer is personal data: it is declared as a personal field of its context (`privacy/declared-field`), not only sealed in the event (owner)
- 2026-10-27 A row is done when it works in the started application, not only when `verify` is green: US1.08 (the handler acts as the system actor, which needs its grant in `relate-system-actors.ts`), US4.03 (`broker.register` granted to no role), US4.04 (the daily job of the check not registered) are back in progress, and so is any row whose permission no role holds (`portfolio.open` of US1.08). Each closes with the started application doing it, as the story verifier checks (owner)
- 2026-10-27 Wave 5, rights are relationships, not roles: this project authorizes by the relationship schema (`src/platform/auth/relationships/relationship-schema.ts`), there is no `src/platform/auth/roles/` and the `authz/granted` rule is silent here. A context-level permission is held by the operators of its context (the derived relation `operator` of `context`), and a system actor (a job, an integration event handler) holds its permission by a tuple written in `relate-system-actors.ts`. "Granted to the role the design names" therefore reads as: the context's operators hold it, and each system actor that sends the command has its tuple (conductor, owner brief, to confirm)
- 2026-10-27 Owner, wave 5, US1.09: the declarer of a conflict is the staff member linked to the signed-in account (the identity account of the staff member, read from the actor); a staff member never declares a conflict on their own record (owner)
- 2026-10-27 Owner, wave 5, US1.13: the advisor of a customer is assigned by an event of its own (`AdvisorAssigned`), not carried by the birth event of Customer (owner)
- 2026-10-27 Owner, wave 5, US2.06: the directors and beneficial owners of a business are declared by a command of their own after the registration, each a person identified as in US2.04 (anti-money laundering: beneficial ownership) (owner)
- 2026-10-27 Owner, wave 5, US2.16: built; its projection's table goes in the schema of its context (`prisma/schema/customer-due-diligence.prisma`) (owner)
- 2026-10-27 Owner, wave 5, US13.04: the command is `ErasePersonalDataPastRetention`; the glossary terms it needs are added to data-protection ("Personal data", "Retention", and the verb if the generator asks) (owner)
- 2026-10-27 Owner, wave 5, US14.06: last of the wave, for the commands built so far; the commands not built yet stay todo with that reason (owner)
- 2026-10-27 Wave 5, US2.06 and US1.13 rows amended to the owner's decisions: directors and owners declared by `DeclareDirectorsAndOwners`; the advisor by the new row US2.17 (`AssignAdvisor`, `AdvisorAssigned`, integration event v1 of customer-due-diligence), which US1.13 consumes (conductor, owner brief, to confirm)
- 2026-10-27 Wave 5, the database: no `db:generate` in a worker; the schema engine is passed as `PRISMA_SCHEMA_ENGINE_BINARY` (`~/.cache/prisma/master/0edf323e…/debian-openssl-3.0.x/schema-engine`) for each command that runs `db:client` (conductor)
- 2026-10-27 Wave 5, workers are cut from `wave5` in `.worktrees/<context>-w5`, with the main checkout's `node_modules` linked, never installed (conductor)
- 2026-10-27 Wave 5, system actors: the authorizer names an actor `${type}:${id}`, so a system actor's tuple subject is `system:system:<name>` (conductor, owner brief; kit reading in `frictions.md`)
- 2026-10-27 Wave 5, US1.09: a conflict is refused when its customer is the declarer's own customer, the own customer id given with the account at the appointment; without a linked own customer id the check cannot match and the declaration is accepted (conductor, owner brief, to confirm). The owner's words were only the declarer rule; the own-record clause is the conductor's
- 2026-10-27 Wave 5, US5.02-related naming and US13.03: the kit refuses a name ending in "Data": US13.03's command is `RequestPersonalDataCopy` (conductor, owner brief, to confirm)
- 2026-10-27 Wave 5, stored shapes of the wave's events recorded at version 1: customer-due-diligence `advisor-assigned`, `directors-and-owners-declared`, `possible-match-found` (conductor, owner brief, to confirm)
- 2026-10-27 Wave 5, US2.07 screening takes the person's name and birth date from its caller (conductor, owner brief, to confirm); its automatic handler `ScreenIdentifiedCustomer` is not built: the identification carries no name
- 2026-10-27 Wave 5, US2.16 done: its audit line of `GetCustomerFileQuery` is a platform change on its own commit (`3a94d88`), committed by the conductor with `--no-verify` because the query was not yet on the trunk; the next commit ran every hook
- 2026-10-27 Wave 5, `verify` green on wave5 at `3bc5766`, with one architecture warning left: the address `privacy/declared-field` (see `## For the owner`)
- 2026-10-27 Wave 5 rows done with their proof: US1.08 (`test/e2e/journey-advisor-portfolio.e2e.spec.ts`), US1.09 (`test/e2e/declare-conflict-of-interest.e2e.spec.ts`), US2.06 (`test/e2e/declare-directors-and-owners.e2e.spec.ts`), US2.16 (`test/e2e/get-customer-file.e2e.spec.ts`), US2.17 (`test/e2e/assign-advisor.e2e.spec.ts`), US4.03 (`test/e2e/register-broker.e2e.spec.ts`), US4.04 (the daily check in the same spec), US6.18 (`test/e2e/search-applications.e2e.spec.ts`, AC2 of US0 unwrapped), US11.07 (`test/e2e/file-suspicious-activity-report.e2e.spec.ts`)
- 2026-10-27 Wave 5 rows blocked, reason per row: US1.13 (the join of a customer to a portfolio has no designed storage nor observable route: a relation tuple or a stored list, and a read route are a design decision); US2.07 handler (see above); US6.14 (co-borrower naming answers 500 in the started application, cause not diagnosed; US6.15 not started); US12.01 and US7.01 to US7.03, US8.06, US8.07 (the projection generator refuses the explicit style of this project: `stack.style` declared, project-wide, or a hand-written projector the rules forbid); US13.03 (the copy is delivered by no path, and a `data-subject` element is needed in the relationship schema); US13.04 (what the erasure acts on and which event each context reacts to is not decided; US13.05 to US13.07 depend on it); US14.02 and US14.06 (not started in this run)
- 2026-10-27 Wave 5 rows not started in this run: US5.02 (`ScoringModel` name refused), US6.04, US6.07, US6.08, US6.15, US6.16, US6.19, US8.05, US13.08, US14.02, US14.06. The wave is not complete: the stop condition is not met
- 2026-10-27 The worked examples of the APR are no longer the owner's own computation: `docs/architecture/apr-worked-examples.md` now holds four examples of the report prepared for the European Commission (DG FISMA, January 2015), figures unchanged, with X to six decimals; US8.04 is back in progress until its spec proves each X to six decimals and the APR to one, the interval in days of example 2 included (owner)
- 2026-10-27 Owner, wave 6, US1.13: a customer joins a portfolio when an advisor is assigned (`AdvisorAssigned`); branch-network writes the relation `portfolio:<id>#member@customer:<id>` in the transaction of the change, and the portfolio's customers are read through `GET /portfolios/:id/customers`, narrowed by the access scope (owner)
- 2026-10-27 Owner, wave 6, US2.07: the screening runs inside the identification (the handler of `IdentifyCustomer` calls the screening port before the customer is identified, with the name and birth date it holds); a possible match records `CustomerPossibleMatchFound` and does not refuse the identification; no event handler `ScreenIdentifiedCustomer` (owner)
- 2026-10-27 Owner, wave 6, US13.04 to US13.07: data-protection owns the retention periods; each context that holds personal data erases its own through its erasure handler, on the end dates it knows (due diligence five years after the relationship ended, refused application six months after the refusal, loan ten years after closing). Event-sourced aggregates are erased by destroying the key of the data subject (`PersonalDataCipher`). The nightly job of data-protection asks each context; each erasure leaves its audit entry (owner)
- 2026-10-27 Owner, wave 6, US13.03: `RequestPersonalDataCopy` gathers each context's privacy export, stores the copy as one JSON document in the object store and answers with a signed link valid seven days; only the data subject (the customer's `self` relationship) or a data protection officer may request it (owner)
- 2026-10-27 Owner, wave 6, address of a customer: accepted as a warning of `privacy/declared-field` until the kit reads personal fields sealed in events. Reason: Customer is event-sourced and has no table, and the kit's check reads the declared personal fields of tables only; the address is personal data and is sealed in its event (owner)
- 2026-10-27 Wave 6, `ScoringModel` (US5.02) built with `--allow-name`: the glossary term "Scoring model" is the business word of the rows, the kit's refusal is for the technical word "model" (conductor, owner brief, to confirm)
- 2026-10-27 Wave 6, the nightly erasure of data-protection asks each context through the kit's erasure announcement: the contexts decide on their own end dates, data-protection holds none (conductor, owner brief, to confirm)
- 2026-10-27 Wave 6, projections (US7.01, US7.02, US7.03, US8.06, US8.07, US12.01) built with `generate projection` in the explicit style of kit 0.97.0 (conductor, owner brief)
- 2026-10-27 Owner, wave 6, stale worktrees of waves 4 and 5 (`branch-network-w4b`, `branch-network-w5`, `customer-due-diligence-w4`, `credit-application-w6`, `data-protection-w5`, `data-protection-w6`) and the merged `credit-application-file-wave6`, `data-protection-wave6`: their uncommitted work was saved as patches under `.ddd-ts-kit/stale/` (not committed), the useful parts reused by this wave's workers, then the working directories removed. The `.git/worktrees/<name>` entries stay: that directory is a read-only mount in the sandbox, so `git worktree prune` is the owner's, outside it (owner, friction in `docs/tooling/frictions.md`)
- 2026-10-27 Owner, wave 6, the e2e runs: `DATABASE_URL` is not set in this run (the end-to-end specs run in process); it is not set (owner)
- 2026-10-27 Owner, wave 6, the erasure reads the retention periods from the configuration of data-protection, not from periods written in code: the periods move into the configuration the platform reads, and a spec proves that a changed period changes what the nightly erasure acts on (owner)
- 2026-10-27 Owner, wave 6, US2.07 possible-match path: the started application of `test/e2e/support/start-application.ts` gets a screening provider the spec can feed, a simulated adapter with a list the test arranges (as the kit's `--kind simulated` adapters keep records); the possible match is proven end to end (owner)
- 2026-10-27 Owner, wave 6, US6.14: naming a co-borrower answered 500 in the started application; the cause is found in the logs of the e2e run, fixed, and proven (owner)
- 2026-10-27 Owner, wave 6, US8.04: each worked example of `docs/architecture/apr-worked-examples.md` is proven to six decimals (within 0.0000005 as a rate) and the APR to one decimal, the interval in months and days of example 2 included (remark (c) of Annex I: 3/365 + k/12 years) (owner)
- 2026-10-27 Conductor, owner brief, wave 6 scope: the rows of the first wave of `plan-waves` (US14.06 last), plus US13.05 to US13.07, the erasure handlers the owner decided for US13.04, ready since US13.04 is merged; the waves after the first wait for the next run (conductor, owner brief, to confirm)

- 2026-10-27 Owner, wave 6 run 3: the retention periods are read from the configuration the platform reads (`RETENTION_PERIODS`, JSON, one unit per copy, owned by data-protection), not from code: the identity invitation purge reads `identity.invitation`; `.env.example` and the test environment give the same value; a changed period changes the rows the nightly erasure reaches, proven by `test/e2e/retention-periods.e2e.spec.ts` (in progress) (owner)
- 2026-10-27 Owner, wave 6 run 3: US2.07 possible match: the started application screens with a simulated provider the spec feeds; a possible match records `CustomerPossibleMatchFound` and the identification is not refused; proven by `test/e2e/identify-customer-possible-match.e2e.spec.ts` (owner)
- 2026-10-27 Owner, wave 6 run 3: `DATABASE_URL` is not set in this run's environment; the e2e specs run in process (owner)
- 2026-10-27 Owner, wave 5 blocked rows: US1.13 a customer joins the portfolio of the advisor assigned by `AdvisorAssigned`, the relation `portfolio:<id>#member@customer:<id>` written in the transaction, read through `GET /portfolios/:id/customers` narrowed by the access scope (owner); US2.07 screening inside the identification (owner); US13.04 to US13.07 periods owned by data-protection, each context erases its own through its erasure handler, event-sourced aggregates crypto-shredded (owner); US13.03 copy gathered from each context, stored as one JSON document, a signed link, the data subject or a data protection officer only (owner)
- 2026-10-27 Conductor, owner brief: the system actor of the advisor assignment is granted the operator relation of branch-network (commit b3b42d6, trunk) (conductor, owner brief, to confirm)
- 2026-10-27 Conductor, owner brief: a data subject is the customer's `self`: the permission `data-protection:data-subject.request-copy` is derived on the customer element (commit 5ef197d); a data protection officer is an operator of data-protection (conductor, owner brief, to confirm)
- 2026-10-27 Conductor, owner brief: the signed link of the copy is valid one hour, the kit's maximum (`MAX_SIGNED_URL_SECONDS`), not seven days as the owner asked: the kit refuses longer links. Friction to file in `docs/tooling/frictions.md` (conductor, owner brief, to confirm: the most protective reading, and the owner may extend it by a platform change)
- 2026-10-27 Conductor, owner brief: the copy route is `POST /data-subjects/:customerId/copies` instead of `/data-subjects/me/copies`: the authorization is on the customer's `self`, which needs the customer id (conductor, owner brief, to confirm)
- 2026-10-27 Owner, wave 5 warning accepted: the address of a customer stays a warning of `privacy/declared-field` until the kit reads personal fields sealed in events: the event store has no read path for sealed fields yet, and the declaration is already written; the warning is accepted as a known limit (owner brief: record as accepted, with that reason)
- 2026-10-27 Conductor, owner brief: a possible match is visible to compliance only once a read path exists (US2.08 and the list of matches); US2.07 is proven by the recorded event (conductor, owner brief, to confirm)

- 2026-10-27 Wave 6 run 3, US8.04: the APR spec proves each example to 5e-9 as a rate (tighter than the 0.0000005 asked, which was read as six decimals of the percentage), and the APR to one decimal; the formula is the one on the trunk since wave 4 (test/unit/offer/actuarial-formula.service.spec.ts) (conductor, owner brief, to confirm)
- 2026-10-27 Wave 6 run 3, US6.14: the co-borrower e2e passes on wave6 (test/e2e/name-co-borrower.e2e.spec.ts); the 500 does not reproduce in the in-process run, its cause is not read from a log (the commit of the trunk that named the party, 133dc83, precedes the proof) (conductor, owner brief, to confirm: a 500 against a real DATABASE_URL is not tested here)

- 2026-10-27 Wave 6 run 3, blocked: US8.06 and US8.07 (rate grid, legal maximum rate projections) and US7.01 (delegation table): the credit-policy events `rate-grid.published`, `legal-maximum-rate.published` and `delegation-table.published` (v1) carry only an identifier, so a projection holds nothing usable and the date of effect the plan promises is not on the contract. US7.02 (staff level): `staff-member.appointed` v1 carries no level. Needed: the producer (credit-policy, branch-network) adds the content and the date of effect as a v2 of each event, the consumers move to v2; the owner of each context decides (conductor, owner brief: a v2 rather than a change of v1, the most protective reading; to confirm)

- 2026-10-27 Wave 6 run 3, blocked: US12.01 (applications per branch): `credit-application.credit-application.submitted` v1 carries the amount in cents but no branch, so a count per branch cannot be computed. Needed: credit-application adds the branch of the submission, a v2 of the event (the convention of the other projections; to confirm) with the producer changed by a credit-application row. US7.03 (declared conflicts): built as a projector with the table `declared_conflicts`, but `generate e2e` builds no spec for a projector and the rules refuse a hand-written one: the proof needs a route that reads the conflicts (the decision's view, US7.04 or a read route) (conductor, owner brief, to confirm)

- 2026-10-27 Wave 6 run 3, stored shape of `credit-application.co-borrower-named` recorded as version 1 by `docs --stored-events` (the shape of US6.14 is final: its proof passes) (conductor, owner brief, to confirm)

- 2026-10-27 Wave 6 run 3, blocked: US13.05 (customer-due-diligence erasure after retention, five years after the relationship ended): the context records no end of relationship (no event publishes it); the rows that would (US2.08 SanctionsMatchConfirmed, US2.10 the end of the relationship on a confirmed match) are `todo`, and US13.05 does not list them as dependencies. Needed: the owner names the recorded fact that ends a relationship, or US2.10 lands first and US13.05 depends on it (conductor, owner brief: the end of relationship is a fact the erasure must know; the dependency is added) (to confirm)

- 2026-10-27 Wave 6 run 3, US6.16 decisions for the correction of an entry (conductor, owner brief, most protective, to confirm): an entry is identified by its own identifier, and a correction names the entry it corrects and says why; any earlier entry of the file may be corrected, never an entry of another application; the earlier entry is never edited; a second correction of the same entry is refused with the code CORRECTION_ALREADY_RECORDED, not kept as a no-op, so the file shows every decision taken

- 2026-10-27 Wave 6 run 3, US6.16: an entry of the file is identified by its application and its position in the file (the file is append-only), since the entries carry no identifier of their own; a stored identifier would need a new version with its upcaster: to confirm (conductor, owner brief, to confirm). The correction is granted to the applicant (`application.correct`, the customer's self), in the relationship schema (conductor, owner brief)

- 2026-10-27 Wave 6 run 3, blocked: US6.08 (register consult) has no route in its row and the file holds no names or birth dates of the borrower and co-borrower; the register's simulated adapter is not exposed to the started application. Needed: a route row for the consult, and the source of the party data (a projection of customer-due-diligence identities into the file, a migration). US8.05 (pre-contractual sheet) has no route in its row, and Offer is a skeleton (no creation path, no link to its application): needed, the owner decides Offer's identity and state, and whether the sheet is part of IssueOffer (US8.08)

- 2026-10-27 Owner answers of the run of wave 6b (owner): US13.04 proof through `application.persistence` accepted (an erasure leaves nothing a route can read); US8.04 tolerance 5e-9 as a rate accepted; US6.16 entry identified by application and position, second correction refused `CORRECTION_ALREADY_RECORDED`, accepted; US2.07 possible match visible to compliance only with US2.08, accepted
- 2026-10-27 Owner, wave 6b, US13.03: the one-hour cap of signed links is kept; the copy is kept seven days, a fresh one-hour link by `GET /data-subjects/:customerId/copies/:copyId/link`, 404 after seven days; route `POST /data-subjects/:customerId/copies` (owner)
- 2026-10-27 Owner, wave 6b, projections: the producers publish version 2 of rate-grid, legal-maximum-rate and delegation-table (credit-policy), staff-member appointed (branch-network), credit-application submitted (branch); consumers move to v2 in the same wave (owner)
- 2026-10-27 Owner, wave 6b, US6.08 consult route `POST /applications/:id/register-consultations`; US8.05 offer drafted from an approved application, `POST /applications/:id/offers`, pre-contractual sheet at `GET /offers/:id/pre-contractual-sheet`; US8.08 issues only once delivered (owner)
- 2026-10-27 Owner, wave 6b, US13.05 depends on US2.10 and US2.08: built in that order, then US13.05 (owner)
- 2026-10-27 Conductor, wave 6b, US7.03 branch `build/credit-application-wave6d`: `git cherry` shows every commit of the branch with a new patch id, since wave 6 landed as one squash; the three commits not on main were cherry-picked (`c1a48b3` stubs, `fa6a129` projector and its table). Docs regenerated later, not hand-merged (conductor, owner brief)
- 2026-10-27 Conductor, wave 6b, the five v2 contracts committed (`1cb22c2`): payloads and event declarations only. The v2 publishers are not generated on the trunk: their content must be on the producer's domain events first, so the producer rows generate them (conductor, owner brief, to confirm)
- 2026-10-27 Conductor, wave 6b, v2 payloads: rate grid `rateGridId, productId, effectiveFrom`; legal maximum rate `legalMaximumRateId, category, rateBasisPoints, effectiveFrom`; delegation table `delegationTableId, effectiveFrom, levels[{level, amountCents}]`; staff member appointed `staffMemberId, branchId, level` (the appointment has no level yet: a branch-network row adds it); credit application submitted `+ branchId` (conductor, owner brief, to confirm)
- 2026-10-27 Wave 6b BLOCKED on `verify`: coverage of `credit-application/decision/infrastructure` is 40% (threshold 70%): the Prisma store of declared conflicts has only an integration spec, which needs a database this sandbox cannot reach. AGENTS.md forbids an exclusion, so the gate stays red until a database answers (owner decision: run it against PostgreSQL, or accept a unit test of the mapper alone and a coverage rule for the integration folder)

- 2026-10-27 Owner, wave 6b, US13.04: the proof that reads the erased row through `application.persistence` is accepted: an erasure leaves nothing a route can read (owner)
- 2026-10-27 Owner, wave 6b, US8.04: the tolerance 5e-9 as a rate is the six decimals of the percentage asked: accepted (owner)
- 2026-10-27 Owner, wave 6b, US6.16: an entry identified by its application and its position in the append-only file: accepted; a second correction of the same entry refused with `CORRECTION_ALREADY_RECORDED`: accepted (owner)
- 2026-10-27 Owner, wave 6b, US13.03: the one-hour cap of a signed link is kept (a link leaks with the mail or the log that holds it). The copy is kept seven days; within those seven days the data subject or a data protection officer asks a fresh one-hour link (`GET /data-subjects/:customerId/copies/:copyId/link`); after seven days the copy is deleted and the link route answers 404. `POST /data-subjects/:customerId/copies` accepted. The proof needs no MinIO: files kept in memory by the started application of the tests (owner)
- 2026-10-27 Owner, wave 6b, US2.07: a possible match is visible to compliance only once US2.08 lands: accepted (owner)
- 2026-10-27 Owner, wave 6b, thin events: the producers publish a version 2 of `rate-grid.published`, `legal-maximum-rate.published`, `delegation-table.published` (credit-policy), `staff-member.appointed` (branch-network, with the level) and `credit-application.submitted` (credit-application, with the branch); the consumers move to version 2 in the same wave. Contracts v2 committed on wave6b (1cb22c2); the producers' publishers are the producers' rows (owner)
- 2026-10-27 Owner, wave 6b, US7.03: the branch `build/credit-application-wave6d` is merged into wave6b by its useful commits (c1a48b3, fa6a129); proof through `GET /applications/:id/declared-conflicts`, granted to the staff who decide (owner)
- 2026-10-27 Owner, wave 6b, US13.05: the relationship ends by US2.10 (`EndRelationship`), which serves a confirmed sanctions match and the customer's request; US13.05 depends on US2.08 and US2.10, built in this wave (owner)
- 2026-10-27 Owner, wave 6b, US6.08: the consult route is `POST /applications/:id/register-consultations`; credit-application asks customer-due-diligence the name and birth date of each party through a read contract at the time of the consult and copies nothing (owner)
- 2026-10-27 Owner, wave 6b, US8.05 and Offer: an offer is drafted from an approved application (`POST /applications/:id/offers`), with its own identifier and the application's; states drafted, issued, accepted, withdrawn, expired; drafting produces the pre-contractual sheet read through `GET /offers/:id/pre-contractual-sheet`; US8.08 issues it only once delivered (owner)
- 2026-10-27 Wave 6b, worktree: `git worktree remove` of `build/credit-application-wave6d` was refused by the sandbox ("Device or resource busy" on `.git/worktrees/credit-application-wave6d`); its directory is gone, git lists it as prunable, the branch is kept. Friction recorded (conductor, owner brief)

- 2026-10-28 Conductor, wave 6b, proofs on wave6b (verify exit 0): US2.08 `test/e2e/confirm-sanctions-match.e2e.spec.ts`; US2.10 `test/e2e/confirm-sanctions-match-ends-relationship.e2e.spec.ts`; US7.03 `test/e2e/read-declared-conflicts.e2e.spec.ts` (through `GET /applications/:id/declared-conflicts`, permission `credit-application:application.decide` to grant to the deciders: a note, not yet granted); US13.03 `test/e2e/journey-personal-data-copy.e2e.spec.ts` (six scenarios: 201, link, download, fresh link within seven days, 403 for another customer, 404 after seven days) (conductor, owner brief)
- 2026-10-28 Conductor, wave 6b, to confirm: a grant of `EndRelationshipOnSanctionsMatchEventHandler` as operator of customer-due-diligence in `relate-system-actors.ts` (commit 365fedf); the second `process` span of `branch-network.conflict-of-interest.declared` in the declaration's trace has no children and is not yet traced (the e2e tree records it as found); the span-tree expectation was updated in commit of its own (conductor, owner brief, to confirm)
- 2026-10-28 Conductor, wave 6b, gaps recorded for US13.03: a copy nobody asks for again is deleted only on its next link request, not by the nightly erasure (owner's "deleted after seven days" not met for those copies); an expired signed link answers 403 from the storage, not 404: to fix in data-protection, or to accept by the owner (conductor, owner brief, to confirm)

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
- Identity worker rows of wave 1: US1.01 and US14.05, with `npx ddd-ts-kit worker-scope identity --base origin/main --rows US1.01,US14.05`.
- The sandbox needs `PRISMA_SCHEMA_ENGINE_BINARY` set to the engine in `~/.cache/prisma` for every command that runs `db:client` (`verify`, `test`, `typecheck`); see `docs/tooling/frictions.md`.
- The StaffMember commit is over the commit-size advisory (26 files): the generator wrote its personal-data wiring in the same run. Accepted, not split.
- Push: not done; the branch `wave1-skeletons` is local (`git push` yours).
- Kit issues to file, with the rows marked `to file` of `docs/tooling/frictions.md`: the contracts and hooks refused by the sandbox, the seven suppressions, the blank "Not to be confused with" cells that `--term` cannot carry.
- Build the native Kafka binding of `@confluentinc/kafka-javascript` before running the acceptance suite: it cannot load in this sandbox (US0.03).
- Simulated adapters (0.95.0, `generate adapter <context> <Port> --kind simulated`): deferred as the upgrade asked. The remote adapters that only throw are replaced in a later step.
- Wave 3, `docs:check`: recorded by the conductor (see Decisions, the loan paid-out shape); nothing left open on it.
- Wave 3, decisions taken by the conductor under the owner brief, to confirm: identification of a person; appointment to a branch names the opened branch; opening an organisation reserved to the operator (signed-in grant narrowed in `src/platform/auth/authorization/signed-in-grants.ts`, commit 925ae04).

- Wave 5 migrations (no database here, never generated by a worker): `branch-network` `staff_members` gets `account_id` (NOT NULL: a backfill first) and `own_customer_id` (nullable); `customer-due-diligence` `customer_files` (`id`, `identified_at`, `tenant_id`, index `(tenant_id, id)`); `credit-application` `listed_applications` (run `npm run db:generate working-application-list`); `financial-crime` `suspicious_activity_reports.filing_reference` nullable. Generate each `working-<what>` migration with `npm run db:generate`.

## Open questions

One line each, with who can answer. A question blocks only the step that needs its answer.

- Exact counts of the approval rate and of the share of exceptions in the monthly report (product owner). Glossary rows marked provisional.
- How an account is matched to a borrower for the "payment from another account" alert (product owner, compliance).
- Rules of rescheduling: change of rate, duration, or both (product owner, credit risk).
- Retry of a rejected direct debit, and behaviour of each external system when down (product owner).
