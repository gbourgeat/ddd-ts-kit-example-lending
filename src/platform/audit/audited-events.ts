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
import {
  creditApplicationSubmittedV1,
  creditApplicationSubmittedV2,
  creditApplicationDecidedV1,
} from '@/contexts/credit-application/published-language';
import {
  conflictOfInterestDeclaredV1,
  staffMemberAppointedV1,
  staffMemberAppointedV2,
} from '@/contexts/branch-network/published-language';
import { customerIdentifiedV1, customerAdvisorAssignedV1 } from '@/contexts/customer-due-diligence/published-language';
import {
  productDefinedV1,
  legalMaximumRatePublishedV1,
  rateGridPublishedV1,
  delegationTablePublishedV1,
  residualIncomeMinimumPublishedV1,
  legalMaximumRatePublishedV2,
  delegationTablePublishedV2,
  rateGridPublishedV2,
  productDefinedV2,
} from '@/contexts/credit-policy/published-language';
import { brokerRegisteredV1, brokerRegistrationLapsedV1 } from '@/contexts/brokerage/published-language';
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
  brokerRegisteredV1,
  brokerRegistrationLapsedV1,
  legalMaximumRatePublishedV2,
  delegationTablePublishedV2,
  staffMemberAppointedV2,
  rateGridPublishedV2,
  creditApplicationSubmittedV2,
  productDefinedV2,
  creditApplicationDecidedV1,
  // /ddd-ts-kit:events
]);
