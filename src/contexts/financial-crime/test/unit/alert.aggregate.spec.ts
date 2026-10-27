import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
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

describe('Alert closure', () => {
  const closedOn = new Date('2026-04-02T09:00:00.000Z');

  it('is closed on the day given, with the reason the compliance officer gives', () => {
    const alert = anAlert().build();

    alert.close('Payer confirmed as the borrower spouse', closedOn);

    expect(alert.closedAt).toEqual(closedOn);
    expect(alert.closureReason).toBe('Payer confirmed as the borrower spouse');
  });

  it('refuses to close an alert without a reason', () => {
    const alert = anAlert().build();

    expectRefusal(() => alert.close('   ', closedOn), 'CLOSURE_REASON_MISSING');
  });

  it('refuses to close an alert a second time', () => {
    const alert = anAlert().build();

    alert.close('Reviewed', closedOn);

    expectRefusal(() => alert.close('Reviewed again', closedOn), 'ALERT_ALREADY_CLOSED');
  });
});
