import { describe, expect, it } from '@jest/globals';
import { loanDefaultedV1 } from '@/contexts/servicing/published-language';
import { DefaultedLoanProjection } from '@/contexts/reporting/application/projections/defaulted-loan.projection';
import { FakeDefaultedLoan } from '@/contexts/reporting/test/fakes/defaulted-loan.fake';

const tenantId = 'acme-bank';

describe('Defaulted loan, kept from what servicing announces', () => {
  it('keeps the loan declared in default and the instant of its default, under its tenant', async () => {
    const store = new FakeDefaultedLoan();
    const projection = new DefaultedLoanProjection(store);

    await projection.defaulted(defaulted('loan-1', 'event-1', '2026-01-10T00:00:00.000Z'));

    expect(await store.get(`${tenantId}:loan-1`)).toEqual({
      key: `${tenantId}:loan-1`,
      tenantId,
      loanId: 'loan-1',
      defaultedAt: new Date('2026-01-10T00:00:00.000Z'),
    });
  });

  it('keeps the same line when the same event is delivered twice', async () => {
    const store = new FakeDefaultedLoan();
    const projection = new DefaultedLoanProjection(store);
    const event = defaulted('loan-1', 'event-1', '2026-01-10T00:00:00.000Z');

    await projection.defaulted(event);
    await projection.defaulted(event);

    expect((await store.get(`${tenantId}:loan-1`))?.defaultedAt).toEqual(new Date('2026-01-10T00:00:00.000Z'));
  });

  it('keeps the newest default when an older event is delivered late', async () => {
    const store = new FakeDefaultedLoan();
    const projection = new DefaultedLoanProjection(store);

    await projection.defaulted(defaulted('loan-1', 'event-2', '2026-02-10T00:00:00.000Z'));
    await projection.defaulted(defaulted('loan-1', 'event-1', '2026-01-10T00:00:00.000Z'));

    expect((await store.get(`${tenantId}:loan-1`))?.defaultedAt).toEqual(new Date('2026-02-10T00:00:00.000Z'));
  });
});

function defaulted(loanId: string, id: string, occurredAt: string) {
  const event = loanDefaultedV1.create({ loanId }, { id, occurredAt });

  return { ...event, tenantId };
}
