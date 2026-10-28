import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { WithdrawLoanCommand } from '@/contexts/credit-application/offer/application/commands/withdraw-loan/withdraw-loan.command';
import { WithdrawLoanHandler } from '@/contexts/credit-application/offer/application/commands/withdraw-loan/withdraw-loan.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { Money } from '@/shared-kernel/money.vo';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.withdraw']] },
  }),
  map: AuthorizationMap.of(requires(WithdrawLoanCommand, creditApplicationPermissions['application.withdraw'])),
});

const holder = anActor().withRole('holder').build();

describe('Withdraw loan', () => {
  it('refuses the withdrawal of an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new WithdrawLoanCommand(holder, 'unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_CREDIT_APPLICATION',
    });
  });

  it('refuses the withdrawal of an application with no signed offer, by its code, and records nothing', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await creditApplicationRepository.save(
      CreditApplication.create('application-1', 'customer-1', {
        amount: Money.ofCents(1234567),
        durationMonths: 60,
        registeredAt: new Date('2026-04-01T09:00:00.000Z'),
        branchId: 'branch-1',
      }),
    );

    await expect(commandBus.execute(new WithdrawLoanCommand(holder, 'application-1'))).rejects.toMatchObject({
      code: 'OFFER_NOT_SIGNED',
    });

    expect((await creditApplicationRepository.findById('application-1'))?.toState().withdrawnAt).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission application.withdraw', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new WithdrawLoanCommand(anActor().build(), 'application-1'))).rejects.toMatchObject(
      {
        code: 'FORBIDDEN',
      },
    );
  });
});

function arrange() {
  const { commandBus, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const offers = new FakeOfferRepository();
  const clock = { now: () => new Date('2026-04-10T09:00:00.000Z') };

  commandBus
    .use(holders)
    .register(WithdrawLoanCommand, new WithdrawLoanHandler(creditApplicationRepository, { offers, clock }));

  return { commandBus, creditApplicationRepository };
}
