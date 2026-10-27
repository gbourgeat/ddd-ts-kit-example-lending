import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedExecutionScope } from '@ddd-ts-kit/kernel';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import {
  startSubmissionEnvironment,
  type SubmissionEnvironment,
} from '$test/e2e/support/credit-application/submission-environment';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };
const customerRelation = { object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' };

describe('Submit application, recorded with its integration event or not at all', () => {
  describe('when the outbox accepts the event', () => {
    let environment: SubmissionEnvironment;

    beforeAll(async () => {
      environment = await startSubmissionEnvironment('available');
    });

    afterAll(async () => {
      await environment.close();
    });

    beforeEach(async () => {
      await environment.reset();
    });

    it('commits the application and its event together: one event in its stream, one outbox row', async () => {
      await environment.relate(customerRelation);
      const customer = await environment.as({ id: 'customer-1', tenantId: 'bank-1' });

      const response = expectStatus(await customer.post('/applications', request), 201);
      const events = environment.persistence.eventSourcing(new FixedExecutionScope()).events;
      const { id } = response.body as { id: string };
      const stored = await events.readStream(`credit-application.credit-application-${id}`);
      const outbox = await environment.persistence.outbox.stats();

      expect(stored).toHaveLength(1);
      expect(outbox.pending).toBe(1);
    });
  });

  describe('when the outbox refuses the event once the application is recorded', () => {
    let environment: SubmissionEnvironment;

    beforeAll(async () => {
      environment = await startSubmissionEnvironment('refusing');
    });

    afterAll(async () => {
      await environment.close();
    });

    beforeEach(async () => {
      await environment.reset();
    });

    it('answers a failure and leaves neither the application in the event store nor an outbox row', async () => {
      await environment.relate(customerRelation);
      const customer = await environment.as({ id: 'customer-1', tenantId: 'bank-1' });

      const response = await customer.post('/applications', request);
      const events = environment.persistence.eventSourcing(new FixedExecutionScope()).events;
      const stored = await events.readAll(0, 10);
      const outbox = await environment.persistence.outbox.stats();

      expect(response.status).toBeGreaterThanOrEqual(500);
      expect(stored).toHaveLength(0);
      expect(outbox.pending).toBe(0);
    });
  });
});
