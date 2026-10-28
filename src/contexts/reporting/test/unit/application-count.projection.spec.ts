import { describe, expect, it } from '@jest/globals';
import { creditApplicationSubmittedV2 } from '@/contexts/credit-application/published-language';
import { ApplicationCountProjection } from '@/contexts/reporting/application/projections/application-count.projection';
import { FakeApplicationCounts } from '@/contexts/reporting/test/fakes/application-counts.fake';

describe('Application count, kept from what credit-application announces', () => {
  it('counts one more application and sums its amount on the branch and month of its submission', async () => {
    const counts = new FakeApplicationCounts();
    const projection = new ApplicationCountProjection(counts);

    await projection.submitted(
      submitted({
        id: 'credit-application-1',
        branchId: 'branch-1',
        requestedAmountCents: 1000,
        occurredAt: '2026-03-14T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({
      branchId: 'branch-1',
      month: '2026-03',
      applicationCount: 1,
      amountCents: 1000,
    });
  });

  it('keeps the same line when the same event is delivered twice', async () => {
    const counts = new FakeApplicationCounts();
    const projection = new ApplicationCountProjection(counts);

    const event = submitted({
      id: 'credit-application-1',
      branchId: 'branch-1',
      requestedAmountCents: 1000,
      occurredAt: '2026-03-14T09:00:00.000Z',
    });

    await projection.submitted(event);
    await projection.submitted(event);

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ applicationCount: 1, amountCents: 1000 });
  });

  it('keeps the newest line when an older event is delivered late', async () => {
    const counts = new FakeApplicationCounts();
    const projection = new ApplicationCountProjection(counts);

    await projection.submitted(
      submitted({
        id: 'credit-application-2',
        branchId: 'branch-1',
        requestedAmountCents: 500,
        occurredAt: '2026-03-20T09:00:00.000Z',
      }),
    );

    await projection.submitted(
      submitted({
        id: 'credit-application-1',
        branchId: 'branch-1',
        requestedAmountCents: 1000,
        occurredAt: '2026-03-10T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ applicationCount: 1, amountCents: 500 });
  });
});

interface SubmittedFact {
  readonly id: string;
  readonly branchId: string;
  readonly requestedAmountCents: number;
  readonly occurredAt: string;
}

function submitted(fact: SubmittedFact) {
  return {
    ...creditApplicationSubmittedV2.create(
      {
        creditApplicationId: fact.id,
        applicantId: 'customer-7',
        requestedAmountCents: fact.requestedAmountCents,
        durationMonths: 60,
        branchId: fact.branchId,
      },
      { id: `event-${fact.id}`, occurredAt: fact.occurredAt },
    ),
    tenantId: 'acme-bank',
  };
}
