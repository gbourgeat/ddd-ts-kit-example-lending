import { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';
import type { ApplicantInputs } from '@/contexts/credit-scoring/domain/value-objects/applicant-inputs.vo';

/** A debt ratio above this percentage takes a large share of the income. */
const LARGE_DEBT_SHARE_ABOVE_PERCENT = 40;
/** A debt ratio above this percentage, up to the limit, is close to the limit. */
const CLOSE_TO_LIMIT_ABOVE_PERCENT = 33;
const LARGE_DEBT_SHARE_HARM = 30;
const CLOSE_TO_LIMIT_HARM = 15;
const REPAYMENT_INCIDENT_HARM = 25;
/** Residual income under this amount, in cents, is low. */
const LOW_RESIDUAL_INCOME_CENTS = 80000;
const LOW_RESIDUAL_INCOME_HARM = 20;

const LARGE_DEBT_SHARE_WORDS = 'Your debts take a large share of your income';
const CLOSE_TO_LIMIT_WORDS = 'Your debts take a share of your income that is close to the limit';
const REPAYMENT_INCIDENT_WORDS = 'A repayment incident is registered in your name';
const LOW_RESIDUAL_INCOME_WORDS = 'The income left after your costs is low';

/** The factors of an applicant: each fact of the inputs that lowers the score, with its harm. */
export class ApplicantFactorsService {
  loweringFactorsOf(inputs: ApplicantInputs): Factor[] {
    return [
      ...debtFactors(inputs.debtToIncomePercent),
      ...incidentFactors(inputs.repaymentIncidents),
      ...residualIncomeFactors(inputs.residualIncomeCents),
    ];
  }
}

function debtFactors(debtToIncomePercent: number): Factor[] {
  if (debtToIncomePercent > LARGE_DEBT_SHARE_ABOVE_PERCENT) {
    return [Factor.create(LARGE_DEBT_SHARE_WORDS, LARGE_DEBT_SHARE_HARM)];
  }

  if (debtToIncomePercent > CLOSE_TO_LIMIT_ABOVE_PERCENT) {
    return [Factor.create(CLOSE_TO_LIMIT_WORDS, CLOSE_TO_LIMIT_HARM)];
  }

  return [];
}

function incidentFactors(repaymentIncidents: number): Factor[] {
  return Array.from({ length: repaymentIncidents }, () =>
    Factor.create(REPAYMENT_INCIDENT_WORDS, REPAYMENT_INCIDENT_HARM),
  );
}

function residualIncomeFactors(residualIncomeCents: number): Factor[] {
  if (residualIncomeCents < LOW_RESIDUAL_INCOME_CENTS) {
    return [Factor.create(LOW_RESIDUAL_INCOME_WORDS, LOW_RESIDUAL_INCOME_HARM)];
  }

  return [];
}
