import { describe, expect, it } from '@jest/globals';
import { givenEvents } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';

const bornAt = new Date('2026-03-01T00:00:00.000Z');

describe('Loan', () => {
  it('records its birth, and holds the state that event gives', () => {
    const born = Loan.create('loan-7', bornAt);

    expect(born.registeredAt).toEqual(bornAt);
    expect(born.pullEvents()).toEqual([new LoanPaidOut('loan-7', bornAt)]);
  });

  it('is rebuilt from its history, recording nothing', () => {
    givenEvents((id, history) => Loan.rehydrate(id, history), [new LoanPaidOut('loan-7', bornAt)])
      .when((loaded) => loaded.toState())
      .thenNoEvent()
      .thenState((loaded) => expect(loaded.version).toBe(1));
  });

  // TODO(domain): replace each entry below by a test named after the business rule it proves: given the events of a history, when one command, then the events it records (`thenEvents`) or the refusal (`thenError`).
  it.todo('refuses to be born when a birth invariant is violated');
  it.todo('records a fact for each business intention, and changes state only through it');
});
