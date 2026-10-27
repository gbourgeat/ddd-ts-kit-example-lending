# Brokerage

## Purpose

Brokers, their registration with the intermediaries register, and whether that registration is valid on a given day. A broker is an outside intermediary, not staff.

## Classification

supporting

Brokers bring applications, and the check of their registration is a supporting rule, not the credit decision.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Broker | An outside intermediary who brings applications; not a staff member | Advisor |
| Registration number | The number of a broker on the intermediaries register | Repayment incident register |
| Intermediaries register | The register of brokers | Repayment incident register (credit-application, servicing) |
| Registration valid on the day | The broker's registration is valid on the day the application is brought | Registration lapsed |
| Registration lapsed | The registration is no longer valid; the broker can no longer bring applications | Refusal |
| Bring | A broker's act of submitting an application to the bank | Assignment |
| Registered | a broker is entered on the intermediaries register with its registration number |  |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `Broker`
<!-- /ddd-ts-kit:aggregates -->

## Published events

<!-- ddd-ts-kit:events -->
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
No personal data declared.
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
No permission declared.
<!-- /ddd-ts-kit:permissions -->

## Scheduled jobs

<!-- ddd-ts-kit:jobs -->
No scheduled job.
<!-- /ddd-ts-kit:jobs -->

## Background jobs

<!-- ddd-ts-kit:background-jobs -->
No background job.
<!-- /ddd-ts-kit:background-jobs -->

## State machines

<!-- ddd-ts-kit:state-machines -->
No state machine.
<!-- /ddd-ts-kit:state-machines -->

## Process managers

<!-- ddd-ts-kit:processes -->
No process manager.
<!-- /ddd-ts-kit:processes -->

## Relationships

<!-- ddd-ts-kit:relationships -->
- Downstream of `identity` (conformist).
- Upstream of `credit-application` (published-language).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe brokerage --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `identity` (conformist); downstreams: `credit-application` (published-language).

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `BrokerRepository` | external | `PrismaBrokerRepository` |
| `IntermediariesRegister` | external | `SimulatedIntermediariesRegister` |
<!-- /ddd-ts-kit:reference -->
