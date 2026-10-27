import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { OpenBranchCommand } from '@/contexts/branch-network/application/commands/open-branch/open-branch.command';
import { OpenBranchHandler } from '@/contexts/branch-network/application/commands/open-branch/open-branch.handler';
import { BranchOpened } from '@/contexts/branch-network/domain/events/branch-opened.event';
import { FakeBranchRepository } from '@/contexts/branch-network/test/fakes/branch.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [branchNetworkPermissions['branch.open']] },
  }),
  map: AuthorizationMap.of(requires(OpenBranchCommand, branchNetworkPermissions['branch.open'])),
});

const holder = anActor().withRole('holder').build();

describe('Open branch', () => {
  it('saves the branch and answers its identifier', async () => {
    const { commandBus, branchRepository } = arrange();

    const id = await commandBus.execute(new OpenBranchCommand(holder));

    expect(id).toBe('branch-1');
    expect(await branchRepository.findById(id)).toBeDefined();
  });

  it('gives the branch the instant it is opened as its registration date', async () => {
    const { commandBus, branchRepository, clock } = arrange();

    const id = await commandBus.execute(new OpenBranchCommand(holder));
    const branch = await branchRepository.findById(id);

    expect(branch?.registeredAt).toEqual(clock.now());
  });

  it('announces the opening of the branch once it is saved', async () => {
    const { commandBus, domainEvents } = arrange();
    const announced: BranchOpened[] = [];

    domainEvents.on(BranchOpened.eventName, async (event) => {
      announced.push(event as BranchOpened);
    });

    await commandBus.execute(new OpenBranchCommand(holder));

    expect(announced.map((event) => event.aggregateId)).toEqual(['branch-1']);
  });

  it('is refused to an actor who does not hold the permission branch.open', async () => {
    const { commandBus } = arrange();
    const command = new OpenBranchCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('saves no branch when the actor does not hold the permission branch.open', async () => {
    const { commandBus, branchRepository } = arrange();

    await commandBus.execute(new OpenBranchCommand(anActor().build())).catch(() => undefined);

    expect(await branchRepository.findById('branch-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'branch' });
  // As the application hands it to the handler: the save announces the events of the branch to `domainEvents`.
  const branchRepository = dispatching(new FakeBranchRepository());

  const handler = new OpenBranchHandler(branchRepository, ids, clock);

  commandBus.use(holders).register(OpenBranchCommand, handler);

  return { commandBus, branchRepository, domainEvents, clock };
}
