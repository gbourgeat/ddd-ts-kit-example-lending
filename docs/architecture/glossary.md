# Ubiquitous language

Before the bootstrap: one section per context of `contexts.md`. The bootstrap turns each row
into a `--term` and deletes this file; after it, each context keeps its section in
`src/contexts/<context>/CONTEXT.md`, `## Ubiquitous language`. Not created yet (step 5).

Decided by the conductor under `owner-brief.md` ("conductor, owner brief"), to be confirmed
by the owner:

- One word per concept across contexts: the bank is the tenant, written **Bank**, which is
  the `Organisation` of the identity preset; the staff of a bank are **staff members**, not
  members (see the identity section); the score band of the scoring model is **risk rating**
  for the customer, never "risk class".
- A movement of a loan is a **movement**, never an "entry" (an entry is a fact of the
  application file).
- The account of a payer is a **payer account**; **Account** is the identity preset's word.
- The payout is the release of the loan's money; the approval to release is **payout
  authorisation**.

## credit-application

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

## credit-scoring

| Term | Meaning | Not to be confused with |
|---|---|---|
| Scoring model | The bank's versioned model that turns the inputs of an applicant into a score | Assessment |
| Model version | One published version of the scoring model; a score states its version | Model, in general |
| Input | A value the model uses for an applicant | Factor |
| Score | The number the model gives an applicant, for one version | Risk rating (customer) |
| Band | The range a score falls in; the best band is green | Risk rating |
| Green band | The best band of the model; the only band an advisor may decide with | Green score as a colour |
| Factor | An input that pushed the score down, stated in words a customer understands | Input |

## credit-policy

| Term | Meaning | Not to be confused with |
|---|---|---|
| Product | A loan product of the catalogue: personal loan, car loan or term loan, with its minimum and maximum amount and duration, its fees, and whether borrower insurance is mandatory | Application |
| Catalogue | The products the bank offers, each with its dates of effect | Product |
| Rate grid | The nominal rate of each product by risk rating and duration, with dates of effect | Annual percentage rate |
| Legal maximum rate | The highest annual rate for a category of loan, published each quarter; the one in force on the day of the offer applies | Rate grid |
| Delegation table | Which decider may decide by amount and by risk, with the exceptions | Delegation (identity): the granting of access |
| Delegation limit | The amount up to which a level may decide: advisor 15,000 with a green score, credit analyst 75,000, risk manager 250,000, credit committee above | Score threshold |
| Residual income minimum | The least amount a household keeps each month, per adult and per child | Residual income (assessment) |
| Score threshold | The lowest score a product accepts without an exception | Score |
| Dates of effect | The day from which a value applies | Publication date |
| Risk rating | Low, medium or high: the customer's class, which the rate grid is organised by | Score |

## customer-due-diligence

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

## branch-network

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

## brokerage

| Term | Meaning | Not to be confused with |
|---|---|---|
| Broker | An outside intermediary who brings applications; not a staff member | Advisor |
| Registration number | The number of a broker on the intermediaries register | Repayment incident register |
| Intermediaries register | The register of brokers | Repayment incident register (credit-application, servicing) |
| Registration valid on the day | The broker's registration is valid on the day the application is brought | Registration lapsed |
| Registration lapsed | The registration is no longer valid; the broker can no longer bring applications | Refusal |
| Bring | A broker's act of submitting an application to the bank | Assignment |

## servicing

| Term | Meaning | Not to be confused with |
|---|---|---|
| Loan | Money paid out, with its schedule, from payout until closed or written off | Application, Offer |
| Borrower | The person who owes the loan | Co-borrower: who shares it, both are borrowers of the loan |
| Payout | The release of a loan's money to the borrower; the ledger starts here | Payout authorisation (credit-application) |
| Schedule | The constant monthly instalments of a loan from its payout | Instalment |
| Instalment | One monthly amount due under the schedule | Payment |
| Instalment due | An instalment whose date has come | Unpaid instalment |
| Payment | Money received against an instalment | Instalment |
| Direct debit | The collection of an instalment from the payer account, through the payment provider | Payment |
| Rejected debit | A direct debit refused by the payer's bank; the instalment becomes unpaid | Unpaid instalment |
| Unpaid instalment | A due instalment that was not paid | Late fee |
| Movement | One entry of the loan ledger: payout, instalment, payment, fee, early repayment, rescheduling or write-off | Entry (application file) |
| Ledger | The loan's movements, never edited; an error is reversed by a movement of opposite effect | Application file |
| Balance | The amount still owed on a given date, past dates included | Outstanding amount (reporting) |
| Early repayment | A repayment, in part or in full, before the schedule ends; its fee is at most 1 percent when more than a year remains, 0.5 percent otherwise | Payment |
| Late fee | The fee for an unpaid instalment, capped by law | Early repayment fee |
| Arrears | The unpaid amount of a loan past its due dates | Default |
| Days past due | The days since the oldest unpaid instalment | Arrears |
| Arrears bucket | 1 to 30, 31 to 60, 61 to 90 or over 90 days past due | Default |
| Default | A loan 90 days past due, handed to collections | Arrears bucket |
| Collections | The handover of a defaulted loan, after 90 days | Default |
| Declaration | The report of a repayment incident to the repayment incident register, after two consecutive unpaid instalments; withdrawn when the arrears are paid | Repayment incident register (credit-application) |
| Write-off | The end of a loan whose amount is not recovered: a movement | Default |
| Rescheduling | The new schedule of a loan, executed after its approval in credit-application | Restructuring |
| Borrower notice | The mail or text message sent to a borrower at each arrears stage | Declaration |
| Daily run | The night computation of the instalments due, for each bank | Direct debit |

## financial-crime

| Term | Meaning | Not to be confused with |
|---|---|---|
| Alert | A flag on a repayment: an early repayment above 10,000 within a year of the payout, or a payment from a payer account that is not the borrower's | Possible match (screening) |
| Payer account | The bank account a payment came from | Account (identity): a person's login |
| Alert review | The compliance officer's review of an alert | Screening |
| Closed alert | An alert closed by compliance, with its reason | Filed report |
| Suspicious activity report | A report filed with the financial intelligence unit about an alert; known to compliance only | Alert |
| Filing | The act of filing a suspicious activity report | Declaration (servicing) |
| Financial intelligence unit | The public unit that receives suspicious activity reports | Supervisor (reporting) |

## reporting

| Term | Meaning | Not to be confused with |
|---|---|---|
| Monthly report | For each branch, for a month: applications, approval rate, share of exceptions, portfolio at risk | Defaults list |
| Application count | The number and amount of applications brought in the month | Approval rate |
| Approval rate | The share of applications approved in the month; the owner defines the exact count (open question) | Refusal rate |
| Share of exceptions | The share of decisions that are exceptions; the owner defines the count (open question) | Exception (credit-application) |
| Outstanding amount | The capital still owed on loans, on a date | Balance (servicing) |
| Portfolio at risk | The share of the outstanding amount of loans 30 days, or 90 days, past due | Arrears |
| Defaults list | The loans in default, for the supervisor, as CSV | Default (servicing) |
| Supervisor | The banking supervisor, who receives the defaults list | Financial intelligence unit |

## data-protection

| Term | Meaning | Not to be confused with |
|---|---|---|
| Data subject | The person the personal data are about | Customer: a role in the bank's relationship |
| Retention period | How long personal data are kept after the relevant end: due diligence five years after the relationship, a loan ten years after closing, a refused application six months | Schedule (servicing) |
| Erasure | The removal of personal data after their retention period; for event-sourced aggregates, the personal data of the events are destroyed | Ledger: never edited |
| Copy of data | The copy of all the bank keeps about a data subject, given on request | Application file |
| Processing register | The list of the processings of personal data and their purposes | Impact assessment |
| Impact assessment | The assessment of the scoring model, which processes personal data at scale and decides access to credit | Assessment (credit-application) |

## identity

Preset `identity` (kit). Its rows are copied word for word from the kit's
`identity-preset.md` (the glossary skill, next to it in the plugin); the third column gives
the neighbouring meaning of the same word.

| Term | Meaning | Not to be confused with |
|---|---|---|
| Account | A person as the application knows them, under the subject the identity provider gives them; provisioned at their first sign-in, never holding a password | Payer account (financial-crime), Consent (credit-application) |
| Subject | The stable identifier the identity provider gives a person: the id of their account | |
| Provision | Create the account of a person at their first sign-in, from what their token says, and refresh it after | |
| Deactivate | Stop an account from acting: its person signs in no more, its history stays | |
| Organisation | A group of accounts that work together, identified by its slug; the tenant of its data when the project has tenants | Bank (branch-network): the same tenant, named by the business |
| Slug | The identifier of an organisation, chosen when it opens: lower-case letters, digits and hyphens | |
| Member | The membership of one account in one organisation, in one role | Staff member (branch-network): a person employed by the bank |
| Role | Owner, admin or member: what a member may do in an organisation follows from it | Staff role (branch-network): the job of a staff member |
| Right | One thing a member may do in an organisation: read, invite or manage members, grant delegations | |
| Invitation | An organisation asks a person, by email address, to join in a role; answered with its token within a week, or taken back | |
| Delegation | A member lends some of the rights of their role to another member, for at most ninety days | Delegation table (credit-policy): the credit decision limits |
| Display name | How a person is shown to the others: from their token, or as they wrote it | |
| Email address | Where a person is reached, always the one their token says: an invitation is matched on it | |
| Open | Create an organisation under its slug; the account that opens it is its first owner | |
| Join | Become a member of an organisation: by opening it, or by accepting an invitation | |
| Change | Give a member another role; only an owner appoints or changes an owner | |
| Remove | End a membership; an organisation keeps one owner at least | |
| Invite | Issue an invitation to an email address, in a role | |
| Issue | Create an invitation and its token, which is sent once and never stored | |
| Accept | Answer yes to an invitation sent to oneself, before it expires: one joins in its role | Acceptance (credit-application): the borrower's signature of an offer |
| Decline | Answer no to an invitation sent to oneself | |
| Grant | Lend rights of a role to another member, for a period | |
| Revoke | Take back an invitation not answered, or end a delegation before its period | |
| Period | When a delegation holds: from its start, included, to its end, excluded | |
| Search | Read a page of the members of an organisation, for one of its members | |
| Identity provider | The system that authenticates the people (Keycloak): the application follows it, never stores its secrets | |
| Owner | The highest role: an owner may do everything in an organisation, appointing or changing another owner included | |
| Last owner | The only owner an organisation has left: they are neither removed nor given another role | |
| Above | Higher in the order of roles: an owner is above an admin, an admin above a member | |
| Own role | The role of the member who acts: they do not change it themselves, and act on no one above it | |
| Oneself | The member who acts, as the other party of their own act: no one delegates to oneself | |
| Pending | Said of an invitation issued and not yet accepted, declined, revoked or expired: the only state in which it is answered | |
| Expire | For an invitation, to pass its week unanswered: it is accepted or declined no more | |
| Verified | Said of an email address the identity provider confirmed belongs to the person: an account is provisioned with it only then | |
| Taken | Said of a slug an organisation holds already: two organisations never share one | |
| Active | Said of a delegation granted and not ended yet: neither revoked nor past its period | |
| Inverted | Said of a period whose end does not come after its start | |
| Long | Said of a delegation whose period lasts more than ninety days: a longer one is a role, not a delegation | |

## Words with several meanings, one row per context

The words of `discovery.md` that mean something different in two contexts. A word absent from
a context has no meaning there.

| Word | Context | Meaning there |
|---|---|---|
| Customer | customer-due-diligence | the person or business the bank knows |
| Customer | credit-application | the applicant, once identified |
| Customer | servicing | not used: the borrower |
| Applicant | credit-application | the person who applied |
| Applicant | customer-due-diligence | not used: a customer, once identified |
| Borrower | credit-application | the person named as borrower on the file |
| Borrower | servicing | the person who owes the loan |
| Co-borrower, guarantor | credit-application | a person on the file who shares the debt, or backs it |
| Decision | credit-application | the decider's choice |
| Decision | reporting | a count, one per application decided |
| Refusal | credit-application | the final refusal, with reasons |
| Refusal | data-protection | the refused application, kept six months |
| Refusal | brokerage | not used: registration lapsed |
| Offer | credit-application | the loan terms proposed, valid 15 days |
| Loan | credit-application | not used: an application before payout |
| Loan | servicing | money paid out, with its schedule |
| Loan | reporting | the outstanding amount of loans |
| Exception | credit-application | a deviation from policy, with its justification |
| Exception | reporting | a decision counted in the share of exceptions |
| Rescheduling | credit-application | a new schedule, decided as a credit |
| Rescheduling | servicing | the new schedule executed |
| Default | servicing | a loan 90 days past due |
| Default | reporting | a loan in the defaults list |
| Account | identity | a person's login |
| Account | financial-crime | not used: the payer account |
| Account | credit-application | not used: the consent to read the bank accounts |
| Staff member | branch-network | a person employed by the bank |
| Staff member | identity | not used: a member of an organisation |
| Withdrawal | credit-application | the consumer's right within 14 days |
| Withdrawal | identity | not used: revoking an invitation (revoke) |
| Register | credit-application | the repayment incident register |
| Register | servicing | the repayment incident register, for declarations |
| Register | brokerage | the intermediaries register |
| Delegation | identity | a member lends rights of their role |
| Delegation | credit-policy | the delegation table of credit decisions |
| Role | identity | owner, admin or member |
| Role | branch-network | the staff role |
| Member | identity | membership of an account in an organisation |
| Member | branch-network | not used: a staff member |
| Organisation, bank | identity | the tenant, identified by its slug |
| Organisation, bank | branch-network | the bank, the same tenant |

## Open questions

- Approval rate and share of exceptions: the exact counts (product owner). Until then the
  reporting rows are provisional.
- How a payer account is matched to a borrower for the alert (product owner, compliance).
