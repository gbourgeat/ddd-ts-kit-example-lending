# Customer due diligence

## Purpose

Knows each customer: identity, business and its beneficial owners, screening, risk rating and refresh dates, kept as events. It answers whether a customer is up to date for the payout gate.

## Classification

supporting

Knowing each customer is a legal duty the bank meets before any credit, so it supports the business without deciding a loan.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Customer | A person or a small business the bank knows, screens and must keep up to date | Applicant, Borrower: the roles of a relationship with credit |
| Person | An individual the bank knows: identity documents and proof of address | Account (identity): the person's login |
| Business | A small business the bank knows: its registration, its directors, its beneficial owners | Bank: the tenant |
| Director | A person who runs a business | Member (identity) |
| Beneficial owner | A person holding more than 25 percent of a business | Shareholder |
| Screening | The check of a person against the sanctions lists and the lists of politically exposed persons, by an outside provider | Alert (financial-crime) |
| Possible match | A screening hit, waiting for compliance review | Sanctions match |
| Sanctions match | A possible match confirmed by compliance; it ends the relationship | Dismissed match |
| Dismissed match | A possible match cleared by compliance, with its reason | Sanctions match |
| Politically exposed person | A person with a public role, listed by the screening provider | Director |
| Risk rating | Low, medium or high, from the country, the activity, the screening and the product | Score (credit-scoring) |
| Due diligence | The bank's knowledge of a customer: identity, screening, risk rating, refresh dates; kept as events | Application file |
| Refresh | The renewal of due diligence: yearly for high risk, every three years for medium, every five years for low | Due diligence |
| Overdue | Said of a due diligence whose refresh is past its date; no credit is disbursed until it is done | Refresh: the renewal itself |
| Relationship | The bank's business relationship with a customer; it ends on a confirmed sanctions match | Portfolio (branch-network) |

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
- Downstream of `data-protection` (customer-supplier).
- Upstream of `branch-network` (published-language).
- Upstream of `credit-application` (customer-supplier).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe customer-due-diligence --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `identity` (conformist), `data-protection` (customer-supplier); downstreams: `branch-network` (published-language), `credit-application` (customer-supplier).
<!-- /ddd-ts-kit:reference -->
