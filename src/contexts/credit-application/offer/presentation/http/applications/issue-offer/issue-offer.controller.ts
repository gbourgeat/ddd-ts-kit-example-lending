import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { IssueOfferCommand } from '@/contexts/credit-application/offer/application/commands/issue-offer/issue-offer.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { IssueOfferParams } from '@/contexts/credit-application/offer/presentation/http/applications/issue-offer/issue-offer.params';
import { IssueOfferBody } from '@/contexts/credit-application/offer/presentation/http/applications/issue-offer/issue-offer.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class IssueOfferController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/offer')
  @HttpCode(204)
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownOffer,
      CreditApplicationCodes.UnknownLegalMaximumRate,
      CreditApplicationCodes.OfferAboveLegalMaximum,
    ],
  })
  async issueOffer(
    @Param() params: IssueOfferParams,
    @Body() body: IssueOfferBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new IssueOfferCommand(actor, params.id));
  }
}
