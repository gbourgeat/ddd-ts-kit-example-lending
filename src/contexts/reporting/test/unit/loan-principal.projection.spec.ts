import { describe, expect, it } from '@jest/globals';
import { creditApplicationPayoutAuthorisedV1 } from '@/contexts/credit-application/published-language';
import { LoanPrincipalProjection } from '@/contexts/reporting/application/projections/loan-principal.projection';
import { FakeLoanPrincipal } from '@/contexts/reporting/test/fakes/loan-principal.fake';

const tenantId = 'acme-bank';

describe('Loan principal, kept from what credit-application announces', () => {
  it('keeps the branch and the amount paid out to a loan', async () => {
    const store = new FakeLoanPrincipal();
    const projection = new LoanPrincipalProjection(store);

    await projection.payoutAuthorised(payoutAuthorised('branch-1', 100_000));

    expect(await store.get(`${tenantId}:loan-1`)).toEqual({
      key: `${tenantId}:loan-1`,
      tenantId,
      loanId: 'loan-1',
      branchId: 'branch-1',
      principalCents: 100_000,
    });
  });

  it('keeps no line for a payout recorded on no branch, as it cannot be counted on one', async () => {
    const store = new FakeLoanPrincipal();
    const projection = new LoanPrincipalProjection(store);

    await projection.payoutAuthorised(payoutAuthorised('', 100_000));

    expect(await store.get(`${tenantId}:loan-1`)).toBeUndefined();
  });

  it('keeps the same line when the same payout is delivered twice', async () => {
    const store = new FakeLoanPrincipal();
    const projection = new LoanPrincipalProjection(store);
    const event = payoutAuthorised('branch-1', 100_000);

    await projection.payoutAuthorised(event);
    await projection.payoutAuthorised(event);

    expect((await store.get(`${tenantId}:loan-1`))?.principalCents).toBe(100_000);
  });
});

function payoutAuthorised(branchId: string, amountCents: number) {
  const event = creditApplicationPayoutAuthorisedV1.create(
    {
      creditApplicationId: 'loan-1',
      customerId: 'customer-1',
      branchId,
      amountCents,
      durationMonths: 12,
      rateBasisPoints: 500,
    },
    { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
  );

  return { ...event, tenantId };
}
