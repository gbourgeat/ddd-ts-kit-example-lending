import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

describe('List applications, end to end', () => {
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
    const response = await application.client.get('/applications');

    expectStatus(response, 401);
  });

  it('answers an empty page to a caller who holds no application', async () => {
    const stranger = await application.as({ id: 'stranger-1', tenantId: 'bank-1' });

    const listed = expectStatus(await stranger.get('/applications'), 200);

    expect(listed.body).toMatchObject({ items: [] });
  });

  it('lists an application to the broker who brought it, and to no one else', async () => {
    const id = await submitAsCustomer();

    await application.relate({ object: `application:${id}`, relation: 'broker', subject: 'user:broker-1' });

    const broker = await application.as({ id: 'broker-1', tenantId: 'bank-1' });
    const stranger = await application.as({ id: 'stranger-1', tenantId: 'bank-1' });

    expect(expectStatus(await broker.get('/applications'), 200).body).toMatchObject({ items: [aLine(id)] });
    expect(expectStatus(await stranger.get('/applications'), 200).body).toMatchObject({ items: [] });
  });

  it('lists an application to the advisor whose portfolio holds the applicant', async () => {
    const id = await submitAsCustomer();

    await application.relate({ object: `application:${id}`, relation: 'customer', subject: 'customer:customer-1' });

    await application.relate({
      object: 'customer:customer-1',
      relation: 'portfolio',
      subject: 'portfolio:portfolio-1',
    });

    await application.relate({ object: 'portfolio:portfolio-1', relation: 'advisor', subject: 'user:advisor-1' });

    const advisor = await application.as({ id: 'advisor-1', tenantId: 'bank-1' });

    expect(expectStatus(await advisor.get('/applications'), 200).body).toMatchObject({ items: [aLine(id)] });
  });

  /** The customer gets its relationship to itself, then submits one loan: the identifier of the application comes back. */
  async function submitAsCustomer(): Promise<string> {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const customer: HttpClient = await application.as({ id: 'customer-1', tenantId: 'bank-1' });

    const submitted = expectStatus(
      await customer.post('/applications', {
        productId: 'personal-loan',
        amount: { cents: 1234567, currency: 'EUR' },
        durationMonths: 60,
      }),
      201,
    );

    return (submitted.body as { id: string }).id;
  }
});

function aLine(id: string): { id: string; applicantId: string; requestedAmountCents: number; durationMonths: number } {
  return { id, applicantId: 'customer-1', requestedAmountCents: 1234567, durationMonths: 60 };
}
