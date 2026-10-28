import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';

describe('Borrower', () => {
  it('is equal to another borrower with the same name and postal address', () => {
    const first = Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris');
    const second = Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris');

    expect(first.equals(second)).toBe(true);
  });

  it('refuses a borrower without a name, with the code INVALID_BORROWER', () => {
    expectRefusal(() => Borrower.create('  ', '1 rue de la Paix, 75002 Paris'), 'INVALID_BORROWER');
  });

  it('keeps the name and the postal address without the spaces around them', () => {
    const borrower = Borrower.create('  Ada Lovelace ', ' 1 rue de la Paix, 75002 Paris ');

    expect(borrower.name).toBe('Ada Lovelace');
    expect(borrower.postalAddress).toBe('1 rue de la Paix, 75002 Paris');
  });
});
