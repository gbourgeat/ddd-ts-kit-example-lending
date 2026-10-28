import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { AuthorizePayoutCommand } from '@/contexts/credit-application/offer/application/commands/authorize-payout/authorize-payout.command';
import { AuthorizePayoutHandler } from '@/contexts/credit-application/offer/application/commands/authorize-payout/authorize-payout.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeOfferRepository } from '@/contexts/credit-application/test/fakes/offer.repository.fake';
import { FakeCustomerDiligenceGateway } from '@/contexts/credit-application/test/fakes/customer-diligence-gateway.fake';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { Money } from '@/shared-kernel/money.vo';

const operators = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { operator: [creditApplicationPermissions['application.authorise-payout']] },
  }),
  map: AuthorizationMap.of(
    requires(AuthorizePayoutCommand, creditApplicationPermissions['application.authorise-payout']),
  ),
});

const operator = anActor().withRole('operator').build();

describe('Authorize payout', () => {
  it('refuses the payout of an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new AuthorizePayoutCommand(operator, 'unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_CREDIT_APPLICATION',
    });
  });

  it('refuses the payout of an application with no signed offer, by its code', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await creditApplicationRepository.save(
      CreditApplication.create('application-1', 'customer-1', {
        amount: Money.ofCents(1234567),
        durationMonths: 60,
        registeredAt: new Date('2026-04-01T09:00:00.000Z'),
        branchId: 'branch-1',
      }),
    );

    await expect(commandBus.execute(new AuthorizePayoutCommand(operator, 'application-1'))).rejects.toMatchObject({
      code: 'OFFER_NOT_SIGNED',
    });
  });

  it('is refused to an actor who does not hold the permission application.authorise-payout', async () => {
    const { commandBus } = arrange();

    await expect(
      commandBus.execute(new AuthorizePayoutCommand(anActor().build(), 'application-1')),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

function arrange() {
  const { commandBus, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const offers = new FakeOfferRepository();
  const diligence = new FakeCustomerDiligenceGateway().answering('customer-1', { eligible: true });
  const clock = { now: () => new Date('2026-04-10T09:00:00.000Z') };

  commandBus
    .use(operators)
    .register(
      AuthorizePayoutCommand,
      new AuthorizePayoutHandler(creditApplicationRepository, { offers, diligence, clock }),
    );

  return { commandBus, creditApplicationRepository };
}
