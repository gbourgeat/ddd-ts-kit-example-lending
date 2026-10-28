import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { DecideExceptionCommand } from '@/contexts/credit-application/decision/application/commands/decide-exception/decide-exception.command';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['exception.decide']] },
  }),
  map: AuthorizationMap.of(requires(DecideExceptionCommand, creditApplicationPermissions['exception.decide'])),
});

describe('Decide exception', () => {
  it('is granted to a holder of exception.decide', async () => {
    const commandBus = new InMemoryCommandBus().use(holders);

    commandBus.register(DecideExceptionCommand, { execute: async () => undefined });

    const command = new DecideExceptionCommand(anActor().withRole('holder').build(), 'id-1', {
      outcome: 'approve',
      reasons: 'Sound.',
    });

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission exception.decide', async () => {
    const commandBus = new InMemoryCommandBus().use(holders);

    commandBus.register(DecideExceptionCommand, { execute: async () => undefined });
    const command = new DecideExceptionCommand(anActor().build(), 'id-1', { outcome: 'approve', reasons: 'Sound.' });

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
