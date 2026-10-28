import { Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestHumanReviewCommand } from '@/contexts/credit-application/decision/application/commands/request-human-review/request-human-review.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { RequestHumanReviewParams } from '@/contexts/credit-application/decision/presentation/http/applications/request-human-review/request-human-review.params';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class RequestHumanReviewController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/human-review')
  @HttpCode(204)
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownCreditApplication, CreditApplicationCodes.HumanReviewNotAvailable],
  })
  async requestHumanReview(@Param() params: RequestHumanReviewParams, @CurrentActor() actor: Actor): Promise<void> {
    await this.commands.execute(new RequestHumanReviewCommand(actor, params.id));
  }
}
