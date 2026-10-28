import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';
import { CollectInstalmentCommand } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.command';
import { CollectInstalmentHandler } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { FakePaymentProvider } from '@/contexts/servicing/test/fakes/payment-provider.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const LOAN_ID = 'loan-1';
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
const FIRST_DUE_ON = new Date('2026-02-10T00:00:00.000Z');
const FIRST_INSTALMENT_CENTS = 8_000;
const FIRST_INSTALMENT = { number: 1, amountCents: FIRST_INSTALMENT_CENTS };

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.collect']] },
  }),
  map: AuthorizationMap.of(requires(CollectInstalmentCommand, servicingPermissions['loan.collect'])),
});

const holder = anActor().withRole('holder').build();

describe('Collect instalment', () => {
  it('records the money received when the direct debit of a due instalment is accepted', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoanWithFirstInstalmentDue());

    await commandBus.execute(new CollectInstalmentCommand(holder, LOAN_ID, FIRST_INSTALMENT));

    expect((await loanRepository.findById(LOAN_ID))?.instalmentsPaid).toEqual([1]);
  });

  it('marks the instalment unpaid when its direct debit is rejected', async () => {
    const { commandBus, loanRepository, paymentProvider } = arrange();

    await loanRepository.save(aLoanWithFirstInstalmentDue());
    paymentProvider.markRejected(LOAN_ID);

    await commandBus.execute(new CollectInstalmentCommand(holder, LOAN_ID, FIRST_INSTALMENT));

    expect((await loanRepository.findById(LOAN_ID))?.instalmentsUnpaid).toEqual([1]);
  });

  it('does not ask again for the direct debit of an instalment marked unpaid', async () => {
    const { commandBus, loanRepository, paymentProvider } = arrange();

    await loanRepository.save(aLoanWithFirstInstalmentDue());
    paymentProvider.markRejected(LOAN_ID);

    await commandBus.execute(new CollectInstalmentCommand(holder, LOAN_ID, FIRST_INSTALMENT));
    await commandBus.execute(new CollectInstalmentCommand(holder, LOAN_ID, FIRST_INSTALMENT));

    expect(paymentProvider.collected).toHaveLength(1);
  });

  it('does not collect an instalment twice once it is paid', async () => {
    const { commandBus, loanRepository, paymentProvider } = arrange();

    await loanRepository.save(aLoanWithFirstInstalmentDue());

    await commandBus.execute(new CollectInstalmentCommand(holder, LOAN_ID, FIRST_INSTALMENT));
    await commandBus.execute(new CollectInstalmentCommand(holder, LOAN_ID, FIRST_INSTALMENT));

    expect(paymentProvider.collected).toHaveLength(1);
  });

  it('refuses to collect an instalment of a loan that does not exist', async () => {
    const { commandBus } = arrange();

    await expect(
      commandBus.execute(new CollectInstalmentCommand(holder, 'loan-404', FIRST_INSTALMENT)),
    ).rejects.toMatchObject({ code: ServicingCodes.UnknownLoan });
  });

  it('asks no direct debit for a loan that does not exist', async () => {
    const { commandBus, paymentProvider } = arrange();

    await commandBus.execute(new CollectInstalmentCommand(holder, 'loan-404', FIRST_INSTALMENT)).catch(() => undefined);

    expect(paymentProvider.collected).toEqual([]);
  });

  it('is refused to an actor who does not hold the permission loan.collect', async () => {
    const { commandBus } = arrange();
    const command = new CollectInstalmentCommand(anActor().build(), LOAN_ID, FIRST_INSTALMENT);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** A loan paid out on the tenth of January, whose first instalment the nightly run noted due on the tenth of February. */
function aLoanWithFirstInstalmentDue() {
  const loan = aLoan().identifiedBy(LOAN_ID).bornAt(PAID_OUT_ON).build();

  loan.computeDueInstalments(FIRST_DUE_ON);

  return loan;
}

function arrange() {
  const { commandBus, dispatching, clock } = createTestBuses({ idPrefix: 'loan' });
  // The save announces the events of the loan, as the application does; the payment provider is the fake the spec drives.
  const loanRepository = dispatching(new FakeLoanRepository());
  const paymentProvider = new FakePaymentProvider();

  commandBus
    .use(holders)
    .register(CollectInstalmentCommand, new CollectInstalmentHandler(loanRepository, paymentProvider, clock));

  return { commandBus, loanRepository, paymentProvider };
}
