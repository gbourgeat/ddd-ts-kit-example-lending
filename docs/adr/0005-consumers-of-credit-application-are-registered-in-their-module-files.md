# ADR-0005: The consumers of credit-application are registered in their module files, which `events/consumer-idempotent` does not read

- Status: superseded by ddd-ts-kit 0.99.0 (the rule `events/consumer-idempotent` reads every module file of a context; the suppressions are removed)
- Date: 2026-10-28
- Deviates from: `events/consumer-idempotent`

## Context

ddd-ts-kit 0.98.0 gives each module of the model its module file (`file/file.module.ts`, `assessment/assessment.module.ts`, `offer/offer.module.ts`, `decision/decision.module.ts`), composed by `credit-application.module.ts`. Each registers the `consume(...)` of the integration handlers of its module, each with its literal consumer name and the `processed` store. The rule `events/consumer-idempotent` looks for that registration in the first file of layer `module` of the context (`project.files.find(...)`), which is now `assessment/assessment.module.ts`, so it reports the seven handlers of the other modules as unregistered although they are.

## Decision

Keep each registration in the module file of its module, and record the line suppression `events/consumer-idempotent` above the seven handler classes, each pointing to this record.

## Consequences

Seven suppressions appear in the count of `check`. The consumer names stay unique literals. A new integration handler of the context gets the same line until the kit reads every module file.

## Alternatives considered

Registering all the consumers in `assessment.module.ts` (rejected: the file of a module would wire the events of the three others); registering them in `credit-application.module.ts` (rejected: the rule does not read it either, and ADR-0003, which kept them there, no longer applies).

## Scope

The seven `*.integration-handler.ts` of `src/contexts/credit-application/{file,offer,decision}/application/integration/handlers/`.

## Removal condition

The kit reads the module files of a module of the model for this rule (friction filed in `docs/tooling/frictions.md`); the suppressions go at the next upgrade that does.
