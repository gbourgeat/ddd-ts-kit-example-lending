import type { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import type { CreditApplicationAccountConsentGiven } from '@/contexts/credit-application/file/domain/events/credit-application-account-consent-given.event';
import type { CreditApplicationCoBorrowerNamed } from '@/contexts/credit-application/file/domain/events/credit-application-co-borrower-named.event';
import type { CreditApplicationGuarantorNamed } from '@/contexts/credit-application/file/domain/events/credit-application-guarantor-named.event';
import type { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';
import type { CreditApplicationDocumentAttached } from '@/contexts/credit-application/file/domain/events/credit-application-document-attached.event';
import type { CreditApplicationRegisterConsulted } from '@/contexts/credit-application/file/domain/events/credit-application-register-consulted.event';
import type { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import type { CreditApplicationRequestFoundOutsideProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-found-outside-product-terms.event';
import type { CreditApplicationRequestCheckedWithUnknownProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-checked-with-unknown-product-terms.event';
import type { CreditApplicationRefusalReviewed } from '@/contexts/credit-application/file/domain/events/credit-application-refusal-reviewed.event';
import type { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import type { CreditApplicationBrought } from '@/contexts/credit-application/file/domain/events/credit-application-brought.event';
import type { CreditApplicationExceptionRequested } from '@/contexts/credit-application/file/domain/events/credit-application-exception-requested.event';
import type { CreditApplicationHumanReviewRequested } from '@/contexts/credit-application/file/domain/events/credit-application-human-review-requested.event';
import type { CreditApplicationExceptionDecided } from '@/contexts/credit-application/file/domain/events/credit-application-exception-decided.event';
import type { CreditApplicationContested } from '@/contexts/credit-application/file/domain/events/credit-application-contested.event';

/** Every fact the file of a credit application can hold. */
export type CreditApplicationEvent =
  | CreditApplicationSubmitted
  | CreditApplicationAccountConsentGiven
  | CreditApplicationCoBorrowerNamed
  | CreditApplicationGuarantorNamed
  | CreditApplicationEntryCorrected
  | CreditApplicationDocumentAttached
  | CreditApplicationRegisterConsulted
  | CreditApplicationAssessed
  | CreditApplicationRequestFoundOutsideProductTerms
  | CreditApplicationRequestCheckedWithUnknownProductTerms
  | CreditApplicationRefusalReviewed
  | CreditApplicationDecided
  | CreditApplicationBrought
  | CreditApplicationExceptionRequested
  | CreditApplicationHumanReviewRequested
  | CreditApplicationExceptionDecided
  | CreditApplicationContested;
