import { describe, expect, it } from '@jest/globals';
import { loanArrearsBucketEnteredV1 } from '@/contexts/servicing/published-language';
import { PortfolioAtRiskProjection } from '@/contexts/reporting/application/projections/portfolio-at-risk.projection';
import { FakePortfolioAtRisk } from '@/contexts/reporting/test/fakes/portfolio-at-risk.fake';

const tenantId = 'acme-bank';

describe('Portfolio at risk, kept from what servicing announces', () => {
  it('keeps the arrears bucket a loan entered, under its tenant', async () => {
    const store = new FakePortfolioAtRisk();
    const projection = new PortfolioAtRiskProjection(store);

    await projection.arrearsBucketEntered(bucketEntered('ThirtyOneToSixtyDays', 'event-1', '2026-01-10T00:00:00.000Z'));

    expect(await store.get(`${tenantId}:loan-1`)).toEqual({
      key: `${tenantId}:loan-1`,
      tenantId,
      loanId: 'loan-1',
      bucket: 'ThirtyOneToSixtyDays',
    });
  });

  it('keeps the same line when the same event is delivered twice', async () => {
    const store = new FakePortfolioAtRisk();
    const projection = new PortfolioAtRiskProjection(store);
    const event = bucketEntered('ThirtyOneToSixtyDays', 'event-1', '2026-01-10T00:00:00.000Z');

    await projection.arrearsBucketEntered(event);
    await projection.arrearsBucketEntered(event);

    expect(await store.get(`${tenantId}:loan-1`)).toEqual({
      key: `${tenantId}:loan-1`,
      tenantId,
      loanId: 'loan-1',
      bucket: 'ThirtyOneToSixtyDays',
    });
  });

  it('keeps the newest bucket when an older event is delivered late', async () => {
    const store = new FakePortfolioAtRisk();
    const projection = new PortfolioAtRiskProjection(store);

    await projection.arrearsBucketEntered(bucketEntered('OverNinetyDays', 'event-2', '2026-02-10T00:00:00.000Z'));
    await projection.arrearsBucketEntered(bucketEntered('OneToThirtyDays', 'event-1', '2026-01-10T00:00:00.000Z'));

    expect((await store.get(`${tenantId}:loan-1`))?.bucket).toBe('OverNinetyDays');
  });
});

function bucketEntered(bucket: string, id: string, occurredAt: string) {
  const event = loanArrearsBucketEnteredV1.create({ loanId: 'loan-1', bucket }, { id, occurredAt });

  return { ...event, tenantId };
}
