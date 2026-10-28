# Verdict on scenario "#US0.05 AC3 the submission is published once, as an integration event carrying the application identifier, in the same transaction that records it"

Story: US0
Subject: scenario "#US0.05 AC3 the submission is published once, as an integration event carrying the application identifier, in the same transaction that records it"
Fingerprint: 8f028a7dc4dde4a2
Verdict: refuse
Reason: AC3 asks that the submission is published once, as an integration event carrying the application identifier; it says nothing of a branch, and the locked scenario is valid for it. The added `branchId` only follows the new 422 rule of the submit route for US0.08 (plan.md 2026-10-28), a code decision and not an owner answer on AC3, so the change makes the scenario match the code rather than the criterion; the branch of the version 2 event belongs to US0.08's own criterion and scenario.
