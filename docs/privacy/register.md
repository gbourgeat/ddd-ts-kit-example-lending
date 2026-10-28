# Register of personal data

What the system keeps of people, by context: read by `npx ddd-ts-kit docs` from the
`personalFields` declarations of each context and from the `personal` option of its integration
events, and held to the code by `docs --check`. Everything outside the markers is written by the
team and kept.

It is not the record of processing activities of GDPR article 30: that record also names the
purposes, the lawful basis, the recipients outside the system and the transfers, which no code
says. The sections after the markers are for the controller to write.

<!-- ddd-ts-kit:personal-data-register -->
## What the system knows of a person

| Context | Table | About | Personal data | On erasure | Kept |
|---|---|---|---|---|---|
| branch-network | `staff_members` | `id` | `name`, `email` | pseudonymised | until erased |
| identity | `accounts` | `id` | `email`, `display_name` | pseudonymised | until erased |
| identity | `invitations` | `id` | `email` | row deleted | until erased |

## Where it leaves its context

No integration event declares personal data in its payload.
<!-- /ddd-ts-kit:personal-data-register -->

The retention of `identity.invitations` is the configuration's: `RETENTION_PERIODS` (`identity.invitation`, 30 days after `expires_at` in `.env.example`, owned by data-protection), not written in the declaration, so the generated column reads "until erased".

## Purposes and lawful basis

| Context | Why it keeps them | Lawful basis (GDPR article 6) |
|---|---|---|
| identity | to know who signs in and to which bank (tenant) they belong | performance of the contract with the member, or legitimate interest of the bank for its staff |
| branch-network | to know which advisor holds which portfolio, and the level of each decider | legitimate interest of the bank (organisation of its network) and legal obligation (delegation of credit decisions) |
| customer-due-diligence | to know the customer, screen them against sanctions lists and refresh the file | legal obligation (anti-money-laundering and sanctions law); the personal values of the event-sourced file are sealed with a key of the data subject |
| credit-application | to assess a request for credit and to evidence the decision and its reasons | performance of a pre-contractual step at the request of the applicant, and legal obligation (creditworthiness assessment, consumer credit directive) |
| servicing | to collect the instalments and keep the ledger of a loan | performance of the credit contract and legal obligation (accounting) |
| financial-crime | to raise alerts and file suspicious activity reports, known to compliance only | legal obligation (anti-money-laundering law) |
| credit-scoring | to compute a score with the factors in words | legitimate interest with the safeguards of an impact assessment recorded each month by staff (data-protection) |
| brokerage | to keep the register of the brokers who bring applications | performance of the contract with the broker and legal obligation (registration) |
| data-protection | to answer the requests of data subjects and erase past retention | legal obligation (GDPR) |

Retention: customer-due-diligence five years after the end of the relationship, servicing ten years after the closing of the loan, refused applications six months after the refusal; each context erases past its retention by a nightly job per bank (the key of the data subject is destroyed).

## Recipients outside the system

This project calls no real provider: screening, account information, the register of repayment incidents, the payment provider, the financial intelligence unit, the electronic signature, mail and text messages are ports with a simulated adapter behind an anti-corruption layer. In production each one is a processor or a recipient to declare here before it is bound, with its contract (GDPR article 28), its country and, outside the EEA, its safeguard (adequacy decision or standard contractual clauses). The financial intelligence unit is a recipient by law, never a processor. No analytics tool receives personal data.

## What the code does not purge

- Backups of the database: kept 30 days, deleted by the platform team by rotation; the keys of the data subjects live apart from the events with a backup retention shorter than the events, so a restored backup cannot reopen what was erased once its keys expired.
- Logs, spans and error reports carry identifiers and codes only, never arguments, payloads or error messages; kept 30 days by the platform team.
- Files (documents of an application, copies for a data subject): kept with the application and removed with it past retention; a staged copy for a data subject is purged hourly after its link expires.
- The audit trail holds the actor, the action and the identifiers, never the personal values: it is kept as long as the law requires evidence (ten years), archived to the file storage, and its archives are deleted by the platform team at the end of that period.
