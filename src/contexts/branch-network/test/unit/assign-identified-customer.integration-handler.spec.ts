import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerAdvisorAssignedV1 } from '@/contexts/customer-due-diligence/published-language';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import { AssignCustomerCommand } from '@/contexts/branch-network/application/commands/assign-customer/assign-customer.command';
import { AssignCustomerHandler } from '@/contexts/branch-network/application/commands/assign-customer/assign-customer.handler';
import { AssignIdentifiedCustomerIntegrationHandler } from '@/contexts/branch-network/application/integration/handlers/assign-identified-customer.integration-handler';
import { FakePortfolioRepository } from '@/contexts/branch-network/test/fakes/portfolio.repository.fake';

const meta = { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' };

describe('When customer-due-diligence publishes customer-due-diligence.customer.advisor-assigned', () => {
  it('listens to the type customer-due-diligence publishes', () => {
    const handler = new AssignIdentifiedCustomerIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(AssignIdentifiedCustomerIntegrationHandler);

    expect(AssignIdentifiedCustomerIntegrationHandler.eventType).toBe(
      'customer-due-diligence.customer.advisor-assigned',
    );
  });

  it('acts as a system actor named after its consumer name', () => {
    const handler = new AssignIdentifiedCustomerIntegrationHandler(new InMemoryCommandBus());

    expect(handler.actor).toMatchObject({ id: 'system:branch-network.assign-identified-customer', type: 'system' });
  });

  it('executes the command that follows the upstream fact', async () => {
    const { commandBus, executed } = recordingBus();
    const handler = new AssignIdentifiedCustomerIntegrationHandler(commandBus);
    const event = customerAdvisorAssignedV1.create({ customerId: 'customer-1', advisorId: 'staff-member-1' }, meta);

    await handler.handle(event);

    expect(executed).toHaveLength(1);
    expect(executed[0]).toBeInstanceOf(AssignCustomerCommand);
    expect(executed[0]).toMatchObject({ advisorId: 'staff-member-1', customerId: 'customer-1' });
  });

  it('has the same outcome when the same event is delivered twice', async () => {
    const { commandBus, portfolioRepository, relations } = await arrange();
    const handler = new AssignIdentifiedCustomerIntegrationHandler(commandBus);
    const event = customerAdvisorAssignedV1.create({ customerId: 'customer-1', advisorId: 'staff-member-1' }, meta);

    await handler.handle(event);
    await handler.handle(event);

    expect(await portfolioRepository.findById('portfolio-1')).toBeDefined();

    expect(await relations.readByObject('portfolio:portfolio-1', 'member')).toEqual([
      { object: 'portfolio:portfolio-1', relation: 'member', subject: 'customer:customer-1' },
    ]);
  });
});

function recordingBus() {
  const commandBus = new InMemoryCommandBus();
  const executed: AssignCustomerCommand[] = [];

  commandBus.register(AssignCustomerCommand, {
    async execute(command: AssignCustomerCommand): Promise<string> {
      executed.push(command);

      return 'portfolio-1';
    },
  });

  return { commandBus, executed };
}

async function arrange() {
  const { commandBus, clock, ids, dispatching } = createTestBuses({ idPrefix: 'portfolio' });
  const portfolioRepository = dispatching(new FakePortfolioRepository());

  await portfolioRepository.save(Portfolio.create('portfolio-1', 'staff-member-1', 'branch-1', clock.now()));

  const relations = new InMemoryRelationTupleStore();

  commandBus.register(AssignCustomerCommand, new AssignCustomerHandler(portfolioRepository, relations));

  return { commandBus, portfolioRepository, relations, ids };
}
