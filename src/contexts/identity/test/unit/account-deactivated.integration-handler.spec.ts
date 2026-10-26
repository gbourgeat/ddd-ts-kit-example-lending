import { describe, expect, it } from '@jest/globals';
import { accountDeactivatedV1 } from '@/contexts/identity/published-language/account-deactivated.v1.integration-event';
import { startedIdentity } from '@/contexts/identity/test/worlds/identity.world';

const deactivation = accountDeactivatedV1.create(
  { accountId: 'subject-ada' },
  { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
);

describe('When an account is deactivated, the identity provider follows', () => {
  it('disables the person once, asked again after a failure until it answers: a deactivation is never lost', async () => {
    const { application, identityProvider } = await startedIdentity();

    const outage = new Error('provider unreachable');

    identityProvider.failWith(outage);

    await expect(application.eventBus.publish([deactivation])).rejects.toBe(outage);

    identityProvider.answerAgain();
    await application.eventBus.publish([deactivation]);
    await application.eventBus.publish([deactivation]);

    expect(identityProvider.asked).toEqual(['disable subject-ada']);
  });
});
