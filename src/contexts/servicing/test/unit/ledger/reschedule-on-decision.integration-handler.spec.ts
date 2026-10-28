import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { creditApplicationRescheduleDecidedV1 } from '@/contexts/credit-application/published-language';
import { RescheduleOnDecisionIntegrationHandler } from '@/contexts/servicing/ledger/application/integration/handlers/reschedule-on-decision.integration-handler';
import { RescheduleLoanCommand } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.command';

describe('When credit-application publishes credit-application.credit-application.reschedule-decided', () => {
  it('listens to the type credit-application publishes', () => {
    const handler = new RescheduleOnDecisionIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(RescheduleOnDecisionIntegrationHandler);

    expect(RescheduleOnDecisionIntegrationHandler.eventType).toBe(
      'credit-application.credit-application.reschedule-decided',
    );
  });

  it('acts as a system actor named after its consumer name', () => {
    const { handler } = arrange();

    expect(handler.actor).toMatchObject({ id: 'system:servicing.reschedule-on-decision', type: 'system' });
  });

  it('reschedules the loan of the application over the new duration and the outstanding capital, decided by the event', async () => {
    const { handler, sent } = arrange();

    await handler.handle(decided('event-1'));

    expect(sent).toHaveLength(1);

    expect(sent[0]?.rescheduling).toEqual({
      loanId: 'credit-application-1',
      decisionId: 'event-1',
      capitalCents: 80_000,
      durationMonths: 6,
    });
  });

  it('sends the same decision when the same event is delivered twice, so that the loan records it once', async () => {
    const { handler, sent } = arrange();

    await handler.handle(decided('event-1'));
    await handler.handle(decided('event-1'));

    expect(sent.map((command) => command.rescheduling.decisionId)).toEqual(['event-1', 'event-1']);
  });
});

function decided(id: string) {
  return creditApplicationRescheduleDecidedV1.create(
    { creditApplicationId: 'credit-application-1', durationMonths: 6, outstandingAmountCents: 80_000 },
    { id, occurredAt: '2026-01-01T00:00:00.000Z' },
  );
}

function arrange() {
  const commands = new InMemoryCommandBus();
  const sent: RescheduleLoanCommand[] = [];

  commands.register(RescheduleLoanCommand, {
    execute: async (command: RescheduleLoanCommand) => {
      sent.push(command);
    },
  });

  const handler = new RescheduleOnDecisionIntegrationHandler(commands);

  return { handler, sent };
}
