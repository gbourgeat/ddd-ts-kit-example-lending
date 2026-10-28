import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { type Actor } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';
import { DeclareConflictOfInterestCommand } from '@/contexts/branch-network/application/commands/declare-conflict-of-interest/declare-conflict-of-interest.command';
import { DeclareConflictOfInterestHandler } from '@/contexts/branch-network/application/commands/declare-conflict-of-interest/declare-conflict-of-interest.handler';
import { aStaffMember } from '@/contexts/branch-network/test/builders/staff-member.builder';
import { FakeConflictOfInterestRepository } from '@/contexts/branch-network/test/fakes/conflict-of-interest.repository.fake';
import { FakeStaffMemberRepository } from '@/contexts/branch-network/test/fakes/staff-member.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [branchNetworkPermissions['conflict.declare']] },
  }),
  map: AuthorizationMap.of(requires(DeclareConflictOfInterestCommand, branchNetworkPermissions['conflict.declare'])),
});

/** The account of Ada, a member of staff whose own customer file is `customer-own`. */
const ada: Actor = { id: 'account-ada', type: 'user', roles: ['holder'], attributes: {} };

describe('Declare conflict of interest', () => {
  it('saves the conflict of interest between the declarer and the customer, and answers its identifier', async () => {
    const { commandBus, conflictOfInterestRepository, staffMemberRepository } = arrange();

    await staffMemberRepository.save(aStaffMember().identifiedBy('staff-member-1').signedInAs('account-ada').build());

    const id = await commandBus.execute(new DeclareConflictOfInterestCommand(ada, 'customer-2'));
    const stored = await conflictOfInterestRepository.findById(id);

    expect(id).toBe('conflict-of-interest-1');
    expect(stored?.staffMemberId).toBe('staff-member-1');
    expect(stored?.customerId).toBe('customer-2');
  });

  it('excludes the declarer from the customer file, as the relationship the authorizer reads', async () => {
    const { commandBus, relations, staffMemberRepository } = arrange();

    await staffMemberRepository.save(aStaffMember().identifiedBy('staff-member-1').signedInAs('account-ada').build());

    await commandBus.execute(new DeclareConflictOfInterestCommand(ada, 'customer-2'));

    expect(await relations.readByObject('customer:customer-2', 'conflicted')).toEqual([
      expect.objectContaining({ subject: 'user:staff-member-1' }),
    ]);
  });

  it('announces the declaration once it is saved', async () => {
    const { commandBus, domainEvents, staffMemberRepository } = arrange();
    const announced: string[] = [];

    domainEvents.on(ConflictOfInterestDeclared.eventName, async (event) => {
      announced.push(event.aggregateId);
    });

    await staffMemberRepository.save(aStaffMember().identifiedBy('staff-member-1').signedInAs('account-ada').build());

    const id = await commandBus.execute(new DeclareConflictOfInterestCommand(ada, 'customer-2'));

    expect(announced).toEqual([id]);
  });

  it('accepts a declaration when the declarer is not a customer, since no own file can match', async () => {
    const { commandBus, staffMemberRepository } = arrange();

    await staffMemberRepository.save(aStaffMember().identifiedBy('staff-member-1').signedInAs('account-ada').build());

    const id = await commandBus.execute(new DeclareConflictOfInterestCommand(ada, 'customer-2'));

    expect(id).toBe('conflict-of-interest-1');
  });

  it('refuses a declaration on the own customer file of the declarer, with the code CONFLICT_ON_OWN_RECORD', async () => {
    const { commandBus, staffMemberRepository } = arrange();

    await staffMemberRepository.save(
      aStaffMember().identifiedBy('staff-member-1').signedInAs('account-ada').ownsCustomerFile('customer-own').build(),
    );

    await expect(commandBus.execute(new DeclareConflictOfInterestCommand(ada, 'customer-own'))).rejects.toMatchObject({
      code: 'CONFLICT_ON_OWN_RECORD',
    });
  });

  it('saves no conflict of interest when the declarer declares on their own customer file', async () => {
    const { commandBus, conflictOfInterestRepository, staffMemberRepository } = arrange();

    await staffMemberRepository.save(
      aStaffMember().identifiedBy('staff-member-1').signedInAs('account-ada').ownsCustomerFile('customer-own').build(),
    );

    await expect(commandBus.execute(new DeclareConflictOfInterestCommand(ada, 'customer-own'))).rejects.toMatchObject({
      code: 'CONFLICT_ON_OWN_RECORD',
    });

    expect(await conflictOfInterestRepository.findById('conflict-of-interest-1')).toBeUndefined();
  });

  it('refuses a declaration from an account that is no member of staff, with the code UNKNOWN_STAFF_MEMBER', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new DeclareConflictOfInterestCommand(ada, 'customer-2'))).rejects.toMatchObject({
      code: 'UNKNOWN_STAFF_MEMBER',
    });
  });

  it('is refused to an actor who does not hold the permission conflict.declare', async () => {
    const { commandBus } = arrange();
    const command = new DeclareConflictOfInterestCommand(anActor().build(), 'customer-2');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'conflict-of-interest' });
  // As the application hands it to the handler: the save announces the events of the conflict of interest to `domainEvents`.
  const conflictOfInterestRepository = dispatching(new FakeConflictOfInterestRepository());
  const staffMemberRepository = new FakeStaffMemberRepository();

  const relations = new InMemoryRelationTupleStore();

  const handler = new DeclareConflictOfInterestHandler(
    conflictOfInterestRepository,
    staffMemberRepository,
    ids,
    clock,
    relations,
  );

  commandBus.use(holders).register(DeclareConflictOfInterestCommand, handler);

  return { commandBus, conflictOfInterestRepository, domainEvents, relations, staffMemberRepository };
}
