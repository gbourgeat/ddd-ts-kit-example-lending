import { describe, expect, it } from '@jest/globals';
import { ApprovedTermsService } from '@/contexts/credit-application/file/domain/services/approved-terms.service';
import { aCreditApplication } from '@/contexts/credit-application/test/builders/credit-application.builder';

describe('ApprovedTermsService', () => {
  it('reads the product, the amount approved and the duration of an approved application', () => {
    const approved = aCreditApplication().forProduct('personal-loan').forMonths(48).approvedFor(900_000).build();

    const terms = new ApprovedTermsService().of(approved.toState());

    expect(terms).toMatchObject({ productId: 'personal-loan', durationMonths: 48 });
    expect(terms?.amount.cents).toBe(900_000);
  });

  it('reads nothing while no decision approved the application', () => {
    const pending = aCreditApplication().build();

    expect(new ApprovedTermsService().of(pending.toState())).toBeUndefined();
  });
});
