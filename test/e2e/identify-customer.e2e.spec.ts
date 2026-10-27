import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';

describe('Identify customer, end to end', () => {
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
    const response = await application.client.post('/customers', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/customers', aPersonBody('12AB34567'));

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const ada = await operatorOf(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/customers', aPersonBody('12AB34567')), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "identify customer" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /customers',
        kind: 'SERVER',
        children: [
          {
            name: 'command IdentifyCustomerCommand',
            children: [
              { name: 'external ScreeningProvider.screen' },
              {
                name: 'unit-of-work before-commit',
                children: [
                  {
                    name: 'domain-event customer-due-diligence.customer.identified',
                    children: [
                      {
                        name: 'handler CustomerIdentifiedPublisher',
                        children: [{ name: 'outbox append customer-due-diligence.customer.identified' }],
                      },
                      {
                        name: 'handler CustomerFileOnIdentifiedEventHandler',
                        children: [{ name: 'repository CustomerFileProjection.recordIdentified' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('identifies a person the screening holds no match for, and answers its identifier', async () => {
    const ada = await operatorOf(application, 'ada');

    const identified = await ada.post('/customers', aPersonBody('12AB34567'));

    expectStatus(identified, 201);
    expect(identified.body).toEqual({ id: expect.any(String) });
  });

  it('refuses to identify a person whose identity document expired on the day, with its documented problem', async () => {
    const ada = await operatorOf(application, 'ada');

    const identified = await ada.post('/customers', {
      ...aPersonBody('12AB34567'),
      documentExpiresOn: '2020-01-01T00:00:00.000Z',
    });

    expect(identified.status).toBeGreaterThanOrEqual(400);
    expect(identified.body).toMatchObject({ code: 'IDENTITY_DOCUMENT_EXPIRED' });
  });

  it.todo('publishes the integration events other contexts rely on');
  it.todo('lets a possible match be observed through the started application');
});
