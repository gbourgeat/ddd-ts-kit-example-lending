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
| Personal data | Any information about a data subject that the bank keeps | Data subject |
| Retention | How long personal data are kept after the relevant end, before erasure | Schedule (servicing) |
| Erase | Remove the personal data of a data subject once its retention is over |  |
| Past | Beyond the retention period, after the relevant end |  |
| Data erase | The removal of the personal data of a data subject past their retention | Erasure |
| Request | A data subject asks the bank for a copy of the personal data it keeps |  |
| Link | The signed address that downloads a copy of data, valid one hour |  |
| Record | The written impact assessment of one scoring model version for one month, kept once and never amended | Register entry |
| Scoring | The scoring model that decides a customer's access to credit, assessed by impact assessments | Scoring model of credit-scoring |
| Year-month | A calendar month written YYYY-MM, the month an impact assessment is for |  |
| Scoring model version | The identifier of the version of the scoring model an impact assessment assesses |  |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `ImpactAssessment`
- `RetentionPeriod`
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
- `data-protection:data.erase`
- `data-protection:data-subject.request-copy`
- `data-protection:impact-assessment.record`
<!-- /ddd-ts-kit:permissions -->

## Scheduled jobs

<!-- ddd-ts-kit:jobs -->
| Job | Schedule | Command |
|---|---|---|
| `ErasePersonalDataPastRetentionJob` | `` | `ErasePersonalDataPastRetention` |
<!-- /ddd-ts-kit:jobs -->

## Background jobs

<!-- ddd-ts-kit:background-jobs -->
| Job | Class |
|---|---|
| `data-protection.copy-of-data-timeout` | `CopyOfDataTimeoutBackgroundJob` |
<!-- /ddd-ts-kit:background-jobs -->

## State machines

<!-- ddd-ts-kit:state-machines -->
No state machine.
<!-- /ddd-ts-kit:state-machines -->

## Process managers

<!-- ddd-ts-kit:processes -->
| Process | Class | Timeouts delivered by |
|---|---|---|
| `data-protection.copy-of-data` | `CopyOfDataProcess` | `data-protection.copy-of-data-timeout` |
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

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `ErasePersonalDataPastRetention` | command | `data.erase` |
| `RecordScoringImpactAssessment` | command | `impact-assessment.record` |
| `RequestPersonalDataCopy` | command | `public` |
| `RequestPersonalDataCopyLink` | command | `public` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/data-subjects/:customerId/copies` | `requestPersonalDataCopy` | `DataSubjectsRoutes` | `Authenticated` | `RequestPersonalDataCopy` | `public` |  | 201: `PersonalDataCopyLink` | `UNAUTHORIZED`, `FORBIDDEN` |
| GET | `/data-subjects/:customerId/copies/:copyId/link` | `requestPersonalDataCopyLink` | `DataSubjectsRoutes` | `Authenticated` | `RequestPersonalDataCopyLink` | `public` | params: `RequestPersonalDataCopyLinkParams` | 200: `PersonalDataCopyLink` | `UNAUTHORIZED`, `FORBIDDEN`, `FILE_NOT_FOUND` |
| POST | `/impact-assessments` | `recordScoringImpactAssessment` | `ImpactAssessmentsRoutes` | `Authenticated` | `RecordScoringImpactAssessment` | `impact-assessment.record` | body: `RecordScoringImpactAssessmentBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `DataProtectionCodes.InvalidYearMonth`, `DataProtectionCodes.InvalidScoringModelVersion`, `DataProtectionCodes.ImpactAssessmentAlreadyRecorded` |
| POST | `/personal-data/erasures` | `erasePersonalDataPastRetention` | `PersonalDataRoutes` | `Authenticated` | `ErasePersonalDataPastRetention` | `data.erase` | body: `ErasePersonalDataPastRetentionBody` | 204 | `UNAUTHORIZED`, `FORBIDDEN` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `CopyOfDataStore` | external | `FileCopyOfDataStore` |
| `ImpactAssessmentRepository` | repository | `PrismaImpactAssessmentRepository` |
| `PersonalDataGathering` | external | `PlatformPersonalDataGathering` |
| `PersonalDataPurge` | external | `PlatformPersonalDataPurge` |
| `RetentionPeriodRepository` | repository | `PrismaRetentionPeriodRepository` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `ImpactAssessmentAlreadyRecorded` | `forVersionAndMonth` | `IMPACT_ASSESSMENT_ALREADY_RECORDED` | none |
| `InvalidScoringModelVersion` | `forVersion` | `INVALID_SCORING_MODEL_VERSION` | none |
| `InvalidYearMonth` | `forText` | `INVALID_YEAR_MONTH` | none |
| `UnknownPersonalDataCopy` | `forUnknownPersonalDataCopy` | `FILE_NOT_FOUND` | none |
<!-- /ddd-ts-kit:reference -->
