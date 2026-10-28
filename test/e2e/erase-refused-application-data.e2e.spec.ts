import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { openBank } from '$test/e2e/support/credit-application/broker-world';
import {
  analystOf,
  publishScoringVersion,
  readAccountsAndRegister,
  submittedApplication,
} from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  confirmRefusal,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const ERASE_JOB = 'credit-application.erase-personal-data-past-retention';
const REFUSED_ON = new Date('2026-03-10T09:00:00.000Z');
const SEVEN_MONTHS_LATER = new Date('2026-10-12T03:00:00.000Z');
const FIVE_MONTHS_LATER = new Date('2026-08-10T03:00:00.000Z');

const REAL_TIMERS = [
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  'nextTick',
  'queueMicrotask',
] as const;

const refusal = {
  outcome: 'refuse',
  reasons: 'The debt to income ratio is above the policy.',
  conditions: '',
  approvedAmountCents: 0,
};

describe('Erase the personal data of a refused application, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await openBank(application);
    await keepDecisionReads(application);
    await publishDelegationTable(application);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the account information of a refused application before the six months are over', async () => {
    const { applicationId, documentKey, customerId } = await refusedApplication();

    await runNightlyErasure(FIVE_MONTHS_LATER);

    expectStatus(await readDocument({ applicationId, documentKey, customerId }, FIVE_MONTHS_LATER), 200);
  });

  it('no longer returns the account information of an application refused more than six months before', async () => {
    const { applicationId, documentKey, customerId } = await refusedApplication();

    await runNightlyErasure(SEVEN_MONTHS_LATER);

    const response = await readDocument({ applicationId, documentKey, customerId }, SEVEN_MONTHS_LATER);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'UNKNOWN_ENTRY' });
  });

  /** An application refused on REFUSED_ON, the figures read from its accounts being kept in its file. */
  async function refusedApplication(): Promise<{ applicationId: string; documentKey: string; customerId: string }> {
    jest.useFakeTimers({ now: REFUSED_ON, doNotFake: [...REAL_TIMERS] });
    application.incidents.record('Ada Lovelace', new Date('1980-05-01T00:00:00.000Z'));
    const { applicationId, applicant, customerId } = await submittedApplication(application);

    await readAccountsAndRegister(application, applicationId, applicant);
    await publishScoringVersion(application);

    expectStatus(
      await (await analystOf(application, await appointStaff(application, 'credit-analyst'))).post(
        `/applications/${applicationId}/assessment`,
        {},
      ),
      201,
    );

    await confirmRefusal(application, applicationId, await appointStaff(application, 'credit-analyst'));
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, refusal), 201);

    return {
      applicationId,
      customerId,
      documentKey: `${applicationId}/accounts/${REFUSED_ON.toISOString().replace(/[:.]/g, '-')}.json`,
    };
  }

  async function readDocument(file: { applicationId: string; documentKey: string; customerId: string }, now: Date) {
    jest.setSystemTime(now);

    await application.relate({
      object: `application:${file.applicationId}`,
      relation: 'co-borrower',
      subject: 'user:reader-1',
    });

    const reader = await application.as({ id: 'reader-1', tenantId: 'acme-bank' });

    return reader.get(`/applications/${file.applicationId}/documents/${encodeURIComponent(file.documentKey)}`);
  }

  async function runNightlyErasure(now: Date): Promise<unknown> {
    jest.setSystemTime(now);
    const run = await application.runJob(ERASE_JOB);

    await application.settled();

    return run;
  }
});
