import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import type { CreditApplicationState } from '@/contexts/credit-application/file/domain/values/credit-application-state';

/** When the personal data of a refused application may be erased: once its retention, counted from the refusal, is over. */
export class RefusalRetentionService {
  /** Whether the file was refused on or before `cutoff`, the instant before which a refusal has outlived its retention. */
  isPastRetention(file: Pick<CreditApplicationState, 'decision'>, cutoff: Date): boolean {
    const { decision } = file;

    return decision?.outcome === DecisionOutcome.Refuse && decision.decidedAt.getTime() <= cutoff.getTime();
  }
}
