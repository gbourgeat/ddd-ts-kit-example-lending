import type { Money } from '@/shared-kernel/money.vo';
import type { AccountConsentState } from '@/contexts/credit-application/file/domain/entities/account-consent.entity';
import type { ProposedOutcome } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import type { DecisionRecord } from '@/contexts/credit-application/file/domain/values/decision-record';
import type { ExceptionRequest } from '@/contexts/credit-application/file/domain/values/exception-request';
import type { ProductTermsFinding } from '@/contexts/credit-application/file/domain/values/product-terms-finding';
import type { RefusalConclusion } from '@/contexts/credit-application/file/domain/values/refusal-conclusion';

export interface CreditApplicationState {
  readonly applicantId: string;
  readonly amount: Money;
  readonly durationMonths: number;
  readonly registeredAt: Date;
  /** The branch the application was submitted on: empty when no advisor holds the applicant, or when it was submitted before the branch was recorded. */
  readonly branchId: string;
  /** The product the application is for: empty when none was given. */
  readonly productId: string;
  /** What the checks against the product found: a limit the request breaks, or terms not known. */
  readonly productTermsFindings: readonly ProductTermsFinding[];
  readonly accountConsent: AccountConsentState | undefined;
  readonly coBorrowerIds: readonly string[];
  readonly guarantorIds: readonly string[];
  /** How many entries the file holds: the position of the last one. */
  readonly entryCount: number;
  /** The entries that a correction already names: a second correction of one of them is refused. */
  readonly correctedEntryIds: readonly string[];
  /** The documents stored for the file, by their key in the object store: the file holds the reference, never the content. */
  readonly documentKeys: readonly string[];
  /** How many parties the last consultation of the register found listed: undefined until the register is consulted. */
  readonly listedPartyCount: number | undefined;
  /** The last assessment: the outcome it proposed and the person who ran it, undefined until the application is assessed. */
  readonly lastAssessment: { readonly proposedOutcome: ProposedOutcome; readonly assessorId: string } | undefined;
  /** The conclusion of the review of the last assessment, undefined until a person reviews it. */
  readonly refusalReviewConclusion: RefusalConclusion | undefined;
  /** The reviewer of the last refusal review: with the assessor, the person who prepared the file. */
  readonly refusalReviewerId: string;
  /** The decision taken on the application, undefined until the decider decides it. */
  readonly decision: DecisionRecord | undefined;
  /** The exception to the policy requested on the application, to the level above: undefined until a decider requests one. */
  readonly exception: ExceptionRequest | undefined;
}
