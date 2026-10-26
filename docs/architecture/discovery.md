# Domain discovery

Source: `docs/architecture/needs.md` (product owner, 2026-10-26). Hot spots decided by the
conductor under `docs/architecture/owner-brief.md` are marked "conductor, owner brief".

## Timeline

| # | Actor | Command | Domain event | Then (policy) | Needs to see (read model) |
|---|---|---|---|---|---|
| 1 | Bank operator | Subscribe bank | Bank subscribed | whenever Bank subscribed, bank data is kept apart from every other bank | Bank profile |
| 2 | Branch manager | Open branch | Branch opened | | Branches of the bank |
| 3 | Branch manager | Appoint member of staff | Member of staff appointed | advisor gets a portfolio of customers | Staff of the branch |
| 4 | Member of staff | Declare conflict of interest | Conflict of interest declared | the declared person never prepares nor decides that application | Staff, customers, applications |
| 5 | Broker | Register broker | Broker registered | | Intermediaries register |
| 6 | System (daily) | Check broker registration | Broker registration lapsed | a lapsed broker can no longer bring an application | Intermediaries register |
| 7 | Advisor | Identify customer | Customer identified | whenever Customer identified, screen each person | Identity documents, proof of address |
| 8 | Advisor | Register business | Business registered | whenever Business registered, identify each director and beneficial owner as a person | Registration, directors, owners above 25 percent |
| 9 | System | Screen person | Person screened clear, or Possible match found | whenever Possible match found, compliance reviews it | Sanctions and politically exposed persons lists |
| 10 | Compliance officer | Confirm sanctions match | Sanctions match confirmed | whenever Sanctions match confirmed, end the relationship | Match, customer file |
| 11 | Compliance officer | Dismiss match | Match dismissed | | Match, reason |
| 12 | Compliance officer | Rate customer risk | Customer risk rated (low, medium, high) | | Country, activity, screening, product |
| 13 | Compliance officer | Approve high risk customer | High risk customer approved | a high risk customer gets no credit before this | Risk rating |
| 14 | System (yearly, 3-yearly, 5-yearly) | Ask for due diligence refresh | Due diligence refresh overdue | whenever overdue, no credit is disbursed | Due diligence dates per risk class |
| 15 | Advisor | Refresh due diligence | Due diligence refreshed | | Customer file |
| 16 | Customer | Apply for a product | Application submitted | whenever Application submitted, check the amount and duration against the product | Catalogue: amounts, durations, fees, mandatory insurance |
| 17 | Broker | Bring application | Application brought | the broker sees only this application | Broker's applications |
| 18 | Applicant | Give document | Document received | the document is stored as a file | Documents of the application |
| 19 | Applicant | Give account consent | Account consent given | consent expires after 90 days | Consent |
| 20 | System | Read accounts | Account information read | the reading is kept as a document of the application | Consent, accounts |
| 21 | System | Consult repayment incident register | Register consulted | a listed borrower or co-borrower is refused for consumer credit | Register answer |
| 22 | System | Assess application | Application assessed (debt to income, residual income, register, score with version and factors) | the assessment proposes approve or refuse | Inputs, score model version |
| 23 | Staff reviewer | Review proposed refusal | Proposed refusal reviewed | a refusal is never decided by the machine alone | Assessment, documents |
| 24 | Applicant | Ask for human review | Human review requested | | Decision, reasons |
| 25 | Applicant | Contest decision | Decision contested | a contested decision goes to a person | Decision, applicant's view |
| 26 | Decider (advisor, credit analyst, risk manager) | Decide application | Application approved, Application approved with conditions, Application refused with reasons | the preparer never decides; amount above the decider's limit goes up one level | Everything the decider had in front of them |
| 27 | Credit committee | Decide exception | Exception decided | every exception needs a written justification and the level above | Exception, justification |
| 28 | Decider | Request exception | Exception requested | the exception goes to the level above the amount's level, at least a risk manager | Ratio, residual income, score threshold |
| 29 | System | Prepare offer | Offer issued, or Offer refused above legal maximum rate | an offer at or above the legal maximum rate is never issued | Rate grid, legal maximum rate in force that day, annual percentage rate |
| 30 | System | Deliver pre-contractual sheet | Pre-contractual information delivered | the offer goes out after it | Standard sheet |
| 31 | Borrower | Accept offer | Offer accepted (electronic signature) | offer lapses after 15 days; no payout before the 8th day after signing | Offer, signature |
| 32 | Borrower | Withdraw loan | Loan withdrawn within 14 days | after a payout, the borrower repays capital and interest accrued | Loan, payout date |
| 33 | System | Pay out loan | Loan paid out | whenever Loan paid out, set the schedule of constant instalments | Schedule, balance |
| 34 | System (every night, per bank) | Compute instalments due | Instalments due computed | each due instalment is collected | Schedule, due dates |
| 35 | System | Collect instalment by direct debit | Instalment paid, or Direct debit rejected (instalment unpaid) | a rejected debit makes the instalment unpaid | Ledger, payment provider answer |
| 36 | Borrower | Repay early | Early repayment made | the early repayment fee applies (1 percent or 0.5 percent) | Balance, fee |
| 37 | Borrower in difficulty | Ask for rescheduling | Loan rescheduled | decided under the same delegation rules as a credit | Balance, arrears |
| 38 | Staff | Write off loan | Loan written off | | Ledger |
| 39 | System | Charge late fee | Late fee charged | capped by the law | Ledger, arrears |
| 40 | System (daily) | Move loan to arrears bucket | Loan entered arrears bucket (1 to 30, 31 to 60, 61 to 90, over 90 days) | the borrower is notified by mail and text message at each stage | Arrears per loan |
| 41 | System | Declare to register | Repayment incident declared (after two consecutive unpaid instalments) | the declaration is withdrawn when the arrears are paid | Register |
| 42 | System (day 90) | Declare default | Loan defaulted | the loan is handed to collections | Arrears, collections |
| 43 | System | Watch repayments | Alert raised (early repayment above 10,000 within a year of payout, or payment from another account) | only compliance reviews it | Alert |
| 44 | Compliance officer | Close alert | Alert closed with reason | | Alert, repayments |
| 45 | Compliance officer | File suspicious activity report | Suspicious activity report filed with the financial intelligence unit | nobody outside compliance learns it exists | Report |
| 46 | Branch manager, risk manager | Ask monthly report | Monthly report produced per branch (CSV) | | Applications, approval rate, exceptions, portfolio at risk 30 and 90 days |
| 47 | Compliance officer | Ask defaults list | Defaults list produced for the supervisor (CSV) | | Loans in default |
| 48 | Customer | Ask copy of data | Copy of customer data delivered | | Everything kept about the customer |
| 49 | System (after retention) | Erase personal data | Personal data erased | retention: due diligence 5 years after the relationship, loan 10 years after closing, refused application 6 months | Retention dates |
| 50 | Any member of staff, any system actor | Change information, decide, access a file, grant a right | Change, decision, access, grant recorded in the audit trail | every change, decision, access and grant is audited | Audit trail |
| 51 | Staff (monthly) | Run scoring model impact review | Impact assessment of the scoring model recorded | scoring processes personal data at scale | Impact assessment |

Rows 1 to 51 cover every need of `needs.md`: subscription and tenancy (1), branches and
staff (2 to 4), brokers (5 to 6, 17), customers and due diligence (7 to 15), applications
and documents (16 to 20), assessment (21 to 25), decision (26 to 28), price and offer (29 to
31), withdrawal (32), loans (33 to 37), arrears (38 to 42), money laundering (43 to 45),
reports (46 to 47), retention and personal data (48 to 49, 51), running as a service (34),
audit (50).

## Running and timing

The servicing of loans runs when the platform is down for maintenance: it reacts to events
and does not call the other parts directly. Time is an actor for rows 6, 14, 34, 40, 42, 49.

## External systems

| System | Used for | Direction | What happens when it is down |
|---|---|---|---|
| Screening provider | Sanctions and politically exposed persons lists | out and back | Not stated. Conductor, owner brief, to confirm: no credit is granted until the screening is done |
| National register of repayment incidents | Consultation (assessment), declaration (arrears) | out and back | Not stated. Conductor, owner brief, to confirm: no decision that needs it is taken; declarations wait and are sent when it is back |
| Intermediaries register | Broker registration check | in | Not stated. Conductor, owner brief, to confirm: a broker cannot bring an application when the check cannot be made |
| Account information provider | Income and expenses from accounts, with consent | in | Not stated. Conductor, owner brief, to confirm: the applicant gives documents instead |
| Payment provider | Direct debit of instalments | out and back | Rejected debits make the instalment unpaid; retry is not stated |
| Financial intelligence unit | Suspicious activity reports | out | Not stated. Conductor, owner brief, to confirm: the report waits, marked as pending, and stays invisible |
| Electronic signature | Acceptance of an offer | out and back | Not stated. Conductor, owner brief, to confirm: the offer stays pending |
| Mail and text messages | Notices to borrowers | out | Not stated. Conductor, owner brief, to confirm: the notice is kept and sent when it is back |
| Object store (documents) | Documents of applications | out and back | Not stated. Conductor, owner brief, to confirm: the upload is refused, nothing is lost |
| Supervisor | Receives monthly reports and defaults list | out | Not stated |

## Rules heard

- A customer is a person or a small business; a business is known through each of its
  directors and each beneficial owner (above 25 percent), each as a person.
- A possible sanctions match is reviewed by compliance; a confirmed match ends the relationship.
- A high risk customer needs compliance approval before any credit.
- No credit is disbursed to a customer whose due diligence refresh is overdue.
- The application file is never edited; a mistake is corrected by a later entry that says
  what it corrects and why.
- Debt to income ratio at most 35 percent; residual income at least the minimum set by the bank.
- A borrower or co-borrower listed in the repayment incident register is refused for consumer credit.
- A refusal is never decided by the machine alone; an applicant may ask for a human review.
- The preparer of an application never decides it.
- An exception needs a written justification and the decision of the level above the amount's level, at least a risk manager.
- Annual percentage rate strictly below the legal maximum rate in force on the day of the offer.
- The offer is valid 15 days; withdrawal within 14 calendar days of signing; no payout before the 8th day after signing.
- The loan ledger is never edited; an error is reversed by an entry of opposite effect.
- Early repayment fee at most 1 percent of the amount repaid when more than a year remains, 0.5 percent otherwise.
- Two consecutive unpaid instalments of a consumer loan are declared to the register; the declaration is withdrawn when the arrears are paid.
- Default at 90 days, handed to collections.
- Nobody outside compliance may learn that a suspicious activity report exists or was considered: not by a screen, an error, a search, nor the audit trail.
- A broker sees only the applications they brought, never the register result nor the score.
- A customer sees their own applications and loans; a co-borrower sees the application they are part of.
- Retention: due diligence 5 years after the relationship, loan 10 years after closing, refused application 6 months; then erasure.
- Every change, decision, access of staff to a customer file and grant of a right is audited.
- Rate grid, maximum legal rates, delegation limits and residual income minimums are the bank's data, with dates of effect.
- Amounts are integers of cents; rates are decimals with their precision stated.
- Each bank's data is never visible to another bank.

## Words with several meanings

| Word | Meaning for whom |
|---|---|
| Customer | the person or small business known by the bank; an applicant before the relationship is accepted (conductor, owner brief: a customer is known before any credit) |
| Borrower | the person who owes the loan; the applicant once the application is approved or the loan paid out |
| Applicant | the person who applied, whether or not they are a customer yet; also the one who asks for a human review and contests |
| Co-borrower, guarantor | a person named on the application who shares the debt (co-borrower) or who backs it (guarantor); their rights are not the same |
| Decision | the decider's choice: approve, approve with conditions, refuse; an assessment only proposes |
| Refusal | a proposed refusal (by the assessment) or a decided refusal (by a decider); two steps |
| Offer | the proposal of a loan, valid 15 days; not the loan |
| Loan | paid out money with its schedule; before payout it is an application |
| Exception | a deviation from the policy, decided by the level above |
| Rescheduling | a change of the schedule granted to a borrower in difficulty; not a new credit (conductor, owner brief, to confirm) |
| Default | the state at 90 days; not an arrears bucket |
| Account | a bank account of the applicant (read with consent) or the bank's internal account of a loan (conductor, owner brief: keep these words apart) |
| Staff, member of staff | any employee of the bank, with a role (advisor, analyst, risk manager, committee member, compliance officer, branch manager, auditor) |
| Withdrawal | the borrower's right within 14 days; not a cancellation of an application |
| Register | the national register of repayment incidents; not the intermediaries register |

## Hot spots

- "Green score" for an advisor's limit of 15,000: no definition of green. Conductor, owner brief:
  the advisor decides only when the score is in the best band of the scoring model; owner to define the band.
- Basis of the amount for the decision table (the loan, or the total with co-borrower):
  conductor, owner brief: the amount of the loan requested, the owner to confirm.
- "Approval rate" and "share of exceptions" in the monthly report: definition not stated.
  Owner to define the numerator and the denominator.
- Consent of accounts after 90 days: is the consent per bank or per application?
  Conductor, owner brief: per application. Owner to confirm.
- A payment from an account "not the borrower's": how is an account matched to a borrower?
  Owner to define.
- Rescheduling rules: the rules of change of schedule are not stated (new rate? new duration?).
  Owner to define.
- Retry of a rejected debit: not stated. Owner to define.
- What the person in a conflict of interest may still see: not stated. Conductor, owner brief: nothing of the application.
- Whether a branch manager may decide a credit: not stated. Conductor, owner brief: no, only the
  delegation table decides.
