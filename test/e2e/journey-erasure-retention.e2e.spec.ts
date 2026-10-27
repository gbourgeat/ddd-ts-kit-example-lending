import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

/** The erasure asks for the instant forty days after the invitation expired. */
const FORTY_DAYS_MS = 40 * 86_400_000;

const tenantId = 'acme-bank';
const inviteeEmail = 'bob@example.test';

/** The invitation as issued: its id, and the expiry the database holds for it. */
interface IssuedInvitation {
  readonly id: string;
  readonly expiresAt: Date;
}

describe('Erasure past the retention period, end to end', () => {
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

    it('erases the invitation row forty days after it expired, past its thirty days of retention', async () => {
      const invitation = await issueInvitation(application);

      expectStatus(await eraseAsOf(application, forty(invitation.expiresAt)), 204);

      expect(await storedInvitation(application, invitation.id)).toBeNull();
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

    it('keeps the invitation row forty days after it expired, within its ninety days of retention', async () => {
      const invitation = await issueInvitation(application);

      expectStatus(await eraseAsOf(application, forty(invitation.expiresAt)), 204);

      const kept = await storedInvitation(application, invitation.id);

      expect(kept?.email).toBe(inviteeEmail);
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

/** Opens an organisation as ada, issues an invitation to bob, and reads back the row it stored. */
async function issueInvitation(application: RunningApplication): Promise<IssuedInvitation> {
  await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await provisioned(application, 'ada', ['admin']);
  const opened = await ada.post('/organisations', { slug: 'acme-bank', name: 'Acme Bank' });
  const { id: organisationId } = opened.body as { id: string };

  const invitation = await ada.post(`/organisations/${organisationId}/invitations`, {
    email: inviteeEmail,
    role: 'member',
  });

  const { id } = invitation.body as { id: string };
  const row = await storedInvitation(application, id);

  if (row === null) {
    throw new Error(`The invitation ${id} was not stored`);
  }

  return { id, expiresAt: row.expiresAt };
}

/** The invitation row as the database holds it, or null once it has been erased. */
async function storedInvitation(application: RunningApplication, id: string) {
  return application.persistence.database.client().identityInvitation.findUnique({ where: { id } });
}

/** The instant forty days after the expiry of an invitation. */
function forty(expiresAt: Date): Date {
  return new Date(expiresAt.getTime() + FORTY_DAYS_MS);
}

/** Erases what outlived its retention as of the instant, as the operator of data-protection. */
async function eraseAsOf(application: RunningApplication, asOf: Date) {
  await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
  const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId });

  return ada.post('/personal-data/erasures', { asOf: asOf.toISOString() });
}

/** A signed-in person whose account is provisioned at its first sign-in, as the identity provider lets it be. */
async function provisioned(application: RunningApplication, id: string, roles: string[] = []): Promise<HttpClient> {
  const person = await application.as({ id, roles, tenantId });

  expectStatus(await person.put('/accounts/me', {}), 200);

  return person;
}
