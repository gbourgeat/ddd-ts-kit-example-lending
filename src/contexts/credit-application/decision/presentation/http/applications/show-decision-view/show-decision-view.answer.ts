import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { AssessmentShownLine } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/assessment-shown.line';
import { DecisionShownLine } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/decision-shown.line';
import { RefusalReviewShownLine } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/refusal-review-shown.line';
import { RegisterShownLine } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/register-shown.line';
import { IsString } from 'class-validator';

/** What the decider saw when they decided: the decision, and the assessment, register answer and refusal review before it. */
export class ShowDecisionViewAnswer {
  @IsString()
  applicationId = '';

  @ValidateNested()
  @Type(() => DecisionShownLine)
  decision: DecisionShownLine = new DecisionShownLine();

  /** The last assessment before the decision. */
  @IsOptional()
  @ValidateNested()
  @Type(() => AssessmentShownLine)
  assessment: AssessmentShownLine | undefined = undefined;

  /** The register answer for the parties, as consulted before the decision. */
  @IsOptional()
  @ValidateNested()
  @Type(() => RegisterShownLine)
  register: RegisterShownLine | undefined = undefined;

  /** The review of the assessment's refusal before the decision. */
  @IsOptional()
  @ValidateNested()
  @Type(() => RefusalReviewShownLine)
  refusalReview: RefusalReviewShownLine | undefined = undefined;
}
