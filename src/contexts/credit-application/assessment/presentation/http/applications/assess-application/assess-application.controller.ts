import { Controller, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AssessApplicationCommand } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { AssessApplicationParams } from '@/contexts/credit-application/assessment/presentation/http/applications/assess-application/assess-application.params';
import { AssessApplicationAnswer } from '@/contexts/credit-application/assessment/presentation/http/applications/assess-application/assess-application.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class AssessApplicationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/assessment')
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.MissingAccountInformation,
      CreditApplicationCodes.RegisterNotConsulted,
      CreditApplicationCodes.NoScoreAvailable,
    ],
  })
  async assessApplication(
    @Param() params: AssessApplicationParams,
    @CurrentActor() actor: Actor,
  ): Promise<AssessApplicationAnswer> {
    const { applicationId, assessment } = await this.commands.execute(new AssessApplicationCommand(actor, params.id));

    return {
      applicationId,
      modelVersion: assessment.modelVersion,
      debtToIncomePercent: assessment.debtToIncomePercent,
      repaymentIncidents: assessment.repaymentIncidents,
      residualIncomeCents: assessment.residualIncomeCents,
      score: assessment.score,
      band: assessment.band,
      factors: [...assessment.factors],
      proposedOutcome: assessment.proposedOutcome,
    };
  }
}
