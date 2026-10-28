import { Money } from '@/shared-kernel/money.vo';
import type { CreditApplicationState } from '@/contexts/credit-application/file/domain/values/credit-application-state';

/** The state of a credit application before any entry of its file: nothing is known yet, every list is empty. */
export function initialCreditApplicationState(): CreditApplicationState {
  return {
    applicantId: '',
    amount: Money.ofCents(0),
    durationMonths: 0,
    registeredAt: new Date(0),
    branchId: '',
    productId: '',
    productTermsFindings: [],
    accountConsent: undefined,
    coBorrowerIds: [],
    guarantorIds: [],
    entryCount: 0,
    correctedEntryIds: [],
    documentKeys: [],
    listedPartyCount: undefined,
    lastAssessment: undefined,
    refusalReviewConclusion: undefined,
    refusalReviewerId: '',
    decision: undefined,
    exception: undefined,
    humanReview: undefined,
    exceptionDecision: undefined,
    contestation: undefined,
    withdrawnAt: undefined,
  };
}
