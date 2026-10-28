import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { RecordPayoutCommand } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.command';
import { RecordPayoutHandler } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.record-payout']] },
  }),
  map: AuthorizationMap.of(requires(RecordPayoutCommand, servicingPermissions['loan.record-payout'])),
});

const holder = anActor().withRole('holder').build();

const payout = {
  loanId: 'application-1',
  borrowerName: 'Ada Lovelace',
  amountCents: 100_000,
  durationMonths: 12,
  annualRateBasisPoints: 500,
};

describe('Record payout', () => {
  it('gives birth to the loan of the application, paid out with its schedule of instalments', async () => {
    const { commandBus, loanRepository } = arrange();

    await commandBus.execute(new RecordPayoutCommand(holder, payout));

    const loan = await loanRepository.findById('application-1');

    expect(loan?.schedule?.instalments).toHaveLength(12);
    expect(loan?.borrower?.name).toBe('Ada Lovelace');
  });

  it('links the loan to its application, so that the borrower reads it', async () => {
    const { commandBus, relations } = arrange();

    await commandBus.execute(new RecordPayoutCommand(holder, payout));

    expect(relations.all()).toContainEqual({
      object: 'loan:application-1',
      relation: 'application',
      subject: 'application:application-1',
    });
  });

  it('records nothing more when the same payout comes again: one loan per application', async () => {
    const { commandBus, relations } = arrange();

    await commandBus.execute(new RecordPayoutCommand(holder, payout));
    const again = await commandBus.execute(new RecordPayoutCommand(holder, payout));

    expect(again).toBe('application-1');
    expect(relations.all()).toHaveLength(1);
  });

  it('refuses a schedule of an amount that is not above zero, with the code INVALID_SCHEDULE', async () => {
    const { commandBus } = arrange();

    await expect(
      commandBus.execute(new RecordPayoutCommand(holder, { ...payout, amountCents: 0 })),
    ).rejects.toMatchObject({ code: 'INVALID_SCHEDULE' });
  });

  it('is refused to an actor who does not hold the permission loan.record-payout', async () => {
    const { commandBus } = arrange();
    const command = new RecordPayoutCommand(anActor().build(), payout);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  const loanRepository = dispatching(new FakeLoanRepository());
  const relations = new InMemoryRelationTupleStore();

  const handler = new RecordPayoutHandler(loanRepository, { clock, relations });

  commandBus.use(holders).register(RecordPayoutCommand, handler);

  return { commandBus, loanRepository, relations };
}
