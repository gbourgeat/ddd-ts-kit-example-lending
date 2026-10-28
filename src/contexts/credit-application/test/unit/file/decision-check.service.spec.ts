import { describe, expect, it } from '@jest/globals';
import { DecisionCheckService } from '@/contexts/credit-application/file/domain/services/decision-check.service';
import type { DecisionInput } from '@/contexts/credit-application/file/domain/values/decision-input';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';

const decidedAt = new Date('2026-02-01T00:00:00.000Z');
const assessed = { proposedOutcome: 'approve' };
const proposedRefusal = { proposedOutcome: 'refuse' };

describe('DecisionCheckService', () => {
  it('records the decision of an assessed application', () => {
    const event = new DecisionCheckService().eventOf('credit-application-1', file(), decision({}));

    expect(event).toBeInstanceOf(CreditApplicationDecided);
    expect(event).toMatchObject({ outcome: 'approve', deciderId: 'staff-1', level: 'advisor' });
  });

  it('refuses a second decision, by its code', () => {
    expect(() =>
      new DecisionCheckService().eventOf(
        'credit-application-1',
        file({ decision: { outcome: 'approve' } }),
        decision({}),
      ),
    ).toThrow(expect.objectContaining({ code: 'ALREADY_DECIDED' }));
  });

  it('refuses a decision on an application not assessed, by its code', () => {
    expect(() =>
      new DecisionCheckService().eventOf('credit-application-1', file({ lastAssessment: undefined }), decision({})),
    ).toThrow(expect.objectContaining({ code: 'NOT_ASSESSED' }));
  });

  it('refuses a decision over a proposed refusal not reviewed, by its code', () => {
    expect(() =>
      new DecisionCheckService().eventOf(
        'credit-application-1',
        file({ lastAssessment: proposedRefusal }),
        decision({}),
      ),
    ).toThrow(expect.objectContaining({ code: 'REFUSAL_NOT_REVIEWED' }));
  });

  it('refuses an approval over a confirmed proposed refusal, by its code', () => {
    const confirmed = file({ lastAssessment: proposedRefusal, refusalReviewConclusion: 'confirm' });

    expect(() => new DecisionCheckService().eventOf('credit-application-1', confirmed, decision({}))).toThrow(
      expect.objectContaining({ code: 'REFUSAL_PROPOSAL_STANDS' }),
    );
  });

  it('accepts a refusal over a confirmed proposed refusal', () => {
    const confirmed = file({ lastAssessment: proposedRefusal, refusalReviewConclusion: 'confirm' });
    const refusal = decision({ outcome: 'refuse', reasons: 'Confirmed by the review.', approvedAmountCents: 0 });

    expect(new DecisionCheckService().eventOf('credit-application-1', confirmed, refusal).outcome).toBe('refuse');
  });

  it('accepts any outcome over an overturned proposed refusal', () => {
    const overturned = file({ lastAssessment: proposedRefusal, refusalReviewConclusion: 'overturn' });

    expect(new DecisionCheckService().eventOf('credit-application-1', overturned, decision({})).outcome).toBe(
      'approve',
    );
  });

  it('refuses a refusal without reasons, by its code', () => {
    expect(() =>
      new DecisionCheckService().eventOf('credit-application-1', file(), decision({ outcome: 'refuse', reasons: ' ' })),
    ).toThrow(expect.objectContaining({ code: 'INVALID_DECISION_REASONS' }));
  });

  it('refuses an approval with conditions whose lower amount is not within the requested one, by its code', () => {
    const conditional = decision({
      outcome: 'approve-with-conditions',
      conditions: 'A guarantor.',
      approvedAmountCents: 2_000_000,
    });

    expect(() => new DecisionCheckService().eventOf('credit-application-1', file(), conditional)).toThrow(
      expect.objectContaining({ code: 'INVALID_DECISION_CONDITIONS' }),
    );
  });
});

function decision(overrides: Partial<DecisionInput>): DecisionInput {
  return {
    deciderId: 'staff-1',
    level: 'advisor',
    outcome: 'approve',
    reasons: '',
    conditions: '',
    approvedAmountCents: 1_234_567,
    decidedAt,
    ...overrides,
  };
}

function file(overrides: object = {}) {
  return {
    decision: undefined,
    lastAssessment: assessed,
    refusalReviewConclusion: undefined,
    amount: { cents: 1_234_567 },
    branchId: 'branch-1',
    ...overrides,
  };
}
