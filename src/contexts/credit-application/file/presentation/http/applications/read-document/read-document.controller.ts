import { Controller, Get, Inject, Param } from '@nestjs/common';
import type { Readable } from 'node:stream';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadDocumentQuery } from '@/contexts/credit-application/file/application/queries/read-document/read-document.query';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { documentContent } from '@/contexts/credit-application/presentation/http/shared/document-content.schema';

/** Built by Nest with the bus it injects, served by the kit: the answer is the stored bytes of the document, with its media type. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ReadDocumentController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/documents/:documentKey')
  @KitRoute({
    summary: 'Read a document of an application back',
    response: {
      status: 200,
      description: 'The stored content of the document, with its media type.',
      body: documentContent(),
      headers: {
        'content-type': 'The media type the document was attached with.',
        'content-length': 'The size of the document in bytes.',
      },
    },
    errors: [CreditApplicationCodes.UnknownCreditApplication, CreditApplicationCodes.UnknownEntry],
  })
  async readDocument(
    @Param('id') applicationId: string,
    @Param('documentKey') documentKey: string,
    @CurrentActor() actor: Actor,
  ): Promise<{ body: Readable; headers: { 'content-type': string; 'content-length': string } }> {
    const { content } = await this.queries.execute(new ReadDocumentQuery(actor, applicationId, documentKey));

    return {
      body: content.stream,
      headers: { 'content-type': content.metadata.mediaType, 'content-length': String(content.metadata.size) },
    };
  }
}
