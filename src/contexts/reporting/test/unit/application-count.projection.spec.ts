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

describe('Application count, one line per branch and month', () => {
  it('adds the applications of a branch and month one after another', async () => {
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

    await projection.submitted(
      submitted({
        id: 'credit-application-2',
        branchId: 'branch-1',
        requestedAmountCents: 2500,
        occurredAt: '2026-03-20T09:00:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ applicationCount: 2, amountCents: 3500 });
  });

  it('keeps the applications of another branch on its own line', async () => {
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

    await projection.submitted(
      submitted({
        id: 'credit-application-2',
        branchId: 'branch-2',
        requestedAmountCents: 700,
        occurredAt: '2026-03-14T09:00:00.000Z',
      }),
    );

    const other = await counts.get('acme-bank:branch-2:2026-03');

    expect(other).toMatchObject({ branchId: 'branch-2', applicationCount: 1, amountCents: 700 });
  });

  it('counts a submission on the month of its instant in UTC', async () => {
    const counts = new FakeApplicationCounts();
    const projection = new ApplicationCountProjection(counts);

    await projection.submitted(
      submitted({
        id: 'credit-application-1',
        branchId: 'branch-1',
        requestedAmountCents: 1000,
        occurredAt: '2026-03-31T23:30:00.000Z',
      }),
    );

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({ month: '2026-03', applicationCount: 1 });
  });

  it('refuses a submission without its tenant, and counts nothing under no tenant', async () => {
    const counts = new FakeApplicationCounts();
    const projection = new ApplicationCountProjection(counts);

    const tenantless = submitted({
      id: 'credit-application-9',
      branchId: 'branch-1',
      requestedAmountCents: 1000,
      occurredAt: '2026-03-14T09:00:00.000Z',
      withoutTenant: true,
    });

    await expect(projection.submitted(tenantless)).rejects.toMatchObject({ code: 'APPLICATION_COUNT' });

    expect(await counts.get(':branch-1:2026-03')).toBeUndefined();
  });
});

interface SubmittedFact {
  readonly id: string;
  readonly branchId: string;
  readonly requestedAmountCents: number;
  readonly occurredAt: string;
  readonly withoutTenant?: boolean;
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
    ...(fact.withoutTenant === true ? {} : { tenantId: 'acme-bank' }),
  };
}
