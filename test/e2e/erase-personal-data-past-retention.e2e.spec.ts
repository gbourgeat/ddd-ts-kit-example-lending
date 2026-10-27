import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

describe('Erase personal data past retention, end to end', () => {
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
    const response = await application.client.post('/personal-data/erasures', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/personal-data/erasures', {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'] });

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/personal-data/erasures', {}), 204);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "erase personal data past retention" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /personal-data/erasures',
        kind: 'SERVER',
        children: [{ name: 'command ErasePersonalDataPastRetentionCommand' }],
      },
    ]);
  });

  it('answers 204 to POST /personal-data/erasures', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'] });

    const response = await ada.post('/personal-data/erasures', {});

    expectStatus(response, 204);
  });

  it('keeps an entry of the erasure in the audit trail, with the operator as its actor', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'] });

    expectStatus(await ada.post('/personal-data/erasures', {}), 204);

    const trail = await ada.get('/audit/entries?action=ErasePersonalDataPastRetentionCommand');
    const { items } = trail.body as { items: { action: string; outcome: string; actorId: string }[] };

    expectStatus(trail, 200);

    expect(items).toContainEqual(
      expect.objectContaining({
        action: 'ErasePersonalDataPastRetentionCommand',
        outcome: 'succeeded',
        actorId: 'ada',
      }),
    );
  });

  it('answers the FORBIDDEN code to an actor without the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/personal-data/erasures', {});

    expectStatus(response, 403);
    expect(response.body).toMatchObject({ code: 'FORBIDDEN' });
  });
});
