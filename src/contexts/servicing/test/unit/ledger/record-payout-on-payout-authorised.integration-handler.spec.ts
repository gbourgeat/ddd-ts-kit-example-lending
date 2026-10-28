import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { creditApplicationPayoutAuthorisedV1 } from '@/contexts/credit-application/published-language';
import { RecordPayoutOnPayoutAuthorisedIntegrationHandler } from '@/contexts/servicing/ledger/application/integration/handlers/record-payout-on-payout-authorised.integration-handler';
import { RecordPayoutCommand } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.command';
import { FakeBorrowerIdentity } from '@/contexts/servicing/test/fakes/borrower-identity.fake';

const meta = { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' };

const authorised = creditApplicationPayoutAuthorisedV1.create(
  {
    creditApplicationId: 'application-1',
    customerId: 'customer-1',
    branchId: 'branch-1',
    amountCents: 100_000,
    durationMonths: 12,
    rateBasisPoints: 500,
  },
  meta,
);

describe('When credit-application publishes credit-application.credit-application.payout-authorised', () => {
  it('listens to the type credit-application publishes', () => {
    expect(RecordPayoutOnPayoutAuthorisedIntegrationHandler.eventType).toBe(
      'credit-application.credit-application.payout-authorised',
    );
  });

  it('acts as a system actor named after its consumer name', () => {
    const { handler } = arrange();

    expect(handler.actor).toMatchObject({ id: 'system:servicing.record-payout-on-payout-authorised', type: 'system' });
  });

  it('records the payout of the application, with the name of its borrower, as the system actor', async () => {
    const { handler, sent } = arrange();

    await handler.handle(authorised);

    expect(sent).toHaveLength(1);

    expect(sent[0]?.payout).toEqual({
      loanId: 'application-1',
      borrowerName: 'Ada Lovelace',
      amountCents: 100_000,
      durationMonths: 12,
      annualRateBasisPoints: 500,
    });
  });

  it('refuses to record a payout whose borrower is not identified, with the code BORROWER_NOT_IDENTIFIED', async () => {
    const { handler, sent } = arrange({ identify: false });

    await expect(handler.handle(authorised)).rejects.toMatchObject({ code: 'BORROWER_NOT_IDENTIFIED' });
    expect(sent).toHaveLength(0);
  });
});

function arrange(options: { readonly identify: boolean } = { identify: true }) {
  const commands = new InMemoryCommandBus();
  const sent: RecordPayoutCommand[] = [];
  const borrowers = new FakeBorrowerIdentity();

  if (options.identify) {
    borrowers.identify('customer-1', 'Ada Lovelace');
  }

  commands.register(RecordPayoutCommand, {
    execute: async (command: RecordPayoutCommand) => {
      sent.push(command);

      return command.payout.loanId;
    },
  });

  const handler = new RecordPayoutOnPayoutAuthorisedIntegrationHandler(commands, borrowers);

  return { handler, sent };
}
