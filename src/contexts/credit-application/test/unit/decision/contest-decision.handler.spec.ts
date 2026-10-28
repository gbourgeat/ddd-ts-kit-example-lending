import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ContestDecisionCommand } from '@/contexts/credit-application/decision/application/commands/contest-decision/contest-decision.command';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.contest']] },
  }),
  map: AuthorizationMap.of(requires(ContestDecisionCommand, creditApplicationPermissions['application.contest'])),
});

describe('Contest decision', () => {
  it('is granted to a holder of application.contest', async () => {
    const commandBus = new InMemoryCommandBus().use(holders);

    commandBus.register(ContestDecisionCommand, { execute: async () => undefined });
    const command = new ContestDecisionCommand(anActor().withRole('holder').build(), 'id-1', 'Wrong income.');

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission application.contest', async () => {
    const commandBus = new InMemoryCommandBus().use(holders);

    commandBus.register(ContestDecisionCommand, { execute: async () => undefined });
    const command = new ContestDecisionCommand(anActor().build(), 'id-1', 'Wrong income.');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
