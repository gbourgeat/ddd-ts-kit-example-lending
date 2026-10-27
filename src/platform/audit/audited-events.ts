import { createEventRegistry } from '@ddd-ts-kit/events';
// ddd-ts-kit:imports
import {
  accountDeactivatedV1,
  organisationOpenedV1,
  memberJoinedV1,
  memberRoleChangedV1,
  memberRemovedV1,
  delegationGrantedV1,
  delegationRevokedV1,
} from '@/contexts/identity/published-language';
import { creditApplicationSubmittedV1 } from '@/contexts/credit-application/published-language';
import { conflictOfInterestDeclaredV1, staffMemberAppointedV1 } from '@/contexts/branch-network/published-language';
import { customerIdentifiedV1, customerAdvisorAssignedV1 } from '@/contexts/customer-due-diligence/published-language';
import {
  productDefinedV1,
  legalMaximumRatePublishedV1,
  rateGridPublishedV1,
  delegationTablePublishedV1,
  residualIncomeMinimumPublishedV1,
} from '@/contexts/credit-policy/published-language';
// /ddd-ts-kit:imports

/** Every integration event the contexts declare: the audit trail records that each one occurred. `generate integration-event` adds to it. */
export const auditedEvents = createEventRegistry([
  // ddd-ts-kit:events
  accountDeactivatedV1,
  organisationOpenedV1,
  memberJoinedV1,
  memberRoleChangedV1,
  memberRemovedV1,
  delegationGrantedV1,
  delegationRevokedV1,
  creditApplicationSubmittedV1,
  conflictOfInterestDeclaredV1,
  staffMemberAppointedV1,
  customerIdentifiedV1,
  productDefinedV1,
  legalMaximumRatePublishedV1,
  rateGridPublishedV1,
  delegationTablePublishedV1,
  residualIncomeMinimumPublishedV1,
  customerAdvisorAssignedV1,
  // /ddd-ts-kit:events
]);
