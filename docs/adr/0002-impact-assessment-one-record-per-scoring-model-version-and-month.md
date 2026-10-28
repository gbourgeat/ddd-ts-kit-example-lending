# ADR-0002: Impact assessment: one record per scoring model version and month

- Status: accepted
- Date: 2026-10-28

## Context

The assessment of the scoring model processes personal data at scale and decides access to credit, so it must be made each month and kept. Staff record it. A record that could be amended after the fact would let the assessment of a past month change without trace, and the register would no longer show what was known when it was made. The model version is an identifier string: data-protection needs no contract with credit-scoring to keep the record.

## Decision

An impact assessment is recorded once per scoring model version and per month, by an operator of data-protection holding `impact-assessment.record`. Its identifier names the pair, so a second record of the same version and month is found under it and refused with `IMPACT_ASSESSMENT_ALREADY_RECORDED`; the first record is never amended.

## Consequences

- A second record of the pair is a lookup by identifier, with no extra query and no extra column to index.
- One version can be assessed in each month it stays in use: a new month is a new record.
- A wrong record cannot be corrected in place; correcting it needs a decision of the owner and a new process, not an update.
- The month is stored as text in the form YYYY-MM and checked at birth; a value object for it is a candidate once the generator is available.

## Alternatives considered

- Amend the record when the assessment is redone: refused, it erases what was known when the assessment was first made.
- Identify the record by a generated identifier and look the pair up by a repository query: it needs a lookup method and a second index for the same guarantee, which the identifier gives for free.
- Link the version to credit-scoring by a contract: not needed, since the version is only named, not checked against the model.
