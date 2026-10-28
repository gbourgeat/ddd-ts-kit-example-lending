import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { complianceOfficer, raisedAlert } from '$test/e2e/support/financial-crime/alert-world';
import { storyOf } from '$test/e2e/support/story-of';

describe('Close alert, end to end', () => {
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
    const response = await application.client.post('/alerts/id-1/closure', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/alerts/id-1/closure', {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/alerts/alert-1/closure', { reason: 'Customer confirmed the payer' }), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "close alert" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /alerts/:id/closure',
        kind: 'SERVER',
        children: [
          {
            name: 'command CloseAlertCommand',
            children: [{ name: 'repository AlertRepository.findById' }, { name: 'repository AlertRepository.save' }],
          },
        ],
      },
    ]);
  });

  it('closes a raised alert with the reason the compliance officer gives, and answers 201', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');

    expectStatus(await ada.post('/alerts/alert-1/closure', { reason: 'Customer confirmed the payer' }), 201);

    const row = await application.persistence.database
      .client()
      .financialCrimeAlert.findUniqueOrThrow({ where: { id: 'alert-1' } });

    expect(row.closureReason).toBe('Customer confirmed the payer');
  });

  it('announces no integration event when an alert is closed', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');
    const recorder = collectEvents(application.events, ['financial-crime.alert.closed']);

    expectStatus(await ada.post('/alerts/alert-1/closure', { reason: 'Customer confirmed the payer' }), 201);

    await application.settled();
    recorder.stop();

    expect(recorder.received('financial-crime.alert.closed')).toHaveLength(0);
  });

  it('refuses a closure with a blank reason, with the code CLOSURE_REASON_MISSING', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');

    const response = await ada.post('/alerts/alert-1/closure', { reason: '  ' });

    expect(response.body).toMatchObject({ code: 'CLOSURE_REASON_MISSING' });
  });
});
