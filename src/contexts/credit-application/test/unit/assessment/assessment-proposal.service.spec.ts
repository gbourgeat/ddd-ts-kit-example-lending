import { describe, expect, it } from '@jest/globals';
import { AssessmentProposalService } from '@/contexts/credit-application/assessment/domain/services/assessment-proposal.service';
import { Money } from '@/shared-kernel/money.vo';

const proposal = new AssessmentProposalService();

describe('AssessmentProposalService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new AssessmentProposalService())).toEqual([]);
  });

  it('proposes approve when the band is green and the residual income is positive', () => {
    expect(proposal.outcomeOf('green', Money.ofCents(160_000))).toBe('approve');
  });

  it('proposes a refusal when the band is amber, even with a positive residual income', () => {
    expect(proposal.outcomeOf('amber', Money.ofCents(160_000))).toBe('refuse');
  });

  it('proposes a refusal when the residual income is not positive, even with a green band', () => {
    expect(proposal.outcomeOf('green', Money.ofCents(0))).toBe('refuse');
  });
});
