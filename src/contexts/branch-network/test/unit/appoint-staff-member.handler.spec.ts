import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { AppointStaffMemberCommand } from '@/contexts/branch-network/application/commands/appoint-staff-member/appoint-staff-member.command';
import { AppointStaffMemberHandler } from '@/contexts/branch-network/application/commands/appoint-staff-member/appoint-staff-member.handler';
import { aBranch } from '@/contexts/branch-network/test/builders/branch.builder';
import { FakeBranchRepository } from '@/contexts/branch-network/test/fakes/branch.repository.fake';
import { FakeStaffMemberRepository } from '@/contexts/branch-network/test/fakes/staff-member.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [branchNetworkPermissions['staff-member.appoint']] },
  }),
  map: AuthorizationMap.of(requires(AppointStaffMemberCommand, branchNetworkPermissions['staff-member.appoint'])),
});

const holder = anActor().withRole('holder').build();

describe('Appoint staff member', () => {
  it('appoints the member of staff to an opened branch and answers its identifier', async () => {
    const { commandBus, branchRepository, staffMemberRepository } = arrange();

    await branchRepository.save(aBranch().identifiedBy('branch-1').build());

    const id = await commandBus.execute(
      new AppointStaffMemberCommand(holder, 'branch-1', 'Ada Lovelace', 'ada.lovelace@bank.test', 'account-ada'),
    );

    expect(id).toBe('staff-member-1');
    expect(await staffMemberRepository.findById(id)).toBeDefined();
  });

  it('keeps the branch the member of staff is appointed to', async () => {
    const { commandBus, branchRepository, staffMemberRepository } = arrange();

    await branchRepository.save(aBranch().identifiedBy('branch-1').build());

    const id = await commandBus.execute(
      new AppointStaffMemberCommand(holder, 'branch-1', 'Ada Lovelace', 'ada.lovelace@bank.test', 'account-ada'),
    );

    expect((await staffMemberRepository.findById(id))?.branchId).toBe('branch-1');
  });

  it('announces the appointment once the member of staff is saved', async () => {
    const { commandBus, branchRepository, domainEvents } = arrange();

    await branchRepository.save(aBranch().identifiedBy('branch-1').build());
    const announced: string[] = [];

    domainEvents.on('branch-network.staff-member.appointed', async (event) => {
      announced.push(event.aggregateId);
    });

    const id = await commandBus.execute(
      new AppointStaffMemberCommand(holder, 'branch-1', 'Ada Lovelace', 'ada.lovelace@bank.test', 'account-ada'),
    );

    expect(announced).toEqual([id]);
  });

  it('is refused to an actor who does not hold the permission staff-member.appoint', async () => {
    const { commandBus } = arrange();

    const command = new AppointStaffMemberCommand(
      anActor().build(),
      'branch-1',
      'Ada Lovelace',
      'ada@bank.test',
      'account-ada',
    );

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses an appointment to a branch that is not opened with BRANCH_NOT_OPENED', async () => {
    const { commandBus } = arrange();
    const command = new AppointStaffMemberCommand(holder, 'branch-9', 'Ada Lovelace', 'ada@bank.test', 'account-ada');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'BRANCH_NOT_OPENED' });
  });

  it('saves and announces nothing when the branch is not opened', async () => {
    const { commandBus, domainEvents, staffMemberRepository } = arrange();
    const announced: string[] = [];

    domainEvents.on('branch-network.staff-member.appointed', async (event) => {
      announced.push(event.aggregateId);
    });

    const command = new AppointStaffMemberCommand(holder, 'branch-9', 'Ada Lovelace', 'ada@bank.test', 'account-ada');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'BRANCH_NOT_OPENED' });

    expect(await staffMemberRepository.findById('staff-member-1')).toBeUndefined();
    expect(announced).toEqual([]);
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'staff-member' });
  // As the application hands it to the handler: the save announces the events of the staff member to `domainEvents`.
  const staffMemberRepository = dispatching(new FakeStaffMemberRepository());
  const branchRepository = new FakeBranchRepository();

  const handler = new AppointStaffMemberHandler(branchRepository, staffMemberRepository, ids, clock);

  commandBus.use(holders).register(AppointStaffMemberCommand, handler);

  return { commandBus, branchRepository, staffMemberRepository, domainEvents };
}
