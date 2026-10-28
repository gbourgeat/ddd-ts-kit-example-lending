# ADR-0003: Composition files of a context with modules

- Status: accepted (owner, wave 6f)
- Date: 2026-10-28
- Deviates from: `contexts.credit-application.extraDirectories.composition`

## Context

The context module reached the 350-line limit; the wiring of a module of the model moves to composition/register-<module>-reactions.module.ts, called by the context module (owner, wave 6f, no raise of the limit)

The context module of credit-application wires four modules of the model (file, assessment, decision, offer) and reached the 350-line limit of the kit. The tree of a context is closed: nothing sits at its root but the module file, and nothing outside a role directory. The owner refused a raise of the limit.

## Decision

The projection wiring of a module moves to `composition/register-<module>-reactions.module.ts`, a directory declared in `extraDirectories`; the context module calls it. The `consume(...)` of an integration handler stays in the context module, where `events/consumer-idempotent` looks for it.

## Consequences

The context module stays under the limit and the wiring of a module is read in one file. The composition files are the second place of the context that binds adapters, so a reader looks in two places; `composition/only-in-module` accepts them because of the `.module.ts` suffix.

## Alternatives considered

Raise the limit (refused by the owner); a file at the root of the context (refused by `tree/closed`); a file in a role directory (none fits: wiring is not infrastructure).

## Scope

Only the context credit-application and the files named `register-*-reactions.module.ts` in `src/contexts/credit-application/composition/`; the integration handlers' consumers are not moved.

## Removal condition

The kit gives a place for the composition files of a context with modules (friction filed in `docs/tooling/frictions.md`); the owner checks at each kit upgrade.
