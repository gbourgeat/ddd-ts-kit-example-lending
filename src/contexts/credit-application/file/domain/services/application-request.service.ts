import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { InvalidAmount } from '@/contexts/credit-application/file/domain/errors/invalid-amount.error';
import { InvalidDuration } from '@/contexts/credit-application/file/domain/errors/invalid-duration.error';
import type { ApplicationRequest } from '@/contexts/credit-application/file/domain/values/application-request';

/** The check of what an applicant asks for at its submission: the amount is positive and the duration a whole number of months. */
export class ApplicationRequestService {
  submittedEventOf(id: string, applicantId: string, request: ApplicationRequest): CreditApplicationSubmitted {
    if (request.amount.cents <= 0) {
      throw InvalidAmount.forCents(request.amount.cents);
    }

    if (!Number.isSafeInteger(request.durationMonths) || request.durationMonths <= 0) {
      throw InvalidDuration.forMonths(request.durationMonths);
    }

    return new CreditApplicationSubmitted(
      id,
      applicantId,
      request.amount,
      request.durationMonths,
      request.registeredAt,
      request.branchId,
      request.productId ?? '',
    );
  }
}
