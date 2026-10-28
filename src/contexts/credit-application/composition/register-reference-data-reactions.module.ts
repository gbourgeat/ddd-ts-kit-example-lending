import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { staffMemberAppointedV2 as deciderLevelDefinition } from '@/contexts/branch-network/published-language';
import {
  delegationTablePublishedV2 as delegationTableDefinition,
  legalMaximumRatePublishedV2 as legalMaximumRateDefinition,
  rateGridPublishedV2 as rateGridDefinition,
} from '@/contexts/credit-policy/published-language';
import { KeepDeciderLevelIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-decider-level.integration-handler';
import { KeepDelegationTableIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-delegation-table.integration-handler';
import { KeepLegalMaximumRateIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-legal-maximum-rate.integration-handler';
import { KeepRateGridIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-rate-grid.integration-handler';
import type { Platform } from '@/platform/composition/platform';

/** The integration handlers that keep the reference data of credit-policy and the level of each decider. */
export function registerReferenceDataReactions(platform: Platform): void {
  const keepDelegationTableIntegrationHandler = new KeepDelegationTableIntegrationHandler(platform.commands);
  const keepDeciderLevelIntegrationHandler = new KeepDeciderLevelIntegrationHandler(platform.commands);
  const keepRateGridIntegrationHandler = new KeepRateGridIntegrationHandler(platform.commands);
  const keepLegalMaximumRateIntegrationHandler = new KeepLegalMaximumRateIntegrationHandler(platform.commands);
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      delegationTableDefinition,
      { consumer: 'credit-application.keep-delegation-table', processed, unitOfWork, scope },
      (event) => keepDelegationTableIntegrationHandler.handle(event),
    ),
    consume(
      deciderLevelDefinition,
      { consumer: 'credit-application.keep-decider-level', processed, unitOfWork, scope },
      (event) => keepDeciderLevelIntegrationHandler.handle(event),
    ),
    consume(
      rateGridDefinition,
      { consumer: 'credit-application.keep-rate-grid', processed, unitOfWork, scope },
      (event) => keepRateGridIntegrationHandler.handle(event),
    ),
    consume(
      legalMaximumRateDefinition,
      { consumer: 'credit-application.keep-legal-maximum-rate', processed, unitOfWork, scope },
      (event) => keepLegalMaximumRateIntegrationHandler.handle(event),
    ),
  ]);
}
