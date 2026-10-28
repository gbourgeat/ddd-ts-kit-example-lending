import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownModelVersion } from '@/contexts/credit-scoring/domain/errors/unknown-model-version.error';

describe('UnknownModelVersion', () => {
  it('refuses a label that no published version carries with the code UNKNOWN_MODEL_VERSION', () => {
    const error = UnknownModelVersion.forLabel('2030.9');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_MODEL_VERSION');
  });
});
