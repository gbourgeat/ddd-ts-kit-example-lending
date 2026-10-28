import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedExecutionScope } from '@ddd-ts-kit/kernel';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';

/** The document number, the address, the name and the birth date of an identification: each one sealed by its subject. */
const SEALED_VALUES_OF_AN_IDENTIFICATION = 4;

describe('Identify customer keeps the name and birth date sealed, end to end', () => {
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

  it('seals the name and the birth date of the identification with its document number and address', async () => {
    const ada = await operatorOf(application, 'ada');

    expectStatus(await ada.post('/customers', aPersonBody('12AB34567')), 201);

    const events = application.persistence.eventSourcing(new FixedExecutionScope()).events;
    const stored = JSON.stringify(await events.readAll(0, 10));

    expect(stored).toContain('customer-due-diligence.customer.identified');
    expect(stored).not.toContain('Ada Lovelace');
    expect(stored).not.toContain('1980-05-01');
    expect(stored.split('"$sealed"').length - 1).toBe(SEALED_VALUES_OF_AN_IDENTIFICATION);
  });
});
