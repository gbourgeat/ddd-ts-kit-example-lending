# Credit application

## Purpose

Takes an application from a customer or a broker to a decision, then to an offer the borrower accepts or withdraws. Its application file is append-only and every decision shows what the decider saw.

## Classification

core

It is the bank's core business: every credit the bank grants is decided here, and no other context decides a credit.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Application | A customer's or a broker's request for one loan of one product, from submission to its decision; before payout it is not yet a loan | Loan: money already paid out |
| Applicant | The person who applied; a customer once identified | Customer: the person the bank knows, owned by customer-due-diligence |
| Borrower | The person named as borrower on the application, who owes the loan once it is paid out | Applicant: the one who applied, who may not be the borrower |
| Co-borrower | A person named on the application who shares the debt | Guarantor |
| Guarantor | A person who backs the debt if the borrower does not pay | Co-borrower: who shares the debt |
| Application file | The append-only file of everything that happened to an application, in order | Document: one item of the file |
| Entry | One fact added to the application file, with what it corrects and why | Movement: an entry of the loan ledger, in servicing |
| Document | A payslip, tax notice, bank statement or business account given by the applicant and stored as a file | Application file |
| Consent | The applicant's permission to read their bank accounts for this application, valid 90 days | Account (identity) |
| Assessment | The proposal of approve or refuse, with the ratios, the register answer and the score that support it | Decision: the decider's choice |
| Debt to income ratio | The household's monthly repayments, the new one included, divided by its net monthly income; at most 35 percent | Residual income |
| Residual income | What the household keeps each month after its repayments and fixed charges | Debt to income ratio |
| Proposed refusal | An assessment's refusal, waiting for a person's review; the machine never refuses alone | Refusal |
| Decision | The decider's choice: approve, approve with conditions, or refuse with reasons | Assessment |
| Condition | A change of an approval: a lower amount, a guarantor, a longer duration | Exception |
| Decider | The staff member entitled to decide, by amount and risk: advisor, credit analyst, risk manager, credit committee | Preparer |
| Preparer | The staff member who prepared an application; never its decider | Decider |
| Exception | A deviation from the policy: a ratio above its limit, a residual income below its minimum, a score below the product threshold | Condition |
| Justification | The written reason of an exception | Decision |
| Refusal | The final refusal of an application, with its reasons | Proposed refusal |
| Human review | A person's review of a decision, asked by the applicant | Contest |
| Contest | The applicant's written point of view against a decision | Human review |
| Offer | The loan terms proposed to the borrower, valid 15 days | Loan |
| Pre-contractual sheet | The standard information sheet the borrower receives before the offer | Offer |
| Acceptance | The borrower's electronic signature of an offer | Withdrawal |
| Withdrawal | The consumer's right to withdraw within 14 calendar days of signing, without a reason | Refusal, cancellation of an application |
| Payout authorisation | The check that funds may be paid out: the 8th day after signing has come, and due diligence is up to date | Payout, in servicing: the release itself |
| Rescheduling | A new schedule for a borrower in difficulty, decided as a credit | Restructuring of a loan |
| Repayment incident register | The national register of repayment incidents, consulted for each assessment | Intermediaries register, in brokerage |
| Requested amount | The amount the applicant asks for, the basis of the decision table | Approved amount |
| Approved amount | The amount of the decision, after conditions | Requested amount |
| File | The application file, the documents and the account consent. |  |
| Credit application | the application file of one loan request, from submission to payout |  |
| Submitted | the application was received from an applicant or a broker, and its file opened |  |
| Duration | The number of whole months over which the requested amount is repaid |  |
| Net income | The household's monthly income net of tax, the base of the debt to income ratio |  |
| Annual | the period of a year over which the annual percentage rate is stated |  |
| Percentage | the rate expressed in per cent, stated to one decimal |  |
| Rate | the interest rate of a credit, nominal or annual |  |
| Actuarial | the discounting of the repayments at their exact dates, in years from the drawdown |  |
| Formula | the equation of Annex I of the Consumer Credit Directive that gives the annual percentage rate |  |
| Account | A bank account of the applicant, read through an account information provider for the income and expenses of the application |  |
| Given | Past participle of give: the fact that a permission was handed over at an instant, recorded in the file |  |
| List | A page of the applications one operator may see, narrowed by the access scope of the caller |  |
| Read | An operator's right to see an application, granted by its relations (advisor, co-borrower, broker) |  |
| Search | A read that takes a scope and a page: the applications one caller may see, page by page, never a list of all of them |  |
| Name | to put a person on the application as its co-borrower or its guarantor, an entry of the application file |  |
| Party | a person named on an application: its borrower, its co-borrower or its guarantor |  |
| Correct | to record, by a later entry of the same application, a correction of an earlier entry of its file, which names that entry and says why |  |
| Correction | a later entry of the file that corrects an earlier entry of the same application, and says why |  |
| Recorded | kept in the file as a fact that happened |  |
| Reason | the explanation a correction gives for correcting an entry |  |
| Keep | to record in a projection a fact received from another context, so that a decision reads it later |  |
| Declared | stated by the staff member themself, as opposed to found by a check |  |
| Conflicts | the declared conflicts of interest of staff members on a customer, each one barring that staff member from deciding the customer's application |  |
| Decide | the decider's act of choosing the outcome of an application, within the decider's limit | Decision: the choice itself |
| Attach | to add a document to the application file, as an entry of it, its content stored in the object store |  |
| Document attached | a document of the application was stored in the object store and recorded in the file |  |
| Information | what an account information provider tells about the applicant's accounts: the income and expenses read for an application, kept as a document of its file |  |
| Advisor | the staff member whose portfolio holds a customer, who gives the customer's branch |  |
| Branch | the branch of the advisor whose portfolio holds the applicant, on which the application is submitted |  |
| Consult | to ask the repayment incident register whether each party of the application is listed there, and to record the answer in the file, with no copy of the names and birth dates it was asked with |  |
| Unidentified | a party of the application whose identity customer-due-diligence does not answer: the register cannot be asked about it |  |
| Delegation | the limits each level of staff may decide within, kept by credit-policy | not the delegation of a member of staff to another |
| Table | the rows of the delegation table: one limit per level of staff, with its date of effect | not a database table |
| Level | the level of authority of a member of staff, which bounds what they may decide | not a level of the bank hierarchy |
| Grid | The nominal rate of each product by risk rating and duration, as credit-policy publishes it | Annual percentage rate |
| Legal maximum rate | The highest annual rate for a category of loan in force on a day | Rate grid |
| Erase personal data past retention | Destroy the key of the personal values of every application refused six months ago, so that the file can no longer be read | Delete an application |
| Product | A credit offer of the bank, with the amounts, durations, fee and insurance it is sold with | Offer |
| Terms | The amounts, durations, arrangement fee and insurance a product is sold with | Condition |
| Assess | To make the assessment of an application: its ratios, its register answer and its score, then a proposal of approve or refuse |  |
| No score available | the scoring of the application cannot be made: no scoring model version is published |  |
| Proposal | the outcome an assessment proposes: approve, or a refusal that a person reviews |  |
| Broker | An outside intermediary who brings applications; not a staff member | Advisor |
| Registration | The broker's registration with the intermediaries register, in force from its registration until it lapses | Repayment incident register |
| Lapsed | The registration of a broker that is no longer valid: the broker may no longer bring applications | Refusal |
| Check | The verification that a submitted request lies within the limits of its product, recorded as a finding when it does not | Assessment |
| Against | Compared with the limits the product sets: its minimum and maximum amount and duration |  |
| Outside | Beyond the limit that a product sets: a request that is not within it | Inside |
| Found | A finding: a fact noticed by a check and kept in the file | Founded |
| Unknown | Not known: the terms of a product that have not been kept yet | Unidentified |
| Checked | A check was run and its answer is kept in the file | Checking |
| Findings | What the checks of an application against its product found, kept in its file | Results |
| Reviewer | the staff member who reviews a proposed refusal; never the one who ran its assessment |  |
| Cannot | not permitted; part of a refusal name only |  |
| Be | to exist as; part of a refusal name only |  |
| Assessor | the staff member who ran the assessment of an application |  |
| Stands | the proposed refusal, once confirmed by a review, is the outcome of the application, a decision to approve cannot overturn it |  |
| Above | beyond the amount a level may approve |  |
| Limit | the most a level of staff may approve, the amount of its delegation |  |
| Force | in effect on a day: the table of the latest date of effect not after that day |  |

## Modules

| Module | Purpose |
|---|---|
| `file` | The application file, the documents and the account consent. |
| `assessment` | Debt to income, residual income, register result and the score recorded. |
| `decision` | Delegation, four eyes, exceptions and rescheduling. |
| `offer` | Rate, annual percentage rate, pre-contract sheet, acceptance and withdrawal. |

## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `CreditApplication` (event-sourced)
- `Offer`
<!-- /ddd-ts-kit:aggregates -->

## Published events

<!-- ddd-ts-kit:events -->
- `credit-application.credit-application.decided` (version 1)
- `credit-application.credit-application.submitted` (version 1)
- `credit-application.credit-application.submitted` (version 2)
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
No personal data declared.
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
- `credit-application:application.submit`
- `credit-application:application.consent`
- `credit-application:application.read`
- `credit-application:application.name-party`
- `credit-application:application.correct`
- `credit-application:application.decide`
- `credit-application:application.attach-document`
- `credit-application:application.read-accounts`
- `credit-application:application.consult-register`
- `credit-application:application.erase-past-retention`
- `credit-application:delegation-table.keep`
- `credit-application:decider-level.keep`
- `credit-application:rate-grid.keep`
- `credit-application:legal-maximum-rate.keep`
- `credit-application:application.assess`
- `credit-application:product-terms.keep`
- `credit-application:broker-registration.keep`
- `credit-application:application.review-refusal`
<!-- /ddd-ts-kit:permissions -->

## Scheduled jobs

<!-- ddd-ts-kit:jobs -->
| Job | Schedule | Command |
|---|---|---|
| `ErasePersonalDataPastRetentionJob` | `` | `ErasePersonalDataPastRetention` |
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
- Downstream of `credit-policy` (published-language).
- Downstream of `credit-scoring` (customer-supplier).
- Downstream of `customer-due-diligence` (customer-supplier).
- Downstream of `brokerage` (published-language).
- Downstream of `branch-network` (published-language).
- Downstream of `identity` (conformist).
- Upstream of `servicing` (published-language).
- Upstream of `reporting` (published-language).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe credit-application --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: `credit-policy` (published-language), `credit-scoring` (customer-supplier), `customer-due-diligence` (customer-supplier), `brokerage` (published-language), `branch-network` (published-language), `identity` (conformist); downstreams: `servicing` (published-language), `reporting` (published-language).

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `AssessApplication` | command | `application.assess` |
| `AttachDocument` | command | `application.attach-document` |
| `CheckRequestAgainstProduct` | command | not read |
| `ConsultRepaymentIncidentRegister` | command | `application.consult-register` |
| `CorrectEntry` | command | `application.correct` |
| `DecideApplication` | command | not read |
| `ErasePersonalDataPastRetention` | command | `application.erase-past-retention` |
| `GiveAccountConsent` | command | `application.consent` |
| `KeepBrokerRegistration` | command | not read |
| `KeepDeciderLevel` | command | not read |
| `KeepDelegationTable` | command | not read |
| `KeepLegalMaximumRate` | command | not read |
| `KeepProductTerms` | command | not read |
| `KeepRateGrid` | command | not read |
| `NameCoBorrower` | command | `application.name-party` |
| `NameGuarantor` | command | `application.name-party` |
| `ReadAccountInformation` | command | `application.read-accounts` |
| `ReadBrokerRegistration` | query | not read |
| `ReadDeciderLevel` | query | not read |
| `ReadDeclaredConflicts` | query | not read |
| `ReadDelegationTable` | query | not read |
| `ReadDocument` | query | `application.read` |
| `ReadLegalMaximumRate` | query | not read |
| `ReadProductTerms` | query | not read |
| `ReadProductTermsFindings` | query | not read |
| `ReadRateGrid` | query | not read |
| `ReviewProposedRefusal` | command | `application.review-refusal` |
| `SearchApplications` | query | `public` |
| `SubmitApplication` | command | `application.submit` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/applications` | `searchApplications` | `ApplicationsRoutes` | `Authenticated` | `SearchApplications` | `public` | query | 200: `page of SearchApplicationsLine` | `UNAUTHORIZED`, `FORBIDDEN` |
| POST | `/applications` | `submitApplication` | `ApplicationsRoutes` | `Authenticated` | `SubmitApplication` | `application.submit` | body: `SubmitApplicationBody` | 201: `ApplicationSubmittedBody` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.InvalidAmount`, `CreditApplicationCodes.InvalidDuration` |
| POST | `/applications/:id/account-information` | `readAccountInformation` | `ApplicationsRoutes` | `Authenticated` | `ReadAccountInformation` | `application.read-accounts` | params: `ReadAccountInformationParams`, body: `ReadAccountInformationBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.MissingAccountConsent`, `CreditApplicationCodes.UnknownCreditApplication` |
| POST | `/applications/:id/assessment` | `assessApplication` | `ApplicationsRoutes` | `Authenticated` | `AssessApplication` | `application.assess` | params: `AssessApplicationParams` | 201: `AssessApplicationAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication`, `CreditApplicationCodes.MissingAccountInformation`, `CreditApplicationCodes.RegisterNotConsulted`, `CreditApplicationCodes.NoScoreAvailable` |
| POST | `/applications/:id/co-borrowers` | `nameCoBorrower` | `ApplicationsRoutes` | `Authenticated` | `NameCoBorrower` | `application.name-party` | params: `NameCoBorrowerParams`, body: `NameCoBorrowerBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication` |
| POST | `/applications/:id/consent` | `giveAccountConsent` | `ApplicationsRoutes` | `Authenticated` | `GiveAccountConsent` | `application.consent` | params: `GiveAccountConsentParams`, body: `GiveAccountConsentBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication` |
| POST | `/applications/:id/corrections` | `correctEntry` | `ApplicationsRoutes` | `Authenticated` | `CorrectEntry` | `application.correct` | params: `CorrectEntryParams`, body: `CorrectEntryBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication`, `CreditApplicationCodes.UnknownEntry`, `CreditApplicationCodes.CorrectionAlreadyRecorded`, `CreditApplicationCodes.InvalidCorrectionReason` |
| POST | `/applications/:id/decision` | `decideApplication` | `ApplicationsRoutes` | `Authenticated` | `DecideApplication` | not read | params: `DecideApplicationParams`, body: `DecideApplicationBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication`, `CreditApplicationCodes.NotAssessed`, `CreditApplicationCodes.AlreadyDecided`, `CreditApplicationCodes.RefusalNotReviewed`, `CreditApplicationCodes.RefusalProposalStands`, `CreditApplicationCodes.InvalidDecisionReasons`, `CreditApplicationCodes.InvalidDecisionConditions`, `CreditApplicationCodes.UnknownDeciderLevel`, `CreditApplicationCodes.UnknownDelegationTable`, `CreditApplicationCodes.DecisionAboveLimit`, `CreditApplicationCodes.PreparerCannotDecide` |
| GET | `/applications/:id/declared-conflicts` | `readDeclaredConflicts` | `ApplicationsRoutes` | `Authenticated` | `ReadDeclaredConflicts` | not read | params: `ReadDeclaredConflictsParams` | 200: `ReadDeclaredConflictsAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication` |
| POST | `/applications/:id/documents` | `attachDocument` | `ApplicationsRoutes` | `Authenticated` | `AttachDocument` | `application.attach-document` |  | 201: `AttachDocumentAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication` |
| GET | `/applications/:id/documents/:documentKey` | `readDocument` | `ApplicationsRoutes` | `Authenticated` | `ReadDocument` | `application.read` |  | 200: `documentContent` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication`, `CreditApplicationCodes.UnknownEntry` |
| POST | `/applications/:id/guarantors` | `nameGuarantor` | `ApplicationsRoutes` | `Authenticated` | `NameGuarantor` | `application.name-party` | params: `NameGuarantorParams`, body: `NameGuarantorBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication` |
| GET | `/applications/:id/product-terms-findings` | `readProductTermsFindings` | `ApplicationsRoutes` | `Authenticated` | `ReadProductTermsFindings` | not read | params: `ReadProductTermsFindingsParams` | 200: `ReadProductTermsFindingsAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication` |
| POST | `/applications/:id/refusal-review` | `reviewProposedRefusal` | `ApplicationsRoutes` | `Authenticated` | `ReviewProposedRefusal` | `application.review-refusal` | params: `ReviewProposedRefusalParams`, body: `ReviewProposedRefusalBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication`, `CreditApplicationCodes.InvalidReviewReason`, `CreditApplicationCodes.NoRefusalToReview`, `CreditApplicationCodes.RefusalAlreadyReviewed`, `CreditApplicationCodes.ReviewerCannotBeAssessor` |
| POST | `/applications/:id/register-consultations` | `consultRepaymentIncidentRegister` | `ApplicationsRoutes` | `Authenticated` | `ConsultRepaymentIncidentRegister` | `application.consult-register` | params: `ConsultRepaymentIncidentRegisterParams` | 201: `ConsultRepaymentIncidentRegisterAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownCreditApplication`, `CreditApplicationCodes.UnidentifiedParty` |
| GET | `/brokers/:brokerId/registration` | `readBrokerRegistration` | `BrokersRoutes` | `Authenticated` | `ReadBrokerRegistration` | not read | params: `ReadBrokerRegistrationParams` | 200: `ReadBrokerRegistrationAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownBrokerRegistration` |
| GET | `/deciders/:staffMemberId/level` | `readDeciderLevel` | `DecidersRoutes` | `Authenticated` | `ReadDeciderLevel` | not read | params: `ReadDeciderLevelParams` | 200: `ReadDeciderLevelAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownDeciderLevel` |
| GET | `/delegation-tables/:delegationTableId` | `readDelegationTable` | `DelegationTablesRoutes` | `Authenticated` | `ReadDelegationTable` | not read | params: `ReadDelegationTableParams` | 200: `ReadDelegationTableAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownDelegationTable` |
| GET | `/legal-maximum-rates/:legalMaximumRateId` | `readLegalMaximumRate` | `LegalMaximumRatesRoutes` | `Authenticated` | `ReadLegalMaximumRate` | not read | params: `ReadLegalMaximumRateParams` | 200: `ReadLegalMaximumRateAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownLegalMaximumRate` |
| GET | `/product-terms/:productId` | `readProductTerms` | `ProductTermsRoutes` | `Authenticated` | `ReadProductTerms` | not read | params: `ReadProductTermsParams` | 200: `ReadProductTermsAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownProductTerms` |
| GET | `/rate-grids/:rateGridId` | `readRateGrid` | `RateGridsRoutes` | `Authenticated` | `ReadRateGrid` | not read | params: `ReadRateGridParams` | 200: `ReadRateGridAnswer` | `UNAUTHORIZED`, `FORBIDDEN`, `CreditApplicationCodes.UnknownRateGrid` |

### Consumed events

| Event | Version | From | Handler | Consumer |
|---|---|---|---|---|
| `credit-policy.delegation-table.published` | 2 | `credit-policy` | `KeepBrokerRegistrationIntegrationHandler` | `credit-application.keep-delegation-table` |
| `credit-policy.delegation-table.published` | 2 | `credit-policy` | `KeepBrokerRegistrationLapsedIntegrationHandler` | `credit-application.keep-delegation-table` |
| `credit-policy.delegation-table.published` | 2 | `credit-policy` | `KeepDeciderLevelIntegrationHandler` | `credit-application.keep-delegation-table` |
| `credit-policy.delegation-table.published` | 2 | `credit-policy` | `KeepDelegationTableIntegrationHandler` | `credit-application.keep-delegation-table` |
| `credit-policy.delegation-table.published` | 2 | `credit-policy` | `KeepLegalMaximumRateIntegrationHandler` | `credit-application.keep-delegation-table` |
| `credit-policy.delegation-table.published` | 2 | `credit-policy` | `KeepProductTermsIntegrationHandler` | `credit-application.keep-delegation-table` |
| `credit-policy.delegation-table.published` | 2 | `credit-policy` | `KeepRateGridIntegrationHandler` | `credit-application.keep-delegation-table` |

### Publishers

| Event | Versions | Publisher |
|---|---|---|
| `credit-application.credit-application.decided` | 1 | `CreditApplicationDecidedPublisher` |
| `credit-application.credit-application.submitted` | 1, 2 | `CreditApplicationSubmittedPublisher` |

### Projections

| Projection | Class | Applies |
|---|---|---|
| not read | not read |  |
| not read | not read |  |
| not read | not read |  |
| not read | not read |  |
| not read | not read |  |
| not read | `DeciderLimitReader` |  |
| not read | `DeclaredConflictRow` |  |
| not read | `DeclaredConflictsProjection` |  |
| not read | not read |  |
| not read | not read |  |
| not read | not read |  |
| not read | not read |  |
| not read | not read |  |
| not read | not read |  |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `AccountInformationProvider` | external | `SimulatedAccountInformationProvider` |
| `ApplicationListProjection` | external | `PrismaApplicationListProjection` |
| `BrokerRegistrations` | not bound |  |
| `CreditApplicationRepository` | repository | `EventStoreCreditApplicationRepository` |
| `CustomerAdvisorBranchGateway` | external | `InProcessCustomerAdvisorBranchGateway` |
| `CustomerDiligenceGateway` | gateway | `InProcessCustomerDiligenceGateway` |
| `CustomerIdentityGateway` | gateway | `InProcessCustomerIdentityGateway` |
| `DeciderLevels` | not bound |  |
| `DeclaredConflictsStore` | external | `PrismaDeclaredConflictsStore` |
| `DelegationTables` | not bound |  |
| `ElectronicSignature` | external | `SimulatedElectronicSignature` |
| `LegalMaximumRates` | not bound |  |
| `OfferRepository` | external | `PrismaOfferRepository` |
| `ProductTerms` | not bound |  |
| `RateGrids` | not bound |  |
| `RepaymentIncidentRegister` | external | `SimulatedRepaymentIncidentRegister` |
| `ScoringGateway` | gateway | `InProcessScoringGateway` |
| `SearchApplicationsReader` | external | `PrismaSearchApplicationsReader` |

### Policies

| Policy | Permission |
|---|---|
| `DeclareFileReferenceUseCases` | `broker-registration.keep` |
| `DeclareDecisionUseCases` | `application.decide` |
| `DeclareOfferUseCases` | `rate-grid.keep` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `AlreadyDecided` | `forAlreadyDecided` | `ALREADY_DECIDED` | none |
| `CorrectionAlreadyRecorded` | `forEntry` | `CORRECTION_ALREADY_RECORDED` | none |
| `InvalidAmount` | `forCents` | `INVALID_AMOUNT` | none |
| `InvalidCorrectionReason` | `forReason` | `INVALID_CORRECTION_REASON` | none |
| `InvalidDecisionConditions` | `forConditions` | `INVALID_DECISION_CONDITIONS` | none |
| `InvalidDecisionReasons` | `forReasons` | `INVALID_DECISION_REASONS` | none |
| `InvalidDuration` | `forMonths` | `INVALID_DURATION` | none |
| `InvalidReviewReason` | `forReason` | `INVALID_REVIEW_REASON` | none |
| `MissingAccountConsent` | `forApplication` | `MISSING_ACCOUNT_CONSENT` | none |
| `NoRefusalToReview` | `forApplication` | `NO_REFUSAL_TO_REVIEW` | none |
| `NotAssessed` | `forNotAssessed` | `NOT_ASSESSED` | none |
| `RefusalAlreadyReviewed` | `forApplication` | `REFUSAL_ALREADY_REVIEWED` | none |
| `RefusalNotReviewed` | `forApplication` | `REFUSAL_NOT_REVIEWED` | none |
| `RefusalProposalStands` | `forApplication` | `REFUSAL_PROPOSAL_STANDS` | none |
| `ReviewerCannotBeAssessor` | `forApplication` | `REVIEWER_CANNOT_BE_ASSESSOR` | none |
| `UnknownBrokerRegistration` | `forUnknownBrokerRegistration` | `UNKNOWN_BROKER_REGISTRATION` | none |
| `UnknownCreditApplication` | `forCreditApplication` | `UNKNOWN_CREDIT_APPLICATION` | none |
| `UnknownEntry` | `forEntry` | `UNKNOWN_ENTRY` | none |
| `UnknownProductTerms` | `forUnknownProductTerms` | `UNKNOWN_PRODUCT_TERMS` | none |
| `InvalidNetIncome` | `forCents` | `INVALID_NET_INCOME` | none |
| `MissingAccountInformation` | `forApplication` | `MISSING_ACCOUNT_INFORMATION` | none |
| `NoScoreAvailable` | `forScore` | `NO_SCORE_AVAILABLE` | none |
| `RegisterNotConsulted` | `forApplication` | `REGISTER_NOT_CONSULTED` | none |
| `UnidentifiedParty` | `forCustomer` | `UNIDENTIFIED_PARTY` | none |
| `DecisionAboveLimit` | `forAboveLimit` | `DECISION_ABOVE_LIMIT` | `levelNeeded` |
| `PreparerCannotDecide` | `forPreparerCannotDecide` | `PREPARER_CANNOT_DECIDE` | none |
| `UnknownDeciderLevel` | `forUnknownDeciderLevel` | `UNKNOWN_DECIDER_LEVEL` | none |
| `UnknownDelegationTable` | `forUnknownDelegationTable` | `UNKNOWN_DELEGATION_TABLE` | none |
| `InvalidAnnualPercentageRate` | `forValue` | `INVALID_ANNUAL_PERCENTAGE_RATE` | none |
| `UnknownLegalMaximumRate` | `forUnknownLegalMaximumRate` | `UNKNOWN_LEGAL_MAXIMUM_RATE` | none |
| `UnknownRateGrid` | `forUnknownRateGrid` | `UNKNOWN_RATE_GRID` | none |

### Gateways

| Gateway | Upstream | Adapters |
|---|---|---|
| `CustomerDiligenceGateway` | `customer-due-diligence` | `InProcessCustomerDiligenceGateway` |
| `CustomerIdentityGateway` | `customer-due-diligence` | `InProcessCustomerIdentityGateway` |
| `ScoringGateway` | `credit-scoring` | `InProcessScoringGateway` |
<!-- /ddd-ts-kit:reference -->
