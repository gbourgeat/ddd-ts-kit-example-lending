import { describe, expect, it } from '@jest/globals';
import { decisionViewOf } from '@/contexts/credit-application/decision/application/projections/decision-view-of.projection';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import {
  CreditApplicationAssessed,
  type AssessmentRecord,
} from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import { CreditApplicationRegisterConsulted } from '@/contexts/credit-application/file/domain/events/credit-application-register-consulted.event';
import { CreditApplicationRefusalReviewed } from '@/contexts/credit-application/file/domain/events/credit-application-refusal-reviewed.event';
import type { CreditApplicationEvent } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';

const applicationId = 'application-1';

const assessment: AssessmentRecord = {
  modelVersion: 'scoring-v3',
  debtToIncomePercent: 31,
  repaymentIncidents: 0,
  residualIncomeCents: 180_000,
  score: 712,
  band: 'green',
  factors: ['a long history of repayments'],
  proposedOutcome: 'approve',
};

const lowerAssessment: AssessmentRecord = { ...assessment, score: 640, band: 'amber', proposedOutcome: 'refuse' };

describe('Decision view of an application', () => {
  it('shows the decision with the assessment, the register answer and their assessor, as the file recorded them', () => {
    const history: CreditApplicationEvent[] = [
      assessed(assessment, 'analyst-1', 1),
      registerConsulted(false, 2),
      decided(3),
    ];

    expect(decisionViewOf(applicationId, history)).toEqual({
      applicationId,
      decision: {
        outcome: 'approve',
        deciderId: 'advisor-1',
        level: 'advisor',
        reasons: '',
        conditions: '',
        approvedAmountCents: 1_000_000,
        branchId: 'branch-1',
        exception: false,
        decidedAt: at(3),
      },
      assessment: { ...assessment, assessorId: 'analyst-1', assessedAt: at(1) },
      register: { parties: [{ customerId: 'customer-1', listed: false }] },
      refusalReview: undefined,
    });
  });

  it('ignores what the file recorded after the decision', () => {
    const history: CreditApplicationEvent[] = [
      assessed(assessment, 'analyst-1', 1),
      decided(2),
      assessed(lowerAssessment, 'analyst-2', 3),
      registerConsulted(true, 4),
    ];

    const view = decisionViewOf(applicationId, history);

    expect(view?.assessment).toEqual({ ...assessment, assessorId: 'analyst-1', assessedAt: at(1) });
    expect(view?.register).toBeUndefined();
  });

  it('shows the refusal review of the assessment the decider saw', () => {
    const history: CreditApplicationEvent[] = [
      assessed(assessment, 'analyst-1', 1),
      reviewed('confirm', 2),
      decided(3),
    ];

    expect(decisionViewOf(applicationId, history)?.refusalReview).toEqual({
      reviewerId: 'reviewer-1',
      conclusion: 'confirm',
      reason: 'A homonym, not the applicant.',
      reviewedAt: at(2),
    });
  });

  it('forgets a review given for an earlier assessment than the one the decider saw', () => {
    const history: CreditApplicationEvent[] = [
      assessed(assessment, 'analyst-1', 1),
      reviewed('confirm', 2),
      assessed(lowerAssessment, 'analyst-2', 3),
      decided(4),
    ];

    expect(decisionViewOf(applicationId, history)?.refusalReview).toBeUndefined();
  });

  it('answers no view for an application the file records no decision of', () => {
    expect(decisionViewOf(applicationId, [assessed(assessment, 'analyst-1', 1)])).toBeUndefined();
  });
});

function at(day: number): Date {
  return new Date(`2026-03-${String(day).padStart(2, '0')}T10:00:00.000Z`);
}

function assessed(record: AssessmentRecord, assessorId: string, day: number): CreditApplicationAssessed {
  return new CreditApplicationAssessed(applicationId, at(day), record, assessorId);
}

function registerConsulted(listed: boolean, day: number): CreditApplicationRegisterConsulted {
  return new CreditApplicationRegisterConsulted(applicationId, at(day), [{ customerId: 'customer-1', listed }]);
}

function reviewed(conclusion: 'confirm' | 'overturn', day: number): CreditApplicationRefusalReviewed {
  return new CreditApplicationRefusalReviewed(
    applicationId,
    at(day),
    'reviewer-1',
    conclusion,
    'A homonym, not the applicant.',
  );
}

function decided(day: number): CreditApplicationDecided {
  return new CreditApplicationDecided(
    applicationId,
    at(day),
    DecisionOutcome.Approve,
    'advisor-1',
    'advisor',
    '',
    '',
    1_000_000,
    'branch-1',
    false,
  );
}
