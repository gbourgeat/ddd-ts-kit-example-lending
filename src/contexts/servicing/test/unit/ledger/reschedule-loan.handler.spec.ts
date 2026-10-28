import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { RescheduleLoanCommand } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.command';
import { RescheduleLoanHandler } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.reschedule']] },
  }),
  map: AuthorizationMap.of(requires(RescheduleLoanCommand, servicingPermissions['loan.reschedule'])),
});

const holder = anActor().withRole('holder').build();
const CAPITAL_CENTS = 80_000;
const DURATION_MONTHS = 6;

describe('Reschedule loan', () => {
  it('gives the loan the schedule of the capital over the new duration, at the rate it keeps', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await commandBus.execute(rescheduling('loan-1', 'decision-1'));

    const loan = await loanRepository.findById('loan-1');

    expect(loan?.currentSchedule?.durationMonths).toBe(DURATION_MONTHS);
    expect(loan?.currentSchedule?.annualRateBasisPoints).toBe(500);
  });

  it('keeps the amount paid out of the loan, the earlier schedule staying in its ledger', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await commandBus.execute(rescheduling('loan-1', 'decision-1'));

    expect((await loanRepository.findById('loan-1'))?.schedule?.principal.cents).toBe(100_000);
  });

  it('records a decision once: a delivery of the same decision again changes nothing', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());
    await commandBus.execute(rescheduling('loan-1', 'decision-1'));

    await commandBus.execute(rescheduling('loan-1', 'decision-1'));

    expect((await loanRepository.findById('loan-1'))?.toState().rescheduledBy).toEqual(['decision-1']);
  });

  it('refuses to reschedule a closed loan, with LOAN_ALREADY_CLOSED', async () => {
    const { commandBus, loanRepository } = arrange();
    const closed = aLoan().identifiedBy('loan-1').build();

    closed.close(new Date('2026-06-01T00:00:00.000Z'));
    await loanRepository.save(closed);

    await expect(commandBus.execute(rescheduling('loan-1', 'decision-1'))).rejects.toMatchObject({
      code: 'LOAN_ALREADY_CLOSED',
    });
  });

  it('refuses to reschedule a loan that does not exist, with UNKNOWN_LOAN', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(rescheduling('unknown', 'decision-1'))).rejects.toMatchObject({
      code: 'UNKNOWN_LOAN',
    });
  });

  it('is refused to an actor who does not hold the permission loan.reschedule', async () => {
    const { commandBus } = arrange();
    const stranger = anActor().build();

    await expect(
      commandBus.execute(
        new RescheduleLoanCommand(stranger, {
          loanId: 'loan-1',
          decisionId: 'decision-1',
          capitalCents: CAPITAL_CENTS,
          durationMonths: DURATION_MONTHS,
        }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function rescheduling(loanId: string, decisionId: string): RescheduleLoanCommand {
  return new RescheduleLoanCommand(holder, {
    loanId,
    decisionId,
    capitalCents: CAPITAL_CENTS,
    durationMonths: DURATION_MONTHS,
  });
}

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan.
  const loanRepository = dispatching(new FakeLoanRepository());

  commandBus.use(holders).register(RescheduleLoanCommand, new RescheduleLoanHandler(loanRepository, clock));

  return { commandBus, loanRepository };
}
