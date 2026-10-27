import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownAlert } from '@/contexts/financial-crime/domain/errors/unknown-alert.error';

describe('UnknownAlert', () => {
  it('refuses for alert with the code UNKNOWN_ALERT', () => {
    const error = UnknownAlert.forAlert();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_ALERT');
    expect(error.message).toBe('Unknown alert.');
    expect(error.facts).toEqual({});
  });
});
