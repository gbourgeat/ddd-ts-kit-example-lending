# ADR-0010: The notices and the read model rows of the servicing arrears live in their own application directories

- Status: accepted (conductor, owner brief, to confirm)
- Date: 2026-10-28
- Deviates from: `contexts.servicing.extraDirectories.application/notices`, `contexts.servicing.extraDirectories.application/read-model`

## Context

The arrears module of servicing words the notice it sends to a borrower at each stage (a pure function of the stage) and keeps the portfolio at risk in a read model fed by the event store: a row, its criteria and the pure summary of the rows. They are plain data and pure functions, neither a port, a command, a query nor a projection of the canonical tree.

## Decision

Put the wording of the notices in `arrears/application/notices/` and the row, the criteria and the summary of the portfolio at risk in `arrears/application/read-model/`, both declared as extra directories of the context (as reporting does for its read model rows, ADR-0007).

## Consequences

The ports stay about the capability, and the pure functions are named by what they hold. The directories must not take a port or a handler.

## Alternatives considered

Placing them in the files of the port or the handler (rejected: one exported function or type per file).

## Scope

Only `src/contexts/servicing/arrears/application/notices/` and `src/contexts/servicing/arrears/application/read-model/`, and the rule `tree/closed` for these directories.

## Removal condition

Removed when the kit's canonical tree has a place for them; the conductor checks it at each part.
