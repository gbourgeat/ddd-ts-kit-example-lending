import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReviewProposedRefusalCommand } from '@/contexts/credit-application/assessment/application/commands/review-proposed-refusal/review-proposed-refusal.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReviewProposedRefusalParams } from '@/contexts/credit-application/assessment/presentation/http/applications/review-proposed-refusal/review-proposed-refusal.params';
import { ReviewProposedRefusalBody } from '@/contexts/credit-application/assessment/presentation/http/applications/review-proposed-refusal/review-proposed-refusal.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ReviewProposedRefusalController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/refusal-review')
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.InvalidReviewReason,
      CreditApplicationCodes.NoRefusalToReview,
      CreditApplicationCodes.RefusalAlreadyReviewed,
      CreditApplicationCodes.ReviewerCannotBeAssessor,
    ],
  })
  async reviewProposedRefusal(
    @Param() params: ReviewProposedRefusalParams,
    @Body() body: ReviewProposedRefusalBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new ReviewProposedRefusalCommand(actor, params.id, body));

    return { id };
  }
}
