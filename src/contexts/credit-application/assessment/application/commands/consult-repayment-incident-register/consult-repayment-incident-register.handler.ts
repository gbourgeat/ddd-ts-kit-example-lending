import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { CustomerIdentityGateway } from '@/contexts/credit-application/assessment/application/ports/customer-identity-gateway.port';
import type { RepaymentIncidentRegister } from '@/contexts/credit-application/assessment/application/ports/repayment-incident-register.port';
import { UnidentifiedParty } from '@/contexts/credit-application/assessment/domain/errors/unidentified-party.error';
import type { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import type { ConsultedParty } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consulted-party.result';
import type { RepaymentIncidentConsultation } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/repayment-incident-consultation.result';

/** Asks the register about the applicant and each co-borrower, reading their names and birth dates at the instant of the consult. */
export class ConsultRepaymentIncidentRegisterHandler
  implements CommandHandler<ConsultRepaymentIncidentRegisterCommand>
{
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly customerIdentityGateway: CustomerIdentityGateway,
    private readonly repaymentIncidentRegister: RepaymentIncidentRegister,
    private readonly clock: Clock,
  ) {}

  async execute(command: ConsultRepaymentIncidentRegisterCommand): Promise<RepaymentIncidentConsultation> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const partyIds = [creditApplication.applicantId, ...creditApplication.coBorrowerIds];
    const parties: ConsultedParty[] = [];

    for (const customerId of partyIds) {
      parties.push(await this.consultParty(customerId));
    }

    creditApplication.recordRegisterConsultation(
      parties.map(({ customerId, listed }) => ({ customerId, listed })),
      this.clock.now(),
    );

    await this.creditApplicationRepository.save(creditApplication);

    return { applicationId: command.applicationId, parties };
  }

  private async consultParty(customerId: string): Promise<ConsultedParty> {
    const identity = await this.customerIdentityGateway.identityOf(customerId);

    if (identity === undefined) {
      throw UnidentifiedParty.forCustomer(customerId);
    }

    const listed = await this.repaymentIncidentRegister.isListed(identity.name, new Date(identity.birthDate));

    return { customerId, name: identity.name, birthDate: identity.birthDate, listed };
  }
}
