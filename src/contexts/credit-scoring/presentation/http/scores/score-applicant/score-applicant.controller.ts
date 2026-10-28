import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditScoringCodes } from '@/contexts/credit-scoring/credit-scoring.codes';
import { ScoreApplicantQuery } from '@/contexts/credit-scoring/application/queries/score-applicant/score-applicant.query';
import { ScoresRoutes } from '@/contexts/credit-scoring/presentation/http/scores.routes';
import { ScoreApplicantBody } from '@/contexts/credit-scoring/presentation/http/scores/score-applicant/score-applicant.body';
import { ScoreApplicantAnswer } from '@/contexts/credit-scoring/presentation/http/scores/score-applicant/score-applicant.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ScoresRoutes })
export class ScoreApplicantController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Post()
  @HttpCode(200)
  @KitRoute({
    errors: [CreditScoringCodes.UnknownModelVersion],
  })
  async scoreApplicant(@Body() body: ScoreApplicantBody, @CurrentActor() actor: Actor): Promise<ScoreApplicantAnswer> {
    const answer = await this.queries.execute(
      new ScoreApplicantQuery(
        actor,
        {
          debtToIncomePercent: body.debtToIncomePercent,
          repaymentIncidents: body.repaymentIncidents,
          residualIncomeCents: body.residualIncomeCents,
        },
        body.modelVersion,
      ),
    );

    return {
      score: answer.score,
      band: answer.band,
      modelVersion: answer.modelVersion,
      inputs: answer.inputs,
      factors: [...answer.factors],
    };
  }
}
