import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ReverseWriteOffCommand } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.command';
import { ReverseWriteOffHandler } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.write-off']] },
  }),
  map: AuthorizationMap.of(requires(ReverseWriteOffCommand, servicingPermissions['loan.write-off'])),
});

const holder = anActor().withRole('holder').build();

describe('Reverse write off', () => {
  it('reopens the written off loan, its ledger keeping the write-off unedited', async () => {
    const { commandBus, loanRepository, clock } = arrange();
    const written = aLoan().identifiedBy('loan-1').build();

    written.writeOff(clock.now());
    await loanRepository.save(written);

    await commandBus.execute(new ReverseWriteOffCommand(holder, 'loan-1'));

    expect((await loanRepository.findById('loan-1'))?.closedAt).toBeUndefined();
  });

  it('refuses the reversal of a loan that was not written off, with LOAN_NOT_WRITTEN_OFF', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await expect(commandBus.execute(new ReverseWriteOffCommand(holder, 'loan-1'))).rejects.toMatchObject({
      code: 'LOAN_NOT_WRITTEN_OFF',
    });
  });

  it('is refused to an actor who does not hold the permission loan.write-off', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new ReverseWriteOffCommand(anActor().build(), 'loan-1'))).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan.
  const loanRepository = dispatching(new FakeLoanRepository());

  commandBus.use(holders).register(ReverseWriteOffCommand, new ReverseWriteOffHandler(loanRepository, clock));

  return { commandBus, loanRepository, clock };
}
