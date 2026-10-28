import type { Actor } from '@ddd-ts-kit/kernel';
import type { AccessExplanations } from '@/contexts/credit-application/file/application/ports/access-explanations.port';
import type { AccessRule } from '@/contexts/credit-application/file/domain/vocabularies/access-rule.vocabulary';

/** Answers the rules the spec gives it, and keeps the questions it was asked. */
export class FakeAccessExplanations implements AccessExplanations {
  private readonly questions: { actor: Actor; applicationId: string }[] = [];
  private rules: readonly AccessRule[] = [];

  /** The rules the next answers name. */
  answerWith(rules: readonly AccessRule[]): void {
    this.rules = rules;
  }

  /** The questions asked so far, in order. */
  received(): readonly { actor: Actor; applicationId: string }[] {
    return [...this.questions];
  }

  async refusingRules(actor: Actor, applicationId: string): Promise<readonly AccessRule[]> {
    this.questions.push({ actor, applicationId });

    return this.rules;
  }
}
