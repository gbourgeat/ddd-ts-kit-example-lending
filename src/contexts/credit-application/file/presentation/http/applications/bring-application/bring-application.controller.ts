import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { BringApplicationCommand } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { BringApplicationBody } from '@/contexts/credit-application/file/presentation/http/applications/bring-application/bring-application.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class BringApplicationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post('bring')
  @KitRoute({
    errors: [
      CreditApplicationCodes.BrokerRegistrationLapsed,
      CreditApplicationCodes.InvalidAmount,
      CreditApplicationCodes.InvalidDuration,
    ],
  })
  async bringApplication(@Body() body: BringApplicationBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(
      new BringApplicationCommand(actor, {
        customerId: body.customerId,
        productId: body.productId,
        amountInCents: body.amount.cents,
        durationMonths: body.durationMonths,
      }),
    );

    return { id };
  }
}
