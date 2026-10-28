# ADR-0008: The handler registrations of the servicing modules that exceed the module file live in composition

- Status: accepted
- Date: 2026-10-28
- Deviates from: `contexts.servicing.extraDirectories.composition`

## Context

The module file of servicing registers the handlers, reactions, jobs, authorizations and routes of the three modules of its model (ledger, instalments, arrears). With the commands of the loan ledger, of the instalments and of the arrears it passed the 350-line limit of a file, and its markers are written by the generators.

## Decision

The registration of the handlers of the ledger and of the instalments moves to `composition/register-loan-handlers.module.ts`, called by the module file between its markers, as customer-due-diligence does for its nightly jobs (ADR-0003). The adapters of the context are still bound where the module file calls it, and the `consume(...)` of the integration handlers stays in the module file (ADR-0005).

## Consequences

The module file stays under the limit. The directory holds registration functions only.

## Alternatives considered

One module file per module of the model, as credit-application has (rejected for this run: the generators of servicing write all their lines in the one module file, and moving the markers is a restructuring of the context for its own slice); raising the limit (rejected: the limit is not raised).

## Scope

Only `src/contexts/servicing/composition/`, and the rule `tree/closed` for that directory.

## Removal condition

Removed when the registrations live in one module file per module of the model; the conductor checks it at each part.
