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
  // /ddd-ts-kit:events
]);
