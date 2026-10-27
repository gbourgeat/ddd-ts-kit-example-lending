import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { OpenPortfolioCommand } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.command';
import { OpenPortfolioHandler } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.handler';
import { FakePortfolioRepository } from '@/contexts/branch-network/test/fakes/portfolio.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [branchNetworkPermissions['portfolio.open']] },
  }),
  map: AuthorizationMap.of(requires(OpenPortfolioCommand, branchNetworkPermissions['portfolio.open'])),
});

const holder = anActor().withRole('holder').build();

describe('Open portfolio', () => {
  it('saves the portfolio and answers its identifier', async () => {
    const { commandBus, portfolioRepository } = arrange();

    const id = await commandBus.execute(new OpenPortfolioCommand(holder, 'branch-1', 'staff-member-1'));

    expect(id).toBe('portfolio-1');
    expect(await portfolioRepository.findById(id)).toBeDefined();
  });

  it('opens the portfolio empty, held by the advisor on the branch', async () => {
    const { commandBus, portfolioRepository } = arrange();

    const id = await commandBus.execute(new OpenPortfolioCommand(holder, 'branch-1', 'staff-member-1'));
    const portfolio = await portfolioRepository.findById(id);

    expect(portfolio?.advisorId).toBe('staff-member-1');
    expect(portfolio?.branchId).toBe('branch-1');
  });

  it('announces the opening of the portfolio once it is saved', async () => {
    const { commandBus, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('branch-network.portfolio.opened', async (event) => {
      announced.push(event.aggregateId);
    });

    const id = await commandBus.execute(new OpenPortfolioCommand(holder, 'branch-1', 'staff-member-1'));

    expect(announced).toEqual([id]);
  });

  it('is refused to an actor who does not hold the permission portfolio.open', async () => {
    const { commandBus } = arrange();
    const command = new OpenPortfolioCommand(anActor().build(), 'branch-1', 'staff-member-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('saves no portfolio when the actor does not hold the permission portfolio.open', async () => {
    const { commandBus, portfolioRepository } = arrange();
    const command = new OpenPortfolioCommand(anActor().build(), 'branch-1', 'staff-member-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await portfolioRepository.findById('portfolio-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'portfolio' });
  // As the application hands it to the handler: the save announces the events of the portfolio to `domainEvents`.
  const portfolioRepository = dispatching(new FakePortfolioRepository());

  const handler = new OpenPortfolioHandler(portfolioRepository, ids, clock);

  commandBus.use(holders).register(OpenPortfolioCommand, handler);

  return { commandBus, portfolioRepository, domainEvents };
}
