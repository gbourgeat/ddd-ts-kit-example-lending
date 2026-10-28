import { publicUseCase, requires, type UseCaseDeclaration } from '@ddd-ts-kit/auth';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { BringApplicationCommand } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.command';
import { CheckRequestAgainstProductCommand } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.command';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import { ReadProductTermsFindingsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.query';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';

/** What the use cases of the file module on the broker registrations and the product terms require: keeping them, reading them, and the check of a request against its product. */
export function declareFileReferenceUseCases(): UseCaseDeclaration[] {
  return [
    requires(KeepBrokerRegistrationCommand, creditApplicationPermissions['broker-registration.keep'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(ReadBrokerRegistrationQuery, creditApplicationPermissions['application.decide'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(KeepProductTermsCommand, creditApplicationPermissions['product-terms.keep'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(ReadProductTermsQuery, creditApplicationPermissions['application.decide'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    publicUseCase(CheckRequestAgainstProductCommand),
    requires(ReadProductTermsFindingsQuery, creditApplicationPermissions['application.read'], {
      resource: (query) => ({ type: 'application', id: query.applicationId }),
    }),
    requires(BringApplicationCommand, creditApplicationPermissions['application.bring'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
  ];
}
