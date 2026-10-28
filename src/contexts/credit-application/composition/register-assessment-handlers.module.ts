import { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { ReadAccountInformationHandler } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.handler';
import { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import { ConsultRepaymentIncidentRegisterHandler } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.handler';
import { AssessApplicationCommand } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.command';
import { AssessApplicationHandler } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.handler';
import type { ScoringGateway } from '@/contexts/credit-application/assessment/application/ports/scoring-gateway.port';
import type { AccountInformationProvider } from '@/contexts/credit-application/assessment/application/ports/account-information-provider.port';
import type { CustomerIdentityGateway } from '@/contexts/credit-application/assessment/application/ports/customer-identity-gateway.port';
import type { RepaymentIncidentRegister } from '@/contexts/credit-application/assessment/application/ports/repayment-incident-register.port';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { Platform } from '@/platform/composition/platform';

/** What the commands of the assessment module are given besides the platform: the application file and the outside systems. */
export interface AssessmentDependencies {
  readonly repository: CreditApplicationRepository;
  readonly accounts: AccountInformationProvider;
  readonly identities: CustomerIdentityGateway;
  readonly register: RepaymentIncidentRegister;
  readonly scoring: ScoringGateway;
}

/** The commands of the assessment module: the account information and the register of repayment incidents. */
export function registerAssessmentHandlers(platform: Platform, given: AssessmentDependencies): void {
  platform.commands.register(
    ReadAccountInformationCommand,
    new ReadAccountInformationHandler(given.repository, given.accounts, platform.files.storage, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    ConsultRepaymentIncidentRegisterCommand,
    new ConsultRepaymentIncidentRegisterHandler(given.repository, given.identities, given.register, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    AssessApplicationCommand,
    new AssessApplicationHandler(given.repository, platform.files.storage, given.scoring, platform.clock),
    { context: 'credit-application' },
  );
}
