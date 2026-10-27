import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { AssignCustomerCommand } from '@/contexts/branch-network/application/commands/assign-customer/assign-customer.command';
import { AssignCustomerHandler } from '@/contexts/branch-network/application/commands/assign-customer/assign-customer.handler';
import { FakePortfolioRepository } from '@/contexts/branch-network/test/fakes/portfolio.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [branchNetworkPermissions['portfolio.assign-customer']] },
  }),
  map: AuthorizationMap.of(requires(AssignCustomerCommand, branchNetworkPermissions['portfolio.assign-customer'])),
});

const holder = anActor().withRole('holder').build();

describe('Assign customer', () => {
  it('joins the customer to the portfolio of the advisor, as a member of the portfolio', async () => {
    const { commandBus, relations } = await arrange();

    await commandBus.execute(new AssignCustomerCommand(holder, 'staff-member-1', 'customer-1'));

    expect(await relations.readByObject('portfolio:portfolio-1', 'member')).toEqual([
      { object: 'portfolio:portfolio-1', relation: 'member', subject: 'customer:customer-1' },
    ]);
  });

  it('answers the identifier of the portfolio the customer joined', async () => {
    const { commandBus } = await arrange();

    const id = await commandBus.execute(new AssignCustomerCommand(holder, 'staff-member-1', 'customer-1'));

    expect(id).toBe('portfolio-1');
  });

  it('joins the customer once when the same assignment is executed twice', async () => {
    const { commandBus, relations } = await arrange();
    const command = () => new AssignCustomerCommand(holder, 'staff-member-1', 'customer-1');

    await commandBus.execute(command());
    await commandBus.execute(command());

    expect(await relations.readByObject('portfolio:portfolio-1', 'member')).toHaveLength(1);
  });

  it('refuses an advisor who holds no portfolio, and joins no customer', async () => {
    const { commandBus, relations } = await arrange();
    const command = new AssignCustomerCommand(holder, 'staff-member-unknown', 'customer-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_PORTFOLIO' });
    expect(await relations.readByObject('portfolio:portfolio-1', 'member')).toEqual([]);
  });

  it('is refused to an actor who does not hold the permission portfolio.assign-customer', async () => {
    const { commandBus } = await arrange();
    const command = new AssignCustomerCommand(anActor().build(), 'staff-member-1', 'customer-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'portfolio' });
  // As the application hands it to the handler: the save announces the events of the portfolio to `domainEvents`.
  const portfolioRepository = dispatching(new FakePortfolioRepository());
  const opened = Portfolio.create('portfolio-1', 'staff-member-1', 'branch-1', clock.now());

  await portfolioRepository.save(opened);

  const relations = new InMemoryRelationTupleStore();
  const handler = new AssignCustomerHandler(portfolioRepository, relations);

  commandBus.use(holders).register(AssignCustomerCommand, handler);

  return { commandBus, portfolioRepository, relations };
}
