# ADR-0007: The read model rows of reporting live in application read-model

- Status: accepted
- Date: 2026-10-28
- Deviates from: `contexts.reporting.extraDirectories.application/read-model`

## Context

Reporting keeps counts per branch fed by projections. The row of a count and its search criteria are plain types shared by the port, the projection and the reader; they are neither a port nor a command nor a query.

## Decision

Put them in `application/read-model/`, declared as an extra directory of the context.

## Consequences

The port file stays about the capability, and the row types are named by the read model. The directory holds types only.

## Alternatives considered

Placing the types in the port files (rejected: one exported type per file, and the port then imports its own row).

## Scope

Only `src/contexts/reporting/application/read-model/`, and the rule `tree/closed` for that directory.

## Removal condition

Removed when the kit's canonical tree has a place for the row of a read model; the conductor checks it at each part.
