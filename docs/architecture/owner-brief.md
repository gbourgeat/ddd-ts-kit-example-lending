# Owner brief for unattended sessions

The owner is not at the keyboard during agent sessions of this project. Every session reads this
page before it asks anything, and decides by it.

## Standing answers

- **Closing question of a step**: yes, when the check the step names passes (the artefact exists,
  covers every need of `needs.md`, the commands of the step are green). Record it in
  `docs/architecture/plan.md` as "decided by the conductor, owner brief".
- **A choice the skill puts to the owner**: take the recommended option, record it under
  `## Decisions` with "conductor, owner brief", and go on. Never stop to wait.
- **A business rule nobody stated**: take the rule a regulated European retail bank would apply,
  the most protective of the customer when in doubt, record it under `## Decisions` with
  "conductor, owner brief, to confirm", and go on.
- **Going on**: the owner asks to go on through every step this session was launched for.
- **Skipping a step**: never.

## Imposed choices

- The stack is imposed (it covers what the other examples of ddd-ts-kit do not):

  ```bash
  npx -y ddd-ts-kit@0.98.0 init --http nest --di nest --routes nest --validation class-validator \
    --orm prisma --database postgres --events outbox --broker kafka --cache redis --queue redis \
    --storage s3 --authn keycloak --authz rebac --audit on --event-sourcing on --privacy on \
    --tenancy shared-table --errors sentry --logger winston --docs-ui scalar --ci github \
    --tests jest --sdk --agent-profile regulated --package-manager npm
  ```

  Always `ddd-ts-kit@0.98.0`, never `@latest`: this project proves that published version.
- Banks are the tenants. Identity (accounts, organisations as tenants, members, invitations,
  delegations) is the `identity` preset of the kit.
- `CreditApplication` (the application file) and `Loan` (the ledger) are event-sourced, and so is
  the due diligence of a customer.
- `servicing` runs as a service of its own (`generate service servicing`) and collaborates only by
  integration events.
- Authorization is relationship-based over bank > branch > portfolio > customer > application >
  loan, with the risk department, the credit committee and compliance as groups of the bank, the
  broker related to the applications they brought, the declared conflicts of interest excluding
  a member of staff, and suspicious activity reports restricted to compliance. The delegation
  limits are attributes of the decider combined with the relationships (a policy on the
  element), never roles alone.
- Outside systems are ports with a fake adapter and an anti-corruption layer: screening,
  account information, the register of repayment incidents, the payment provider, the financial
  intelligence unit, the electronic signature, mail and text messages. No real provider.
- The maximum legal rates, the rate grids, the delegation limits and the residual income minimums
  are data of the bank with dates of effect, never constants in the code.
- Amounts are integers of cents in a money value object; rates are decimals with their precision
  stated; no floating point in the ledger.

## When something of the kit is wrong

A generated file that is wrong, a command that fails on a project nothing was hand-written in,
a skill that contradicts the CLI: do not patch around it in silence. Write it in
`docs/tooling/frictions.md` (one row: date, step, what happened, the command and its output,
the workaround if one was needed to go on), then go on if a workaround exists.

## What the owner checks at the close

The slices must lead there; a line that cannot be met is a friction of the kit, never a line
dropped.

1. `ddd-ts-kit check` reports zero finding and `npm run verify` is green.
2. Relationships: the schema bank > branch > portfolio > customer > application > loan with derived
   relations (a branch manager sees the branch, an advisor the customers of their portfolio, a
   co-borrower their application, a broker only what they brought, a member of staff with a
   declared conflict excluded), one spec per derived relation, the search of applications narrowed
   by the access scope, and the explanation of a refusal for a broker and for a conflicted advisor.
3. The delegation: a spec per level of the table and per exception, the four eyes (the preparer
   never decides), a decision above the decider's limit refused with the level it needs.
4. `CreditApplication`, `Loan` and the due diligence event-sourced; one stored event at version 2
   with its upcaster; a snapshot policy on `Loan` proven by `expectSnapshotEquivalence`; the
   balance of a loan as of a past date; one projection fed by the event store (the portfolio at
   risk) rebuilt from zero in a spec; a decision shown with exactly what the decider saw.
5. The annual percentage rate computed by the actuarial formula, proven against worked examples
   of the directive, and an offer at or above the legal maximum refused with the maximum in force
   that day.
6. The withdrawal period and the no-payout-before-the-8th-day rule, with a fake clock; early
   repayment fees; a rescheduling.
7. Arrears buckets, the declaration to the register after two unpaid instalments and its
   withdrawal, the default at 90 days, each by a scheduled job per bank.
8. The suspicious activity report invisible outside compliance: a spec for each way it could leak
   (a screen, an error, a search, the audit search).
9. `servicing` runs as its own service, its boot test passes, it collects instalments while the
   API is stopped.
10. Every command audited; every read of a customer file by staff audited; the search route of the
    audit returns them.
11. The privacy register and the impact assessment of the scoring filled; export of a customer;
    erasure after retention, the personal data of the event-sourced aggregates sealed and shredded.
12. Documents of an application uploaded to the object store and read back.
13. The monthly report and the defaults list as CSV; the OpenAPI, AsyncAPI and SDK current.
14. One story built with `/ddd-ts-kit:story`, its acceptance locked before its code, verified at its
    close.
15. A recorded real run with `docker compose` (Keycloak, Kafka, Redis, PostgreSQL, MinIO), a demo
    script from an application to a payout and a first instalment, one trace crossing the API and
    `servicing`.
16. A traceability matrix from each need of `needs.md` to its stories and the specs that prove it
    (`docs/compliance/traceability.md`), as a validated system in a regulated bank keeps one.
