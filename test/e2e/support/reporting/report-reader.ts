import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { REPORTING_TENANT } from '$test/e2e/support/reporting/reporting-events';

/** One branch of the portfolio at risk report, as the API answers it. */
export interface PortfolioAtRiskBranch {
  readonly branchId: string;
  readonly paidOutCents: number;
  readonly oneToThirtyDaysCents: number;
  readonly thirtyOneToSixtyDaysCents: number;
  readonly sixtyOneToNinetyDaysCents: number;
  readonly overNinetyDaysCents: number;
  readonly atRiskCents: number;
  readonly portfolioAtRiskBasisPoints: number;
}

/** Makes `id` an operator of reporting, which holds the permission to read its reports, and returns a client calling as them. */
export async function reportReaderOf(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:reporting', relation: 'operator', subject: `user:${id}` });

  return application.as({ id, tenantId: REPORTING_TENANT });
}

/** One branch of the monthly report, as the API answers it. */
export interface MonthlyReportBranch {
  readonly branchId: string;
  readonly month: string;
  readonly applicationCount: number;
  readonly applicationAmountCents: number;
  readonly decisionCount: number;
  readonly approvalCount: number;
  readonly exceptionCount: number;
  readonly approvalRateBasisPoints: number;
  readonly exceptionShareBasisPoints: number;
  readonly portfolioAtRiskBasisPoints: number;
}

/** The monthly report of a month, as the reader of reports gets it through the API: the answer must be a success. */
export async function readMonthlyReport(reader: HttpClient, month: string): Promise<readonly MonthlyReportBranch[]> {
  const response = await reader.get(`/reports/monthly?month=${month}`);

  expectStatus(response, 200);

  return (response.body as { items: MonthlyReportBranch[] }).items;
}

/** The portfolio at risk of each branch, as the reader of reports gets it through the API: the answer must be a success. */
export async function readPortfolioAtRisk(reader: HttpClient): Promise<readonly PortfolioAtRiskBranch[]> {
  const response = await reader.get('/reports/portfolio-at-risk');

  expectStatus(response, 200);

  return (response.body as { branches: PortfolioAtRiskBranch[] }).branches;
}
