# Branch network

## Purpose

Branches of a bank, its staff and their roles, the portfolio of each advisor, and the declared conflicts of interest. It answers who follows which customer, not who the customer is.

## Classification

supporting

Who follows which customer, and who may decide on it, is needed for the business, but the lending judgement itself is made in credit-application.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Bank | The tenant: the bank that subscribed, whose data no other bank sees; the `Organisation` of identity | Branch |
| Branch | A place of a bank, with its staff and its portfolios | Bank |
| Staff member | A person employed by a bank, with one role | Member (identity): the membership of an account in an organisation |
| Staff role | Advisor, credit analyst, risk manager, credit committee member, compliance officer, branch manager or internal auditor | Role (identity): owner, admin or member |
| Advisor | A staff member who holds a portfolio of customers in a branch | Broker |
| Portfolio | The customers an advisor follows | Portfolio at risk (reporting) |
| Assignment | The act of giving a customer to an advisor's portfolio | Application |
| Branch manager | The staff member responsible for a branch; sees everything of it | Advisor |
| Conflict of interest | A declared link between a staff member and a customer or an application: a relative, an associate, or their own file | Sanctions match |
| Declared conflict | A conflict of interest put on record by the staff member themselves | Conflict of interest, undeclared |
| Opened | the branch is open: it has a place, it can take its staff and its portfolios |  |
| Appointed | a person becomes a staff member of a bank |  |
| Declared | a staff member puts a conflict of interest on record |  |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `Branch`
- `ConflictOfInterest`
- `Portfolio`
- `StaffMember`
<!-- /ddd-ts-kit:aggregates -->

## Published events

<!-- ddd-ts-kit:events -->
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
| Table | About | Personal data | On erasure | Kept |
|---|---|---|---|---|
| `staff_members` | `id` | `name`, `email` | pseudonymised | until erased |
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
- Downstream of `customer-due-diligence` (published-language).
- Downstream of `identity` (conformist).
- Upstream of `credit-application` (published-language).
- Upstream of `reporting` (published-language).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe branch-network --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `customer-due-diligence` (published-language), `identity` (conformist); downstreams: `credit-application` (published-language), `reporting` (published-language).

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `BranchNetworkPersonalDataErasure` | external | `PrismaBranchNetworkPersonalDataErasure` |
| `BranchNetworkPersonalDataExport` | external | `PrismaBranchNetworkPersonalDataExport` |
| `BranchRepository` | external | `PrismaBranchRepository` |
| `ConflictOfInterestRepository` | external | `PrismaConflictOfInterestRepository` |
| `PortfolioRepository` | external | `PrismaPortfolioRepository` |
| `StaffMemberRepository` | external | `PrismaStaffMemberRepository` |
<!-- /ddd-ts-kit:reference -->
