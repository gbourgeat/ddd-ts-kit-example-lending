import { Controller, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { ConsultRepaymentIncidentRegisterParams } from '@/contexts/credit-application/assessment/presentation/http/applications/consult-repayment-incident-register/consult-repayment-incident-register.params';
import { ConsultRepaymentIncidentRegisterAnswer } from '@/contexts/credit-application/assessment/presentation/http/applications/consult-repayment-incident-register/consult-repayment-incident-register.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ConsultRepaymentIncidentRegisterController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/register-consultations')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownCreditApplication, CreditApplicationCodes.UnidentifiedParty],
  })
  async consultRepaymentIncidentRegister(
    @Param() params: ConsultRepaymentIncidentRegisterParams,
    @CurrentActor() actor: Actor,
  ): Promise<ConsultRepaymentIncidentRegisterAnswer> {
    const consultation = await this.commands.execute(new ConsultRepaymentIncidentRegisterCommand(actor, params.id));

    return { applicationId: consultation.applicationId, parties: [...consultation.parties] };
  }
}
