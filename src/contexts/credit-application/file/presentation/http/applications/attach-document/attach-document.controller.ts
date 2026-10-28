import { Controller, Inject, Param, Post } from '@nestjs/common';
import { type IncomingFile } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes, Upload } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AttachDocumentCommand } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';

/** Built by Nest with the bus it injects, served by the kit: the file is streamed and checked by the kit, never parsed by Nest. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class AttachDocumentController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/documents')
  @KitRoute({
    // A payslip, a tax notice or a statement: a PDF or an image, up to 10 MB. The limits are the first proposal, to confirm with the business.
    upload: { field: 'file', maxBytes: 10_485_760, mediaTypes: ['application/pdf', 'image/png', 'image/jpeg'] },
    response: { status: 201, description: 'Stored; the file is visible once the command has committed.' },
    errors: [CreditApplicationCodes.UnknownCreditApplication],
  })
  async attachDocument(
    @Param('id') applicationId: string,
    @Upload() file: IncomingFile,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new AttachDocumentCommand(actor, applicationId, file));
  }
}
