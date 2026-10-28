# ADR-0006: The types and rules of the servicing ledger that are not value objects live in domain values

- Status: accepted
- Date: 2026-10-28
- Deviates from: `contexts.servicing.extraDirectories.domain/values`

## Context

The ledger of a loan keeps the union of its events, its state and small pure rules (the months remaining of a schedule) that the aggregate and its services share. They are plain data and pure functions, not value objects with invariants of their own, and the aggregate reached the 350-line limit.

## Decision

Put them in `ledger/domain/values/`, declared as an extra directory of the context (as credit-application does for its file module, ADR-0004).

## Consequences

The aggregate stays under 350 lines. The directory must not become a place for value objects: a type with an invariant becomes a class in `value-objects/`.

## Alternatives considered

Making each a value object class (rejected: no invariant of their own); keeping them in the aggregate file (rejected: the file limit).

## Scope

Only `src/contexts/servicing/ledger/domain/values/`, and the rule `tree/closed` for that directory.

## Removal condition

Removed when each type of the directory is a value object class or lives with its single user; the conductor checks it at each part.
