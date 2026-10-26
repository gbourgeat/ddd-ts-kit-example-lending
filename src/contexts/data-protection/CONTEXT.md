# Data protection

## Purpose

Holds the retention schedule and the processing register, answers a customer's request for a copy of their data, and asks each context to erase after retention. Each context erases its own data; the schedule is one language.

## Classification

supporting

Retention and erasure are a legal obligation every context serves, with no business decision of their own.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Data subject | The person the personal data are about | Customer: a role in the bank's relationship |
| Retention period | How long personal data are kept after the relevant end: due diligence five years after the relationship, a loan ten years after closing, a refused application six months | Schedule (servicing) |
| Erasure | The removal of personal data after their retention period; for event-sourced aggregates, the personal data of the events are destroyed | Ledger: never edited |
| Copy of data | The copy of all the bank keeps about a data subject, given on request | Application file |
| Processing register | The list of the processings of personal data and their purposes | Impact assessment |
| Impact assessment | The assessment of the scoring model, which processes personal data at scale and decides access to credit | Assessment (credit-application) |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
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
- Upstream of `customer-due-diligence` (customer-supplier).
- Upstream of `servicing` (customer-supplier).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe data-protection --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `identity` (conformist); downstreams: `customer-due-diligence` (customer-supplier), `servicing` (customer-supplier).
<!-- /ddd-ts-kit:reference -->
