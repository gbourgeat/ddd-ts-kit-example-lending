import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownEntry } from '@/contexts/credit-application/file/domain/errors/unknown-entry.error';

describe('UnknownEntry', () => {
  it('refuses for the entry with the code UNKNOWN_ENTRY', () => {
    const error = UnknownEntry.forEntry('credit-application-1#9');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_ENTRY');
    expect(error.message).toBe('Unknown entry of this application.');
    expect(error.facts).toEqual({ entryId: 'credit-application-1#9' });
  });
});
