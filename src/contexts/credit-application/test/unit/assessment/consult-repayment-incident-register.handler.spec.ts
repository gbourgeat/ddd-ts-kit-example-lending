import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import { ConsultRepaymentIncidentRegisterHandler } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeCustomerIdentityGateway } from '@/contexts/credit-application/test/fakes/customer-identity-gateway.fake';
import { FakeRepaymentIncidentRegister } from '@/contexts/credit-application/test/fakes/repayment-incident-register.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.consult-register']] },
  }),
  map: AuthorizationMap.of(
    requires(ConsultRepaymentIncidentRegisterCommand, creditApplicationPermissions['application.consult-register']),
  ),
});

const holder = anActor().withRole('holder').build();
const registeredAt = new Date('2026-01-10T00:00:00.000Z');

describe('Consult repayment incident register', () => {
  it('answers the name and birth date of the applicant and of each co-borrower, and whether each is listed', async () => {
    const { commandBus, identities, register } = await arrange();

    identities.answerIdentityOf('customer-1', { name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' });
    identities.answerIdentityOf('customer-2', { name: 'Charles Babbage', birthDate: '1791-12-26T00:00:00.000Z' });
    register.markListed('Charles Babbage');

    const consulted = await commandBus.execute(new ConsultRepaymentIncidentRegisterCommand(holder, 'application-1'));

    expect(consulted).toEqual({
      applicationId: 'application-1',
      parties: [
        { customerId: 'customer-1', name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z', listed: false },
        { customerId: 'customer-2', name: 'Charles Babbage', birthDate: '1791-12-26T00:00:00.000Z', listed: true },
      ],
    });
  });

  it('asks the register with the name and birth date read at the instant of the consult', async () => {
    const { commandBus, identities, register } = await arrange();

    identities.answerIdentityOf('customer-1', { name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' });
    identities.answerIdentityOf('customer-2', { name: 'Charles Babbage', birthDate: '1791-12-26T00:00:00.000Z' });

    await commandBus.execute(new ConsultRepaymentIncidentRegisterCommand(holder, 'application-1'));

    expect(register.asked).toContainEqual({ name: 'Ada Lovelace', birthDate: new Date('1980-05-01T00:00:00.000Z') });
  });

  it('keeps the answer in the file of the application, without the names', async () => {
    const { commandBus, identities, creditApplicationRepository } = await arrange();

    identities.answerIdentityOf('customer-1', { name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' });
    identities.answerIdentityOf('customer-2', { name: 'Charles Babbage', birthDate: '1791-12-26T00:00:00.000Z' });

    await commandBus.execute(new ConsultRepaymentIncidentRegisterCommand(holder, 'application-1'));

    const stored = await creditApplicationRepository.findById('application-1');

    expect(stored?.toState().entryCount).toBe(3);
  });

  it('refuses to consult the register of an application that does not exist, with its code', async () => {
    const { commandBus } = await arrange();

    await expect(
      commandBus.execute(new ConsultRepaymentIncidentRegisterCommand(holder, 'unknown-application')),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('refuses to consult the register when a party is not identified, with its code', async () => {
    const { commandBus, identities } = await arrange();

    identities.answerIdentityOf('customer-1', { name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' });

    await expect(
      commandBus.execute(new ConsultRepaymentIncidentRegisterCommand(holder, 'application-1')),
    ).rejects.toMatchObject({ code: 'UNIDENTIFIED_PARTY' });
  });

  it('is refused to an actor who does not hold the permission application.consult-register', async () => {
    const { commandBus } = await arrange();
    const command = new ConsultRepaymentIncidentRegisterCommand(anActor().build(), 'application-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const identities = new FakeCustomerIdentityGateway();
  const register = new FakeRepaymentIncidentRegister();

  const application = CreditApplication.create('application-1', 'customer-1', {
    amount: Money.ofCents(1234567),
    durationMonths: 60,
    registeredAt,
    branchId: '',
  });

  application.nameCoBorrower('customer-2', registeredAt);
  await creditApplicationRepository.save(application);

  const handler = new ConsultRepaymentIncidentRegisterHandler(creditApplicationRepository, identities, register, clock);

  commandBus.use(holders).register(ConsultRepaymentIncidentRegisterCommand, handler);

  return { commandBus, creditApplicationRepository, identities, register };
}
