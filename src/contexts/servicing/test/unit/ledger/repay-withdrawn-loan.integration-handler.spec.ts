import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { creditApplicationWithdrawnV1 } from '@/contexts/credit-application/published-language';
import { RepayWithdrawnLoanIntegrationHandler } from '@/contexts/servicing/ledger/application/integration/handlers/repay-withdrawn-loan.integration-handler';
import { RecordWithdrawalRepaymentCommand } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.command';

describe('When credit-application publishes credit-application.credit-application.withdrawn', () => {
  it('listens to the type credit-application publishes', () => {
    const { handler } = arrange();

    expect(handler).toBeInstanceOf(RepayWithdrawnLoanIntegrationHandler);
    expect(RepayWithdrawnLoanIntegrationHandler.eventType).toBe('credit-application.credit-application.withdrawn');
  });

  it('acts as a system actor named after its consumer name', () => {
    const { handler } = arrange();

    expect(handler.actor).toMatchObject({ id: 'system:servicing.repay-withdrawn-loan', type: 'system' });
  });

  it('repays the loan of the application on the instant the withdrawal was announced', async () => {
    const { handler, sent } = arrange();

    await handler.handle(withdrawn('2026-03-31T00:00:00.000Z'));

    expect(sent).toHaveLength(1);

    expect(sent[0]?.withdrawal).toEqual({
      loanId: 'credit-application-1',
      withdrawnAt: new Date('2026-03-31T00:00:00.000Z'),
    });
  });
});

function withdrawn(occurredAt: string) {
  return creditApplicationWithdrawnV1.create(
    { creditApplicationId: 'credit-application-1' },
    { id: 'event-1', occurredAt },
  );
}

function arrange() {
  const commands = new InMemoryCommandBus();
  const sent: RecordWithdrawalRepaymentCommand[] = [];

  commands.register(RecordWithdrawalRepaymentCommand, {
    execute: async (command: RecordWithdrawalRepaymentCommand) => {
      sent.push(command);
    },
  });

  const handler = new RepayWithdrawnLoanIntegrationHandler(commands);

  return { handler, sent };
}
