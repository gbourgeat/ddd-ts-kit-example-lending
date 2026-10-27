import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';
import { SetResidualIncomeMinimumCommand } from '@/contexts/credit-policy/application/commands/set-residual-income-minimum/set-residual-income-minimum.command';
import { SetResidualIncomeMinimumHandler } from '@/contexts/credit-policy/application/commands/set-residual-income-minimum/set-residual-income-minimum.handler';
import { aResidualIncomeMinimum } from '@/contexts/credit-policy/test/builders/residual-income-minimum.builder';
import { FakeResidualIncomeMinimumRepository } from '@/contexts/credit-policy/test/fakes/residual-income-minimum.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditPolicyPermissions['residual-income-minimum.set']] },
  }),
  map: AuthorizationMap.of(
    requires(SetResidualIncomeMinimumCommand, creditPolicyPermissions['residual-income-minimum.set']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Set residual income minimum', () => {
  it('saves the minimum per adult and per child, effective from the day of the command, and answers its identifier', async () => {
    const { commandBus, residualIncomeMinimumRepository, clock } = arrange();

    const id = await commandBus.execute(new SetResidualIncomeMinimumCommand(holder, 80_000, 30_000));

    const stored = await residualIncomeMinimumRepository.findById(id);

    expect(id).toBe('residual-income-minimum-1');
    expect(stored?.perAdultInCents).toBe(80_000);
    expect(stored?.perChildInCents).toBe(30_000);
    expect(stored?.effectiveFrom).toEqual(clock.now());
  });

  it('announces the publication of the residual income minimum once it is saved', async () => {
    const { commandBus, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('credit-policy.residual-income-minimum.published', async (event) => {
      announced.push(event.aggregateId);
    });

    const id = await commandBus.execute(new SetResidualIncomeMinimumCommand(holder, 80_000, 30_000));

    expect(announced).toEqual([id]);
  });

  it('keeps the previous minimum as it was stored when a new one is set', async () => {
    const { commandBus, residualIncomeMinimumRepository } = arrange();

    const previous = aResidualIncomeMinimum().identifiedBy('residual-income-minimum-previous').build();

    await residualIncomeMinimumRepository.save(previous);

    await commandBus.execute(new SetResidualIncomeMinimumCommand(holder, 90_000, 35_000));

    expect(await residualIncomeMinimumRepository.findById('residual-income-minimum-previous')).toEqual(previous);
  });

  it('refuses a minimum of zero per adult with the code INVALID_RESIDUAL_INCOME_MINIMUM, and saves nothing', async () => {
    const { commandBus, residualIncomeMinimumRepository } = arrange();

    await expect(commandBus.execute(new SetResidualIncomeMinimumCommand(holder, 0, 30_000))).rejects.toMatchObject({
      code: 'INVALID_RESIDUAL_INCOME_MINIMUM',
    });

    expect(residualIncomeMinimumRepository.count()).toBe(0);
  });

  it('refuses a negative minimum per child with the code INVALID_RESIDUAL_INCOME_MINIMUM, and saves nothing', async () => {
    const { commandBus, residualIncomeMinimumRepository } = arrange();

    await expect(commandBus.execute(new SetResidualIncomeMinimumCommand(holder, 80_000, -1))).rejects.toMatchObject({
      code: 'INVALID_RESIDUAL_INCOME_MINIMUM',
    });

    expect(residualIncomeMinimumRepository.count()).toBe(0);
  });

  it('is refused to an actor who does not hold the permission residual-income-minimum.set', async () => {
    const { commandBus } = arrange();
    const command = new SetResidualIncomeMinimumCommand(anActor().build(), 80_000, 30_000);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({
    idPrefix: 'residual-income-minimum',
  });

  // As the application hands it to the handler: the save announces the events of the residual income minimum to `domainEvents`.
  const residualIncomeMinimumRepository = dispatching(new FakeResidualIncomeMinimumRepository());

  const handler = new SetResidualIncomeMinimumHandler(residualIncomeMinimumRepository, ids, clock);

  commandBus.use(holders).register(SetResidualIncomeMinimumCommand, handler);

  return { commandBus, clock, residualIncomeMinimumRepository, domainEvents };
}
