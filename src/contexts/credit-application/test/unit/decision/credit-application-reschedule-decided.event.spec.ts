import { describe, expect, it } from '@jest/globals';
import { CreditApplicationRescheduleDecided } from '@/contexts/credit-application/decision/domain/events/credit-application-reschedule-decided.event';

const decidedAt = new Date('2026-01-01T00:00:00.000Z');

describe('CreditApplicationRescheduleDecided', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CreditApplicationRescheduleDecided(
      'credit-application-1',
      decidedAt,
      'advisor-1',
      'advisor',
      48,
      1_000_000,
    );

    expect(event.name).toBe('credit-application.credit-application.reschedule-decided');
    expect(event.aggregateId).toBe('credit-application-1');
  });

  it('keeps the decider, the level, the new duration and the outstanding amount it decided', () => {
    const event = new CreditApplicationRescheduleDecided(
      'credit-application-1',
      decidedAt,
      'advisor-1',
      'advisor',
      48,
      1_000_000,
    );

    expect({
      occurredAt: event.occurredAt,
      deciderId: event.deciderId,
      level: event.level,
      durationMonths: event.durationMonths,
      outstandingAmountCents: event.outstandingAmountCents,
    }).toEqual({
      occurredAt: decidedAt,
      deciderId: 'advisor-1',
      level: 'advisor',
      durationMonths: 48,
      outstandingAmountCents: 1_000_000,
    });
  });
});
