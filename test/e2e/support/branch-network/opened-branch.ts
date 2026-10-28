import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';

/** Opens a branch through the operator's client and returns its id. */
export async function openedBranchOf(operator: HttpClient): Promise<string> {
  const opened = await operator.post('/branches', {});

  expectStatus(opened, 201);

  return (opened.body as { id: string }).id;
}
