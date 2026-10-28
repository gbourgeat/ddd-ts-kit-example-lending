import { describe, expect, it } from '@jest/globals';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CheckRequestAgainstProductCommand } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.command';
import { CheckRequestAgainstProductHandler } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeProductTerms } from '@/contexts/credit-application/test/fakes/product-terms.fake';

const APPLICATION_ID = 'credit-application-1';
const now = new Date('2026-01-01T00:00:00.000Z');

const termsOfPersonalLoan = {
  productId: 'personal-loan',
  amountMinimumCents: 500000,
  amountMaximumCents: 3000000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4500,
  insuranceMandatory: true,
};

describe('Check request against product', () => {
  it('keeps the limit a request breaks as a finding of the application', async () => {
    const { handler, repository } = await arrange(4000000, 60, true);

    await handler.execute(new CheckRequestAgainstProductCommand(APPLICATION_ID));

    const findings = (await repository.findById(APPLICATION_ID))?.toState().productTermsFindings;

    expect(findings).toEqual([
      {
        kind: 'outside-limit',
        productId: 'personal-loan',
        term: 'amount',
        bound: 'maximum',
        requested: 4000000,
        limit: 3000000,
      },
    ]);
  });

  it('keeps no finding for a request within the limits of its product', async () => {
    const { handler, repository } = await arrange(1234567, 60, true);

    await handler.execute(new CheckRequestAgainstProductCommand(APPLICATION_ID));

    expect((await repository.findById(APPLICATION_ID))?.toState().productTermsFindings).toEqual([]);
  });

  it('keeps that the terms are unknown when the product has none yet', async () => {
    const { handler, repository } = await arrange(1234567, 60, false);

    await handler.execute(new CheckRequestAgainstProductCommand(APPLICATION_ID));

    expect((await repository.findById(APPLICATION_ID))?.toState().productTermsFindings).toEqual([
      { kind: 'terms-unknown', productId: 'personal-loan' },
    ]);
  });

  it('refuses an application that does not exist, with UNKNOWN_CREDIT_APPLICATION', async () => {
    const { handler } = await arrange(1234567, 60, true);

    await expect(handler.execute(new CheckRequestAgainstProductCommand('unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_CREDIT_APPLICATION',
    });
  });
});

async function arrange(amountCents: number, durationMonths: number, productDefined: boolean) {
  const repository = new FakeCreditApplicationRepository();
  const terms = new FakeProductTerms();

  await repository.save(
    CreditApplication.create(APPLICATION_ID, 'ada', {
      amount: Money.ofCents(amountCents),
      durationMonths,
      registeredAt: now,
      branchId: '',
      productId: 'personal-loan',
    }),
  );

  if (productDefined) {
    await terms.upsertIfNewer('personal-loan', { eventId: 'event-1', occurredAt: now }, () => termsOfPersonalLoan);
  }

  return { repository, handler: new CheckRequestAgainstProductHandler(repository, terms, { now: () => now }) };
}
