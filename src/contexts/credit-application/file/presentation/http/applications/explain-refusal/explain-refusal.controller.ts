import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ExplainRefusalQuery } from '@/contexts/credit-application/file/application/queries/explain-refusal/explain-refusal.query';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { ExplainRefusalParams } from '@/contexts/credit-application/file/presentation/http/applications/explain-refusal/explain-refusal.params';
import { ExplainRefusalAnswer } from '@/contexts/credit-application/file/presentation/http/applications/explain-refusal/explain-refusal.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ExplainRefusalController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/access-explanation')
  @KitRoute({
    errors: [CreditApplicationCodes.ApplicationNotVisible],
  })
  async explainRefusal(
    @Param() params: ExplainRefusalParams,
    @CurrentActor() actor: Actor,
  ): Promise<ExplainRefusalAnswer> {
    const answer = await this.queries.execute(new ExplainRefusalQuery(actor, params.id));

    return { outcome: answer.outcome };
  }
}
