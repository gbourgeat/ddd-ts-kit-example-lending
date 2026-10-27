import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { CorrectEntryCommand } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { CorrectEntryParams } from '@/contexts/credit-application/file/presentation/http/applications/correct-entry/correct-entry.params';
import { CorrectEntryBody } from '@/contexts/credit-application/file/presentation/http/applications/correct-entry/correct-entry.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class CorrectEntryController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/corrections')
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.UnknownEntry,
      CreditApplicationCodes.CorrectionAlreadyRecorded,
      CreditApplicationCodes.InvalidCorrectionReason,
    ],
  })
  async correctEntry(
    @Param() params: CorrectEntryParams,
    @Body() body: CorrectEntryBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new CorrectEntryCommand(actor, params.id, body.entryId, body.reason));

    return { id };
  }
}
