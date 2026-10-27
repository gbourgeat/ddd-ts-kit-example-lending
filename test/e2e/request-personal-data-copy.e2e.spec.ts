import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

describe('Request personal data copy, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/data-subjects/customer-1/copies', {});

    expectStatus(response, 401);
  });

  it('refuses with 403 an actor who is neither the customer nor an operator of data-protection', async () => {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/data-subjects/customer-1/copies', {});

    expectStatus(response, 403);
  });

  it('does not refuse the customer asking for a copy of their own data', async () => {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const customer = await application.as({ id: 'customer-1' });

    const response = await customer.post('/data-subjects/customer-1/copies', {});

    // The link comes from the object store, which the in-process test application does not reach: the
    // authorization of the self passes, the gathering runs, and the answer is then the store's failure.
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});
