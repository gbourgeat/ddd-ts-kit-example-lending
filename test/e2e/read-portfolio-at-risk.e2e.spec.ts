import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { payOutLoan, runNightlyComputation } from '$test/e2e/support/servicing/nightly-run';
import { servicingOperator } from '$test/e2e/support/servicing/paid-out-loan';
import { daysAfter, runArrearsClassification } from '$test/e2e/support/servicing/arrears-classification';

/** A loan whose mandate the payer's bank refuses: the simulated provider refuses the mandates prefixed `refused-`. */
const REFUSED_LOAN_ID = 'refused-loan-1';
const ACCEPTED_LOAN_ID = 'loan-1';

/** The instant the first instalment of the loans of this spec falls due: the tenth of February. */
const FIRST_INSTALMENT_DUE_ON = new Date('2026-02-10T00:00:00.000Z');

/** Each loan of this spec is paid out for 1 000 euros: the amount of the payout the specs publish. */
const LOAN_PRINCIPAL_CENTS = 100_000;

describe('Read the portfolio at risk of the bank, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await openBank(application, BANK_TENANT);
  });

  it('answers the open loans per arrears bucket once the classification has placed them', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await payOutLoan(application, ACCEPTED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);
    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    const portfolio = await readPortfolioAtRisk(application);

    expect(portfolio.buckets).toEqual([
      { bucket: 'None', loans: 1, principalCents: LOAN_PRINCIPAL_CENTS },
      { bucket: 'OneToThirtyDays', loans: 1, principalCents: LOAN_PRINCIPAL_CENTS },
      { bucket: 'ThirtyOneToSixtyDays', loans: 0, principalCents: 0 },
      { bucket: 'SixtyOneToNinetyDays', loans: 0, principalCents: 0 },
      { bucket: 'OverNinetyDays', loans: 0, principalCents: 0 },
    ]);

    expect(portfolio.openPrincipalCents).toBe(2 * LOAN_PRINCIPAL_CENTS);
  });

  it('answers the share of the open principal 31 days past due and over, in basis points', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await payOutLoan(application, ACCEPTED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);
    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 70));

    const portfolio = await readPortfolioAtRisk(application);

    expect(portfolio.atRiskBasisPoints).toBe(5000);
  });
});

/** The portfolio at risk of the bank, read through the API by an operator of the context servicing. */
async function readPortfolioAtRisk(app: RunningApplication): Promise<{
  readonly buckets: readonly { readonly bucket: string; readonly loans: number; readonly principalCents: number }[];
  readonly openPrincipalCents: number;
  readonly atRiskBasisPoints: number;
}> {
  const operator = await servicingOperator(app, 'ada');
  const response = await operator.get('/loans/portfolio-at-risk');

  expectStatus(response, 200);

  return response.body as never;
}
