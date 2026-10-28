import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import {
  RaiseAlertCommand,
  type RepaymentFacts,
} from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.command';
import { RaiseAlertHandler } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.handler';
import { FakeAlertRepository } from '@/contexts/financial-crime/test/fakes/alert.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [financialCrimePermissions['alert.raise']] },
  }),
  map: AuthorizationMap.of(requires(RaiseAlertCommand, financialCrimePermissions['alert.raise'])),
});

const holder = anActor().withRole('holder').build();
const BORROWER_ACCOUNT = 'borrower-account';

describe('Raise alert', () => {
  it('saves an alert on a repayment that takes the early repayments above 10,000 within a year', async () => {
    const { commandBus, alertRepository } = arrange();

    const id = await commandBus.execute(
      new RaiseAlertCommand(holder, 'repayment-9', aRepayment({ amountCents: 1_100_000 })),
    );

    expect(id).toBe('alert-1');
    expect((await alertRepository.findById(id ?? ''))?.repaymentReference).toBe('repayment-9');
  });

  it("saves an alert on a payment from an account that is not the borrower's", async () => {
    const { commandBus, alertRepository } = arrange();

    const id = await commandBus.execute(
      new RaiseAlertCommand(holder, 'repayment-10', aRepayment({ payerAccount: 'stranger-account' })),
    );

    expect((await alertRepository.findById(id ?? ''))?.repaymentReference).toBe('repayment-10');
  });

  it('answers the alert already raised on the same repayment, without saving a second one', async () => {
    const { commandBus, alertRepository } = arrange();

    const first = await commandBus.execute(
      new RaiseAlertCommand(holder, 'repayment-14', aRepayment({ payerAccount: 'stranger' })),
    );

    const second = await commandBus.execute(
      new RaiseAlertCommand(holder, 'repayment-14', aRepayment({ payerAccount: 'stranger' })),
    );

    expect(second).toBe(first);
    expect(alertRepository.count()).toBe(1);
  });

  it('announces the alert raised with the save', async () => {
    const { commandBus, announced } = arrange();

    await commandBus.execute(new RaiseAlertCommand(holder, 'repayment-11', aRepayment({ payerAccount: 'stranger' })));

    expect(announced).toEqual(['financial-crime.alert.raised']);
  });

  it('answers nothing and saves no alert when the repayment breaks no rule', async () => {
    const { commandBus, alertRepository, announced } = arrange();

    const id = await commandBus.execute(new RaiseAlertCommand(holder, 'repayment-12', aRepayment()));

    expect(id).toBeUndefined();
    expect(await alertRepository.findById('alert-1')).toBeUndefined();
    expect(announced).toEqual([]);
  });

  it('is refused to an actor who does not hold the permission alert.raise', async () => {
    const { commandBus } = arrange();
    const command = new RaiseAlertCommand(anActor().build(), 'repayment-13', aRepayment());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'alert' });
  // As the application hands it to the handler: the save announces the events of the alert to `domainEvents`.
  const alertRepository = dispatching(new FakeAlertRepository());
  const announced: string[] = [];

  domainEvents.on('financial-crime.alert.raised', async () => {
    announced.push('financial-crime.alert.raised');
  });

  const handler = new RaiseAlertHandler(alertRepository, ids, clock);

  commandBus.use(holders).register(RaiseAlertCommand, handler);

  return { commandBus, alertRepository, announced };
}

/** A repayment that breaks no rule unless the spec says otherwise. */
function aRepayment(overrides: Partial<RepaymentFacts> = {}): RepaymentFacts {
  return {
    amountCents: 100_000,
    early: true,
    paidAt: new Date('2026-06-01T00:00:00.000Z'),
    payoutAt: new Date('2026-01-01T00:00:00.000Z'),
    earlyRepaidWithinYearCents: 0,
    payerAccount: BORROWER_ACCOUNT,
    borrowerAccounts: [BORROWER_ACCOUNT],
    ...overrides,
  };
}
