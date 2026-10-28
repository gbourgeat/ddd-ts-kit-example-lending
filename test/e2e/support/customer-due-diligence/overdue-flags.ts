import { jest } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The clock of the application is the `Date` the process reads: only it moves, the timers keep running. */
const TIMERS_KEPT_REAL = [
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  'nextTick',
  'queueMicrotask',
  'hrtime',
  'performance',
] as const;

/** An operator signing in at the given day: the clock of the application moves there, the timers keep running. */
export async function operatorAt(application: RunningApplication, now: Date): Promise<HttpClient> {
  jest.useFakeTimers({ now, doNotFake: [...TIMERS_KEPT_REAL] });

  return operatorOf(application, 'ada');
}

/** A customer identified and registered, rated at the given level, and whose due diligence is refreshed on the day of the operator. */
export async function refreshedCustomer(operator: HttpClient, rating: 'low' | 'medium' | 'high'): Promise<string> {
  const customerId = await registeredCustomer(operator);

  expectStatus(await operator.put(`/customers/${customerId}/risk`, { rating }), 200);

  expectStatus(
    await operator.post(`/customers/${customerId}/refresh`, { name: 'Ada Lovelace', birthDate: '1990-01-01' }),
    201,
  );

  return customerId;
}

/** The day the due diligence was flagged overdue, as the read of the due diligence gives it back. */
export async function flaggedOverdueOn(operator: HttpClient, customerId: string): Promise<string | undefined> {
  const read = await operator.get(`/customers/${customerId}/due-diligence`);

  expectStatus(read, 200);

  return (read.body as { flaggedOverdueOn?: string }).flaggedOverdueOn;
}
