import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { AlertAlreadyClosed } from '@/contexts/financial-crime/domain/errors/alert-already-closed.error';

describe('AlertAlreadyClosed', () => {
  it('refuses for alert with the code ALERT_ALREADY_CLOSED', () => {
    const error = AlertAlreadyClosed.forAlert();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('ALERT_ALREADY_CLOSED');
    expect(error.message).toBe('Alert already closed.');
    expect(error.facts).toEqual({});
  });
});
