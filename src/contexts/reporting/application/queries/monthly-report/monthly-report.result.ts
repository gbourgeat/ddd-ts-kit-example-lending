import type { Page } from '@ddd-ts-kit/kernel';

/**
 * One branch of the monthly report: what the branch brought in the month and how its decisions went, with the portfolio at
 * risk it holds at the time of the query. Rates are in basis points, rounded down: integer maths only.
 */
export interface MonthlyReportItem {
  /** The branch, as the page is keyed: the identifier the search orders and the scope narrows on. */
  readonly id: string;
  readonly branchId: string;
  /** The month, `YYYY-MM` in UTC. */
  readonly month: string;
  /** The applications submitted on the branch in the month. */
  readonly applicationCount: number;
  /** The amount requested by those applications, in cents. */
  readonly applicationAmountCents: number;
  /** The decisions of the branch in the month. */
  readonly decisionCount: number;
  /** The decisions that approve the application: an approval, or an approval with conditions. */
  readonly approvalCount: number;
  /** The decisions that are exceptions to the policy. */
  readonly exceptionCount: number;
  /** The approved decisions over the decisions of the month, in basis points: zero when there is no decision. */
  readonly approvalRateBasisPoints: number;
  /** The exception decisions over the decisions of the month, in basis points: zero when there is no decision. */
  readonly exceptionShareBasisPoints: number;
  /** The share of the portfolio paid out on the branch that is 31 days past due and over, in basis points. */
  readonly portfolioAtRiskBasisPoints: number;
}

/** The fields a client may sort the monthly report by: the branch. */
export type MonthlyReportSort = 'id';

/** One page of the monthly report of a month: one line per branch that brought in or decided an application in it. */
export type MonthlyReportResult = Page<MonthlyReportItem>;
