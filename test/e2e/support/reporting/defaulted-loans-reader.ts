import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';

/** One loan in default, as the API answers it. */
export interface DefaultedLoanLine {
  readonly loanId: string;
  readonly branchId: string;
  readonly principalCents: number;
  readonly defaultedAt: string;
}

/** The loans in default, as the supervisor reads them through the API: the answer must be a success. */
export async function readDefaultedLoans(supervisor: HttpClient): Promise<readonly DefaultedLoanLine[]> {
  const response = await supervisor.get('/reports/defaulted-loans');

  expectStatus(response, 200);

  return (response.body as { loans: DefaultedLoanLine[] }).loans;
}
