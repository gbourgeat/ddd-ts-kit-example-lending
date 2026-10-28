import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { WithdrawIncidentWhenPaidEventHandler } from '@/contexts/servicing/arrears/application/event-handlers/withdraw-incident-when-paid.event-handler';
import { WithdrawRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/withdraw-repayment-incident/withdraw-repayment-incident.command';
import { LoanArrearsCleared } from '@/contexts/servicing/arrears/domain/events/loan-arrears-cleared.event';

describe('When loan arrears cleared', () => {
  it('asks the loan to withdraw its repayment incident, as the system actor of the reaction', async () => {
    const { commandBus } = createTestBuses({ idPrefix: 'loan' });
    const sent: WithdrawRepaymentIncidentCommand[] = [];

    commandBus.register(WithdrawRepaymentIncidentCommand, {
      execute: async (command: WithdrawRepaymentIncidentCommand) => {
        sent.push(command);
      },
    });

    const handler = new WithdrawIncidentWhenPaidEventHandler(commandBus);

    await handler.handle(new LoanArrearsCleared('loan-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(sent.map((command) => command.loanId)).toEqual(['loan-1']);
  });
});
