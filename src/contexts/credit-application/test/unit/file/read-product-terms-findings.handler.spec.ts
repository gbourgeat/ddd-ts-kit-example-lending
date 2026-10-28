import { describe, expect, it } from '@jest/globals';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { ReadProductTermsFindingsHandler } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.handler';
import { ReadProductTermsFindingsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.query';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const APPLICATION_ID = 'credit-application-1';

const limits = {
  amountMinimumCents: 500000,
  amountMaximumCents: 3000000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
};

const checkedAt = new Date('2026-01-01T00:00:00.000Z');

describe('Read product terms findings', () => {
  it('answers no finding for a request within the limits of its product', async () => {
    const repository = await arrange(60, 1234567);
    const handler = new ReadProductTermsFindingsHandler(repository);

    const answer = await handler.execute(new ReadProductTermsFindingsQuery(anActor().build(), APPLICATION_ID));

    expect(answer).toEqual({ findings: [] });
  });

  it('answers the limit a request breaks, in the order of the checks', async () => {
    const repository = await arrange(6, 4000000);
    const handler = new ReadProductTermsFindingsHandler(repository);

    const answer = await handler.execute(new ReadProductTermsFindingsQuery(anActor().build(), APPLICATION_ID));

    expect(answer.findings).toEqual([
      {
        kind: 'outside-limit',
        productId: 'personal-loan',
        term: 'amount',
        bound: 'maximum',
        requested: 4000000,
        limit: 3000000,
      },
      {
        kind: 'outside-limit',
        productId: 'personal-loan',
        term: 'duration',
        bound: 'minimum',
        requested: 6,
        limit: 12,
      },
    ]);
  });

  it('refuses an application that does not exist, with UNKNOWN_CREDIT_APPLICATION', async () => {
    const handler = new ReadProductTermsFindingsHandler(new FakeCreditApplicationRepository());

    await expect(
      handler.execute(new ReadProductTermsFindingsQuery(anActor().build(), 'credit-application-unknown')),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });
});

/** An application for the personal loan, submitted with its amount and duration, and checked against the limits of the product. */
async function arrange(durationMonths: number, amountCents: number): Promise<FakeCreditApplicationRepository> {
  const repository = new FakeCreditApplicationRepository();

  const application = CreditApplication.create(APPLICATION_ID, 'ada', {
    amount: Money.ofCents(amountCents),
    durationMonths,
    registeredAt: checkedAt,
    branchId: '',
    productId: 'personal-loan',
  });

  application.checkAgainstProductTerms(limits, checkedAt);
  await repository.save(application);

  return repository;
}
