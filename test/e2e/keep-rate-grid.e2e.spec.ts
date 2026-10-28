import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const rateGridPublished = 'credit-policy.rate-grid.published';

/** The system actor of credit-application that keeps the rate grids: the reset of the database empties its relationships. */
const keepRateGridSystemActor = 'system:system:credit-application.keep-rate-grid';

const rateGrid = { productId: 'personal-loan', effectiveFrom: '2026-03-01' };

describe('Keep rate grid, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    // The reset empties the relationships of the system actors too: the keeping of a grid needs its line back.
    await application.relate({
      object: 'context:credit-application',
      relation: 'keeper',
      subject: keepRateGridSystemActor,
    });
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/rate-grids/rate-grid-1');

    expectStatus(response, 401);
  });

  it('answers 403 to a caller who does not hold application.decide', async () => {
    await publishRateGrid();
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.get('/rate-grids/rate-grid-1');

    expectStatus(response, 403);
  });

  it('answers the product and the day of the grid credit-policy published, to a decider', async () => {
    const rateGridId = await publishRateGrid();
    const decider = await deciderOf('decider-1');

    const answer = expectStatus(await decider.get(`/rate-grids/${rateGridId}`), 200);

    expect(answer.body).toEqual({
      rateGridId,
      productId: 'personal-loan',
      effectiveFrom: '2026-03-01T00:00:00.000Z',
    });
  });

  it('refuses a rate grid that was never published, with the code UNKNOWN_RATE_GRID', async () => {
    const decider = await deciderOf('decider-1');

    const response = await decider.get('/rate-grids/unknown-rate-grid');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_RATE_GRID' });
  });

  /** Sets the grid as credit-policy's operator does, waits for it to be kept, and returns the identifier credit-policy gave it. */
  async function publishRateGrid(): Promise<string> {
    const published = collectEvents(application.events, [rateGridPublished]);
    const operator = await operatorOf(application, 'ada');

    expectStatus(await operator.post('/rate-grids', rateGrid), 201);
    await application.settled();
    published.stop();

    const [event] = published.received(rateGridPublished);

    return (event?.payload as { rateGridId: string }).rateGridId;
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
