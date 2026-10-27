import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';
import { PublishLegalMaximumRateCommand } from '@/contexts/credit-policy/application/commands/publish-legal-maximum-rate/publish-legal-maximum-rate.command';
import { LegalMaximumRatesRoutes } from '@/contexts/credit-policy/presentation/http/legal-maximum-rates.routes';
import { PublishLegalMaximumRateBody } from '@/contexts/credit-policy/presentation/http/legal-maximum-rates/publish-legal-maximum-rate/publish-legal-maximum-rate.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LegalMaximumRatesRoutes })
export class PublishLegalMaximumRateController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    errors: [CreditPolicyCodes.InvalidLegalMaximumRate],
  })
  async publishLegalMaximumRate(
    @Body() body: PublishLegalMaximumRateBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(
      new PublishLegalMaximumRateCommand(actor, {
        category: body.category,
        rateBasisPoints: body.rateBasisPoints,
        effectiveFrom: new Date(body.effectiveFrom),
      }),
    );

    return { id };
  }
}
