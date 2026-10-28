import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { CloseLoanCommand } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.command';
import { CloseLoanHandler } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const closers = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { closer: [servicingPermissions['loan.close']] },
  }),
  map: AuthorizationMap.of(requires(CloseLoanCommand, servicingPermissions['loan.close'])),
});

const closer = anActor().withRole('closer').build();

describe('Close loan', () => {
  it('closes the loan on the instant of the clock, and saves it closed', async () => {
    const { commandBus, loanRepository, clock } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await commandBus.execute(new CloseLoanCommand(closer, 'loan-1'));

    expect((await loanRepository.findById('loan-1'))?.closedAt).toEqual(clock.now());
  });

  it('is refused to an actor who does not hold the permission loan.close', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await expect(commandBus.execute(new CloseLoanCommand(anActor().build(), 'loan-1'))).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('refuses to close a loan that does not exist, and saves nothing', async () => {
    const { commandBus, loanRepository } = arrange();

    await expect(commandBus.execute(new CloseLoanCommand(closer, 'unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_LOAN',
    });

    expect(await loanRepository.findById('unknown')).toBeUndefined();
  });

  it('refuses to close a loan already closed, and keeps its first closure', async () => {
    const { commandBus, loanRepository, clock } = arrange();
    const closed = aLoan().identifiedBy('loan-1').build();

    closed.close(clock.now());
    await loanRepository.save(closed);

    await expect(commandBus.execute(new CloseLoanCommand(closer, 'loan-1'))).rejects.toMatchObject({
      code: 'LOAN_ALREADY_CLOSED',
    });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan.
  const loanRepository = dispatching(new FakeLoanRepository());

  commandBus.use(closers).register(CloseLoanCommand, new CloseLoanHandler(loanRepository, clock));

  return { commandBus, loanRepository, clock };
}
