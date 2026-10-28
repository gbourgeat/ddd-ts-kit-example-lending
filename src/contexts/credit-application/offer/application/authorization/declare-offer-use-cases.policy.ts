import { requires, type UseCaseDeclaration } from '@ddd-ts-kit/auth';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';
import { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';
import { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';

/** What the use cases of the offer module require: keeping the rate grids and the legal maximum rates, and reading them. */
export function declareOfferUseCases(): UseCaseDeclaration[] {
  return [
    requires(KeepRateGridCommand, creditApplicationPermissions['rate-grid.keep'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(ReadRateGridQuery, creditApplicationPermissions['decision-data.read'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(KeepLegalMaximumRateCommand, creditApplicationPermissions['legal-maximum-rate.keep'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(ReadLegalMaximumRateQuery, creditApplicationPermissions['decision-data.read'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
  ];
}
