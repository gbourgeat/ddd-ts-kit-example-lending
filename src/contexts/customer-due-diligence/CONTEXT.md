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
| Identified | the customer is known to the bank: identity and proof of address checked for a person, registration for a business |  |
| Registered | The business's registration is recorded by the bank, before its directors and beneficial owners are identified |  |
| Identity | The identity of a person: the identity document and the proof of address the bank checked |  |
| Document | An identity document: a passport, a national identity card or a residence permit |  |
| Expired | Past its expiry date on the day of identification |  |
| Proof | A document showing the address of a person |  |
| Address | Where a person lives, as stated on its proof of address |  |
| Old | Dated more than three months before the day of identification |  |
| Declare | The bank records the directors and beneficial owners of a registered business, each identified as a person |  |
| Get | Reads a thing the bank holds, without changing it |  |
| Read | A look at a customer file by an operator, recorded in the audit |  |
| File | The file of a customer: its identity, business, directors and owners, as the bank holds them, read by compliance and read audited |  |
| Advisor | The branch-network advisor who looks after a customer, assigned by the bank |  |
| Assign | The bank gives a customer its advisor |  |
| Screen | The bank checks a person against the sanctions and politically exposed lists, with the name and birth date it gives |  |
| Found | The screening found a person on a list: a possible match, waiting for compliance review |  |
| Confirmed | Said of a possible match that compliance has confirmed: it becomes a sanctions match |  |
| Confirm | Compliance decides that a possible match is a sanctions match |  |
| Ended | Said of a business relationship the bank has ended: a confirmed sanctions match ends it |  |
| End | The bank ends its business relationship with a customer |  |
| Reason | the written motive a compliance officer gives for a decision taken on a customer |  |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `Customer` (event-sourced)
<!-- /ddd-ts-kit:aggregates -->

## Published events

<!-- ddd-ts-kit:events -->
- `customer-due-diligence.customer.advisor-assigned` (version 1)
- `customer-due-diligence.customer.identified` (version 1)
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
No personal data declared.
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
- `customer-due-diligence:business.register`
- `customer-due-diligence:customer.identify`
- `customer-due-diligence:business.declare-owners`
- `customer-due-diligence:customer.read`
- `customer-due-diligence:customer.assign-advisor`
- `customer-due-diligence:customer.screen`
- `customer-due-diligence:match.confirm`
- `customer-due-diligence:relationship.end`
- `customer-due-diligence:match.dismiss`
- `customer-due-diligence:customer.rate-risk`
- `customer-due-diligence:customer.read-risk`
- `customer-due-diligence:due-diligence.refresh`
- `customer-due-diligence:due-diligence.read`
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

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `AssignAdvisor` | command | `customer.assign-advisor` |
| `ConfirmSanctionsMatch` | command | `match.confirm` |
| `DeclareDirectorsAndOwners` | command | `business.declare-owners` |
| `DismissMatch` | command | `match.dismiss` |
| `EndRelationship` | command | `relationship.end` |
| `GetCustomerDueDiligence` | query | `due-diligence.read` |
| `GetCustomerFile` | query | `customer.read` |
| `GetCustomerRiskRating` | query | `customer.read-risk` |
| `IdentifyCustomer` | command | `customer.identify` |
| `RateCustomerRisk` | command | `customer.rate-risk` |
| `RefreshDueDiligence` | command | `due-diligence.refresh` |
| `RegisterBusiness` | command | `business.register` |
| `ScreenCustomer` | command | `customer.screen` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/businesses` | `registerBusiness` | `BusinessesRoutes` | `Authenticated` | `RegisterBusiness` | `business.register` | body: `RegisterBusinessBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `UNKNOWN_CUSTOMER`, `BUSINESS_ALREADY_REGISTERED` |
| GET | `/customer-files` | `getCustomerFile` | `CustomerFilesRoutes` | `Authenticated` | `GetCustomerFile` | `customer.read` | query | 200: `page of GetCustomerFileLine` | `UNAUTHORIZED`, `FORBIDDEN` |
| POST | `/customers` | `identifyCustomer` | `CustomersRoutes` | `Authenticated` | `IdentifyCustomer` | `customer.identify` | body: `IdentifyCustomerBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `IDENTITY_DOCUMENT_EXPIRED`, `PROOF_OF_ADDRESS_TOO_OLD` |
| PUT | `/customers/:id/advisor` | `assignAdvisor` | `CustomersRoutes` | `Authenticated` | `AssignAdvisor` | `customer.assign-advisor` | params: `AssignAdvisorParams`, body: `AssignAdvisorBody` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `UNKNOWN_CUSTOMER` |
| POST | `/customers/:id/directors-and-owners` | `declareDirectorsAndOwners` | `CustomersRoutes` | `Authenticated` | `DeclareDirectorsAndOwners` | `business.declare-owners` | params: `DeclareDirectorsAndOwnersParams`, body: `DeclareDirectorsAndOwnersBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `BUSINESS_NOT_REGISTERED`, `UNKNOWN_CUSTOMER`, `IDENTITY_DOCUMENT_EXPIRED`, `PROOF_OF_ADDRESS_TOO_OLD` |
| GET | `/customers/:id/due-diligence` | `getCustomerDueDiligence` | `CustomersRoutes` | `Authenticated` | `GetCustomerDueDiligence` | `due-diligence.read` | params: `GetCustomerDueDiligenceParams` | 200: `GetCustomerDueDiligenceAnswer` | `UNAUTHORIZED`, `FORBIDDEN` |
| POST | `/customers/:id/matches/confirm` | `confirmSanctionsMatch` | `CustomersRoutes` | `Authenticated` | `ConfirmSanctionsMatch` | `match.confirm` | params: `ConfirmSanctionsMatchParams` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `UNKNOWN_CUSTOMER`, `NO_POSSIBLE_MATCH` |
| POST | `/customers/:id/matches/dismiss` | `dismissMatch` | `CustomersRoutes` | `Authenticated` | `DismissMatch` | `match.dismiss` | params: `DismissMatchParams`, body: `DismissMatchBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `UNKNOWN_CUSTOMER`, `NO_POSSIBLE_MATCH` |
| POST | `/customers/:id/refresh` | `refreshDueDiligence` | `CustomersRoutes` | `Authenticated` | `RefreshDueDiligence` | `due-diligence.refresh` | params: `RefreshDueDiligenceParams`, body: `RefreshDueDiligenceBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `UNKNOWN_CUSTOMER` |
| PUT | `/customers/:id/risk` | `rateCustomerRisk` | `CustomersRoutes` | `Authenticated` | `RateCustomerRisk` | `customer.rate-risk` | params: `RateCustomerRiskParams`, body: `RateCustomerRiskBody` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `UNKNOWN_CUSTOMER` |
| GET | `/customers/:id/risk-rating` | `getCustomerRiskRating` | `CustomersRoutes` | `Authenticated` | `GetCustomerRiskRating` | `customer.read-risk` | params: `GetCustomerRiskRatingParams` | 200: `GetCustomerRiskRatingAnswer` | `UNAUTHORIZED`, `FORBIDDEN` |
| POST | `/customers/:id/screening` | `screenCustomer` | `CustomersRoutes` | `Authenticated` | `ScreenCustomer` | `customer.screen` | params: `ScreenCustomerParams`, body: `ScreenCustomerBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `UNKNOWN_CUSTOMER` |

### Publishers

| Event | Versions | Publisher |
|---|---|---|
| `customer-due-diligence.customer.advisor-assigned` | 1 | `CustomerAdvisorAssignedPublisher` |
| `customer-due-diligence.customer.identified` | 1 | `CustomerIdentifiedPublisher` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `CustomerFileProjection` | repository | `PrismaCustomerFileProjectionRepository` |
| `CustomerRepository` | repository | `EventStoreCustomerRepository` |
| `GetCustomerDueDiligenceReader` | repository | `EventStoreGetCustomerDueDiligenceReader` |
| `GetCustomerFileReader` | repository | `PrismaGetCustomerFileReader` |
| `GetCustomerRiskRatingReader` | repository | `EventStoreGetCustomerRiskRatingReader` |
| `ScreeningProvider` | external | `SimulatedScreeningProvider` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `BusinessAlreadyRegistered` | `forCustomer` | `BUSINESS_ALREADY_REGISTERED` | none |
| `BusinessNotRegistered` | `forCustomer` | `BUSINESS_NOT_REGISTERED` | none |
| `IdentityDocumentExpired` | `forCustomer` | `IDENTITY_DOCUMENT_EXPIRED` | none |
| `MissingReason` | `forDismissal` | `MISSING_REASON` | none |
| `NoPossibleMatch` | `forCustomer` | `NO_POSSIBLE_MATCH` | none |
| `ProofOfAddressTooOld` | `forCustomer` | `PROOF_OF_ADDRESS_TOO_OLD` | none |
| `UnknownCustomer` | `forCustomer` | `UNKNOWN_CUSTOMER` | none |
<!-- /ddd-ts-kit:reference -->
