# Slices

Backlog of the eleven contexts, one table per story (`US0` to `US15`). Ids are written once and never
renumbered. Kinds: `skeleton` and `contract` belong to the conductor, `slice` to the owner context.
Every generator command of a row of a context with modules (`credit-application`: `file`, `assessment`,
`decision`, `offer`; `servicing`: `ledger`, `instalments`, `arrears`) carries `--module <module>`: the module
whose concepts the command serves (`docs/architecture/contexts.md`). The generator refuses an aggregate,
domain event, domain service, port or value object without it, although the usage lines of
`generate --help --json` do not show it (friction in `docs/tooling/frictions.md`, kit issue #354).
Authorization is `rebac`: rights are decided by the relationship
schema and by policies, so no row uses `--grant`. Jobs run per bank (the tenant loop) unless a row says
otherwise. Acceptance specs of a story are written and locked before its first row of code (step 7).

## US0 Walking skeleton and access

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US0.01 | credit-application | skeleton | Credit application, event-sourced | `aggregate credit-application CreditApplication --event-sourced --birth Submitted --term "Credit application=the application file of one loan request, from submission to payout" --module file` | | conductor | done |
| US0.02 | platform | skeleton | Relationship schema: bank, branch, portfolio, customer, application, loan | edit `src/platform/auth/relationships/relationship-schema.ts` (TODO(platform) line 11): elements, derived relations, one spec per derived relation (no generator) | | conductor | done |
| US0.03 | platform | skeleton | Tuple store kept in the transaction of the change | edit `src/platform/auth/relationships/create-tuple-store.ts` (TODO(platform) line 3), held to `create-tuple-store.contract.spec.ts` | US0.02 | conductor | done |
| US0.04 | credit-application | slice | Submit an application (walking skeleton: one command, one route, one e2e) | `command credit-application SubmitApplication --permission application.submit --aggregate CreditApplication --module file`; `route credit-application SubmitApplication --method POST --path /applications --command --module file`; `e2e credit-application SubmitApplication` | US0.01, US0.02 | credit-application | done |
| US0.05 | credit-application | contract | Application submitted, published | `integration-event credit-application CreditApplication Submitted --version 1 --module file` | US0.04 | conductor | done |
| US0.08 | credit-application | slice | Application submitted with its branch, published as version 2 | add the branch of the submission to `CreditApplication` and publish `credit-application.credit-application.submitted` version 2, the v2 contract of the trunk (no generator) | US0.05, US1.16 | credit-application | done |
| US0.06 | platform | skeleton | Money in whole cents, shared by the contexts that hold amounts | `value-object shared-kernel Money --term "Money=an amount in whole cents"` (if the kernel refuses, a friction) | | conductor | done |
| US0.07 | credit-application | slice | AC3 of US0, the transaction: the application and its integration event are recorded together, or neither is | an integration spec on PostgreSQL (night run): a submission commits the event of the application and the outbox row in one transaction, and a failure after the record leaves neither, checked in both stores (no generator) | US0.05 | credit-application | done |

Serves: "Applications" (submission); the walking skeleton of the plan; close 2 (relationship schema, rows
US0.02 and US0.03); close 4 (CreditApplication event-sourced, row US0.01); "no floating point in the
ledger" (US0.06).

## US1 Banks, branches and staff

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US1.01 | identity | slice | Banks never see each other's data (tenant isolation spec) | `e2e identity OpenOrganisation` | | identity | done |
| US1.02 | branch-network | skeleton | Branch | `aggregate branch-network Branch`; `domain-event branch-network Branch Opened`; `repository branch-network Branch --tenant-scoped` | | conductor | done |
| US1.03 | branch-network | skeleton | Staff member, with the appointment event | `aggregate branch-network StaffMember`; `domain-event branch-network StaffMember Appointed`; `repository branch-network StaffMember --tenant-scoped --personal name,email --erasure pseudonymise` | | conductor | done |
| US1.04 | branch-network | skeleton | Portfolio of an advisor | `aggregate branch-network Portfolio`; `domain-event branch-network Portfolio Opened`; `repository branch-network Portfolio --tenant-scoped` | | conductor | done |
| US1.05 | branch-network | skeleton | Declared conflict of interest | `aggregate branch-network ConflictOfInterest`; `domain-event branch-network ConflictOfInterest Declared`; `repository branch-network ConflictOfInterest --tenant-scoped` | | conductor | done |
| US1.06 | branch-network | slice | Open a branch | `command branch-network OpenBranch --permission branch.open --aggregate Branch`; `route branch-network OpenBranch --method POST --path /branches --command` | US1.02 | branch-network | done |
| US1.07 | branch-network | slice | Appoint a member of staff to a branch | `command branch-network AppointStaffMember --permission staff-member.appoint --aggregate StaffMember`; `route branch-network AppointStaffMember --method POST --path /branches/:id/staff --command` | US1.03, US1.06 | branch-network | done |
| US1.08 | branch-network | slice | An advisor gets a portfolio of customers | `event-handler branch-network StaffMember Appointed --name OpenPortfolioForAdvisor`; `command branch-network OpenPortfolio --permission portfolio.open --aggregate Portfolio` | US1.04, US1.07 | branch-network | done |
| US1.09 | branch-network | slice | Declare a conflict of interest | `command branch-network DeclareConflictOfInterest --permission conflict.declare --aggregate ConflictOfInterest`; `route branch-network DeclareConflictOfInterest --method POST --path /conflicts --command` | US1.05, US1.07 | branch-network | done |
| US1.10 | branch-network | contract | Conflict of interest declared, published to credit-application | `integration-event branch-network ConflictOfInterest Declared --version 1` | US1.05 | conductor | done |
| US1.11 | branch-network | contract | Staff member appointed, published | `integration-event branch-network StaffMember Appointed --version 1` | US1.03 | conductor | done |
| US1.15 | branch-network | slice | Staff member appointed with its level, published as version 2 | add the level to the appointment of `StaffMember` and publish `branch-network.staff-member.appointed` version 2, the v2 contract of the trunk (no generator) | US1.11 | branch-network | done |
| US1.16 | branch-network | contract | Answers to credit-application the branch of the advisor whose portfolio holds a customer | implement `CustomerAdvisorBranchContract` (`src/contexts/branch-network/published-language/customer-advisor-branch.contract.ts`) with an answer class in branch-network, bound in the platform by the conductor; undefined when no advisor holds the customer; the started application answers the branch through the read contract | US1.13, US1.15 | branch-network | done |
| US1.12 | branch-network | slice | Staff of the branch, read by a branch manager | `query branch-network SearchBranchStaff --permission staff-member.list --search` | US1.07 | branch-network | done |
| US1.13 | branch-network | slice | An identified customer joins the advisor's portfolio | `integration-handler branch-network customer-due-diligence customer-due-diligence.customer.advisor-assigned --name AssignIdentifiedCustomer` (owner decision, plan.md wave 5: the advisor comes from AdvisorAssigned, not from the birth event) | US1.08, US2.17 | branch-network | done |

Serves: "Banks, branches and staff" (rows 2, 3, 4: US1.02, US1.04, US1.06 to US1.09, US1.12); intro
"each bank's data never visible to another" (US1.01, US1.12); "Who sees what": advisor sees the customers
of the portfolio (US1.13), branch manager sees the branch (US1.12); close 2 (scope of the branch).

Notes:
- #US1.09: a member of staff declares the link with a customer (a relative, an associate); the declaration does not stop the staff member's other work.
- #US1.13: the advisor is the one who identified the customer, so the customer lands in the advisor's portfolio.

## US2 Customers and due diligence

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US2.01 | customer-due-diligence | skeleton | Customer, event-sourced, born identified | `aggregate customer-due-diligence Customer --event-sourced --birth Identified` | | conductor | done |
| US2.02 | customer-due-diligence | skeleton | Screening provider (port and fake adapter) | `port customer-due-diligence ScreeningProvider`; `adapter customer-due-diligence ScreeningProvider --kind external` | | conductor | done |
| US2.03 | customer-due-diligence | contract | Customer identified, published | `integration-event customer-due-diligence Customer Identified --version 1` | US2.01 | conductor | done |
| US2.04 | customer-due-diligence | slice | Identify a customer (person) | `command customer-due-diligence IdentifyCustomer --permission customer.identify --aggregate Customer`; `route customer-due-diligence IdentifyCustomer --method POST --path /customers --command` | US2.01, US2.03 | customer-due-diligence | done |
| US2.05 | customer-due-diligence | slice | Register a business | `command customer-due-diligence RegisterBusiness --permission business.register --aggregate Customer`; `domain-event customer-due-diligence Customer BusinessRegistered`; `route customer-due-diligence RegisterBusiness --method POST --path /businesses --command` | US2.01 | customer-due-diligence | done |
| US2.06 | customer-due-diligence | slice | Each director and beneficial owner identified as a person | `command customer-due-diligence DeclareDirectorsAndOwners --permission business.declare-owners --aggregate Customer`; `domain-event customer-due-diligence Customer DirectorsAndOwnersDeclared`; `route customer-due-diligence DeclareDirectorsAndOwners --method POST --path /customers/:id/directors-and-owners --command` (owner decision, plan.md wave 5: declared by a command after the registration) | US2.04, US2.05 | customer-due-diligence | done |
| US2.07 | customer-due-diligence | slice | Screen each person; a possible match waits for compliance | `event-handler customer-due-diligence Customer Identified --name ScreenIdentifiedCustomer`; `command customer-due-diligence ScreenCustomer --permission customer.screen --aggregate Customer`; `domain-event customer-due-diligence Customer PossibleMatchFound` | US2.02, US2.04 | customer-due-diligence | done |
| US2.08 | customer-due-diligence | slice | Compliance confirms a sanctions match | `domain-event customer-due-diligence Customer SanctionsMatchConfirmed`; `command customer-due-diligence ConfirmSanctionsMatch --permission match.confirm --aggregate Customer`; `route customer-due-diligence ConfirmSanctionsMatch --method POST --path /customers/:id/matches/confirm --command` | US2.07 | customer-due-diligence | done |
| US2.09 | customer-due-diligence | slice | Compliance dismisses a match, with a reason | `command customer-due-diligence DismissMatch --permission match.dismiss --aggregate Customer`; `route customer-due-diligence DismissMatch --method POST --path /customers/:id/matches/dismiss --command` | US2.07 | customer-due-diligence | done |
| US2.10 | customer-due-diligence | slice | A confirmed sanctions match ends the relationship | `event-handler customer-due-diligence Customer SanctionsMatchConfirmed --name EndRelationshipOnSanctionsMatch`; `command customer-due-diligence EndRelationship --permission relationship.end --aggregate Customer` | US2.08 | customer-due-diligence | done |
| US2.11 | customer-due-diligence | slice | Rate the customer's risk, low, medium or high | `vocabulary customer-due-diligence RiskRating --value low --value medium --value high`; `domain-event customer-due-diligence Customer RiskRated`; `command customer-due-diligence RateCustomerRisk --permission customer.rate-risk --aggregate Customer`; `route customer-due-diligence RateCustomerRisk --method PUT --path /customers/:id/risk --command` | US2.07 | customer-due-diligence | done |
| US2.12 | customer-due-diligence | slice | Compliance approves a high risk customer | `command customer-due-diligence ApproveHighRiskCustomer --permission customer.approve-high-risk --aggregate Customer` | US2.11 | customer-due-diligence | done |
| US2.13 | customer-due-diligence | contract | Read contract of the payout gate: eligibility to credit, refused with its reason | `query customer-due-diligence CheckCreditEligibility --permission eligibility.check` | US2.12, US2.14 | conductor | todo |
| US2.14 | customer-due-diligence | slice | Refresh a customer's due diligence | `domain-event customer-due-diligence Customer DueDiligenceRefreshed`; `command customer-due-diligence RefreshDueDiligence --permission due-diligence.refresh --aggregate Customer`; `route customer-due-diligence RefreshDueDiligence --method POST --path /customers/:id/refresh --command` | US2.07 | customer-due-diligence | done |
| US2.15 | customer-due-diligence | slice | Flag the refreshes overdue, yearly, three-yearly and five-yearly by risk | `command customer-due-diligence FlagOverdueDueDiligence --permission due-diligence.flag-overdue --aggregate Customer`; `job customer-due-diligence FlagOverdueDueDiligence --cron "0 1 * * *" --time-zone Europe/Paris --command FlagOverdueDueDiligence` | US2.11, US2.14 | customer-due-diligence | done |
| US2.16 | customer-due-diligence | slice | Read a customer's file (the read is audited) | `query customer-due-diligence GetCustomerFile --permission customer.read --search` | US2.04 | customer-due-diligence | done |
| US2.17 | customer-due-diligence | slice | The advisor of a customer is assigned by an event of its own (owner decision US1.13) | `command customer-due-diligence AssignAdvisor --permission customer.assign-advisor --aggregate Customer`; `domain-event customer-due-diligence Customer AdvisorAssigned`; `integration-event customer-due-diligence Customer AdvisorAssigned --version 1` | US2.04 | customer-due-diligence | done |
| US2.18 | customer-due-diligence | contract | Answers to credit-application the name and birth date of an identified customer | implement `CustomerIdentityContract` (`src/contexts/customer-due-diligence/published-language/customer-identity.contract.ts`) with an answer class in customer-due-diligence, bound in the platform by the conductor; undefined when the customer is not identified | US2.04 | customer-due-diligence | todo |

Serves: "Customers and due diligence" (rows 7 to 15: US2.04 to US2.15); close 4 (due diligence
event-sourced, US2.01); close 10 (every read of a customer file is audited, US2.16 with US14.03); close 3
and "no credit to an overdue customer" (US2.13 with US8.03); "Who sees what": compliance sees the due
diligence (US2.16 scope).

Notes:
- #US2.07: a possible match is reviewed by a compliance officer, never decided by the machine; the screening keeps the list version it was checked against.
- #US2.13: the payout gate reads it synchronously; refused when the customer is high risk without approval or when the refresh is overdue, with the reason.

## US3 Bank reference data

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US3.01 | credit-policy | skeleton | Product of the catalogue, with its score threshold | `aggregate credit-policy Product`; `domain-event credit-policy Product Defined`; `repository credit-policy Product --tenant-scoped` | | conductor | done |
| US3.02 | credit-policy | skeleton | Rate grid by product, risk class and duration | `aggregate credit-policy RateGrid`; `domain-event credit-policy RateGrid Published`; `repository credit-policy RateGrid --tenant-scoped` | | conductor | done |
| US3.03 | credit-policy | skeleton | Legal maximum rate by category, with its date of effect | `aggregate credit-policy LegalMaximumRate`; `domain-event credit-policy LegalMaximumRate Published`; `repository credit-policy LegalMaximumRate --tenant-scoped` | | conductor | done |
| US3.04 | credit-policy | skeleton | Delegation table of the bank | `aggregate credit-policy DelegationTable`; `domain-event credit-policy DelegationTable Published`; `repository credit-policy DelegationTable --tenant-scoped` | | conductor | done |
| US3.05 | credit-policy | skeleton | Residual income minimum per adult and per child | `aggregate credit-policy ResidualIncomeMinimum`; `domain-event credit-policy ResidualIncomeMinimum Published`; `repository credit-policy ResidualIncomeMinimum --tenant-scoped` | | conductor | done |
| US3.06 | credit-policy | slice | Define a product with its amounts, durations, fees, insurance and threshold | `command credit-policy DefineProduct --permission product.define --aggregate Product`; `route credit-policy DefineProduct --method POST --path /products --command` | US3.01 | credit-policy | done |
| US3.07 | credit-policy | slice | Publish a rate grid with its date of effect | `command credit-policy PublishRateGrid --permission rate-grid.publish --aggregate RateGrid`; `route credit-policy PublishRateGrid --method POST --path /rate-grids --command` | US3.02 | credit-policy | done |
| US3.08 | credit-policy | slice | Publish the legal maximum rate in force from a date | `command credit-policy PublishLegalMaximumRate --permission legal-maximum-rate.publish --aggregate LegalMaximumRate`; `route credit-policy PublishLegalMaximumRate --method POST --path /legal-maximum-rates --command` | US3.03 | credit-policy | done |
| US3.09 | credit-policy | slice | Set the delegation table with its dates of effect | `command credit-policy SetDelegationTable --permission delegation-table.set --aggregate DelegationTable`; `route credit-policy SetDelegationTable --method PUT --path /delegation-table --command` | US3.04 | credit-policy | done |
| US3.10 | credit-policy | slice | Set the residual income minimum | `command credit-policy SetResidualIncomeMinimum --permission residual-income-minimum.set --aggregate ResidualIncomeMinimum`; `route credit-policy SetResidualIncomeMinimum --method PUT --path /residual-income-minimums --command` | US3.05 | credit-policy | done |
| US3.11 | credit-policy | slice | Catalogue of products, read by applicants | `query credit-policy ListProductCatalogue --public --search` | US3.06 | credit-policy | done |
| US3.12 | credit-policy | contract | Product defined, published | `integration-event credit-policy Product Defined --version 1` | US3.06 | conductor | done |
| US3.13 | credit-policy | contract | Legal maximum rate published | `integration-event credit-policy LegalMaximumRate Published --version 1` | US3.08 | conductor | done |
| US3.14 | credit-policy | contract | Rate grid published | `integration-event credit-policy RateGrid Published --version 1` | US3.07 | conductor | done |
| US3.15 | credit-policy | contract | Delegation table published | `integration-event credit-policy DelegationTable Published --version 1` | US3.09 | conductor | done |
| US3.17 | credit-policy | slice | Rate grid, legal maximum rate and delegation table published as version 2, with the product, the category, the levels and the date of effect | edit the domain events and the publishers of `rate-grid`, `legal-maximum-rate` and `delegation-table` to their version 2 contracts (no generator) | US3.13, US3.14, US3.15 | credit-policy | done |
| US3.16 | credit-policy | contract | Residual income minimum published | `integration-event credit-policy ResidualIncomeMinimum Published --version 1` | US3.10 | conductor | done |

Serves: "Applications" (the catalogue, row 16: US3.06, US3.11, US3.12); "Decision" (the delegation table,
US3.04, US3.09, US3.15); "Assessment" (the residual income minimum, US3.05, US3.10, US3.16); "Price and
offer" (rate grid and legal maximum rate, US3.02, US3.03, US3.07, US3.08, US3.13, US3.14); close 5 (the
maximum in force that day, US3.08 and US3.13); "The maximum rates, the rate grids, the delegation limits
and the residual income minimums are data of the bank with dates of effect" (every row of this story).

## US4 Brokers

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US4.01 | brokerage | skeleton | Broker, with its registration events | `aggregate brokerage Broker`; `domain-event brokerage Broker Registered`; `domain-event brokerage Broker RegistrationLapsed`; `repository brokerage Broker --tenant-scoped` | | conductor | done |
| US4.02 | brokerage | skeleton | Intermediaries register (port and fake adapter) | `port brokerage IntermediariesRegister`; `adapter brokerage IntermediariesRegister --kind external` | | conductor | done |
| US4.03 | brokerage | slice | Register a broker with the intermediaries register | `command brokerage RegisterBroker --permission broker.register --aggregate Broker`; `route brokerage RegisterBroker --method POST --path /brokers --command` | US4.01 | brokerage | done |
| US4.04 | brokerage | slice | Check the registrations each day; a lapsed one is marked | `command brokerage CheckRegistration --permission broker.check --aggregate Broker`; `job brokerage CheckRegistration --cron "0 6 * * *" --time-zone Europe/Paris --command CheckRegistration` | US4.02, US4.03 | brokerage | done |
| US4.05 | brokerage | contract | Broker registered and registration lapsed, published | `integration-event brokerage Broker Registered --version 1`; `integration-event brokerage Broker RegistrationLapsed --version 1` | US4.04 | conductor | todo |

Serves: "Brokers" (rows 5, 6: US4.03, US4.04; row 17 through US6.12 and US6.13); "A broker whose registration
lapsed can no longer bring one" (US6.12 refused on the day, with the projection of US6.13).

## US5 Score

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US5.01 | credit-scoring | skeleton | Scoring model, versioned | `aggregate credit-scoring ScoringModel`; `domain-event credit-scoring ScoringModel Published`; `repository credit-scoring ScoringModel --tenant-scoped` | | conductor | done |
| US5.02 | credit-scoring | slice | Publish a version of the model by model risk | `command credit-scoring PublishScoringModelVersion --permission scoring-model.publish --aggregate ScoringModel`; `route credit-scoring PublishScoringModelVersion --method POST --path /scoring-models --command` | US5.01 | credit-scoring | done |
| US5.03 | credit-scoring | slice | Score an applicant with the factors in words, and the band | `domain-service credit-scoring ScoreApplicant`; `vocabulary credit-scoring Band --value green --value amber --value red` | US5.02 | credit-scoring | todo |
| US5.04 | credit-scoring | contract | Read contract: score, model version, inputs and factors | `query credit-scoring ScoreApplicant --permission score.compute` | US5.03 | conductor | todo |

Serves: "Assessment" (the internal score, the version, the factors, US5.02, US5.03, US5.04); "Decision" (the
advisor limit applies to the best band, US5.03); "Retention and personal data" (the scoring model is
the subject of the impact assessment, US13.08).

## US6 File, documents and assessment

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US6.01 | credit-application | skeleton | Repayment incident register (port, fake adapter, anti-corruption layer) | `port credit-application RepaymentIncidentRegister --module assessment`; `adapter credit-application RepaymentIncidentRegister --kind external --module assessment`; `acl credit-application RepaymentIncidentRegister --module assessment` | | conductor | done |
| US6.02 | credit-application | skeleton | Account information provider (port, fake adapter, anti-corruption layer) | `port credit-application AccountInformationProvider --module assessment`; `adapter credit-application AccountInformationProvider --kind external --module assessment`; `acl credit-application AccountInformationProvider --module assessment` | | conductor | done |
| US6.03 | credit-application | skeleton | Gateway to credit-scoring: the score read by the assessment | `gateway credit-application credit-scoring ScoringGateway --module assessment` | US5.04 | conductor | todo |
| US6.04 | credit-application | slice | Attach a document (payslip, tax notice, statement) to the file, stored in the object store | `file-upload credit-application AttachDocument --path /applications/:id/documents --permission application.attach-document --module file`; `command credit-application AttachDocument --permission application.attach-document --aggregate CreditApplication --module file` | US0.04, US0.02 | credit-application | done |
| US6.05 | credit-application | slice | Read a document back | `query credit-application ReadDocument --permission application.read --module file` | US6.04 | credit-application | todo |
| US6.06 | credit-application | slice | Give the consent to read the accounts (expires after 90 days) | `entity credit-application AccountConsent --module file`; `command credit-application GiveAccountConsent --permission application.consent --aggregate CreditApplication --module file`; `route credit-application GiveAccountConsent --method POST --path /applications/:id/consent --command --module file` | US0.01 | credit-application | done |
| US6.07 | credit-application | slice | Read the income and expenses from the accounts, kept as a document of the application | `command credit-application ReadAccountInformation --permission application.read-accounts --aggregate CreditApplication --module assessment` | US6.02, US6.06 | credit-application | done |
| US6.08 | credit-application | slice | Consult the repayment incident register for the borrower and co-borrower | `command credit-application ConsultRepaymentIncidentRegister --permission application.consult-register --aggregate CreditApplication --module assessment` | US6.01, US2.18 | credit-application | done |
| US6.09 | credit-application | slice | Debt to income ratio and residual income, pure rules | `domain-service credit-application DebtToIncomeRatio --module assessment`; `domain-service credit-application ResidualIncome --module assessment` | US0.01 | credit-application | done |
| US6.10 | credit-application | slice | Assess the application: ratios, register, score with its version and factors; proposes approve or refuse | `command credit-application AssessApplication --permission application.assess --aggregate CreditApplication --module assessment`; `route credit-application AssessApplication --method POST --path /applications/:id/assessment --command --module assessment` | US6.03, US6.07, US6.08, US6.09 | credit-application | todo |
| US6.11 | credit-application | slice | A proposed refusal is reviewed by a person | `command credit-application ReviewProposedRefusal --permission application.review-refusal --aggregate CreditApplication --module assessment` | US6.10 | credit-application | todo |
| US6.12 | credit-application | slice | A broker brings an application | `command credit-application BringApplication --permission application.bring --aggregate CreditApplication --module file`; `route credit-application BringApplication --method POST --path /applications/bring --command --module file` | US0.04, US6.13 | credit-application | todo |
| US6.13 | credit-application | slice | Broker registration projection, fed by the brokerage events | `integration-handler credit-application brokerage brokerage.broker.registered --name KeepBrokerRegistration --module file`; `integration-handler credit-application brokerage brokerage.broker.registration-lapsed --name KeepBrokerRegistration --module file` | US4.05 | credit-application | todo |
| US6.14 | credit-application | slice | Name a co-borrower on the application | `command credit-application NameCoBorrower --permission application.name-party --aggregate CreditApplication --module file`; `route credit-application NameCoBorrower --method POST --path /applications/:id/co-borrowers --command --module file` | US0.04 | credit-application | done |
| US6.15 | credit-application | slice | Name a guarantor on the application | `command credit-application NameGuarantor --permission application.name-party --aggregate CreditApplication --module file`; `route credit-application NameGuarantor --method POST --path /applications/:id/guarantors --command --module file` | US0.04 | credit-application | done |
| US6.16 | credit-application | slice | Correct an entry of the file by a later entry that says what it corrects and why | `command credit-application CorrectEntry --permission application.correct --aggregate CreditApplication --module file`; `route credit-application CorrectEntry --method POST --path /applications/:id/corrections --command --module file` | US0.04 | credit-application | done |
| US6.17 | credit-application | slice | Assessed event, version 2 with its upcaster (the factors join the stored event) | `domain-event credit-application CreditApplication Assessed --module assessment` adapted to version 2, with its upcaster; `docs --stored-events` once the shape is final | US6.10 | credit-application | todo |
| US6.18 | credit-application | slice | List the applications, narrowed by the access scope of the caller | `query credit-application ListApplications --permission application.read --search --module file` | US0.02, US1.07 | credit-application | done |
| US6.19 | credit-application | contract | Product terms, projected from the product defined by credit-policy | `integration-handler credit-application credit-policy credit-policy.product.defined --name KeepProductTerms --module file` | US3.12 | credit-application | todo |
| US6.20 | credit-application | slice | An application is checked against its product when submitted (amount, duration) | `event-handler credit-application CreditApplication Submitted --name CheckRequestAgainstProduct --module file` | US6.19, US0.05 | credit-application | todo |

Serves: "Applications" (rows 16 to 18: US0.04, US6.04, US6.20; co-borrower and guarantor: US6.14, US6.15);
"Customers and due diligence" through the applicant and the customer (US0.04 with US2.04); "Who sees
what": a broker sees what they brought (US6.12), a co-borrower sees the application they are part of
(US6.18), a customer sees their own (US6.18); "Applications" consent and accounts (rows 19, 20: US6.06,
US6.07); "Assessment" (rows 21, 22, 23: US6.08, US6.09, US6.10, US6.11); close 12 (documents uploaded and
read back, US6.04, US6.05); close 4 ("what the decider had in front of them": the stored events and the
file, US6.16, US6.17); "The file is never edited" (US6.16).

Notes:
- #US6.10: records the model version, the inputs, the score and the factors that pushed the score down, in words a customer understands; proposes only, the refusal goes through US6.11.
- #US6.12: refused when the broker's registration lapsed on the day, read from the projection of US6.13; a broker sees only the applications they brought.
- #US6.17: adapts the specs of the assessment and of the stored event; the stored shape changes only by a new version with its upcaster (`event-sourcing/upcaster-required`).

## US7 Decision

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US7.01 | credit-application | slice | Delegation table kept as a projection of credit-policy | `integration-handler credit-application credit-policy credit-policy.delegation-table.published --name KeepDelegationTable --module decision` | US3.15, US3.17 | credit-application | todo |
| US7.02 | credit-application | slice | Level of each member of staff, projected from the appointments | `integration-handler credit-application branch-network branch-network.staff-member.appointed --name KeepDeciderLevel --module decision` | US1.11, US1.15 | credit-application | todo |
| US7.03 | credit-application | slice | Declared conflicts, projected from branch-network | `integration-handler credit-application branch-network branch-network.conflict-of-interest.declared --name KeepDeclaredConflicts --module decision` | US1.10 | credit-application | done |
| US7.04 | credit-application | slice | Decide: approve, approve with conditions, or refuse with reasons, within the decider's limit | `domain-event credit-application CreditApplication Decided --module decision`; `vocabulary credit-application DecisionOutcome --value approve --value approve-with-conditions --value refuse --module decision`; `command credit-application DecideApplication --permission application.decide --aggregate CreditApplication --module decision`; `route credit-application DecideApplication --method POST --path /applications/:id/decision --command --module decision` | US6.11, US7.01, US7.02 | credit-application | todo |
| US7.05 | credit-application | slice | Refused above the decider's limit with the level it needs; the preparer never decides | `error credit-application DecisionAboveLimit forAboveLimit --code DECISION_ABOVE_LIMIT --module decision`; `error credit-application PreparerCannotDecide forPreparerCannotDecide --code PREPARER_CANNOT_DECIDE --module decision` | US7.04 | credit-application | todo |
| US7.06 | credit-application | slice | A decider with a declared conflict on the applicant is refused | `error credit-application ConflictedDecider forConflictedDecider --code CONFLICTED_DECIDER --module decision` | US7.03, US7.04 | credit-application | todo |
| US7.07 | credit-application | slice | Request an exception, with its written justification, to the level above | `command credit-application RequestException --permission application.request-exception --aggregate CreditApplication --module decision`; `route credit-application RequestException --method POST --path /applications/:id/exceptions --command --module decision` | US7.04 | credit-application | todo |
| US7.08 | credit-application | slice | The credit committee decides an exception | `command credit-application DecideException --permission exception.decide --aggregate CreditApplication --module decision` | US7.07 | credit-application | todo |
| US7.09 | credit-application | slice | Applicant asks for a human review | `command credit-application RequestHumanReview --permission application.request-review --aggregate CreditApplication --module decision` | US7.04 | credit-application | todo |
| US7.10 | credit-application | slice | Applicant contests a decision, which goes to a person | `command credit-application ContestDecision --permission application.contest --aggregate CreditApplication --module decision` | US7.09 | credit-application | todo |
| US7.11 | credit-application | slice | Decide a rescheduling under the delegation rules of a credit | `domain-event credit-application CreditApplication RescheduleDecided --module decision`; `command credit-application DecideRescheduling --permission application.reschedule --aggregate CreditApplication --module decision` | US7.05 | credit-application | todo |
| US7.12 | credit-application | contract | Decided, published with the outcome, the exception flag and the branch | `integration-event credit-application CreditApplication Decided --version 1 --module decision` | US7.04 | conductor | todo |
| US7.13 | credit-application | slice | Show what the decider saw when they decided | `query credit-application ShowDecisionView --permission application.decide --module decision` | US7.04 | credit-application | todo |
| US7.14 | credit-application | contract | Rescheduling decided, published for servicing | `integration-event credit-application CreditApplication RescheduleDecided --version 1 --module decision` | US7.11 | conductor | todo |

Serves: "Decision" (rows 26 to 28: US7.04, US7.05, US7.07, US7.08); "Who may decide" (US7.01, US7.02, US7.05 for
the table); "The person who prepared never decides" (US7.05); conflicts (US7.03, US7.06); rows 24 and 25
(US7.09, US7.10); row 37 (US7.11, US7.14); "Who sees what": the credit committee sees what is put before
it (US7.13); close 3 (a spec per level and per exception, four eyes, refusal above the limit with the level
it needs: US7.04, US7.05, US7.08); close 4 (a decision shown with exactly what the decider saw: US7.13).

Notes:
- #US7.05: an amount above the decider's limit is refused with the level it needs; four eyes: the preparer of the file never decides it.
- #US7.06: a conflicted person (staff who declared a link with the applicant) neither prepares nor decides; the explanation of US14.04 applies.
- #US7.11: rescheduling decided like a credit (same table, same four eyes); the rules of change are an open question (see plan.md, Decisions).

## US8 Offer, withdrawal and payout (the story of close line 14)

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US8.01 | credit-application | skeleton | Offer, the proposal of a loan valid 15 days | `aggregate credit-application Offer --module offer`; `repository credit-application Offer --tenant-scoped --module offer` | US0.01 | conductor | done |
| US8.02 | credit-application | skeleton | Electronic signature (port and fake adapter) | `port credit-application ElectronicSignature --module offer`; `adapter credit-application ElectronicSignature --kind external --module offer` | | conductor | done |
| US8.03 | credit-application | skeleton | Gateway to due diligence: eligibility read for the payout gate | `gateway credit-application customer-due-diligence CustomerDiligence --module offer` | US2.13 | conductor | todo |
| US8.04 | credit-application | slice | Annual percentage rate by the actuarial formula, proven against the worked examples of the directive | `value-object credit-application AnnualPercentageRate --module offer`; `domain-service credit-application ActuarialFormula --module offer` | US0.01 | credit-application | done |
| US8.05 | credit-application | slice | Deliver the standard pre-contractual sheet before the offer | `command credit-application DeliverPreContractualSheet --permission offer.deliver-sheet --aggregate Offer --module offer` | US8.01 | credit-application | todo |
| US8.06 | credit-application | slice | Rate grid projection, fed by credit-policy | `integration-handler credit-application credit-policy credit-policy.rate-grid.published --name KeepRateGrid --module offer` | US3.14, US3.17 | credit-application | todo |
| US8.07 | credit-application | slice | Legal maximum rate projection, by date of effect | `integration-handler credit-application credit-policy credit-policy.legal-maximum-rate.published --name KeepLegalMaximumRate --module offer` | US3.13, US3.17 | credit-application | todo |
| US8.08 | credit-application | slice | Issue the offer, refused at or above the legal maximum in force that day | `command credit-application IssueOffer --permission offer.issue --aggregate Offer --module offer`; `error credit-application OfferAboveLegalMaximum forAboveLegalMaximum --code OFFER_ABOVE_LEGAL_MAXIMUM --module offer`; `route credit-application IssueOffer --method POST --path /applications/:id/offer --command --module offer` | US8.01, US8.04, US8.05, US8.06, US8.07, US7.04 | credit-application | todo |
| US8.09 | credit-application | slice | Accept the offer by electronic signature, within 15 days | `command credit-application AcceptOffer --permission offer.accept --aggregate Offer --module offer`; `route credit-application AcceptOffer --method POST --path /offers/:id/acceptance --command --module offer` | US8.08, US8.02 | credit-application | todo |
| US8.10 | credit-application | slice | Withdraw within 14 calendar days of signing, without a reason | `domain-event credit-application CreditApplication Withdrawn --module offer`; `command credit-application WithdrawLoan --permission application.withdraw --aggregate CreditApplication --module offer`; `route credit-application WithdrawLoan --method POST --path /applications/:id/withdrawal --command --module offer` | US8.09 | credit-application | todo |
| US8.11 | credit-application | contract | Withdrawn, published for servicing (repayment after a payout) | `integration-event credit-application CreditApplication Withdrawn --version 1 --module offer` | US8.10 | conductor | todo |
| US8.12 | credit-application | slice | Authorise the payout: no payout before the 8th day after signing, not after a withdrawal, only if eligible | `domain-event credit-application CreditApplication PayoutAuthorised --module offer`; `command credit-application AuthorizePayout --permission application.authorise-payout --aggregate CreditApplication --module offer`; `error credit-application PayoutTooEarly forEarlyPayout --code PAYOUT_TOO_EARLY --module offer` | US8.09, US8.03 | credit-application | todo |
| US8.13 | credit-application | contract | Payout authorised, published (servicing opens the loan) | `integration-event credit-application CreditApplication PayoutAuthorised --version 1 --module offer` | US8.12 | conductor | todo |

Serves: "Price and offer" (rows 29 to 31: US8.04, US8.05, US8.08, US8.09); close 5 (APR by the actuarial
formula with the worked examples, and an offer at or above the legal maximum refused with the maximum in
force that day: US8.04, US8.08); close 6 (withdrawal period and no payout before the 8th day with a fake
clock: US8.09, US8.10, US8.12); row 32 (US8.10, US8.11); row 33 (US8.13, US9.05); "Who sees what": the
customer's own offer through the portal (US8.09 scope).

Notes:
- #US8.04: amounts in whole cents (US0.06); the rate has its precision stated; the formula is proven by the worked examples of the directive in the spec.
- #US8.08: the pre-contractual sheet goes out first (US8.05); refused at or above the legal maximum in force that day, with that maximum in the refusal.
- #US8.12: a fake clock in the spec; the 8th day counts from the signing; a withdrawn application is not paid out; the eligibility read of US8.03 is synchronous, so no credit is disbursed to an overdue or unapproved high risk customer.

## US9 Loan ledger (service servicing)

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US9.01 | servicing | skeleton | Servicing as its own service, with its standalone entry point and boot test | `service servicing` | | conductor | done |
| US9.02 | servicing | skeleton | Loan, event-sourced, born paid out | `aggregate servicing Loan --event-sourced --birth PaidOut --module ledger` | US9.01 | conductor | done |
| US9.03 | servicing | skeleton | Payment provider for direct debits (port, fake adapter, anti-corruption layer) | `port servicing PaymentProvider --module instalments`; `adapter servicing PaymentProvider --kind external --module instalments`; `acl servicing PaymentProvider --module instalments` | | conductor | done |
| US9.04 | servicing | slice | Schedule of constant monthly instalments, in cents | `domain-service servicing InstalmentSchedule --module ledger` | US9.02, US0.06 | servicing | done |
| US9.05 | servicing | slice | On payout, record the payout and set the schedule | `integration-handler servicing credit-application credit-application.credit-application.payout-authorised --name RecordPayoutOnPayoutAuthorised --module ledger`; `command servicing RecordPayout --permission loan.record-payout --aggregate Loan --module ledger` | US9.02, US9.04, US8.13 | servicing | todo |
| US9.06 | servicing | slice | Compute the instalments due each night, per bank | `domain-event servicing Loan InstalmentDue --module instalments`; `command servicing ComputeDueInstalments --permission loan.compute-due --aggregate Loan --module instalments`; `job servicing ComputeDueInstalments --cron "0 1 * * *" --time-zone Europe/Paris --command ComputeDueInstalments --module instalments` | US9.05 | servicing | todo |
| US9.07 | servicing | slice | Collect each due instalment by direct debit; a rejected debit makes it unpaid | `domain-event servicing Loan PaymentReceived --module instalments`; `command servicing CollectInstalment --permission loan.collect --aggregate Loan --module instalments`; `event-handler servicing Loan InstalmentDue --name CollectDueInstalment --module instalments` | US9.03, US9.06 | servicing | todo |
| US9.08 | servicing | contract | Payment received, published (financial crime watches it) | `integration-event servicing Loan PaymentReceived --version 1 --module instalments` | US9.07 | conductor | todo |
| US9.09 | servicing | contract | Loan paid out, published (reporting) | `integration-event servicing Loan PaidOut --version 1 --module ledger` | US9.05 | conductor | todo |
| US9.10 | servicing | slice | Late fee, capped by the law | `command servicing ChargeLateFee --permission loan.charge-fee --aggregate Loan --module ledger` | US9.07 | servicing | todo |
| US9.11 | servicing | slice | Early repayment, with its fee (1 percent with more than a year left, 0.5 percent otherwise) | `command servicing RepayEarly --permission loan.repay-early --aggregate Loan --module ledger`; `domain-service servicing EarlyRepaymentFee --module ledger`; `route servicing RepayEarly --method POST --path /loans/:id/early-repayments --command --module ledger` | US9.05 | servicing | todo |
| US9.12 | servicing | slice | Execute a rescheduling decided by credit-application | `integration-handler servicing credit-application credit-application.credit-application.reschedule-decided --name RescheduleOnDecision --module ledger`; `command servicing RescheduleLoan --permission loan.reschedule --aggregate Loan --module ledger` | US7.14, US9.05 | servicing | todo |
| US9.13 | servicing | slice | Write off a loan, with an entry of opposite effect for any error | `command servicing WriteOffLoan --permission loan.write-off --aggregate Loan --module ledger` | US9.05 | servicing | todo |
| US9.14 | servicing | slice | After a withdrawal following a payout, the borrower repays capital and interest accrued | `integration-handler servicing credit-application credit-application.credit-application.withdrawn --name RepayWithdrawnLoan --module ledger`; `command servicing RecordWithdrawalRepayment --permission loan.record-repayment --aggregate Loan --module ledger` | US8.11, US9.05 | servicing | todo |
| US9.15 | servicing | slice | Balance, arrears and schedule of a loan as of a past date, by replay | `query servicing GetLoanStatement --permission loan.read --module ledger` | US9.05 | servicing | todo |
| US9.16 | servicing | slice | Snapshot policy on Loan, proven equivalent to the replay | snapshot policy of `Loan` in its repository (event-sourcing); spec with `expectSnapshotEquivalence` | US9.05 | servicing | todo |

Serves: "Loans" (rows 33 to 37: US9.04, US9.05, US9.07, US9.11, US9.12); rows 38 and 39 (US9.13, US9.10); row
32 (US9.14); "Running" (rows 34, the nightly computation: US9.01, US9.06; servicing keeps running while the API
is stopped: US9.07, US15.03); close 4 (the balance as of a past date US9.15; the snapshot policy US9.16); close 6
(early repayment fees US9.11; rescheduling US9.12); close 9 (its own service and boot test US9.01; collects while
the API is stopped US9.07, US15.03).

Notes:
- #US9.06: nightly per bank, from the schedule of each loan; the job runs without the API.
- #US9.07: direct debit through the payment provider; a rejected debit makes the instalment unpaid; no retry (see plan.md, Decisions).
- #US9.11: fee at most 1 percent of the amount repaid when more than a year remains, 0.5 percent otherwise.
- #US9.15: replayed from the event store; no balance is stored as an edited value.

## US10 Arrears, register and default

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US10.01 | servicing | skeleton | Mail and text messages to the borrower (port and fake adapter) | `port servicing BorrowerNotifier --module arrears`; `adapter servicing BorrowerNotifier --kind external --module arrears` | | conductor | done |
| US10.02 | servicing | skeleton | National register of repayment incidents, servicing side (port, fake adapter, anti-corruption layer) | `port servicing RepaymentIncidentRegister --module arrears`; `adapter servicing RepaymentIncidentRegister --kind external --module arrears`; `acl servicing RepaymentIncidentRegister --module arrears` | | conductor | done |
| US10.03 | servicing | slice | Classify each loan into its arrears bucket each day | `domain-event servicing Loan ArrearsBucketEntered --module arrears`; `command servicing ClassifyArrears --permission loan.classify-arrears --aggregate Loan --module arrears`; `job servicing ClassifyArrears --cron "0 2 * * *" --time-zone Europe/Paris --command ClassifyArrears --module arrears` | US9.06, US9.07 | servicing | todo |
| US10.04 | servicing | slice | Notify the borrower by mail and text message at each stage | `event-handler servicing Loan ArrearsBucketEntered --name NotifyBorrowerAtEachStage --module arrears` | US10.01, US10.03 | servicing | todo |
| US10.05 | servicing | slice | Declare to the register after two consecutive unpaid instalments | `command servicing DeclareRepaymentIncident --permission loan.declare-incident --aggregate Loan --module arrears` | US10.02, US10.03, US9.07 | servicing | todo |
| US10.06 | servicing | slice | Withdraw the declaration when the arrears are paid | `command servicing WithdrawRepaymentIncident --permission loan.withdraw-incident --aggregate Loan --module arrears`; `domain-event servicing Loan ArrearsCleared --module arrears`; `event-handler servicing Loan ArrearsCleared --name WithdrawIncidentWhenPaid --module arrears` | US10.05 | servicing | todo |
| US10.07 | servicing | slice | Default at 90 days, handed to collections | `domain-event servicing Loan Defaulted --module arrears`; `domain-event servicing Loan Defaulted --module arrears`; `command servicing DeclareDefault --permission loan.declare-default --aggregate Loan --module arrears`; `job servicing DeclareDefault --cron "0 2 * * *" --time-zone Europe/Paris --command DeclareDefault --module arrears` | US10.03 | servicing | todo |
| US10.08 | servicing | contract | Arrears bucket entered and loan defaulted, published (reporting) | `integration-event servicing Loan ArrearsBucketEntered --version 1 --module arrears`; `integration-event servicing Loan Defaulted --version 1 --module arrears` | US10.07 | conductor | todo |
| US10.09 | servicing | slice | Portfolio at risk, fed by the event store, rebuilt from zero in a spec | `projection servicing PortfolioAtRisk servicing.loan.arrears-bucket-entered --term "Portfolio at risk=the share of the outstanding amount 30 and 90 days past due" --module arrears` | US10.03, US9.05 | servicing | todo |

Serves: "Arrears and collections" (rows 40 to 42: US10.03, US10.04, US10.05, US10.07); close 7 (buckets US10.03,
declaration and its withdrawal US10.05, US10.06, default at 90 days US10.07, each by a job per bank); close 4
(one projection rebuilt from zero: US10.09); reports (portfolio at risk, US10.09 with US12.03).

Notes:
- #US10.05: declared after two consecutive unpaid instalments of a consumer loan; withdrawn when the arrears are paid (US10.06).
- #US10.07: default at 90 days; handed to collections; the notice goes out at each stage (US10.04).

## US11 Money laundering (financial crime, compliance only)

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US11.01 | financial-crime | skeleton | Alert on a repayment | `aggregate financial-crime Alert`; `domain-event financial-crime Alert Raised`; `repository financial-crime Alert --tenant-scoped` | | conductor | done |
| US11.02 | financial-crime | skeleton | Suspicious activity report, restricted to compliance | `aggregate financial-crime SuspiciousActivityReport`; `domain-event financial-crime SuspiciousActivityReport Filed`; `repository financial-crime SuspiciousActivityReport --tenant-scoped` | | conductor | done |
| US11.03 | financial-crime | skeleton | Financial intelligence unit (port and fake adapter) | `port financial-crime FinancialIntelligenceUnit`; `adapter financial-crime FinancialIntelligenceUnit --kind external` | | conductor | done |
| US11.04 | financial-crime | slice | Raise an alert: early repayment above 10,000 within a year of the payout, or a payment from an account not the borrower's | `command financial-crime RaiseAlert --permission alert.raise --aggregate Alert`; `domain-service financial-crime AlertRule` | US11.01 | financial-crime | done |
| US11.05 | financial-crime | slice | Watch the repayments of servicing | `integration-handler financial-crime servicing servicing.loan.payment-received --name WatchRepayments` | US9.08, US11.04 | financial-crime | todo |
| US11.06 | financial-crime | slice | Compliance closes an alert with a reason | `command financial-crime CloseAlert --permission alert.close --aggregate Alert`; `route financial-crime CloseAlert --method POST --path /alerts/:id/closure --command` | US11.04 | financial-crime | done |
| US11.07 | financial-crime | slice | Compliance files a suspicious activity report with the financial intelligence unit; pending while it is down | `command financial-crime FileSuspiciousActivityReport --permission report.file --aggregate SuspiciousActivityReport`; `route financial-crime FileSuspiciousActivityReport --method POST --path /alerts/:id/reports --command` | US11.02, US11.03, US11.04 | financial-crime | done |
| US11.08 | financial-crime | slice | Alerts and reports seen by compliance only; a spec for the screen, the error and the search | `query financial-crime ListAlerts --permission alert.read --search`; `query financial-crime GetSuspiciousActivityReport --permission report.read`; `e2e financial-crime ListAlerts` | US11.06, US11.07 | financial-crime | done |

Serves: "Money laundering" (rows 43 to 45: US11.04, US11.05, US11.06, US11.07); "Who sees what" (compliance
sees the alerts; nobody else, US11.08); close 8 (the suspicious activity report invisible outside compliance:
a spec for each way it could leak, a screen, an error, a search in US11.08, the audit search in US14.03; the
audit stream restricted in US14.02).

Notes:
- #US11.04: the rule of the "payment from another account" is the most protective reading until the owner defines the matching (see plan.md, Decisions): a payer account not on the file as the borrower's raises an alert.
- #US11.08: no outbound arrow: financial-crime publishes nothing.

## US12 Reports

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US12.01 | reporting | slice | Applications per branch, count and amount | `projection reporting ApplicationCount credit-application.credit-application.submitted --term "Application count=the number of applications of a branch in a month"` | US0.05, US0.08 | reporting | done |
| US12.02 | reporting | slice | Decisions per branch: approval rate and share of exceptions | `projection reporting Decision credit-application.credit-application.decided` | US7.12 | reporting | todo |
| US12.03 | reporting | slice | Portfolio at risk per branch, from the arrears buckets | `projection reporting PortfolioAtRisk servicing.loan.arrears-bucket-entered` | US10.08 | reporting | todo |
| US12.04 | reporting | slice | Loans in default, for the supervisor | `projection reporting DefaultedLoan servicing.loan.defaulted` | US10.08 | reporting | todo |
| US12.05 | reporting | slice | Monthly report per branch | `query reporting MonthlyReport --permission report.monthly --search` | US12.01, US12.02, US12.03 | reporting | todo |
| US12.06 | reporting | slice | Monthly report as CSV | `representation reporting MonthlyReport csv` | US12.05 | reporting | todo |
| US12.07 | reporting | slice | Defaults list as CSV | `query reporting DefaultsList --permission report.defaults`; `representation reporting DefaultsList csv` | US12.04 | reporting | todo |

Serves: "Reports" (row 46: US12.01, US12.02, US12.03, US12.05, US12.06; row 47: US12.04, US12.07); close 13 (CSV
of the monthly report and the defaults list: US12.06, US12.07).

Notes:
- #US12.02: approval rate and share of exceptions use the definitions of plan.md, Decisions (provisional until the owner confirms the numerator and the denominator).

## US13 Retention and personal data

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US13.01 | data-protection | skeleton | Retention period by context and by kind of data | `aggregate data-protection RetentionPeriod`; `repository data-protection RetentionPeriod --tenant-scoped` | | conductor | done |
| US13.02 | data-protection | skeleton | Copy of a customer's data: the process that gathers each context's data | `process data-protection CopyOfData` | | conductor | done |
| US13.03 | data-protection | slice | A customer asks for a copy of all we keep about them | `command data-protection RequestCopyOfData --permission data-subject.request-copy`; `route data-protection RequestCopyOfData --method POST --path /data-subjects/me/copies --command` | US13.02 | data-protection | done |
| US13.04 | data-protection | slice | Erase personal data after retention (due diligence 5 years after the relationship, loan 10 years after closing, refused application 6 months) | `command data-protection ErasePersonalDataPastRetention --permission data.erase --aggregate RetentionPeriod`; `job data-protection ErasePersonalDataPastRetention --cron "0 3 * * *" --time-zone Europe/Paris --command ErasePersonalDataPastRetention` | US13.01 | data-protection | done |
| US13.05 | customer-due-diligence | slice | Customer's personal data sealed and shredded after retention, in the event store | `erasure-handler customer-due-diligence` | US13.04, US2.01 | customer-due-diligence | todo |
| US13.06 | credit-application | slice | Refused application's personal data erased after six months | `erasure-handler credit-application --module file` | US13.04, US0.01 | credit-application | todo |
| US13.07 | servicing | slice | Loan's personal data sealed and shredded ten years after closing | `erasure-handler servicing --module ledger` | US13.04, US9.02 | servicing | todo |
| US13.08 | credit-scoring | slice | Impact assessment of the scoring model, recorded by staff each month | `command data-protection RecordScoringImpactAssessment --permission impact-assessment.record` | US5.01 | data-protection | todo |
| US13.09 | data-protection | skeleton | Privacy register and impact assessment filled (docs/privacy/register.md, TODO(domain) lines 27, 31, 35) | edit `docs/privacy/register.md` (no generator): lawful basis per context, processors and transfers, retention of backups, logs and archives | US13.08 | conductor | todo |

Serves: "Retention and personal data" (rows 48, 49, 51: US13.03, US13.04, US13.08); close 11 (the privacy register
and the impact assessment of the scoring filled: US13.08, US13.09; export of a customer: US13.02, US13.03;
erasure after retention with the event-sourced data sealed and shredded: US13.04 to US13.07).

Notes:
- #US13.05: event-sourced personal data is sealed and shredded, never edited (the retention rule of the discovery).
- #US13.03: the copy covers each context's data, gathered by the process of US13.02.

## US14 Audit and access

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US14.01 | platform | skeleton | Audit: what goes into the entries of changes (fields declared), every command audited by default | edit `src/platform/audit/create-audit.ts` (TODO(platform) line 62): `fields: [auditedFields(...)]` per command (no generator) | | conductor | done |
| US14.02 | platform | skeleton | Audit stream of financial crime, readable by compliance only | edit the audit streams of the platform (no generator): the stream of `financial-crime` with its readers = compliance | US14.01, US11.01 | conductor | in progress |
| US14.03 | platform | slice | The audit search returns the reads of customer files and the grants | route of the audit search in `src/platform/audit` (no generator), covered by an e2e per read of customer files | US14.01, US2.16 | conductor | todo |
| US14.04 | credit-application | slice | Explain a refusal to a broker or a conflicted advisor without disclosing the hidden content | `error credit-application ApplicationNotVisible forApplicationNotVisible --code APPLICATION_NOT_VISIBLE --module file`; `query credit-application ExplainRefusal --permission application.read --module file` | US6.18, US7.06 | credit-application | todo |
| US14.05 | identity | slice | Every grant of a right is audited (the delegation granted and revoked) | `e2e identity GrantDelegation` | | identity | done |
| US14.06 | platform | slice | Every command of every context writes an audit entry, spec per context | `e2e identity OpenOrganisation`; one e2e per context (`e2e <context> <UseCaseName>`) for each command of US2 to US12 | US14.01 | conductor | todo |

Serves: "Every change, decision, access to a customer file and grant of a right is audited" (US14.01, US14.03,
US14.05, US14.06); close 10 (every command audited, every read of a customer file audited and searchable:
US14.03, US14.06); close 2 (the explanation of a refusal for a broker and for a conflicted advisor: US14.04);
close 8 (the audit stream of financial crime: US14.02, the audit search: US14.03).

Notes:
- #US14.04: the explanation names the rule ("not in your portfolio", "a declared conflict") without the content of the file, the register result, the score or any report.

## US15 Run and close

| # | Context | Kind | Slice | Start with | Depends on | Owner | Status |
|---|---|---|---|---|---|---|---|
| US15.01 | platform | slice | Contracts current: OpenAPI, AsyncAPI, SDK | `npm run regenerate` (after the contracts of US4.05, US5.04, US7.12, US7.14, US8.13, US9.08, US9.09, US10.08, US12.06) | US8.13, US9.08, US9.09, US10.08, US12.06, US12.07 | conductor | todo |
| US15.02 | platform | slice | Traceability matrix from each need to its stories and specs | edit `docs/compliance/traceability.md` (no generator) | US15.01, US14.06 | conductor | todo |
| US15.03 | platform | slice | A recorded real run with docker compose, a demo script from an application to a payout and a first instalment | `npm run infra:up`; `npm run dev`; the demo script under `scripts/` (no generator) | US9.07, US8.12, US15.01 | conductor | todo |
| US15.04 | platform | slice | One trace crossing the API and servicing | the correlation id carried through the outbox (platform, no generator); spec on the trace of the demo | US15.03, US9.01 | conductor | todo |
| US15.05 | platform | slice | Close: `ddd-ts-kit check` with zero finding, `npm run verify` green | `npx ddd-ts-kit check`; `npm run verify` | US15.02, US15.04 | conductor | todo |

Serves: close 1 (US15.05); close 13 (US15.01); close 15 (US15.03, US15.04); close 16 (US15.02); the story of
close 14 is US8.

## Coverage

Every need of `needs.md`, and every line of "What the owner checks at the close":

| Need or close line | Rows |
|---|---|
| Intro: banks never see each other's data | US1.01, US1.12, US6.18 |
| Banks, branches and staff | US1.02 to US1.13 |
| Customers and due diligence | US2.01 to US2.16 |
| Applications, documents, consent | US0.04, US0.05, US6.04 to US6.06, US6.12, US6.14 to US6.16, US6.18, US6.19, US6.20 |
| Assessment | US5.01 to US5.04, US6.01 to US6.03, US6.07 to US6.11, US6.13 |
| Decision | US3.04, US3.09, US3.15, US7.01 to US7.14 |
| Price and offer | US3.02, US3.03, US3.07, US3.08, US3.13, US3.14, US8.01 to US8.13 |
| Loans | US9.01 to US9.16 |
| Arrears and collections | US10.01 to US10.09 |
| Money laundering | US11.01 to US11.08 |
| Who sees what | US1.12, US1.13, US2.16, US6.18, US7.13, US8.09, US11.08, US12.05 |
| Reports | US12.01 to US12.07 |
| Retention and personal data | US13.01 to US13.09 |
| Running | US9.01, US9.06, US9.07, US15.03 |
| Audit | US14.01 to US14.06 |
| Close 1 | US15.05 |
| Close 2 | US0.02, US0.03, US1.09, US1.12, US6.14, US6.18, US7.06, US14.04 |
| Close 3 | US7.04, US7.05, US7.08 |
| Close 4 | US0.01, US2.01, US6.16, US6.17, US7.13, US9.15, US9.16, US10.09 |
| Close 5 | US3.08, US3.13, US8.04, US8.08 |
| Close 6 | US8.09, US8.10, US8.12, US9.11, US9.12 |
| Close 7 | US10.03 to US10.07 |
| Close 8 | US11.08, US14.02, US14.03 |
| Close 9 | US9.01, US9.07, US15.03 |
| Close 10 | US2.16, US14.03, US14.06 |
| Close 11 | US13.02 to US13.09 |
| Close 12 | US6.04, US6.05 |
| Close 13 | US12.06, US12.07, US15.01 |
| Close 14 | the story US8 (acceptance locked before its first row, step 7) |
| Close 15 | US15.03, US15.04 |
| Close 16 | US15.02 |
