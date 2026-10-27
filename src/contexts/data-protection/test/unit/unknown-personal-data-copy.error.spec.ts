import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownPersonalDataCopy } from '@/contexts/data-protection/domain/errors/unknown-personal-data-copy.error';

describe('UnknownPersonalDataCopy', () => {
  it('refuses a copy that is not kept with the code FILE_NOT_FOUND, answered as not found', () => {
    const error = UnknownPersonalDataCopy.forUnknownPersonalDataCopy();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('FILE_NOT_FOUND');
    expect(error.facts).toEqual({});
  });
});
