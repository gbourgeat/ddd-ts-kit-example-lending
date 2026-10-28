import { Money } from '@/shared-kernel/money.vo';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import type { CreditApplicationState } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';

/** What a decision approved: the product, the amount approved and the duration asked. */
export interface ApprovedTerms {
  readonly productId: string;
  readonly amount: Money;
  readonly durationMonths: number;
}

/** Reads the terms an application was approved on from its file, or none while no decision approved it. */
export class ApprovedTermsService {
  of(file: Pick<CreditApplicationState, 'decision' | 'productId' | 'durationMonths'>): ApprovedTerms | undefined {
    const { decision, productId, durationMonths } = file;

    if (decision === undefined || decision.outcome === DecisionOutcome.Refuse) {
      return undefined;
    }

    return { productId, amount: Money.ofCents(decision.approvedAmountCents), durationMonths };
  }
}
