import { describe, expect, it } from '@jest/globals';
import { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';

describe('CreditApplicationAssessed', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CreditApplicationAssessed(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      {
        modelVersion: '2026.1',
        debtToIncomePercent: 36,
        repaymentIncidents: 0,
        residualIncomeCents: 160_000,
        score: 85,
        band: 'green',
        factors: [],
        proposedOutcome: 'approve',
      },
      'credit-analyst-1',
    );

    expect(event.name).toBe('credit-application.credit-application.assessed');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.assessorId).toBe('credit-analyst-1');
  });
});
