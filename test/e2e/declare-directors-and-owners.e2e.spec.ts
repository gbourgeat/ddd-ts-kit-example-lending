import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { aPersonBody, operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

describe('Declare directors and owners, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;
  let provider: { close: () => Promise<void> };

  beforeAll(async () => {
    provider = await startKeycloakStandIn();
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    await provider.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('declares each director and beneficial owner of the registered business, as an operator', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    const declared = await operator.post(`/customers/${customerId}/directors-and-owners`, {
      directors: [aPersonBody('DIRECTOR-1')],
      beneficialOwners: [aPersonBody('OWNER-1'), aPersonBody('OWNER-2')],
    });

    expectStatus(declared, 201);
    expect(declared.body).toEqual({ id: customerId });
  });

  it('refuses the owners of a business not registered yet, and declares nothing', async () => {
    const operator = await operatorOf(application, 'ada');
    const identified = await operator.post('/customers', aPersonBody('12AB34567'));
    const { id } = identified.body as { id: string };

    const declared = await operator.post(`/customers/${id}/directors-and-owners`, {
      directors: [aPersonBody('DIRECTOR-1')],
      beneficialOwners: [],
    });

    expect(declared.status).toBeGreaterThanOrEqual(400);
    expect(declared.body).toMatchObject({ code: 'BUSINESS_NOT_REGISTERED' });
  });

  it('answers 403 to a signed-in person who does not operate the context', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);
    const stranger = await application.as({ id: 'bob', roles: [] });

    const declared = await stranger.post(`/customers/${customerId}/directors-and-owners`, {
      directors: [aPersonBody('DIRECTOR-1')],
      beneficialOwners: [],
    });

    expectStatus(declared, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    await application.settled();

    const trace = await tracing.traceOf(async () => {
      expectStatus(
        await operator.post(`/customers/${customerId}/directors-and-owners`, {
          directors: [aPersonBody('DIRECTOR-1')],
          beneficialOwners: [],
        }),
        201,
      );
    });

    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /customers/:id/directors-and-owners',
        kind: 'SERVER',
        children: [
          {
            name: 'command DeclareDirectorsAndOwnersCommand',
            children: [
              { name: 'repository CustomerRepository.findById' },
              { name: 'repository CustomerRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event customer-due-diligence.customer.directors-and-owners-declared' }],
              },
            ],
          },
        ],
      },
    ]);
  });
});
