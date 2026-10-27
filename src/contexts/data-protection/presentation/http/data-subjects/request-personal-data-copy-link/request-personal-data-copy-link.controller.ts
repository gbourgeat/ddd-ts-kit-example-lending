import { Controller, Get, HttpCode, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestPersonalDataCopyLinkCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy-link/request-personal-data-copy-link.command';
import { DataSubjectsRoutes } from '@/contexts/data-protection/presentation/http/data-subjects.routes';
import { RequestPersonalDataCopyLinkParams } from '@/contexts/data-protection/presentation/http/data-subjects/request-personal-data-copy-link/request-personal-data-copy-link.params';
import { PersonalDataCopyLink } from '@/contexts/data-protection/presentation/http/data-subjects/request-personal-data-copy/personal-data-copy-link.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: DataSubjectsRoutes })
export class RequestPersonalDataCopyLinkController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Get(':customerId/copies/:copyId/link')
  @HttpCode(200)
  @KitRoute({
    // The copy is unknown once its seven days are over, and then deleted: the caller is told so by its code.
    errors: ['FILE_NOT_FOUND'],
  })
  async requestPersonalDataCopyLink(
    @Param() params: RequestPersonalDataCopyLinkParams,
    @CurrentActor() actor: Actor,
  ): Promise<PersonalDataCopyLink> {
    const link = await this.commands.execute(
      new RequestPersonalDataCopyLinkCommand(actor, params.customerId, params.copyId),
    );

    return { copyId: params.copyId, url: link.url, expiresAt: link.expiresAt.toISOString() };
  }
}
