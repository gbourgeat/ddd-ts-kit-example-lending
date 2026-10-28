# ADR-0009: The consumers of servicing are registered in their module files, which `events/consumer-idempotent` does not read

- Status: superseded by ddd-ts-kit 0.99.0 (the rule `events/consumer-idempotent` reads every module file of a context; the suppressions are removed)
- Date: 2026-10-28
- Deviates from: `events/consumer-idempotent`

## Context

servicing has a module file for its module `arrears` (`arrears/arrears.module.ts`), composed by `servicing.module.ts`, where the `consume(...)` of its integration handlers (record the payout, reschedule on decision, repay a withdrawn loan) are registered with their literal consumer name and the `processed` store. The rule `events/consumer-idempotent` looks for that registration in the first file of layer `module` of the context, which is now `arrears/arrears.module.ts`, so it reports the handlers registered in `servicing.module.ts` as unregistered although they are.

## Decision

Keep each registration where it is, and record the line suppression `events/consumer-idempotent` above the three handler classes, each pointing to this record.

## Consequences

Three suppressions appear in the count of `check`. The consumer names stay unique literals. A new integration handler of the context gets the same line until the kit reads every module file.

## Alternatives considered

Registering the consumers in `arrears.module.ts` (rejected: the file of a module would wire the events of the ledger); moving them to a module file of the ledger (rejected for this run: the ledger has no module file yet).

## Scope

The three `*.integration-handler.ts` of `src/contexts/servicing/ledger/application/integration/handlers/`.

## Removal condition

The kit reads the module files of a module of the model for this rule (friction filed in `docs/tooling/frictions.md`); the suppressions go at the next upgrade that does.
