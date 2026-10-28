import { describe, expect, it } from '@jest/globals';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { CheckRequestAgainstProductHandler } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.handler';
import { CheckRequestAgainstProductEventHandler } from '@/contexts/credit-application/file/application/event-handlers/check-request-against-product.event-handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeProductTerms } from '@/contexts/credit-application/test/fakes/product-terms.fake';

const now = new Date('2026-01-01T00:00:00.000Z');

describe('Check request against product, on the submission', () => {
  it('checks the submitted application against its product, whose terms are not known yet', async () => {
    const repository = new FakeCreditApplicationRepository();

    await repository.save(
      CreditApplication.create('credit-application-1', 'ada', {
        amount: Money.ofCents(1234567),
        durationMonths: 60,
        registeredAt: now,
        branchId: '',
        productId: 'personal-loan',
      }),
    );

    const check = new CheckRequestAgainstProductHandler(repository, new FakeProductTerms(), { now: () => now });

    const submitted = new CreditApplicationSubmitted(
      'credit-application-1',
      'ada',
      Money.ofCents(1234567),
      60,
      now,
      '',
      'personal-loan',
    );

    await new CheckRequestAgainstProductEventHandler(check).handle(submitted);

    expect((await repository.findById('credit-application-1'))?.toState().productTermsFindings).toEqual([
      { kind: 'terms-unknown', productId: 'personal-loan' },
    ]);
  });
});
