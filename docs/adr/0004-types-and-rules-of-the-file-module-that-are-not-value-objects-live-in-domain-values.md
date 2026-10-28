# ADR-0004: Types and rules of the file module that are not value objects live in domain values

- Status: accepted
- Date: 2026-10-28
- Deviates from: `contexts.credit-application.extraDirectories.domain/values`

## Context

Types and rules of the file module that are not value objects live in domain values

The file module of credit-application keeps small pure types and rules that its aggregate and its domain services share (the request of an application, the limits of a product, a finding, the input of a decision, a conclusion of a review). They are plain data and one pure function, not value objects with their own invariants; the project declares `values: classes`, so the canonical directories do not take them.

## Decision

Put these types and the pure rule of the product limits in `file/domain/values/`, declared as an extra directory of the context.

## Consequences

The aggregate stays under 350 lines and the decisions move to domain services that read these types. The directory must not become a place for value objects: a type with an invariant becomes a value object class in `value-objects/`.

## Alternatives considered

Making each a value object class (rejected: the types carry no invariant of their own, the classes would only wrap fields); placing them in the aggregate file (rejected: the file limit).

## Scope

Only `src/contexts/credit-application/file/domain/values/`, and the rule `tree/closed` for that directory.

## Removal condition

Removed when each type of the directory is a value object class or lives with its single user; the conductor checks it at each part.
