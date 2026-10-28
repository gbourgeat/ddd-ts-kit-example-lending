import { IsString } from 'class-validator';

/** The review of the refusal the assessment proposed, as the decider saw it: who reviewed it, and what they concluded. */
export class RefusalReviewShownLine {
  @IsString()
  reviewerId = '';

  @IsString()
  conclusion = '';

  @IsString()
  reason = '';

  /** The instant of the review, ISO 8601. */
  @IsString()
  reviewedAt = '';
}
