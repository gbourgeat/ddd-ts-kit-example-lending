import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ShowDecisionViewQuery } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.query';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { ShowDecisionViewParams } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/show-decision-view.params';
import { ShowDecisionViewAnswer } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/show-decision-view.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ShowDecisionViewController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/decision-view')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownCreditApplication, CreditApplicationCodes.NotDecided],
  })
  async showDecisionView(
    @Param() params: ShowDecisionViewParams,
    @CurrentActor() actor: Actor,
  ): Promise<ShowDecisionViewAnswer> {
    const view = await this.queries.execute(new ShowDecisionViewQuery(actor, params.id));

    return toAnswer(view);
  }
}

/** The view as the public fields: the instants as ISO 8601 text, the parts the file holds none of left out. */
function toAnswer(view: ShowDecisionViewResult): ShowDecisionViewAnswer {
  const { assessment, register, refusalReview } = view;

  return {
    applicationId: view.applicationId,
    decision: { ...view.decision, decidedAt: view.decision.decidedAt.toISOString() },
    assessment:
      assessment === undefined
        ? undefined
        : { ...assessment, factors: [...assessment.factors], assessedAt: assessment.assessedAt.toISOString() },
    register: register === undefined ? undefined : { parties: register.parties.map((party) => ({ ...party })) },
    refusalReview:
      refusalReview === undefined
        ? undefined
        : { ...refusalReview, reviewedAt: refusalReview.reviewedAt.toISOString() },
  };
}
