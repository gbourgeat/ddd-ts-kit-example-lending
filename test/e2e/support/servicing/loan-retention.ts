import { jest } from '@jest/globals';
import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { servicingOperator } from '$test/e2e/support/servicing/paid-out-loan';

/** The instant of the nightly run of servicing, which erases the loans closed ten years before it. */
export const NIGHTLY_RUN = new Date('2026-01-10T03:00:00.000Z');

/** A signed-in operator of servicing at the instant `now`: the clock of the platform is the one the test moves. */
export async function servicingOperatorAt(application: RunningApplication, id: string, now: Date): Promise<HttpClient> {
  jest.useFakeTimers({
    now,
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'nextTick',
      'queueMicrotask',
    ],
  });

  return servicingOperator(application, id);
}
