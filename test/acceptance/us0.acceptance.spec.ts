import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, pending } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

// The acceptance of US0, written before its code: one scenario per acceptance criterion, as a client sees it through the API (routes, answers, integration events), never through a class of src/ nor the database. A scenario's title starts with the rows that make it pass, then the criterion it proves (`#US0.01 AC1 ...`); its body stays wrapped in `pending(...)` of `@ddd-ts-kit/testing/e2e` until they are built, and the commit of the last one removes the wrapper. Once written, `npx ddd-ts-kit acceptance US0 --lock`: a locked scenario then changes only with its criterion. `npx ddd-ts-kit acceptance US0 --gate written` says when the code may start.
// Rows to cover: #US0.04 Submit an application (walking skeleton: one command, one route, one e2e).
describe('US0, acceptance', () => {
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

  it(
    '#US0.04 #US0.01 #US0.02 #US0.06 AC1 a customer of the bank submits an application for one loan and gets back its identifier, a Location and the amount in whole cents',
    pending(async () => {
      const customer = await application.as({ id: 'customer-1', tenantId: 'bank-1' });

      const response = expectStatus(
        await customer.post('/applications', {
          productId: 'personal-loan',
          amount: { cents: 1234567, currency: 'EUR' },
          durationMonths: 60,
        }),
        201,
      );

      expect(response.headers['location']).toMatch(/^\/applications\/.+/);
      expect(response.body).toMatchObject({ id: expect.any(String), amount: { cents: 1234567, currency: 'EUR' } });
    }),
  );

  it(
    '#US0.04 #US0.02 #US0.03 AC2 a caller without the right to submit an application is refused with the refusal code, and no application is recorded',
    pending(async () => {
      const stranger = await application.as({ id: 'stranger-1', tenantId: 'bank-1' });

      const response = await stranger.post('/applications', {
        productId: 'personal-loan',
        amount: { cents: 500000, currency: 'EUR' },
        durationMonths: 36,
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: expect.any(String) });
      const listed = expectStatus(await stranger.get('/applications'), 200);

      expect(listed.body).toMatchObject({ items: [] });
    }),
  );

  it(
    '#US0.05 AC3 the submission is published once, as an integration event carrying the application identifier, in the same transaction that records it',
    pending(async () => {
      const submitted = collectEvents(application.events, ['credit-application.credit-application.submitted']);
      const customer = await application.as({ id: 'customer-1', tenantId: 'bank-1' });

      const response = expectStatus(
        await customer.post('/applications', {
          productId: 'personal-loan',
          amount: { cents: 1234567, currency: 'EUR' },
          durationMonths: 60,
        }),
        201,
      );

      await application.settled();

      const events = submitted.received();

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ applicationId: (response.body as { id: string }).id });
    }),
  );
});
