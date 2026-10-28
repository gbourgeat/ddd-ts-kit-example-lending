import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { RefusalProposalStands } from '@/contexts/credit-application/file/domain/errors/refusal-proposal-stands.error';

describe('RefusalProposalStands', () => {
  it('refuses an approval over a confirmed refusal, with the code REFUSAL_PROPOSAL_STANDS', () => {
    const error = RefusalProposalStands.forApplication();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('REFUSAL_PROPOSAL_STANDS');

    expect(error.message).toBe(
      'The review confirmed the proposed refusal: the application can only be refused, not approved.',
    );

    expect(error.facts).toEqual({});
  });
});
