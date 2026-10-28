import { describe, expect, it } from '@jest/globals';
import { creditApplicationDecidedV1 } from '@/contexts/credit-application/published-language';
import { DecisionProjection } from '@/contexts/reporting/application/projections/decision.projection';
import { FakeDecisionCounts } from '@/contexts/reporting/test/fakes/decision-counts.fake';

describe('Decision, counted on its branch and month', () => {
  it('counts one more decision, and one more approval, when the decision approves', async () => {
    const counts = new FakeDecisionCounts();
    const projection = new DecisionProjection(counts);

    await projection.decided(
      decided({
        id: 'credit-application-1',
        outcome: 'approve',
        exception: false,
        branchId: 'branch-1',
        occurredAt: '2026-03-14T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({
      branchId: 'branch-1',
      month: '2026-03',
      decisionCount: 1,
      approvalCount: 1,
      exceptionCount: 0,
    });
  });

  it('counts a refusal as a decision that is not an approval', async () => {
    const counts = new FakeDecisionCounts();
    const projection = new DecisionProjection(counts);

    await projection.decided(
      decided({
        id: 'credit-application-1',
        outcome: 'refuse',
        exception: false,
        branchId: 'branch-1',
        occurredAt: '2026-03-14T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ decisionCount: 1, approvalCount: 0 });
  });

  it('counts an approval with conditions as an approval', async () => {
    const counts = new FakeDecisionCounts();
    const projection = new DecisionProjection(counts);

    await projection.decided(
      decided({
        id: 'credit-application-1',
        outcome: 'approve-with-conditions',
        exception: false,
        branchId: 'branch-1',
        occurredAt: '2026-03-14T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ approvalCount: 1 });
  });
});

describe('Decision, counted for its exception and kept once per event', () => {
  it('counts an exception among the decisions of its branch and month', async () => {
    const counts = new FakeDecisionCounts();
    const projection = new DecisionProjection(counts);

    await projection.decided(
      decided({
        id: 'credit-application-1',
        outcome: 'approve',
        exception: true,
        branchId: 'branch-1',
        occurredAt: '2026-03-14T09:00:00.000Z',
      }),
    );

    await projection.decided(
      decided({
        id: 'credit-application-2',
        outcome: 'refuse',
        exception: false,
        branchId: 'branch-1',
        occurredAt: '2026-03-15T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ decisionCount: 2, approvalCount: 1, exceptionCount: 1 });
  });

  it('keeps the same line when the same event is delivered twice', async () => {
    const counts = new FakeDecisionCounts();
    const projection = new DecisionProjection(counts);

    const event = decided({
      id: 'credit-application-1',
      outcome: 'approve',
      exception: false,
      branchId: 'branch-1',
      occurredAt: '2026-03-14T09:00:00.000Z',
    });

    await projection.decided(event);
    await projection.decided(event);

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ decisionCount: 1, approvalCount: 1 });
  });

  it('keeps the newest line when an older decision is delivered late', async () => {
    const counts = new FakeDecisionCounts();
    const projection = new DecisionProjection(counts);

    await projection.decided(
      decided({
        id: 'credit-application-2',
        outcome: 'refuse',
        exception: false,
        branchId: 'branch-1',
        occurredAt: '2026-03-20T09:00:00.000Z',
      }),
    );

    await projection.decided(
      decided({
        id: 'credit-application-1',
        outcome: 'approve',
        exception: true,
        branchId: 'branch-1',
        occurredAt: '2026-03-10T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ decisionCount: 1, approvalCount: 0, exceptionCount: 0 });
  });
});

describe('Decision without its branch, as a version 1 stored one', () => {
  it('skips the decision without refusing it, so that the consumer is never blocked', async () => {
    const counts = new FakeDecisionCounts();
    const projection = new DecisionProjection(counts);

    const result = await projection.decided(
      decided({
        id: 'credit-application-1',
        outcome: 'approve',
        exception: false,
        branchId: '',
        occurredAt: '2026-03-14T09:00:00.000Z',
      }),
    );

    expect(result).toBe('ignored');
  });
});

interface DecidedFact {
  readonly id: string;
  readonly outcome: string;
  readonly exception: boolean;
  readonly branchId: string;
  readonly occurredAt: string;
}

function decided(fact: DecidedFact) {
  return {
    ...creditApplicationDecidedV1.create(
      {
        creditApplicationId: fact.id,
        outcome: fact.outcome,
        exception: fact.exception,
        branchId: fact.branchId,
        approvedAmountCents: 0,
      },
      { id: `event-${fact.id}`, occurredAt: fact.occurredAt },
    ),
    tenantId: 'acme-bank',
  };
}
