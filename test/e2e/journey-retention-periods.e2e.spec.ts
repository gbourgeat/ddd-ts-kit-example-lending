import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

/** The invitation is valid for seven days from its issue: the period the identity context gives it. */
const SEVEN_DAYS_MS = 7 * 86_400_000;

/** The erasure asks for the instant forty days after the invitation expired. */
const FORTY_DAYS_MS = 40 * 86_400_000;

const tenantId = 'acme-bank';

describe('Retention periods, end to end', () => {
  describe('with identity.invitation kept thirty days after it expired', () => {
    let application: RunningApplication;

    beforeAll(async () => {
      application = await startWithRetention('{"identity.invitation":{"days":30}}');
    });

    afterAll(async () => {
      await application.close();
    });

    beforeEach(async () => {
      await application.reset();
    });

    it('erases the invitation forty days after it expired: the person can no longer accept it', async () => {
      const issuedNoEarlierThan = Date.now();
      const { token, bob } = await issueInvitation(application);

      expectStatus(await eraseAsOf(application, issuedNoEarlierThan + SEVEN_DAYS_MS + FORTY_DAYS_MS), 204);

      const acceptance = await bob.post('/invitations/acceptance', { token });

      expect(acceptance.status).not.toBe(200);
    });
  });

  describe('with identity.invitation kept ninety days after it expired', () => {
    let application: RunningApplication;

    beforeAll(async () => {
      application = await startWithRetention('{"identity.invitation":{"days":90}}');
    });

    afterAll(async () => {
      await application.close();
    });

    beforeEach(async () => {
      await application.reset();
    });

    it('keeps the invitation forty days after it expired: the person still accepts it', async () => {
      const issuedNoEarlierThan = Date.now();
      const { token, bob } = await issueInvitation(application);

      expectStatus(await eraseAsOf(application, issuedNoEarlierThan + SEVEN_DAYS_MS + FORTY_DAYS_MS), 204);

      expectStatus(await bob.post('/invitations/acceptance', { token }), 200);
    });
  });
});

/** Starts the application with the periods given, then restores the environment of the process. */
async function startWithRetention(retentionPeriods: string): Promise<RunningApplication> {
  const written = process.env['RETENTION_PERIODS'];

  process.env['RETENTION_PERIODS'] = retentionPeriods;

  try {
    return await startApplication();
  } finally {
    if (written === undefined) {
      delete process.env['RETENTION_PERIODS'];
    } else {
      process.env['RETENTION_PERIODS'] = written;
    }
  }
}

/** Opens an organisation as ada, issues an invitation to bob, and provisions bob's account. */
async function issueInvitation(application: RunningApplication): Promise<{ token: string; bob: HttpClient }> {
  await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await provisioned(application, 'ada', ['admin']);
  const opened = await ada.post('/organisations', { slug: 'acme-bank', name: 'Acme Bank' });
  const { id: organisationId } = opened.body as { id: string };

  const invitation = await ada.post(`/organisations/${organisationId}/invitations`, {
    email: 'bob@example.test',
    role: 'member',
  });

  const { token } = invitation.body as { token: string };
  const bob = await provisioned(application, 'bob');

  return { token, bob };
}

/** Erases what outlived its retention as of the instant, as the operator of data-protection. */
async function eraseAsOf(application: RunningApplication, asOf: number) {
  await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
  const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId });

  return ada.post('/personal-data/erasures', { asOf: new Date(asOf).toISOString() });
}

/** A signed-in person whose account is provisioned at its first sign-in, as the identity provider lets it be. */
async function provisioned(application: RunningApplication, id: string, roles: string[] = []): Promise<HttpClient> {
  const person = await application.as({ id, roles, tenantId });

  expectStatus(await person.put('/accounts/me', {}), 200);

  return person;
}
