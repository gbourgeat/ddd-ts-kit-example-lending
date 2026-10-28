import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { RegisterNotConsulted } from '@/contexts/credit-application/assessment/domain/errors/register-not-consulted.error';

describe('RegisterNotConsulted', () => {
  it('refuses the assessment of an application whose register is not consulted, by its code', () => {
    const error = RegisterNotConsulted.forApplication('credit-application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('REGISTER_NOT_CONSULTED');
  });
});
