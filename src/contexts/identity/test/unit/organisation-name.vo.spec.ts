import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { OrganisationName } from '@/contexts/identity/domain/value-objects/organisation-name.vo';

describe('OrganisationName', () => {
  it('is free text, without the spaces at its ends', () => {
    expect(OrganisationName.create(' Acme & Sons ').value).toBe('Acme & Sons');
  });

  it.each(['', '  ', 'x'.repeat(101)])('refuses "%s"', (raw) => {
    expectRefusal(() => OrganisationName.create(raw), 'INVALID_ORGANISATION_NAME', { raw });
  });
});
