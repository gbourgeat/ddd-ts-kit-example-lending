import { describe, expect, it } from '@jest/globals';
import { ExceptionRequestCheckService } from '@/contexts/credit-application/file/domain/services/exception-request-check.service';

describe('ExceptionRequestCheckService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ExceptionRequestCheckService())).toEqual([]);
  });

  // TODO(domain): replace each entry below by a test named after the business decision ExceptionRequestCheckService makes, given aggregates built with the builders of test/builders.
  it.todo('makes its decision from the aggregates it is given');
  it.todo('refuses the decision when a rule spanning several aggregates is violated');
});
