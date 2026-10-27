import { describe, expect, it } from '@jest/globals';
import { AlertRaised } from '@/contexts/financial-crime/domain/events/alert-raised.event';
import { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';
import { anAlert } from '@/contexts/financial-crime/test/builders/alert.builder';

describe('Alert', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = anAlert().identifiedBy('alert-7').bornAt(bornAt).build();

    expect(born.id).toBe('alert-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is raised', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = anAlert().identifiedBy('alert-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([new AlertRaised('alert-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = anAlert().build();

    const loaded = Alert.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('anAlert exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = anAlert().build();

    expect(built.repaymentReference).toEqual('repayment-1');
  });
});
