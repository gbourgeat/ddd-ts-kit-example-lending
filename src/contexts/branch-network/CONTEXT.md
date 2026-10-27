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
| Search | Read a page of the staff of a branch, for a branch manager of that branch |  |
| List | The staff of a branch, as one page of the search |  |
| Own | the customer file that is the staff member's own, when they are also a customer |  |
| Record | a customer file, as the branch network knows it by its customer id |  |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `Branch`
- `ConflictOfInterest`
- `Portfolio`
- `StaffMember`
<!-- /ddd-ts-kit:aggregates -->

## Published events

<!-- ddd-ts-kit:events -->
- `branch-network.conflict-of-interest.declared` (version 1)
- `branch-network.staff-member.appointed` (version 1)
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
| Table | About | Personal data | On erasure | Kept |
|---|---|---|---|---|
| `staff_members` | `id` | `name`, `email` | pseudonymised | until erased |
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
- `branch-network:branch.open`
- `branch-network:staff-member.appoint`
- `branch-network:portfolio.open`
- `branch-network:staff-member.list`
- `branch-network:conflict.declare`
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

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `AppointStaffMember` | command | `staff-member.appoint` |
| `DeclareConflictOfInterest` | command | `conflict.declare` |
| `OpenBranch` | command | `branch.open` |
| `OpenPortfolio` | command | `portfolio.open` |
| `SearchBranchStaff` | query | `staff-member.list` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/branches` | `openBranch` | `BranchesRoutes` | `Authenticated` | `OpenBranch` | `branch.open` | body: `OpenBranchBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN` |
| POST | `/branches/:id/staff` | `appointStaffMember` | `BranchesRoutes` | `Authenticated` | `AppointStaffMember` | `staff-member.appoint` | params: `AppointStaffMemberParams`, body: `AppointStaffMemberBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `BranchNetworkCodes.BranchNotOpened` |
| POST | `/conflicts` | `declareConflictOfInterest` | `ConflictsRoutes` | `Authenticated` | `DeclareConflictOfInterest` | `conflict.declare` | body: `DeclareConflictOfInterestBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `BranchNetworkCodes.UnknownStaffMember`, `BranchNetworkCodes.ConflictOnOwnRecord` |

### Publishers

| Event | Versions | Publisher |
|---|---|---|
| `branch-network.conflict-of-interest.declared` | 1 | `ConflictOfInterestDeclaredPublisher` |
| `branch-network.staff-member.appointed` | 1 | `StaffMemberAppointedPublisher` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `BranchNetworkPersonalDataErasure` | external | `PrismaBranchNetworkPersonalDataErasure` |
| `BranchNetworkPersonalDataExport` | external | `PrismaBranchNetworkPersonalDataExport` |
| `BranchRepository` | repository | `PrismaBranchRepository` |
| `ConflictOfInterestRepository` | repository | `PrismaConflictOfInterestRepository` |
| `PortfolioRepository` | repository | `PrismaPortfolioRepository` |
| `SearchBranchStaffReader` | repository | `InMemorySearchBranchStaffReader` |
| `StaffMemberRepository` | repository | `PrismaStaffMemberRepository` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `BranchNotOpened` | `forBranch` | `BRANCH_NOT_OPENED` | `branchId` |
| `ConflictOnOwnRecord` | `forCustomer` | `CONFLICT_ON_OWN_RECORD` | none |
| `UnknownStaffMember` | `forStaffMember` | `UNKNOWN_STAFF_MEMBER` | none |
<!-- /ddd-ts-kit:reference -->
