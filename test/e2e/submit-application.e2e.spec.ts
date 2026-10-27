import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };

describe('Submit application, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications', request);

    expectStatus(response, 401);
  });

  it('answers 403 to a caller who is not the customer the application is for', async () => {
    const stranger = await application.as({ id: 'stranger-1', tenantId: 'bank-1' });

    const response = await stranger.post('/applications', request);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: expect.any(String) });
  });

  it('lets a customer submit an application: 201, its Location, and its amount in whole cents', async () => {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const customer = await application.as({ id: 'customer-1', tenantId: 'bank-1' });

    const response = expectStatus(await customer.post('/applications', request), 201);

    expect(response.headers['location']).toMatch(/^\/applications\/.+/);
    expect(response.body).toMatchObject({ id: expect.any(String), amount: { cents: 1234567, currency: 'EUR' } });
  });

  it('answers the refusal code of an amount that is not a positive whole number of cents', async () => {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const customer = await application.as({ id: 'customer-1', tenantId: 'bank-1' });

    const response = await customer.post('/applications', { ...request, amount: { cents: 0, currency: 'EUR' } });

    expect(response.body).toMatchObject({ code: 'INVALID_AMOUNT' });
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const customer = await application.as({ id: 'customer-1', tenantId: 'bank-1' });

    const trace = await tracing.traceOf(async () => {
      expectStatus(await customer.post('/applications', request), 201);
    });

    // Exact on names and structure. Once "submit application" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>` (US0.05).
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /applications',
        kind: 'SERVER',
        children: [
          {
            name: 'command SubmitApplicationCommand',
            children: [{ name: 'repository CreditApplicationRepository.save' }],
          },
        ],
      },
    ]);
  });

  it.todo('publishes the integration events other contexts rely on (US0.05)');
});
