import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const tenantId = 'acme-bank';
const filedEvent = 'financial-crime.suspicious-activity-report.filed';

describe('File suspicious activity report, end to end', () => {
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
    const response = await application.client.post('/alerts/id-1/reports', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.post('/alerts/id-1/reports', {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await application.relate({ object: 'context:financial-crime', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', tenantId });

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/alerts/id-1/reports', {}), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "file suspicious activity report" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /alerts/:id/reports',
        kind: 'SERVER',
        children: [
          {
            name: 'command FileSuspiciousActivityReportCommand',
            children: [
              { name: 'external FinancialIntelligenceUnit.fileReport', status: 'ERROR' },
              { name: 'repository SuspiciousActivityReportRepository.save' },
            ],
          },
        ],
      },
    ]);
  });

  it('keeps the report pending and answers 201 with its identifier while the financial intelligence unit is down', async () => {
    await application.relate({ object: 'context:financial-crime', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', tenantId });

    const response = await ada.post('/alerts/id-1/reports', {});

    expectStatus(response, 201);
    expect(response.body).toMatchObject({ id: expect.any(String) });
  });

  it('announces no filing while the financial intelligence unit is down', async () => {
    await application.relate({ object: 'context:financial-crime', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', tenantId });
    const recorder = collectEvents(application.events, [filedEvent]);

    expectStatus(await ada.post('/alerts/id-1/reports', {}), 201);

    await application.settled();
    recorder.stop();

    expect(recorder.received(filedEvent)).toHaveLength(0);
  });

  it('answers each report with its own identifier', async () => {
    await application.relate({ object: 'context:financial-crime', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', tenantId });

    const first = await ada.post('/alerts/id-1/reports', {});
    const second = await ada.post('/alerts/id-1/reports', {});

    expect(first.body).not.toEqual(second.body);
  });
});
