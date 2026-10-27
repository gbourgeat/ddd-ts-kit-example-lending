import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';
import { SetDelegationTableCommand } from '@/contexts/credit-policy/application/commands/set-delegation-table/set-delegation-table.command';
import { SetDelegationTableHandler } from '@/contexts/credit-policy/application/commands/set-delegation-table/set-delegation-table.handler';
import { aDelegationTable } from '@/contexts/credit-policy/test/builders/delegation-table.builder';
import { FakeDelegationTableRepository } from '@/contexts/credit-policy/test/fakes/delegation-table.repository.fake';
import { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditPolicyPermissions['delegation-table.set']] },
  }),
  map: AuthorizationMap.of(requires(SetDelegationTableCommand, creditPolicyPermissions['delegation-table.set'])),
});

const holder = anActor().withRole('holder').build();
const effectiveFrom = new Date('2026-08-01T00:00:00.000Z');

const everyLevel = [
  { level: DelegationLevel.Advisor, amountCents: 1_500_000 },
  { level: DelegationLevel.CreditAnalyst, amountCents: 7_500_000 },
  { level: DelegationLevel.RiskManager, amountCents: 25_000_000 },
  { level: DelegationLevel.CreditCommittee, amountCents: 100_000_000 },
];

describe('Set delegation table', () => {
  it('saves the table with its day of effect and the limit of each level, and answers its identifier', async () => {
    const { commandBus, delegationTableRepository } = arrange();

    const id = await commandBus.execute(new SetDelegationTableCommand(holder, { effectiveFrom, limits: everyLevel }));

    const stored = await delegationTableRepository.findById(id);

    expect(id).toBe('delegation-table-1');
    expect(stored?.effectiveFrom).toEqual(effectiveFrom);
    expect(stored?.levels).toEqual(everyLevel);
  });

  it('announces the publication of the delegation table once it is saved', async () => {
    const { commandBus, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('credit-policy.delegation-table.published', async (event) => {
      announced.push(event.aggregateId);
    });

    const id = await commandBus.execute(new SetDelegationTableCommand(holder, { effectiveFrom, limits: everyLevel }));

    expect(announced).toEqual([id]);
  });

  it('keeps the previous table as it was stored when a new one takes effect', async () => {
    const { commandBus, delegationTableRepository } = arrange();

    const previous = aDelegationTable()
      .identifiedBy('delegation-table-previous')
      .takingEffectOn(new Date('2026-01-01T00:00:00.000Z'))
      .build();

    await delegationTableRepository.save(previous);

    await commandBus.execute(new SetDelegationTableCommand(holder, { effectiveFrom, limits: everyLevel }));

    expect(await delegationTableRepository.findById('delegation-table-previous')).toEqual(previous);
  });

  it('refuses a table that leaves out a level with the code INVALID_DELEGATION_TABLE, and saves nothing', async () => {
    const { commandBus, delegationTableRepository } = arrange();
    const withoutCommittee = everyLevel.slice(0, 3);

    await expect(
      commandBus.execute(new SetDelegationTableCommand(holder, { effectiveFrom, limits: withoutCommittee })),
    ).rejects.toMatchObject({ code: 'INVALID_DELEGATION_TABLE' });

    expect(delegationTableRepository.count()).toBe(0);
  });

  it('is refused to an actor who does not hold the permission delegation-table.set', async () => {
    const { commandBus } = arrange();
    const command = new SetDelegationTableCommand(anActor().build(), { effectiveFrom, limits: everyLevel });

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'delegation-table' });
  // As the application hands it to the handler: the save announces the events of the delegation table to `domainEvents`.
  const delegationTableRepository = dispatching(new FakeDelegationTableRepository());

  const handler = new SetDelegationTableHandler(delegationTableRepository, ids, clock);

  commandBus.use(holders).register(SetDelegationTableCommand, handler);

  return { commandBus, delegationTableRepository, domainEvents };
}
