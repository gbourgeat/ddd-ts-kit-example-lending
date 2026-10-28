import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { DeclareIncidentAfterTwoUnpaidEventHandler } from '@/contexts/servicing/arrears/application/event-handlers/declare-incident-after-two-unpaid.event-handler';
import { DeclareRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.command';
import { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';

describe('When loan instalment marked unpaid', () => {
  it('asks the loan to declare its repayment incident, as the system actor of the reaction', async () => {
    const { commandBus } = createTestBuses({ idPrefix: 'loan' });
    const sent: DeclareRepaymentIncidentCommand[] = [];

    commandBus.register(DeclareRepaymentIncidentCommand, {
      execute: async (command: DeclareRepaymentIncidentCommand) => {
        sent.push(command);
      },
    });

    const handler = new DeclareIncidentAfterTwoUnpaidEventHandler(commandBus);

    await handler.handle(new LoanInstalmentMarkedUnpaid('loan-1', new Date('2026-01-01T00:00:00.000Z'), 2));

    expect(sent.map((command) => command.loanId)).toEqual(['loan-1']);
  });
});
