# US0 design review

Read before the code of the story. One section per row not done, named after its id.

## #US0.01

Credit application, event-sourced. `CreditApplication` in the `file` module, born `Submitted`. Its state
is only what the submission decides: the applicant, the requested amount (a `Money` of US0.06) and the
duration in months. Business refusals at birth are named after the rule they keep. Event-sourced with
its repository over the event store (`persistence.eventSourcing`). Depends on nothing; the `Money`
value object is added by US0.06 before the submit command uses it.

## #US0.02

Relationship schema: bank, branch, portfolio, customer, application, loan. Edited in
`src/platform/auth/relationships/relationship-schema.ts`, the derived relations written as the schema
of the owner brief (bank > branch > portfolio > customer > application > loan). One spec per derived
relation. No generator: a platform file, the conductor's edit.

## #US0.03

Tuple store kept in the transaction of the change. `create-tuple-store.ts`, held to
`create-tuple-store.contract.spec.ts`: a tuple written in a transaction that rolls back is not visible.
Depends on US0.02.

## #US0.06

Money in whole cents. `value-object shared-kernel Money`, an integer count of cents with its currency,
no floating point. The kernel may refuse the generator: a friction, workaround recorded.

## #US0.04

Submit an application. `SubmitApplication` command with `application.submit`, the handler opens the
file through `CreditApplication`, the route `POST /applications` returns 201 with a `Location`, and one
end-to-end scenario. The actor must be a customer of the bank (decision in the story file); the
relationship schema of US0.02 decides it. Refusal by the rights decision, not by a role.

## #US0.05

Application submitted, published. `integration-event credit-application CreditApplication Submitted
--version 1`: the fact is published through the outbox in the transaction of the submission
(`events/outbox-required`), and the consumer side is idempotent when it arrives. Contract row: the
conductor writes it after US0.04.
