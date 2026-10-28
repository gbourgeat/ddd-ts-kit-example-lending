import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { requires } from '@ddd-ts-kit/auth';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { AssessApplicationCommand } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.command';
import { AssessApplicationHandler } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.handler';
import { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import { ConsultRepaymentIncidentRegisterHandler } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.handler';
import { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { ReadAccountInformationHandler } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.handler';
import { ReviewProposedRefusalCommand } from '@/contexts/credit-application/assessment/application/commands/review-proposed-refusal/review-proposed-refusal.command';
import { ReviewProposedRefusalHandler } from '@/contexts/credit-application/assessment/application/commands/review-proposed-refusal/review-proposed-refusal.handler';
import { InProcessCustomerIdentityGateway } from '@/contexts/credit-application/assessment/infrastructure/external/in-process-customer-identity.gateway';
import { InProcessScoringGateway } from '@/contexts/credit-application/assessment/infrastructure/external/in-process-scoring.gateway';
import { SimulatedAccountInformationProvider } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-account-information-provider.adapter';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-repayment-incident-register.adapter';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
// /ddd-ts-kit:imports

/** What the module assessment of the model registers; credit-application.module.ts composes it with the rest of the context. */
export const assessmentModule = {
  /** The command and query handlers of the module, with the repositories and readers they are given. */
  registerHandlers(platform: Platform, given: { readonly repository: CreditApplicationRepository }): void {
    // ddd-ts-kit:handlers
    registerAccountAndRegisterCommands(platform, given.repository);
    registerAssessmentCommands(platform, given.repository);
    // /ddd-ts-kit:handlers
  },

  /** What the module does when an event happens: its own events and those of the other contexts. */
  registerReactions(platform: Platform): void {
    // ddd-ts-kit:reactions
    // /ddd-ts-kit:reactions
  },

  /** The jobs of the module, scheduled and in the background. */
  registerJobs(platform: Platform): void {
    // ddd-ts-kit:jobs
    // /ddd-ts-kit:jobs
  },

  /** What each use case of the module requires, or that it is public. */
  useCases(): UseCaseDeclaration[] {
    return [
      // ddd-ts-kit:authorization
      requires(ReadAccountInformationCommand, creditApplicationPermissions['application.read-accounts'], {
        resource: (command) => ({ type: 'application', id: command.applicationId }),
      }),
      requires(ConsultRepaymentIncidentRegisterCommand, creditApplicationPermissions['application.consult-register'], {
        resource: () => ({ type: 'context', id: 'credit-application' }),
      }),
      requires(AssessApplicationCommand, creditApplicationPermissions['application.assess'], {
        resource: () => ({ type: 'context', id: 'credit-application' }),
      }),
      requires(ReviewProposedRefusalCommand, creditApplicationPermissions['application.review-refusal'], {
        resource: () => ({ type: 'context', id: 'credit-application' }),
      }),
      // /ddd-ts-kit:authorization
    ];
  },

  /** The routes the module answers, over the buses of the platform. */
  routes(platform: Platform): Route[] {
    return [
      // ddd-ts-kit:routes
      // /ddd-ts-kit:routes
    ];
  },
};

/** The commands that read the account information and consult the register of repayment incidents. */
function registerAccountAndRegisterCommands(platform: Platform, repository: CreditApplicationRepository): void {
  const accounts = platform.adapter(new SimulatedAccountInformationProvider(), {
    kind: 'external',
    context: 'credit-application',
    token: 'AccountInformationProvider',
  });

  const identities = platform.adapter(new InProcessCustomerIdentityGateway(platform.customerIdentity), {
    kind: 'gateway',
    context: 'credit-application',
    token: 'CustomerIdentityGateway',
  });

  const register = platform.adapter(new SimulatedRepaymentIncidentRegister(), {
    kind: 'external',
    context: 'credit-application',
    token: 'RepaymentIncidentRegister',
  });

  platform.commands.register(
    ReadAccountInformationCommand,
    new ReadAccountInformationHandler(repository, accounts, platform.files.storage, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    ConsultRepaymentIncidentRegisterCommand,
    new ConsultRepaymentIncidentRegisterHandler(repository, identities, register, platform.clock),
    { context: 'credit-application' },
  );
}

/** The commands that assess an application with the scoring and review the refusal it proposes. */
function registerAssessmentCommands(platform: Platform, repository: CreditApplicationRepository): void {
  const scoring = platform.adapter(new InProcessScoringGateway(platform.scoring), {
    kind: 'gateway',
    context: 'credit-application',
    token: 'ScoringGateway',
  });

  platform.commands.register(
    AssessApplicationCommand,
    new AssessApplicationHandler(repository, platform.files.storage, scoring, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    ReviewProposedRefusalCommand,
    new ReviewProposedRefusalHandler(repository, platform.clock),
    {
      context: 'credit-application',
    },
  );
}
