import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { FakePersonalDataErasure } from '@/contexts/servicing/test/fakes/personal-data-erasure.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, servicingPermissions['loan.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();
const asOf = new Date('2026-01-10T03:00:00.000Z');

describe('Erase personal data past retention', () => {
  it('erases the loans closed more than ten years before the run, and keeps the others', async () => {
    const { commandBus, loanRepository, erasure } = arrange();

    await loanRepository.save(closedLoan('loan-old', '2014-01-10T08:00:00.000Z'));
    await loanRepository.save(closedLoan('loan-recent', '2024-06-01T08:00:00.000Z'));

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));

    expect(erasure.erasedLoans).toEqual(['loan-old']);
  });

  it('erases nothing while no loan is past its retention', async () => {
    const { commandBus, erasure } = arrange();

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));

    expect(erasure.erasedLoans).toEqual([]);
  });

  it('is refused to an actor who does not hold the permission loan.erase-past-retention', async () => {
    const { commandBus } = arrange();

    await expect(
      commandBus.execute(new ErasePersonalDataPastRetentionCommand(anActor().build(), asOf)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function closedLoan(id: string, closedOn: string) {
  const loan = aLoan().identifiedBy(id).build();

  loan.close(new Date(closedOn));

  return loan;
}

function arrange() {
  const { commandBus, dispatching } = createTestBuses({ idPrefix: 'loan' });
  const loanRepository = dispatching(new FakeLoanRepository());
  const erasure = new FakePersonalDataErasure();

  commandBus
    .use(holders)
    .register(
      ErasePersonalDataPastRetentionCommand,
      new ErasePersonalDataPastRetentionHandler(loanRepository, erasure),
    );

  return { commandBus, loanRepository, erasure };
}
