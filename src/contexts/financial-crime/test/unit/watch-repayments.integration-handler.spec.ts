import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { loanPaymentReceivedV1 } from '@/contexts/servicing/published-language';
import { WatchRepaymentsIntegrationHandler } from '@/contexts/financial-crime/application/integration/handlers/watch-repayments.integration-handler';
import { RaiseAlertCommand } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.command';
import { RaiseAlertHandler } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.handler';
import { FakeAlertRepository } from '@/contexts/financial-crime/test/fakes/alert.repository.fake';
import { createTestBuses } from '@ddd-ts-kit/testing';

const meta = { id: 'event-1', occurredAt: '2026-06-01T00:00:00.000Z' };

describe('When servicing publishes servicing.loan.payment-received', () => {
  it('listens to the type servicing publishes', () => {
    const handler = new WatchRepaymentsIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(WatchRepaymentsIntegrationHandler);
    expect(WatchRepaymentsIntegrationHandler.eventType).toBe('servicing.loan.payment-received');
  });

  it('acts as a system actor named after its consumer name', () => {
    const handler = new WatchRepaymentsIntegrationHandler(new InMemoryCommandBus());

    expect(handler.actor).toMatchObject({ id: 'system:financial-crime.watch-repayments', type: 'system' });
  });

  it('executes RaiseAlert as its system actor, on the repayment identified by the event, with the facts it has', async () => {
    const { commands, executed } = arrange();
    const handler = new WatchRepaymentsIntegrationHandler(commands);

    await handler.handle(paymentOf({ amountCents: 50_000 }));

    expect(executed).toHaveLength(1);
    expect(executed[0]).toBeInstanceOf(RaiseAlertCommand);
    expect(executed[0]?.actor).toMatchObject({ id: 'system:financial-crime.watch-repayments' });
    expect(executed[0]?.repaymentReference).toBe('event-1');
    expect(executed[0]?.facts).toMatchObject({ amountCents: 50_000, early: false, earlyRepaidWithinYearCents: 0 });
  });

  it('raises no alert on an ordinary instalment collected from the direct debit of the borrower, however large', async () => {
    const { commands, alertRepository } = arrange();
    const handler = new WatchRepaymentsIntegrationHandler(commands);

    await handler.handle(paymentOf({ amountCents: 2_500_000 }));

    expect(alertRepository.count()).toBe(0);
  });

  it('has the same outcome when the same event is delivered twice', async () => {
    const { commands, alertRepository } = arrange();
    const handler = new WatchRepaymentsIntegrationHandler(commands);

    await handler.handle(paymentOf({ amountCents: 50_000 }));
    await handler.handle(paymentOf({ amountCents: 50_000 }));

    expect(alertRepository.count()).toBe(0);
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching } = createTestBuses({ idPrefix: 'alert' });
  const alertRepository = dispatching(new FakeAlertRepository());
  const executed: RaiseAlertCommand[] = [];
  const raise = new RaiseAlertHandler(alertRepository, ids, clock);

  commandBus.register(RaiseAlertCommand, {
    execute: async (command: RaiseAlertCommand) => {
      executed.push(command);

      return raise.execute(command);
    },
  });

  return { commands: commandBus, alertRepository, executed };
}

function paymentOf(overrides: { readonly amountCents: number }) {
  return loanPaymentReceivedV1.create({ loanId: 'loan-1', instalmentNumber: 3, ...overrides }, meta);
}
