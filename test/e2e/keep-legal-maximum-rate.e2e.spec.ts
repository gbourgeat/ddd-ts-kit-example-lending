import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const legalMaximumRatePublished = 'credit-policy.legal-maximum-rate.published';

/** The system actor of credit-application that keeps the legal maximum rates: the reset of the database empties its relationships. */
const keepLegalMaximumRateSystemActor = 'system:system:credit-application.keep-legal-maximum-rate';

const legalMaximumRate = { category: 'car', rateBasisPoints: 1250, effectiveFrom: '2026-03-01' };

describe('Keep legal maximum rate, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    // The reset empties the relationships of the system actors too: the keeping of a maximum needs its line back.
    await application.relate({
      object: 'context:credit-application',
      relation: 'keeper',
      subject: keepLegalMaximumRateSystemActor,
    });
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/legal-maximum-rates/maximum-1');

    expectStatus(response, 401);
  });

  it('answers 403 to a caller who does not hold application.decide', async () => {
    await publishLegalMaximumRate();
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.get('/legal-maximum-rates/maximum-1');

    expectStatus(response, 403);
  });

  it('answers the category, the rate and the day of the maximum credit-policy published, to a decider', async () => {
    const legalMaximumRateId = await publishLegalMaximumRate();
    const decider = await deciderOf('decider-1');

    const answer = expectStatus(await decider.get(`/legal-maximum-rates/${legalMaximumRateId}`), 200);

    expect(answer.body).toEqual({
      legalMaximumRateId,
      category: 'car',
      rateBasisPoints: 1250,
      effectiveFrom: '2026-03-01T00:00:00.000Z',
    });
  });

  it('refuses a legal maximum rate that was never published, with the code UNKNOWN_LEGAL_MAXIMUM_RATE', async () => {
    const decider = await deciderOf('decider-1');

    const response = await decider.get('/legal-maximum-rates/unknown-legal-maximum-rate');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_LEGAL_MAXIMUM_RATE' });
  });

  /** Sets the maximum as credit-policy's operator does, waits for it to be kept, and returns the identifier credit-policy gave it. */
  async function publishLegalMaximumRate(): Promise<string> {
    const published = collectEvents(application.events, [legalMaximumRatePublished]);
    const operator = await operatorOf(application, 'ada');

    expectStatus(await operator.post('/legal-maximum-rates', legalMaximumRate), 201);
    await application.settled();
    published.stop();

    const [event] = published.received(legalMaximumRatePublished);

    return (event?.payload as { legalMaximumRateId: string }).legalMaximumRateId;
  }

  async function deciderOf(accountId: string): Promise<HttpClient> {
    await application.relate({
      object: 'context:credit-application',
      relation: 'operator',
      subject: `user:${accountId}`,
    });

    return application.as({ id: accountId, tenantId });
  }
});
