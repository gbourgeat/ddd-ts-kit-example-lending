import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { DisplayName } from '@/contexts/identity/domain/value-objects/display-name.vo';

describe('DisplayName', () => {
  it('is what the person wrote, without the spaces at its ends', () => {
    expect(DisplayName.create('  Grace Hopper ').value).toBe('Grace Hopper');
  });

  it.each(['', '   ', 'x'.repeat(101)])('refuses a name of %s characters out of bounds', (raw) => {
    expectRefusal(() => DisplayName.create(raw), 'INVALID_DISPLAY_NAME', { raw });
  });
});
