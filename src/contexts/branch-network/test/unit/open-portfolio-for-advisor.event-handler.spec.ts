import { describe, expect, it } from '@jest/globals';
import {
  InMemoryDomainEventDispatcher,
  InMemoryUnitOfWork,
  announceDomainEvents,
  unitOfWorkStage,
} from '@ddd-ts-kit/kernel';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { OpenPortfolioForAdvisorEventHandler } from '@/contexts/branch-network/application/event-handlers/open-portfolio-for-advisor.event-handler';
import { OpenPortfolioCommand } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.command';
import { OpenPortfolioHandler } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.handler';
import { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';
import { aStaffMember } from '@/contexts/branch-network/test/builders/staff-member.builder';
import { FakePortfolioRepository } from '@/contexts/branch-network/test/fakes/portfolio.repository.fake';
import { FakeStaffMemberRepository } from '@/contexts/branch-network/test/fakes/staff-member.repository.fake';

const bornAt = new Date('2026-01-01T00:00:00.000Z');

describe('When staff member appointed', () => {
  it('reacts at the end of the unit of work, before the commit, without failing', async () => {
    const { handler, staffMemberRepository } = arrange();
    const event = new StaffMemberAppointed('staff-member-1', bornAt);
    const domainEvents = new InMemoryDomainEventDispatcher();
    const reactedAt: string[] = [];

    await staffMemberRepository.save(aStaffMember().identifiedBy('staff-member-1').build());

    const asSubscribed = async (): Promise<void> => {
      await handler.handle(event);
      reactedAt.push(unitOfWorkStage());
    };

    domainEvents.on(StaffMemberAppointed.eventName, asSubscribed, { phase: 'before-commit' });
    await new InMemoryUnitOfWork().run(() => announceDomainEvents([event], domainEvents));

    expect(reactedAt).toEqual(['before-commit']);
    expect(domainEvents.afterCommitFailures).toEqual([]);
  });

  it('opens an empty portfolio for the appointed advisor on their branch', async () => {
    const { handler, staffMemberRepository, portfolioRepository } = arrange();

    await staffMemberRepository.save(aStaffMember().identifiedBy('staff-member-1').onBranch('branch-7').build());
    await handler.handle(new StaffMemberAppointed('staff-member-1', bornAt));

    const portfolio = await portfolioRepository.findById('portfolio-1');

    expect(portfolio?.advisorId).toBe('staff-member-1');
    expect(portfolio?.branchId).toBe('branch-7');
  });

  it('fails without opening any portfolio when the appointed staff member cannot be found', async () => {
    const { handler, portfolioRepository } = arrange();

    await expect(handler.handle(new StaffMemberAppointed('staff-member-9', bornAt))).rejects.toMatchObject({
      code: 'UNKNOWN_STAFF_MEMBER',
    });

    expect(await portfolioRepository.findById('portfolio-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus, ids, clock } = createTestBuses({ idPrefix: 'portfolio' });
  const staffMemberRepository = new FakeStaffMemberRepository();
  const portfolioRepository = new FakePortfolioRepository();

  const relations = new InMemoryRelationTupleStore();

  commandBus.register(OpenPortfolioCommand, new OpenPortfolioHandler(portfolioRepository, ids, clock, relations));

  const handler = new OpenPortfolioForAdvisorEventHandler(staffMemberRepository, commandBus);

  return { handler, staffMemberRepository, portfolioRepository };
}
