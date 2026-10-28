import { describe, expect, it } from '@jest/globals';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';
import { CreditEligibilityAnswer } from '@/contexts/customer-due-diligence/infrastructure/external/credit-eligibility.answer';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const bornAt = new Date('2026-01-10T00:00:00.000Z');
const asOf = '2026-02-01T00:00:00.000Z';

describe('CreditEligibilityAnswer', () => {
  it('accepts an identified customer whose due diligence is current', async () => {
    expect(await answerFor(() => undefined)).toEqual({ eligible: true });
  });

  it('refuses a customer it does not know', async () => {
    const answer = await new CreditEligibilityAnswer(new FakeCustomerRepository()).eligibilityOf('nobody', asOf);

    expect(answer).toEqual({ eligible: false, reason: 'unknown-customer' });
  });

  it('refuses a customer whose relationship ended', async () => {
    expect(await answerFor((customer) => customer.endRelationship(bornAt))).toEqual({
      eligible: false,
      reason: 'relationship-ended',
    });
  });

  it('refuses a customer after a confirmed sanctions match', async () => {
    const answer = await answerFor((customer) => {
      customer.recordPossibleMatch(bornAt);
      customer.confirmSanctionsMatch(bornAt);
    });

    expect(answer).toEqual({ eligible: false, reason: 'sanctions-match' });
  });

  it('refuses a high risk customer until compliance approves, then accepts', async () => {
    const refused = await answerFor((customer) => customer.rateRisk(RiskRating.High, bornAt));

    const approved = await answerFor((customer) => {
      customer.rateRisk(RiskRating.High, bornAt);
      customer.approveHighRisk(bornAt);
    });

    expect(refused).toEqual({ eligible: false, reason: 'high-risk-not-approved' });
    expect(approved).toEqual({ eligible: true });
  });

  it('refuses a customer whose due diligence is overdue', async () => {
    const answer = await answerFor((customer) =>
      customer.refreshDueDiligence('clear', new Date('2024-01-01T00:00:00.000Z')),
    );

    expect(answer).toEqual({ eligible: false, reason: 'due-diligence-overdue' });
  });
});

async function answerFor(prepare: (customer: Customer) => void) {
  const repository = new FakeCustomerRepository();
  const customer = Customer.create('customer-9', aPersonIdentity(), bornAt);

  prepare(customer);
  await repository.save(customer);

  return new CreditEligibilityAnswer(repository).eligibilityOf('customer-9', asOf);
}
