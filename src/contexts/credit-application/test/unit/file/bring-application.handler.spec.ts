import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { BringApplicationCommand } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.command';
import { BringApplicationHandler } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.handler';
import { CreditApplicationBrought } from '@/contexts/credit-application/file/domain/events/credit-application-brought.event';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeCustomerAdvisorBranchGateway } from '@/contexts/credit-application/test/fakes/customer-advisor-branch-gateway.fake';
import { FakeBrokerRegistrations } from '@/contexts/credit-application/test/fakes/broker-registrations.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { broker: [creditApplicationPermissions['application.bring']] },
  }),
  map: AuthorizationMap.of(requires(BringApplicationCommand, creditApplicationPermissions['application.bring'])),
});

const broker = anActor().named('broker-1').withRole('broker').build();
const stamp = { eventId: 'event-1', occurredAt: new Date('2026-01-01T00:00:00.000Z') };
const request = { customerId: 'customer-1', productId: 'personal-loan', amountInCents: 1234567, durationMonths: 60 };

describe('Bring application', () => {
  it('stores the application for the customer it is brought for, and announces the submission then the broker who brought it', async () => {
    const { commandBus, creditApplicationRepository, announced } = await arrange({ inForce: true });

    const id = await commandBus.execute(new BringApplicationCommand(broker, request));
    const stored = await creditApplicationRepository.findById(id);

    expect(stored?.applicantId).toBe('customer-1');
    expect(stored?.amount).toEqual(Money.ofCents(1234567));
    expect(announced.submitted).toMatchObject({ aggregateId: id, applicantId: 'customer-1', branchId: 'branch-1' });
    expect(announced.brought).toMatchObject({ aggregateId: id, brokerId: 'broker-1' });
  });

  it('refuses a broker whose registration lapsed on the day, by its code, and saves and announces nothing', async () => {
    const { commandBus, creditApplicationRepository, announced } = await arrange({ inForce: false });

    await expect(commandBus.execute(new BringApplicationCommand(broker, request))).rejects.toMatchObject({
      code: 'BROKER_REGISTRATION_LAPSED',
    });

    expect(await creditApplicationRepository.findById('credit-application-1')).toBeUndefined();
    expect(announced.submitted).toBeUndefined();
  });

  it('refuses a broker with no registration known, by its code', async () => {
    const { commandBus } = await arrange({ inForce: undefined });

    await expect(commandBus.execute(new BringApplicationCommand(broker, request))).rejects.toMatchObject({
      code: 'BROKER_REGISTRATION_LAPSED',
    });
  });

  it('is refused to an actor who does not hold the permission application.bring, by FORBIDDEN', async () => {
    const { commandBus } = await arrange({ inForce: true });

    await expect(commandBus.execute(new BringApplicationCommand(anActor().build(), request))).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

/** The registration of the broker in the read model, and the advisor whose branch holds the customer. */
async function arrange({ inForce }: { inForce: boolean | undefined }) {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const customerAdvisorBranch = new FakeCustomerAdvisorBranchGateway();
  const brokerRegistrations = new FakeBrokerRegistrations();
  const announced: { submitted?: unknown; brought?: unknown } = {};

  customerAdvisorBranch.answerBranchOf('customer-1', 'branch-1');

  if (inForce !== undefined) {
    await brokerRegistrations.upsertIfNewer('broker-1', stamp, () => ({
      brokerId: 'broker-1',
      inForce,
      changedAt: stamp.occurredAt,
    }));
  }

  domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    announced.submitted = event;
  });

  domainEvents.on(CreditApplicationBrought.eventName, async (event) => {
    announced.brought = event;
  });

  const handler = new BringApplicationHandler(
    creditApplicationRepository,
    ids,
    clock,
    customerAdvisorBranch,
    brokerRegistrations,
  );

  commandBus.use(holders).register(BringApplicationCommand, handler);

  return { commandBus, creditApplicationRepository, announced };
}
