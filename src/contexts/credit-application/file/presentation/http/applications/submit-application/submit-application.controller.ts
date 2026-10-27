import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CurrentActor, KitRoutes, KitRoute } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { SubmitApplicationCommand } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { SubmitApplicationBody } from '@/contexts/credit-application/file/presentation/http/applications/submit-application/submit-application.body';
import { ApplicationSubmittedBody } from '@/contexts/credit-application/file/presentation/http/applications/submit-application/application-submitted.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class SubmitApplicationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    errors: [CreditApplicationCodes.InvalidAmount, CreditApplicationCodes.InvalidDuration],
    response: {
      status: 201,
      body: ApplicationSubmittedBody,
      headers: { Location: 'The URL of the application.' },
    },
  })
  async submitApplication(
    @Body() body: SubmitApplicationBody,
    @CurrentActor() actor: Actor,
  ): Promise<{ body: ApplicationSubmittedBody; headers: { Location: string } }> {
    const id = await this.commands.execute(new SubmitApplicationCommand(actor, body.amount.cents, body.durationMonths));

    return {
      body: { id, amount: { cents: body.amount.cents, currency: 'EUR' } },
      headers: { Location: `/applications/${id}` },
    };
  }
}
