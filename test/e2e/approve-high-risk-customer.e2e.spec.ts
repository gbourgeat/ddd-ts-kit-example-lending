import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

describe('Approve high risk customer, end to end', () => {
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
    const response = await application.client.post('/customers/customer-id-1/high-risk-approval', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/customers/customer-id-1/high-risk-approval', {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    expectStatus(await operator.put(`/customers/${customerId}/risk`, { rating: 'high' }), 200);

    const trace = await tracing.traceOf(async () => {
      expectStatus(await operator.post(`/customers/${customerId}/high-risk-approval`, {}), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "approve high risk customer" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /customers/:customerId/high-risk-approval',
        kind: 'SERVER',
        children: [
          {
            name: 'command ApproveHighRiskCustomerCommand',
            children: [
              { name: 'repository CustomerRepository.findById' },
              { name: 'repository CustomerRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event customer-due-diligence.customer.high-risk-approved' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('approves a customer rated high risk, as compliance', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    expectStatus(await operator.put(`/customers/${customerId}/risk`, { rating: 'high' }), 200);

    const approved = await operator.post(`/customers/${customerId}/high-risk-approval`, {});

    expectStatus(approved, 201);
    expect(approved.body).toEqual({ id: customerId });
  });

  it('refuses the approval of a customer who is rated medium risk, with CUSTOMER_NOT_HIGH_RISK', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    expectStatus(await operator.put(`/customers/${customerId}/risk`, { rating: 'medium' }), 200);

    const approved = await operator.post(`/customers/${customerId}/high-risk-approval`, {});

    expect(approved.status).toBeGreaterThanOrEqual(400);
    expect(approved.body).toMatchObject({ code: 'CUSTOMER_NOT_HIGH_RISK' });
  });

  it('refuses the approval of a customer never rated, with CUSTOMER_NOT_HIGH_RISK', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);

    const approved = await operator.post(`/customers/${customerId}/high-risk-approval`, {});

    expect(approved.status).toBeGreaterThanOrEqual(400);
    expect(approved.body).toMatchObject({ code: 'CUSTOMER_NOT_HIGH_RISK' });
  });

  it('refuses the approval of an unknown customer, with UNKNOWN_CUSTOMER', async () => {
    const operator = await operatorOf(application, 'ada');

    const approved = await operator.post('/customers/unknown/high-risk-approval', {});

    expect(approved.status).toBeGreaterThanOrEqual(400);
    expect(approved.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });
});
