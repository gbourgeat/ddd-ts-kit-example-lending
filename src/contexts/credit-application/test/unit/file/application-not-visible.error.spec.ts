import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ApplicationNotVisible } from '@/contexts/credit-application/file/domain/errors/application-not-visible.error';
import { AccessRule } from '@/contexts/credit-application/file/domain/vocabularies/access-rule.vocabulary';

describe('ApplicationNotVisible', () => {
  it('refuses with the code APPLICATION_NOT_VISIBLE, exposing the rules that refuse the application', () => {
    const error = ApplicationNotVisible.forApplicationNotVisible([AccessRule.NotBroughtByYou]);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('APPLICATION_NOT_VISIBLE');
    expect(error.facts).toEqual({ rules: ['not-brought-by-you'] });
  });

  it('names each rule in the words of the bank, in the message', () => {
    const error = ApplicationNotVisible.forApplicationNotVisible([
      AccessRule.DeclaredConflict,
      AccessRule.NotInPortfolio,
      AccessRule.NotBroughtByYou,
    ]);

    expect(error.message).toBe(
      'You may not see this application: a declared conflict of interest, not in your portfolio, not brought by you.',
    );
  });

  it('gives a message without any rule when no rule is known', () => {
    expect(ApplicationNotVisible.forApplicationNotVisible([]).message).toBe('You may not see this application.');
  });
});
